import Foundation
import Security

struct APIError: LocalizedError {
    let message: String
    var errorDescription: String? { message }
}

/// Sign-in on jaybulb-api and the shop's shared stock. The device keeps a full local copy;
/// sync pushes what changed here, sends stock counts as deltas, then pulls what changed elsewhere.
@MainActor @Observable
final class Account {
    struct Shop: Decodable {
        let name: String
        let code: String
        let role: String
        let members: [Member]
    }
    struct Member: Decodable, Identifiable {
        let id: String
        let email: String?
        let role: String
        let me: Bool
    }
    private struct Pending: Codable { let id: UUID; let delta: Int }

    // ponytail: `-apiBase http://127.0.0.1:8799` on launch points at a local Worker for QA; nothing persists it
    static let api = UserDefaults.standard.string(forKey: "apiBase").flatMap(URL.init(string:)) ?? URL(string: "https://api.jaybulb.com")!
    private(set) var email: String? = Keychain.get("email")
    private(set) var shop: Shop?
    private(set) var syncError: String?
    var signedIn: Bool { refreshToken != nil }
    var isOwner: Bool { shop?.role != "crew" }

    private let store: Store
    private var access: String?
    private var accessExpiry = Date.distantPast
    private var refreshToken = Keychain.get("refresh")
    private var refreshing: Task<String, Error>?
    @ObservationIgnored private var running = false
    @ObservationIgnored private var again = false

    // Sync state survives a relaunch: the last seen sequence, what each item looked like then, unsent counts.
    private var since: Int { get { UserDefaults.standard.integer(forKey: "sync.since") } set { UserDefaults.standard.set(newValue, forKey: "sync.since") } }
    private var synced: [String: Data] = UserDefaults.standard.dictionary(forKey: "sync.synced") as? [String: Data] ?? [:]
    private var pending: [Pending] = (UserDefaults.standard.data(forKey: "sync.pending")).flatMap { try? JSONDecoder().decode([Pending].self, from: $0) } ?? []

    init(store: Store) {
        self.store = store
        store.onChange = { [weak self] in self?.schedule() }
        store.onAdjust = { [weak self] id, delta in
            guard let self, self.shop != nil else { return }
            self.pending.append(Pending(id: id, delta: delta))
            self.savePending()
        }
    }

    // MARK: Auth

    func signIn(email: String, password: String) async throws {
        let session = try await post("/auth/token?grant_type=password", ["email": email, "password": password], auth: false)
        adopt(session)
        try await refreshShop()
    }

    func signUp(email: String, password: String) async throws {
        _ = try await post("/auth/signup", ["email": email, "password": password, "redirect_to": "https://bcgd.jaybulb.com/"], auth: false)
    }

    func signOut() {
        Task { _ = try? await post("/auth/logout", [:]) }
        forget()
    }

    func deleteAccount() async throws {
        _ = try await request("DELETE", "/auth/user", nil)
        forget()
    }

    private func forget() {
        Keychain.set("refresh", nil); Keychain.set("email", nil)
        refreshToken = nil; access = nil; email = nil; shop = nil
        resetSync()
    }

    private func adopt(_ session: Any) {
        guard let s = session as? [String: Any], let a = s["access_token"] as? String, let r = s["refresh_token"] as? String else { return }
        access = a
        accessExpiry = Date().addingTimeInterval(TimeInterval(s["expires_in"] as? Int ?? 3600) - 60)
        refreshToken = r
        Keychain.set("refresh", r)
        if let e = (s["user"] as? [String: Any])?["email"] as? String { email = e; Keychain.set("email", e) }
    }

    /// One refresh at a time: the server rotates refresh tokens, so two at once would sign us out.
    private func token() async throws -> String {
        if let access, accessExpiry > Date() { return access }
        if let refreshing { return try await refreshing.value }
        guard let refreshToken else { throw APIError(message: "Sign in first") }
        let task = Task { () throws -> String in
            let session = try await post("/auth/token?grant_type=refresh_token", ["refresh_token": refreshToken], auth: false)
            adopt(session)
            return access ?? ""
        }
        refreshing = task
        defer { refreshing = nil }
        do { return try await task.value } catch let e as APIError where e.message == "Invalid refresh token" { forget(); throw e }
    }

    // MARK: Shop

    func refreshShop() async throws {
        let s = try await post("/rpc/doorstock_my_shop", [:])
        shop = try decodeShop(s)
        if shop != nil { await sync() }
    }

    /// The owner's stock and jobs become the shop's.
    func createShop(name: String) async throws {
        let items = store.parts.map { item("part", $0.id, $0) } + store.jobs.map { item("job", $0.id, $0) }
        shop = try decodeShop(try await post("/rpc/doorstock_create_shop", ["name": name, "items": items]))
        resetSync()
        await sync()
    }

    /// Crew take the shop's stock and jobs in place of this device's.
    func join(code: String) async throws {
        shop = try decodeShop(try await post("/rpc/doorstock_join", ["code": code]))
        resetSync()
        store.replace(parts: [], jobs: [])
        await sync()
    }

    func leave() async throws {
        _ = try await post("/rpc/doorstock_leave", [:])
        shop = nil
        resetSync()
    }

    func remove(_ member: Member) async throws {
        shop = try decodeShop(try await post("/rpc/doorstock_remove_member", ["user_id": member.id]))
    }

    private func decodeShop(_ any: Any) throws -> Shop? {
        guard any is [String: Any] else { return nil }
        return try JSONDecoder().decode(Shop.self, from: JSONSerialization.data(withJSONObject: any))
    }

    // MARK: Sync

    private func schedule() {
        guard shop != nil else { return }
        Task { try? await Task.sleep(for: .seconds(1)); await sync() }
    }

    func sync() async {
        guard shop != nil else { return }
        if running { again = true; return }
        running = true
        defer { running = false }
        repeat {
            again = false
            do {
                try await sendCounts()
                try await pushChanges()
                try await pull()
                syncError = nil
            } catch {
                syncError = error.localizedDescription
                if (error as? APIError)?.message == "join a shop first" { shop = nil; resetSync() }
                return
            }
        } while again
    }

    private func sendCounts() async throws {
        while let next = pending.first {
            do { _ = try await post("/rpc/doorstock_adjust", ["id": next.id.uuidString, "delta": next.delta]) }
            catch let e as APIError where e.message == "no such part" { /* deleted elsewhere; drop the count */ _ = e }
            pending.removeFirst()
            savePending()
        }
    }

    private func pushChanges() async throws {
        var items: [[String: Any]] = []
        var seen = Set<String>()
        for p in store.parts { let k = "part:\(p.id)"; seen.insert(k); if synced[k] != Self.encode(p) { items.append(item("part", p.id, p)) } }
        for j in store.jobs { let k = "job:\(j.id)"; seen.insert(k); if synced[k] != Self.encode(j) { items.append(item("job", j.id, j)) } }
        if isOwner {
            for k in synced.keys where !seen.contains(k) {
                let bits = k.split(separator: ":", maxSplits: 1)
                items.append(["kind": String(bits[0]), "id": String(bits[1]), "deleted": true])
            }
        }
        for chunk in stride(from: 0, to: items.count, by: 400) {
            _ = try await post("/rpc/doorstock_push", ["items": Array(items[chunk..<min(chunk + 400, items.count)])])
        }
    }

    private func pull() async throws {
        let r = try await post("/rpc/doorstock_pull", ["since": since]) as? [String: Any] ?? [:]
        let rows = r["items"] as? [[String: Any]] ?? []
        guard !rows.isEmpty else { return }
        var parts = store.parts, jobs = store.jobs
        for row in rows {
            guard let kind = row["kind"] as? String, let id = row["id"] as? String, let uuid = UUID(uuidString: id) else { continue }
            let key = "\(kind):\(uuid)"
            since = max(since, row["seq"] as? Int ?? 0)
            let data = (row["data"]).flatMap { try? JSONSerialization.data(withJSONObject: $0) }
            let live = row["deleted"] as? Bool != true
            if kind == "part" {
                let p = live ? data.flatMap { try? JSONDecoder().decode(Part.self, from: $0) } : nil
                upsert(&parts, uuid, p, append: true)
                synced[key] = p.map(Self.encode)
            } else {
                let j = live ? data.flatMap { try? JSONDecoder().decode(Job.self, from: $0) } : nil
                upsert(&jobs, uuid, j, append: false)
                synced[key] = j.map(Self.encode)
            }
        }
        UserDefaults.standard.set(synced, forKey: "sync.synced")
        store.replace(parts: parts, jobs: jobs)   // synced is already current, so this push finds nothing new
    }

    /// Replace in place so a synced row keeps its spot; new parts go last, new jobs first.
    private func upsert<T: Identifiable>(_ list: inout [T], _ id: UUID, _ value: T?, append: Bool) where T.ID == UUID {
        let i = list.firstIndex { $0.id == id }
        switch (i, value) {
        case let (i?, v?): list[i] = v
        case let (i?, nil): list.remove(at: i)
        case let (nil, v?): if append { list.append(v) } else { list.insert(v, at: 0) }
        case (nil, nil): break
        }
    }

    private func resetSync() {
        since = 0; synced = [:]; pending = []
        UserDefaults.standard.set(synced, forKey: "sync.synced"); savePending()
    }

    private func savePending() { UserDefaults.standard.set(try? JSONEncoder().encode(pending), forKey: "sync.pending") }

    private func item<T: Encodable>(_ kind: String, _ id: UUID, _ value: T) -> [String: Any] {
        ["kind": kind, "id": id.uuidString, "data": (try? JSONSerialization.jsonObject(with: Self.encode(value))) ?? [:]]
    }

    private static func encode<T: Encodable>(_ value: T) -> Data {
        let e = JSONEncoder(); e.outputFormatting = .sortedKeys
        return (try? e.encode(value)) ?? Data()
    }

    // MARK: HTTP

    private func post(_ path: String, _ body: [String: Any], auth: Bool = true) async throws -> Any {
        try await request("POST", path, body, auth: auth)
    }

    private func request(_ method: String, _ path: String, _ body: [String: Any]?, auth: Bool = true) async throws -> Any {
        var req = URLRequest(url: URL(string: path, relativeTo: Self.api)!)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if auth { req.setValue("Bearer \(try await token())", forHTTPHeaderField: "Authorization") }
        if let body { req.httpBody = try JSONSerialization.data(withJSONObject: body) }
        let (data, response) = try await URLSession.shared.data(for: req)
        let json = (try? JSONSerialization.jsonObject(with: data, options: .fragmentsAllowed)) ?? NSNull()
        if let code = (response as? HTTPURLResponse)?.statusCode, code >= 400 {
            throw APIError(message: (json as? [String: Any])?["error"] as? String ?? "Something went wrong (\(code))")
        }
        return json
    }
}

/// Generic-password items for this app only.
enum Keychain {
    static func get(_ key: String) -> String? {
        var out: AnyObject?
        let q: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: "doorstock", kSecAttrAccount as String: key, kSecReturnData as String: true]
        guard SecItemCopyMatching(q as CFDictionary, &out) == errSecSuccess, let d = out as? Data else { return nil }
        return String(data: d, encoding: .utf8)
    }

    static func set(_ key: String, _ value: String?) {
        let q: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: "doorstock", kSecAttrAccount as String: key]
        SecItemDelete(q as CFDictionary)
        guard let value else { return }
        var add = q
        add[kSecValueData as String] = Data(value.utf8)
        add[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
        SecItemAdd(add as CFDictionary, nil)
    }
}

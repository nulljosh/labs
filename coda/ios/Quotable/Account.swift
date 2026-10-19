import AuthenticationServices
import CryptoKit
import Foundation
import Observation
import Security

/// The same account as the web game: jaybulb-api on Cloudflare (Workers + D1). Email and
/// password, Sign in with Apple, Google (OAuth code + PKCE in the system web sheet, no SDK),
/// delete account, the leaderboard and friends. Shared with macOS via project.yml.
/// The refresh token lives in the Keychain; the short-lived access token stays in memory.
@MainActor @Observable
final class Account {
    static let shared = Account()

    struct Entry: Decodable, Identifiable {
        let name: String
        let score: Int
        var id: String { name + "\(score)" }
    }

    /// One row of the friends board: you and each friend, best score per mode.
    struct Friend: Decodable, Identifiable {
        let code: String, name: String, normal: Int, speed: Int
        let me: Bool?
        var id: String { code }
    }

    private static let api = "https://api.jaybulb.com"
    private static let service = "com.heyitsmejosh.quotable.session"

    private(set) var userID: String?
    private(set) var name = "Player"
    var isSignedIn: Bool { userID != nil }
    var error: String?
    var notice: String?
    private var access: String?
    private var nonce = ""

    private init() {
        // Sessions from the old Supabase backend are dead; drop them so nobody looks signed in.
        for k in ["sb_access", "sb_refresh", "sb_user", "sb_name"] { UserDefaults.standard.removeObject(forKey: k) }
        Task { await restore() }
    }

    // MARK: Session

    private struct Session: Decodable {
        let access_token: String, refresh_token: String
        let user: User
        struct User: Decodable { let id: String; let email: String?; let user_metadata: Meta? }
        struct Meta: Decodable { let name: String?; let full_name: String? }
    }
    private struct Failure: Decodable { let error: String? }

    private func call(_ method: String, _ path: String, _ body: [String: Any]? = nil, authed: Bool = false) async throws -> Data {
        var r = URLRequest(url: URL(string: Self.api + path)!)
        r.httpMethod = method
        if let body { r.httpBody = try JSONSerialization.data(withJSONObject: body); r.setValue("application/json", forHTTPHeaderField: "Content-Type") }
        if authed, let access { r.setValue("Bearer \(access)", forHTTPHeaderField: "Authorization") }
        let (data, res) = try await URLSession.shared.data(for: r)
        let code = (res as? HTTPURLResponse)?.statusCode ?? 0
        // Access tokens last an hour; refresh once and retry before giving up.
        if code == 401, authed, await refresh() { return try await call(method, path, body, authed: true) }
        guard code < 300 else {
            throw NSError(domain: "Coda", code: code, userInfo: [NSLocalizedDescriptionKey: (try? JSONDecoder().decode(Failure.self, from: data))?.error ?? "Something went wrong"])
        }
        return data
    }

    private func start(_ data: Data) throws {
        let s = try JSONDecoder().decode(Session.self, from: data)
        access = s.access_token
        Self.keychain(set: s.refresh_token)
        userID = s.user.id
        let given = s.user.user_metadata?.name ?? s.user.user_metadata?.full_name ?? s.user.email?.components(separatedBy: "@").first
        name = String((given?.isEmpty == false ? given! : "Player").prefix(24))
    }

    private func restore() async { _ = await refresh() }

    private func refresh() async -> Bool {
        guard let token = Self.keychain() else { return false }
        guard let d = try? await call("POST", "/auth/token?grant_type=refresh_token", ["refresh_token": token]), (try? start(d)) != nil else {
            Self.keychain(set: nil); userID = nil; access = nil
            return false
        }
        return true
    }

    private func run(_ work: @escaping () async throws -> Void) async {
        error = nil; notice = nil
        do { try await work() } catch { self.error = error.localizedDescription }
    }

    // MARK: Email and password

    func signIn(email: String, password: String) async {
        await run { try self.start(await self.call("POST", "/auth/token?grant_type=password", ["email": email, "password": password])) }
    }

    func signUp(email: String, password: String, name: String) async {
        await run {
            _ = try await self.call("POST", "/auth/signup", ["email": email, "password": password, "data": ["name": String(name.prefix(24))], "redirect_to": "https://coda.jaybulb.com/play"])
            self.notice = "Check your email to confirm your account, then sign in."
        }
    }

    func recover(email: String) async {
        await run {
            _ = try await self.call("POST", "/auth/recover", ["email": email, "redirect_to": "https://coda.jaybulb.com/play"])
            self.notice = "If that email has an account, a reset link is on its way."
        }
    }

    // MARK: Sign in with Apple

    func prepare(_ request: ASAuthorizationAppleIDRequest) {
        nonce = (0..<32).map { _ in String(format: "%02x", UInt8.random(in: 0...255)) }.joined()
        request.requestedScopes = [.fullName, .email]
        request.nonce = SHA256.hash(data: Data(nonce.utf8)).map { String(format: "%02x", $0) }.joined()
    }

    func finish(_ result: Result<ASAuthorization, Error>) async {
        switch result {
        case .failure(let e):
            if (e as? ASAuthorizationError)?.code != .canceled { error = e.localizedDescription }
        case .success(let auth):
            guard let c = auth.credential as? ASAuthorizationAppleIDCredential, let t = c.identityToken, let token = String(data: t, encoding: .utf8) else { error = "Apple did not return a sign-in"; return }
            // Apple sends the name once, on the very first sign-in, so pass it along now.
            let full = [c.fullName?.givenName, c.fullName?.familyName].compactMap { $0 }.joined(separator: " ")
            await run { try self.start(await self.call("POST", "/auth/token?grant_type=id_token", ["provider": "apple", "id_token": token, "nonce": self.nonce, "full_name": full])) }
        }
    }

    // MARK: Google: OAuth code flow with PKCE. The iOS client has no secret; the verifier
    // proves this app started the flow. The same client id is accepted by jaybulb-api.

    static let googleClient = "337798947774-5r4r4ac0f7l10ctimfcig7v8t38ddq4d.apps.googleusercontent.com"
    static var googleScheme: String { "com.googleusercontent.apps." + googleClient.replacingOccurrences(of: ".apps.googleusercontent.com", with: "") }
    private var verifier = ""

    func googleURL() -> URL {
        verifier = (0..<48).map { _ in String(format: "%02x", UInt8.random(in: 0...255)) }.joined()
        let challenge = Data(SHA256.hash(data: Data(verifier.utf8))).base64EncodedString()
            .replacingOccurrences(of: "+", with: "-").replacingOccurrences(of: "/", with: "_").replacingOccurrences(of: "=", with: "")
        var c = URLComponents(string: "https://accounts.google.com/o/oauth2/v2/auth")!
        c.queryItems = [
            .init(name: "client_id", value: Self.googleClient),
            .init(name: "redirect_uri", value: Self.googleScheme + ":/oauth2redirect"),
            .init(name: "response_type", value: "code"),
            .init(name: "scope", value: "openid email profile"),
            .init(name: "code_challenge", value: challenge),
            .init(name: "code_challenge_method", value: "S256"),
        ]
        return c.url!
    }

    func finishGoogle(_ callback: URL) async {
        guard let code = URLComponents(url: callback, resolvingAgainstBaseURL: false)?.queryItems?.first(where: { $0.name == "code" })?.value else {
            error = "Google did not return a sign-in"; return
        }
        await run {
            var req = URLRequest(url: URL(string: "https://oauth2.googleapis.com/token")!)
            req.httpMethod = "POST"
            req.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
            let form = ["code": code, "client_id": Self.googleClient, "redirect_uri": Self.googleScheme + ":/oauth2redirect", "grant_type": "authorization_code", "code_verifier": self.verifier]
            req.httpBody = form.map { "\($0.key)=\($0.value.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? "")" }.joined(separator: "&").data(using: .utf8)
            let (data, _) = try await URLSession.shared.data(for: req)
            struct Tokens: Decodable { let id_token: String? }
            guard let token = try JSONDecoder().decode(Tokens.self, from: data).id_token else { throw URLError(.userAuthenticationRequired) }
            try self.start(await self.call("POST", "/auth/token?grant_type=id_token", ["provider": "google", "id_token": token]))
        }
    }

    // MARK: Account

    func signOut() {
        let token = access
        Task { if token != nil { _ = try? await call("POST", "/auth/logout", nil, authed: true) } }
        userID = nil; access = nil; name = "Player"
        Self.keychain(set: nil)
    }

    /// Deletes the account, every score and every friend link. Apple requires this in-app (5.1.1v).
    func deleteAccount() async -> Bool {
        do { _ = try await call("DELETE", "/auth/user", nil, authed: true) } catch { self.error = error.localizedDescription; return false }
        signOut()
        return true
    }

    // MARK: Scores

    /// Fair play (v87): a signed token when a game starts, the run handed in at the end, checked by jaybulb-api.
    private var gameToken: Task<String?, Never>?
    func beginGame(speed: Bool) {
        guard userID != nil else { return }
        gameToken = Task {
            guard let data = try? await call("POST", "/rpc/quotestreak_game_start", ["board": speed ? "speed" : "normal"], authed: true),
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
            return json["token"] as? String
        }
    }

    func submit(score: Int, speed: Bool, run: [Game.RunItem]) async {
        guard score > 0, userID != nil, let token = await gameToken?.value else { return }
        gameToken = nil
        let items = run.map { ["qid": $0.qid, "pick": $0.pick ?? NSNull(), "pts": $0.pts] as [String: Any] }
        _ = try? await call("POST", "/rpc/quotestreak_submit_score", ["token": token, "score": score, "run": items, "way": "classic", "name": name], authed: true)
    }

    func leaderboard(speed: Bool) async -> [Entry] {
        let path = "/rest/quotestreak_leaderboard?select=name,score&mode=eq.\(speed ? "speed" : "normal")&order=score.desc&limit=20"
        guard let data = try? await call("GET", path) else { return [] }
        return (try? JSONDecoder().decode([Entry].self, from: data)) ?? []
    }

    // MARK: Real difficulty (anonymous, same tallies as the web)

    func tally(_ quote: Quote, correct: Bool) {
        Task { _ = try? await call("POST", "/rpc/quotestreak_answer", ["qid": quote.qid, "ok": correct]) }
    }

    func loadStats(into game: Game) async {
        struct Row: Decodable { let qid: String; let plays: Int; let correct: Int }
        guard let d = try? await call("POST", "/rpc/quotestreak_stats", [:]), let rows = try? JSONDecoder().decode([Row].self, from: d) else { return }
        game.stats = Dictionary(uniqueKeysWithValues: rows.map { ($0.qid, (plays: $0.plays, correct: $0.correct)) })
    }

    // MARK: Friends

    func myCode() async -> String? {
        struct Code: Decodable { let code: String }
        guard let d = try? await call("POST", "/rpc/quotestreak_my_code", [:], authed: true) else { return nil }
        return (try? JSONDecoder().decode(Code.self, from: d))?.code
    }

    func friends() async -> [Friend] {
        guard let d = try? await call("POST", "/rpc/quotestreak_friends", [:], authed: true) else { return [] }
        return (try? JSONDecoder().decode([Friend].self, from: d)) ?? []
    }

    func addFriend(code: String) async -> Bool {
        do { _ = try await call("POST", "/rpc/quotestreak_add_friend", ["code": code], authed: true); notice = "Friend added."; return true }
        catch { self.error = error.localizedDescription; return false }
    }

    func removeFriend(code: String) async {
        _ = try? await call("POST", "/rpc/quotestreak_remove_friend", ["code": code], authed: true)
    }

    // MARK: Keychain
    // Debug builds keep the token in UserDefaults: every ad-hoc re-sign changes the code hash,
    // and the keychain would ask for the login password on each launch.
    #if DEBUG
    @discardableResult
    private static func keychain(set value: String?) -> Bool { UserDefaults.standard.set(value, forKey: "debugRefreshToken"); return true }
    private static func keychain() -> String? { UserDefaults.standard.string(forKey: "debugRefreshToken") }
    #else
    @discardableResult
    private static func keychain(set value: String?) -> Bool {
        let q: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service]
        SecItemDelete(q as CFDictionary)
        guard let value else { return true }
        return SecItemAdd(q.merging([kSecValueData as String: Data(value.utf8)]) { $1 } as CFDictionary, nil) == errSecSuccess
    }
    private static func keychain() -> String? {
        let q: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service, kSecReturnData as String: true, kSecMatchLimit as String: kSecMatchLimitOne]
        var out: AnyObject?
        guard SecItemCopyMatching(q as CFDictionary, &out) == errSecSuccess, let d = out as? Data else { return nil }
        return String(data: d, encoding: .utf8)
    }
    #endif
}

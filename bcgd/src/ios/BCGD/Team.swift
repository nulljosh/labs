import SwiftUI

/// Settings shelf for sharing: sign in, start or join a shop, see the crew.
struct TeamShelf: View {
    @Environment(Account.self) private var account
    @State private var signingIn = false
    @State private var prompt: Prompt?
    @State private var text = ""
    @State private var error: String?
    @State private var deleting = false

    enum Prompt: String, Identifiable { case start = "Name your shop", join = "Enter the shop code"; var id: String { rawValue } }

    var body: some View {
        Shelf("Team", symbol: "person.2") {
            if !account.signedIn {
                Button { signingIn = true } label: { ActionTile("Sign in to share stock", symbol: "person.crop.circle.badge.plus") }
                    .buttonStyle(.plain)
            } else if let shop = account.shop {
                shopCard(shop)
            } else {
                LazyVGrid(columns: Grid.tiles, spacing: 12) {
                    Button { prompt = .start } label: { ActionTile("Start a shop", symbol: "door.garage.closed") }
                    Button { prompt = .join } label: { ActionTile("Join with a code", symbol: "key") }
                    Button { account.signOut() } label: { ActionTile("Sign out", symbol: "rectangle.portrait.and.arrow.right", tint: .secondary) }
                }
                .buttonStyle(.plain)
            }
            if let error { Label(error, systemImage: "exclamationmark.triangle").font(.footnote).foregroundStyle(.red) }
            if let e = account.syncError { Label("Sync paused: \(e)", systemImage: "icloud.slash").font(.footnote).foregroundStyle(.secondary) }
        }
        .sheet(isPresented: $signingIn) { SignInSheet() }
        .alert(prompt?.rawValue ?? "", isPresented: Binding(get: { prompt != nil }, set: { if !$0 { prompt = nil } }), presenting: prompt) { p in
            TextField(p == .start ? "Best Choice Garage Doors" : "ABCDEF", text: $text)
            Button(p == .start ? "Start" : "Join") {
                let value = text   // read now; the task runs after text is cleared
                run { p == .start ? try await account.createShop(name: value) : try await account.join(code: value) }
                text = ""
            }
            Button("Cancel", role: .cancel) { text = "" }
        } message: { p in
            Text(p == .start ? "Your stock and jobs become the shop's. Your crew join with a code." : "This device's stock and jobs are replaced by the shop's.")
        }
        .confirmationDialog("Delete your account? A shop you own goes with it.", isPresented: $deleting) {
            Button("Delete account", role: .destructive) { run { try await account.deleteAccount() } }
        }
    }

    private func shopCard(_ shop: Account.Shop) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                Image(systemName: "door.garage.closed").font(.title2).foregroundStyle(Color.doorstock)
                VStack(alignment: .leading, spacing: 2) {
                    Text(shop.name).font(.headline)
                    Text(shop.role == "owner" ? "You run this shop" : "You're on the crew").font(.footnote).foregroundStyle(.secondary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text(shop.code).font(.system(.title3, design: .rounded).weight(.bold)).tracking(2).textSelection(.enabled)
                    Text("Join code").font(.caption).foregroundStyle(.secondary)
                }
            }
            Divider()
            ForEach(shop.members) { m in
                HStack(spacing: 12) {
                    Image(systemName: m.role == "owner" ? "person.crop.circle.badge.checkmark" : "person.crop.circle").foregroundStyle(Color.doorstock)
                    Text(m.email ?? "Crew member").lineLimit(1)
                    if m.me { Text("You").font(.caption).foregroundStyle(.secondary) }
                    Spacer()
                    if account.isOwner && !m.me {
                        Button { run { try await account.remove(m) } } label: { Image(systemName: "minus.circle") }
                            .buttonStyle(.plain).foregroundStyle(.red).help("Remove from shop")
                    }
                }
            }
            Divider()
            HStack(spacing: 8) {
                if !account.isOwner { Button("Leave shop", systemImage: "arrow.uturn.left") { run { try await account.leave() } } }
                Button("Sign out", systemImage: "rectangle.portrait.and.arrow.right") { account.signOut() }
                Spacer()
                Button("Delete account", systemImage: "trash", role: .destructive) { deleting = true }
            }
            .buttonStyle(.bordered)
            .buttonBorderShape(.capsule)
        }
        .cardBackground()
    }

    private func run(_ work: @escaping () async throws -> Void) {
        Task {
            do { try await work(); error = nil } catch { self.error = error.localizedDescription }
        }
    }
}

struct SignInSheet: View {
    @Environment(Account.self) private var account
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var password = ""
    @State private var note: String?
    @State private var busy = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Email", text: $email)
                        .textContentType(.username)
                    SecureField("Password (8 or more characters)", text: $password)
                        .textContentType(.password)
                } footer: {
                    if let note { Text(note) }
                }
                Section {
                    Button("Sign in") { go { try await account.signIn(email: email, password: password); dismiss() } }
                    Button("Create account") {
                        go { try await account.signUp(email: email, password: password); note = "Check your email for a link to confirm, then sign in here." }
                    }
                }
                .disabled(busy || email.isEmpty || password.count < 8)
            }
            .formStyle(.grouped)
            .navigationTitle("Doorstock account")
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } } }
        }
        #if os(macOS)
        .frame(minWidth: 380, minHeight: 300)
        #endif
    }

    private func go(_ work: @escaping () async throws -> Void) {
        busy = true
        Task {
            do { try await work() } catch { note = error.localizedDescription }
            busy = false
        }
    }
}

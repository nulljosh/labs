import AuthenticationServices
import SwiftUI

struct AccountSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.webAuthenticationSession) private var webAuth
    @State private var confirmingDelete = false
    @State private var deletingAccount = false
    @State private var email = ""
    @State private var password = ""
    @State private var newName = ""
    @State private var creating = false
    private var account: Account { Account.shared }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                Text("Account").font(.quip(.title2, weight: .bold))
                if account.isSignedIn {
                    Text("Signed in as \(account.name)")
                    FriendsSection()
                    Button("Sign out") { account.signOut() }.buttonStyle(.bordered)
                    Button("Delete account", role: .destructive) { confirmingDelete = true }
                        .disabled(deletingAccount)
                } else {
                    Text("Sign in to put your scores on the leaderboard and play with friends.").multilineTextAlignment(.center).foregroundStyle(.secondary)
                    SignInWithAppleButton(.signIn, onRequest: account.prepare) { result in
                        Task { await account.finish(result); if account.isSignedIn { dismiss() } }
                    }
                    .frame(width: 260, height: 44)

                    Button {
                        Task {
                            guard let url = try? await webAuth.authenticate(using: account.googleURL(), callbackURLScheme: Account.googleScheme) else { return }
                            await account.finishGoogle(url)
                            if account.isSignedIn { dismiss() }
                        }
                    } label: {
                        Text("Continue with Google").fontWeight(.semibold).frame(width: 260).padding(.vertical, 12)
                    }
                    .buttonStyle(.bordered)

                    VStack(spacing: 10) {
                        if creating { TextField("Display name", text: $newName).textContentType(.nickname) }
                        TextField("Email", text: $email)
                            .textContentType(.emailAddress)
                            #if os(iOS)
                            .keyboardType(.emailAddress).textInputAutocapitalization(.never)
                            #endif
                            .autocorrectionDisabled()
                        SecureField("Password", text: $password).textContentType(creating ? .newPassword : .password)
                    }
                    .textFieldStyle(.roundedBorder)
                    .frame(width: 260)

                    if creating {
                        Button("Create account") { Task { await account.signUp(email: email, password: password, name: newName) } }.buttonStyle(.borderedProminent)
                        Button("I have an account") { creating = false }
                    } else {
                        Button("Log in") { Task { await account.signIn(email: email, password: password); if account.isSignedIn { dismiss() } } }.buttonStyle(.borderedProminent)
                        HStack {
                            Button("Create account") { creating = true }
                            Button("Forgot password") { Task { await account.recover(email: email) } }
                        }
                    }
                }
                if let e = account.error { Text(e).foregroundStyle(.red).multilineTextAlignment(.center) }
                if let n = account.notice { Text(n).foregroundStyle(.secondary).multilineTextAlignment(.center) }
                Button("Close") { dismiss() }.buttonStyle(.bordered)
            }
            .padding(28)
        }
        .frame(minWidth: 320, minHeight: 420)
        .confirmationDialog("Delete account?", isPresented: $confirmingDelete, titleVisibility: .visible) {
            Button("Delete account", role: .destructive) {
                deletingAccount = true
                Task { if await account.deleteAccount() { dismiss() }; deletingAccount = false }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This permanently deletes your account, your scores and your friends list. This cannot be undone.")
        }
    }
}

/// Your friend code, an add-by-code field and the friends board. Mirrors the web panel.
struct FriendsSection: View {
    @State private var code: String?
    @State private var friends: [Account.Friend] = []
    @State private var entry = ""
    private var account: Account { Account.shared }

    var body: some View {
        VStack(spacing: 10) {
            Text("Friends").font(.quip(.headline, weight: .bold))
            if let code { Text("Your code: \(code)").textSelection(.enabled).foregroundStyle(.secondary) }
            HStack {
                TextField("Friend's code", text: $entry)
                    .textFieldStyle(.roundedBorder)
                    #if os(iOS)
                    .textInputAutocapitalization(.characters)
                    #endif
                    .autocorrectionDisabled()
                Button("Add") { Task { if await account.addFriend(code: entry) { entry = ""; await load() } } }
                    .disabled(entry.isEmpty)
            }
            .frame(width: 260)
            if friends.count < 2 {
                Text("Share your code. Friends who add it show up here.").font(.footnote).foregroundStyle(.secondary).multilineTextAlignment(.center)
            }
            ForEach(friends) { f in
                HStack {
                    Text(f.me == true ? "You" : f.name)
                    Spacer()
                    Text("\(f.normal) · speed \(f.speed)").monospacedDigit()
                    if f.me != true {
                        Button("Remove") { Task { await account.removeFriend(code: f.code); await load() } }.buttonStyle(.borderless)
                    }
                }
                .frame(width: 260)
            }
        }
        .task { await load() }
    }

    private func load() async {
        code = await account.myCode()
        friends = await account.friends()
    }
}

struct LeaderboardSheet: View {
    let speed: Bool
    @Environment(\.dismiss) private var dismiss
    @State private var entries: [Account.Entry]?

    var body: some View {
        VStack(spacing: 16) {
            Text(speed ? "Speed Round leaders" : "Leaders").font(.quip(.title2, weight: .bold))
            if let entries {
                if entries.isEmpty {
                    Text("No scores yet. Sign in and play!").foregroundStyle(.secondary)
                } else {
                    List(Array(entries.enumerated()), id: \.offset) { i, e in
                        HStack {
                            Text("\(i + 1).").foregroundStyle(.secondary).monospacedDigit()
                            Text(e.name)
                            Spacer()
                            Text("\(e.score)").monospacedDigit().bold()
                        }
                    }
                    .frame(minHeight: 300)
                }
            } else {
                ProgressView()
            }
            Button("Close") { dismiss() }.buttonStyle(.bordered)
        }
        .padding(28)
        .frame(minWidth: 320)
        .task { entries = await Account.shared.leaderboard(speed: speed) }
    }
}

import AuthenticationServices
import CryptoKit
import Supabase
import SwiftUI

// Same shared spark Supabase project the dashboard and other native apps use.
// Doorstock only needs auth here (per-tech identity), not table access yet:
// inventory/jobs stay device-local until a shared bcgd_inventory table exists.
@Observable
final class AuthStore {
    static let url = "https://tjsxsqlxjmanwvmywwvw.supabase.co"
    static let anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqc3hzcWx4am1hbnd2bXl3d3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTc0MDEsImV4cCI6MjA4NjA3MzQwMX0.LphLfho3wdQC20MhtcnBpzQUNuBoTOobrugQbNGxc68"

    var token: String? = UserDefaults.standard.string(forKey: "bcgd.authToken")
    var userId: String? = UserDefaults.standard.string(forKey: "bcgd.authUserId")
    var error = ""

    private lazy var sbClient = SupabaseClient(supabaseURL: URL(string: Self.url)!, supabaseKey: Self.anon)

    private func request(_ path: String, body: Data) -> URLRequest {
        var r = URLRequest(url: URL(string: Self.url + path)!)
        r.httpMethod = "POST"
        r.httpBody = body
        r.setValue(Self.anon, forHTTPHeaderField: "apikey")
        r.setValue("application/json", forHTTPHeaderField: "Content-Type")
        return r
    }

    func signInWithApple(idToken: String, nonce: String) async {
        struct Session: Decodable { let access_token: String?; let user: U?; let msg: String?; let error_description: String?; struct U: Decodable { let id: String } }
        let body = try! JSONSerialization.data(withJSONObject: ["provider": "apple", "id_token": idToken, "nonce": nonce])
        do {
            let (data, _) = try await URLSession.shared.data(for: request("/auth/v1/token?grant_type=id_token", body: body))
            let s = try JSONDecoder().decode(Session.self, from: data)
            if let t = s.access_token, let u = s.user?.id {
                setSession(token: t, userId: u)
            } else {
                error = s.error_description ?? s.msg ?? "Sign in with Apple failed"
            }
        } catch { self.error = error.localizedDescription }
    }

    /// `doorstock://` must be in the spark project's redirect allow-list and in
    /// CFBundleURLTypes, or the OAuth callback lands nowhere.
    func signInWithGoogle() async {
        do {
            try await sbClient.auth.signInWithOAuth(provider: .google, redirectTo: URL(string: "doorstock://"))
            let session = try await sbClient.auth.session
            setSession(token: session.accessToken, userId: session.user.id.uuidString)
        } catch { self.error = error.localizedDescription }
    }

    private func setSession(token: String, userId: String) {
        self.token = token
        self.userId = userId
        UserDefaults.standard.set(token, forKey: "bcgd.authToken")
        UserDefaults.standard.set(userId, forKey: "bcgd.authUserId")
        error = ""
    }

    func signOut() {
        token = nil
        userId = nil
        UserDefaults.standard.removeObject(forKey: "bcgd.authToken")
        UserDefaults.standard.removeObject(forKey: "bcgd.authUserId")
    }
}

struct AccountGateView: View {
    @Environment(AuthStore.self) private var auth
    @State private var appleNonce = ""

    var body: some View {
        @Bindable var auth = auth
        VStack(spacing: 20) {
            Image(systemName: "person.crop.circle.badge.checkmark")
                .font(.system(size: 44))
                .foregroundStyle(Color.bcgdTeal)
            Text("Sign in to Doorstock")
                .font(.headline)
            Text("Each tech signs in with their own account.")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            SignInWithAppleButton(.signIn) { request in
                appleNonce = randomNonce()
                request.requestedScopes = [.email]
                request.nonce = sha256(appleNonce)
            } onCompletion: { result in
                guard case .success(let authResult) = result,
                      let cred = authResult.credential as? ASAuthorizationAppleIDCredential,
                      let tokenData = cred.identityToken,
                      let idToken = String(data: tokenData, encoding: .utf8) else { return }
                Task { await auth.signInWithApple(idToken: idToken, nonce: appleNonce) }
            }
            .signInWithAppleButtonStyle(.black)
            .frame(height: 44)
            .padding(.horizontal, 32)

            Button {
                Task { await auth.signInWithGoogle() }
            } label: {
                Text("Continue with Google").fontWeight(.semibold).frame(maxWidth: .infinity).padding(.vertical, 12)
            }
            .buttonStyle(.bordered)
            .padding(.horizontal, 32)

            if !auth.error.isEmpty {
                Text(auth.error).font(.footnote).foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
}

private func randomNonce(length: Int = 32) -> String {
    let chars = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
    var result = ""
    var remaining = length
    while remaining > 0 {
        var random: UInt8 = 0
        _ = SecRandomCopyBytes(kSecRandomDefault, 1, &random)
        if random < chars.count { result.append(chars[Int(random)]); remaining -= 1 }
    }
    return result
}

private func sha256(_ input: String) -> String {
    SHA256.hash(data: Data(input.utf8)).compactMap { String(format: "%02x", $0) }.joined()
}

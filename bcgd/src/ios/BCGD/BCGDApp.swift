import SwiftUI
import LocalAuthentication

@main
struct BCGDApp: App {
    @State private var auth = AuthStore()
    @State private var store = Store()
    @State private var unlocked = false

    var body: some Scene {
        WindowGroup {
            Group {
                if auth.userId == nil {
                    AccountGateView()
                        .environment(auth)
                } else if unlocked {
                    TabView {
                        DashboardView()
                            .tabItem { Label("Dashboard", systemImage: "square.grid.2x2") }
                        InventoryView()
                            .tabItem { Label("Inventory", systemImage: "shippingbox") }
                        JobsView()
                            .tabItem { Label("Jobs", systemImage: "list.clipboard") }
                        SettingsView()
                            .tabItem { Label("Settings", systemImage: "gearshape") }
                    }
                    .tint(.bcgdTeal)
                    .environment(store)
                    .environment(auth)
                } else {
                    LockScreen(unlocked: $unlocked)
                }
            }
            .onChange(of: unlocked) { _, isUnlocked in
                if !isUnlocked { authenticate() }
            }
            .task { if auth.userId != nil { authenticate() } }
            .onChange(of: auth.userId) { _, newValue in
                if newValue != nil { authenticate() }
            }
        }
    }

    private func authenticate() {
        let context = LAContext()
        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) else {
            unlocked = true // ponytail: no passcode/biometrics set on device, don't lock the shop out
            return
        }
        context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: "Unlock Doorstock") { success, _ in
            DispatchQueue.main.async { unlocked = success }
        }
    }
}

// MARK: - Lock screen

private struct LockScreen: View {
    @Binding var unlocked: Bool

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "lock.shield")
                .font(.system(size: 44))
                .foregroundStyle(Color.bcgdTeal)
            Text("Doorstock is locked")
                .font(.headline)
            Button("Unlock") {
                let context = LAContext()
                context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: "Unlock Doorstock") { success, _ in
                    DispatchQueue.main.async { unlocked = success }
                }
            }
            .buttonStyle(.borderedProminent)
            .tint(.bcgdTeal)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
}

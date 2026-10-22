import SwiftUI
import LocalAuthentication

@main
struct BCGDApp: App {
    @State private var store: Store
    @State private var account: Account
    @State private var unlocked = false

    init() {
        let store = Store()
        _store = State(initialValue: store)
        _account = State(initialValue: Account(store: store))
    }

    var body: some Scene {
        WindowGroup {
            Group {
                if unlocked {
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
                    .tint(.doorstock)
                    .environment(store)
                    .environment(account)
                    // ponytail: poll every 30 s while open; a push channel can replace it if the crew grows
                    .task {
                        while !Task.isCancelled {
                            if account.signedIn { try? await account.refreshShop() }
                            try? await Task.sleep(for: .seconds(30))
                        }
                    }
                } else {
                    LockScreen(unlocked: $unlocked)
                }
            }
            .task { authenticate() }
        }
    }

    private func authenticate() {
        #if DEBUG
        if UserDefaults.standard.bool(forKey: "skipLock") { unlocked = true; return } // QA on a simulator with someone else's passcode
        #endif
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
                .foregroundStyle(Color.doorstock)
            Text("Doorstock is locked")
                .font(.headline)
            Button("Unlock") {
                let context = LAContext()
                context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: "Unlock Doorstock") { success, _ in
                    DispatchQueue.main.async { unlocked = success }
                }
            }
            .buttonStyle(.borderedProminent)
            .tint(.doorstock)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
}

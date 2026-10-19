import SwiftUI

@main
struct BCGDApp: App {
    @State private var store = Store()
    @SceneStorage("selectedTab") private var selectedTab = 0

    var body: some Scene {
        WindowGroup {
            TabView(selection: $selectedTab) {
                DashboardView()
                    .tabItem { Label("Dashboard", systemImage: "square.grid.2x2") }
                    .tag(0)
                InventoryView()
                    .tabItem { Label("Inventory", systemImage: "shippingbox") }
                    .tag(1)
                JobsView()
                    .tabItem { Label("Jobs", systemImage: "list.clipboard") }
                    .tag(2)
                SettingsView()
                    .tabItem { Label("Settings", systemImage: "gearshape") }
                    .tag(3)
            }
            .tint(.bcgdTeal)
            .environment(store)
        }
    }
}

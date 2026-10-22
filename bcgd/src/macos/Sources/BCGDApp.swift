import SwiftUI

@main
struct BCGDApp: App {
    @State private var store = Store()

    var body: some Scene {
        WindowGroup {
            RootView()
                .tint(.doorstock)
                .environment(store)
        }
        .defaultSize(width: 1000, height: 680)
    }
}

// SceneStorage only works inside a View; on the App struct its setter is a no-op and tabs never switch.
struct RootView: View {
    @SceneStorage("selectedTab") private var selectedTab = 0

    private let sections = [
        ("Dashboard", "square.grid.2x2"),
        ("Inventory", "shippingbox"),
        ("Jobs", "list.clipboard"),
        ("Settings", "gearshape"),
    ]

    var body: some View {
        NavigationSplitView {
            List(selection: Binding(get: { selectedTab }, set: { selectedTab = $0 ?? 0 })) {
                ForEach(sections.indices, id: \.self) { i in
                    Label(sections[i].0, systemImage: sections[i].1).tag(i)
                }
            }
            .navigationSplitViewColumnWidth(min: 180, ideal: 200)
        } detail: {
            switch selectedTab {
            case 1: InventoryView()
            case 2: JobsView()
            case 3: SettingsView()
            default: DashboardView()
            }
        }
    }
}

import SwiftUI

@main
struct BCGDApp: App {
    @State private var store: Store
    @State private var account: Account

    init() {
        let store = Store()
        _store = State(initialValue: store)
        _account = State(initialValue: Account(store: store))
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .tint(.doorstock)
                .environment(store)
                .environment(account)
        }
        .defaultSize(width: 1000, height: 680)
    }
}

// SceneStorage only works inside a View; on the App struct its setter is a no-op and tabs never switch.
struct RootView: View {
    @SceneStorage("selectedTab") private var selectedTab = 0
    @Environment(Account.self) private var account

    private let sections = [
        ("Dashboard", "square.grid.2x2"),
        ("Inventory", "shippingbox"),
        ("Jobs", "list.clipboard"),
        ("Settings", "gearshape"),
    ]

    var body: some View {
        Group {
            switch selectedTab {
            case 1: InventoryView()
            case 2: JobsView()
            case 3: SettingsView()
            default: DashboardView()
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .safeAreaInset(edge: .bottom) { navBar }
        // ponytail: poll every 30 s while open; a push channel can replace it if the crew grows
        .task {
            while !Task.isCancelled {
                if account.signedIn { try? await account.refreshShop() }
                try? await Task.sleep(for: .seconds(30))
            }
        }
    }

    /// Floating bottom bar, like the phone's tab bar. Cmd-1 to Cmd-4 jump straight to a section.
    private var navBar: some View {
        HStack(spacing: 4) {
            ForEach(sections.indices, id: \.self) { i in
                let on = selectedTab == i
                Button { selectedTab = i } label: {
                    VStack(spacing: 4) {
                        Image(systemName: sections[i].1).font(.title3)
                        Text(sections[i].0).font(.caption.weight(.medium))
                    }
                    .frame(width: 88, height: 48)
                    .foregroundStyle(on ? Color.doorstock : Color.secondary)
                    .background(on ? Color.doorstock.opacity(0.12) : Color.clear, in: Capsule())
                    .contentShape(Capsule())
                }
                .buttonStyle(.plain)
                .keyboardShortcut(KeyEquivalent(Character("\(i + 1)")), modifiers: .command)
                .accessibilityAddTraits(on ? .isSelected : [])
            }
        }
        .padding(6)
        .background(.regularMaterial, in: Capsule())
        .overlay(Capsule().strokeBorder(Color.primary.opacity(0.08)))
        .shadow(color: .black.opacity(0.12), radius: 16, y: 4)
        .padding(.bottom, 16)
    }
}

import SwiftUI

@main
struct HorulaApp: App {
    @State private var store = Store()
    @State private var alarms = AlarmScheduler()
    #if os(macOS)
    @NSApplicationDelegateAdaptor private var delegate: SnapshotDelegate
    #endif

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(store)
                .environment(alarms)
                .tint(.horula)
                .task { if !Store.demo { await alarms.sync(store) } }
        }
        #if os(macOS)
        .defaultSize(width: 440, height: 820)
        .commands { TabCommands() }
        #endif
    }
}

enum AppTab: String, CaseIterable { case world, alarms, stopwatch, timers }

struct RootView: View {
    @AppStorage("tab") private var tab: AppTab = .world
    @Environment(Store.self) private var store
    var body: some View {
        TabView(selection: $tab) {
            SwiftUI.Tab("World Clock", systemImage: "globe", value: AppTab.world) { WorldView() }
            SwiftUI.Tab("Alarms", systemImage: "alarm.fill", value: AppTab.alarms) { AlarmsView() }
            SwiftUI.Tab("Stopwatch", systemImage: "stopwatch.fill", value: AppTab.stopwatch) { StopwatchView() }
            SwiftUI.Tab("Timers", systemImage: "timer", value: AppTab.timers) { TimersView() }
        }
        .onOpenURL { url in Links.handle(url, tab: $tab, store: store) }
    }
}

#if os(macOS)
/// `-snapshot /path.png`: the Mac app draws its own window to a PNG, for App Store screenshots.
/// The app capturing itself needs no screen recording permission.
final class SnapshotDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ n: Notification) { Task { @MainActor in await Snapshot.ifAsked() } }
}

enum Snapshot {
    @MainActor static func ifAsked() async {
        let args = ProcessInfo.processInfo.arguments
        guard let i = args.firstIndex(of: "-snapshot"), i + 1 < args.count else { return }
        try? await Task.sleep(for: .seconds(1))
        guard let w = NSApp.windows.first(where: { $0.contentView != nil && $0.frame.width > 100 }) else { return }
        w.setContentSize(NSSize(width: 1440, height: 900)); w.center()
        try? await Task.sleep(for: .seconds(2))
        guard let v = w.contentView?.superview ?? w.contentView, let rep = v.bitmapImageRepForCachingDisplay(in: v.bounds) else { return }
        v.cacheDisplay(in: v.bounds, to: rep)
        try? rep.representation(using: .png, properties: [:])?.write(to: URL(fileURLWithPath: args[i + 1]))
        NSApp.terminate(nil)
    }
}

/// Command 1 to 4 switch tabs, like macOS Clock.
struct TabCommands: Commands {
    @AppStorage("tab") private var tab: AppTab = .world
    var body: some Commands {
        CommandMenu("View") {
            Button("World Clock") { tab = .world }.keyboardShortcut("1")
            Button("Alarms") { tab = .alarms }.keyboardShortcut("2")
            Button("Stopwatch") { tab = .stopwatch }.keyboardShortcut("3")
            Button("Timers") { tab = .timers }.keyboardShortcut("4")
        }
    }
}
#endif

/// horula://timer?d=10m, horula://alarm?t=07:30&label=Gym, horula://tab/alarms. Same idea as the web's #timer=10m links.
enum Links {
    static func handle(_ url: URL, tab: Binding<AppTab>, store: Store) {
        let q = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems ?? []
        func v(_ k: String) -> String? { q.first { $0.name == k }?.value }
        switch url.host {
        case "tab": if let t = AppTab(rawValue: url.lastPathComponent) { tab.wrappedValue = t }
        case "timer":
            tab.wrappedValue = .timers
            if let d = Clockwork.parseDuration(v("d") ?? "") { store.startTimer(d, label: String((v("label") ?? "").prefix(40))) }
        case "alarm":
            tab.wrappedValue = .alarms
            let t = (v("t") ?? "").count == 4 ? "0" + v("t")! : v("t") ?? ""
            if t.wholeMatch(of: /([01]\d|2[0-3]):[0-5]\d/) != nil, !store.alarms.contains(where: { $0.time == t && $0.days.isEmpty && $0.on }) {
                store.alarms.append(AlarmItem(time: t, label: String((v("label") ?? "").prefix(40))))
                store.alarms.sort { $0.time < $1.time }
            }
        default: break
        }
    }
}

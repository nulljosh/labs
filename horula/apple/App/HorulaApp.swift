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

#if os(macOS)
/// `-snapshot /path.png`: the Mac app draws its own window to a PNG, for App Store screenshots.
/// The app capturing itself needs no screen recording permission.
final class SnapshotDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ n: Notification) { Task { @MainActor in await Snapshot.ifAsked() } }
}

enum Snapshot {
    /// `-tour`: one window at exactly 1440x900, walks the four tabs light then World dark, printing
    /// "SHOT <name> <windowid>" after each settles so the terminal can `screencapture -o -l<id>` it, then quits.
    /// On screen, unlike `-snapshot`, because the macOS 26 glass tab labels draw blank off screen. Ask Joshua first.
    @MainActor static func tour() async {
        var found: NSWindow?
        for _ in 0..<60 where found == nil {
            try? await Task.sleep(for: .milliseconds(250))
            found = NSApp.windows.first { $0.contentView != nil && $0.frame.width > 100 }
        }
        guard let w = found, let screen = w.screen ?? NSScreen.main else { NSApp.terminate(nil); return }
        let v = screen.visibleFrame
        w.setFrame(NSRect(x: v.midX - 720, y: v.maxY - 900, width: 1440, height: 900), display: true)
        NSApp.activate(); w.makeKeyAndOrderFront(nil)
        let steps: [(AppTab, NSAppearance.Name, String)] = [(.world, .aqua, "world"), (.alarms, .aqua, "alarms"), (.stopwatch, .aqua, "stopwatch"), (.timers, .aqua, "timers"), (.world, .darkAqua, "world-dark")]
        for (tab, look, name) in steps {
            NSApp.appearance = NSAppearance(named: look)
            UserDefaults.standard.set(tab.rawValue, forKey: "tab")
            try? await Task.sleep(for: .seconds(3))
            print("SHOT \(name) \(w.windowNumber)"); fflush(stdout)
            try? await Task.sleep(for: .seconds(2))
        }
        NSApp.terminate(nil)
    }

    @MainActor static func ifAsked() async {
        let args = ProcessInfo.processInfo.arguments
        if args.contains("-tour") { await tour(); return }
        guard let i = args.firstIndex(of: "-snapshot"), i + 1 < args.count else { return }
        var found: NSWindow?
        for _ in 0..<60 where found == nil {   // a debug build can take several seconds to put up its first window
            try? await Task.sleep(for: .milliseconds(250))
            found = NSApp.windows.first { $0.contentView != nil && $0.frame.width > 100 }   // hidden launch: not visible, still drawable
        }
        guard let w = found else { return }
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

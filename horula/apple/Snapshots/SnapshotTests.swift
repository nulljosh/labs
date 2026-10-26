import AppKit
import SwiftUI
import XCTest

/// Draws each tab of the Mac app at 1440x900 into a window that is never put on screen, and saves PNGs.
@MainActor final class SnapshotTests: XCTestCase {
    func testMacScreenshots() async throws {
        guard let out = ProcessInfo.processInfo.environment["HORULA_SHOTS"] else { throw XCTSkip("set TEST_RUNNER_HORULA_SHOTS to a folder") }
        _ = NSApplication.shared
        let store = Store(defaults: Store.demoDefaults())
        UserDefaults.standard.set(true, forKey: "swAnalog")   // the dial makes the better screenshot
        UserDefaults.standard.set("flip", forKey: "standFace")   // QA the newest face
        for tab in AppTab.allCases {
            UserDefaults.standard.set(tab.rawValue, forKey: "tab")
            try await render(RootView().environment(store).environment(AlarmScheduler()).tint(.horula), 1440, 900, "\(out)/horula-mac-\(tab.rawValue).png")
        }
        // The city sheet, with a name of your own, for QA rather than the store.
        store.zones[0].nick = "Mum"
        try await render(CityDetail(city: store.zones[0]).environment(store).tint(.horula), 480, 520, "\(out)/horula-mac-city.png")
        try await render(List { CountdownSection() }.environment(store).tint(.horula), 520, 320, "\(out)/horula-mac-countdowns.png")
        try await render(Nightstand().environment(store).tint(.horula), 900, 500, "\(out)/horula-mac-nightstand.png")
    }

    private func render(_ view: some View, _ width: CGFloat, _ height: CGFloat, _ path: String) async throws {
        let w = KeyWindow(contentRect: NSRect(x: 0, y: 0, width: width, height: height), styleMask: [.titled, .closable, .miniaturizable, .resizable],
                         backing: .buffered, defer: false)
        w.isReleasedWhenClosed = false
        let host = NSHostingView(rootView: view)
        host.sizingOptions = []   // or the window grows to the content's ideal height
        w.contentView = host
        // Far outside every display: the window server composites it (glass needs that) but it is never visible.
        w.setFrame(NSRect(x: -30000, y: -30000, width: width, height: height), display: false)   // the whole window is the App Store size
        w.orderBack(nil)
        w.contentView?.layoutSubtreeIfNeeded()
        try await Task.sleep(for: .seconds(2))
        let v = try XCTUnwrap(w.contentView?.superview ?? w.contentView)
        let rep = try XCTUnwrap(v.bitmapImageRepForCachingDisplay(in: v.bounds))
        v.cacheDisplay(in: v.bounds, to: rep)
        try XCTUnwrap(rep.representation(using: .png, properties: [:])).write(to: URL(fileURLWithPath: path))
        w.close()
    }
}

/// Draws as the active window, so the selected tab and controls look the way they do in use, without ever being shown.
final class KeyWindow: NSWindow {
    override var isKeyWindow: Bool { true }
    override var isMainWindow: Bool { true }
    override func constrainFrameRect(_ r: NSRect, to screen: NSScreen?) -> NSRect { r }   // stay off screen
}

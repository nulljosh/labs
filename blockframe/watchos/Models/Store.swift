// On-device persistence: the watch canvas survives relaunch, independently of the iPhone app.
//
// ponytail: this is a standalone watchOS app (WKWatchOnly), not a WatchKit extension bundled
// inside the iOS app, and charwork/ios carries no App Group entitlement today — so there is
// no shared container to read or write. Rather than fabricate a pairing/sync UI for a backend
// that doesn't exist, this mirrors ios/App/Store.swift exactly: one plain .txt file in this
// app's own Application Support directory.

import Foundation

enum Store {
    private static let filename = "canvas.txt"

    private static var fileURL: URL? {
        guard let dir = try? FileManager.default.url(
            for: .applicationSupportDirectory, in: .userDomainMask,
            appropriateFor: nil, create: true
        ) else { return nil }
        return dir.appendingPathComponent(filename)
    }

    static func load() -> Grid? {
        guard let url = fileURL,
              let text = try? String(contentsOf: url, encoding: .utf8),
              !text.isEmpty else { return nil }
        return textToGrid(text)
    }

    static func save(_ text: String) {
        guard let url = fileURL else { return }
        try? text.write(to: url, atomically: true, encoding: .utf8)
    }
}

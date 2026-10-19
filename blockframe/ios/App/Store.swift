// On-device persistence: the canvas survives relaunch.
//
// ponytail: one plain .txt file in Application Support, not a DocumentGroup —
// the app edits exactly one canvas, and the document IS its text export.

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

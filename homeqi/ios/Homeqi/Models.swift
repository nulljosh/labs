import Foundation

struct Chapter: Identifiable {
    let id = UUID()
    let title: String
    let body: String
}

enum ContentStore {
    static let chapters: [Chapter] = {
        guard let url = Bundle.main.url(forResource: "content", withExtension: "md"),
              let text = try? String(contentsOf: url, encoding: .utf8) else { return [] }
        return parse(text)
    }()

    // ponytail: splits on top-level "# " headings only; book has no deeper nesting that matters here
    static func parse(_ text: String) -> [Chapter] {
        let lines = text.components(separatedBy: "\n")
        var chapters: [Chapter] = []
        var currentTitle: String?
        var currentBody: [String] = []

        func flush() {
            guard let title = currentTitle else { return }
            chapters.append(Chapter(title: title, body: currentBody.joined(separator: "\n")))
        }

        for line in lines {
            if line.hasPrefix("# ") {
                flush()
                currentTitle = String(line.dropFirst(2))
                currentBody = []
            } else if line != "---" {
                currentBody.append(line)
            }
        }
        flush()
        return chapters
    }
}

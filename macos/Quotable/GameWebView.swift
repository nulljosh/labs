import SwiftUI
import WebKit

enum GameResourceError: Error {
    case missingIndexHTML
}

enum GameResource {
    static func indexURL(in bundle: Bundle = .main) throws -> URL {
        guard let url = bundle.url(forResource: "index", withExtension: "html", subdirectory: "Resources") else {
            throw GameResourceError.missingIndexHTML
        }
        return url
    }
}

struct GameWebView: NSViewRepresentable {
    func makeNSView(context: Context) -> WKWebView {
        let webView = WKWebView()
        do {
            let url = try GameResource.indexURL()
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        } catch {
            webView.loadHTMLString("<body style='font-family:-apple-system;padding:2em'>Failed to load game resources.</body>", baseURL: nil)
        }
        return webView
    }

    func updateNSView(_ nsView: WKWebView, context: Context) {}
}

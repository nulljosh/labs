import SwiftUI
import WebKit

@main
struct WiretextApp: App {
    var body: some Scene {
        WindowGroup {
            WebView()
                .ignoresSafeArea()
        }
    }
}

// ponytail: serves the bundled web build over a custom scheme instead of file://
// — ES module scripts are blocked cross-origin under file://, this sidesteps that.
final class BundleSchemeHandler: NSObject, WKURLSchemeHandler {
    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let url = task.request.url,
              let webRoot = Bundle.main.url(forResource: "web", withExtension: nil) else {
            task.didFailWithError(URLError(.fileDoesNotExist))
            return
        }
        let relativePath = url.path == "/" ? "/index.html" : url.path
        let fileURL = webRoot.appendingPathComponent(relativePath)

        guard let data = try? Data(contentsOf: fileURL) else {
            task.didFailWithError(URLError(.fileDoesNotExist))
            return
        }
        let mimeType = mimeType(for: fileURL.pathExtension)
        let response = URLResponse(url: url, mimeType: mimeType, expectedContentLength: data.count, textEncodingName: "utf-8")
        task.didReceive(response)
        task.didReceive(data)
        task.didFinish()
    }

    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}

    private func mimeType(for ext: String) -> String {
        switch ext {
        case "html": return "text/html"
        case "js": return "application/javascript"
        case "css": return "text/css"
        case "svg": return "image/svg+xml"
        case "json": return "application/json"
        case "woff2": return "font/woff2"
        default: return "application/octet-stream"
        }
    }
}

struct WebView: UIViewRepresentable {
    let schemeHandler = BundleSchemeHandler()

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.setURLSchemeHandler(schemeHandler, forURLScheme: "app")

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.scrollView.bounces = false
        webView.scrollView.pinchGestureRecognizer?.isEnabled = false
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.102, green: 0.102, blue: 0.102, alpha: 1)

        if let url = URL(string: "app://localhost/index.html") {
            webView.load(URLRequest(url: url))
        }
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

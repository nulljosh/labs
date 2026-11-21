// Renders banner.html to PNG frames with WebKit (Chrome headless hangs on this Mac).
// Usage: swift render.swift <width> <height> <fps> <outdir>
// Then: ffmpeg -framerate <fps> -i <outdir>/%05d.png ...  (see make.sh)
import AppKit
import WebKit

let args = CommandLine.arguments
let W = Int(args[1])!, H = Int(args[2])!, FPS = Double(args[3])!, outDir = args[4]
let here = URL(fileURLWithPath: FileManager.default.currentDirectoryPath, isDirectory: true)   // run from launch/banner
try? FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)

final class Renderer: NSObject, WKNavigationDelegate {
    let web: WKWebView
    var frame = 0, total = 0

    override init() {
        let cfg = WKWebViewConfiguration()
        web = WKWebView(frame: NSRect(x: 0, y: 0, width: W, height: H), configuration: cfg)
        super.init()
        web.navigationDelegate = self
        let page = here.appendingPathComponent("banner.html")
        let url = URL(string: page.absoluteString + "?w=\(W)&h=\(H)&still=1")!
        web.loadFileURL(url, allowingReadAccessTo: here)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        web.evaluateJavaScript("Promise.all([...document.images].map(i => i.decode())).then(() => DURATION)") { _, _ in }
        // evaluateJavaScript can't await a promise on macOS 13; wait for images, then read DURATION.
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.web.evaluateJavaScript("DURATION") { v, _ in
                self.total = Int(((v as? Double) ?? 0) * FPS)
                self.next()
            }
        }
    }

    func next() {
        guard frame < total else { print("rendered \(total) frames"); exit(0) }
        let t = Double(frame) / FPS
        web.evaluateJavaScript("seek(\(t)); document.body.offsetHeight") { _, _ in
            let cfg = WKSnapshotConfiguration()
            cfg.snapshotWidth = NSNumber(value: Double(W) / (NSScreen.main?.backingScaleFactor ?? 1))
            self.web.takeSnapshot(with: cfg) { img, err in
                guard let img, let tiff = img.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
                      let png = rep.representation(using: .png, properties: [:]) else { print("snapshot failed: \(String(describing: err))"); exit(1) }
                try! png.write(to: URL(fileURLWithPath: String(format: "%@/%05d.png", outDir, self.frame)))
                self.frame += 1
                if self.frame % 60 == 0 { print("frame \(self.frame)/\(self.total)") }
                self.next()
            }
        }
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let window = NSWindow(contentRect: NSRect(x: -10000, y: -10000, width: W, height: H), styleMask: [.borderless], backing: .buffered, defer: false)
let r = Renderer()
window.contentView = r.web
window.orderBack(nil)
app.run()

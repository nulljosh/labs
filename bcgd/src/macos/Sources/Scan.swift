import SwiftUI
import PhotosUI
import Vision
import ImageIO

// MARK: - Snap a label: read the text on a box or tag, then open the part it names, or a new one filled in.

enum LabelScan {
    /// Text lines Vision finds in the picture, best guess first per line.
    static func lines(in image: CGImage) async -> [String] {
        await Task.detached {
            let request = VNRecognizeTextRequest()
            request.recognitionLevel = .accurate
            try? VNImageRequestHandler(cgImage: image).perform([request])
            return (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }
        }.value
    }

    /// Upright and at most 2000 px, from photo-library data (keeps the EXIF turn).
    static func image(from data: Data) -> CGImage? {
        guard let src = CGImageSourceCreateWithData(data as CFData, nil) else { return nil }
        let opts: [CFString: Any] = [kCGImageSourceCreateThumbnailFromImageAlways: true,
                                     kCGImageSourceCreateThumbnailWithTransform: true,
                                     kCGImageSourceThumbnailMaxPixelSize: 2000]
        return CGImageSourceCreateThumbnailAtIndex(src, 0, opts as CFDictionary)
    }

    /// The existing part this label is for, with any spring specs it was missing filled in,
    /// or a new part built from what the label says.
    static func part(from lines: [String], in parts: [Part]) -> Part {
        let text = lines.joined(separator: " ").uppercased()
        let read = parse(text)
        if let hit = match(read, text: text, in: parts) {
            var p = hit
            p.wire = p.wire ?? read.wire
            p.insideDiameter = p.insideDiameter ?? read.insideDiameter
            p.length = p.length ?? read.length
            p.wind = p.wind ?? read.wind
            return p
        }
        var p = read
        let size = [read.wire.map(Part.wireText), read.insideDiameter.map(Part.inches), read.length.map(Part.inches)].compactMap { $0 }
        p.name = size.count == 3 ? (["Torsion Spring", size.joined(separator: " x ")] + [read.wind?.rawValue].compactMap { $0 }).joined(separator: " ")
            : lines.first { $0.count >= 3 && $0.contains(where: \.isLetter) }.map { String($0.prefix(60)) } ?? ""
        return p
    }

    /// Category and spring specs found in upper-cased label text. Quantity 0, name empty.
    static func parse(_ t: String) -> Part {
        var p = Part(name: "", category: "", quantity: 0)
        let num = #"(\d+(?:-\d+/\d+|\.\d+)?)"#   // 2, 1.75, 1-3/4
        // ".225 x 2 x 24", "225-1-3/4-24", ".250 X 2\" X 30\""
        if let m = first(#"\.?(\d{3})\s*["]?\s*[X×*-]\s*"# + num + #"\s*["]?\s*[X×*-]\s*(\d+(?:\.\d+)?)"#, t) {
            p.wire = wire(m[0]); p.insideDiameter = inches(m[1]); p.length = Double(m[2])
        }
        p.wire = p.wire ?? first(#"WIRE\D{0,8}\.?(\d{3})"#, t).flatMap { wire($0[0]) } ?? first(#"(?<![\d.])0?\.(\d{3})(?!\d)"#, t).flatMap { wire($0[0]) }
        p.insideDiameter = p.insideDiameter ?? first(num + #"\s*(?:"|IN\b|INCH)?\s*(?:ID\b|I\.D\.)"#, t).flatMap { inches($0[0]) }
            ?? first(#"(?:ID|I\.D\.|INSIDE DIAMETER)\W{0,3}"# + num, t).flatMap { inches($0[0]) }
        p.length = p.length ?? first(#"(?:LENGTH|LEN)\W{0,3}(\d+(?:\.\d+)?)"#, t).flatMap { Double($0[0]) }
            ?? first(#"(\d+(?:\.\d+)?)\s*(?:"|IN\b|INCH(?:ES)?)?\s*(?:LONG|LENGTH)"#, t).flatMap { Double($0[0]) }
        if let w = first(#"\b(LH|RH|LEFT|RIGHT)\b"#, t)?[0] { p.wind = w.hasPrefix("L") ? Wind.left : Wind.right }
        let kinds = [("SPRING", "Springs"), ("CABLE", "Cables"), ("ROLLER", "Rollers"), ("PANEL", "Panels"), ("SECTION", "Panels"),
                     ("OPENER", "Openers"), ("LIFTMASTER", "Openers"), ("CHAMBERLAIN", "Openers"), ("GENIE", "Openers"),
                     ("WEATHER", "Seals"), ("SEAL", "Seals"), ("HINGE", "Hardware"), ("BRACKET", "Hardware")]
        p.category = kinds.first { t.contains($0.0) }?.1 ?? (p.wire != nil && p.length != nil ? "Springs" : "")
        return p
    }

    /// A spring with the same specs, else the part whose name words all appear on the label (most words wins).
    static func match(_ read: Part, text: String, in parts: [Part]) -> Part? {
        if read.wire != nil && read.length != nil {
            let same = parts.filter { fits(read, $0) }
            if let hit = same.first(where: { $0.wind == read.wind }) ?? same.first { return hit }
        }
        let seen = Set(words(text))
        var best: (part: Part, count: Int)?
        for part in parts {
            let need = words(part.name.uppercased())
            guard need.count >= 2, need.allSatisfy(seen.contains), need.count > (best?.count ?? 0) else { continue }
            best = (part, need.count)
        }
        return best?.part
    }

    /// Same wire and length; diameter and wind only have to agree when both sides know them.
    private static func fits(_ read: Part, _ p: Part) -> Bool {
        guard p.wire == read.wire, p.length == read.length else { return false }
        if let a = read.insideDiameter, let b = p.insideDiameter, a != b { return false }
        if let a = read.wind, let b = p.wind, a != b { return false }
        return true
    }

    private static func words(_ s: String) -> [String] {
        s.split { !$0.isLetter && !$0.isNumber && $0 != "-" }.map(String.init).filter { $0.count >= 2 }
    }

    private static func wire(_ digits: String) -> Double? {
        Double("0." + digits).flatMap { (0.1...0.75).contains($0) ? $0 : nil }
    }

    /// "1-3/4" → 1.75, "2.625" → 2.625; nil outside the sizes springs come in.
    private static func inches(_ s: String) -> Double? {
        var v: Double?
        if let dash = s.firstIndex(of: "-"), let slash = s.firstIndex(of: "/"),
           let whole = Double(s[..<dash]), let n = Double(s[s.index(after: dash)..<slash]), let d = Double(s[s.index(after: slash)...]), d > 0 {
            v = whole + n / d
        } else { v = Double(s) }
        return v.flatMap { (1...8).contains($0) ? $0 : nil }
    }

    private static func first(_ pattern: String, _ text: String) -> [String]? {
        guard let re = try? NSRegularExpression(pattern: pattern),
              let m = re.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)) else { return nil }
        return (1..<m.numberOfRanges).map { Range(m.range(at: $0), in: text).map { String(text[$0]) } ?? "" }
    }
}

/// Toolbar button: camera on an iPhone, photo library on a Mac or a phone without a camera.
struct ScanButton: View {
    @Environment(Store.self) private var store
    let found: (Part) -> Void
    @State private var picking = false
    @State private var item: PhotosPickerItem?
    @State private var reading = false
    @State private var unreadable = false
    #if os(iOS)
    @State private var shooting = false
    #endif

    var body: some View {
        Button { start() } label: {
            if reading { ProgressView() } else { Label("Scan a label", systemImage: "camera") }
        }
        .disabled(reading)
        .photosPicker(isPresented: $picking, selection: $item, matching: .images)
        .onChange(of: item) {
            guard let item else { return }
            self.item = nil
            Task { await read { try? await item.loadTransferable(type: Data.self).flatMap(LabelScan.image) } }
        }
        #if os(iOS)
        .fullScreenCover(isPresented: $shooting) {
            CameraPicker { photo in Task { await read { photo.upright() } } }.ignoresSafeArea()
        }
        #endif
        .alert("Couldn't read that label", isPresented: $unreadable) {} message: { Text("Get closer and make sure the text is in focus.") }
    }

    private func start() {
        #if os(iOS)
        if UIImagePickerController.isSourceTypeAvailable(.camera) { shooting = true; return }
        #endif
        picking = true
    }

    private func read(_ load: () async -> CGImage?) async {
        reading = true
        defer { reading = false }
        guard let image = await load() else { unreadable = true; return }
        let lines = await LabelScan.lines(in: image)
        if lines.isEmpty { unreadable = true; return }
        found(LabelScan.part(from: lines, in: store.parts))
    }
}

#if os(iOS)
struct CameraPicker: UIViewControllerRepresentable {
    let taken: (UIImage) -> Void
    @Environment(\.dismiss) private var dismiss

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ picker: UIImagePickerController, context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator(self) }

    final class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: CameraPicker
        init(_ parent: CameraPicker) { self.parent = parent }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let photo = info[.originalImage] as? UIImage { parent.taken(photo) }
            parent.dismiss()
        }
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) { parent.dismiss() }
    }
}

extension UIImage {
    /// Redrawn the right way up at most 2000 px, so Vision reads it as the user saw it.
    func upright() -> CGImage? {
        let scale = min(1, 2000 / max(size.width, size.height))
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        return UIGraphicsImageRenderer(size: CGSize(width: size.width * scale, height: size.height * scale), format: format)
            .image { _ in draw(in: CGRect(origin: .zero, size: CGSize(width: size.width * scale, height: size.height * scale))) }
            .cgImage
    }
}
#endif

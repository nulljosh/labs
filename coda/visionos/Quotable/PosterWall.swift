import RealityKit
import SwiftUI

/// The poster wall around you (v35): three rings of real movie posters from the bank at eye level,
/// three metres out, the same art that drifts behind the game on the web. Open it from the menu.
struct PosterWall: View {
    static let id = "PosterWall"
    private static let columns = 24, rows = [1.0, 1.6, 2.2], radius: Float = 3.2

    var body: some View {
        RealityView { content in
            let root = Entity()
            content.add(root)
            let urls = Array(Set(Quote.loadBundled().compactMap { $0.art }.filter { $0.host()?.contains("tmdb") == true }))
                .shuffled().prefix(Self.columns * Self.rows.count)
            for (i, url) in urls.enumerated() {
                let row = i / Self.columns, step = 2 * Float.pi / Float(Self.columns)
                let stagger: Float = row.isMultiple(of: 2) ? 0 : step / 2   // brick-lay the rows
                let angle = Float(i % Self.columns) * step + stagger
                let p = SIMD3<Float>(Self.radius * sin(angle), Float(Self.rows[row]), -Self.radius * cos(angle))
                let poster = ModelEntity(mesh: .generatePlane(width: 0.5, height: 0.75, cornerRadius: 0.02))
                poster.position = p
                // Face the middle: look away from it, so the plane's front (+Z) turns inward.
                poster.look(at: p + SIMD3(p.x, 0, p.z), from: p, relativeTo: nil)
                root.addChild(poster)
                Task { await Self.paint(poster, from: url) }
            }
        }
    }

    /// Fetch a poster at thumbnail size and put it on its plane; a failed fetch leaves no plane.
    private static func paint(_ poster: ModelEntity, from url: URL) async {
        let small = URL(string: url.absoluteString.replacingOccurrences(of: "/w500/", with: "/w342/")) ?? url
        guard let (data, _) = try? await URLSession.shared.data(from: small),
              let source = CGImageSourceCreateWithData(data as CFData, nil),
              let image = CGImageSourceCreateImageAtIndex(source, 0, nil),
              let texture = try? await TextureResource(image: image, options: .init(semantic: .color)) else {
            await MainActor.run { poster.removeFromParent() }
            return
        }
        var material = UnlitMaterial()
        material.color = .init(texture: .init(texture))
        await MainActor.run { poster.model?.materials = [material] }
    }
}

/// The menu's way in and out of the wall.
struct PosterWallButton: View {
    @Environment(\.openImmersiveSpace) private var open
    @Environment(\.dismissImmersiveSpace) private var dismiss
    @State private var inside = false

    var body: some View {
        Button(inside ? "Leave the poster wall" : "Step into the poster wall") {
            Task {
                if inside { await dismiss(); inside = false }
                else { inside = await open(id: PosterWall.id) == .opened }
            }
        }
        .buttonStyle(SecondaryButtonStyle())
    }
}

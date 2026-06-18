import SpriteKit

@MainActor
final class BuildingNode: SKSpriteNode {
    let buildingId: UUID
    let buildingType: BuildingType
    private var progressBar: SKShapeNode?

    init(model: ProductionBuilding, tileSize: CGFloat) {
        self.buildingId = model.id
        self.buildingType = model.type
        let ts = model.type.tileSize
        let size = CGSize(width: CGFloat(ts.w) * tileSize, height: CGFloat(ts.h) * tileSize)
        let tex = SKTexture(imageNamed: model.type.rawValue)
        tex.filteringMode = .nearest
        super.init(texture: tex, color: .clear, size: size)
        self.anchorPoint = CGPoint(x: 0, y: 0)
        self.zPosition = 5
        self.name = "building_\(model.id.uuidString)"
        setupProgressBar(tileSize: tileSize)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError() }

    private func setupProgressBar(tileSize: CGFloat) {
        let barWidth = tileSize - 4
        let barHeight = CGFloat(4)
        let bar = SKShapeNode(rect: CGRect(x: 2, y: -barHeight - 2, width: barWidth, height: barHeight))
        bar.fillColor = .green
        bar.strokeColor = .clear
        bar.zPosition = 10
        addChild(bar)
        progressBar = bar
        progressBar?.isHidden = true
    }

    func updateProgress(_ progress: Double) {
        guard let bar = progressBar else { return }
        let barWidth = size.width - 4
        let newWidth = barWidth * progress
        bar.path = UIBezierPath(rect: CGRect(x: 2, y: -6, width: newWidth, height: 4)).cgPath
        bar.isHidden = progress == 0
    }

    func playPlaceAnimation() {
        setScale(0.1)
        run(SKAction.scale(to: 1.0, duration: 0.2))
        run(SKAction.sequence([
            SKAction.fadeAlpha(to: 0.5, duration: 0.1),
            SKAction.fadeAlpha(to: 1.0, duration: 0.1)
        ]))
    }
}

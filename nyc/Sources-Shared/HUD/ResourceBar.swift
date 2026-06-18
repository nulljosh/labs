import SwiftUI

struct ResourceBar: View {
    let gameState: GameState

    var body: some View {
        HStack(spacing: 4) {
            ForEach(ItemType.allCases, id: \.self) { type in
                itemPill(type: type)
            }
            Spacer()
            Text("\(gameState.buildings.count) buildings")
                .font(.system(size: 11, weight: .bold))
                .foregroundStyle(Theme.text2)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: Theme.radiusLg))
        .overlay(RoundedRectangle(cornerRadius: Theme.radiusLg).stroke(Theme.border, lineWidth: 1))
    }

    private func itemPill(type: ItemType) -> some View {
        let amount = gameState.globalInventory[type, default: 0]
        let color: Color = amount > 0 ? Theme.green : Theme.text3

        return HStack(spacing: 4) {
            Text(type.symbol)
                .font(.system(size: 10, weight: .semibold, design: .monospaced))
                .foregroundStyle(color)
            Text("\(amount)")
                .font(.system(size: 12, weight: .semibold, design: .monospaced))
                .foregroundStyle(Theme.text1)
            Text(type.displayName)
                .font(.system(size: 9, weight: .medium, design: .monospaced))
                .foregroundStyle(Theme.text3)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 3)
        .background(Capsule().fill(Theme.glass).overlay(Capsule().stroke(Theme.border, lineWidth: 0.5)))
    }
}

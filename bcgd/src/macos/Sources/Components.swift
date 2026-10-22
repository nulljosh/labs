import SwiftUI

// MARK: - Building blocks (8 point grid; one radius for every card)

extension Color {
    #if os(macOS)
    static let page = Color(nsColor: .windowBackgroundColor)
    static let card = Color(nsColor: .quaternarySystemFill)
    #else
    static let page = Color(uiColor: .systemGroupedBackground)
    static let card = Color(uiColor: .secondarySystemGroupedBackground)
    #endif
}

enum Grid {
    static let tiles = [GridItem(.adaptive(minimum: 170), spacing: 12)]
    static let cards = [GridItem(.adaptive(minimum: 220), spacing: 12)]
}

extension View {
    func cardBackground() -> some View {
        padding(16).background(Color.card, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
    }
}

struct StatTile: View {
    let label: String
    let value: Int
    let symbol: String
    var alert = false

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Image(systemName: symbol)
                .font(.title3)
                .foregroundStyle(alert ? Color.red : Color.doorstock)
                .padding(.bottom, 12)
            Text("\(value)")
                .font(.system(size: 34, weight: .bold, design: .rounded))
                .monospacedDigit()
            Text(label).font(.subheadline).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
    }
}

struct Shelf<Content: View>: View {
    let title: String
    let symbol: String
    @ViewBuilder let content: Content

    init(_ title: String, symbol: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.symbol = symbol
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label(title, systemImage: symbol).font(.headline)
            content
        }
    }
}

struct EmptyTile: View {
    let symbol: String
    let text: String

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: symbol).font(.title2).foregroundStyle(.tertiary)
            Text(text).font(.subheadline).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .cardBackground()
    }
}

struct RoundIcon: View {
    let symbol: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.footnote.weight(.bold))
                .frame(width: 32, height: 32)
                .background(Color.doorstock.opacity(0.12), in: Circle())
                .foregroundStyle(Color.doorstock)
        }
        .buttonStyle(.plain)
    }
}

struct ActionTile: View {
    let title: String
    let symbol: String
    var tint = Color.doorstock

    init(_ title: String, symbol: String, tint: Color = .doorstock) {
        self.title = title
        self.symbol = symbol
        self.tint = tint
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Image(systemName: symbol).font(.title2).foregroundStyle(tint)
            Text(title).font(.subheadline.weight(.medium)).foregroundStyle(Color.primary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
        .contentShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
    }
}

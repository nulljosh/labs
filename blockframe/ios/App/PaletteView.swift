// Component palette, grouped by category.

import SwiftUI

struct PaletteView: View {
    @Binding var selection: Preset?
    @Binding var erasing: Bool

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(alignment: .top, spacing: 24) {
                ForEach(presetCategories, id: \.self) { category in
                    categoryColumn(category)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 14)
        }
        .background(Theme.background)
    }

    private func categoryColumn(_ category: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(category.uppercased())
                .font(.caption2)
                .tracking(1.2)
                .foregroundStyle(Theme.muted)

            HStack(spacing: 8) {
                ForEach(presets.filter { $0.category == category }) { preset in
                    chip(preset)
                }
            }
        }
    }

    private func chip(_ preset: Preset) -> some View {
        let isSelected = !erasing && selection?.id == preset.id
        return Button {
            erasing = false
            selection = isSelected ? nil : preset
        } label: {
            Text(preset.label)
                .font(.subheadline)
                .foregroundStyle(isSelected ? Color.white : Theme.ink)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(isSelected ? Theme.accent : Theme.canvas,
                            in: Capsule())
                .overlay(Capsule().strokeBorder(Theme.rule, lineWidth: isSelected ? 0 : 1))
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(preset.label), \(preset.width) by \(preset.height) characters")
        .accessibilityAddTraits(isSelected ? [.isSelected] : [])
    }
}

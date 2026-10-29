import SwiftUI

/// Wraps its children into rows. With `window` set it shows only that many rows and scrolls so the
/// active child's row is second from the top, like the web test's 3-line window.
struct Flow: Layout {
    var hSpacing: CGFloat = 4
    var vSpacing: CGFloat = 4
    var centered = false
    var window: (active: Int, rows: Int)?

    private func rows(_ subviews: Subviews, _ width: CGFloat) -> [[Int]] {
        var out: [[Int]] = [[]]
        var x: CGFloat = 0
        for (i, s) in subviews.enumerated() {
            let w = s.sizeThatFits(.unspecified).width
            if x > 0 && x + w > width { out.append([]); x = 0 }
            out[out.count - 1].append(i)
            x += w + hSpacing
        }
        return out
    }

    private func rowHeight(_ subviews: Subviews) -> CGFloat {
        subviews.map { $0.sizeThatFits(.unspecified).height }.max() ?? 0
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width ?? 0
        let h = rowHeight(subviews)
        let n = window?.rows ?? rows(subviews, width).count
        return CGSize(width: width, height: CGFloat(n) * h + CGFloat(max(0, n - 1)) * vSpacing)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let h = rowHeight(subviews)
        let all = rows(subviews, bounds.width)
        var top = 0
        if let window, let r = all.firstIndex(where: { $0.contains(window.active) }) { top = max(0, r - 1) }
        for (r, row) in all.enumerated() {
            let widths = row.map { subviews[$0].sizeThatFits(.unspecified).width }
            let used = widths.reduce(0, +) + CGFloat(max(0, row.count - 1)) * hSpacing
            var x = bounds.minX + (centered ? (bounds.width - used) / 2 : 0)
            let y = bounds.minY + CGFloat(r - top) * (h + vSpacing)
            for (k, i) in row.enumerated() {
                subviews[i].place(at: CGPoint(x: x, y: y), anchor: .topLeading, proposal: .unspecified)
                x += widths[k] + hSpacing
            }
        }
    }
}

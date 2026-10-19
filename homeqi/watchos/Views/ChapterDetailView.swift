import SwiftUI

struct ChapterDetailView: View {
    let chapter: Chapter

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 10) {
                ForEach(Array(blocks.enumerated()), id: \.offset) { _, block in
                    render(block)
                }
            }
            .padding(.horizontal, 4)
        }
        .navigationTitle(chapter.title)
    }

    private var blocks: [String] {
        chapter.body
            .components(separatedBy: "\n\n")
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
    }

    @ViewBuilder
    private func render(_ block: String) -> some View {
        if block.hasPrefix("## ") {
            Text(markdown(String(block.dropFirst(3))))
                .font(.headline)
                .padding(.top, 6)
        } else if block.hasPrefix("### ") {
            Text(markdown(String(block.dropFirst(4))))
                .font(.subheadline.bold())
        } else {
            Text(markdown(block))
                .font(.footnote)
        }
    }

    private func markdown(_ s: String) -> AttributedString {
        (try? AttributedString(markdown: s)) ?? AttributedString(s)
    }
}

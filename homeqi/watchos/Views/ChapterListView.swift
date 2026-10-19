import SwiftUI

struct ChapterListView: View {
    var body: some View {
        NavigationStack {
            List(ContentStore.chapters) { chapter in
                NavigationLink(chapter.title) {
                    ChapterDetailView(chapter: chapter)
                }
            }
            .navigationTitle("Homeqi")
        }
    }
}

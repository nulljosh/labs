import SwiftUI
import SafariServices
import SwiftData

struct CaseDetailView: View {
    let result: CanLIICase
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        SafariView(url: caseURL)
            .navigationTitle(result.title)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        let bookmark = Bookmark(caseId: result.id, title: result.title, citation: result.citation)
                        modelContext.insert(bookmark)
                    } label: {
                        Image(systemName: "bookmark")
                    }
                }
            }
    }

    private var caseURL: URL {
        URL(string: "https://www.canlii.org/en/\(result.id)")!
    }
}

struct SafariView: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> SFSafariViewController {
        SFSafariViewController(url: url)
    }

    func updateUIViewController(_ controller: SFSafariViewController, context: Context) {}
}

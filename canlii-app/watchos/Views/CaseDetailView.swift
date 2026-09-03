import SwiftUI

// No SFSafariViewController on watchOS -- the iOS app opens full decisions in a Safari
// view (ios/CanLII/Views/CaseDetailView.swift) against canlii.org, the authoritative,
// paginated, citation-stable source (see WHITEPAPER.md "Clients"). Same reasoning holds
// here: the watch shows only what the search API actually returned (title, citation) and
// hands the full decision off to the paired iPhone via Link rather than re-rendering it.
struct CaseDetailView: View {
    let result: CanLIICase
    let court: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 8) {
                if let court {
                    Text(court.uppercased())
                        .font(.system(size: 9, weight: .bold))
                        .foregroundStyle(.secondary)
                }

                Text(result.title)
                    .font(.headline)
                    .fixedSize(horizontal: false, vertical: true)

                if let citation = result.citation {
                    Text(citation)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Divider()

                Link(destination: caseURL) {
                    Label("Open full decision", systemImage: "arrow.up.right")
                        .font(.caption)
                }
            }
            .padding(.horizontal, 4)
        }
        .navigationTitle("Case")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var caseURL: URL {
        URL(string: "https://www.canlii.org/en/\(result.id)")!
    }
}

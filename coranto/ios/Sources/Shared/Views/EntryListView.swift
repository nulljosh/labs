import SwiftUI

struct EntryListView: View {
    @StateObject private var feed: JournalFeedService
    @StateObject private var store: FeedStore
    @State private var path: [JournalEntry] = []

    /// Both default to the real thing; the parameters exist so the macOS screenshot capture can
    /// hand in a pre-loaded service and a trimmed feed list without writing to the user's saved
    /// subscriptions. No caller in the app passes either.
    init(feed: JournalFeedService? = nil, store: FeedStore? = nil) {
        _feed = StateObject(wrappedValue: feed ?? JournalFeedService())
        _store = StateObject(wrappedValue: store ?? FeedStore())
    }

    // `-tab 1` on the launch line opens a tab for screenshots; launch args are never persisted.
    @State private var tab = UserDefaults.standard.integer(forKey: "tab")
    #if os(iOS)
    @Environment(\.horizontalSizeClass) private var sizeClass
    #endif

    var body: some View {
        TabView(selection: $tab) {
            Group {
                NavigationStack(path: $path) { home }
                    .tabItem { Label("Home", systemImage: "newspaper") }.tag(0)
                ManageFeedsView(store: store)
                    .tabItem { Label("Feeds", systemImage: "list.bullet.rectangle") }.tag(1)
                SettingsView()
                    .tabItem { Label("Settings", systemImage: "gearshape") }.tag(2)
            }
            #if os(iOS)
            .environment(\.horizontalSizeClass, sizeClass)
            #endif
        }
        #if os(iOS)
        // iPad puts tabs at the top in regular width; compact keeps the bar at the bottom.
        .environment(\.horizontalSizeClass, .compact)
        #endif
        .task(id: store.feeds) {
            await feed.refresh(feeds: store.feeds)
            // ponytail: store screenshot hook so a frame can open on an article
            if CommandLine.arguments.contains("-selectFirst"), let first = feed.entries.first { path = [first] }
        }
    }

    private var home: some View {
        List(feed.entries) { entry in
            NavigationLink(value: entry) {
                HStack(spacing: 12) {
                    EntryThumbnail(url: entry.imageURL, page: entry.url, source: entry.sourceTitle)
                    VStack(alignment: .leading, spacing: 4) {
                        FittedTitle(variants: Headline.variants(entry.title, source: entry.sourceTitle))
                        HStack(spacing: 6) {
                            if !entry.sourceTitle.isEmpty {
                                Text(entry.sourceTitle).fontWeight(.medium)
                                Text("·")
                            }
                            Text(entry.date.formatted(date: .abbreviated, time: .omitted))
                        }
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 6)
            }
        }
        .listStyle(.plain)   // flush with the view, like Mail and News
        .refreshable { await feed.refresh(feeds: store.feeds) }
        .overlay {
            if feed.entries.isEmpty && feed.isLoading {
                ProgressView()
            } else if feed.entries.isEmpty {
                ContentUnavailableView("No entries yet", systemImage: "doc.text", description: Text("Add a feed or pull to refresh"))
            }
        }
        .navigationTitle("Coranto")   // still names the back button and the Mac window
        #if os(iOS)
        .toolbar(.hidden, for: .navigationBar)   // the tab bar already says Home; stories start at the top
        #endif
        .navigationDestination(for: JournalEntry.self) { EntryDetailView(entry: $0) }
    }
}

/// The longest headline variant that fits on one line, so titles end on a word, not "…". The last child is the
/// shortest variant allowed to truncate, for a window too narrow even for that.
private struct FittedTitle: View {
    let variants: [String]

    var body: some View {
        ViewThatFits(in: .horizontal) {
            ForEach(variants, id: \.self) { Text($0).font(.headline).lineLimit(1).fixedSize(horizontal: true, vertical: false) }
            Text(variants.last ?? "").font(.headline).lineLimit(1)
        }
    }
}

/// Every row gets the same square, so the list lines up: the story's image when it has one, otherwise the outlet's
/// initials on a blue tile (Joshua 2026-10-25: a mix of rows with and without thumbnails looked funny).
private struct EntryThumbnail: View {
    let url: URL?
    let page: String
    let source: String
    @State private var preview: URL?
    private let side: CGFloat = 56

    var body: some View {
        Group {
            if let url = url ?? preview {
                AsyncImage(url: url) { phase in
                    if case .success(let image) = phase { image.resizable().aspectRatio(contentMode: .fill) } else { monogram }
                }
            } else {
                monogram
            }
        }
        .frame(width: side, height: side)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        // no image in the feed: ask the article page for its preview image before settling on initials
        .task(id: page) { if url == nil { preview = await PreviewImage.lookup(page) } }
    }

    private var monogram: some View {
        ZStack {
            Color.corantoAccent.opacity(0.12)
            Text(Self.initials(source)).font(.system(size: 17, weight: .bold)).foregroundStyle(Color.corantoAccent)
        }
    }

    /// "BBC" stays BBC; "Hacker News" is HN; "The Province" is P. Mirrors `initials` in web/read.html.
    static func initials(_ source: String) -> String {
        let trimmed = source.trimmingCharacters(in: .whitespaces)
        if trimmed.count <= 4, trimmed == trimmed.uppercased(), !trimmed.isEmpty { return trimmed }
        let words = trimmed.split(separator: " ").filter { $0.lowercased() != "the" }
        let letters = words.prefix(2).compactMap(\.first).map { String($0).uppercased() }.joined()
        return letters.isEmpty ? "C" : letters
    }
}

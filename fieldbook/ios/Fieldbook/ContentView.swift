import SwiftUI

// Shared by iOS and macOS. Sidebar of domains, detail per field, read state in AppStorage.

enum DomainIcon {
    static func symbol(_ domain: String) -> String {
        switch domain {
        case "Physics": return "atom"
        case "Chemistry": return "flask"
        case "Biology": return "leaf"
        case "Anatomy & Physiology": return "heart"
        case "Earth & Space": return "globe.americas"
        case "Mathematics": return "function"
        case "Computing": return "cpu"
        case "Mind & Society": return "brain.head.profile"
        default: return "gearshape"
        }
    }
}

@Observable
final class ReadStore {
    private(set) var read: Set<String>
    private let key = "fieldbook.read"

    init() {
        read = Set(UserDefaults.standard.stringArray(forKey: key) ?? [])
    }

    func toggle(_ name: String) {
        if read.contains(name) { read.remove(name) } else { read.insert(name) }
        UserDefaults.standard.set(Array(read), forKey: key)
    }
}

struct ContentView: View {
    @State private var store = ReadStore()
    @State private var selection: Field? = allFields.first
    @State private var query = ""

    private var domains: [String] {
        var seen: [String] = []
        for f in allFields where !seen.contains(f.domain) { seen.append(f.domain) }
        return seen
    }

    private func fields(in domain: String) -> [Field] {
        allFields.filter { $0.domain == domain && matches($0) }
    }

    private func matches(_ f: Field) -> Bool {
        let q = query.trimmingCharacters(in: .whitespaces).lowercased()
        return q.isEmpty || f.name.lowercased().contains(q) || f.body.lowercased().contains(q) || f.gap.lowercased().contains(q)
    }

    var body: some View {
        NavigationSplitView {
            sidebar
        } detail: {
            if let f = selection { detail(f) } else { Text("Pick a field").foregroundStyle(.secondary) }
        }
    }

    private var sidebar: some View {
        List(selection: $selection) {
            ForEach(domains, id: \.self) { d in
                Section {
                    ForEach(fields(in: d)) { f in
                        FieldRow(field: f, read: store.read.contains(f.name)).tag(f)
                    }
                } header: {
                    Label(d, systemImage: DomainIcon.symbol(d))
                }
            }
        }
        .navigationTitle("Fieldbook")
        .searchable(text: $query, prompt: "Search fields")
        .safeAreaInset(edge: .bottom) {
            Text("\(store.read.count) of \(allFields.count) read")
                .font(.footnote).foregroundStyle(.secondary)
                .frame(maxWidth: .infinity).padding(8)
                .background(.bar)
        }
    }

    private func detail(_ f: Field) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Label(f.domain, systemImage: DomainIcon.symbol(f.domain))
                    .font(.footnote.weight(.medium)).foregroundStyle(.secondary)
                Text(f.name).font(.largeTitle.weight(.bold))
                Text(f.studies).font(.title3).foregroundStyle(.secondary)
                Text(f.body).font(.body).lineSpacing(4)
                VStack(alignment: .leading, spacing: 6) {
                    ForEach(f.ideas, id: \.self) { idea in
                        HStack(alignment: .top, spacing: 8) {
                            Circle().frame(width: 5, height: 5).padding(.top, 8).foregroundStyle(.tertiary)
                            Text(idea)
                        }
                    }
                }
                gapBox(f.gap)
                Button(store.read.contains(f.name) ? "Read" : "Mark read") { store.toggle(f.name) }
                    .buttonStyle(.borderedProminent)
                    .tint(store.read.contains(f.name) ? .primary : .secondary)
                    .padding(.top, 4)
            }
            .frame(maxWidth: 640, alignment: .leading)
            .padding(24)
        }
        .navigationTitle(f.name)
        .id(f.id)
    }

    private func gapBox(_ gap: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("THE GAP").font(.caption2.weight(.semibold)).foregroundStyle(.secondary)
            Text(gap)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 8))
        .overlay(alignment: .leading) { Rectangle().frame(width: 3).foregroundStyle(.primary) }
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

// ponytail: extracted so the type-checker does not choke on the sidebar body (feedback_swiftui_compiler).
private struct FieldRow: View {
    let field: Field
    let read: Bool
    var body: some View {
        Label {
            Text(field.name)
        } icon: {
            Image(systemName: read ? "circle.fill" : "circle")
                .font(.system(size: 8))
                .foregroundStyle(read ? AnyShapeStyle(.primary) : AnyShapeStyle(.tertiary))
        }
    }
}

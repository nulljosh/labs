import Foundation
import SwiftTUI

// ponytail: static one-shot render, same as the rest of the fleet's tui/ targets.
//   fieldbook-tui                 lists every field by domain
//   fieldbook-tui <name or part>  renders that field
//   fieldbook-tui --check         self-check against the generated content

let args = Array(CommandLine.arguments.dropFirst())

if args.first == "--check" {
    assert(allFields.count >= 70, "count \(allFields.count)")
    assert(Set(allFields.map(\.name)).count == allFields.count, "duplicate names")
    assert(allFields.allSatisfy { $0.ideas.count == 4 }, "four ideas each")
    assert(allFields.contains { $0.domain == "Anatomy & Physiology" }, "anatomy missing")
    print("fieldbook-tui: all checks passed")
    exit(0)
}

struct Index: View {
    var body: some View {
        VStack(alignment: .leading) {
            Text("Fieldbook").bold()
            ForEach(Array(Set(allFields.map(\.domain))).sorted(), id: \.self) { d in
                Text("").padding(.top, 0)
                Text(d.uppercased())
                ForEach(allFields.filter { $0.domain == d }, id: \.name) { f in
                    Text("  \(f.name)")
                }
            }
        }
        .padding()
    }
}

struct Detail: View {
    let field: Field
    var body: some View {
        VStack(alignment: .leading) {
            Text(field.domain)
            Text(field.name).bold()
            Text(field.studies)
            Text("")
            Text(field.body)
            Text("")
            ForEach(field.ideas, id: \.self) { Text("- \($0)") }
            Text("")
            Text("THE GAP").bold()
            Text(field.gap)
        }
        .padding()
        .border()
    }
}

if let q = args.first?.lowercased() {
    guard let f = allFields.first(where: { $0.name.lowercased().contains(q) }) else {
        print("no field matches \"\(q)\"")
        exit(1)
    }
    Application(rootView: Detail(field: f)).start()
} else {
    Application(rootView: Index()).start()
}

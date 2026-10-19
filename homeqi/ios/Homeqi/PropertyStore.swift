import Foundation
import SwiftUI

struct Property: Identifiable, Codable {
    let id: String
    var name: String
    var answers: [Int: String] // question id -> "yes" | "no" | "unsure"
}

@Observable
final class PropertyStore {
    private static let key = "homeqi.properties"

    var list: [Property]
    var currentID: String

    var current: Property {
        get { list.first(where: { $0.id == currentID }) ?? list[0] }
        set {
            guard let i = list.firstIndex(where: { $0.id == currentID }) else { return }
            list[i] = newValue
            save()
        }
    }

    init() {
        if let data = UserDefaults.standard.data(forKey: Self.key),
           let decoded = try? JSONDecoder().decode(Saved.self, from: data),
           decoded.list.contains(where: { $0.id == decoded.current }) {
            self.list = decoded.list
            self.currentID = decoded.current
        } else {
            let p = Property(id: "p1", name: "My place", answers: [:])
            self.list = [p]
            self.currentID = p.id
        }
    }

    func answer(_ questionID: Int, _ value: String) {
        var c = current
        if c.answers[questionID] == value {
            c.answers.removeValue(forKey: questionID) // tap again to clear
        } else {
            c.answers[questionID] = value
        }
        current = c
    }

    func addProperty(named name: String) {
        let p = Property(id: "p\(Date().timeIntervalSince1970)", name: name, answers: [:])
        list.append(p)
        currentID = p.id
        save()
    }

    func rename(_ name: String) {
        var c = current
        c.name = name
        current = c
    }

    func deleteCurrent() {
        guard list.count > 1 else { return }
        list.removeAll { $0.id == currentID }
        currentID = list[0].id
        save()
    }

    private struct Saved: Codable { var current: String; var list: [Property] }

    private func save() {
        let saved = Saved(current: currentID, list: list)
        if let data = try? JSONEncoder().encode(saved) {
            UserDefaults.standard.set(data, forKey: Self.key)
        }
    }
}

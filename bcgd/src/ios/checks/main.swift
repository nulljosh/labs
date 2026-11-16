// Run: swiftc -parse-as-library ../BCGD/Models.swift ../BCGD/Scan.swift main.swift -o /tmp/doorstock-check && /tmp/doorstock-check
import Foundation

@main struct Check {
    static func main() {
        // Label parsing
        var p = LabelScan.parse(".225 X 2\" X 24\" LH TORSION SPRING")
        assert(p.wire == 0.225 && p.insideDiameter == 2 && p.length == 24 && p.wind == .left && p.category == "Springs", "\(p)")
        p = LabelScan.parse("250-1-3/4-30 RH")
        assert(p.wire == 0.25 && p.insideDiameter == 1.75 && p.length == 30 && p.wind == .right && p.category == "Springs", "\(p)")
        p = LabelScan.parse("WIRE .243  ID 2-5/8\"  LENGTH 32  RIGHT WIND")
        assert(p.wire == 0.243 && p.insideDiameter == 2.625 && p.length == 32 && p.wind == .right, "\(p)")
        p = LabelScan.parse("LIFTMASTER 87504-267 OPENER")
        assert(p.category == "Openers" && p.wire == nil, "\(p)")

        // Matching: a spring by specs, an opener by name words
        var spring = Part(name: "Torsion Spring .225 x 24\"", category: "Springs", quantity: 3)
        spring.wire = 0.225; spring.length = 24; spring.wind = .left
        let opener = Part(name: "LiftMaster 87504-267", category: "Openers", quantity: 2)
        let shelf = [spring, opener]
        let hit = LabelScan.part(from: [".225 x 2 x 24", "LH"], in: shelf)
        assert(hit.id == spring.id && hit.insideDiameter == 2, "spring match fills the missing diameter")
        assert(LabelScan.part(from: ["LiftMaster", "87504-267"], in: shelf).id == opener.id)
        let fresh = LabelScan.part(from: [".250 x 2 x 30 RH"], in: shelf)
        assert(!shelf.contains { $0.id == fresh.id } && fresh.name == "Torsion Spring .250 x 2\" x 30\" RH", fresh.name)

        // Accountant CSV
        var cal = Calendar(identifier: .gregorian); cal.timeZone = TimeZone(identifier: "America/Vancouver")!
        let nov = cal.date(from: DateComponents(year: 2026, month: 11, day: 14, hour: 23))!
        var costed = Part(name: "Cable 8' Door, \"pair\"", category: "Cables", quantity: 5); costed.costCents = 1299
        var a = Job(customer: "Kim"); a.parts = [JobPart(partID: costed.id, quantity: 2, unitCostCents: 1250)]; a.stockDeducted = true; a.completed = nov
        var b = Job(customer: "Lee"); b.parts = [JobPart(partID: costed.id, quantity: 1)]; b.stockDeducted = true
        b.completed = cal.date(from: DateComponents(year: 2026, month: 10, day: 31, hour: 23, minute: 59))!
        var c = Job(customer: "Open"); c.parts = [JobPart(partID: costed.id, quantity: 9)]; c.scheduled = nov
        let csv = Store.accountantCSV(jobs: [a, b, c], parts: [costed], month: nov, calendar: cal).split(separator: "\n")
        assert(csv.count == 2, "only Kim's job is November and complete: \(csv)")
        assert(csv[1] == "2026-11-14,\(a.id.uuidString.prefix(8)),\"Kim\",\"Cable 8' Door, \"\"pair\"\"\",\"Cables\",2,12.50,25.00", String(csv[1]))
        let oct = Store.accountantCSV(jobs: [b], parts: [costed], month: b.completed!, calendar: cal)
        assert(oct.hasSuffix(",1,12.99,12.99"), "falls back to today's cost: \(oct)")

        // Old saves without the new keys still load
        let old = #"{"parts":[{"id":"\#(UUID())","name":"Roller","category":"Rollers","quantity":4,"lowStockThreshold":2}],"jobs":[{"id":"\#(UUID())","customer":"Old","stockDeducted":true}]}"#
        let saved = Saved.decode(Data(old.utf8))
        assert(saved?.parts.first?.wire == nil && saved?.jobs.first?.completed == nil)
        // Typed numbers
        assert(decimal("12,99") == 12.99 && decimal("$12.50") == 12.5 && decimal(".225") == 0.225 && decimal(" 24\" ") == 24)
        assert(decimal("") == nil && decimal("abc") == nil && decimal("-3") == nil)
        print("doorstock checks passed")
    }
}

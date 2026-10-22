// Decode check: a Doorstock 1.0 save (no scheduled, parts, stockDeducted or history keys)
// must load with every part intact. If it doesn't, the app reseeds and overwrites real stock.
//   swiftc ios/BCGD/Models.swift tests/main.swift -o /tmp/decode-check && /tmp/decode-check
import Foundation

let v1 = """
{"parts":[{"id":"6F9619FF-8B86-D011-B42D-00C04FC964FF","name":"Torsion Spring .225 x 24\\"","category":"Springs","quantity":3,"lowStockThreshold":2},
          {"id":"7F9619FF-8B86-D011-B42D-00C04FC964FF","name":"Cable 8' Door","category":"Cables","quantity":11,"lowStockThreshold":2}],
 "jobs":[{"id":"8F9619FF-8B86-D011-B42D-00C04FC964FF","customer":"Smith","address":"","detail":"","status":"Scheduled","created":750000000}]}
""".data(using: .utf8)!

guard let saved = Saved.decode(v1) else { fatalError("1.0 save no longer decodes: real inventory would be overwritten") }
assert(saved.parts.count == 2 && saved.parts[1].quantity == 11, "parts lost")
assert(saved.jobs.count == 1 && saved.jobs[0].parts.isEmpty && !saved.jobs[0].stockDeducted, "job defaults wrong")
assert(saved.history.isEmpty)

// Round trip with the new fields.
var job = saved.jobs[0]; job.parts = [JobPart(partID: saved.parts[0].id, quantity: 2)]; job.scheduled = Date()
let again = Saved.decode(try! JSONEncoder().encode(Saved(parts: saved.parts, jobs: [job], history: [])))!
assert(again.jobs[0].parts.first?.quantity == 2 && again.jobs[0].scheduled != nil, "new fields don't round trip")
print("decode check ok")

// Today: one route in time order, parts summed across jobs, shortage flagged, Maps link built.
let now = Date()
var a = Job(customer: "A"); a.status = .scheduled; a.scheduled = now.addingTimeInterval(60)
var b = Job(customer: "B"); b.status = .scheduled; b.scheduled = now.addingTimeInterval(-60); b.address = "123 Main St, Surrey"
let sp = saved.parts[0].id
a.parts = [JobPart(partID: sp, quantity: 2)]; b.parts = [JobPart(partID: sp, quantity: 2)]
let s = Store(); s.parts = saved.parts; s.jobs = [a, b]
assert(s.todayRoute.map(\.customer) == ["B", "A"], "route not in time order")
assert(s.todayNeeds.first?.needed == 4 && s.todayNeeds.first?.short == true, "needs not summed (3 on shelf, 4 needed)")
assert(b.routeURL?.absoluteString == "https://maps.apple.com/?daddr=123%20Main%20St,%20Surrey" && a.routeURL == nil, "maps url wrong")
print("today check ok")

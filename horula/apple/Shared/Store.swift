import Foundation
import Observation

// App state, saved as JSON in the shared app group so widgets and the watch read the same data.
// Keys and shapes match the web app's localStorage, which is also the backup format.

@Observable
final class Store {
    static let group = "group.com.nulljosh.clock"
    @ObservationIgnored private let defaults: UserDefaults

    var zones: [City] { didSet { save("zones", zones) } }
    var alarms: [AlarmItem] { didSet { save("alarms", alarms) } }
    var sleep: SleepPlan { didSet { save("sleep", sleep) } }
    var timers: [TimerItem] { didSet { save("timers", timers) } }
    var recents: [Recent] { didSet { save("recents", recents) } }
    var stopwatch: StopwatchState { didSet { save("sw", stopwatch) } }

    /// `-demo` on the command line: seeded, believable data in a throwaway suite, for screenshots. Never touches real data.
    static let demo = ProcessInfo.processInfo.arguments.contains("-demo")

    init(defaults: UserDefaults = Store.demo ? Store.demoDefaults() : UserDefaults(suiteName: Store.group) ?? .standard) {
        self.defaults = defaults
        func load<T: Decodable>(_ k: String, _ fallback: T) -> T {
            guard let d = defaults.data(forKey: k), let v = try? JSONDecoder.clock.decode(T.self, from: d) else { return fallback }
            return v
        }
        zones = load("zones", [City(city: "New York", zone: "America/New_York"), City(city: "London", zone: "Europe/London"), City(city: "Tokyo", zone: "Asia/Tokyo")])
        alarms = load("alarms", [])
        sleep = load("sleep", SleepPlan())
        timers = load("timers", [])
        recents = load("recents", [])
        stopwatch = load("sw", StopwatchState())
    }

    private static func demoDefaults() -> UserDefaults {
        let d = UserDefaults(suiteName: "horula-demo")!
        d.removePersistentDomain(forName: "horula-demo")
        func put<T: Encodable>(_ k: String, _ v: T) { d.set(try? JSONEncoder.clock.encode(v), forKey: k) }
        put("zones", [City(city: "New York", zone: "America/New_York"), City(city: "London", zone: "Europe/London"), City(city: "Tokyo", zone: "Asia/Tokyo"), City(city: "Sydney", zone: "Australia/Sydney")])
        var run = AlarmItem(time: "06:30", days: [1, 2, 3, 4, 5], label: "Run"); run.snoozeMin = 5
        put("alarms", [run, AlarmItem(time: "07:15", days: [1, 2, 3, 4, 5], label: "Wake up"), AlarmItem(time: "09:00", days: [0, 6], label: "Weekend", on: false)])
        put("sleep", SleepPlan(on: true, bed: "23:00", wake: "07:15", days: [1, 2, 3, 4, 5], wind: 30, snooze: true))
        put("sw", StopwatchState(start: .now.addingTimeInterval(-83), acc: 0, laps: [19.4, 40.1, 61.8]))
        put("timers", [TimerItem(dur: 300, label: "Tea", end: .now.addingTimeInterval(187), left: 300), TimerItem(dur: 1500, label: "Focus", end: .now.addingTimeInterval(1302), left: 1500)])
        put("recents", [Recent(dur: 300, label: "Tea"), Recent(dur: 540, label: "Pasta")])
        return d
    }

    private func save<T: Encodable>(_ k: String, _ v: T) {
        if let d = try? JSONEncoder.clock.encode(v) { defaults.set(d, forKey: k) }
    }

    /// Soonest of the alarms, the wake up time and nothing else, with its label.
    func nextAlarm(after now: Date = .now) -> (at: Date, label: String)? {
        var list = alarms.filter(\.on).compactMap { a in Clockwork.nextFire(a, after: now).map { ($0, a.label.isEmpty ? "Alarm" : a.label) } }
        if sleep.on, let w = Clockwork.fireTime(sleep.wake, days: sleep.days, after: now) { list.append((w, "Wake Up")) }
        return list.min { $0.0 < $1.0 }.map { (at: $0.0, label: $0.1) }
    }

    func startTimer(_ dur: TimeInterval, label: String) {
        guard dur > 0 else { return }
        timers.append(TimerItem(dur: dur, label: label, end: .now.addingTimeInterval(dur), left: dur))
        recents = Array(([Recent(dur: dur, label: label)] + recents.filter { $0.dur != dur || $0.label != label }).prefix(6))
    }

    // MARK: backup, the web app's format

    func backup() -> Data {
        struct R: Encodable { let dur: Double; let label: String }   // the web keeps durations in milliseconds
        struct B: Encodable { let app = "clock", v = 1; let saved: String; let alarms: [AlarmItem]; let sleep: SleepPlan; let zones: [City]; let recents: [R] }
        let b = B(saved: ISO8601DateFormatter().string(from: .now), alarms: alarms, sleep: sleep, zones: zones, recents: recents.map { R(dur: $0.dur * 1000, label: $0.label) })
        let e = JSONEncoder.clock; e.outputFormatting = [.prettyPrinted, .sortedKeys]
        return (try? e.encode(b)) ?? Data()
    }

    func restore(_ data: Data) throws -> (alarms: Int, cities: Int) {
        let b = try Backup.parse(data)
        if let a = b.alarms { alarms = a }
        if let z = b.zones { zones = z }
        if let r = b.recents { recents = r }
        if let s = b.sleep { sleep = s }
        return (b.alarms?.count ?? 0, b.zones?.count ?? 0)
    }
}

extension JSONEncoder { static var clock: JSONEncoder { let e = JSONEncoder(); e.dateEncodingStrategy = .millisecondsSince1970; return e } }
extension JSONDecoder { static var clock: JSONDecoder { let d = JSONDecoder(); d.dateDecodingStrategy = .millisecondsSince1970; return d } }

/// Backup import. The file comes from outside, so every field is checked, like parseBackup in lib.js.
enum Backup {
    struct Parsed { var alarms: [AlarmItem]?; var zones: [City]?; var recents: [Recent]?; var sleep: SleepPlan? }
    enum Failure: LocalizedError {
        case notBackup, empty
        var errorDescription: String? { self == .notBackup ? "That file is not a Horula backup" : "That backup is empty" }
    }

    static func parse(_ data: Data) throws -> Parsed {
        guard let d = try? JSONSerialization.jsonObject(with: data) as? [String: Any], d["app"] as? String == "clock", d["v"] as? Int == 1 else { throw Failure.notBackup }
        let hm = /([01]\d|2[0-3]):[0-5]\d/
        func str(_ v: Any?, _ n: Int) -> String { String((v as? String ?? "").prefix(n)) }
        func days(_ v: Any?) -> [Int] {
            var seen = Set<Int>(); return (v as? [Any] ?? []).compactMap { $0 as? Int }.filter { (0...6).contains($0) && seen.insert($0).inserted }
        }
        var out = Parsed()
        if let list = d["alarms"] as? [[String: Any]] {
            out.alarms = list.filter { ($0["time"] as? String)?.wholeMatch(of: hm) != nil }.prefix(100).map { a in
                var x = AlarmItem(time: a["time"] as! String, days: days(a["days"]), label: str(a["label"], 40), on: a["on"] as? Bool != false)
                x.sound = str(a["sound"], 20).isEmpty ? "Radar" : str(a["sound"], 20)
                x.snooze = a["snooze"] as? Bool != false
                if let m = a["snoozeMin"] as? Int, (1...15).contains(m) { x.snoozeMin = m }
                return x
            }
        }
        if let list = d["zones"] as? [[String: Any]] {
            out.zones = list.compactMap { z in
                guard let id = z["zone"] as? String, TimeZone(identifier: id) != nil else { return nil }
                let c = str(z["city"], 60)
                return City(city: c.isEmpty ? id.split(separator: "/").last.map(String.init) ?? id : c, zone: id)
            }.prefix(50).map { $0 }
        }
        if let list = d["recents"] as? [[String: Any]] {
            out.recents = list.compactMap { r in
                guard let ms = r["dur"] as? Double, ms >= 1000, ms <= 86_400_000 else { return nil }
                return Recent(dur: ms / 1000, label: str(r["label"], 40))   // web stores milliseconds
            }.prefix(6).map { $0 }
        }
        if let s = d["sleep"] as? [String: Any], let bed = s["bed"] as? String, let wake = s["wake"] as? String,
           bed.wholeMatch(of: hm) != nil, wake.wholeMatch(of: hm) != nil {
            let wind = s["wind"] as? Int ?? 30
            out.sleep = SleepPlan(on: s["on"] as? Bool ?? false, bed: bed, wake: wake, days: days(s["days"]), wind: [0, 15, 30, 45, 60].contains(wind) ? wind : 30, snooze: s["snooze"] as? Bool != false)
        }
        if out.alarms == nil && out.zones == nil && out.recents == nil && out.sleep == nil { throw Failure.empty }
        return out
    }
}

import Foundation

// The same shapes as the web app's localStorage, so a web backup imports as is.
// Web records carry no ids, so decoding fills them in.

struct City: Codable, Hashable, Identifiable {
    var city: String
    var zone: String
    var id: String { zone + "|" + city }
}

struct AlarmItem: Codable, Hashable, Identifiable {
    var id = UUID()
    var time: String            // "HH:mm", 24 hour
    var days: [Int] = []        // 0 = Sunday, like JavaScript's getDay
    var label = ""
    var sound = "Radar"
    var on = true
    var snooze = true
    var snoozeMin = 9
    var skip: String?           // yyyy-MM-dd of one skipped ring

    init(time: String, days: [Int] = [], label: String = "", on: Bool = true) {
        self.time = time; self.days = days; self.label = label; self.on = on
    }
    init(from d: Decoder) throws {
        let c = try d.container(keyedBy: CodingKeys.self)
        id = try c.decodeIfPresent(UUID.self, forKey: .id) ?? UUID()
        time = try c.decode(String.self, forKey: .time)
        days = try c.decodeIfPresent([Int].self, forKey: .days) ?? []
        label = try c.decodeIfPresent(String.self, forKey: .label) ?? ""
        sound = try c.decodeIfPresent(String.self, forKey: .sound) ?? "Radar"
        on = try c.decodeIfPresent(Bool.self, forKey: .on) ?? true
        snooze = try c.decodeIfPresent(Bool.self, forKey: .snooze) ?? true
        snoozeMin = try c.decodeIfPresent(Int.self, forKey: .snoozeMin) ?? 9
        skip = try? c.decodeIfPresent(String.self, forKey: .skip)
    }
}

struct TimerItem: Codable, Hashable, Identifiable {
    var id = UUID()
    var dur: TimeInterval
    var label = ""
    var end: Date?              // nil while paused
    var left: TimeInterval
    func remaining(_ now: Date = .now) -> TimeInterval { end.map { $0.timeIntervalSince(now) } ?? left }
}

struct Recent: Codable, Hashable {
    var dur: TimeInterval
    var label = ""
    init(dur: TimeInterval, label: String = "") { self.dur = dur; self.label = label }
    init(from d: Decoder) throws {
        let c = try d.container(keyedBy: CodingKeys.self)
        dur = try c.decode(TimeInterval.self, forKey: .dur)
        label = try c.decodeIfPresent(String.self, forKey: .label) ?? ""
    }
}

struct SleepPlan: Codable, Hashable {
    var on = false
    var bed = "23:00"
    var wake = "07:00"
    var days = [0, 1, 2, 3, 4, 5, 6]
    var wind = 30
    var snooze = true
}

struct StopwatchState: Codable, Hashable {
    var start: Date?
    var acc: TimeInterval = 0
    var laps: [TimeInterval] = []   // cumulative times, like the web app
    func elapsed(_ now: Date = .now) -> TimeInterval { acc + (start.map { now.timeIntervalSince($0) } ?? 0) }
}

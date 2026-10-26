import Foundation

// The same shapes as the web app's localStorage, so a web backup imports as is.
// Web records carry no ids, so decoding fills them in.

struct City: Codable, Hashable, Identifiable {
    var city: String
    var zone: String
    var nick: String?           // your own name for it ("Office"); nil shows the real one
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
    // Interval timers only: dur is the current phase, work and rest the two lengths.
    var work: TimeInterval? = nil
    var rest: TimeInterval? = nil
    var rounds: Int? = nil
    var round: Int? = nil       // optional so timers saved before intervals still decode
    var phase: String? = nil
    func remaining(_ now: Date = .now) -> TimeInterval { end.map { $0.timeIntervalSince(now) } ?? left }
}

struct Recent: Codable, Hashable {
    var dur: TimeInterval
    var label = ""
    var rest: TimeInterval? = nil   // set for an interval timer, with rounds
    var rounds: Int? = nil
    init(dur: TimeInterval, label: String = "", rest: TimeInterval? = nil, rounds: Int? = nil) { self.dur = dur; self.label = label; self.rest = rest; self.rounds = rounds }
    init(from d: Decoder) throws {
        let c = try d.container(keyedBy: CodingKeys.self)
        dur = try c.decode(TimeInterval.self, forKey: .dur)
        label = try c.decodeIfPresent(String.self, forKey: .label) ?? ""
        rest = try c.decodeIfPresent(TimeInterval.self, forKey: .rest)
        rounds = try c.decodeIfPresent(Int.self, forKey: .rounds)
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

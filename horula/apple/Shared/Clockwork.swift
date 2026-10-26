import Foundation

// Pure logic, ported line for line from lib.js and tested with the same cases (Tests/ClockworkTests.swift).
// No UI, no state. Every function takes "now" and a calendar so tests can pin time and zone.

enum Clockwork {
    static let dayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    static func minutes(_ hm: String) -> Int {
        let p = hm.split(separator: ":").compactMap { Int($0) }
        return p.count == 2 ? p[0] * 60 + p[1] : 0
    }

    static func repeatText(_ days: [Int]) -> String {
        let d = Set(days).sorted()
        switch d {
        case []: return "Never"
        case [0, 1, 2, 3, 4, 5, 6]: return "Every day"
        case [1, 2, 3, 4, 5]: return "Weekdays"
        case [0, 6]: return "Weekends"
        default: return d.map { dayShort[$0] }.joined(separator: " ")
        }
    }

    /// Next moment hh:mm fires, today or later, on an allowed day (0 = Sunday). Survives DST changes.
    static func fireTime(_ hm: String, days: [Int], after now: Date, cal: Calendar = .current) -> Date? {
        let m = minutes(hm)
        let today = cal.startOfDay(for: now)
        for i in 0..<8 {
            guard let day = cal.date(byAdding: .day, value: i, to: today),
                  let at = cal.date(bySettingHour: m / 60, minute: m % 60, second: 0, of: day) else { continue }
            let weekday = cal.component(.weekday, from: at) - 1
            if at > now && (days.isEmpty || days.contains(weekday)) { return at }
        }
        return nil
    }

    static func dayKey(_ d: Date, cal: Calendar = .current) -> String {
        let c = cal.dateComponents([.year, .month, .day], from: d)
        return String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
    }

    /// Next ring of an alarm, stepping past a skipped day.
    static func nextFire(_ a: AlarmItem, after now: Date, cal: Calendar = .current) -> Date? {
        guard let at = fireTime(a.time, days: a.days, after: now, cal: cal) else { return nil }
        return a.skip == dayKey(at, cal: cal) ? fireTime(a.time, days: a.days, after: at, cal: cal) : at
    }

    static func untilText(_ at: Date, from now: Date) -> String {
        let mins = max(1, Int((at.timeIntervalSince(now) / 60).rounded())), h = mins / 60, m = mins % 60
        return [h > 0 ? "\(h) hour\(h > 1 ? "s" : "")" : nil, m > 0 ? "\(m) minute\(m > 1 ? "s" : "")" : nil]
            .compactMap { $0 }.joined(separator: " ")
    }

    /// "Tomorrow Morning", "Today", "Friday Morning", like the iOS sleep row.
    static func dayWord(_ at: Date, from now: Date, cal: Calendar = .current) -> String {
        let d = cal.dateComponents([.day], from: cal.startOfDay(for: now), to: cal.startOfDay(for: at)).day ?? 0
        let f = DateFormatter(); f.calendar = cal; f.timeZone = cal.timeZone; f.locale = Locale(identifier: "en_US"); f.dateFormat = "EEEE"
        let word = d == 0 ? "Today" : d == 1 ? "Tomorrow" : f.string(from: at)
        return cal.component(.hour, from: at) < 12 ? "\(word) Morning" : word
    }

    // MARK: sun

    /// Sunrise and sunset from the NOAA approximation, as instants. nil in polar day or night.
    static func sunTimes(on date: Date, lat: Double, lon: Double, cal: Calendar = .current) -> (rise: Date, set: Date)? {
        let rad = Double.pi / 180
        let y = cal.component(.year, from: date)
        let dayOfYear = Double(cal.ordinality(of: .day, in: .year, for: date) ?? 1)
        let g = 2 * Double.pi / 365 * (dayOfYear - 1)
        let decl = 0.006918 - 0.399912 * cos(g) + 0.070257 * sin(g) - 0.006758 * cos(2 * g) + 0.000907 * sin(2 * g)
        let eqt = 229.18 * (0.000075 + 0.001868 * cos(g) - 0.032077 * sin(g) - 0.014615 * cos(2 * g) - 0.040849 * sin(2 * g))
        let cosH = cos(90.833 * rad) / (cos(lat * rad) * cos(decl)) - tan(lat * rad) * tan(decl)
        guard cosH <= 1, cosH >= -1 else { return nil }
        let ha = acos(cosH) / rad
        var utc = Calendar(identifier: .gregorian); utc.timeZone = TimeZone(identifier: "UTC")!
        let c = cal.dateComponents([.month, .day], from: date)
        guard let mid = utc.date(from: DateComponents(year: y, month: c.month, day: c.day)) else { return nil }
        let at = { (mins: Double) in mid.addingTimeInterval(mins * 60) }
        return (at(720 - 4 * (lon + ha) - eqt), at(720 - 4 * (lon - ha) - eqt))
    }

    /// Sun up at this place right now? Checks the days either side so places across the date line work.
    static func isDaytime(_ now: Date, lat: Double, lon: Double, cal: Calendar = .current) -> Bool {
        for k in [-1, 0, 1] {
            guard let t = sunTimes(on: now.addingTimeInterval(Double(k) * 86400), lat: lat, lon: lon, cal: cal) else {
                // polar day or night: guess by season. ponytail: good enough above 60 degrees
                let summer = (4...9).contains(cal.component(.month, from: now))
                return abs(lat) > 60 && (lat > 0) == summer
            }
            if now >= t.rise && now < t.set { return true }
        }
        return false
    }

    /// "Today, +3 HRS", "Tomorrow, +12.5 HRS", like iOS World Clock.
    static func offsetLabel(zone: String, at now: Date, here: TimeZone = .current) -> String {
        guard let tz = TimeZone(identifier: zone) else { return "" }
        let diff = Double(tz.secondsFromGMT(for: now) - here.secondsFromGMT(for: now)) / 3600
        var a = Calendar(identifier: .gregorian); a.timeZone = here
        var b = Calendar(identifier: .gregorian); b.timeZone = tz
        let ha = a.dateComponents([.year, .month, .day], from: now), hb = b.dateComponents([.year, .month, .day], from: now)
        let same = ha == hb
        let ahead = (hb.year!, hb.month!, hb.day!) > (ha.year!, ha.month!, ha.day!)
        let day = same ? "Today" : ahead ? "Tomorrow" : "Yesterday"
        if diff == 0 { return "\(day), same time" }
        let n = diff == diff.rounded() ? String(Int(diff)) : String(diff)
        return "\(day), \(diff > 0 ? "+" : "")\(n) HRS"
    }

    // MARK: formats

    static func timerText(_ t: TimeInterval) -> String {
        let s = max(0, Int(t.rounded(.up)))
        return s >= 3600 ? String(format: "%02d:%02d:%02d", s / 3600, s / 60 % 60, s % 60) : String(format: "%02d:%02d", s / 60, s % 60)
    }

    static func durationText(_ t: TimeInterval) -> String {
        let s = Int(t.rounded()), h = s / 3600, m = s / 60 % 60, r = s % 60
        return [h > 0 ? "\(h) hr" : nil, m > 0 ? "\(m) min" : nil, r > 0 ? "\(r) sec" : nil].compactMap { $0 }.joined(separator: " ")
    }

    static func stopwatchText(_ t: TimeInterval) -> String {
        let cs = Int(t * 100)
        return String(format: "%02d:%02d.%02d", cs / 6000, cs / 100 % 60, cs % 100)
    }

    /// Best and worst lap need two different splits; equal splits mark nothing.
    static func lapMarks(_ splits: [TimeInterval]) -> (best: TimeInterval?, worst: TimeInterval?) {
        guard splits.count >= 2, let lo = splits.min(), let hi = splits.max(), lo != hi else { return (nil, nil) }
        return (lo, hi)
    }

    /// "10m", "1h30m", "90s", "5:00", "1:02:03" or bare minutes to seconds. Over a day or nonsense is nil.
    static func parseDuration(_ raw: String) -> TimeInterval? {
        let s = raw.trimmingCharacters(in: .whitespaces).lowercased()
        var sec: Int?
        if let m = s.wholeMatch(of: /(\d+):(\d{1,2})(?::(\d{1,2}))?/) {
            sec = m.3 == nil ? Int(m.1)! * 60 + Int(m.2)! : Int(m.1)! * 3600 + Int(m.2)! * 60 + Int(m.3!)!
        } else if !s.isEmpty, let m = s.wholeMatch(of: /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/) {
            sec = (m.1.flatMap { Int($0) } ?? 0) * 3600 + (m.2.flatMap { Int($0) } ?? 0) * 60 + (m.3.flatMap { Int($0) } ?? 0)
        } else if s.wholeMatch(of: /\d+/) != nil {
            sec = Int(s)! * 60
        }
        guard let v = sec, v > 0, v <= 86400 else { return nil }
        return TimeInterval(v)
    }

    /// Nightstand burn-in guard: the face walks a slow 8 point circle, one step a minute.
    static func drift(_ minute: Int) -> CGSize {
        CGSize(width: (8 * cos(Double(minute) * 0.7)).rounded(), height: (8 * sin(Double(minute) * 0.7)).rounded())
    }

    /// Where the sun dot sits on the sun dial: over the horizon by day, a shallow dip under it by night.
    /// ponytail: no coordinates, or a polar day, falls back to a 6:00 to 18:00 sun.
    static func dialPoint(_ now: Date, lat: Double?, lon: Double?, cal: Calendar = .current) -> (x: Double, y: Double, day: Bool) {
        let day0 = cal.startOfDay(for: now)
        func times(_ k: Int) -> (rise: Date, set: Date) {
            let d = cal.date(byAdding: .day, value: k, to: day0)!
            if let lat, let lon, let t = sunTimes(on: d, lat: lat, lon: lon, cal: cal) { return t }
            return (d.addingTimeInterval(6 * 3600), d.addingTimeInterval(18 * 3600))
        }
        let t = times(0)
        if now >= t.rise && now < t.set {
            let f = now.timeIntervalSince(t.rise) / t.set.timeIntervalSince(t.rise)
            return (-100 * cos(.pi * f), -100 * sin(.pi * f), true)
        }
        let (from, to) = now < t.rise ? (times(-1).set, t.rise) : (t.set, times(1).rise)
        let f = now.timeIntervalSince(from) / to.timeIntervalSince(from)
        return (100 * cos(.pi * f), 18 * sin(.pi * f), false)
    }

    /// Interval timer: work and rest rounds. The phase after this one, or nil when the last work round ends.
    static func nextPhase(phase: String, round: Int, rounds: Int, work: TimeInterval, rest: TimeInterval) -> (phase: String, round: Int, dur: TimeInterval)? {
        if phase == "work" && round >= rounds { return nil }
        if phase == "work" && rest > 0 { return ("rest", round, rest) }
        return ("work", round + 1, work)
    }

    /// Stopwatch laps (running totals) as a tab separated table, pastes straight into a spreadsheet.
    static func lapsTable(_ laps: [TimeInterval]) -> String {
        (["Lap\tSplit\tTotal"] + laps.enumerated().map { i, t in "\(i + 1)\t\(stopwatchText(t - (i > 0 ? laps[i - 1] : 0)))\t\(stopwatchText(t))" }).joined(separator: "\n")
    }

    /// Where the sun stands overhead at this moment, from the same NOAA terms as sunTimes.
    static func subsolar(_ date: Date) -> (lat: Double, lon: Double) {
        var utc = Calendar(identifier: .gregorian); utc.timeZone = TimeZone(identifier: "UTC")!
        let c = utc.dateComponents([.hour, .minute, .second], from: date)
        let mins = Double(c.hour! * 60 + c.minute!) + Double(c.second!) / 60
        let day = Double(utc.ordinality(of: .day, in: .year, for: date)!)
        let g = 2 * Double.pi / 365 * (day - 1 + (mins / 60 - 12) / 24)
        let decl = 0.006918 - 0.399912 * cos(g) + 0.070257 * sin(g) - 0.006758 * cos(2 * g) + 0.000907 * sin(2 * g)
        let eqt = 229.18 * (0.000075 + 0.001868 * cos(g) - 0.032077 * sin(g) - 0.014615 * cos(2 * g) - 0.040849 * sin(2 * g))
        let lon = ((720 - mins - eqt) / 4 + 540).truncatingRemainder(dividingBy: 360) - 180
        return (decl * 180 / .pi, lon)
    }

    /// The latitude where day meets night at a longitude.
    static func terminatorLat(_ s: (lat: Double, lon: Double), lon: Double) -> Double {
        let r = Double.pi / 180, d = (abs(s.lat) < 0.05 ? 0.05 : s.lat) * r
        return atan(-cos((lon - s.lon) * r) / tan(d)) / r
    }
}

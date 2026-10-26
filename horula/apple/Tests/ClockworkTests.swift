import XCTest

// The same cases as test/lib.test.js, so the web and native apps cannot drift apart.
final class ClockworkTests: XCTestCase {
    var cal: Calendar = { var c = Calendar(identifier: .gregorian); c.timeZone = TimeZone(identifier: "America/Vancouver")!; return c }()
    func d(_ y: Int, _ mo: Int, _ day: Int, _ h: Int = 0, _ mi: Int = 0, _ s: Int = 0) -> Date {
        cal.date(from: DateComponents(year: y, month: mo, day: day, hour: h, minute: mi, second: s))!
    }

    func testRepeatText() {
        XCTAssertEqual(Clockwork.repeatText([]), "Never")
        XCTAssertEqual(Clockwork.repeatText([6, 0, 1, 2, 3, 4, 5]), "Every day")
        XCTAssertEqual(Clockwork.repeatText([5, 1, 2, 3, 4]), "Weekdays")
        XCTAssertEqual(Clockwork.repeatText([6, 0]), "Weekends")
        XCTAssertEqual(Clockwork.repeatText([3, 1]), "Mon Wed")
    }

    func testNextAlarm() {
        let now = d(2026, 10, 25, 8)   // Sunday 08:00
        XCTAssertEqual(Clockwork.fireTime("09:30", days: [], after: now, cal: cal), d(2026, 10, 25, 9, 30))
        XCTAssertEqual(Clockwork.fireTime("07:00", days: [], after: now, cal: cal), d(2026, 10, 26, 7))
        XCTAssertEqual(Clockwork.fireTime("08:00", days: [], after: now, cal: cal), d(2026, 10, 26, 8), "this very minute waits a day")
        XCTAssertEqual(Clockwork.fireTime("07:00", days: [6], after: now, cal: cal), d(2026, 10, 31, 7), "Saturday only")
        let dst = Clockwork.fireTime("07:00", days: [], after: d(2026, 10, 31, 22), cal: cal)!   // clocks fall back Nov 1
        XCTAssertEqual(cal.component(.day, from: dst), 1); XCTAssertEqual(cal.component(.hour, from: dst), 7)
        XCTAssertEqual(Clockwork.untilText(d(2026, 10, 25, 15, 12), from: now), "7 hours 12 minutes")
        XCTAssertEqual(Clockwork.untilText(d(2026, 10, 25, 8, 0, 20), from: now), "1 minute")
    }

    func testSkipAndDayWord() {
        let now = d(2026, 10, 25, 8)
        var a = AlarmItem(time: "07:00", days: [1, 2, 3, 4, 5])
        XCTAssertEqual(Clockwork.nextFire(a, after: now, cal: cal), d(2026, 10, 26, 7))
        a.skip = "2026-10-26"
        XCTAssertEqual(Clockwork.nextFire(a, after: now, cal: cal), d(2026, 10, 27, 7), "skips Monday")
        XCTAssertEqual(Clockwork.dayWord(d(2026, 10, 26, 7), from: now, cal: cal), "Tomorrow Morning")
        XCTAssertEqual(Clockwork.dayWord(d(2026, 10, 25, 21), from: now, cal: cal), "Today")
        XCTAssertEqual(Clockwork.dayWord(d(2026, 10, 30, 6, 30), from: now, cal: cal), "Friday Morning")
    }

    func testSun() {
        let t = Clockwork.sunTimes(on: d(2026, 6, 21), lat: 49.28, lon: -123.12, cal: cal)!
        func mins(_ x: Date) -> Int { cal.component(.hour, from: x) * 60 + cal.component(.minute, from: x) }
        XCTAssertLessThanOrEqual(abs(mins(t.rise) - (5 * 60 + 7)), 5)
        XCTAssertLessThanOrEqual(abs(mins(t.set) - (21 * 60 + 22)), 5)
        XCTAssertNil(Clockwork.sunTimes(on: d(2026, 6, 21), lat: 80, lon: 0, cal: cal), "polar day")
        XCTAssertTrue(Clockwork.isDaytime(d(2026, 10, 25, 12), lat: 49.28, lon: -123.12, cal: cal))
        XCTAssertFalse(Clockwork.isDaytime(d(2026, 10, 25, 0, 30), lat: 49.28, lon: -123.12, cal: cal))
        XCTAssertFalse(Clockwork.isDaytime(d(2026, 10, 25, 12), lat: 35.68, lon: 139.69, cal: cal), "Tokyo at 4am")
        XCTAssertTrue(Clockwork.isDaytime(d(2026, 10, 25, 12), lat: -36.85, lon: 174.76, cal: cal), "Auckland across the date line")
    }

    func testOffset() {
        let here = TimeZone(identifier: "America/Vancouver")!, noon = d(2026, 10, 25, 12)
        XCTAssertEqual(Clockwork.offsetLabel(zone: "America/Vancouver", at: noon, here: here), "Today, same time")
        XCTAssertEqual(Clockwork.offsetLabel(zone: "America/Toronto", at: noon, here: here), "Today, +3 HRS")
        XCTAssertEqual(Clockwork.offsetLabel(zone: "Asia/Tokyo", at: noon, here: here), "Tomorrow, +16 HRS")
        XCTAssertEqual(Clockwork.offsetLabel(zone: "Asia/Kolkata", at: noon, here: here), "Tomorrow, +12.5 HRS")
    }

    func testFormats() {
        XCTAssertEqual(Clockwork.timerText(300), "05:00")
        XCTAssertEqual(Clockwork.timerText(299.001), "05:00")
        XCTAssertEqual(Clockwork.timerText(3723), "01:02:03")
        XCTAssertEqual(Clockwork.durationText(3723), "1 hr 2 min 3 sec")
        XCTAssertEqual(Clockwork.stopwatchText(61.23), "01:01.23")
        XCTAssertTrue(Clockwork.lapMarks([5, 5, 5]) == (nil, nil))
        XCTAssertTrue(Clockwork.lapMarks([5, 3, 8]) == (3, 8))
    }

    func testDurations() {
        XCTAssertEqual(Clockwork.parseDuration("10m"), 600); XCTAssertEqual(Clockwork.parseDuration("1h30m"), 5400)
        XCTAssertEqual(Clockwork.parseDuration("90s"), 90); XCTAssertEqual(Clockwork.parseDuration("5:00"), 300)
        XCTAssertEqual(Clockwork.parseDuration("1:02:03"), 3723); XCTAssertEqual(Clockwork.parseDuration("25"), 1500)
        for bad in ["", "abc", "0", "25h", "-5m", "m"] { XCTAssertNil(Clockwork.parseDuration(bad), bad) }
    }

    func testBackupFromTheWebApp() throws {
        let web = #"{"app":"clock","v":1,"alarms":[{"time":"07:30","days":[1,2],"label":"Gym","sound":"Radar","on":true,"snooze":true,"snoozeMin":5}],"zones":[{"city":"Tokyo","zone":"Asia/Tokyo","nick":"Office"}],"recents":[{"dur":300000,"label":"Tea"}],"sleep":{"on":true,"bed":"23:00","wake":"07:00","days":[0,1],"wind":30,"snooze":true}}"#
        let b = try Backup.parse(Data(web.utf8))
        XCTAssertEqual(b.alarms?.first?.label, "Gym"); XCTAssertEqual(b.alarms?.first?.snoozeMin, 5)
        XCTAssertEqual(b.zones?.first?.zone, "Asia/Tokyo"); XCTAssertEqual(b.zones?.first?.nick, "Office"); XCTAssertEqual(b.recents?.first?.dur, 300); XCTAssertEqual(b.sleep?.wake, "07:00")
        XCTAssertThrowsError(try Backup.parse(Data("nope".utf8)))
        XCTAssertThrowsError(try Backup.parse(Data(#"{"app":"other","v":1}"#.utf8)))
        let dirty = try Backup.parse(Data(#"{"app":"clock","v":1,"alarms":[{"time":"99:99"},{"time":"06:00","days":[9,1,1],"label":"\#(String(repeating: "x", count: 500))","snoozeMin":99}],"zones":[{"city":"X","zone":"Mars/Base"}]}"#.utf8))
        XCTAssertEqual(dirty.alarms?.map { [$0.time, "\($0.days)", "\($0.label.count)", "\($0.snoozeMin)"] }, [["06:00", "[1]", "40", "9"]])
        XCTAssertEqual(dirty.zones?.count, 0)
    }

    func testRoundTrip() throws {
        let s = Store(defaults: UserDefaults(suiteName: "horula-test-\(UUID())")!)
        s.alarms = [AlarmItem(time: "06:15", days: [1], label: "Run")]
        s.recents = [Recent(dur: 540, label: "Pasta")]
        let back = try Backup.parse(s.backup())
        XCTAssertEqual(back.alarms?.first?.label, "Run"); XCTAssertEqual(back.recents?.first?.dur, 540)
    }

    func testNightstandDriftAndDial() {
        for m in 0..<200 { let v = Clockwork.drift(m); XCTAssertLessThanOrEqual(hypot(v.width, v.height), 8.8) }
        XCTAssertNotEqual(Clockwork.drift(1), Clockwork.drift(2))
        let noon = Clockwork.dialPoint(d(2026, 10, 25, 12), lat: nil, lon: nil, cal: cal)
        XCTAssertTrue(noon.day); XCTAssertEqual(noon.x, 0, accuracy: 1e-9); XCTAssertEqual(noon.y, -100, accuracy: 1e-9)
        let midnight = Clockwork.dialPoint(d(2026, 10, 26), lat: nil, lon: nil, cal: cal)
        XCTAssertFalse(midnight.day); XCTAssertEqual(midnight.x, 0, accuracy: 1e-9); XCTAssertEqual(midnight.y, 18, accuracy: 1e-9)
        let dawn = Clockwork.dialPoint(d(2026, 10, 25, 6), lat: nil, lon: nil, cal: cal)
        XCTAssertTrue(dawn.day); XCTAssertEqual(dawn.x, -100, accuracy: 1e-9)
        let van = Clockwork.dialPoint(d(2026, 10, 25, 13), lat: 49.28, lon: -123.12, cal: cal)
        XCTAssertTrue(van.day); XCTAssertLessThan(van.y, -90)
    }

    func testIntervalPhasesAndLapsTable() {
        let a = Clockwork.nextPhase(phase: "work", round: 1, rounds: 3, work: 40, rest: 20)!
        XCTAssertEqual(a.phase, "rest"); XCTAssertEqual(a.round, 1); XCTAssertEqual(a.dur, 20)
        let b = Clockwork.nextPhase(phase: "rest", round: 1, rounds: 3, work: 40, rest: 20)!
        XCTAssertEqual(b.phase, "work"); XCTAssertEqual(b.round, 2); XCTAssertEqual(b.dur, 40)
        XCTAssertNil(Clockwork.nextPhase(phase: "work", round: 3, rounds: 3, work: 40, rest: 20), "no rest after the last round")
        let c = Clockwork.nextPhase(phase: "work", round: 1, rounds: 3, work: 40, rest: 0)!
        XCTAssertEqual(c.phase, "work"); XCTAssertEqual(c.round, 2)
        XCTAssertEqual(Clockwork.lapsTable([20, 41.5]), "Lap\tSplit\tTotal\n1\t00:20.00\t00:20.00\n2\t00:21.50\t00:41.50")
        XCTAssertEqual(Clockwork.lapsTable([]), "Lap\tSplit\tTotal")
    }

    func testCountdownsToADate() {
        let now = cal.date(from: DateComponents(year: 2026, month: 10, day: 25, hour: 23, minute: 30))!
        func span(_ d: String) -> [AnyHashable] { let s = Clockwork.dateSpan(d, now: now, cal: cal)!; return [s.years, s.months, s.days, s.past] }
        XCTAssertEqual(span("2026-12-24"), [0, 1, 29, false]); XCTAssertEqual(span("2026-10-25"), [0, 0, 0, false])
        XCTAssertEqual(span("2026-11-08"), [0, 0, 14, false], "across the November clock change")
        XCTAssertEqual(span("2028-01-01"), [1, 2, 7, false]); XCTAssertEqual(span("2026-10-01"), [0, 0, 24, true])
        XCTAssertNil(Clockwork.dateSpan("soon", now: now, cal: cal))
        XCTAssertEqual(Clockwork.spanText(Clockwork.dateSpan("2026-10-25", now: now, cal: cal)!), "Today")
        XCTAssertEqual(Clockwork.spanText(Clockwork.dateSpan("2026-12-24", now: now, cal: cal)!), "1 month, 29 days")
        XCTAssertEqual(Clockwork.spanText(Clockwork.dateSpan("2026-10-24", now: now, cal: cal)!), "1 day ago")
    }

    func testNextClockChange() {
        let now = Date(timeIntervalSince1970: 1_792_996_200)   // 2026-10-26 06:30 UTC
        let ny = Clockwork.nextShift(zone: "America/New_York", after: now)!
        XCTAssertEqual(ny.at, Date(timeIntervalSince1970: 1_793_512_800)); XCTAssertEqual(ny.from, -4 * 3600); XCTAssertEqual(ny.to, -5 * 3600)
        XCTAssertNil(Clockwork.nextShift(zone: "Asia/Tokyo", after: now))
    }

    func testSunOverheadAndNightLine() {
        var utc = Calendar(identifier: .gregorian); utc.timeZone = TimeZone(identifier: "UTC")!
        let june = Clockwork.subsolar(utc.date(from: DateComponents(year: 2026, month: 6, day: 21, hour: 12))!)
        XCTAssertEqual(june.lat, 23.44, accuracy: 0.3); XCTAssertEqual(june.lon, 0, accuracy: 1.5)
        let dec = Clockwork.subsolar(utc.date(from: DateComponents(year: 2026, month: 12, day: 21, hour: 18))!)
        XCTAssertEqual(dec.lat, -23.44, accuracy: 0.3); XCTAssertEqual(dec.lon, -90, accuracy: 1.5)
        XCTAssertEqual(Clockwork.terminatorLat(june, lon: june.lon + 180), 90 - june.lat, accuracy: 0.01)
        XCTAssertEqual(Clockwork.terminatorLat(june, lon: june.lon + 90), 0, accuracy: 0.01)
    }

    func testCueText() {
        XCTAssertEqual(Clockwork.cueText(phase: "rest", round: 1, rounds: 3), "Rest. Up next: Work")
        XCTAssertEqual(Clockwork.cueText(phase: "work", round: 2, rounds: 3), "Work, 2 of 3")
    }

    func testWakeUpCheckPendsUntilImUp() {
        let store = Store(defaults: UserDefaults(suiteName: "check-test")!)
        store.alarms = []; store.awake = nil
        var a = AlarmItem(time: "07:00"); a.check = true; store.alarms = [a]
        let rang = Calendar.current.date(bySettingHour: 7, minute: 1, second: 0, of: .now)!
        XCTAssertEqual(store.pendingChecks(at: rang).first?.rang, Calendar.current.date(bySettingHour: 7, minute: 0, second: 0, of: .now))
        store.awake = rang
        XCTAssertTrue(store.pendingChecks(at: rang).isEmpty)
        UserDefaults().removePersistentDomain(forName: "check-test")
    }

    func testRoutineRunsStepsInOrder() {
        let store = Store(defaults: UserDefaults(suiteName: "horula-test-\(UUID())")!)
        store.timers = []
        store.startRoutine(Routine(name: "Run", steps: [Recent(dur: 300, label: "Warm up"), Recent(dur: 60)]))
        let id = store.timers[0].id
        XCTAssertEqual(Clockwork.stepText(store.timers[0].steps!, 0), "Warm up, 1 of 2")
        XCTAssertTrue(store.advance(id))
        XCTAssertEqual(store.timers[0].dur, 60)
        XCTAssertEqual(Clockwork.stepText(store.timers[0].steps!, 1), "Routine, 2 of 2")
        XCTAssertFalse(store.advance(id), "nothing after the last step")
    }

    func testNoiseStaysInRange() {
        for kind in ["white", "pink", "brown", "rain"] {
            var g = Clockwork.Noise(kind: kind), peak = 0.0
            for _ in 0..<44_100 { peak = max(peak, abs(g.next(.random(in: -1...1)))) }
            XCTAssert(peak > 0.01 && peak <= 1, "\(kind) peak \(peak)")
        }
    }

    func testMathProblem() {
        var g = SystemRandomNumberGenerator()
        for _ in 0..<200 {
            let p = Clockwork.mathProblem(using: &g), n = p.q.split(separator: " + ").compactMap { Int($0) }
            XCTAssertEqual(n.count, 2); XCTAssert(n.allSatisfy { (12...89).contains($0) }); XCTAssertEqual(n.reduce(0, +), p.a)
        }
    }
}

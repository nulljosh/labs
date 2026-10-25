import Foundation
import Observation
import UserNotifications
#if os(iOS)
import AlarmKit
import SwiftUI

/// What an alarm carries into the system alert.
struct HorulaAlarm: AlarmMetadata { var label = "" }
#endif

// The reason a native app exists: alarms ring with the app closed and the phone locked.
// iPhone uses AlarmKit (iOS 26), which rings through silent mode like Apple's Clock.
// Mac and Watch have no AlarmKit, so they fall back to time sensitive notifications.
// Every sync cancels what Horula scheduled and schedules the current list again: one source of truth, the Store.

@Observable
final class AlarmScheduler {
    var allowed: Bool?

    func sync(_ store: Store) async {
        #if os(iOS)
        let m = AlarmManager.shared
        if m.authorizationState == .notDetermined { _ = try? await m.requestAuthorization() }
        allowed = m.authorizationState == .authorized
        guard allowed == true else { return }
        for a in (try? m.alarms) ?? [] where a.countdownDuration == nil || a.schedule != nil { try? m.cancel(id: a.id) }
        var list = store.alarms.filter(\.on).map { ($0.id, $0.label.isEmpty ? "Alarm" : $0.label, $0.time, $0.days, $0.skip == nil ? nil : Clockwork.nextFire($0, after: .now)) }
        if store.sleep.on { list.append((Self.wakeID, "Good morning", store.sleep.wake, store.sleep.days, nil)) }
        for (id, label, time, days, skipTo) in list {
            let m2 = Clockwork.minutes(time)
            // ponytail: a skipped repeating alarm is scheduled once for its next real ring; the next sync restores the weekly rule
            let schedule: Alarm.Schedule = skipTo.map { .fixed($0) }
                ?? .relative(.init(time: .init(hour: m2 / 60, minute: m2 % 60), repeats: days.isEmpty ? .never : .weekly(days.map(Self.weekday))))
            let alert = AlarmPresentation.Alert(title: LocalizedStringResource(stringLiteral: label))
            let attributes = AlarmAttributes<HorulaAlarm>(presentation: AlarmPresentation(alert: alert), metadata: HorulaAlarm(label: label), tintColor: .horula)
            _ = try? await m.schedule(id: id, configuration: .alarm(schedule: schedule, attributes: attributes))
        }
        #else
        let c = UNUserNotificationCenter.current()
        allowed = (try? await c.requestAuthorization(options: [.alert, .sound])) ?? false
        c.removeAllPendingNotificationRequests()
        guard allowed == true else { return }
        for a in store.alarms where a.on {
            let m2 = Clockwork.minutes(a.time)
            let body = a.label.isEmpty ? "Alarm" : a.label
            for day in a.days.isEmpty ? [-1] : a.days {
                var when = DateComponents(); when.hour = m2 / 60; when.minute = m2 % 60
                if day >= 0 { when.weekday = day + 1 }
                await Self.notify(id: "\(a.id)-\(day)", title: body, at: when, repeats: !a.days.isEmpty)
            }
        }
        #endif
        await syncTimers(store)
    }

    /// Timers end as a notification everywhere for now. ponytail: AlarmKit countdowns need the Live Activity widget (v6 widgets step).
    func syncTimers(_ store: Store) async {
        let c = UNUserNotificationCenter.current()
        _ = try? await c.requestAuthorization(options: [.alert, .sound])
        c.removePendingNotificationRequests(withIdentifiers: store.timers.map { "timer-\($0.id)" } + ["timer-none"])
        for t in store.timers {
            guard let end = t.end, end > .now else { continue }
            let req = UNNotificationRequest(identifier: "timer-\(t.id)", content: Self.content(t.label.isEmpty ? "Timer" : t.label, "Done"),
                                            trigger: UNTimeIntervalNotificationTrigger(timeInterval: end.timeIntervalSinceNow, repeats: false))
            try? await c.add(req)
        }
    }

    static let wakeID = UUID(uuidString: "00000000-0000-0000-0000-00000000a1a1")!

    #if os(iOS)
    static func weekday(_ d: Int) -> Locale.Weekday {
        [.sunday, .monday, .tuesday, .wednesday, .thursday, .friday, .saturday][d]
    }
    #endif

    static func content(_ title: String, _ body: String) -> UNMutableNotificationContent {
        let n = UNMutableNotificationContent()
        n.title = title; n.body = body; n.sound = .defaultCritical; n.interruptionLevel = .timeSensitive
        return n
    }

    static func notify(id: String, title: String, at when: DateComponents, repeats: Bool) async {
        let req = UNNotificationRequest(identifier: id, content: content(title, "Alarm"), trigger: UNCalendarNotificationTrigger(dateMatching: when, repeats: repeats))
        try? await UNUserNotificationCenter.current().add(req)
    }
}

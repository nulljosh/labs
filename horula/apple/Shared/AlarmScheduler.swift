import Foundation
import Observation
import UserNotifications
#if os(iOS)
import AlarmKit
import SwiftUI
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
        var list = store.alarms.filter(\.on).map { ($0.id, $0.label.isEmpty ? "Alarm" : $0.label, $0.time, $0.days, $0.skip == nil ? nil : Clockwork.nextFire($0, after: .now), $0.snooze ? $0.snoozeMin : 0) }
        if store.sleep.on { list.append((Self.wakeID, "Good morning", store.sleep.wake, store.sleep.days, nil, store.sleep.snooze ? 9 : 0)) }
        for (id, label, time, days, skipTo, snooze) in list {
            let m2 = Clockwork.minutes(time)
            // ponytail: a skipped repeating alarm is scheduled once for its next real ring; the next sync restores the weekly rule
            let schedule: Alarm.Schedule = skipTo.map { .fixed($0) }
                ?? .relative(.init(time: .init(hour: m2 / 60, minute: m2 % 60), repeats: days.isEmpty ? .never : .weekly(days.map(Self.weekday))))
            // Snooze is AlarmKit's secondary button: it counts down snoozeMin minutes as a Live Activity, then rings again.
            let alert = snooze > 0
                ? AlarmPresentation.Alert(title: LocalizedStringResource(stringLiteral: label), secondaryButton: AlarmButton(text: "Snooze", textColor: .white, systemImageName: "zzz"), secondaryButtonBehavior: .countdown)
                : AlarmPresentation.Alert(title: LocalizedStringResource(stringLiteral: label))
            let presentation = AlarmPresentation(alert: alert, countdown: .init(title: "Snoozing"))
            let attributes = AlarmAttributes<HorulaAlarm>(presentation: presentation, metadata: HorulaAlarm(label: label), tintColor: .horula)
            let config = AlarmManager.AlarmConfiguration(countdownDuration: snooze > 0 ? .init(preAlert: nil, postAlert: TimeInterval(snooze * 60)) : nil, schedule: schedule, attributes: attributes)
            _ = try? await m.schedule(id: id, configuration: config)
        }
        // ponytail: each check's second ring is one fixed alarm for the next ring only; opening the app or tapping I'm Up schedules the next.
        for (a, rang) in store.pendingChecks() {
            let attributes = AlarmAttributes<HorulaAlarm>(presentation: AlarmPresentation(alert: .init(title: "Wake Up Check")), metadata: HorulaAlarm(label: a.label), tintColor: .horula)
            _ = try? await m.schedule(id: Self.checkID(a.id), configuration: .init(schedule: .fixed(rang.addingTimeInterval(Clockwork.checkGap)), attributes: attributes))
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
        for (a, rang) in store.pendingChecks() {
            let at = rang.addingTimeInterval(Clockwork.checkGap)
            try? await c.add(UNNotificationRequest(identifier: "check-\(a.id)", content: Self.content(String(localized: "Wake Up Check"), a.label.isEmpty ? String(localized: "Alarm") : a.label),
                                                   trigger: UNTimeIntervalNotificationTrigger(timeInterval: max(1, at.timeIntervalSinceNow), repeats: false)))
        }
        #endif
        await syncTimers(store)
    }

    /// iPhone: each running timer is an AlarmKit countdown, shown as a Live Activity and rung like an alarm.
    /// Elsewhere it ends as a notification. ponytail: a pause cancels the countdown and resume schedules what is left.
    func syncTimers(_ store: Store) async {
        #if os(iOS)
        let m = AlarmManager.shared
        guard m.authorizationState == .authorized else { return }
        for a in (try? m.alarms) ?? [] where a.schedule == nil { try? m.cancel(id: a.id) }
        for t in store.timers {
            guard let end = t.end, end > .now else { continue }
            let label = t.label.isEmpty ? "Timer" : t.label
            let presentation = AlarmPresentation(alert: .init(title: LocalizedStringResource(stringLiteral: label)), countdown: .init(title: LocalizedStringResource(stringLiteral: label)))
            let attributes = AlarmAttributes<HorulaAlarm>(presentation: presentation, metadata: HorulaAlarm(label: label), tintColor: .horula)
            _ = try? await m.schedule(id: t.id, configuration: .timer(duration: end.timeIntervalSinceNow, attributes: attributes))
        }
        return
        #endif
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
    /// The second ring of an alarm's Wake Up Check: the alarm's id with its first byte changed.
    static func checkID(_ id: UUID) -> UUID { UUID(uuidString: "C0" + id.uuidString.dropFirst(2))! }

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

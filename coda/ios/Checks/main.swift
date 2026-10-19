// Quote-bank + scoring self-check. The only non-trivial logic in the app.
//
//   node scripts/daily-expect.mjs > /tmp/daily.json && swiftc -o /tmp/quotablecheck ios/Quotable/Quote.swift ios/Quotable/Game.swift \
//     ios/Quotable/SharedStore.swift ios/Quotable/Daily.swift ios/Quotable/ChallengeLink.swift ios/Checks/main.swift && /tmp/quotablecheck quotes.json /tmp/daily.json

import Foundation

var checks = 0
func check(_ condition: @autoclosure () -> Bool, _ label: String) {
    checks += 1
    guard condition() else {
        FileHandle.standardError.write("FAIL: \(label)\n".data(using: .utf8)!)
        exit(1)
    }
}

let path = CommandLine.arguments.dropFirst().first ?? "quotes.json"
guard let data = FileManager.default.contents(atPath: path),
      let quotes = try? JSONDecoder().decode([Quote].self, from: data) else {
    FileHandle.standardError.write("FAIL: could not decode \(path)\n".data(using: .utf8)!)
    exit(1)
}

// --- quote bank ---
check(quotes.count > 250, "bank has \(quotes.count) entries, expected > 250")
var seen = Set<String>()
for q in quotes {
    check(q.options.count == 4, "\(q.answer): \(q.options.count) options, expected 4")
    check(Set(q.options).count == 4, "\(q.answer): duplicate options \(q.options)")
    check(q.options.contains(q.answer), "\(q.answer): answer missing from options")
    check(!q.quote.trimmingCharacters(in: .whitespaces).isEmpty, "empty quote for \(q.answer)")
    check(seen.insert(q.quote.lowercased()).inserted, "duplicate quote: \(q.quote)")
    if q.type == .movie { check(q.year != nil, "\(q.answer): movie entry without a year") }
}

// --- scoring ---
let sample = quotes[0]
let normal = Game(quotes: [sample])
normal.start(genre: nil, speed: false)
check(normal.choose(sample.answer), "correct answer not scored as correct")
check(normal.score == 10, "normal round scored \(normal.score), expected 10")
check(normal.streak == 1, "streak did not increment")

let miss = Game(quotes: [sample])
miss.start(genre: nil, speed: false)
_ = miss.choose(sample.answer)
miss.nextQuestion()          // pool is empty -> endGame, but streak must survive a wrong pick first
let streakBreak = Game(quotes: [sample])
streakBreak.start(genre: nil, speed: false)
_ = streakBreak.choose(sample.answer)
check(streakBreak.streak == 1, "setup: streak should be 1")
let wrongOption = sample.options.first { $0 != sample.answer }!
let second = Game(quotes: [sample])
second.start(genre: nil, speed: false)
check(second.choose(wrongOption) == false, "wrong answer scored as correct")
check(second.score == 0, "wrong answer awarded \(second.score) points")
check(second.streak == 0, "streak not reset on a miss")

// Speed round: full clock is a 10x multiplier, and the clock running out is a miss.
let speed = Game(quotes: [sample])
speed.start(genre: nil, speed: true)
check(speed.pendingPoints == 100, "full-clock bonus was \(speed.pendingPoints), expected 100")
_ = speed.choose(sample.answer)
check(speed.score == 100, "speed round scored \(speed.score), expected 100")

let timeout = Game(quotes: [sample])
timeout.start(genre: nil, speed: true)
var ticks = 0
while !timeout.isAnswered && ticks < 1000 { _ = timeout.tick(); ticks += 1 }
check(timeout.isAnswered, "clock never timed the question out")
check(timeout.score == 0, "timeout awarded \(timeout.score) points")
check(timeout.streak == 0, "timeout did not reset streak")

// Late ticks must not double-answer or drive the score negative.
_ = timeout.tick()
check(timeout.score == 0, "tick after answer changed the score")

// Genre filter only deals the requested genre.
let genre = quotes[0].genre
let filtered = Game(quotes: quotes)
filtered.start(genre: genre, speed: false)
check(filtered.current?.genre == genre, "genre filter dealt the wrong genre")


// Decade filter only deals that decade's dated lines.
let dated = Game(quotes: quotes)
let d = dated.decades.first!
dated.start(genre: nil, speed: false, decade: d)
check(dated.current?.year.map { $0 / 10 * 10 } == d, "decade filter dealt the wrong decade")

// The quote id matches difficulty.js (FNV-1a reference vectors), so web and native share tallies.
check(Quote(quote: "a", answer: "x", options: ["x"], genre: "g", type: .movie, year: nil, art: nil, source: nil).qid == "e40c292c", "qid differs from difficulty.js")
let hardOne = quotes[0]
check(hardOne.level([hardOne.qid: (plays: 20, correct: 2)]) == "hard", "a 10% hit rate should be hard")

// Handoff: a game handed to another device resumes at the same question, score and streak.
let phone = Game(quotes: quotes)
phone.start(genre: nil, speed: false)
phone.choose(phone.current!.answer)
phone.nextQuestion()
let mac = Game(quotes: quotes)
mac.resume(phone.handoff as [AnyHashable: Any])
check(mac.current == phone.current && mac.score == 10 && mac.streak == 1 && mac.phase == .playing, "handoff resumed somewhere else")
check(mac.pool.count == min(199, phone.pool.count), "handoff kept the rest of the deck")

// iMessage challenges speak the web's challenge link both ways.
let link = ChallengeLink(qids: ["0a1b2c3d", "deadbeef"], score: 30, name: "Ann Lee")
check(ChallengeLink(url: link.url) == link, "challenge link round trip")
let fromWeb = ChallengeLink(url: URL(string: "https://coda.jaybulb.com/play?c=0a1b2c3d.nothex!.deadbeef&s=20&n=Your+friend")!)
check(fromWeb?.qids == ["0a1b2c3d", "deadbeef"] && fromWeb?.score == 20 && fromWeb?.name == "Your friend", "web challenge link decoded")
check(ChallengeLink(url: URL(string: "https://coda.jaybulb.com/play")!) == nil, "a plain play link is no challenge")

// The Daily Quote matches daily.js day for day (the widget and the web show the same line).
struct Expected: Decodable { let day: Int; let quote: String; let options: [String] }
if CommandLine.arguments.count > 2, let raw = FileManager.default.contents(atPath: CommandLine.arguments[2]),
   let expected = try? JSONDecoder().decode([Expected].self, from: raw) {
    for e in expected {
        let got = Daily.quote(for: e.day, in: quotes)
        check(got?.quote.quote == e.quote && got?.options == e.options, "Daily #\(e.day) differs from daily.js")
    }
    check(Daily.dayNumber(Daily.epoch) == 1 && Daily.dayNumber(Daily.epoch.addingTimeInterval(86_399)) == 1, "Daily #1 is the epoch's UTC day")
}

print("ok — \(checks) checks, \(quotes.count) quotes")

import CoreGraphics
import ImageIO
import Observation
import SwiftUI

struct ContentView: View {
    @State private var game = Game()
    @State private var genre = MenuView.allGenres
    @State private var decade = 0  // 0 = all decades
    @State private var level = "all"
    @AppStorage("quotable_haptics_on") private var hapticsOn = true
    @AppStorage("quotable_sfx_on") private var sfxOn = true
    @AppStorage("quotable_sfx_vol") private var sfxVolume = 60.0
    @State private var showAccount = false
    @State private var showBoard = false
    @State private var showSettings = false
    @State private var showDuel = false
    @State private var duel: Duel?
    @AppStorage("quotestreak_launch") private var launch = ""   // set by SpeedRoundIntent (Siri, Shortcuts)

    var body: some View {
        NavigationStack {
            Group {
                switch game.phase {
                case .menu: MenuView(game: game, genre: $genre, decade: $decade, level: $level, showDuel: $showDuel)
                case .playing: RoundView(game: game, hapticsOn: hapticsOn, sfxOn: sfxOn, sfxVolume: sfxVolume)
                case .over: GameOverView(game: game, duel: duel)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background { Backdrop(quotes: game.quotes, paused: game.phase == .playing && game.speedMode).ignoresSafeArea() }
            .background(Theme.canvas)
            .font(.quip(.body))
            .tint(Theme.accentStroke)   // the genre picker and toolbar, not system blue
            .navigationTitle("Coda")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            #if DEBUG
            // Store screenshots: `-shot question|reveal|speed` opens straight onto that screen.
            .onAppear {
                switch UserDefaults.standard.string(forKey: "shot") {
                case "question", "reveal": game.start(genre: nil, speed: false)
                case "speed": game.start(genre: nil, speed: true)
                default: break
                }
            }
            #endif
            .task { await Account.shared.loadStats(into: game) }
            .onAppear { takeLaunch() }
            // Handoff: a game in progress shows up on your other devices; picking it up there resumes it.
            .userActivity(Game.handoffType, isActive: game.phase == .playing && duel == nil) { activity in
                activity.title = "Coda game"
                activity.isEligibleForHandoff = true
                activity.addUserInfoEntries(from: game.handoff)
            }
            .onContinueUserActivity(Game.handoffType) { activity in
                if let info = activity.userInfo, game.phase != .playing { game.resume(info) }
            }
            .onChange(of: launch) { _, _ in takeLaunch() }
            .sheet(isPresented: $showAccount) { AccountSheet() }
            .sheet(isPresented: $showBoard) { LeaderboardSheet(speed: game.speedMode) }
            .sheet(isPresented: $showSettings) { SettingsSheet(hapticsOn: $hapticsOn, sfxOn: $sfxOn, sfxVolume: $sfxVolume) }
            .sheet(isPresented: $showDuel) { DuelSheet(game: game, duel: $duel) }
            // A duel hears every answer and the end of the run; leaving the game-over screen closes it.
            .onChange(of: game.answeredCount) { _, n in if n > 0 { duel?.answered(score: game.score, count: n) } }
            .onChange(of: game.phase) { _, phase in
                if phase == .playing, duel == nil { Account.shared.beginGame(speed: game.speedMode) }   // fair play (v87)
                if phase == .over { duel?.finish(score: game.score) }
                if phase == .menu { duel?.close(); duel = nil }
            }
            .toolbar {
                if game.phase != .playing {
                    ToolbarItem(placement: .primaryAction) {
                        Button { showBoard = true } label: { Label("Leaderboard", systemImage: "list.number") }
                    }
                    ToolbarItem(placement: .primaryAction) {
                        Button { showAccount = true } label: { Label("Account", systemImage: "person.crop.circle") }
                    }
                    ToolbarItem(placement: .primaryAction) {
                        Button { showSettings = true } label: { Label("Settings", systemImage: "gearshape") }
                    }
                }
                if game.phase == .playing {
                    if let duel {
                        ToolbarItem(placement: .primaryAction) {
                            Text("Them \(duel.them)").font(.quip(.headline)).foregroundStyle(.secondary).contentTransition(.numericText())
                        }
                    }
                    ToolbarItem(placement: .primaryAction) {
                        Text("\(game.score)").font(.quip(.headline, weight: .bold)).contentTransition(.numericText())
                    }
                    ToolbarItem(placement: .primaryAction) {
                        Label("\(game.streak)", systemImage: "flame.fill")
                            .labelStyle(.titleAndIcon)
                            .contentTransition(.numericText())
                            .symbolEffect(.bounce, value: game.streak)
                            .foregroundStyle(game.streak > 0 ? .orange : .secondary)
                    }
                }
            }
        }
    }
}

private extension ContentView {
    /// A Siri or Shortcuts launch: start what it asked for once, then clear it.
    func takeLaunch() {
        guard launch == "speed" else { return }
        launch = ""
        if game.phase != .playing { game.start(genre: nil, speed: true) }
    }
}

private struct MenuView: View {
    static let allGenres = "All genres"

    let game: Game
    @Binding var genre: String
    @Binding var decade: Int
    @Binding var level: String
    @Binding var showDuel: Bool

    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            Quip(pose: "idle")
            Text("Guess the movie, show, game, song or book from the line.")
                .font(.quip(.title3, weight: .medium))
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)

            Picker("Genre", selection: $genre) {
                Text(LocalizedStringKey(Self.allGenres)).tag(Self.allGenres)
                ForEach(game.genres, id: \.self) { g in
                    Text(Theme.label(for: g)).tag(g)
                }
            }
            .pickerStyle(.menu)

            Picker("Decade", selection: $decade) {
                Text("All decades").tag(0)
                ForEach(game.decades, id: \.self) { d in Text(verbatim: "\(d)s").tag(d) }
            }
            .pickerStyle(.menu)

            Picker("Difficulty", selection: $level) {
                Text("Any difficulty").tag("all")
                Text("Easy").tag("easy")
                Text("Medium").tag("medium")
                Text("Hard").tag("hard")
            }
            .pickerStyle(.menu)

            VStack(spacing: 12) {
                Button("Play") { game.start(genre: selectedGenre, speed: false, decade: decade == 0 ? nil : decade, level: level == "all" ? nil : level) }
                    .buttonStyle(PrimaryButtonStyle())
                Button("Speed Round (10s)") { game.start(genre: selectedGenre, speed: true, decade: decade == 0 ? nil : decade, level: level == "all" ? nil : level) }
                    .buttonStyle(SecondaryButtonStyle())
                Button("Live duel") { showDuel = true }
                    .buttonStyle(SecondaryButtonStyle())
                #if os(visionOS)
                PosterWallButton()
                #endif
            }

            if game.highScore > 0 {
                Text("High score: \(game.highScore)").font(.quip(.footnote)).foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding(28)
    }

    private var selectedGenre: String? { genre == Self.allGenres ? nil : genre }
}

private struct SettingsSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Binding var hapticsOn: Bool
    @Binding var sfxOn: Bool
    @Binding var sfxVolume: Double

    var body: some View {
        NavigationStack {
            Form {
                Toggle("Haptics", isOn: $hapticsOn)
                Toggle("Sound effects", isOn: $sfxOn)
                if sfxOn {
                    LabeledContent("Volume") {
                        Slider(value: $sfxVolume, in: 0...100)
                    }
                }
            }
            .tint(Theme.accent)
            .navigationTitle("Settings")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

private struct RoundView: View {
    let game: Game
    let hapticsOn: Bool
    let sfxOn: Bool
    let sfxVolume: Double

    @State private var flashedArt: URL?
    @State private var flashToken = 0
    @State private var art = ArtLoader()
    @State private var burst: Burst?

    private let clock = Timer.publish(every: Game.tickInterval, on: .main, in: .common).autoconnect()

    var body: some View {
        // Scrolls at the largest Dynamic Type sizes instead of clipping; centred whenever it fits.
        GeometryReader { geo in
        ScrollView {
        VStack(spacing: 20) {
            Spacer(minLength: 0)
            if game.speedMode { TimerRing(timeLeft: game.timeLeft) }

            if let quote = game.current {
                let badge = Theme.badge(for: quote.genre)
                Text(Theme.label(for: quote.genre))
                    .font(.quip(.caption, weight: .bold))
                    .padding(.horizontal, 10).padding(.vertical, 5)
                    .background(badge.background, in: Capsule())
                    .foregroundStyle(badge.foreground)

                Text(LocalizedStringKey(quote.prompt)).font(.quip(.subheadline, weight: .semibold)).foregroundStyle(.secondary)

                Text("\u{201C}\(quote.quote)\u{201D}")
                    .font(.quip(.title2, weight: .semibold))
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .id(quote.id)
                    .transition(.opacity)

                VStack(spacing: 10) {
                    ForEach(quote.options.shuffledStably(seed: quote.id), id: \.self) { option in
                        Button { answer(option) } label: { Text(option) }
                        .buttonStyle(AnswerButtonStyle(state: state(for: option, answer: quote.answer)))
                        // Not .disabled(): a disabled button renders its tint washed out,
                        // which hides the green/red answer reveal.
                        .allowsHitTesting(!game.isAnswered)
                    }
                }

                if let correct = game.lastWasCorrect {
                    Text(correct
                         ? (game.streak % 5 == 0 ? "\(game.streak) in a row! +\(game.lastPoints)" : "Correct! +\(game.lastPoints)")
                         : "Nope, it was \u{201C}\(quote.answer)\u{201D}")
                        .font(.quip(.headline, weight: .bold))
                        .foregroundStyle(correct ? .green : .red)
                }
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: 560 * Theme.padScale)   // a reading column, not edge to edge on a wide Mac window
        .padding(24)
        .frame(maxWidth: .infinity, minHeight: geo.size.height)
        }
        .scrollBounceBehavior(.basedOnSize)
        }
        .animation(.default, value: game.current)
        .sensoryFeedback(.success, trigger: game.lastWasCorrect) { _, new in hapticsOn && new == true }
        .sensoryFeedback(.error, trigger: game.lastWasCorrect) { _, new in hapticsOn && new == false }
        .onReceive(clock) { _ in
            if game.tick() {
                react(correct: false)
                advanceAfterDelay()
            }
        }
        .overlay { if let burst { ConfettiView(burst: burst).id(burst.start) } }
        .background { ArtFlash(url: flashedArt, cached: art.image(for: flashedArt)).ignoresSafeArea().animation(.easeInOut(duration: 0.25), value: flashedArt) }
        .onChange(of: game.current) { _, quote in art.prefetch(quote?.art) }
        .onAppear {
            art.prefetch(game.current?.art)
            #if DEBUG
            if UserDefaults.standard.string(forKey: "shot") == "reveal", let right = game.current?.answer {
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { answer(right) }
            }
            #endif
        }
    }

    /// game.js fades the movie poster / album art in as the background on a correct answer.
    private func react(correct: Bool) {
        if sfxOn {
            correct ? Sound.correct(volume: sfxVolume / 100, streak: game.streak) : Sound.wrong(volume: sfxVolume / 100)
        }
        if correct { burst = Burst(count: game.streak % 5 == 0 ? 60 : 24) }
        guard correct, let url = game.current?.art else { return }
        flashedArt = url
        // Back-to-back correct answers: the previous dismiss is still pending and would
        // cut this flash short, so only the newest one is allowed to clear it.
        flashToken += 1
        let token = flashToken
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.95) {
            if flashToken == token { flashedArt = nil }
        }
    }

    private func state(for option: String, answer: String) -> AnswerButtonStyle.State {
        guard game.isAnswered else { return .open }
        if option == answer { return .right }
        return option == game.pickedAnswer ? .wrong : .spent
    }

    private func answer(_ option: String) {
        let asked = game.current
        let correct = game.choose(option)
        if let asked { Account.shared.tally(asked, correct: correct) }
        react(correct: correct)
        advanceAfterDelay()
    }

    private func advanceAfterDelay() {
        #if DEBUG
        if UserDefaults.standard.string(forKey: "shot") == "reveal" { return }   // hold the reveal for the screenshot
        #endif
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.1) {
            guard game.phase == .playing else { return }
            game.nextQuestion()
        }
    }
}

private struct ArtFlash: View {
    let url: URL?
    let cached: Image?

    // Port of the web `#art-flash`: full-bleed cover at 0.35 opacity behind the content,
    // faded in and out, never a floating card.
    var body: some View {
        if let url {
            Group {
                if let cached {
                    cached.resizable().scaledToFill()
                } else {
                    // Only reached if the prefetch has not landed yet; AsyncImage has the
                    // rest of the 0.95s reveal to catch up.
                    AsyncImage(url: url) { image in
                        image.resizable().scaledToFill()
                    } placeholder: {
                        Color.clear
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .clipped()
            .opacity(0.35)
            .transition(.opacity)
            .allowsHitTesting(false)
        }
    }
}

private struct TimerRing: View {
    let timeLeft: Double

    var body: some View {
        ZStack {
            Circle().stroke(.quaternary, lineWidth: 6)
            Circle()
                .trim(from: 0, to: max(0, timeLeft / Game.timeLimit))
                .stroke(Theme.accentStroke, style: .init(lineWidth: 6, lineCap: .round))
                .rotationEffect(.degrees(-90))
            Text("\(Int(timeLeft.rounded(.up)))").font(.quip(.headline, weight: .bold))
        }
        .frame(width: 64, height: 64)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(Int(timeLeft.rounded(.up))) seconds left")
    }
}

private struct GameOverView: View {
    let game: Game
    let duel: Duel?
    private var newHigh: Bool { game.score > 0 && game.score == game.highScore }

    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            Quip(pose: newHigh ? "cheer" : game.score > 0 ? "idle" : "oops")
            Text("Game Over").font(.quip(.largeTitle, weight: .bold))
            Text("Final score: \(game.score) · High score: \(game.highScore)").font(.quip(.title3))
            if let duel {
                Text(duel.verdict).font(.quip(.headline, weight: .bold)).multilineTextAlignment(.center)
            }
            if newHigh {
                Text("New high score!").font(.quip(.headline, weight: .bold)).foregroundStyle(Theme.accentStroke)
            }
            Button("Play Again") { game.backToMenu() }
                .buttonStyle(PrimaryButtonStyle())
            ShareLink(item: "I scored \(game.score) on Coda! Can you beat me? https://coda.jaybulb.com")
            Spacer()
        }
        .padding(28)
        .overlay { if newHigh { ConfettiView(burst: Burst(count: 80)) } }
        .task { if duel == nil { await Account.shared.submit(score: game.score, speed: game.speedMode, run: game.run) } }  // duels stay off the board, like the web
    }
}

private extension Array {
    /// Shuffle once per question rather than on every SwiftUI body evaluation,
    /// which would reorder the buttons under the user's finger.
    func shuffledStably(seed: String) -> [Element] {
        var generator = SeededGenerator(seed: seed)
        return shuffled(using: &generator)
    }
}

private struct SeededGenerator: RandomNumberGenerator {
    private var state: UInt64

    init(seed: String) {
        state = seed.utf8.reduce(UInt64(0xcbf29ce484222325)) { ($0 ^ UInt64($1)) &* 0x100000001b3 }
        if state == 0 { state = 0x9e3779b97f4a7c15 }
    }

    mutating func next() -> UInt64 {
        state ^= state << 13
        state ^= state >> 7
        state ^= state << 17
        return state
    }
}

/// Artwork is fetched as soon as a question appears, so a correct answer can flash it
/// immediately rather than racing AsyncImage against the 0.95s reveal — the same reason
/// game.js preloads it in nextQuestion(). Decoded via ImageIO so one implementation
/// serves both iOS and macOS without a UIImage/NSImage branch.
@Observable
final class ArtLoader {
    private var cache: [URL: Image] = [:]
    private var inFlight: Set<URL> = []

    func image(for url: URL?) -> Image? {
        guard let url else { return nil }
        return cache[url]
    }

    func prefetch(_ url: URL?) {
        guard let url, cache[url] == nil, !inFlight.contains(url) else { return }
        inFlight.insert(url)
        URLSession.shared.dataTask(with: url) { [weak self] data, _, _ in
            let image = data.flatMap(Self.decode)
            DispatchQueue.main.async {
                guard let self else { return }
                self.inFlight.remove(url)
                // A failed load stays uncached: the flash falls back to AsyncImage and,
                // failing that, simply does not appear.
                if let image { self.cache[url] = image }
            }
        }.resume()
    }

    private static func decode(_ data: Data) -> Image? {
        guard let source = CGImageSourceCreateWithData(data as CFData, nil),
              let cgImage = CGImageSourceCreateImageAtIndex(source, 0, nil) else { return nil }
        return Image(decorative: cgImage, scale: 1)
    }
}

/// Port of the web `#backdrop`: a static poster/album mosaic at low opacity behind
/// the whole game. Static on purpose — the speed round is a timed attention task.
private struct Backdrop: View {
    let quotes: [Quote]
    /// Frozen during the speed round, like the web's body.speed: motion there fights the clock.
    var paused = false
    @Environment(\.colorScheme) private var scheme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private struct Tile: Identifiable {
        let id: URL
        let square: Bool
    }

    /// Thumbnails, not the w500 art the flash uses; deduped; shuffled once per launch.
    private var tiles: [Tile] {
        var seen = Set<URL>()
        return quotes.compactMap { q -> Tile? in
            guard let art = q.art, seen.insert(art).inserted else { return nil }
            let thumb = art.absoluteString
                .replacingOccurrences(of: "/w500/", with: "/w185/")
                .replacingOccurrences(of: "/600x600bb.jpg", with: "/200x200bb.jpg")
            return Tile(id: URL(string: thumb) ?? art, square: q.type == .music)
        }
    }

    var body: some View {
        let all = tiles
        GeometryReader { geo in
            let cols = max(3, Int((geo.size.width / 110).rounded(.up)))
            let per = Int((geo.size.height / 140).rounded(.up)) + 1
            if all.count >= 8 {
                let shuffled = all.shuffledStably(seed: "backdrop")
                let tileW = (geo.size.width - 16 - 8 * CGFloat(cols - 1)) / CGFloat(cols)
                TimelineView(.animation(minimumInterval: 1 / 30, paused: paused || reduceMotion)) { tl in
                    let now = tl.date.timeIntervalSinceReferenceDate
                    HStack(alignment: .top, spacing: 8) {
                        ForEach(0..<cols, id: \.self) { c in
                            let col = (0..<per).map { shuffled[(c * per + $0) % shuffled.count] }
                            // Doubled, so shifting by one copy's height loops seamlessly (the web's -50%).
                            let loop = col.reduce(0) { $0 + tileW * ($1.square ? 1 : 1.5) + 8 }
                            let phase = (now / (80 + Double(c) * 13)).truncatingRemainder(dividingBy: 1)
                            VStack(spacing: 8) {
                                ForEach(Array((col + col).enumerated()), id: \.offset) { _, t in
                                    AsyncImage(url: t.id) { $0.resizable().scaledToFill() } placeholder: { Color.clear }
                                        .frame(width: tileW, height: tileW * (t.square ? 1 : 1.5))
                                        .clipShape(RoundedRectangle(cornerRadius: 6))
                                }
                            }
                            .offset(y: -loop * (c.isMultiple(of: 2) ? phase : 1 - phase))
                        }
                    }
                    .padding(8)
                }
                // Lower than the web's 0.22/0.14: native text sits on the wall with no card behind it.
                .opacity(scheme == .dark ? 0.1 : 0.08)
            }
        }
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }
}

struct Burst {
    let count: Int
    let start = Date()
}

/// Port of the web confetti: pieces fly out from the middle, fall, and fade, over 1.1s.
private struct ConfettiView: View {
    let burst: Burst
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var done = false

    private static let colors: [Color] = [Theme.accent, .white, Color(hex: "ff6fae"), Color(hex: "34c759"), Color(hex: "ff6b35")]
    private struct Piece { let dx, dy, spin: Double; let color: Color }

    private var pieces: [Piece] {
        var rng = SeededGenerator(seed: "\(burst.start.timeIntervalSinceReferenceDate)")
        let reach = burst.count > 30 ? 260.0 : 160.0
        return (0..<burst.count).map { i in
            let a = Double.random(in: 0..<(2 * .pi), using: &rng)
            let d = 80 + Double.random(in: 0..<reach, using: &rng)
            return Piece(dx: cos(a) * d, dy: sin(a) * d - 60, spin: .random(in: -2 * .pi...2 * .pi, using: &rng),
                         color: Self.colors[i % Self.colors.count])
        }
    }

    var body: some View {
        if !reduceMotion && !done {
            let all = pieces
            TimelineView(.animation) { tl in
                let t = min(1, tl.date.timeIntervalSince(burst.start) / 1.1)
                Canvas { ctx, size in
                    guard t < 1 else { return }
                    let ease = 1 - pow(1 - t, 3)
                    ctx.opacity = t < 0.7 ? 1 : (1 - t) / 0.3
                    for p in all {
                        var c = ctx
                        c.translateBy(x: size.width / 2 + p.dx * ease, y: size.height / 2 + p.dy * ease + 140 * t * t)
                        c.rotate(by: .radians(p.spin * ease))
                        c.fill(Path(roundedRect: CGRect(x: -5, y: -7, width: 10, height: 14), cornerRadius: 2), with: .color(p.color))
                    }
                }
            }
            .allowsHitTesting(false)
            .accessibilityHidden(true)
            // Drop the view once it has played, or TimelineView keeps ticking at 60fps for nothing.
            .task { try? await Task.sleep(for: .seconds(1.2)); done = true }
        }
    }
}

/// Quip, the mascot (brand/Quip.xcassets, drawn by brand/mascot.py), with a gentle bob.
private struct Quip: View {
    let pose: String
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var up = false

    var body: some View {
        Image("quip-\(pose)")
            .resizable().scaledToFit()
            .frame(width: 112 * Theme.padScale, height: 112 * Theme.padScale)
            .offset(y: up ? -6 : 0)
            .rotationEffect(.degrees(up ? -2 : 0))
            .accessibilityHidden(true)
            .onAppear {
                guard !reduceMotion else { return }
                withAnimation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true)) { up = true }
            }
    }
}

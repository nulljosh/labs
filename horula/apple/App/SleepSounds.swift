import AVFoundation
import SwiftUI

/// Sleep sounds: noise made on the device as it plays, nothing bundled, fading out over the last minute of the sleep timer.
@Observable
final class SleepSounds {
    static let shared = SleepSounds()
    private(set) var end: Date?
    @ObservationIgnored private var engine: AVAudioEngine?
    @ObservationIgnored private var fade: Task<Void, Never>?

    func play(_ kind: String, minutes: Int) {
        stop()
        #if os(iOS)
        try? AVAudioSession.sharedInstance().setCategory(.playback)   // keeps playing with the phone locked (background audio)
        try? AVAudioSession.sharedInstance().setActive(true)
        #endif
        let e = AVAudioEngine(), format = AVAudioFormat(standardFormatWithSampleRate: 44_100, channels: 1)!
        var gen = Clockwork.Noise(kind: kind)
        let source = AVAudioSourceNode(format: format) { _, _, frames, list in
            for b in UnsafeMutableAudioBufferListPointer(list) {
                let p = b.mData!.assumingMemoryBound(to: Float.self)
                for i in 0..<Int(frames) { p[i] = Float(gen.next(.random(in: -1...1))) }
            }
            return noErr
        }
        e.attach(source); e.connect(source, to: e.mainMixerNode, format: format)
        e.mainMixerNode.outputVolume = 0
        guard (try? e.start()) != nil else { return }
        let end = Date.now.addingTimeInterval(TimeInterval(minutes * 60)), start = Date.now
        engine = e; self.end = end
        fade = Task { @MainActor [weak self] in
            while !Task.isCancelled {
                let left = end.timeIntervalSinceNow
                if left <= 0 { self?.stop(); return }
                e.mainMixerNode.outputVolume = Float(min(1, Date.now.timeIntervalSince(start) / 3, left / 60)) * 0.5
                try? await Task.sleep(for: .milliseconds(250))
            }
        }
    }

    func stop() {
        fade?.cancel(); fade = nil
        engine?.stop(); engine = nil; end = nil
    }
}

/// Under Sleep | Wake Up: pick a noise and how long it plays, like the sleep timer in Rise and Calm.
struct SleepSoundsSection: View {
    @AppStorage("nzKind") private var kind = "pink"
    @AppStorage("nzFor") private var minutes = 30
    private let sounds = SleepSounds.shared

    var body: some View {
        Section("Sleep Sounds") {
            Picker("Sound", selection: $kind) { Text("White Noise").tag("white"); Text("Pink Noise").tag("pink"); Text("Brown Noise").tag("brown"); Text("Rain").tag("rain") }
            Picker("Stop After", selection: $minutes) { ForEach([15, 30, 45, 60, 90, 120], id: \.self) { Text(Clockwork.durationText(TimeInterval($0 * 60))).tag($0) } }
            HStack {
                if let end = sounds.end { Text("Stops at \(end.formatted(date: .omitted, time: .shortened))").foregroundStyle(.secondary) }
                Spacer()
                Button(sounds.end == nil ? "Play" : "Stop") { sounds.end == nil ? sounds.play(kind, minutes: minutes) : sounds.stop() }
                    .buttonStyle(.bordered).buttonBorderShape(.capsule).tint(sounds.end == nil ? .green : nil)
            }
        }
        .onChange(of: kind) { if sounds.end != nil { sounds.play(kind, minutes: minutes) } }
        .onChange(of: minutes) { if sounds.end != nil { sounds.play(kind, minutes: minutes) } }
    }
}

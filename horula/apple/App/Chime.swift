import AVFoundation

/// The web's Chimes tone (three notes, made on the device, nothing bundled), for the nightstand's hourly chime, and spoken interval cues.
enum Chime {
    private static var player: AVAudioPlayer?

    static func play(volume: Float = 0.4) {
        #if os(iOS)
        try? AVAudioSession.sharedInstance().setCategory(.ambient)   // mixes with music and stays quiet on silent
        #endif
        player = try? AVAudioPlayer(data: wav)
        player?.volume = volume
        player?.play()
    }

    private static let voice = AVSpeechSynthesizer()
    /// Says an interval cue out loud in the reader's language.
    static func say(_ text: String) {
        #if os(iOS)
        try? AVAudioSession.sharedInstance().setCategory(.playback, options: [.duckOthers, .mixWithOthers])   // over the workout music, not instead of it
        #endif
        voice.speak(AVSpeechUtterance(string: text))
    }

    /// 16 bit mono WAV of the notes in core.js: 1047, 1319 and 1568 Hz, a quarter second apart, each fading out over 0.3 s.
    private static let wav: Data = {
        let rate = 44_100, notes: [(Double, Double)] = [(1047, 0), (1319, 0.25), (1568, 0.5)]
        var pcm = [Int16](repeating: 0, count: Int(0.85 * Double(rate)))
        for (f, at) in notes {
            let start = Int(at * Double(rate))
            for i in 0..<Int(0.3 * Double(rate)) where start + i < pcm.count {
                let t = Double(i) / Double(rate), env = min(1, t / 0.02) * exp(-t * 15)
                let v = Int(pcm[start + i]) + Int(sin(2 * .pi * f * t) * env * 9000)
                pcm[start + i] = Int16(clamping: v)
            }
        }
        var d = Data()
        func put<T>(_ v: T) { withUnsafeBytes(of: v) { d.append(contentsOf: $0) } }
        let bytes = UInt32(pcm.count * 2)
        d.append(contentsOf: Array("RIFF".utf8)); put((36 + bytes).littleEndian); d.append(contentsOf: Array("WAVEfmt ".utf8))
        put(UInt32(16).littleEndian); put(UInt16(1).littleEndian); put(UInt16(1).littleEndian)
        put(UInt32(rate).littleEndian); put(UInt32(rate * 2).littleEndian); put(UInt16(2).littleEndian); put(UInt16(16).littleEndian)
        d.append(contentsOf: Array("data".utf8)); put(bytes.littleEndian)
        pcm.forEach { put($0.littleEndian) }
        return d
    }()
}

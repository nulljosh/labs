import AVFoundation

/// The web game's sound kit (sound.js, v94) at the user's chosen volume. Synthesised rather than shipped as audio files so the tones
/// stay identical to the oscillator the browser builds.
enum Sound {
    private static let engine = AVAudioEngine()
    private static var phase = 0.0
    private static var phaseStep = 0.0
    private static var remaining = 0
    private static var amplitude = 0.0
    private static var started = false

    static func play(frequency: Double, duration: Double, volume: Double) {
        guard volume > 0 else { return }
        start()
        let rate = engine.outputNode.inputFormat(forBus: 0).sampleRate
        phase = 0
        phaseStep = 2 * .pi * frequency / rate
        amplitude = volume * 0.2
        remaining = Int(duration * rate)
    }

    /// The sound kit (v94), note for note the web's sound.js: [frequency, start, length] per note.
    static let cues: [String: [(Double, Double, Double)]] = [
        "right": [(660, 0, 0.09), (880, 0.08, 0.12)],
        "streak": [(660, 0, 0.08), (880, 0.07, 0.08), (1100, 0.14, 0.16)],
        "wrong": [(196, 0, 0.22)],
        "tick": [(1000, 0, 0.04)],
        "badge": [(1320, 0, 0.06), (1760, 0.06, 0.1)],
        "over": [(523, 0, 0.12), (392, 0.12, 0.12), (330, 0.24, 0.22)],
    ]
    static func cue(_ name: String, volume: Double) {
        for (f, at, len) in cues[name] ?? [] {
            DispatchQueue.main.asyncAfter(deadline: .now() + at) { play(frequency: f, duration: len, volume: volume) }
        }
    }

    static func correct(volume: Double, streak: Int = 1) { cue(streak > 0 && streak % 5 == 0 ? "streak" : "right", volume: volume) }
    static func wrong(volume: Double) { cue("wrong", volume: volume) }

    private static func start() {
        guard !started else { return }
        let format = engine.outputNode.inputFormat(forBus: 0)
        let source = AVAudioSourceNode { _, _, frameCount, buffers in
            let out = UnsafeMutableAudioBufferListPointer(buffers)
            for frame in 0..<Int(frameCount) {
                var sample = 0.0
                // Reading the shared state off the audio thread is safe here: only whole
                // Doubles/Ints are touched and a torn beep is inaudible.
                if remaining > 0 {
                    sample = sin(phase) * amplitude
                    phase += phaseStep
                    remaining -= 1
                }
                for buffer in out {
                    buffer.mData?.assumingMemoryBound(to: Float.self)[frame] = Float(sample)
                }
            }
            return noErr
        }
        engine.attach(source)
        engine.connect(source, to: engine.mainMixerNode, format: format)
        #if os(iOS)
        try? AVAudioSession.sharedInstance().setCategory(.ambient, options: [.mixWithOthers])
        try? AVAudioSession.sharedInstance().setActive(true)
        #endif
        try? engine.start()
        started = engine.isRunning
    }
}

import AVFoundation
import Observation
import WebRTC

/// One person at a time: hold the camera, talk to the lobby, rebuild one peer connection per
/// stranger, and mirror the server's call clock. The native twin of web/chat.js.
@MainActor @Observable
final class Call: NSObject {
    enum State { case idle, searching, connecting, connected }
    struct Line: Identifiable { let id = UUID(); let text: String; let mine: Bool }

    private(set) var state = State.idle
    private(set) var note = ""
    private(set) var deadline: Date?
    private(set) var asked: String?            // "extend" or "keep" when the other side asked first
    private(set) var kept: String?             // their handle, once both kept
    private(set) var lines: [Line] = []
    private(set) var localVideo: RTCVideoTrack?
    private(set) var remoteVideo: RTCVideoTrack?
    /// A practice call with Iri, the mascot, while the lobby is empty. Local only: you stay
    /// queued and a real match replaces it. Mirrors web/chat.js.
    private(set) var practicing = false

    static let iriLines = [
        "ooh, tell me more",
        "I only speak monkey, but I like you",
        "real strangers are way more fun than me",
        "ha!",
        "hang tight, a real person usually turns up soon",
    ]

    @ObservationIgnored private let lobby = Lobby()
    @ObservationIgnored private let factory: RTCPeerConnectionFactory = {
        RTCInitializeSSL()
        return RTCPeerConnectionFactory(encoderFactory: RTCDefaultVideoEncoderFactory(),
                                        decoderFactory: RTCDefaultVideoDecoderFactory())
    }()
    @ObservationIgnored private var capturer: RTCCameraVideoCapturer?
    @ObservationIgnored private var localAudio: RTCAudioTrack?
    @ObservationIgnored private var pc: RTCPeerConnection?
    @ObservationIgnored private var pending: [RTCIceCandidate] = []
    @ObservationIgnored private var ice: [RTCIceServer] = []
    @ObservationIgnored private var handle = ""
    @ObservationIgnored private var practiceTasks: [Task<Void, Never>] = []

    override init() {
        super.init()
        lobby.onMessage = { [weak self] in self?.onServer($0) }
        lobby.onClose = { [weak self] in
            #if DEBUG
            print("irisa lobby closed")
            #endif
            guard let self, self.state != .idle else { return }
            self.stop("Connection lost. Check your network, then tap Start again.")
        }
    }

    // MARK: - Start and stop

    func start(handle: String) async {
        guard state == .idle else { return }
        self.handle = handle
        let device = Self.camera()
        if let device {
            note = "Requesting camera..."
            let camera = await AVCaptureDevice.requestAccess(for: .video)
            let mic = await AVCaptureDevice.requestAccess(for: .audio)
            guard camera, mic else {
                note = "Allow camera and microphone for Irisa in Settings, then tap Start again."
                return
            }
            startCamera(device)
            localAudio = factory.audioTrack(withTrackId: "a0")
        } else {
            #if DEBUG
            // ponytail: debug only. A Mac with no camera can still receive, so a build can be
            // tested against a browser. Release never lets anyone watch without being seen.
            note = "No camera. Debug build: receiving only."
            #else
            note = "No camera was found. Irisa needs one to start a call."
            return
            #endif
        }
        #if DEBUG
        print("irisa start", note)
        #endif
        ice = await Lobby.iceServers()
        lobby.connect()
        lobby.send(["type": "find", "handle": handle])
        state = .searching
        note = "Looking for someone..."
    }

    func stop(_ message: String = "") {
        endPractice()
        resetPeer()
        lobby.close()
        capturer?.stopCapture()
        capturer = nil
        localVideo = nil
        localAudio = nil
        state = .idle
        note = message
    }

    private static func camera() -> AVCaptureDevice? {
        let all = RTCCameraVideoCapturer.captureDevices()
        return all.first { $0.position == .front } ?? all.first
    }

    private func startCamera(_ device: AVCaptureDevice) {
        let source = factory.videoSource()
        let capturer = RTCCameraVideoCapturer(delegate: source)
        // About 720p is plenty for a face and keeps a weak uplink usable.
        let formats = RTCCameraVideoCapturer.supportedFormats(for: device)
        let format = formats.min { a, b in
            abs(Int(CMVideoFormatDescriptionGetDimensions(a.formatDescription).width) - 1280)
                < abs(Int(CMVideoFormatDescriptionGetDimensions(b.formatDescription).width) - 1280)
        }
        if let format {
            let fps = min(30, Int(format.videoSupportedFrameRateRanges.map(\.maxFrameRate).max() ?? 30))
            capturer.startCapture(with: device, format: format, fps: fps)
        }
        self.capturer = capturer
        localVideo = factory.videoTrack(with: source, trackId: "v0")
    }

    // MARK: - Buttons

    func say(_ text: String) {
        let text = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard state == .connected || practicing, !text.isEmpty else { return }
        lines.append(Line(text: text, mine: true))
        if practicing {
            later(1) { $0.iri(Self.iriLines.randomElement()!) }
        } else {
            lobby.send(["type": "chat", "text": text])
        }
    }

    func extend() {
        guard practicing else { return lobby.send(["type": "extend"]) }
        later(1) { call in
            call.iri("I tapped More time too.")
            call.practiceClock()
        }
    }

    func keep() {
        guard practicing else { return lobby.send(["type": "keep"]) }
        later(1) { $0.kept = "@irisa" }
    }

    func next() {
        if practicing { return practice() }
        lobby.send(["type": "next"])
        reset("Looking for someone...")
    }

    func report(_ reason: String) {
        lobby.send(["type": "report", "reason": reason])
        reset("Reported. Looking for someone...")
        lobby.send(["type": "find", "handle": handle])
    }

    func block() {
        lobby.send(["type": "block"])
        reset("Blocked. Looking for someone...")
        lobby.send(["type": "find", "handle": handle])
    }

    // MARK: - Lobby

    private func onServer(_ msg: [String: Any]) {
        #if DEBUG
        print("irisa lobby", msg["type"] ?? "?")
        #endif
        switch msg["type"] as? String {
        case "waiting":
            state = .searching
            note = "Looking for someone..."
            armPractice()
        case "matched":
            endPractice()
            openPeer(initiator: msg["initiator"] as? Bool ?? false)
            runClock(msg["ms"] as? Double)
        case "signal":
            if let data = msg["data"] as? [String: Any] { onSignal(data) }
        case "asked":
            asked = msg["what"] as? String
        case "extended":
            runClock(msg["ms"] as? Double)
            asked = nil
        case "kept":
            kept = (msg["handle"] as? String).flatMap { $0.isEmpty ? nil : $0 } ?? ""
        case "chat":
            if let text = msg["text"] as? String { lines.append(Line(text: text, mine: false)) }
        case "time-up":
            reset("Time ran out. Looking for someone...")
        case "peer-left":
            reset("They left. Looking for someone...")
            lobby.send(["type": "find", "handle": handle])
        default:
            break
        }
    }

    // MARK: - Practice

    private func armPractice() {
        endPractice()
        later(6) { call in
            if call.state == .searching, call.remoteVideo == nil { call.practice() }
        }
    }

    private func practice() {
        endPractice()
        practicing = true
        lines = []
        asked = nil
        kept = nil
        note = "Practice call with Iri while you wait"
        later(1.5) { $0.iri("hi! I'm Iri, the Irisa mascot. Not a real person.") }
        later(6) { $0.iri("tap More time to keep talking, or Keep to swap handles") }
        practiceClock()
    }

    private func practiceClock() {
        deadline = Date().addingTimeInterval(15)
        practiceTasks.append(Task { [weak self] in
            try? await Task.sleep(for: .seconds(15))
            guard let self, !Task.isCancelled, let deadline = self.deadline, deadline <= Date() else { return }
            self.deadline = nil
            self.note = "Time ran out. A real call moves on to someone new."
            self.later(2) { $0.practice() }
        })
    }

    private func iri(_ text: String) {
        if practicing { lines.append(Line(text: text, mine: false)) }
    }

    private func later(_ seconds: Double, _ body: @escaping (Call) -> Void) {
        practiceTasks.append(Task { [weak self] in
            try? await Task.sleep(for: .seconds(seconds))
            guard let self, !Task.isCancelled else { return }
            body(self)
        })
    }

    private func endPractice() {
        practiceTasks.forEach { $0.cancel() }
        practiceTasks = []
        guard practicing else { return }
        practicing = false
        deadline = nil
        lines = []
        kept = nil
    }

    /// Display only. The server owns the real deadline and ends the call itself.
    private func runClock(_ ms: Double?) {
        deadline = Date().addingTimeInterval((ms ?? 15000) / 1000)
    }

    private func reset(_ message: String) {
        resetPeer()
        state = .searching
        note = message
    }

    private func resetPeer() {
        pc?.close()
        pc = nil
        pending = []
        remoteVideo = nil
        deadline = nil
        asked = nil
        kept = nil
        lines = []
    }

    // MARK: - Peer connection

    private func openPeer(initiator: Bool) {
        resetPeer()
        let config = RTCConfiguration()
        config.iceServers = ice
        config.sdpSemantics = .unifiedPlan
        config.continualGatheringPolicy = .gatherContinually
        let constraints = RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil)
        guard let pc = factory.peerConnection(with: config, constraints: constraints, delegate: self) else { return }
        self.pc = pc
        if let localVideo { pc.add(localVideo, streamIds: ["s"]) } else { recvOnly(pc, .video) }
        if let localAudio { pc.add(localAudio, streamIds: ["s"]) } else { recvOnly(pc, .audio) }
        state = .connecting
        note = "Connecting..."
        guard initiator else { return }
        pc.offer(for: constraints) { [weak self] sdp, _ in
            guard let sdp else { return }
            Task { @MainActor in self?.setLocal(sdp, on: pc) }
        }
    }

    private func recvOnly(_ pc: RTCPeerConnection, _ kind: RTCRtpMediaType) {
        let initial = RTCRtpTransceiverInit()
        initial.direction = .recvOnly
        pc.addTransceiver(of: kind, init: initial)
    }

    private func setLocal(_ sdp: RTCSessionDescription, on pc: RTCPeerConnection) {
        guard pc === self.pc else { return }
        pc.setLocalDescription(sdp) { [weak self] error in
            guard error == nil else { return }
            Task { @MainActor in
                guard let self, pc === self.pc else { return }
                self.lobby.send(["type": "signal", "data": Signal.json(sdp)])
            }
        }
    }

    private func onSignal(_ data: [String: Any]) {
        guard let pc else { return }
        if let json = data["sdp"] as? [String: Any], let sdp = Signal.description(json) {
            pc.setRemoteDescription(sdp) { [weak self] error in
                guard error == nil else { return }
                Task { @MainActor in
                    guard let self, pc === self.pc else { return }
                    // The first candidates can arrive before the offer or answer.
                    for candidate in self.pending { pc.add(candidate) { _ in } }
                    self.pending = []
                    guard sdp.type == .offer else { return }
                    let constraints = RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil)
                    pc.answer(for: constraints) { answer, _ in
                        guard let answer else { return }
                        Task { @MainActor in self.setLocal(answer, on: pc) }
                    }
                }
            }
        } else if let json = data["candidate"] as? [String: Any], let candidate = Signal.candidate(json) {
            if pc.remoteDescription != nil { pc.add(candidate) { _ in } } else { pending.append(candidate) }
        }
    }
}

extension Call: RTCPeerConnectionDelegate {
    nonisolated func peerConnection(_ pc: RTCPeerConnection, didGenerate candidate: RTCIceCandidate) {
        let data = Signal.json(candidate)
        Task { @MainActor in
            guard pc === self.pc else { return }
            self.lobby.send(["type": "signal", "data": data])
        }
    }

    nonisolated func peerConnection(_ pc: RTCPeerConnection, didStartReceivingOn transceiver: RTCRtpTransceiver) {
        guard let track = transceiver.receiver.track as? RTCVideoTrack else { return }
        Task { @MainActor in
            guard pc === self.pc else { return }
            self.remoteVideo = track
            self.state = .connected
            self.note = "Connected"
        }
    }

    nonisolated func peerConnection(_ pc: RTCPeerConnection, didChange stateChanged: RTCSignalingState) {}
    nonisolated func peerConnection(_ pc: RTCPeerConnection, didAdd stream: RTCMediaStream) {}
    nonisolated func peerConnection(_ pc: RTCPeerConnection, didRemove stream: RTCMediaStream) {}
    nonisolated func peerConnectionShouldNegotiate(_ pc: RTCPeerConnection) {}
    nonisolated func peerConnection(_ pc: RTCPeerConnection, didChange newState: RTCIceConnectionState) {
        #if DEBUG
        print("irisa ice", newState.rawValue)  // 2 connected, 3 completed: the QA script greps this
        #endif
    }
    nonisolated func peerConnection(_ pc: RTCPeerConnection, didChange newState: RTCIceGatheringState) {}
    nonisolated func peerConnection(_ pc: RTCPeerConnection, didRemove candidates: [RTCIceCandidate]) {}
    nonisolated func peerConnection(_ pc: RTCPeerConnection, didOpen dataChannel: RTCDataChannel) {}
}

import Foundation
import WebRTC

/// The lobby socket. It speaks the same JSON the web client does (web/chat.js), so a phone
/// and a browser land in one queue and can be matched with each other.
@MainActor
final class Lobby {
    static let site = URL(string: "https://irisa.jaybulb.com")!

    var onMessage: ([String: Any]) -> Void = { _ in }
    var onClose: () -> Void = {}
    private var task: URLSessionWebSocketTask?

    func connect() {
        var parts = URLComponents(url: Self.site.appending(path: "ws"), resolvingAgainstBaseURL: false)!
        parts.scheme = "wss"
        let task = URLSession.shared.webSocketTask(with: parts.url!)
        self.task = task
        task.resume()
        receive(task)
    }

    private func receive(_ task: URLSessionWebSocketTask) {
        task.receive { [weak self] result in
            Task { @MainActor in
                guard let self, self.task === task else { return }
                switch result {
                case .success(.string(let text)):
                    if let msg = try? JSONSerialization.jsonObject(with: Data(text.utf8)) as? [String: Any] {
                        self.onMessage(msg)
                    }
                    self.receive(task)
                case .success:
                    self.receive(task)
                case .failure:
                    self.task = nil
                    self.onClose()
                }
            }
        }
    }

    func send(_ msg: [String: Any]) {
        guard let task, let data = try? JSONSerialization.data(withJSONObject: msg),
              let text = String(data: data, encoding: .utf8) else { return }
        task.send(.string(text)) { _ in }
    }

    func close() {
        task?.cancel(with: .normalClosure, reason: nil)
        task = nil
    }

    /// STUN always, plus short-lived TURN credentials when the Worker can mint them.
    static func iceServers() async -> [RTCIceServer] {
        let stun = RTCIceServer(urlStrings: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"])
        guard let (data, _) = try? await URLSession.shared.data(from: site.appending(path: "ice")),
              let body = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let list = body["iceServers"] as? [[String: Any]], !list.isEmpty else { return [stun] }
        return list.compactMap(Signal.iceServer)
    }
}

/// Converting between WebRTC objects and the browser's JSON shapes. Pure, so it is tested.
enum Signal {
    static func iceServer(_ json: [String: Any]) -> RTCIceServer? {
        let urls = (json["urls"] as? [String]) ?? (json["urls"] as? String).map { [$0] } ?? []
        guard !urls.isEmpty else { return nil }
        return RTCIceServer(urlStrings: urls, username: json["username"] as? String,
                            credential: json["credential"] as? String)
    }

    /// `{ sdp: { type, sdp } }`, what `pc.localDescription` serialises to in a browser.
    static func json(_ description: RTCSessionDescription) -> [String: Any] {
        ["sdp": ["type": RTCSessionDescription.string(for: description.type), "sdp": description.sdp]]
    }

    /// `{ candidate: { candidate, sdpMid, sdpMLineIndex } }`, what `RTCIceCandidate.toJSON()` gives.
    static func json(_ candidate: RTCIceCandidate) -> [String: Any] {
        var c: [String: Any] = ["candidate": candidate.sdp, "sdpMLineIndex": Int(candidate.sdpMLineIndex)]
        if let mid = candidate.sdpMid { c["sdpMid"] = mid }
        return ["candidate": c]
    }

    static func description(_ json: [String: Any]) -> RTCSessionDescription? {
        guard let type = json["type"] as? String, let sdp = json["sdp"] as? String,
              ["offer", "answer", "pranswer", "rollback"].contains(type) else { return nil }
        return RTCSessionDescription(type: RTCSessionDescription.type(for: type), sdp: sdp)
    }

    static func candidate(_ json: [String: Any]) -> RTCIceCandidate? {
        guard let sdp = json["candidate"] as? String, !sdp.isEmpty else { return nil }
        let index = (json["sdpMLineIndex"] as? NSNumber)?.int32Value ?? 0
        return RTCIceCandidate(sdp: sdp, sdpMLineIndex: index, sdpMid: json["sdpMid"] as? String)
    }
}

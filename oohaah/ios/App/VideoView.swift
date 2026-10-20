import SwiftUI
import WebRTC

/// A WebRTC video track drawn with Metal. Swapping the track moves the renderer over.
struct VideoView {
    let track: RTCVideoTrack?

    final class Coordinator { var track: RTCVideoTrack? }
    func makeCoordinator() -> Coordinator { Coordinator() }

    private func attach(_ view: RTCVideoRenderer, _ coordinator: Coordinator) {
        guard coordinator.track !== track else { return }
        coordinator.track?.remove(view)
        track?.add(view)
        coordinator.track = track
    }
}

#if os(iOS)
extension VideoView: UIViewRepresentable {
    func makeUIView(context: Context) -> RTCMTLVideoView {
        let view = RTCMTLVideoView(frame: .zero)
        view.videoContentMode = .scaleAspectFill
        view.clipsToBounds = true
        return view
    }

    func updateUIView(_ view: RTCMTLVideoView, context: Context) { attach(view, context.coordinator) }

    static func dismantleUIView(_ view: RTCMTLVideoView, coordinator: Coordinator) {
        coordinator.track?.remove(view)
    }
}
#else
extension VideoView: NSViewRepresentable {
    func makeNSView(context: Context) -> RTCMTLNSVideoView { RTCMTLNSVideoView(frame: .zero) }

    func updateNSView(_ view: RTCMTLNSVideoView, context: Context) { attach(view, context.coordinator) }

    static func dismantleNSView(_ view: RTCMTLNSVideoView, coordinator: Coordinator) {
        coordinator.track?.remove(view)
    }
}
#endif

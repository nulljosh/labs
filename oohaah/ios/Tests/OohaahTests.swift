import WebRTC
import XCTest
@testable import Oohaah

/// Native and browser clients share one lobby, so the signal JSON must match what a browser
/// sends and expects. If these shapes drift, native-to-web calls fail silently.
final class SignalTests: XCTestCase {
    func testDescriptionRoundTripsInBrowserShape() throws {
        let json: [String: Any] = ["type": "offer", "sdp": "v=0\r\n"]
        let sdp = try XCTUnwrap(Signal.description(json))
        XCTAssertEqual(sdp.type, .offer)
        let out = try XCTUnwrap(Signal.json(sdp)["sdp"] as? [String: Any])
        XCTAssertEqual(out["type"] as? String, "offer")
        XCTAssertEqual(out["sdp"] as? String, "v=0\r\n")
        XCTAssertNil(Signal.description(["type": "bogus", "sdp": "x"]))
    }

    func testCandidateMatchesBrowserToJSON() throws {
        let browser: [String: Any] = ["candidate": "candidate:1 1 udp 1 1.2.3.4 5 typ host", "sdpMid": "0",
                                      "sdpMLineIndex": 0, "usernameFragment": "abcd"]
        let candidate = try XCTUnwrap(Signal.candidate(browser))
        XCTAssertEqual(candidate.sdpMid, "0")
        let out = try XCTUnwrap(Signal.json(candidate)["candidate"] as? [String: Any])
        XCTAssertEqual(out["candidate"] as? String, browser["candidate"] as? String)
        XCTAssertEqual(out["sdpMLineIndex"] as? Int, 0)
        XCTAssertNil(Signal.candidate(["candidate": ""]), "end-of-candidates is skipped")
    }

    func testIceServerAcceptsStringOrList() {
        XCTAssertEqual(Signal.iceServer(["urls": "stun:a"])?.urlStrings, ["stun:a"])
        let turn = Signal.iceServer(["urls": ["turn:b"], "username": "u", "credential": "c"])
        XCTAssertEqual(turn?.username, "u")
        XCTAssertNil(Signal.iceServer(["urls": []]))
    }
}

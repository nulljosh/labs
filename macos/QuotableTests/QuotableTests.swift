import XCTest
@testable import Quotable

final class QuotableTests: XCTestCase {
    func testIndexHTMLResourceExists() throws {
        let url = try GameResource.indexURL(in: Bundle(for: QuotableTests.self))
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path))
    }

    func testMissingIndexHTMLThrows() {
        // An empty bundle has no bundled resources, so lookup must fail cleanly.
        let emptyBundle = Bundle(for: type(of: self))
        let fakeBundle = Bundle(url: emptyBundle.bundleURL.deletingLastPathComponent()) ?? emptyBundle
        XCTAssertThrowsError(try GameResource.indexURL(in: Bundle(path: "/nonexistent") ?? fakeBundle))
    }

    func testQuotesJSONIsValidAndNonEmpty() throws {
        let bundle = Bundle(for: QuotableTests.self)
        guard let url = bundle.url(forResource: "quotes", withExtension: "json", subdirectory: "Resources") else {
            return XCTFail("quotes.json not found in test bundle")
        }
        let data = try Data(contentsOf: url)
        let json = try JSONSerialization.jsonObject(with: data)
        guard let quotes = json as? [[String: Any]] else {
            return XCTFail("quotes.json is not an array of objects")
        }
        XCTAssertGreaterThan(quotes.count, 0)
        for quote in quotes {
            XCTAssertNotNil(quote["quote"] as? String, "each entry needs a quote string")
            XCTAssertNotNil(quote["movie"] as? String, "each entry needs a movie string")
        }
    }

    func testGameJSExists() {
        let bundle = Bundle(for: QuotableTests.self)
        let url = bundle.url(forResource: "game", withExtension: "js", subdirectory: "Resources")
        XCTAssertNotNil(url)
    }
}

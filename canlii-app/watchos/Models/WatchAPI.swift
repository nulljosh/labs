import Foundation

/// Talks to the same Vercel Edge Function proxy the iOS app uses
/// (ios/CanLII/API/CanLIIClient.swift) -- /api/databases and /api/search. The proxy is the
/// whole point (see WHITEPAPER.md "The Proxy"): it holds CANLII_API_KEY server-side, so
/// there is no key of any kind on this client, unlike talli/lexly's paste-a-token pattern.
final class WatchAPI: @unchecked Sendable {
    static let shared = WatchAPI()

    private let baseURL = "https://canlii-app.vercel.app/api"
    private let session: URLSession
    private let decoder = JSONDecoder()
    private let defaults = UserDefaults.standard

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 10
        config.timeoutIntervalForResource = 15
        session = URLSession(configuration: config)
    }

    // MARK: - Databases

    func fetchDatabases() async throws -> [CanLIIDatabase] {
        let data = try await fetch(path: "/databases")
        let result = try decoder.decode(DatabasesResponse.self, from: data).caseDatabases ?? []
        cache(data, forKey: "databases")
        return result
    }

    func cachedDatabases() -> [CanLIIDatabase]? {
        guard let data = defaults.data(forKey: "cache_databases") else { return nil }
        return try? decoder.decode(DatabasesResponse.self, from: data).caseDatabases
    }

    // MARK: - Search

    func search(databaseId: String, query: String) async throws -> [CanLIICase] {
        var components = URLComponents(string: baseURL + "/search")!
        components.queryItems = [
            URLQueryItem(name: "databaseId", value: databaseId),
            URLQueryItem(name: "q", value: query),
        ]
        guard let url = components.url else { throw URLError(.badURL) }
        let (data, response) = try await session.data(from: url)
        guard let http = response as? HTTPURLResponse, 200..<300 ~= http.statusCode else {
            throw URLError(.badServerResponse)
        }
        return try decoder.decode(SearchResponse.self, from: data).results ?? []
    }

    // MARK: - Internal

    private func fetch(path: String) async throws -> Data {
        guard let url = URL(string: baseURL + path) else {
            throw URLError(.badURL)
        }
        let (data, response) = try await session.data(from: url)
        guard let http = response as? HTTPURLResponse, 200..<300 ~= http.statusCode else {
            throw URLError(.badServerResponse)
        }
        return data
    }

    private func cache(_ data: Data, forKey key: String) {
        defaults.set(data, forKey: "cache_\(key)")
        defaults.set(Date().timeIntervalSince1970, forKey: "cache_\(key)_time")
    }
}

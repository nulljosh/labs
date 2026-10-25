import Foundation

// Every city a person might type: the last part of each time zone id plus common aliases,
// with coordinates from IANA zone.tab (coords.json, written by scripts/gen_coords.py).

enum Cities {
    static let aliases: [String: String] = [
        "San Francisco": "America/Los_Angeles", "Seattle": "America/Los_Angeles", "Portland": "America/Los_Angeles", "San Diego": "America/Los_Angeles",
        "Boston": "America/New_York", "Washington DC": "America/New_York", "Miami": "America/New_York", "Atlanta": "America/New_York", "Philadelphia": "America/New_York",
        "Dallas": "America/Chicago", "Houston": "America/Chicago", "Austin": "America/Chicago", "Las Vegas": "America/Los_Angeles", "Calgary": "America/Edmonton",
        "Ottawa": "America/Toronto", "Montreal": "America/Toronto", "Beijing": "Asia/Shanghai", "Mumbai": "Asia/Kolkata", "Delhi": "Asia/Kolkata",
        "New Delhi": "Asia/Kolkata", "Bangalore": "Asia/Kolkata", "Osaka": "Asia/Tokyo", "Kyoto": "Asia/Tokyo", "Abu Dhabi": "Asia/Dubai",
        "Barcelona": "Europe/Madrid", "Milan": "Europe/Rome", "Munich": "Europe/Berlin", "Frankfurt": "Europe/Berlin", "Zurich": "Europe/Zurich",
        "Manchester": "Europe/London", "Edinburgh": "Europe/London", "Melbourne": "Australia/Melbourne", "Auckland": "Pacific/Auckland", "Rio de Janeiro": "America/Sao_Paulo",
    ]

    /// City name to zone id, sorted by name.
    static let all: [City] = {
        var m = aliases
        for z in TimeZone.knownTimeZoneIdentifiers where z.contains("/") && !z.hasPrefix("Etc/") {
            m[z.split(separator: "/").last!.replacingOccurrences(of: "_", with: " ")] = m[z.split(separator: "/").last!.replacingOccurrences(of: "_", with: " ")] ?? z
        }
        return m.map { City(city: $0.key, zone: $0.value) }.sorted { $0.city < $1.city }
    }()

    static let coords: [String: [Double]] = {
        guard let url = Bundle.main.url(forResource: "coords", withExtension: "json"),
              let d = try? Data(contentsOf: url), let m = try? JSONDecoder().decode([String: [Double]].self, from: d) else { return [:] }
        return m
    }()

    static func isDay(_ c: City, at now: Date) -> Bool? {
        guard let p = coords[c.city], p.count == 2 else { return nil }
        return Clockwork.isDaytime(now, lat: p[0], lon: p[1])
    }
}

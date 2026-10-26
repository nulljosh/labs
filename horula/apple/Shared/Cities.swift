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
        guard let url = Bundle(for: BundleToken.self).url(forResource: "coords", withExtension: "json"),
              let d = try? Data(contentsOf: url), let m = try? JSONDecoder().decode([String: [Double]].self, from: d) else { return [:] }
        return m
    }()

    /// City names in the app's language (cities-<code>.json, from scripts/gen_cities.mjs). Stored and backed up
    /// in English; only what the reader sees changes.
    static let names: [String: String] = {
        let b = Bundle(for: BundleToken.self), code = String((b.preferredLocalizations.first ?? "en").prefix(2))
        guard let url = b.url(forResource: "cities-\(code)", withExtension: "json"),
              let d = try? Data(contentsOf: url), let m = try? JSONDecoder().decode([String: String].self, from: d) else { return [:] }
        return m
    }()

    /// Every city in the reader's alphabet order, for the search list.
    static let byName: [City] = all.sorted { $0.name.localizedStandardCompare($1.name) == .orderedAscending }

    static func isDay(_ c: City, at now: Date) -> Bool? {
        guard let p = coords[c.city], p.count == 2 else { return nil }
        return Clockwork.isDaytime(now, lat: p[0], lon: p[1])
    }
}

extension City {
    /// The name the reader sees: in their language when we have it, else English.
    var name: String { Cities.names[city] ?? city }
}

/// The bundle this file is compiled into: the app, a widget, or the snapshot tests.
private final class BundleToken {}

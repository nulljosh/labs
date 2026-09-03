import Foundation

// Field-for-field the iOS models (ios/CanLII/Models/Models.swift), decoding the same
// /api/databases and /api/search proxy responses. The CanLII caseBrowse search endpoint
// only returns caseId and title, with citation frequently absent -- there is no court or
// decision-date field in this response, so those are not modeled here even though a
// natural search result card would want them. Court is implied instead by which database
// (jurisdiction) the search ran against, shown as the picker/results-header context.

struct CanLIIDatabase: Codable, Identifiable, Hashable {
    var id: String { databaseId }
    let databaseId: String
    let jurisdiction: String
    let name: String
}

struct DatabasesResponse: Codable {
    let caseDatabases: [CanLIIDatabase]?
}

struct CanLIICase: Codable, Identifiable, Hashable {
    var id: String { caseId.en ?? UUID().uuidString }
    let caseId: CaseIdValue
    let title: String
    let citation: String?

    struct CaseIdValue: Codable, Hashable {
        let en: String?
    }
}

struct SearchResponse: Codable {
    let results: [CanLIICase]?
}

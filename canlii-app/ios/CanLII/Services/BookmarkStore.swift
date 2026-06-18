import Foundation
import SwiftData

@Model
final class Bookmark {
    var caseId: String
    var title: String
    var citation: String?
    var savedAt: Date

    init(caseId: String, title: String, citation: String?) {
        self.caseId = caseId
        self.title = title
        self.citation = citation
        self.savedAt = .now
    }
}

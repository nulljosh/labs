import Foundation

// ponytail: mirrored by hand from index.html's LAYERS/QUESTIONS. If the web
// assessment changes, re-port here — there is no shared source of truth yet.

struct Layer: Identifiable {
    let id: String
    let name: String
    let sub: String
}

struct AssessQuestion: Identifiable {
    let id: Int
    let layer: String
    let bad: String // "yes" or "no" — the concerning answer
    let chapter: String
    let text: String
    let note: String
}

enum AssessmentData {
    static let layers: [Layer] = [
        Layer(id: "land", name: "Land energy", sub: "Chapter 8. The strongest influence, and the one you cannot change."),
        Layer(id: "neighborhood", name: "Neighbourhood", sub: "Chapter 9. People energy. Not fixable from inside the home."),
        Layer(id: "building", name: "Building", sub: "Chapter 10. Architectural energy — shape, materials, flow, light."),
        Layer(id: "objects", name: "Objects", sub: "Chapter 11. What is near you and what you keep around you."),
    ]

    static let questions: [AssessQuestion] = [
        AssessQuestion(id: 0, layer: "land", bad: "no", chapter: "Chapter 8: Land Energy",
            text: "Are the nearest hills and mountains gentle and rolling, rather than jagged, rocky, or knife-edged?",
            note: "Jagged, rocky, sharp formations carry aggressive, destructive energy; gentle rolling hills carry nourishing energy. The impact is worst when you are surrounded by them, less when they are only visible at a distance."),
        AssessQuestion(id: 1, layer: "land", bad: "no", chapter: "Chapter 8: Land Energy",
            text: "If you are in a valley, is it wide with gentle slopes rather than narrow and steep?",
            note: "Wide valleys with gentle slopes carry nourishing energy. Narrow valleys with steep slopes carry fast, restless energy, and gullies carry unstable, precarious energy."),
        AssessQuestion(id: 2, layer: "land", bad: "no", chapter: "Chapter 8: Land Energy",
            text: "Is the nearest water gentle and clear — a meandering river, a calm lake — rather than fast, stagnant, or stormy?",
            note: "Gentle clear water nourishes. Fast water carries restless energy, stagnant water (swamps, brackish channels) carries lethargy, and stormy water carries aggressive energy."),
        AssessQuestion(id: 3, layer: "land", bad: "yes", chapter: "Chapter 8: Land Energy",
            text: "Is there a reservoir, dam, or large human-made water channel close by?",
            note: "Reservoirs carry pent-up energy, and releasing water through a dam adds to the severity of the discontinuity. Well-maintained canals are the exception — they carry uplifting energy."),
        AssessQuestion(id: 4, layer: "land", bad: "yes", chapter: "Chapter 8: Land Energy",
            text: "Is there a cliff edge, shoreline, or steep drop within about 300 feet?",
            note: "Avoid living at the edge of a cliff or at the bottom of one. About 300 feet (100 metres) from a discontinuity in the land is usually enough distance."),
        AssessQuestion(id: 5, layer: "land", bad: "no", chapter: "Chapter 8: Land Energy",
            text: "Is the vegetation around you healthy — full trees, diverse grasses — and do you see wildlife?",
            note: "Animals are drawn to positive energy and repelled by negative energy, and healthy plant life indicates positive land energy. Unhealthy foliage signals unfavourable conditions even in a developed area."),

        AssessQuestion(id: 6, layer: "neighborhood", bad: "no", chapter: "Assessing Your Neighborhood",
            text: "Do people actually gather in the public spaces — parks, squares, markets?",
            note: "Visible signs of life and community engagement are a listed indicator of positive neighbourhood energy. Some neighbourhoods encourage interaction; others produce isolation."),
        AssessQuestion(id: 7, layer: "neighborhood", bad: "no", chapter: "Assessing Your Neighborhood",
            text: "Does traffic flow smoothly here, rather than piling into congestion?",
            note: "Street patterns should encourage safe, pleasant pedestrian movement. Congestion is one of the factors that sets the overall energy of a neighbourhood."),
        AssessQuestion(id: 8, layer: "neighborhood", bad: "no", chapter: "Assessing Your Neighborhood",
            text: "Are the buildings and streets in good condition and visibly maintained?",
            note: "Condition of buildings and streets is one of the seven questions the book puts to a neighbourhood. Active, well-maintained community space is a positive indicator."),
        AssessQuestion(id: 9, layer: "neighborhood", bad: "no", chapter: "Assessing Your Neighborhood",
            text: "Is there a balanced mix of residential and commercial use, rather than one use dominating?",
            note: "A balanced mix of residential and commercial uses is listed as an indicator of positive neighbourhood energy."),
        AssessQuestion(id: 10, layer: "neighborhood", bad: "no", chapter: "Assessing Your Neighborhood",
            text: "Do the surrounding buildings share a coherent architectural character?",
            note: "Coherent, harmonious architectural character is a positive indicator. Land use, architectural style, street pattern and community space together produce the neighbourhood energy."),
        AssessQuestion(id: 11, layer: "neighborhood", bad: "no", chapter: "Assessing Your Neighborhood",
            text: "Do you feel good walking through the neighbourhood?",
            note: "How you feel walking through a neighbourhood is one of the book's direct assessment questions. A beautifully designed home cannot overcome fundamentally poor neighbourhood energy."),

        AssessQuestion(id: 12, layer: "building", bad: "no", chapter: "The Fengshui of Building Structure",
            text: "Is your first impression of the building a good one?",
            note: "First impression is the first test the book applies to architectural energy. Negative architectural energy creates stress, confusion, and discomfort over time."),
        AssessQuestion(id: 13, layer: "building", bad: "no", chapter: "The Fengshui of Building Structure",
            text: "Do the building's elements feel balanced and in proportion, and in scale with what surrounds it?",
            note: "Poor structural proportion and being out of scale with the surroundings are both listed as architectural problems to recognise."),
        AssessQuestion(id: 14, layer: "building", bad: "no", chapter: "The Fengshui of Building Structure",
            text: "Are the materials natural, well maintained, and pleasing?",
            note: "Deteriorating materials and poor maintenance are listed building problems. Material quality is one of the six checks in the book's evaluation."),
        AssessQuestion(id: 15, layer: "building", bad: "no", chapter: "The Fengshui of Building Structure",
            text: "Does the floor plan circulate well, without dead zones or rooms nobody enters?",
            note: "Floor plans that create dead zones or poor circulation are a named architectural problem. Interior flow should facilitate circulation and connection."),
        AssessQuestion(id: 16, layer: "building", bad: "no", chapter: "The Fengshui of Building Structure",
            text: "Does the home get enough natural light and ventilation?",
            note: "Light and air is one of the six architectural checks. Fengshui means \"wind and water\" — gentle wind and clear water make an environment healthy."),
        AssessQuestion(id: 17, layer: "building", bad: "no", chapter: "The Fengshui of Building Structure",
            text: "Does the building connect to neighbourhood life rather than isolating you from it?",
            note: "Buildings that isolate you from community and neighbourhood life are a listed problem. A building should relate well to its neighbourhood."),

        AssessQuestion(id: 18, layer: "objects", bad: "yes", chapter: "External Object Energy",
            text: "Are there electrical transmission lines directly overhead?",
            note: "Transmission lines directly overhead are a named sign of negative object energy. Relocation is the best answer; countermeasures only minimise the effect, they do not remove it."),
        AssessQuestion(id: 19, layer: "objects", bad: "yes", chapter: "External Object Energy",
            text: "Is there a cell tower, radio antenna, or substation nearby?",
            note: "Proximity to large utility structures is the primary source of negative object energy. Distance matters — ask how far away it is, not only whether it exists."),
        AssessQuestion(id: 20, layer: "objects", bad: "yes", chapter: "External Object Energy",
            text: "Are there industrial structures, or harsh angular structures, dominating the view?",
            note: "Industrial structures and harsh angular forms that dominate the view are listed indicators of problematic object energy."),
        AssessQuestion(id: 21, layer: "objects", bad: "no", chapter: "External Object Energy",
            text: "Is the view from your main windows clear rather than obstructed?",
            note: "Whether the view is clear or obstructed is one of the five questions the book puts to object energy."),
        AssessQuestion(id: 22, layer: "objects", bad: "no", chapter: "External Object Energy",
            text: "Are there plants, trees, or natural elements in the immediate surroundings?",
            note: "Presence of plants and natural elements is part of assessing object energy, and strategic landscaping is one of the listed countermeasures."),
        AssessQuestion(id: 23, layer: "objects", bad: "no", chapter: "External Object Energy",
            text: "Are your interior spaces organised rather than cluttered?",
            note: "Clutter versus organised space is listed under interior object energy, alongside furniture arrangement, natural versus synthetic materials, and colour."),
    ]

    struct LayerTally { var concerns = 0; var answered = 0; var total = 0 }

    // "unsure" never counts as a concern, matching the web's tally().
    static func tally(_ answers: [Int: String]) -> [String: LayerTally] {
        var out: [String: LayerTally] = [:]
        for l in layers { out[l.id] = LayerTally() }
        for q in questions {
            out[q.layer, default: LayerTally()].total += 1
            guard let a = answers[q.id] else { continue }
            out[q.layer, default: LayerTally()].answered += 1
            if a == q.bad { out[q.layer, default: LayerTally()].concerns += 1 }
        }
        return out
    }

    static func concerns(_ answers: [Int: String]) -> [AssessQuestion] {
        questions.filter { answers[$0.id] == $0.bad }
    }
}

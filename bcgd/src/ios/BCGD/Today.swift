import SwiftUI

/// The tech's day: today's jobs in order with a route to each, and the parts to load.
struct TodayView: View {
    @Environment(Store.self) private var store

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 32) {
                    Shelf("My jobs", symbol: "calendar") {
                        if store.todayRoute.isEmpty {
                            EmptyTile(symbol: "sun.max", text: "Nothing scheduled today")
                        } else {
                            LazyVGrid(columns: Grid.cards, spacing: 12) {
                                ForEach(store.todayRoute) { job in
                                    VStack(alignment: .leading, spacing: 8) {
                                        NavigationLink(value: job.id) { JobCard(job: job) }.buttonStyle(.plain)
                                        if let url = job.routeURL {
                                            Link(destination: url) { Label("Route in Maps", systemImage: "arrow.triangle.turn.up.right.diamond") }
                                                .buttonStyle(.bordered)
                                                .buttonBorderShape(.capsule)
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if !store.todayNeeds.isEmpty {
                        Shelf("My parts", symbol: "shippingbox") {
                            VStack(spacing: 0) {
                                ForEach(store.todayNeeds) { n in
                                    HStack {
                                        Text(n.part.name).lineLimit(1)
                                        Spacer()
                                        Text("need \(n.needed), have \(n.part.quantity)")
                                            .font(.footnote)
                                            .foregroundStyle(n.short ? Color.red : Color.secondary)
                                    }
                                    .padding(.vertical, 12)
                                    if n.id != store.todayNeeds.last?.id { Divider() }
                                }
                            }
                            .padding(.horizontal, 16)
                            .background(Color.card, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
                        }
                    }
                }
                .padding(20)
                .frame(maxWidth: 760)
                .frame(maxWidth: .infinity)
            }
            .background(Color.page)
            .navigationTitle("Today")
            .navigationDestination(for: UUID.self) { JobDetailView(jobID: $0) }
        }
    }
}

import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            DailyPlay()
            StreakGlance()
            SyncInfoView()
        }
        .tabViewStyle(.verticalPage)
    }
}

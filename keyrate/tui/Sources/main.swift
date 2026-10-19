import Foundation
import SwiftTUI

// ponytail: static score render, not a live typing test. A real-time keystroke
// game needs a redraw loop and raw-mode input this pilot doesn't need to prove
// the port. `keyrate-tui <target> <typed> <seconds>` scores one attempt.

let args = CommandLine.arguments.dropFirst()
if args.first == "--check" {
    runChecks()
    exit(0)
}
guard args.count == 3, let seconds = Double(args.last!) else {
    print("usage: keyrate-tui \"<target text>\" \"<typed text>\" <seconds>")
    exit(1)
}
let target = args[args.startIndex].split(separator: " ").map(String.init)
let typed = args[args.index(after: args.startIndex)].split(separator: " ").map(String.init)
let result = stats(typed: typed, target: target, seconds: seconds)

struct ScoreCard: View {
    let result: Stats

    var body: some View {
        VStack(alignment: .leading) {
            Text("keyrate").bold()
            Text("\(result.wpm) wpm  (\(result.raw) raw)")
            Text("\(result.accuracy)% accuracy")
            Text("\(result.correctWords) words correct")
        }
        .padding()
        .border()
    }
}

Application(rootView: ScoreCard(result: result)).start()

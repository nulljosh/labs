import Messages
import SwiftUI

/// Coda in iMessage (v49): play five lines in the conversation and send your score as a
/// challenge bubble; tapping a friend's bubble plays the same five and answers with yours. The bubble's
/// link is the web's challenge link, so it also opens in any browser.
final class MessagesViewController: MSMessagesAppViewController {
    private let model = MessagesModel()

    override func viewDidLoad() {
        super.viewDidLoad()
        model.expand = { [weak self] in self?.requestPresentationStyle(.expanded) }
        model.send = { [weak self] message in
            self?.activeConversation?.insert(message)
            self?.requestPresentationStyle(.compact)
        }
        let host = UIHostingController(rootView: MessagesRoot(model: model))
        addChild(host)
        host.view.frame = view.bounds
        host.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(host.view)
        host.didMove(toParent: self)
    }

    override func willBecomeActive(with conversation: MSConversation) {
        model.open(conversation.selectedMessage?.url.flatMap(ChallengeLink.init(url:)))
    }

    override func didSelect(_ message: MSMessage, conversation: MSConversation) {
        model.open(message.url.flatMap(ChallengeLink.init(url:)))
    }
}

@MainActor @Observable final class MessagesModel {
    static let size = 5
    let game = Game()
    var challenge: ChallengeLink?
    var expand: () -> Void = {}
    var send: (MSMessage) -> Void = { _ in }

    func open(_ link: ChallengeLink?) {
        challenge = link
        if link != nil { expand() }
    }

    func play() {
        let byId = Dictionary(game.quotes.map { ($0.qid, $0) }, uniquingKeysWith: { a, _ in a })
        let quotes = challenge.map { $0.qids.compactMap { byId[$0] } } ?? Array(game.quotes.shuffled().prefix(Self.size))
        playedIds = quotes.map(\.qid)
        game.start(fixed: quotes)
        expand()
    }

    /// A bubble with the score; its link carries the same lines for the friend.
    func sendScore() {
        let qids = playedIds
        let layout = MSMessageTemplateLayout()
        layout.caption = "Coda: \(game.score) on \(qids.count) lines"
        layout.subcaption = challenge.map { ChallengeLink.verdict(mine: game.score, theirs: $0.score, name: "them") } ?? "Can you beat it?"
        let message = MSMessage(session: MSSession())
        message.layout = layout
        message.url = ChallengeLink(qids: qids, score: game.score).url
        send(message)
        challenge = nil
        game.backToMenu()
    }

    /// The lines dealt for this run, in order: the bubble's link carries them to the friend.
    private(set) var playedIds: [String] = []
}

struct MessagesRoot: View {
    @Bindable var model: MessagesModel

    var body: some View {
        VStack(spacing: 16) {
            switch model.game.phase {
            case .menu:
                Text(model.challenge.map { "A friend scored \($0.score) on these lines. Your turn." } ?? "Five lines. Send your score to the chat.")
                    .font(.quip(.headline)).multilineTextAlignment(.center)
                Button(model.challenge == nil ? "Play five" : "Play their lines") { model.play() }
                .buttonStyle(PrimaryButtonStyle())
            case .playing:
                if let q = model.game.current {
                    Text("\u{201C}\(q.quote)\u{201D}").font(.quip(.title3, weight: .semibold)).multilineTextAlignment(.center)
                    ForEach(q.options, id: \.self) { o in
                        Button(o) {
                            model.game.choose(o)
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.9) { model.game.nextQuestion() }
                        }
                        .buttonStyle(AnswerButtonStyle(state: !model.game.isAnswered ? .open : o == q.answer ? .right : o == model.game.pickedAnswer ? .wrong : .spent))
                        .allowsHitTesting(!model.game.isAnswered)
                    }
                }
            case .over:
                Text("You scored \(model.game.score)").font(.quip(.title, weight: .bold))
                if let c = model.challenge {
                    Text(ChallengeLink.verdict(mine: model.game.score, theirs: c.score, name: c.name ?? "Your friend")).font(.quip(.headline))
                }
                Button(model.challenge == nil ? "Send to the chat" : "Send your answer") { model.sendScore() }
                    .buttonStyle(PrimaryButtonStyle())
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.canvas)
    }
}

// Colors lifted from style.css so the app and the web game read as one product.

import CoreText
import SwiftUI

extension Color {
    init(hex: String) {
        let value = UInt64(hex, radix: 16) ?? 0
        self.init(
            red: Double((value >> 16) & 0xFF) / 255,
            green: Double((value >> 8) & 0xFF) / 255,
            blue: Double(value & 0xFF) / 255
        )
    }
}

enum Theme {
    /// The window/page ground. `.systemBackground` is UIKit-only.
    static var canvas: Color {
        #if os(macOS)
        Color(nsColor: .windowBackgroundColor)
        #elseif os(tvOS)
        Color(uiColor: UIColor { $0.userInterfaceStyle == .dark ? UIColor(Color(hex: "0f1013")) : .white })  // brand/tokens.css grounds
        #else
        Color(uiColor: .systemBackground)
        #endif
    }

    /// brand/tokens.css: marquee yellow is the only colour the app owns; green and red stay for right and wrong.
    static let accent = Color(hex: "ffcc00")
    static let onAccent = Color(hex: "15161a")   // text on yellow is always ink
    /// Strokes and outlines: plain yellow washes out on a light ground, so it deepens there.
    static var accentStroke: Color {
        #if os(macOS)
        Color(nsColor: NSColor(name: nil) { $0.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua ? NSColor(Color(hex: "ffcc00")) : NSColor(Color(hex: "e0a800")) })
        #else
        Color(uiColor: UIColor { $0.userInterfaceStyle == .dark ? UIColor(Color(hex: "ffcc00")) : UIColor(Color(hex: "e0a800")) })
        #endif
    }

    /// iPad is read from further away than a phone, so type, column and Quip all grow by this much.
    static var padScale: CGFloat {
        #if os(iOS)
        UIDevice.current.userInterfaceIdiom == .pad ? 1.3 : 1
        #else
        1
        #endif
    }

    /// Quip Sans (fonts/, built by scripts/gen_font.py) registered from the bundle once, before first use,
    /// so neither Info.plist needs a font list.
    static let fontsRegistered: Void = {
        for name in ["Regular", "Medium", "Semibold", "Bold"] {
            if let url = Bundle.main.url(forResource: "QuipSans-\(name)", withExtension: "ttf") {
                CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
            }
        }
    }()

    /// `--g-*` / `--g-*-text` pairs from style.css. Unknown genres fall back to accent.
    static func badge(for genre: String) -> (background: Color, foreground: Color) {
        switch genre {
        case "action":  return (Color(hex: "ff6b35"), .black)
        case "comedy":  return (Color(hex: "ffd23f"), .black)
        case "drama":   return (Color(hex: "3d5aa8"), .white)
        case "scifi":   return (Color(hex: "b3312c"), .white)
        case "classic": return (Color(hex: "c9a24b"), .black)
        case "pop":     return (Color(hex: "ff6fae"), .black)
        case "rock":    return (Color(hex: "6b7280"), .white)
        case "hiphop":  return (Color(hex: "2e8b57"), .white)
        case "rnb":     return (Color(hex: "b8860b"), .black)
        case "country": return (Color(hex: "8b5a2b"), .white)
        case "sitcom":  return (Color(hex: "4cc9f0"), .black)
        case "tvdrama": return (Color(hex: "1d3557"), .white)
        case "cartoon": return (Color(hex: "f4a261"), .black)
        case "game":    return (Color(hex: "577590"), .white)
        case "book":    return (Color(hex: "6d4c41"), .white)
        case "anime":   return (Color(hex: "ffc8dd"), .black)
        default:        return (accent, onAccent)
        }
    }

    /// Badge and menu text for a genre key, mirroring LABELS in game.js.
    static func label(for genre: String) -> String {
        ["scifi": "Sci-fi", "hiphop": "Hip-hop", "rnb": "R&B", "tvdrama": "TV drama", "game": "Games", "book": "First lines"][genre] ?? genre.capitalized
    }
}

extension Font {
    /// Quip Sans at a text style's size, scaling with Dynamic Type on iOS.
    static func quip(_ style: Font.TextStyle, weight: Font.Weight = .regular) -> Font {
        _ = Theme.fontsRegistered
        let name = switch weight {
        case .bold, .heavy, .black: "QuipSans-Bold"
        case .semibold: "QuipSans-Semibold"
        case .medium: "QuipSans-Medium"
        default: "QuipSans-Regular"
        }
        return .custom(name, size: quipSize(style), relativeTo: style)
    }

    private static func quipSize(_ style: Font.TextStyle) -> CGFloat {
        #if os(macOS)
        switch style {
        // a notch above AppKit's defaults: this is a game window, read from arm's length
        case .largeTitle: 30; case .title: 24; case .title2: 21; case .title3: 17
        case .headline, .body: 14; case .callout: 13; case .subheadline: 12
        case .footnote, .caption, .caption2: 11; default: 14
        }
        #elseif os(tvOS)
        switch style {
        // tvOS's own text scale: read from the sofa, three metres away
        case .largeTitle: 76; case .title: 57; case .title2: 48; case .title3: 38
        case .headline: 38; case .body: 29; case .callout: 31; case .subheadline: 29
        case .footnote: 23; case .caption: 25; case .caption2: 23; default: 29
        }
        #else
        let base: CGFloat = switch style {
        case .largeTitle: 34; case .title: 28; case .title2: 22; case .title3: 20
        case .headline, .body: 17; case .callout: 16; case .subheadline: 15
        case .footnote: 13; case .caption: 12; case .caption2: 11; default: 17
        }
        return base * Theme.padScale
        #endif
    }
}

/// The one bright action: a yellow capsule with ink text, 48 points tall like every house control.
struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.quip(.headline, weight: .bold))
            .foregroundStyle(Theme.onAccent)
            .padding(.horizontal, 28).frame(minHeight: 48 * Theme.padScale)
            .background(Theme.accent, in: Capsule())
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
            .contentShape(Capsule())
    }
}

/// Everything else: an outlined capsule, so the primary action stays the only yellow fill.
struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.quip(.headline, weight: .bold))
            .foregroundStyle(.primary)
            .padding(.horizontal, 24).frame(minHeight: 48 * Theme.padScale)
            .overlay(Capsule().strokeBorder(Theme.accentStroke, lineWidth: 2))
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
            .contentShape(Capsule())
    }
}

/// An answer: a full-width card with a hairline. Revealed answers fill green or red with white text;
/// the rest fade back. The same look on iOS and macOS, where .bordered rendered as bare text.
struct AnswerButtonStyle: ButtonStyle {
    enum State { case open, right, wrong, spent }
    let state: State

    func makeBody(configuration: Configuration) -> some View {
        let fill: Color = switch state {
        case .right: .green
        case .wrong: .red
        default: Theme.canvas
        }
        configuration.label
            .font(.quip(.headline, weight: .semibold))
            .foregroundStyle(state == .right || state == .wrong ? Color.white : Color.primary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 20).frame(minHeight: 52 * Theme.padScale)
            .background(fill, in: RoundedRectangle(cornerRadius: 14))
            .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(.primary.opacity(state == .open ? 0.14 : 0), lineWidth: 1))
            .opacity(state == .spent ? 0.5 : 1)
            .accessibilityValue(state == .right ? Text("Right answer") : state == .wrong ? Text("Your answer, wrong") : Text(""))
            .scaleEffect(configuration.isPressed ? 0.98 : (state == .right ? 1.02 : 1))
            .animation(.spring(duration: 0.3), value: state == .right)
            .contentShape(RoundedRectangle(cornerRadius: 14))
    }
}

extension AnswerButtonStyle.State: Equatable {}

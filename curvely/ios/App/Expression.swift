// Expression parsing and evaluation — the Swift replacement for mathjs.
//
// The web app calls mathjs `parse(expr).compile()` and evaluates it per pixel with one
// variable, x (see src/utils/evaluate.js). That is all it ever asks of mathjs, so this is a
// recursive-descent parser for exactly that grammar rather than a general CAS.
//
// Grammar (lowest to highest precedence):
//   expression := term (('+' | '-') term)*
//   term       := unary (('*' | '/') unary | implicit-multiplication)*
//   unary      := ('-' | '+')* power
//   power      := primary ('^' unary)?          -- right associative
//   primary    := number | variable | constant | function '(' expression ')' | '(' expression ')'
//
// Variables are x, y, t (theta is t) and any other bare name, which reads its value from a
// slider row like `a = 3`. A name nothing defines evaluates to NaN and draws nothing.

import Foundation

enum ExpressionError: Error {
    case message(String)

    var text: String {
        switch self {
        case .message(let m): return m
        }
    }
}

// MARK: - Tokens

private enum Token: Equatable {
    case number(Double)
    case identifier(String)
    case op(Character)
    case lparen
    case rparen
    case comma
}

private func tokenize(_ input: String) throws -> [Token] {
    var tokens: [Token] = []
    let chars = Array(input)
    var i = 0

    while i < chars.count {
        let c = chars[i]

        if c.isWhitespace { i += 1; continue }

        if c.isNumber || c == "." {
            var literal = ""
            while i < chars.count, chars[i].isNumber || chars[i] == "." {
                literal.append(chars[i]); i += 1
            }
            guard let value = Double(literal) else {
                throw ExpressionError.message("Not a number: \(literal)")
            }
            tokens.append(.number(value))
            continue
        }

        if c.isLetter {
            var name = ""
            while i < chars.count, chars[i].isLetter || chars[i].isNumber {
                name.append(chars[i]); i += 1
            }
            tokens.append(.identifier(name.lowercased()))
            continue
        }

        switch c {
        case "+", "-", "*", "/", "^":
            tokens.append(.op(c)); i += 1
        case "(":
            tokens.append(.lparen); i += 1
        case ")":
            tokens.append(.rparen); i += 1
        case ",":
            tokens.append(.comma); i += 1
        default:
            throw ExpressionError.message("Unexpected character: \(c)")
        }
    }
    return tokens
}

// MARK: - Syntax tree

private indirect enum Node {
    case constant(Double)
    case variable(String) // x, y, t, or a slider name
    case unaryMinus(Node)
    case binary(Character, Node, Node)
    case call(String, Node)
}

private let functions: [String: (Double) -> Double] = [
    "sin": sin, "cos": cos, "tan": tan,
    "asin": asin, "acos": acos, "atan": atan,
    "sinh": sinh, "cosh": cosh, "tanh": tanh,
    "sqrt": sqrt, "cbrt": cbrt, "abs": abs,
    // mathjs `log` is the natural logarithm — keep that, or every log() plot shifts.
    "log": Foundation.log, "ln": Foundation.log,
    "log10": log10, "log2": log2, "exp": exp,
    "floor": floor, "ceil": ceil, "round": { $0.rounded() },
    "sign": { $0 > 0 ? 1 : ($0 < 0 ? -1 : 0) },
]

private let constants: [String: Double] = [
    "pi": .pi, "e": M_E, "tau": 2 * .pi,
]

private struct Parser {
    let tokens: [Token]
    var position = 0

    var current: Token? { position < tokens.count ? tokens[position] : nil }

    mutating func parse() throws -> Node {
        let node = try expression()
        if position < tokens.count {
            throw ExpressionError.message("Unexpected trailing input")
        }
        return node
    }

    mutating func expression() throws -> Node {
        var left = try term()
        while case .op(let c) = current, c == "+" || c == "-" {
            position += 1
            left = .binary(c, left, try term())
        }
        return left
    }

    mutating func term() throws -> Node {
        var left = try unary()
        while true {
            if case .op(let c) = current, c == "*" || c == "/" {
                position += 1
                left = .binary(c, left, try unary())
                continue
            }
            // Implicit multiplication: mathjs accepts `2x` and `2sin(x)`, and people type them.
            if startsPrimary(current) {
                left = .binary("*", left, try unary())
                continue
            }
            return left
        }
    }

    private func startsPrimary(_ token: Token?) -> Bool {
        switch token {
        case .number, .identifier, .lparen: return true
        default: return false
        }
    }

    mutating func unary() throws -> Node {
        if case .op(let c) = current, c == "-" || c == "+" {
            position += 1
            let operand = try unary()
            return c == "-" ? .unaryMinus(operand) : operand
        }
        return try power()
    }

    mutating func power() throws -> Node {
        let base = try primary()
        if case .op(let c) = current, c == "^" {
            position += 1
            return .binary("^", base, try unary()) // right associative: 2^3^2 == 2^9
        }
        return base
    }

    mutating func primary() throws -> Node {
        guard let token = current else {
            throw ExpressionError.message("Unexpected end of expression")
        }

        switch token {
        case .number(let value):
            position += 1
            return .constant(value)

        case .lparen:
            position += 1
            let inner = try expression()
            guard case .rparen = current else {
                throw ExpressionError.message("Missing closing parenthesis")
            }
            position += 1
            return inner

        case .identifier(let name):
            position += 1
            if let value = constants[name] { return .constant(value) }
            guard functions[name] != nil else {
                // `x(x+1)` multiplies; any other unknown name before a paren is a typo'd function.
                if case .lparen = current, !["x", "y", "t", "theta"].contains(name) {
                    throw ExpressionError.message("Unknown function: \(name)")
                }
                return .variable(name == "theta" ? "t" : name)
            }
            guard case .lparen = current else {
                throw ExpressionError.message("\(name) needs parentheses, like \(name)(x)")
            }
            position += 1
            let argument = try expression()
            guard case .rparen = current else {
                throw ExpressionError.message("Missing closing parenthesis after \(name)(")
            }
            position += 1
            return .call(name, argument)

        case .rparen:
            throw ExpressionError.message("Unmatched closing parenthesis")

        case .comma:
            throw ExpressionError.message("Unexpected comma")

        case .op(let c):
            throw ExpressionError.message("Unexpected operator: \(c)")
        }
    }
}

/// Slider values by name, from rows like `a = 3`.
typealias Vars = [String: Double]

private struct Scope {
    var x = Double.nan, y = Double.nan, t = Double.nan
    let vars: Vars
}

private func evaluate(_ node: Node, _ scope: Scope) -> Double {
    switch node {
    case .constant(let value):
        return value
    case .variable(let name):
        switch name {
        case "x": return scope.x
        case "y": return scope.y
        case "t": return scope.t
        default: return scope.vars[name] ?? .nan
        }
    case .unaryMinus(let operand):
        return -evaluate(operand, scope)
    case .call(let name, let argument):
        return functions[name]?(evaluate(argument, scope)) ?? .nan
    case .binary(let op, let lhs, let rhs):
        let a = evaluate(lhs, scope)
        let b = evaluate(rhs, scope)
        switch op {
        case "+": return a + b
        case "-": return a - b
        case "*": return a * b
        case "/": return a / b
        case "^": return pow(a, b)
        default: return .nan
        }
    }
}

private func uses(_ name: String, _ node: Node) -> Bool {
    switch node {
    case .constant: return false
    case .variable(let v): return v == name
    case .unaryMinus(let operand): return uses(name, operand)
    case .call(_, let argument): return uses(name, argument)
    case .binary(_, let lhs, let rhs): return uses(name, lhs) || uses(name, rhs)
    }
}

// MARK: - Public surface, mirroring src/utils/evaluate.js

struct CompiledExpression {
    /// nil when the input was empty — an empty row is not an error, it just draws nothing.
    let function: ((Double, Vars) -> Double)?
    /// Set instead of `function` for an implicit equation (x^2+y^2=1, x=3, ...): f(x,y) = lhs-rhs,
    /// traced by marching squares rather than walked per pixel. Mirrors src/utils/evaluate.js.
    let implicitFunction: ((Double, Double, Vars) -> Double)?
    /// `(1, 2)` or `(a, a^2)`: one dot.
    var point: ((Vars) -> (Double, Double))? = nil
    /// `(cos(t), sin(t))` or `r = 1 + cos(theta)`, sampled over t in [0, tMax].
    var parametric: ((Double, Vars) -> (Double, Double))? = nil
    /// `y > x^2`: shade where sign * implicitFunction > 0, dashed edge when strict.
    var inequality: (sign: Double, strict: Bool)? = nil
    /// `a = 3`: a slider row, draws nothing itself.
    var slider: (name: String, value: Double)? = nil
    let error: String?
}

/// Parametric and polar curves run t from 0 to 2 pi, same as the web's T_MAX.
let tMax = Double.pi * 2

private let reservedNames: Set<String> = ["x", "y", "t", "r", "theta"]

/// `a = 3` defines a slider, mirroring parseSlider in src/utils/evaluate.js.
func parseSlider(_ raw: String) -> (name: String, value: Double)? {
    let trimmed = raw.trimmingCharacters(in: .whitespaces)
    guard let match = trimmed.wholeMatch(of: #/([a-zA-Z]\w*)\s*=\s*(-?\d+(?:\.\d+)?)/#),
          let value = Double(match.2) else { return nil }
    let name = String(match.1).lowercased()
    return reservedNames.contains(name) ? nil : (name, value)
}

/// `y > x^2`, `x^2+y^2 <= 4`: exactly one comparison, mirroring splitInequality on the web.
func splitInequality(_ raw: String) -> (lhs: String, rhs: String, sign: Double, strict: Bool)? {
    guard let m = raw.wholeMatch(of: #/([^<>=]+)(<=|>=|<|>)([^<>=]+)/#) else { return nil }
    let op = String(m.2)
    return (String(m.1).trimmingCharacters(in: .whitespaces), String(m.3).trimmingCharacters(in: .whitespaces),
            op.hasPrefix(">") ? 1 : -1, op.count == 1)
}

/// `(a, b)`: the outer parens wrap the whole input and hold exactly one top-level comma.
func splitPair(_ raw: String) -> (String, String)? {
    let s = Array(raw.trimmingCharacters(in: .whitespaces))
    guard s.first == "(", s.last == ")" else { return nil }
    var depth = 0
    var comma: Int?
    for (i, c) in s.enumerated() {
        if c == "(" { depth += 1 }
        else if c == ")" { depth -= 1; if depth == 0 && i != s.count - 1 { return nil } }
        else if c == ",", depth == 1 { if comma != nil { return nil }; comma = i }
    }
    guard let comma else { return nil }
    return (String(s[1..<comma]).trimmingCharacters(in: .whitespaces),
            String(s[(comma + 1)..<(s.count - 1)]).trimmingCharacters(in: .whitespaces))
}

/// Any `=` not of the form `y = ...` is an implicit equation.
func isImplicitEquation(_ raw: String) -> Bool {
    let cleaned = raw.trimmingCharacters(in: .whitespaces)
    guard cleaned.contains("="), parseSlider(cleaned) == nil else { return false }
    return cleaned.range(of: #"^[yr]\s*=\s*"#, options: [.regularExpression, .caseInsensitive]) == nil
}

private func compileSide(_ raw: String) throws -> Node {
    var parser = Parser(tokens: try tokenize(raw))
    return try parser.parse()
}

func compileExpression(_ raw: String) -> CompiledExpression {
    let trimmed = raw.trimmingCharacters(in: .whitespaces)
    guard !trimmed.isEmpty else {
        return CompiledExpression(function: nil, implicitFunction: nil, error: nil)
    }

    if let slider = parseSlider(trimmed) {
        return CompiledExpression(function: nil, implicitFunction: nil, slider: slider, error: nil)
    }

    do {
        if let ineq = splitInequality(trimmed) {
            let lhs = try compileSide(ineq.lhs)
            let rhs = try compileSide(ineq.rhs)
            let g: (Double, Double, Vars) -> Double = { x, y, vars in
                let scope = Scope(x: x, y: y, vars: vars)
                return evaluate(lhs, scope) - evaluate(rhs, scope)
            }
            return CompiledExpression(function: nil, implicitFunction: g,
                                      inequality: (ineq.sign, ineq.strict), error: nil)
        }
        if let match = trimmed.range(of: #"^r\s*=\s*"#, options: [.regularExpression, .caseInsensitive]) {
            let r = try compileSide(String(trimmed[match.upperBound...]))
            let polar: (Double, Vars) -> (Double, Double) = { t, vars in
                let radius = evaluate(r, Scope(t: t, vars: vars))
                return (radius * cos(t), radius * sin(t))
            }
            return CompiledExpression(function: nil, implicitFunction: nil, parametric: polar, error: nil)
        }
        if let (xs, ys) = splitPair(trimmed) {
            let xn = try compileSide(xs)
            let yn = try compileSide(ys)
            if uses("t", xn) || uses("t", yn) {
                let curve: (Double, Vars) -> (Double, Double) = { t, vars in
                    let scope = Scope(t: t, vars: vars)
                    return (evaluate(xn, scope), evaluate(yn, scope))
                }
                return CompiledExpression(function: nil, implicitFunction: nil, parametric: curve, error: nil)
            }
            let point: (Vars) -> (Double, Double) = { vars in
                let scope = Scope(vars: vars)
                return (evaluate(xn, scope), evaluate(yn, scope))
            }
            return CompiledExpression(function: nil, implicitFunction: nil, point: point, error: nil)
        }
    } catch let error as ExpressionError {
        return CompiledExpression(function: nil, implicitFunction: nil, error: error.text)
    } catch {
        return CompiledExpression(function: nil, implicitFunction: nil, error: "Could not read that expression")
    }

    if isImplicitEquation(trimmed) {
        let parts = trimmed.split(separator: "=", maxSplits: 1).map {
            $0.trimmingCharacters(in: .whitespaces)
        }
        do {
            let lhs = try compileSide(parts[0])
            let rhs = try compileSide(parts.count > 1 ? parts[1] : "")
            let implicitFn: (Double, Double, Vars) -> Double = { x, y, vars in
                let scope = Scope(x: x, y: y, vars: vars)
                return evaluate(lhs, scope) - evaluate(rhs, scope)
            }
            return CompiledExpression(function: nil, implicitFunction: implicitFn, error: nil)
        } catch let error as ExpressionError {
            return CompiledExpression(function: nil, implicitFunction: nil, error: error.text)
        } catch {
            return CompiledExpression(function: nil, implicitFunction: nil, error: "Could not read that expression")
        }
    }

    // Strip a leading `y =`, same as the web version's /^y\s*=\s*/i.
    var cleaned = trimmed
    if let match = cleaned.range(of: #"^y\s*=\s*"#, options: [.regularExpression, .caseInsensitive]) {
        cleaned = String(cleaned[match.upperBound...])
    }
    cleaned = cleaned.trimmingCharacters(in: .whitespaces)
    guard !cleaned.isEmpty else {
        return CompiledExpression(function: nil, implicitFunction: nil, error: nil)
    }

    do {
        let tree = try compileSide(cleaned)
        return CompiledExpression(function: { evaluate(tree, Scope(x: $0, vars: $1)) }, implicitFunction: nil, error: nil)
    } catch let error as ExpressionError {
        return CompiledExpression(function: nil, implicitFunction: nil, error: error.text)
    } catch {
        return CompiledExpression(function: nil, implicitFunction: nil, error: "Could not read that expression")
    }
}

/// A vertical asymptote (tan(x), 1/x) yields two finite but huge values of opposite sign on
/// adjacent pixels. Joining them draws a false vertical line, so the stroke has to break.
func isAsymptoteJump(previous: Double, current: Double, scale: Double, height: Double) -> Bool {
    // Mirrors Math.sign() exactly, zero included, so the Swift and JS versions break in the
    // same places.
    func sign(_ value: Double) -> Double { value > 0 ? 1 : (value < 0 ? -1 : 0) }
    return sign(current) != sign(previous) && abs(current - previous) * scale > height * 2
}

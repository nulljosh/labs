// Ready-made graphs, one tap each. Same list as src/utils/patterns.js, keep them in step.

struct Pattern {
    let name: String
    let rows: [String]
}

let patterns: [Pattern] = [
    Pattern(name: "Golden spiral", rows: ["r = phi^(2theta/pi) {-4pi < theta < 2pi}"]),
    Pattern(name: "Sunflower", rows: ["n = [1...300]", "(0.2 sqrt(n) cos(2pi n/phi^2), 0.2 sqrt(n) sin(2pi n/phi^2))"]),
    Pattern(name: "Rose", rows: ["k = 4 {1 < k < 9}", "r = 3cos(k theta)"]),
    Pattern(name: "Butterfly", rows: ["r = e^sin(theta) - 2cos(4theta) + sin((2theta - pi)/24)^5 {0 < theta < 12pi}"]),
    Pattern(name: "Heart", rows: ["(sin(t)^3 * 2, (13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t))/8)"]),
    Pattern(name: "Lissajous", rows: ["a = 3 {1 < a < 8}", "b = 2 {1 < b < 8}", "(3sin(a t), 3sin(b t))"]),
    Pattern(name: "Spirograph", rows: ["(2cos(t) + 2.5cos(2t/3), 2sin(t) - 2.5sin(2t/3)) {0 < t < 6pi}"]),
    Pattern(name: "Cardioid", rows: ["r = 2 + 2cos(theta)"]),
    Pattern(name: "Sine fan", rows: ["sin(x + [0...7]/4)"]),
    Pattern(name: "Damped wave", rows: ["e^(-x/4) sin(3x)", "e^(-x/4)", "-e^(-x/4)"]),
]

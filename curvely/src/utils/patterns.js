// Ready-made graphs, one tap each. Same list as ios/App/Patterns.swift, keep them in step.
export const PATTERNS = [
  { name: 'Golden spiral', rows: ['r = phi^(2theta/pi) {-4pi < theta < 2pi}'] },
  { name: 'Sunflower', rows: ['n = [1...300]', '(0.2 sqrt(n) cos(2pi n/phi^2), 0.2 sqrt(n) sin(2pi n/phi^2))'] },
  { name: 'Rose', rows: ['k = 4 {1 < k < 9}', 'r = 3cos(k theta)'] },
  { name: 'Butterfly', rows: ['r = e^sin(theta) - 2cos(4theta) + sin((2theta - pi)/24)^5 {0 < theta < 12pi}'] },
  { name: 'Heart', rows: ['(sin(t)^3 * 2, (13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t))/8)'] },
  { name: 'Lissajous', rows: ['a = 3 {1 < a < 8}', 'b = 2 {1 < b < 8}', '(3sin(a t), 3sin(b t))'] },
  { name: 'Spirograph', rows: ['(2cos(t) + 2.5cos(2t/3), 2sin(t) - 2.5sin(2t/3)) {0 < t < 6pi}'] },
  { name: 'Cardioid', rows: ['r = 2 + 2cos(theta)'] },
  { name: 'Sine fan', rows: ['sin(x + [0...7]/4)'] },
  { name: 'Damped wave', rows: ['e^(-x/4) sin(3x)', 'e^(-x/4)', '-e^(-x/4)'] },
];

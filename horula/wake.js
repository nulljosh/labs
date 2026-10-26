// Sleep sounds, made here: white, pink (Paul Kellet's filter) and brown noise. Brown's ends are levelled so a loop has no click.
function noise(kind, n, rand = Math.random) {
  const out = new Float32Array(n); let b0 = 0, b1 = 0, b2 = 0, last = 0;
  for (let i = 0; i < n; i++) {
    const w = rand() * 2 - 1;
    if (kind === 'pink') { b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; out[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11; }
    else if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; out[i] = last * 3.5; }
    else out[i] = w * 0.5;
  }
  const drift = kind === 'brown' ? out[n - 1] - out[0] : 0;   // only brown wanders; white and pink already loop clean
  for (let i = 0; i < n && drift; i++) out[i] -= drift * i / (n - 1);
  return out;
}
// Alarm mission, like Alarmy: a sum to solve before an alarm stops. Two numbers from 12 to 89, so it takes a moment awake.
function mathProblem(rand = Math.random) {
  const x = 12 + Math.floor(rand() * 78), y = 12 + Math.floor(rand() * 78);
  return { q: `${x} + ${y}`, a: x + y };
}
if (typeof module === 'object') module.exports = { noise, mathProblem };

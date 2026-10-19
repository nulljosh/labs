// Type it: forgiving answer matching. Case, accents, punctuation, a leading "the" and a
// small typo (about one in six letters) all pass; a title is also accepted without its
// subtitle ("Anchorman" for "Anchorman: The Legend of Ron Burgundy").
// Loaded by play.html as window.Match and by match.test.js through require.
(function (root) {
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^a-z0-9 ]/g, ' ').replace(/^(the|a|an) /, '').replace(/\s+/g, ' ').trim();
  function dist(a, b) {
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  }
  const close = (guess, target) => guess === target || (target.length >= 4 && dist(guess, target) <= Math.floor(target.length / 6));
  function ok(typed, answer) {
    const g = norm(typed);
    if (!g) return false;
    return close(g, norm(answer)) || (answer.includes(':') && close(g, norm(answer.split(':')[0])));
  }
  const api = { ok, norm };
  if (typeof module !== 'undefined') module.exports = api; else root.Match = api;
})(this);

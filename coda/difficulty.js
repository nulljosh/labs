// Real difficulty: every answer is tallied per quote on jaybulb-api, keyed by an FNV-1a hash of
// the quote text. With ten or more plays the real hit rate decides; before that, the
// hand-picked lines (no `source`) count as easy and the harvested ones as medium.
// Loaded by play.html as window.Difficulty and by difficulty.test.js through require.
(function (root) {
  function qid(text) {
    let h = 0x811c9dc5;
    for (const ch of new TextEncoder().encode(text)) h = Math.imul(h ^ ch, 0x01000193) >>> 0;
    return h.toString(16).padStart(8, '0');
  }
  function level(q, stats) {
    const s = stats && stats[qid(q.quote)];
    if (s && s.plays >= 10) {
      const rate = s.correct / s.plays;
      return rate >= 0.75 ? 'easy' : rate <= 0.4 ? 'hard' : 'medium';
    }
    return q.source ? 'medium' : 'easy';
  }
  const api = { qid, level };
  if (typeof module !== 'undefined') module.exports = api; else root.Difficulty = api;
})(this);

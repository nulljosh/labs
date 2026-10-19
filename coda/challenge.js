// Challenge link: the first ten quotes of a run plus the score on them, packed into the URL, so a
// friend plays the same ten with no server. Quotes travel as their Difficulty.qid, so the link
// survives the bank being reordered; a quote that has left the bank is skipped.
// Loaded by play.html as window.Challenge and by challenge.test.js through require.
(function (root) {
  const SIZE = 10;
  function encode(qids, score, name) {
    const p = new URLSearchParams({ c: qids.slice(0, SIZE).join('.'), s: String(score) });
    if (name) p.set('n', name.slice(0, 24));
    return p.toString();
  }
  function decode(search, bank, qid) {
    const p = new URLSearchParams(search);
    if (!p.has('c')) return null;
    const byId = new Map(bank.map(q => [qid(q.quote), q]));
    const quotes = p.get('c').split('.').filter(id => /^[0-9a-f]{8}$/.test(id)).map(id => byId.get(id)).filter(Boolean).slice(0, SIZE);
    if (!quotes.length) return null;
    return { quotes, score: Math.max(0, parseInt(p.get('s'), 10) || 0), name: (p.get('n') || 'Your friend').slice(0, 24) };
  }
  const verdict = (mine, theirs, name) => mine > theirs ? `You beat ${name}, ${mine} to ${theirs}.`
    : mine < theirs ? `${name} wins, ${theirs} to ${mine}.` : `A tie with ${name} at ${mine}.`;
  const api = { SIZE, encode, decode, verdict };
  if (typeof module !== 'undefined') module.exports = api; else root.Challenge = api;
})(this);

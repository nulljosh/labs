// Hints: level 1 gives the year (or the word count for music), level 2 the first letter. A question may
// carry its own two hints (q.hints), as a timeline does.
// Each hint halves the points. Loaded by play.html as window.Hints and by hints.test.js.
(function (root) {
  const MAX = 2;
  const hintText = (q, level) => q.hints ? q.hints[level - 1] : level === 1
    ? (q.year ? `Released ${q.year}` : `${q.answer.split(/\s+/).length} word${/\s/.test(q.answer.trim()) ? 's' : ''}`)
    : `Starts with ${q.answer.trim()[0].toUpperCase()}`;
  const points = (base, used) => Math.max(1, Math.floor(base / 2 ** used));
  const api = { MAX, hintText, points };
  if (typeof module !== 'undefined') module.exports = api; else root.Hints = api;
})(this);

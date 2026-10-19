// Ways to guess (Era 3). Each mode turns a bank entry into a question { ...q, answer, options,
// prompt, display? } or null when the entry can't be played that way. The original line stays in
// q.quote so quote ids, tallies and stats keep working. Classic play doesn't go through here.
// Loaded by play.html as window.Modes and by modes.test.js through require.
(function (root) {
  const shuffle = (a, rand) => a.map(x => [rand(), x]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  // Three distinct distractors: same-title values first, then the same genre, then anything.
  function pick(answer, tiers, rand) {
    const out = [];
    for (const tier of tiers) for (const v of shuffle([...new Set(tier)], rand)) {
      if (out.length === 3) break;
      if (v && v !== answer && !out.includes(v)) out.push(v);
    }
    return out.length === 3 ? shuffle([answer, ...out], rand) : null;
  }
  const BUILD = {
    // v21: name the character. Movies, TV and games carry a character; books carry the author.
    who(q, all, rand) {
      if (!q.character || !['movie', 'tv', 'game'].includes(q.type)) return null;
      if (q.quote.toLowerCase().includes(q.character.split(/[\s.]+/).find(w => w.length > 2)?.toLowerCase() ?? '\0')) return null;  // the line names its speaker
      const chars = (f) => all.filter(o => o.character && o.type === q.type && f(o)).map(o => o.character);
      const options = pick(q.character, [chars(o => o.answer === q.answer), chars(o => o.genre === q.genre), chars(() => true)], rand);
      return options && { ...q, answer: q.character, character: q.answer, options, prompt: `Who said it in ${q.answer}?` };
    },
  };
  const build = (mode, q, all, rand = Math.random) => (BUILD[mode] ? BUILD[mode](q, all, rand) : q);
  const api = { build };
  if (typeof module !== 'undefined') module.exports = api; else root.Modes = api;
})(this);

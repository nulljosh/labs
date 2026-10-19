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
  const speaker = (c) => c.replace(/\s*\/\s*/g, ' / ').trim();  // "A/B" and "A / B" are one person
  const BUILD = {
    // v21: name the character. Movies, TV and games carry a character; books carry the author.
    who(q, all, rand) {
      if (!q.character || /narrator/i.test(q.character) || !['movie', 'tv', 'game'].includes(q.type)) return null;
      if (q.quote.toLowerCase().includes(q.character.split(/[\s.]+/).find(w => w.length > 2)?.toLowerCase() ?? '\0')) return null;  // the line names its speaker
      const chars = (f) => all.filter(o => o.character && !/narrator/i.test(o.character) && o.type === q.type && f(o)).map(o => speaker(o.character));
      const options = pick(speaker(q.character), [chars(o => o.answer === q.answer), chars(o => o.genre === q.genre), chars(() => true)], rand);
      return options && { ...q, answer: speaker(q.character), character: q.answer, options, prompt: `Who said it in ${q.answer}?` };
    },
    // v22: one word of the line is blanked; pick it from four. Distractors are words of about the
    // same length from other lines in the genre, so length alone gives nothing away.
    finish(q, all, rand) {
      const words = q.quote.match(/[A-Za-z']+/g) || [];
      const cands = [...new Set(words.filter(w => w.length >= 5 && !w.includes("'")).map(w => w.toLowerCase()))];
      if (!cands.length || q.type === 'music' && words.length < 4) return null;
      const word = cands[Math.floor(rand() * cands.length)], own = new Set(words.map(w => w.toLowerCase()));  // no distractor already in the line
      const near = (f) => all.filter(o => o !== q && f(o)).flatMap(o => o.quote.match(/[A-Za-z]+/g) || [])
        .map(w => w.toLowerCase()).filter(w => Math.abs(w.length - word.length) <= 1 && w.length >= 5 && !own.has(w));
      const options = pick(word, [near(o => o.genre === q.genre).slice(0, 200), near(() => true).slice(0, 400)], rand);
      if (!options) return null;
      const display = q.quote.replace(new RegExp(`\\b${word}\\b`, 'gi'), '_____');
      return { ...q, answer: word, character: [q.character, q.answer].filter(Boolean).join(', '), options, display, prompt: `Finish the line from ${q.answer}.` };
    },
  };
  const build = (mode, q, all, rand = Math.random) => (BUILD[mode] ? BUILD[mode](q, all, rand) : q);
  const api = { build };
  if (typeof module !== 'undefined') module.exports = api; else root.Modes = api;
})(this);

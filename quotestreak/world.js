// Original languages (v57): film lines in the language they were written in, from that language's
// Wikiquote. Name the film from three others in the same language. The reveal gives the English
// title, the year and the speaker. Loaded by play.html as window.World (the lines arrive by fetch from
// world-data.json, like quotes.json), and by modes.test.js through require.
(function (root) {
  let DATA = typeof module !== 'undefined' ? require('./world-data.json') : [];
  if (typeof module === 'undefined') fetch('world-data.json').then(r => r.json()).then(d => { DATA = d; }).catch(() => {});
  function questions(rand = Math.random) {
    const films = (lang) => [...new Set(DATA.filter(d => d.lang === lang).map(d => d.answer))];
    const out = [];
    for (const d of DATA) {
      const others = films(d.lang).filter(f => f !== d.answer).map(f => [rand(), f]).sort((a, b) => a[0] - b[0]).slice(0, 3).map(x => x[1]);
      if (others.length < 3) continue;
      out.push({
        type: 'movie', genre: 'world', quote: d.quote, answer: d.answer, options: [d.answer, ...others], noTally: true, year: null, source: d.source,
        prompt: `Name the ${d.lang} film.`, character: [d.character, d.english && `${d.english} in English`, d.year].filter(Boolean).join(', '),
        hints: [d.year ? `It came out in ${d.year}` : `It’s a ${d.lang} film`, d.english ? `In English it’s called ${d.english}` : `It starts with ${d.answer[0]}`],
      });
    }
    return out;
  }
  const api = { questions };
  if (typeof module !== 'undefined') module.exports = api; else root.World = api;
})(this);

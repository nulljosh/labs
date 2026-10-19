// Phrases (v56): words that came into everyday English from a book, play, film or show. The word is
// shown; the player names the work it came from. The reveal gives its meaning from Wordroot.
// Loaded by play.html as window.Phrases after phrases-data.js, and by modes.test.js through require.
(function (root) {
  const DATA = typeof module !== 'undefined' ? require('./phrases-data') : root.PHRASES;
  // A word inside its own title (gaslight, Gaslight) answers itself, so those stay out.
  const stem = (w) => w.toLowerCase().replace(/[^a-z]/g, '').slice(0, 5);
  const fair = DATA.filter(p => !p.work.toLowerCase().replace(/[^a-z]/g, '').includes(stem(p.word)));
  function questions(rand = Math.random) {
    const works = [...new Set(DATA.map(p => p.work))];
    const others = (w) => works.filter(x => x !== w).map(x => [rand(), x]).sort((a, b) => a[0] - b[0]).slice(0, 3).map(x => x[1]);
    return fair.map(p => ({
      type: 'phrase', genre: 'phrase', quote: p.word, plain: p.word, answer: p.work, options: [p.work, ...others(p.work)], noTally: true,
      prompt: 'Which work gave English this word?', character: `a ${p.kind} from ${p.year}. \u201C${p.word}\u201D means ${p.meaning[0].toLowerCase()}${p.meaning.slice(1)}.`, year: null,
      hints: [`It’s a ${p.kind}`, `It came out in ${p.year}`],
    }));
  }
  const api = { questions };
  if (typeof module !== 'undefined') module.exports = api; else root.Phrases = api;
})(this);

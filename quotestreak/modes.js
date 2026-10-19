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
  // v53 Actor mode: who delivered the line, from the cast lists on the line's Wikiquote page.
  BUILD.actor = (q, all, rand) => {
    if (!q.actor) return null;
    const actors = (f) => all.filter(o => o.actor && f(o)).map(o => o.actor);
    const options = pick(q.actor, [actors(o => o.answer === q.answer), actors(o => o.type === q.type && o.genre === q.genre), actors(o => o.type === q.type), actors(() => true)], rand);
    return options && { ...q, answer: q.actor, options, character: `${q.character} in ${q.answer}`, prompt: `Who said this in ${q.answer}?` };
  };
  // v54 Director mode: who directed the film, from Wikidata through the film's Wikipedia article.
  BUILD.director = (q, all, rand) => {
    if (!q.director) return null;
    const near = (o) => o.year && q.year && Math.abs(o.year - q.year) <= 10;
    const dirs = (f) => all.filter(o => o.director && o.answer !== q.answer && f(o)).map(o => o.director);
    const options = pick(q.director, [dirs(o => near(o) && o.genre === q.genre), dirs(near), dirs(() => true)], rand);
    return options && { ...q, answer: q.director, options, character: `${q.answer}, ${q.year}`, year: null, prompt: `Who directed ${q.answer}?` };
  };
  // v55 Album: which album the song is on (Wikidata, else the song's Wikipedia infobox). Wrong answers
  // are the artist's other studio albums, then albums from the same genre.
  BUILD.record = (q, all, rand) => {   // 'album' is taken by v26 Album reveal
    if (!q.album || !q.song) return null;
    const albums = (f) => all.filter(o => o.album && o.answer !== q.answer && f(o)).map(o => o.album);
    const options = pick(q.album, [q.albums || [], albums(o => o.genre === q.genre), albums(() => true)], rand);
    return options && { ...q, answer: q.album, options, character: `${q.song} by ${q.answer}, ${q.year}`, year: null, prompt: `Which album is ${q.song} on?` };
  };
  // A derived question's answer is a character, person, word or year; `title` keeps the work's name
  // (the watchlist, v63, saves titles).
  const build = (mode, q, all, rand = Math.random) => { const out = BUILD[mode] ? BUILD[mode](q, all, rand) : q; return out && out !== q ? { title: q.answer, titleYear: q.year, ...out } : out; };
  // v24 Timeline: which of four came out first? Four titles at least three years apart; the reveal
  // gives every year so the player learns the order.
  function timeline(list, rand) {
    const dated = shuffle(list.filter(q => q.year && q.type !== 'music'), rand), out = [];
    while (dated.length >= 4 && out.length < 20) {
      const four = [dated.pop()];
      for (let i = dated.length - 1; i >= 0 && four.length < 4; i--)
        if (four.every(t => Math.abs(t.year - dated[i].year) >= 3 && t.answer !== dated[i].answer)) four.push(dated.splice(i, 1)[0]);
      if (four.length < 4) continue;
      const first = [...four].sort((x, y) => x.year - y.year)[0];
      out.push({
        ...first, quote: four.map(t => t.quote).join(' | '), year: null, art: null, noTally: true,
        genre: 'timeline', plain: 'Which came out first?', prompt: 'Oldest wins.', options: shuffle(four.map(t => t.answer), rand),
        character: `it came out in ${first.year}; then ${[...four].sort((x, y) => x.year - y.year).slice(1).map(t => `${t.answer} (${t.year})`).join(', ')}`,
        hints: [`It came out in the ${Math.floor(first.year / 10) * 10}s`, `It starts with ${first.answer[0]}`],
      });
    }
    return out;
  }
  // v25 Poster reveal, v26 Album reveal: the art itself is the question, blurred until it sharpens
  // (reveal.js). One question per title; TMDB art is a poster, iTunes art is an album cover.
  function reveal(list, kind, rand) {
    const seen = new Set();
    return shuffle(list.filter(q => q.art && q.art.includes(kind === 'poster' ? 'tmdb' : 'mzstatic') && !seen.has(q.answer) && seen.add(q.answer)), rand)
      .map(q => ({ ...q, image: q.art, noTally: true, square: kind === 'album', prompt: kind === 'poster' ? 'Name the movie from the poster.' : 'Name the artist from the cover.' }));
  }
  // v27 Name the year: the line and its title, four years to pick from. The wrong years sit
  // three to twelve years either side and at least three apart, so the decade alone doesn't settle it.
  const PART = ['early', 'early', 'early', 'mid', 'mid', 'mid', 'mid', 'late', 'late', 'late'];
  // Greedy over a shuffled list of every allowed year, so it always ends; if spacing can't fit three
  // (a very recent year), it settles for any distinct ones.
  function yearChoices(y, rand) {
    const now = new Date().getFullYear(), out = [y];
    const cands = shuffle([...Array(10)].flatMap((_, i) => [y - 3 - i, y + 3 + i]).filter(c => c <= now && c >= 1900), rand);
    for (const gap of [3, 1]) for (const c of cands) if (out.length < 4 && out.every(o => Math.abs(o - c) >= gap)) out.push(c);
    return shuffle(out.map(String), rand);
  }
  // A title that carries its own year (Taylor Swift's 1989) would answer itself, so it sits out.
  const year = (list, rand) => shuffle(list.filter(q => q.year && !`${q.answer} ${q.song || ''}`.includes(String(q.year))), rand).map(q => ({
    ...q, title: q.answer, titleYear: q.year, answer: String(q.year), options: yearChoices(q.year, rand), year: null, character: q.answer,
    prompt: `What year did ${q.answer} come out?`,
    hints: [`It's from the ${Math.floor(q.year / 10) * 10}s`, `The ${PART[q.year % 10]} ${Math.floor(q.year / 10) * 10}s`],
  }));
  // v30 Marathon: the whole bank, one genre after another in turn, until three misses (game.js).
  function marathon(all, rand) {
    const by = {};
    for (const q of shuffle(all, rand)) (by[q.genre] = by[q.genre] || []).push(q);
    const lanes = shuffle(Object.values(by), rand), out = [];
    for (let i = 0; out.length < all.length; i++) for (const lane of lanes) if (lane[i]) out.push(lane[i]);
    return out.reverse();  // game.js pops from the end
  }
  // A game's questions. Most modes reshape the filtered bank; misquotes (v23) bring their own set.
  const Mis = typeof module !== 'undefined' ? require('./misquotes') : root.Misquotes;
  const Imp = typeof module !== 'undefined' ? require('./improv') : root.Improv;
  const Phr = typeof module !== 'undefined' ? require('./phrases') : root.Phrases;
  const Wor = typeof module !== 'undefined' ? require('./world') : root.World;
  const pool = (mode, list, all, rand = Math.random) => mode === 'misquote' ? shuffle(Mis.questions(), rand)
    : mode === 'improv' ? shuffle(Imp.questions(), rand)
    : mode === 'phrase' ? shuffle(Phr.questions(rand), rand)
    : mode === 'world' ? shuffle(Wor.questions(rand), rand)
    : mode === 'practice' ? (root.Practice?.questions ? root.Practice.questions(all) : [])
    : mode === 'timeline' ? timeline(list, rand)
    : mode === 'poster' || mode === 'album' ? reveal(list, mode, rand)
    : mode === 'year' ? year(list, rand)
    : mode === 'marathon' ? marathon(all, rand)
    : list.map(q => build(mode, q, all, rand)).filter(Boolean);
  const api = { build, pool };
  if (typeof module !== 'undefined') module.exports = api; else root.Modes = api;
})(this);

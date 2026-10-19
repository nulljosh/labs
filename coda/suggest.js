// Suggestions (v62): "Know 80s action? Try 80s comedy." From the player's own stats (stats.js): the
// genre and the decade they get right most often (eight answers at least, 70% or better) point to a
// neighbour they have barely played. suggest() is pure, for suggest.test.js; the page part shows it
// on the end screen with a button that sets the filters and plays.
(function (root) {
  const MIN_SEEN = 8, STRONG = 0.7, FRESH = 5;
  function suggest(stats, genres, decades, rand = Math.random) {
    const rate = (bag, k) => { const t = bag[k]; return t && t[1] >= MIN_SEEN ? t[0] / t[1] : -1; };
    const best = (bag) => Object.keys(bag).filter(k => rate(bag, k) >= STRONG).sort((a, b) => rate(bag, b) - rate(bag, a))[0];
    const fresh = (bag, list) => list.filter(k => !bag[k] || bag[k][1] < FRESH);
    const pick = (list) => list[Math.floor(rand() * list.length)];
    const g = best(stats.genres || {}), d = best(stats.decades || {});
    const newGenres = fresh(stats.genres || {}, genres), newDecades = fresh(stats.decades || {}, decades.map(String));
    if (g && newGenres.length) {
      const try_ = pick(newGenres);
      return d ? { genre: try_, decade: +d, know: { genre: g, decade: +d } } : { genre: try_, decade: null, know: { genre: g, decade: null } };
    }
    if (d) {
      const near = newDecades.filter(x => Math.abs(+x - +d) === 10);
      if (near.length) return { genre: null, decade: +pick(near), know: { genre: null, decade: +d } };
    }
    return null;
  }
  const api = { suggest, MIN_SEEN, STRONG };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  root.Suggest = api;

  const box = document.createElement('div');
  box.id = 'suggest';
  box.className = 'hidden';
  box.innerHTML = '<p id="suggest-text" class="prompt"></p><button id="suggest-go">Try it</button>';
  $('restart').before(box);
  let tip = null;
  const name = (genre, decade) => [decade && `${decade}s`, genre && label(genre)].filter(Boolean).join(' ');
  const before = window.quotableBadge;
  window.quotableBadge = (event, d = {}) => {
    before(event, d);
    if (event !== 'game') return;
    const decades = [...$('decade').options].map(o => o.value).filter(v => v !== 'all');
    tip = window.quotableOffBoard ? null : suggest(statsLoad(), [...new Set(quotes.map(q => q.genre))], decades);
    box.classList.toggle('hidden', !tip);
    if (tip) $('suggest-text').textContent = `You know ${name(tip.know.genre, tip.know.decade)}. Try ${name(tip.genre, tip.decade)}?`;
  };
  $('suggest-go').onclick = () => {
    if (!tip) return;
    $('genre').value = tip.genre || 'all';
    $('decade').value = tip.decade ? String(tip.decade) : 'all';
    $('mode').value = 'classic';
    endEl.classList.add('hidden');
    startGame(false);
  };
})(this);

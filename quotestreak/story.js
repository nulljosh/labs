// The story (v51). Classic script after game.js. After an answer a "The story" link sits under the
// feedback; tapping it holds the game (game.js's nextTimer) and opens a card about the title: the
// opening of its Wikipedia article, its picture, and a link to the line's Wikiquote page when there is
// one. The card only shows what those pages say; nothing in it is written by the game.
(function (root) {
  // Article titles to try, most specific first. A harvested line's Wikiquote page usually has the
  // same title as the Wikipedia article.
  function candidates(q) {
    const fromSource = q.source?.includes('wikiquote.org/wiki/') ? [decodeURIComponent(q.source.split('/wiki/')[1]).replace(/_/g, ' ')] : [];
    const a = q.answer, by = {
      movie: [`${a} (${q.year} film)`, `${a} (film)`, a], tv: [`${a} (TV series)`, a], game: [`${a} (video game)`, a],
      music: [`${a} (band)`, `${a} (singer)`, a], book: [`${a} (novel)`, a],
    };
    return [...new Set([...fromSource, ...(by[q.type] || [a])])];
  }
  const fits = (q, d) => !d ? false : ({ movie: /film|movie/, tv: /series|sitcom|show|television/, game: /game/, music: /band|singer|rapper|musician|group|artist|duo/, book: /novel|book|story/ }[q.type] || /./).test((d || '').toLowerCase());
  const api = { candidates, fits };
  if (typeof module !== 'undefined') { module.exports = api; return; }

  const sEsc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const cache = new Map();
  async function summary(q) {
    const key = `${q.type}|${q.answer}|${q.year}`;
    if (cache.has(key)) return cache.get(key);
    let first = null;
    for (const title of candidates(q)) {
      const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`).catch(() => null);
      const d = r?.ok ? await r.json() : null;
      if (d?.type !== 'standard') continue;
      first ??= d;
      if (fits(q, d.description)) { first = d; break; }
    }
    cache.set(key, first);
    return first;
  }

  const link = document.createElement('button');
  link.id = 'story-link';
  link.className = 'link hidden';
  link.textContent = 'The story';
  feedbackEl.after(link);
  // v71: where the line is quoted, right on the reveal, for every line that has a source.
  const src = document.createElement('a');
  src.id = 'source-link';
  src.className = 'link hidden';
  src.target = '_blank';
  src.rel = 'noopener';
  src.textContent = 'Source';
  link.after(src);
  let shown = null;
  // Offer the story once the answer is in, for bank lines only (packs and timelines have no one title).
  new MutationObserver(() => {
    const q = current;
    link.classList.toggle('hidden', !(feedbackEl.textContent && q && !q.noTally && q.type !== 'pack'));
    src.classList.toggle('hidden', !(feedbackEl.textContent && q?.source));
    if (q?.source) src.href = q.source;
  }).observe(feedbackEl, { childList: true, characterData: true, subtree: true });

  link.onclick = async () => {
    clearTimeout(nextTimer);   // the game waits while the card is open
    shown = current;
    $('story-body').innerHTML = '<p class="prompt">Looking it up…</p>';
    $('story').classList.remove('hidden');
    const d = await summary(shown);
    const where = [shown.character, shown.year].filter(Boolean).join(', ');
    $('story-body').innerHTML = !d ? `<p class="prompt">No article found for ${sEsc(shown.answer)}.</p>` : `
      ${d.thumbnail ? `<img src="${sEsc(d.thumbnail.source)}" alt="" referrerpolicy="no-referrer">` : ''}
      <h3>${sEsc(d.title)}</h3>
      ${d.description ? `<p class="prompt">${sEsc(d.description)}</p>` : ''}
      <p>${sEsc(d.extract)}</p>
      ${where ? `<p class="prompt">The line: ${sEsc(where)}.</p>` : ''}
      <p class="story-links"><a href="${sEsc(d.content_urls?.desktop?.page || '#')}" target="_blank" rel="noopener">Wikipedia</a>${shown.source ? ` · <a href="${sEsc(shown.source)}" target="_blank" rel="noopener">Where the line is quoted</a>` : ''}</p>`;
  };
  $('story-next').onclick = () => {
    $('story').classList.add('hidden');
    if (shown !== current) return;   // the game already moved on
    shown = null;
    dailyMode ? finishDaily() : lives === 0 ? endGame() : nextQuestion();
  };
})(this);

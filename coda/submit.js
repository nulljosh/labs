// Submissions (v72). Classic script after season-ui.js (uses its rpc). A signed-in player suggests a line,
// where it is from and where it is quoted; it waits in jaybulb-api for the owner, who reviews the queue
// here. Approved lines reach the bank through scripts/pull-submissions.mjs, never straight from a player.
// The panel's markup lives here, not in play.html, which is at the size limit.
modeSelect.insertAdjacentHTML('afterend', `<div id="submit" class="panel hidden">
      <h2>Suggest a line</h2>
      <p class="prompt">Know a line the game is missing? Send it in. Every line is checked before it joins.</p>
      <textarea id="submit-quote" rows="3" maxlength="300" placeholder="The line, word for word" aria-label="The line, word for word"></textarea>
      <input id="submit-answer" maxlength="100" placeholder="Where it's from" aria-label="Where it's from: the film, show, game, song or book">
      <select id="submit-type" aria-label="What it is"><option value="movie">Film</option><option value="tv">TV show</option><option value="game">Video game</option><option value="music">Song</option><option value="book">Book</option></select>
      <input id="submit-year" inputmode="numeric" maxlength="4" placeholder="Year (optional)" aria-label="Year (optional)">
      <input id="submit-who" maxlength="60" placeholder="Who says it (optional)" aria-label="Who says it (optional)">
      <input id="submit-source" type="url" maxlength="300" placeholder="Link to where it's quoted (optional)" aria-label="Link to where it's quoted (optional)">
      <p id="submit-msg" class="prompt" aria-live="polite"></p>
      <button id="submit-send">Send it in</button>
      <div id="submit-queue" class="hidden">
        <h3>Waiting for review</h3>
        <ol id="submit-pending" class="library-list"></ol>
      </div>
      <button id="submit-back">Back</button>
    </div>`);
const subEsc = (t) => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

async function loadSubmitQueue() {
  const { data } = await rpc('quotestreak_quote_queue');   // the owner only; everyone else gets forbidden
  $('submit-queue').classList.toggle('hidden', !data);
  if (!data) return;
  $('submit-pending').innerHTML = data.length ? data.map(s => `<li><span><b>${subEsc(s.quote)}</b><small>${subEsc(s.answer)}${s.year ? ` (${s.year})` : ''}${s.who ? ` · ${subEsc(s.who)}` : ''}${s.source ? ` · <a href="${subEsc(s.source)}" target="_blank" rel="noopener">source</a>` : ''}</small></span>`
    + `<button data-ok="${s.id}">Approve</button><button data-no="${s.id}" class="secondary">Reject</button></li>`).join('')
    : '<li class="note">Nothing waiting.</li>';
}

$('start-submit').onclick = () => { modeSelect.classList.add('hidden'); $('submit').classList.remove('hidden'); loadSubmitQueue(); };
$('submit-back').onclick = () => { $('submit').classList.add('hidden'); modeSelect.classList.remove('hidden'); };
$('submit-send').onclick = async () => {
  const v = (id) => $(id).value.trim();
  const { error } = await rpc('quotestreak_suggest_quote', { quote: v('submit-quote'), answer: v('submit-answer'), type: v('submit-type'), year: v('submit-year') || null, who: v('submit-who'), source: v('submit-source') });
  $('submit-msg').textContent = !error ? 'Sent. Thanks. It joins the game once it’s checked.'
    : /sign in/i.test(error.message) ? 'Sign in to send a line.' : error.message;
  if (!error) ['submit-quote', 'submit-answer', 'submit-year', 'submit-who', 'submit-source'].forEach(id => $(id).value = '');
};
$('submit-pending').onclick = async (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  await rpc('quotestreak_moderate_quote', { id: b.dataset.ok || b.dataset.no, action: b.dataset.ok ? 'approve' : 'reject' });
  loadSubmitQueue();
};

// Moderation (v88), the owner's panel. jaybulb-api already refuses rude pack titles and
// shows rude board names as Player; this lists the board names people can see and renames
// any that slip through. Hidden unless quotestreak_moderation answers, which it does for the owner only.
// Classic script after season-ui.js (uses its rpc) and library.js.
$('start-library').insertAdjacentHTML('afterend', '<button id="start-mod" class="hidden">Moderation</button>');
modeSelect.insertAdjacentHTML('afterend', `<div id="mod" class="panel hidden">
    <h2>Moderation</h2>
    <p class="prompt">Rename anything rude. Board names become Player.</p>
    <h3>Board names</h3><ol id="mod-names" class="library-list"></ol>
    <button id="mod-back">Back</button>
  </div>`);
const modEsc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
async function loadMod() {
  const { data } = await rpc('quotestreak_moderation');
  $('start-mod').classList.toggle('hidden', !data);
  if (!data) return;
  $('mod-names').innerHTML = data.names.map(n => `<li><span><b>${modEsc(n.name)}</b><small>${n.scores} scores</small></span>${n.name === 'Player' ? '' : `<button data-name="${modEsc(n.name)}" class="secondary">Rename</button>`}</li>`).join('');
}
$('start-mod').onclick = () => { modeSelect.classList.add('hidden'); $('mod').classList.remove('hidden'); loadMod(); };
$('mod-back').onclick = () => { $('mod').classList.add('hidden'); modeSelect.classList.remove('hidden'); };
$('mod').onclick = async (e) => {
  const b = e.target.closest('button[data-name]');
  if (!b) return;
  await rpc('quotestreak_moderate', { kind: 'name', target: b.dataset.name });
  loadMod();
};
setTimeout(loadMod, 2500);   // after the session restores; the button stays hidden for everyone but the owner

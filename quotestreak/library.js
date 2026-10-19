// Pack library (v45). Classic script after packs.js and clubs.js (uses its rpc). Approved community
// packs, newest or most played; playing one sets the #pack= hash, which packs.js plays. Packs are
// sent from the maker and wait for the owner's review; the owner sees the queue here, nobody else.
const libEsc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
let libPacks = new Map();

async function loadLibrary() {
  const { data } = await rpc('quotestreak_packs', { sort: $('library-sort').value });
  libPacks = new Map((data || []).map(p => [p.id, p]));
  $('library-list').innerHTML = data?.length
    ? data.map(p => `<li><span><b>${libEsc(p.title)}</b><small>${p.lines} lines · ${p.plays} play${p.plays === 1 ? '' : 's'}</small></span><button data-play="${p.id}">Play</button></li>`).join('')
    : `<li class="note">${data ? 'No packs yet. Make one and send it in.' : 'The library is out of reach right now.'}</li>`;
  const queue = await rpc('quotestreak_pack_queue');   // the owner only; everyone else gets forbidden
  $('library-queue').classList.toggle('hidden', !queue.data);
  if (queue.data) {
    queue.data.forEach(p => libPacks.set(p.id, p));
    $('library-pending').innerHTML = queue.data.length
      ? queue.data.map(p => `<li><span><b>${libEsc(p.title)}</b><small>${p.lines} lines</small></span><button data-play="${p.id}" class="secondary">Try</button><button data-ok="${p.id}">Approve</button><button data-no="${p.id}" class="secondary">Reject</button></li>`).join('')
      : '<li class="note">Nothing waiting.</li>';
  }
}

$('start-library').onclick = () => { modeSelect.classList.add('hidden'); $('library').classList.remove('hidden'); loadLibrary(); };
$('library-back').onclick = () => { $('library').classList.add('hidden'); modeSelect.classList.remove('hidden'); };
$('library-sort').onchange = loadLibrary;
$('library').onclick = async (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.play) {
    const p = libPacks.get(b.dataset.play);
    rpc('quotestreak_pack_play', { id: p.id });
    $('library').classList.add('hidden');
    location.hash = `pack=${p.code}`;   // packs.js picks this up and deals the pack
  } else if (b.dataset.ok || b.dataset.no) {
    await rpc('quotestreak_moderate_pack', { id: b.dataset.ok || b.dataset.no, approve: !!b.dataset.ok });
    loadLibrary();
  }
};

// From the maker: send the pack in for review.
$('pack-submit').onclick = async () => {
  const pack = { title: $('pack-title').value.trim(), lines: Packs.parse($('pack-text').value) };
  if (Packs.answers(pack.lines).length < 4) return ($('pack-msg').textContent = 'A pack needs four different answers.');
  if (!pack.title) return ($('pack-msg').textContent = 'Give the pack a name first.');
  const { error } = await rpc('quotestreak_submit_pack', { title: pack.title, code: await Packs.encode(pack) });
  $('pack-msg').textContent = !error ? 'Sent. It shows up in the library once it’s reviewed.'
    : /sign in/i.test(error.message) ? 'Sign in to send a pack to the library.' : error.message;
};

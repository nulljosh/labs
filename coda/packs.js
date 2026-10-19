// Custom packs (v44): write your own lines, one per row as "line — answer", and share the pack as a
// link. The whole pack rides in the link's #fragment (deflated, base64url), so there is no server and
// nothing is stored. Wrong answers come from the pack's other answers, so a pack needs four different
// answers. The pure parts (parse, questions, encode, decode) are exported for packs.test.js.
(function (root) {
  const MAX_LINES = 60;
  // "Here's looking at you, kid. — Casablanca" (em dash, en dash, " - " or "|" all split).
  function parse(text) {
    return text.split('\n').map(l => l.trim()).filter(Boolean).slice(0, MAX_LINES).map(l => {
      const m = l.match(/^(.*\S)\s*(?:—|–|\s-\s|\|)\s*(\S.*)$/);
      return m && { quote: m[1].replace(/^["“]|["”]$/g, ''), answer: m[2] };
    }).filter(Boolean);
  }
  const answers = (lines) => [...new Set(lines.map(l => l.answer))];
  // Game questions: each line with its answer and three other answers from the pack.
  function questions(pack, rand = Math.random) {
    const all = answers(pack.lines);
    const pick = (a) => all.filter(x => x !== a).map(x => [rand(), x]).sort((p, q) => p[0] - q[0]).slice(0, 3).map(x => x[1]);
    return pack.lines.map(l => ({
      quote: l.quote, answer: l.answer, options: [l.answer, ...pick(l.answer)], genre: 'pack', type: 'pack',
      prompt: pack.title ? `${pack.title}: who or where is it from?` : 'Who or where is it from?', noTally: true,
    }));
  }
  const b64 = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64 = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const pipe = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
  async function encode(pack) {
    return b64(await pipe(new TextEncoder().encode(JSON.stringify([pack.title, pack.lines.map(l => [l.quote, l.answer])])), new CompressionStream('deflate-raw')));
  }
  async function decode(code) {
    try {
      const [title, rows] = JSON.parse(new TextDecoder().decode(await pipe(unb64(code), new DecompressionStream('deflate-raw'))));
      const lines = rows.slice(0, MAX_LINES).map(([quote, answer]) => ({ quote: String(quote).slice(0, 400), answer: String(answer).slice(0, 80) }));
      return answers(lines).length >= 4 ? { title: String(title || '').slice(0, 60), lines } : null;
    } catch { return null; }
  }
  const api = { MAX_LINES, parse, answers, questions, encode, decode };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  root.Packs = api;

  // The maker
  $('start-pack').onclick = () => { modeSelect.classList.add('hidden'); $('pack').classList.remove('hidden'); };
  $('pack-back').onclick = () => { $('pack').classList.add('hidden'); modeSelect.classList.remove('hidden'); };
  $('pack-text').oninput = () => {
    const lines = parse($('pack-text').value), n = answers(lines).length;
    $('pack-msg').textContent = `${lines.length} line${lines.length === 1 ? '' : 's'}, ${n} different answer${n === 1 ? '' : 's'}${n < 4 ? '. A pack needs four.' : '.'}`;
  };
  $('pack-share').onclick = async () => {
    const pack = { title: $('pack-title').value.trim(), lines: parse($('pack-text').value) };
    if (answers(pack.lines).length < 4) return ($('pack-msg').textContent = 'A pack needs four different answers.');
    const url = `${location.origin}/play#pack=${await encode(pack)}`;
    if (navigator.share) navigator.share({ title: pack.title || 'Coda pack', url }).catch(() => {});
    else navigator.clipboard?.writeText(url).then(() => { $('pack-msg').textContent = 'Link copied. Anyone who opens it plays your pack.'; }, () => {});
    $('pack-link').href = url;
    $('pack-link').classList.remove('hidden');
  };

  // Playing a pack: /play#pack=... deals the pack instead of the bank, off the leaderboard.
  async function openPack() {
    const code = (location.hash.match(/^#pack=([\w-]+)$/) || [])[1];
    if (!code) return;
    const pack = await decode(code);
    if (!pack) return;
    const go = () => {
      if (!quotes.length) return setTimeout(go, 100);
      packOn = true;
      window.quotableOffBoard = true;
      startGame(false);
      pool = questions(pack).sort(() => Math.random() - 0.5);
      nextQuestion();
    };
    go();
  }
  // A homemade pack counts toward no badge, stat, season or leaderboard.
  let packOn = false;
  const badgeBeforePack = window.quotableBadge;
  window.quotableBadge = (event, d = {}) => {
    if (!packOn) return badgeBeforePack(event, d);
    if (event === 'game') {
      packOn = window.quotableOffBoard = false;
      history.replaceState(null, '', location.pathname);   // Play Again plays the real bank
    }
  };
  openPack();
  addEventListener('hashchange', openPack);
})(this);

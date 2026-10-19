// Seasons screen. Classic script after clubs.js (uses its rpc) and stats-ui.js: it wraps
// window.quotableBadge so each normal game updates this season's local best and, on a new tier,
// shows the medal. The ladder itself comes from jaybulb-api (quotestreak_season).
const SEASON_KEY = 'quotestreak_seasons';
const seasonBests = () => { try { return JSON.parse(localStorage.getItem(SEASON_KEY)) || {}; } catch { return {}; } };
const seasonMedal = (t, id) => Badges.svg({ title: `${id} ${t.id}`, pose: t.pose, tier: t.id }, true);
const prevEvent = window.quotableBadge;
window.quotableBadge = (event, d = {}) => {
  if (event === 'game' && !d.speed && !d.cup) {
    const id = Season.of().id, before = Season.tier(seasonBests()[id] || 0), after = Season.record(seasonBests(), d.score);
    try { localStorage.setItem(SEASON_KEY, JSON.stringify(after)); } catch {}
    const t = Season.tier(after[id]);
    if (t && t !== before) badgeToast({ title: `Season ${t.id}`, pose: t.pose, tier: t.id });
  }
  prevEvent(event, d);
};
$('season-btn').onclick = async () => {
  const s = Season.of(), bests = seasonBests(), mine = bests[s.id] || 0, t = Season.tier(mine), n = Season.next(mine);
  $('season-title').textContent = `Season ${s.id}`;
  $('season-me').innerHTML = `${t ? seasonMedal(t, s.id) : ''}<p class="prompt">Your best this season: ${mine}${t ? `, ${t.id}` : ''}.
    ${n ? `${n.min - mine} more for ${n.id}.` : 'Top tier.'} ${Season.daysLeft()} days left.</p>`;
  const past = Object.entries(bests).filter(([id, b]) => id !== s.id && Season.tier(b));
  $('season-shelf').innerHTML = past.map(([id, b]) => `<figure>${seasonMedal(Season.tier(b), id)}<figcaption>${id}</figcaption></figure>`).join('');
  $('season-ladder').innerHTML = '<li>Loading…</li>';
  modeSelect.classList.add('hidden');
  $('season').classList.remove('hidden');
  const { data } = await rpc('quotestreak_season');
  if (!data) { $('season-ladder').innerHTML = '<li>Ladder unavailable.</li>'; return; }
  $('season-ladder').innerHTML = data.top.length
    ? data.top.map(r => `<li>${esc(r.name)} — ${r.score}</li>`).join('') : '<li>No scores yet this season. Be first.</li>';
  $('season-rank').textContent = data.me ? `You are #${data.me.rank} with ${data.me.score}.` : 'Sign in and play to get on the ladder.';
};
$('season-back').onclick = () => { $('season').classList.add('hidden'); modeSelect.classList.remove('hidden'); };

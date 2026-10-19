// Badges screen and counters. Classic script after game.js; game.js, duel-client.js and the
// daily code report events through window.quotableBadge. Counters live in localStorage only.
const BADGE_KEY = 'quotestreak_badges';
const badgeStats = () => { try { return { ...Badges.empty(), ...JSON.parse(localStorage.getItem(BADGE_KEY)) }; } catch { return Badges.empty(); } };
window.quotableBadge = (event, d = {}) => {
  const s = badgeStats(), before = new Set(Badges.unlocked(s));
  if (event === 'answer') {
    if (d.correct) {
      s.right++;
      s.genres[d.q.genre] = (s.genres[d.q.genre] || 0) + 1;
      if (d.q.year) s.decades[Math.floor(d.q.year / 10) * 10] = 1;
      if (d.typed) s.typed++;
      if (d.hints >= 2) s.hintWins++;
      s.run = d.hints ? 0 : (s.run || 0) + 1;
    } else { s.wrong++; s.run = 0; }
    s.bestStreak = Math.max(s.bestStreak, d.streak);
    s.cleanStreak = Math.max(s.cleanStreak, s.run || 0);
  } else if (event === 'game') {
    s.games++;
    if (d.speed) s.bestSpeed = Math.max(s.bestSpeed, d.score); else s.bestScore = Math.max(s.bestScore, d.score);
  } else if (event === 'daily') s.dailyStreak = Math.max(s.dailyStreak, d.streak);
  else if (event === 'duelWin') s.duelWins++;
  else if (event === 'challenge') s.challenges++;
  try { localStorage.setItem(BADGE_KEY, JSON.stringify(s)); } catch {}
  const fresh = Badges.unlocked(s).filter(id => !before.has(id));
  if (fresh.length) badgeToast(Badges.LIST.find(b => b.id === fresh[0]));
};
function badgeToast(b) {
  window.Sound?.play('badge');
  const t = document.createElement('div');
  t.className = 'badge-toast';
  t.setAttribute('role', 'status');   // read out by screen readers, outside the page's landmarks on purpose
  t.style.top = `${12 + 64 * document.querySelectorAll('.badge-toast').length}px`;  // over the topbar, never over answers; stack down
  t.innerHTML = Badges.svg(b, true) + `<span>Badge: ${b.title}</span>`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}
$('badges-btn').onclick = () => {
  const have = new Set(Badges.unlocked(badgeStats()));
  $('badge-count').textContent = `${have.size} of ${Badges.LIST.length}`;
  $('badge-grid').innerHTML = Badges.LIST.map(b => `<figure>${Badges.svg(b, have.has(b.id))}<figcaption>${b.title}</figcaption></figure>`).join('');
  modeSelect.classList.add('hidden');
  $('badges').classList.remove('hidden');
};
$('badges-back').onclick = () => { $('badges').classList.add('hidden'); modeSelect.classList.remove('hidden'); };

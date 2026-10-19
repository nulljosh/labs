// Clubs (v15): one club per player, joined by code; the club's score is the sum of its
// members' best normal scores. RPCs go through auth.js's session (window.quotableRpc).
const rpc = (fn, args = {}) => window.quotableRpc ? window.quotableRpc(fn, args) : Promise.resolve({ error: { message: 'Sign in first.' } });
const clubMsg = (t) => { document.getElementById('auth-msg').textContent = t; };
async function loadClub() {
  const { data } = await rpc('quotestreak_my_club');
  document.getElementById('club-none').classList.toggle('hidden', !!data);
  document.getElementById('club-mine').classList.toggle('hidden', !data);
  if (!data) return;
  document.getElementById('club-head').textContent = `${data.name}, code ${data.code}, club score ${data.total}`;
  const ol = document.getElementById('club-members');
  ol.innerHTML = '';
  for (const m of data.members.sort((x, y) => y.normal - x.normal)) {
    const li = document.createElement('li');
    li.textContent = `${m.me ? 'You' : m.name} \u2014 ${m.normal}`;
    ol.appendChild(li);
  }
}
window.quotableOnAuth = (user) => { if (user) loadClub(); };
document.getElementById('club-create').onsubmit = async (e) => {
  e.preventDefault();
  const { error } = await rpc('quotestreak_create_club', { name: document.getElementById('club-name').value });
  clubMsg(error ? error.message : 'Club created. Share its code.');
  loadClub();
};
document.getElementById('club-join').onsubmit = async (e) => {
  e.preventDefault();
  const { error } = await rpc('quotestreak_join_club', { code: document.getElementById('club-code').value });
  clubMsg(error ? error.message : 'You joined the club.');
  loadClub();
};
document.getElementById('club-leave').onclick = async () => { await rpc('quotestreak_leave_club'); loadClub(); };
// Club board in the leaderboard panel.
document.getElementById('lb-clubs').onclick = async () => {
  const { data, error } = await rpc('quotestreak_club_board');
  const ol = document.getElementById('lb-list');
  ol.innerHTML = '';
  if (error) { ol.innerHTML = '<li></li>'; ol.firstChild.textContent = error.message; return; }   // v93: server text is text
  if (!data.length) ol.innerHTML = '<li class="note">No clubs yet. Start one in your account.</li>';
  for (const c of data) {
    const li = document.createElement('li');
    li.textContent = `${c.name} \u2014 ${c.total} (${c.members} ${c.members === 1 ? 'player' : 'players'})`;
    ol.appendChild(li);
  }
  document.getElementById('lb-title').textContent = 'Clubs';
};

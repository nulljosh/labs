// Accounts + leaderboard on spark-api (Cloudflare Workers + D1). Vanilla, no bundler.
import { createClient } from './spark.js';

const sb = createClient('https://api.jaybulb.com');
const $ = (id) => document.getElementById(id);
let user = null;

const displayName = (u) =>
  u.user_metadata?.name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Player';

function render() {
  $('account-btn').textContent = user ? displayName(user) : 'Sign in';
  $('auth-form').classList.toggle('hidden', !!user);
  $('auth-signed').classList.toggle('hidden', !user);
  if (user) $('auth-who').textContent = `Signed in as ${displayName(user)}`;
}

sb.auth.onAuthStateChange((e, session) => {
  user = session?.user ?? null; render();
  // arrived from a reset email: the password box now takes the new password
  if (e === 'PASSWORD_RECOVERY') {
    $('account').classList.remove('hidden');
    $('auth-newpass').classList.remove('hidden');
    msg('Type a new password, then tap Set new password.');
  }
});

const msg = (t) => { $('auth-msg').textContent = t; };

$('account-btn').onclick = () => $('account').classList.toggle('hidden');
$('account-close').onclick = () => $('account').classList.add('hidden');

$('auth-login').onclick = async () => {
  const { error } = await sb.auth.signInWithPassword({ email: $('auth-email').value, password: $('auth-pass').value });
  msg(error ? error.message : '');
};
$('auth-signup').onclick = async () => {
  const { error } = await sb.auth.signUp({
    email: $('auth-email').value,
    password: $('auth-pass').value,
    options: { data: { name: $('auth-name').value.trim().slice(0, 24) || undefined }, emailRedirectTo: location.origin + '/play' },
  });
  msg(error ? error.message : 'Check your email to confirm your account.');
};
$('auth-forgot').onclick = async () => {
  const { error } = await sb.auth.resetPasswordForEmail($('auth-email').value, { redirectTo: location.origin + '/play' });
  msg(error ? error.message : 'Check your email for a reset link.');
};
$('auth-newpass').onclick = async () => {
  const { error } = await sb.auth.updateUser({ password: $('auth-pass').value });
  if (!error) $('auth-newpass').classList.add('hidden');
  msg(error ? error.message : 'Password updated.');
};
$('auth-logout').onclick = () => sb.auth.signOut();

// Called by game.js at game over. Silently no-ops when signed out.
window.quotableSubmitScore = async (score, mode) => {
  if (!user || score <= 0) return;
  await sb.from('quotestreak_scores').insert({ user_id: user.id, name: displayName(user).slice(0, 24), score, mode });
};

window.quotableShowLeaderboard = async (mode) => {
  const { data, error } = await sb.from('quotestreak_leaderboard')
    .select('name,score').eq('mode', mode).order('score', { ascending: false }).limit(20);
  const ol = $('lb-list');
  ol.innerHTML = '';
  if (error) { ol.innerHTML = `<li>${error.message}</li>`; return; }
  if (!data.length) ol.innerHTML = '<li>No scores yet. Sign in and play!</li>';
  for (const r of data) {
    const li = document.createElement('li');
    li.textContent = `${r.name} — ${r.score}`;
    ol.appendChild(li);
  }
  $('lb-title').textContent = mode === 'speed' ? 'Speed Round leaders' : 'Leaders';
};

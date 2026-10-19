// Accounts + leaderboard on spark-api (Cloudflare Workers + D1). Vanilla, no bundler.
import { createClient } from './spark.js';

const sb = createClient('https://api.jaybulb.com');
// Google, friends and delete are live (origin on jaybulb-signin, RPCs in jaybulb-api).
// Web Apple: quotestreak.jaybulb.com/play is a return URL on Services ID com.heyitsmejosh.websignin.
const SOCIAL = true, WEB_APPLE = true;
const $ = (id) => document.getElementById(id);
let user = null;

const displayName = (u) =>
  u.user_metadata?.name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Player';

function render() {
  $('account-btn').textContent = user ? displayName(user) : 'Sign in';
  $('auth-form').classList.toggle('hidden', !!user);
  $('auth-signed').classList.toggle('hidden', !user);
  if (user) { $('auth-who').textContent = `Signed in as ${displayName(user)}`; if (SOCIAL) loadFriends(); }
  $('auth-delete').textContent = 'Delete account';
}

// Apple and Google hand back an id token; jaybulb-api verifies it and opens a session.
// Web client ids are public (not secrets); the Worker checks them as audiences.
for (const id of ['auth-google', 'friends']) $(id).classList.toggle('hidden', !SOCIAL);
$('auth-apple').classList.toggle('hidden', !WEB_APPLE);
const APPLE_ID = 'com.heyitsmejosh.websignin';
const GOOGLE_ID = '337798947774-he7noqsqk3epo00ic06ibpom75p3tr3h.apps.googleusercontent.com';
const loadScript = (src) => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.append(s); });

$('auth-apple').onclick = async () => {
  try {
    if (!window.AppleID) await loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js');
    AppleID.auth.init({ clientId: APPLE_ID, scope: 'name email', redirectURI: location.origin + '/play', usePopup: true });
    const { authorization, user: who } = await AppleID.auth.signIn();
    const name = who?.name ? `${who.name.firstName || ''} ${who.name.lastName || ''}`.trim() : undefined;
    const { error } = await sb.auth.signInWithIdToken({ provider: 'apple', token: authorization.id_token, full_name: name });
    msg(error ? error.message : '');
  } catch (e) { if (e?.error !== 'popup_closed_by_user') msg('Apple sign-in failed. Use email instead.'); }
};

if (SOCIAL) loadScript('https://accounts.google.com/gsi/client').then(() => {
  google.accounts.id.initialize({
    client_id: GOOGLE_ID,
    callback: async ({ credential }) => {
      const { error } = await sb.auth.signInWithIdToken({ provider: 'google', token: credential });
      msg(error ? error.message : '');
    },
  });
  google.accounts.id.renderButton($('auth-google'), { type: 'standard', shape: 'pill', size: 'large', width: 280 });
}).catch(() => {});

async function loadFriends() {
  const code = await sb.rpc('quotestreak_my_code');
  $('friend-code').textContent = code.data ? `Your code: ${code.data.code}` : '';
  const { data, error } = await sb.rpc('quotestreak_friends');
  const ol = $('friend-list');
  ol.innerHTML = '';
  if (error) return;
  if (data.length < 2) ol.innerHTML = '<li>Share your code. Friends who add it show up here.</li>';
  for (const f of data) {
    const li = document.createElement('li');
    li.textContent = `${f.me ? 'You' : f.name}: ${f.normal} · speed ${f.speed}`;
    if (!f.me) {
      const x = document.createElement('button');
      x.textContent = 'Remove';
      x.className = 'link';
      x.onclick = async () => { await sb.rpc('quotestreak_remove_friend', { code: f.code }); loadFriends(); };
      li.append(' ', x);
    }
    ol.appendChild(li);
  }
}
$('friend-form').onsubmit = async (e) => {
  e.preventDefault();
  const { error } = await sb.rpc('quotestreak_add_friend', { code: $('friend-input').value });
  msg(error ? error.message : 'Friend added.');
  if (!error) { $('friend-input').value = ''; loadFriends(); }
};

// Two taps, no dialog: the first arms it, the second deletes the account and every score.
$('auth-delete').onclick = async () => {
  const b = $('auth-delete');
  if (b.textContent !== 'Tap again to delete') { b.textContent = 'Tap again to delete'; return; }
  const { error } = await sb.functions.invoke('delete-account');
  if (error) return msg(error.message);
  await sb.auth.signOut();
  msg('Account deleted.');
};

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

window.quotableDisplayName = () => (user ? displayName(user).slice(0, 24) : '');

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

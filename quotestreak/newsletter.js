// The daily quote by email (v86), opt in, from the Daily result screen. jaybulb-api mails a confirm
// link; nothing is sent until the reader taps it. Classic script after game.js (uses API and $).
$('daily-next').insertAdjacentHTML('afterend', `<form id="news" class="news">
    <input id="news-email" type="email" autocomplete="email" required maxlength="254" placeholder="Your email" aria-label="Your email">
    <button id="news-send">Email me the daily quote</button>
    <p id="news-msg" class="prompt" aria-live="polite">One email a day. Unsubscribe in one tap.</p>
  </form>`);
$('news').onsubmit = async (e) => {
  e.preventDefault();
  const r = await fetch(`${API}/rpc/quotestreak_newsletter_subscribe`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: $('news-email').value }) }).catch(() => null);
  const out = r ? await r.json().catch(() => ({})) : {};
  $('news-msg').textContent = !r ? 'Could not reach the server. Try again in a minute.'
    : out.status === 'on' ? 'You already get the daily quote.'
    : out.status === 'pending' ? 'Check your inbox for a confirm link.'
    : r.status === 429 ? 'Too many tries. Wait a minute.' : out.error || 'That didn’t work.';
};

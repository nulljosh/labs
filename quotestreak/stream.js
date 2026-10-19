// Stream mode (v47): a page for a streamer's browser source. It reads their Twitch chat anonymously
// (read-only, no login: the public chat socket with a justinfan nick), shows a line and four answers,
// and chat votes by typing 1 to 4 or the answer itself. One vote per viewer per question. After the
// vote the bars and the answer show, and chat scores when most of it was right. Pure parts below
// (parse, vote, tally) are exported for stream.test.js.
(function (root) {
  const VOTE_SECONDS = 20, REVEAL_SECONDS = 7;
  // One IRC line to {user, text}, or null for anything that isn't chat.
  function parse(line) {
    const m = line.match(/^(?:@\S+ )?:([^!\s]+)!\S+ PRIVMSG #\S+ :(.*)$/);
    return m && { user: m[1].toLowerCase(), text: m[2].trim() };
  }
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').replace(/^(the|a|an) /, '').trim();
  // Which option a chat message votes for: "1" to "4", or the answer typed out. -1 if neither.
  function vote(text, options) {
    const t = text.trim();
    if (/^[1-4]$/.test(t)) return +t - 1;
    const n = norm(t);
    return n ? options.findIndex(o => norm(o) === n) : -1;
  }
  // Votes per option and whether chat got it: the most-voted option is the right one.
  function tally(votes, options, answer) {
    const counts = options.map((_, i) => [...votes.values()].filter(v => v === i).length);
    const top = Math.max(...counts), right = options.indexOf(answer);
    return { counts, total: votes.size, won: top > 0 && counts[right] === top && counts.filter(c => c === top).length === 1 };
  }
  const api = { VOTE_SECONDS, REVEAL_SECONDS, parse, vote, tally };
  if (typeof module !== 'undefined') { module.exports = api; return; }

  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const PROMPTS = { music: 'Guess the artist from the lyric.', tv: 'Guess the show from the quote.', game: 'Guess the game from the quote.', movie: 'Guess the movie from the quote.' };   // game.js's words
  let bank = [], current = null, options = [], votes = new Map(), stage = 'setup', until = 0, chatScore = 0, asked = 0, chat = null;

  function connect(channel) {
    chat = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
    chat.onopen = () => {
      chat.send('PASS SCHMOOPIIE');   // Twitch's documented anonymous login
      chat.send(`NICK justinfan${Math.floor(10000 + Math.random() * 89999)}`);
      chat.send(`JOIN #${channel}`);
      $('stream-status').textContent = `Reading #${channel} chat.`;
    };
    chat.onmessage = (e) => {
      for (const line of String(e.data).split('\r\n')) {
        if (line.startsWith('PING')) chat.send(line.replace('PING', 'PONG'));
        const msg = parse(line);
        if (msg && stage === 'vote' && !votes.has(msg.user)) {
          const v = vote(msg.text, options);
          if (v >= 0) { votes.set(msg.user, v); draw(); }
        }
      }
    };
    chat.onclose = () => { $('stream-status').textContent = 'Chat disconnected. Reload to reconnect.'; };
  }

  function ask() {
    current = bank[Math.floor(Math.random() * bank.length)];
    options = [...current.options].sort(() => Math.random() - 0.5);
    votes = new Map();
    asked++;
    stage = 'vote';
    until = Date.now() + VOTE_SECONDS * 1000;
    draw();
  }
  function reveal() {
    stage = 'reveal';
    if (tally(votes, options, current.answer).won) chatScore++;
    until = Date.now() + REVEAL_SECONDS * 1000;
    draw();
  }
  setInterval(() => {
    if (stage === 'setup' || Date.now() < until) return draw();
    stage === 'vote' ? reveal() : ask();
  }, 250);

  function draw() {
    $('stream-setup').classList.toggle('hidden', stage !== 'setup');
    $('stream-game').classList.toggle('hidden', stage === 'setup');
    if (stage === 'setup') return;
    const t = tally(votes, options, current.answer);
    $('stream-top').textContent = `Chat ${chatScore} of ${asked - (stage === 'vote' ? 1 : 0)} · ${stage === 'vote' ? `${Math.max(0, Math.ceil((until - Date.now()) / 1000))}s to vote` : t.won ? 'Chat got it' : 'Chat missed it'}`;
    $('stream-prompt').textContent = PROMPTS[current.type] || PROMPTS.movie;
    $('stream-quote').textContent = `“${current.quote}”`;
    $('stream-options').innerHTML = options.map((o, i) => {
      const pct = t.total ? Math.round(100 * t.counts[i] / t.total) : 0, right = stage === 'reveal' && o === current.answer;
      return `<div class="${right ? 'right' : ''}"><span class="key">${i + 1}</span><span class="name">${esc(o)}</span><span class="pct">${pct}%</span><i style="width:${pct}%"></i></div>`;
    }).join('');
    $('stream-votes').textContent = `${t.total} vote${t.total === 1 ? '' : 's'} · type 1 to 4 or the answer in chat`;
  }

  fetch('quotes.json').then(r => r.json()).then(d => {
    bank = d.filter(q => q.type !== 'book');
    const channel = (new URLSearchParams(location.search).get('channel') || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (channel) { $('stream-channel').value = channel; start(channel); }
  });
  function start(channel) {
    if (!channel) return;
    history.replaceState(null, '', `?channel=${channel}`);   // the URL to paste into OBS as a browser source
    connect(channel);
    ask();
  }
  $('stream-setup').onsubmit = (e) => { e.preventDefault(); start($('stream-channel').value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')); };
})(this);

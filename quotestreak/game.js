let quotes = [];
let core = [];         // the core bank: date-seeded picks read this (v100)
let pool = [];
let current = null;
let score = 0;
let streak = 0;
let speedMode = false;
let timer = null;
let timeLeft = 10;
const TIME_LIMIT = 10;
const HIGH_KEY = 'quotable_high_score';
const DAILY_KEY = 'quotable_daily';            // {day, correct, answer} for the last daily played
const DAILY_STREAK_KEY = 'quotable_daily_streak';  // {lastDay, count}
let dailyMode = false;
let hintsUsed = 0;
let typeMode = false;
let challenge = null;   // {quotes, score, name} when playing a friend's link
let run = [];          // {qid, pts} for each question this game, for the challenge link
let duel = null;       // {ws, code, them, theirDone, done} during a live duel
let lives = null;      // marathon (v30): misses left, null in every other game
let nextTimer = null;  // the pause after an answer; story.js holds it while a story card is open
const $ = (id) => document.getElementById(id);


const modeSelect = $('mode-select');
const gameEl = $('game');
const endEl = $('end');
const quoteEl = $('quote');
const optionsEl = $('options');
const feedbackEl = $('feedback');
const timerRing = $('timer-ring');
const ringFg = $('ring-fg');
const timerNum = $('timer-num');
const genreBadge = $('genre-badge');
const promptEl = $('prompt');

const GENRES = {
  action: { color: 'var(--g-action)', text: 'var(--g-action-text)' },
  comedy: { color: 'var(--g-comedy)', text: 'var(--g-comedy-text)' },
  drama: { color: 'var(--g-drama)', text: 'var(--g-drama-text)' },
  scifi: { color: 'var(--g-scifi)', text: 'var(--g-scifi-text)' },
  classic: { color: 'var(--g-classic)', text: 'var(--g-classic-text)' },
  pop: { color: 'var(--g-pop)', text: 'var(--g-pop-text)' },
  rock: { color: 'var(--g-rock)', text: 'var(--g-rock-text)' },
  hiphop: { color: 'var(--g-hiphop)', text: 'var(--g-hiphop-text)' },
  rnb: { color: 'var(--g-rnb)', text: 'var(--g-rnb-text)' },
  country: { color: 'var(--g-country)', text: 'var(--g-country-text)' },
  sitcom: { color: 'var(--g-sitcom)', text: 'var(--g-sitcom-text)' },
  tvdrama: { color: 'var(--g-tvdrama)', text: 'var(--g-tvdrama-text)' },
  cartoon: { color: 'var(--g-cartoon)', text: 'var(--g-cartoon-text)' },
  game: { color: 'var(--g-game)', text: 'var(--g-game-text)' },
  book: { color: 'var(--g-book)', text: 'var(--g-book-text)' },
  anime: { color: 'var(--g-anime)', text: 'var(--g-anime-text)' },
};
// Genre keys that do not read well capitalized. Mirrored by Theme.label(for:) in Swift.
const LABELS = { scifi: 'Sci-fi', hiphop: 'Hip-hop', rnb: 'R&B', tvdrama: 'TV drama', game: 'Games', book: 'First lines' };
const label = (g) => LABELS[g] || g[0].toUpperCase() + g.slice(1);
const decadeOf = (y) => Math.floor(y / 10) * 10;
const PROMPTS = { music: 'Guess the artist from the lyric.', tv: 'Guess the show from the quote.', game: 'Guess the game from the quote.', book: 'Name the book from its first line.', movie: 'Guess the movie from the quote.' };

// Real difficulty (v10): the tallies are fetched once; answers are posted fire-and-forget.
const API = 'https://api.jaybulb.com';
let stats = {};
fetch(`${API}/rpc/quotestreak_stats`, { method: 'POST', body: '{}' }).then(r => r.json())
  .then(rows => { if (Array.isArray(rows)) stats = Object.fromEntries(rows.map(r => [r.qid, r])); }).catch(() => {});
const tally = (q, ok) => fetch(`${API}/rpc/quotestreak_answer`, { method: 'POST', body: JSON.stringify({ qid: Difficulty.qid(q.quote), ok }), keepalive: true }).catch(() => {});

// v100: quotes-more.json, the extended bank, joins `quotes` after first paint, or first when a
// challenge, duel or watch link may name its lines. `core` stays as loaded for the Daily and archive.
const more = () => fetch('quotes-more.json').then(r => r.json()).then(x => (quotes.push(...x), x)).catch(() => []);
const needMore = /[?&](c|duel|watch)=/.test(location.search);
fetch('quotes.json').then(r => r.json()).then(async data => {
  quotes = data;
  core = data.slice();
  if (needMore) await more(); else setTimeout(more, 1500);
  const genreSelect = $('genre');
  [...new Set(data.map(q => q.genre))].sort().forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = label(g);
    genreSelect.appendChild(opt);
  });
  // Decades come from the bank's years; lines without a year (songs, books) only play under All.
  [...new Set(data.filter(q => q.year).map(q => decadeOf(q.year)))].sort().forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = `${d}s`;
    $('decade').appendChild(opt);
  });
  buildBackdrop(window.quotableFamily ? data.filter(Family.ok) : data);
  updateDailyButton();
  if (new URLSearchParams(location.search).has('daily')) startDaily();  // share links land on the daily
  challenge = Challenge.decode(location.search, quotes, Difficulty.qid);
  if (challenge) startGame(false);
  const room = new URLSearchParams(location.search).get('duel');
  if (room && /^[A-Za-z]{4}$/.test(room)) openDuel(room.toUpperCase());
  const watch = new URLSearchParams(location.search).get('watch');
  if (watch && /^[A-Za-z]{4}$/.test(watch)) openWatch(watch.toUpperCase());
});

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function startGame(speed) {
  typeMode = $('type-toggle').checked;
  speedMode = speed;
  run = [];
  score = 0;
  streak = 0;
  const genre = $('genre').value;
  const decade = $('decade').value, level = $('difficulty').value;
  pool = shuffle(quotes.filter(q => (genre === 'all' || q.genre === genre) && (decade === 'all' || (q.year && decadeOf(q.year) === +decade))
    && (level === 'all' || Difficulty.level(q, stats) === level)));
  if (!pool.length) pool = shuffle(quotes.filter(q => genre === 'all' || q.genre === genre));  // an empty pairing plays the genre
  const mode = $('mode').value;  // Era 3 ways to guess (modes.js); friend modes below stay classic
  lives = mode === 'marathon' && !challenge && !duel ? 3 : null;
  if (mode !== 'classic') pool = Modes.pool(mode, pool, quotes);
  if (!pool.length) pool = Modes.pool(mode, shuffle(quotes), quotes);
  if (window.quotableFamily) pool = pool.filter(Family.ok).length ? pool.filter(Family.ok) : shuffle(quotes.filter(Family.ok));  // v60
  if (challenge) pool = [...challenge.quotes].reverse();  // nextQuestion pops from the end
  if (duel?.quotes) pool = [...duel.quotes].reverse();
  updateStats();
  if (!duel && !challenge) window.quotableGameToken?.(speed ? 'speed' : 'normal');   // fair play (v87)
  modeSelect.classList.add('hidden');
  endEl.classList.add('hidden');
  gameEl.classList.remove('hidden');
  timerRing.classList.toggle('hidden', !speed);
  document.body.classList.toggle('speed', speed);  // freezes the drifting wall while the clock runs
  nextQuestion();
}

function nextQuestion() {
  clearInterval(timer);
  if (pool.length === 0) return endGame();
  current = pool.pop();
  const g = GENRES[current.genre] || { color: 'var(--accent)', text: '#fff' };
  genreBadge.textContent = label(current.genre);
  genreBadge.style.background = g.color;
  genreBadge.style.setProperty('--badge-text', g.text);
  quoteEl.textContent = current.plain || `\u201C${current.display || current.quote}\u201D`;  // curly, so Quip Sans draws the logo's marks
  quoteEl.style.animation = 'none';
  void quoteEl.offsetWidth;
  quoteEl.style.animation = '';
  feedbackEl.textContent = '';
  hintsUsed = 0;
  $('hint').textContent = '';
  $('hint-btn').classList.toggle('hidden', !$('hints-toggle').checked);
  optionsEl.innerHTML = '';
  $('type-form').classList.toggle('hidden', !typeMode);
  if (typeMode) { $('type-input').value = ''; $('type-input').disabled = false; $('type-input').focus(); }
  promptEl.textContent = current.prompt || PROMPTS[current.type] || PROMPTS.movie;
  if (!typeMode) (dailyMode ? current.options : shuffle(current.options)).forEach(opt => {  // the daily board is the same for everyone
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => choose(opt, btn);
    optionsEl.appendChild(btn);
  });
  preloadArt(current.art);
  window.quotableShown?.(current);  // reveal.js draws a poster or cover question
  if (speedMode) startTimer();
}

// A normal game runs through the whole bank; this ends it on your terms.
$('end-btn').onclick = () => { clearInterval(timer); endGame(); };

$('type-form').onsubmit = (e) => {
  e.preventDefault();
  if (current && !$('type-input').disabled && $('type-input').value.trim()) choose($('type-input').value, null);
};

$('hint-btn').onclick = () => {
  if (!current || hintsUsed >= Hints.MAX) return;
  $('hint').textContent += (hintsUsed ? ' · ' : '') + Hints.hintText(current, ++hintsUsed);
  if (hintsUsed >= Hints.MAX) $('hint-btn').classList.add('hidden');
};

function startTimer() {
  timeLeft = TIME_LIMIT;
  updateRing();
  timer = setInterval(() => {
    const before = Math.ceil(timeLeft);
    timeLeft -= 0.1;
    if (Math.ceil(timeLeft) < before && before <= 3 && timeLeft > 0) window.Sound?.play('tick');
    updateRing();
    if (timeLeft <= 0) {
      clearInterval(timer);
      choose(null, null);
    }
  }, 100);
}

function updateRing() {
  const pct = Math.max(0, timeLeft / TIME_LIMIT) * 100;
  ringFg.style.strokeDasharray = `${pct} 100`;
  timerNum.textContent = Math.ceil(timeLeft);
}

function choose(opt, btn) {
  clearInterval(timer);
  $('hint-btn').classList.add('hidden');
  const correct = typeMode ? opt !== null && Match.ok(opt, current.answer) : opt === current.answer;
  $('type-input').disabled = true;
  [...optionsEl.children].forEach(b => {
    if (b.textContent === current.answer) b.classList.add('correct');
    else if (b === btn) b.classList.add('wrong');
    b.disabled = true;
  });
  let pts = 0;
  if (correct) {
    flashArt(current.art);
    streak++;
    pts = Hints.points(10 * (speedMode ? Math.max(1, Math.ceil(timeLeft)) : 1), hintsUsed);
    score += pts;
    const milestone = streak % 5 === 0;
    feedbackEl.textContent = milestone ? `${streak} in a row! +${pts}` : `Correct! +${pts}`;
    window.Sound?.play(milestone ? 'streak' : 'right');
    burst(btn || $('type-input'), milestone ? 60 : 24);
    bump($('streak'));
  } else {
    streak = 0;
    if (lives) lives--;
    feedbackEl.textContent = `Nope, it was "${current.answer}"`;
    window.Sound?.play('wrong');
  }
  if (current.character) feedbackEl.textContent += ` · ${[current.character, current.year].filter(Boolean).join(', ')}`;
  if (!current.noTally) tally(current, correct);  // timelines, reveals, misquotes and packs aren't one bank quote
  run.push({ qid: Difficulty.qid(current.quote), pick: typeMode ? opt : btn?.textContent ?? opt, pts });
  duelSend({ type: 'answer', score, i: run.length, name: window.quotableDisplayName?.() });
  window.quotableBadge?.('answer', { q: current, correct, typed: typeMode, hints: hintsUsed, streak });
  updateStats();
  if (dailyMode) recordDaily(correct);
  nextTimer = setTimeout(dailyMode ? finishDaily : lives === 0 ? endGame : nextQuestion, 1100);
}

// Confetti from the picked answer, in the round's genre colour plus the accent.
function burst(from, n) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = from.getBoundingClientRect();
  const colors = [genreBadge.style.background || '#ff6b35', '#ffcc00', '#ffffff', '#ff6fae', '#34c759'];
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.className = 'confetti';
    const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * (n > 30 ? 260 : 160);
    p.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;background:${colors[i % colors.length]};` +
      `--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 60}px;--rot:${Math.random() * 720 - 360}deg`;
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

function bump(el) {
  if (!el) return;
  el.classList.remove('bump');
  void el.offsetWidth;  // restart the animation
  el.classList.add('bump');
}

function updateStats() {
  $('score').textContent = duel?.quotes ? `You: ${score} · Them: ${duel.them}${duel.left ? ' (left)' : ''}` : `Score: ${score}${lives !== null ? ` · ${lives} ${lives === 1 ? 'life' : 'lives'}` : ''}`;
  $('streak').textContent = `Streak: ${streak}`;
}

function endGame() {
  window.Sound?.play('over');
  gameEl.classList.add('hidden');
  endEl.classList.remove('hidden');
  document.body.classList.remove('speed', 'revealing');
  const prev = parseInt(localStorage.getItem(HIGH_KEY) || '0', 10);
  const best = !window.quotableOffBoard && score > prev;   // pass and play and packs never set the high score
  const high = best ? score : prev;
  if (best) requestAnimationFrame(() => burst($('final-score'), 80));
  const dark = document.documentElement.dataset.theme === 'dark' ? '-dark' : '';  // cream limbs on the dark ground
  $('quip-end').src = `brand/quip-${best ? 'cheer' : score > 0 ? 'idle' : 'oops'}${dark}.svg`;
  localStorage.setItem(HIGH_KEY, high);
  $('final-score').textContent = `Final score: ${score} · High score: ${high}`;
  if (!duel && !challenge && !window.quotableOffBoard) window.quotableSubmitScore?.(score, speedMode ? 'speed' : 'normal', run, typeMode ? 'typed' : $('mode').value);
  if (challenge) {
    $('final-score').textContent = Challenge.verdict(score, challenge.score, challenge.name);
    challenge = null;
    history.replaceState(null, '', location.pathname);  // Play Again starts a normal game
  }
  $('challenge-btn').classList.toggle('hidden', !run.length || speedMode || !!duel);
  window.quotableBadge?.('game', { score, speed: speedMode });
  if (duel?.quotes) { duel.done = true; duelSend({ type: 'done', score }); duelResult(); }
}


// Ten quotes of this run (or fewer if it ended early) and the points earned on them.
$('challenge-btn').onclick = () => {
  window.quotableBadge?.('challenge');
  const first = run.slice(0, Challenge.SIZE);
  const url = `${location.origin}/c?${Challenge.encode(first.map(r => r.qid), first.reduce((n, r) => n + r.pts, 0), window.quotableDisplayName?.())}`;
  const text = `I scored ${first.reduce((n, r) => n + r.pts, 0)} on these ${first.length} Coda lines. Your turn: ${url}`;
  if (navigator.share) navigator.share({ text });
  else navigator.clipboard.writeText(text).then(() => {
    $('challenge-btn').textContent = 'Link copied';
    setTimeout(() => { $('challenge-btn').textContent = 'Challenge a friend'; }, 1500);
  });
};

const showLeaderboard = () => {
  $('leaderboard').classList.remove('hidden');
  window.quotableShowLeaderboard?.(speedMode ? 'speed' : 'normal');
};
$('lb-btn').onclick = showLeaderboard;
$('lb-btn-end').onclick = showLeaderboard;
$('lb-close').onclick = () => $('leaderboard').classList.add('hidden');

const readJSON = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };

function updateDailyButton() {
  const day = Daily.dayNumber(), played = readJSON(DAILY_KEY);
  $('start-daily').textContent = played && played.day === day ? `Daily #${day} done` : `Daily Quote #${day}`;
}

function startDaily() {
  if (!quotes.length) return;
  const day = Daily.dayNumber(), played = readJSON(DAILY_KEY);
  if (played && played.day === day) return showDailyResult();
  dailyMode = true;
  lives = null;
  typeMode = false;
  speedMode = false;
  score = 0;
  streak = 0;
  pool = [Daily.quoteFor(day, core)];
  updateStats();
  modeSelect.classList.add('hidden');
  endEl.classList.add('hidden');
  timerRing.classList.add('hidden');
  document.body.classList.remove('speed');
  gameEl.classList.remove('hidden');
  nextQuestion();
}

function recordDaily(correct) {
  const day = Daily.dayNumber();
  localStorage.setItem(DAILY_KEY, JSON.stringify({ day, correct, answer: current.answer }));
  localStorage.setItem(DAILY_STREAK_KEY, JSON.stringify(Daily.nextStreak(readJSON(DAILY_STREAK_KEY), day, correct)));
  window.quotableBadge?.('daily', { streak: Daily.currentStreak(readJSON(DAILY_STREAK_KEY), day) });
}

function finishDaily() {
  dailyMode = false;
  gameEl.classList.add('hidden');
  showDailyResult(true);
}

function showDailyResult(justPlayed = false) {
  const day = Daily.dayNumber(), played = readJSON(DAILY_KEY);
  const days = Daily.currentStreak(readJSON(DAILY_STREAK_KEY), day);
  const ms = Daily.msUntilNext(), h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  const pose = played.correct ? 'cheer' : 'oops';
  $('quip-daily').src = `brand/quip-${pose}.svg`;
  $('quip-daily-dark').srcset = `brand/quip-${pose}-dark.svg`;
  $('daily-title').textContent = `Daily #${day}`;
  $('daily-result').textContent = played.correct ? `Got it: \u201C${played.answer}\u201D` : `It was \u201C${played.answer}\u201D`;
  $('daily-streak').textContent = `Day streak: ${days}`;
  $('daily-next').textContent = `Next quote in ${h}h ${m}m`;
  modeSelect.classList.add('hidden');
  $('daily-end').classList.remove('hidden');
  if (justPlayed && played.correct) requestAnimationFrame(() => burst($('daily-title'), days > 0 && days % 5 === 0 ? 80 : 40));
}

$('start-daily').onclick = startDaily;
$('daily-back').onclick = () => {
  $('daily-end').classList.add('hidden');
  modeSelect.classList.remove('hidden');
  updateDailyButton();
};
$('daily-share').onclick = () => {
  const day = Daily.dayNumber(), played = readJSON(DAILY_KEY);
  const text = Daily.shareText(day, played.correct, Daily.currentStreak(readJSON(DAILY_STREAK_KEY), day));
  if (navigator.share) navigator.share({ text });
  else navigator.clipboard.writeText(text).then(() => {
    $('daily-share').textContent = 'Copied';
    setTimeout(() => { $('daily-share').textContent = 'Share'; }, 1500);
  });
};

$('start-normal').onclick = () => startGame(false);
$('start-speed').onclick = () => startGame(true);
$('restart').onclick = () => {
  endEl.classList.add('hidden');
  modeSelect.classList.remove('hidden');
};
// The share card (sharecard.js) goes out as a file where the browser can share one, else it downloads.
$('share').onclick = async () => {
  const text = `I scored ${score} on Coda! Can you beat me? https://coda.jaybulb.com`;
  const blob = await ShareCard.draw({ score, high: parseInt(localStorage.getItem(HIGH_KEY) || '0', 10), run, speed: speedMode });
  const files = blob ? [new File([blob], 'quotestreak.png', { type: 'image/png' })] : [];
  if (files.length && navigator.canShare?.({ files })) return navigator.share({ files, text }).catch(() => {});
  if (blob) Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'quotestreak.png' }).click();
  navigator.clipboard?.writeText(text).catch(() => {});
  $('share').textContent = 'Card saved';
  setTimeout(() => { $('share').textContent = 'Share Score'; }, 1500);
};

// Exports for webmcp.js — read-only accessors + the existing handlers themselves.
window.quotableStartGame = startGame;
window.quotableChoose = choose;
window.quotableNextQuestion = nextQuestion;
window.quotableSetGenre = (genre) => { $('genre').value = genre; };
window.quotableGetState = () => ({
  inProgress: !gameEl.classList.contains('hidden'),
  speedMode,
  score,
  streak,
  genre: $('genre').value,
  question: current ? {
    genre: current.genre,
    type: current.type,
    quote: current.quote,
    options: current.options,
  } : null,
});
window.quotableGetHighScore = () => parseInt(localStorage.getItem(HIGH_KEY) || '0', 10);

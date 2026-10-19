let quotes = [];
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
const SFX_ON_KEY = 'quotable_sfx_on';
const SFX_VOL_KEY = 'quotable_sfx_vol';

const $ = (id) => document.getElementById(id);

let audioCtx = null;
function beep(freq, duration) {
  if ($('sfx-toggle') && !$('sfx-toggle').checked) return;
  const vol = ($('sfx-volume') ? $('sfx-volume').value : 60) / 100;
  if (vol <= 0) return;
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.value = freq;
  gain.gain.value = vol * 0.2;
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function initSettings() {
  const toggle = $('sfx-toggle');
  const volume = $('sfx-volume');
  toggle.checked = localStorage.getItem(SFX_ON_KEY) !== 'false';
  volume.value = localStorage.getItem(SFX_VOL_KEY) || '60';
  toggle.onchange = () => localStorage.setItem(SFX_ON_KEY, toggle.checked);
  volume.oninput = () => localStorage.setItem(SFX_VOL_KEY, volume.value);
  $('settings-btn').onclick = () => $('settings').classList.remove('hidden');
  $('settings-close').onclick = () => $('settings').classList.add('hidden');
}
initSettings();

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
};
// Genre keys that do not read well capitalized. Mirrored by Theme.label(for:) in Swift.
const LABELS = { scifi: 'Sci-fi', hiphop: 'Hip-hop', rnb: 'R&B', tvdrama: 'TV drama', game: 'Games', book: 'First lines' };
const label = (g) => LABELS[g] || g[0].toUpperCase() + g.slice(1);
const decadeOf = (y) => Math.floor(y / 10) * 10;
const PROMPTS = { music: 'Guess the artist from the lyric.', tv: 'Guess the show from the quote.', game: 'Guess the game from the quote.', book: 'Name the book from its first line.', movie: 'Guess the movie from the quote.' };

fetch('quotes.json').then(r => r.json()).then(data => {
  quotes = data;
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
  buildBackdrop(data);
  updateDailyButton();
  if (new URLSearchParams(location.search).has('daily')) startDaily();  // share links land on the daily
});

// Static mosaic of the bank's artwork behind the game. Reuses the fetch above rather than
// pulling quotes.json twice, and asks for thumbnails, not the full-size art flashArt() uses.
function buildBackdrop(data) {
  const el = $('backdrop');
  if (!el) return;
  const seen = new Set();
  const art = [];
  data.forEach(q => {
    if (!q.art || seen.has(q.art)) return;
    seen.add(q.art);
    art.push({
      url: q.art.replace('/w500/', '/w185/').replace('/600x600bb.jpg', '/200x200bb.jpg'),
      sq: q.type === 'music',
    });
  });
  if (art.length < 8) return;
  const shuffled = shuffle(art);
  const cols = Math.max(3, Math.ceil(window.innerWidth / 150));
  const per = Math.ceil(window.innerHeight / 150) + 1;
  for (let c = 0; c < cols; c++) {
    const col = document.createElement('div');
    col.className = 'bcol ' + (c % 2 ? 'down' : 'up');
    col.style.setProperty('--dur', (80 + c * 13) + 's');
    // doubled so the drift loops seamlessly
    for (let r = 0; r < per * 2; r++) {
      const a = shuffled[(c * per + r % per) % shuffled.length];
      const img = new Image();
      img.src = a.url;
      img.alt = '';
      img.referrerPolicy = 'no-referrer';
      if (a.sq) img.className = 'sq';
      col.appendChild(img);
    }
    el.appendChild(col);
  }
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function startGame(speed) {
  typeMode = $('type-toggle').checked;
  speedMode = speed;
  score = 0;
  streak = 0;
  const genre = $('genre').value;
  const decade = $('decade').value;
  pool = shuffle(quotes.filter(q => (genre === 'all' || q.genre === genre) && (decade === 'all' || (q.year && decadeOf(q.year) === +decade))));
  if (!pool.length) pool = shuffle(quotes.filter(q => genre === 'all' || q.genre === genre));  // an empty pairing plays the genre
  updateStats();
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
  quoteEl.textContent = `\u201C${current.quote}\u201D`;  // curly, so Quip Sans draws the logo's marks
  quoteEl.style.animation = 'none';
  void quoteEl.offsetWidth;
  quoteEl.style.animation = '';
  feedbackEl.textContent = '';
  hintsUsed = 0;
  $('hint').textContent = '';
  $('hint-btn').classList.remove('hidden');
  optionsEl.innerHTML = '';
  $('type-form').classList.toggle('hidden', !typeMode);
  if (typeMode) { $('type-input').value = ''; $('type-input').disabled = false; $('type-input').focus(); }
  promptEl.textContent = PROMPTS[current.type] || PROMPTS.movie;
  if (!typeMode) (dailyMode ? current.options : shuffle(current.options)).forEach(opt => {  // the daily board is the same for everyone
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => choose(opt, btn);
    optionsEl.appendChild(btn);
  });
  preloadArt(current.art);
  if (speedMode) startTimer();
}

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
    timeLeft -= 0.1;
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
  if (correct) {
    flashArt(current.art);
    streak++;
    const pts = Hints.points(10 * (speedMode ? Math.max(1, Math.ceil(timeLeft)) : 1), hintsUsed);
    score += pts;
    const milestone = streak % 5 === 0;
    feedbackEl.textContent = milestone ? `${streak} in a row! +${pts}` : `Correct! +${pts}`;
    beep(660, 0.15);
    burst(btn || $('type-input'), milestone ? 60 : 24);
    bump($('streak'));
  } else {
    streak = 0;
    feedbackEl.textContent = `Nope, it was "${current.answer}"`;
    beep(180, 0.25);
  }
  if (current.character) feedbackEl.textContent += ` · ${[current.character, current.year].filter(Boolean).join(', ')}`;
  updateStats();
  if (dailyMode) recordDaily(correct);
  setTimeout(dailyMode ? finishDaily : nextQuestion, 1100);
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

// Full-size art is fetched as soon as the question is shown, so a correct answer flashes
// it instantly instead of racing a cold network fetch against the 1100ms round timer.
const artCache = new Map();
function preloadArt(url) {
  if (!url || artCache.has(url)) return;
  const img = new Image();
  img.referrerPolicy = 'no-referrer';
  artCache.set(url, img);
  img.src = url;
}

let artEl = null;
let artHideTimer = null;
function flashArt(url) {
  if (!url) return;
  if (!artEl) {
    artEl = document.createElement('div');
    artEl.id = 'art-flash';
    document.body.appendChild(artEl);
  }
  const show = () => {
    // Back-to-back correct answers: kill the previous hide so it can't cut this one short.
    clearTimeout(artHideTimer);
    artEl.style.backgroundImage = `url("${url}")`;
    artEl.classList.add('show');
    artHideTimer = setTimeout(() => artEl.classList.remove('show'), 950);
  };
  const cached = artCache.get(url);
  if (cached && cached.complete && cached.naturalWidth) return show();
  // Still in flight. Show it when it lands, but only if this question is still on screen —
  // otherwise it flashes the previous round's art over the next quote. A failed load is a
  // no-op rather than a stuck overlay.
  const asked = current;
  const img = new Image();
  img.referrerPolicy = 'no-referrer';
  img.onload = () => { if (current === asked) show(); };
  img.src = url;
}

function updateStats() {
  $('score').textContent = `Score: ${score}`;
  $('streak').textContent = `Streak: ${streak}`;
}

function endGame() {
  gameEl.classList.add('hidden');
  endEl.classList.remove('hidden');
  document.body.classList.remove('speed');
  const prev = parseInt(localStorage.getItem(HIGH_KEY) || '0', 10);
  const high = Math.max(score, prev);
  if (score > prev) requestAnimationFrame(() => burst($('final-score'), 80));
  const dark = document.documentElement.dataset.theme === 'dark' ? '-dark' : '';  // cream limbs on the dark ground
  $('quip-end').src = `brand/quip-${score > prev ? 'cheer' : score > 0 ? 'idle' : 'oops'}${dark}.svg`;
  localStorage.setItem(HIGH_KEY, high);
  $('final-score').textContent = `Final score: ${score} · High score: ${high}`;
  window.quotableSubmitScore?.(score, speedMode ? 'speed' : 'normal');
}

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
  typeMode = false;
  speedMode = false;
  score = 0;
  streak = 0;
  pool = [Daily.quoteFor(day, quotes)];
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
$('share').onclick = () => {
  const text = `I scored ${score} on Quotestreak! Can you beat me? https://quotestreak.jaybulb.com`;
  if (navigator.share) navigator.share({ text });
  else navigator.clipboard.writeText(text).then(() => {
    $('share').textContent = 'Copied!';
    setTimeout(() => { $('share').textContent = 'Share Score'; }, 1500);
  });
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

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

fetch('quotes.json').then(r => r.json()).then(data => { quotes = data; });

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function startGame(speed) {
  speedMode = speed;
  score = 0;
  streak = 0;
  pool = shuffle(quotes);
  updateStats();
  modeSelect.classList.add('hidden');
  endEl.classList.add('hidden');
  gameEl.classList.remove('hidden');
  timerRing.classList.toggle('hidden', !speed);
  nextQuestion();
}

function nextQuestion() {
  clearInterval(timer);
  if (pool.length === 0) return endGame();
  current = pool.pop();
  quoteEl.textContent = `"${current.quote}"`;
  quoteEl.style.animation = 'none';
  void quoteEl.offsetWidth;
  quoteEl.style.animation = '';
  feedbackEl.textContent = '';
  optionsEl.innerHTML = '';
  shuffle(current.options).forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => choose(opt, btn);
    optionsEl.appendChild(btn);
  });
  if (speedMode) startTimer();
}

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
  const correct = opt === current.movie;
  [...optionsEl.children].forEach(b => {
    if (b.textContent === current.movie) b.classList.add('correct');
    else if (b === btn) b.classList.add('wrong');
    b.disabled = true;
  });
  if (correct) {
    streak++;
    const bonus = speedMode ? Math.max(1, Math.ceil(timeLeft)) : 1;
    score += 10 * bonus;
    feedbackEl.textContent = `Correct! +${10 * bonus}`;
  } else {
    streak = 0;
    feedbackEl.textContent = `Nope — it was "${current.movie}"`;
  }
  updateStats();
  setTimeout(nextQuestion, 1100);
}

function updateStats() {
  $('score').textContent = `Score: ${score}`;
  $('streak').textContent = `Streak: ${streak}`;
}

function endGame() {
  gameEl.classList.add('hidden');
  endEl.classList.remove('hidden');
  const high = Math.max(score, parseInt(localStorage.getItem(HIGH_KEY) || '0', 10));
  localStorage.setItem(HIGH_KEY, high);
  $('final-score').textContent = `Final score: ${score} · High score: ${high}`;
}

$('start-normal').onclick = () => startGame(false);
$('start-speed').onclick = () => startGame(true);
$('restart').onclick = () => {
  endEl.classList.add('hidden');
  modeSelect.classList.remove('hidden');
};

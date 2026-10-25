// Stopwatch. Wall clock based so it keeps running across reloads.
let sw = store.get('sw', { start: null, acc: 0, laps: [], analog: false });
const swNow = () => sw.acc + (sw.start ? Date.now() - sw.start : 0);
const saveSw = () => store.set('sw', sw);
function swButtons() {
  const run = !!sw.start;
  $('swStart').textContent = run ? 'Stop' : 'Start'; $('swStart').className = run ? 'stop' : 'go';
  $('swLap').textContent = run || !sw.acc ? 'Lap' : 'Reset'; $('swLap').disabled = !run && !sw.acc;
  $('swDigital').hidden = sw.analog; $('swAnalog').toggleAttribute('hidden', !sw.analog); // SVG has no .hidden property
}
function swToggle() {
  if (sw.start) { sw.acc = swNow(); sw.start = null; } else sw.start = Date.now();
  saveSw(); swButtons(); drawLaps();
}
function swLapReset() {
  if (sw.start) sw.laps.push(swNow());
  else if (sw.acc) { sw.acc = 0; sw.laps = []; }
  saveSw(); swButtons(); drawLaps();
}
$('swStart').onclick = swToggle;
$('swLap').onclick = swLapReset;
[$('swDigital'), $('swAnalog')].forEach(el => {
  el.onclick = () => { sw.analog = !sw.analog; saveSw(); swButtons(); };
  el.onkeydown = (e) => { if (e.key === 'Enter') el.onclick(); };
});
function drawLaps() {
  const total = swNow(), splits = sw.laps.map((t, i) => t - (sw.laps[i - 1] || 0));
  const { best, worst } = lapMarks(splits);
  const current = sw.start || sw.acc ? `<div class="row"><div class="grow label">Lap ${sw.laps.length + 1}</div><div class="label num" id="swCurrent">${fmtSw(total - (sw.laps.at(-1) || 0))}</div></div>` : '';
  $('laps').innerHTML = current + splits.map((d, i) => ({ d, i })).reverse().map(({ d, i }) =>
    `<div class="row${d === best ? ' best' : d === worst ? ' worst' : ''}"><div class="grow label">Lap ${i + 1}</div><div class="label num">${fmtSw(d)}</div></div>`).join('');
  $('laps').hidden = !current;
}
function drawSw() {
  const t = swNow();
  $('swDigital').textContent = fmtSw(t); $('swSmall').textContent = fmtSw(t);
  $('swHand').setAttribute('transform', `rotate(${(t / 1000 % 60) * 6})`);
  const cur = $('swCurrent'); if (cur) cur.textContent = fmtSw(t - (sw.laps.at(-1) || 0));
}
addEventListener('keydown', (e) => {
  if ($('stopwatch').hidden || e.target.closest('input, select, textarea, dialog') || e.metaKey || e.ctrlKey) return;
  if (e.code === 'Space') { e.preventDefault(); swToggle(); }
  else if (e.key === 'l' || e.key === 'L') swLapReset();
});

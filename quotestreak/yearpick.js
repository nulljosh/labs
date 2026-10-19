// Name the year (v27). Classic script after reveal.js: it chains window.quotableShown, and for a
// question with yearPick it swaps the answer buttons for a year slider and a Lock it in button.
const yearBox = document.createElement('div');
yearBox.id = 'yearpick';
yearBox.className = 'hidden';
yearBox.innerHTML = '<output id="year-out"></output><input id="year-range" type="range" step="1" aria-label="Year"><button id="year-go">Lock it in</button>';
optionsEl.after(yearBox);
const yearRange = $('year-range');
yearRange.oninput = () => { $('year-out').textContent = yearRange.value; };
const shownBefore = window.quotableShown;
window.quotableShown = (q) => {
  shownBefore?.(q);
  yearBox.classList.toggle('hidden', !q.yearPick);
  if (!q.yearPick) return;
  $('type-form').classList.add('hidden');
  const years = quotes.filter(x => x.year).map(x => x.year);
  Object.assign(yearRange, { min: Math.min(...years), max: Math.max(...years) });
  yearRange.value = Math.round((+yearRange.min + +yearRange.max) / 2);
  yearRange.disabled = $('year-go').disabled = false;
  yearRange.oninput();
};
$('year-go').onclick = () => {
  yearRange.disabled = $('year-go').disabled = true;
  choose(yearRange.value, null);
};

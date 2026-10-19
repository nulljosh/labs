// Poster and album reveal (v25, v26). Classic script after game.js: game.js calls
// window.quotableShown(question) for every question; when it carries an image, the image replaces
// the quote and sharpens from a heavy blur, and any answer snaps it sharp.
const revealImg = Object.assign(document.createElement('img'), { id: 'reveal', alt: '', referrerPolicy: 'no-referrer' });
revealImg.classList.add('hidden');
quoteEl.before(revealImg);
window.quotableShown = (q) => {
  revealImg.classList.toggle('hidden', !q.image);
  quoteEl.classList.toggle('hidden', !!q.image);
  document.body.classList.toggle('revealing', !!q.image);  // the poster wall would give the answer away
  if (!q.image) return;
  revealImg.classList.remove('sharpen', 'sharp');
  revealImg.classList.toggle('sq', !!q.square);
  revealImg.src = q.image;
  requestAnimationFrame(() => requestAnimationFrame(() => revealImg.classList.add('sharpen')));
};
const sharpNow = () => revealImg.classList.add('sharp');
optionsEl.addEventListener('click', sharpNow);
$('type-form').addEventListener('submit', sharpNow);

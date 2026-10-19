// Coda 100 (v100): Quip's birthday and the live event. On October 18 (UTC), the day the brand
// and Quip were made in 2026, every Quip wears a party hat and the menu says so, with confetti.
// The show has its own menu button; a banner for it pushed Play off a phone screen, so there isn't one.
// ?birthday shows the birthday any day. Classic script after dress.js; event.test.js
// requires the pure part.
(function (root) {
  const isBirthday = (d = new Date()) => d.getUTCMonth() === 9 && d.getUTCDate() === 18;
  const age = (d = new Date()) => d.getUTCFullYear() - 2026;
  const EVENT_START = Date.UTC(2026, 9, 25, 18), EVENT_END = EVENT_START + 12 * 20000;   // the first show: 12 questions, 20 s each
  const eventOn = (now = Date.now()) => now < EVENT_END;
  const api = { isBirthday, age, eventOn, EVENT_START };
  if (typeof module !== 'undefined') { module.exports = api; return; }

  const forced = new URLSearchParams(location.search).has('birthday');
  const notes = [];
  if (forced || isBirthday()) {
    const n = age();
    notes.push(`<p class="event-note">${n > 0 ? `Happy birthday, Quip. ${n} today.` : 'Happy birthday, Quip.'}</p>`);
    window.Dress?.wearFor('partyhat');
    setTimeout(() => { const q = document.querySelector('#mode-select .quip'); if (q && !gameEl.offsetParent) burst(q, 60); }, 900);
  }
  if (!notes.length) return;
  modeSelect.insertAdjacentHTML('afterbegin', `<div id="event" class="event">${notes.join('')}</div>`);
})(this);

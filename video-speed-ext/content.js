// ponytail: one global rate persisted per tab session, no per-video state needed
let rate = 1.0;
const STEP = 0.1;

function applyRate(v) {
  rate = Math.min(4, Math.max(0.1, +v.toFixed(2)));
  document.querySelectorAll('video').forEach(v => { v.playbackRate = rate; });
  showBadge();
}

function showBadge() {
  let el = document.getElementById('__vsc_badge');
  if (!el) {
    el = document.createElement('div');
    el.id = '__vsc_badge';
    Object.assign(el.style, {
      position: 'fixed', top: '12px', right: '12px', zIndex: 2147483647,
      background: 'rgba(0,0,0,.75)', color: '#fff', font: '600 13px system-ui',
      padding: '4px 8px', borderRadius: '6px', pointerEvents: 'none',
      transition: 'opacity .2s'
    });
    document.body.appendChild(el);
  }
  el.textContent = rate.toFixed(2) + '×';
  el.style.opacity = '1';
  clearTimeout(showBadge._t);
  showBadge._t = setTimeout(() => { el.style.opacity = '0'; }, 900);
}

// keep playbackRate sticky when the player resets it on source change
new MutationObserver(() => {
  document.querySelectorAll('video').forEach(v => {
    if (v.playbackRate !== rate) v.playbackRate = rate;
  });
}).observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener('keydown', (e) => {
  if (e.target.matches('input,textarea,[contenteditable]')) return;
  if (!document.querySelector('video')) return;
  if (e.key === 's' || e.key === 'S') applyRate(rate - STEP);
  else if (e.key === 'd' || e.key === 'D') applyRate(rate + STEP);
  else if (e.key === 'r' || e.key === 'R') applyRate(1.0);
});

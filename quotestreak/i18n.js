// Coda in twenty languages (v58). locales/<code>.json maps each English interface string to its
// translation; the English is the key, so no markup needs ids. Every text node, placeholder and
// aria-label on the page is translated when it appears, including text the game sets later
// (a MutationObserver), so the game code stays in English. Templates carry {n} for a number and {x}
// for a name or title, which pass through untranslated: "Who directed {x}?". Quotes, titles and
// answers are content and never match a key; anything inside translate="no" is skipped.
(function () {
  const LANGS = { en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch', it: 'Italiano', pt: 'Português', nl: 'Nederlands',
    sv: 'Svenska', pl: 'Polski', tr: 'Türkçe', ru: 'Русский', uk: 'Українська', ar: 'العربية', he: 'עברית', hi: 'हिन्दी',
    ja: '日本語', ko: '한국어', zh: '中文', id: 'Bahasa Indonesia', vi: 'Tiếng Việt' };
  const RTL = new Set(['ar', 'he']);
  const KEY = 'quotestreak_lang';
  let lang = 'en', rtl = false;
  try {
    const stored = localStorage.getItem(KEY) || localStorage.getItem('quotable.lang');
    const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
    lang = LANGS[stored] ? stored : LANGS[browser] ? browser : 'en';
  } catch {}

  let exact = new Map(), patterns = [];
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function compile(dict) {
    exact = new Map(Object.entries(dict).filter(([k]) => !/\{[nx]\}/.test(k)));
    patterns = Object.entries(dict).filter(([k]) => /\{[nx]\}/.test(k))
      .sort((a, b) => b[0].length - a[0].length)   // the most specific template wins
      .map(([k, v]) => ({ re: new RegExp('^' + esc(k).replace(/\\\{n\\\}/g, '([\\d,.]+)').replace(/\\\{x\\\}/g, '(.+?)') + '$'), to: v }));
  }
  function translate(s) {
    const t = s.trim();
    if (!t) return s;
    const hit = exact.get(t);
    if (hit) return s.replace(t, hit);
    for (const p of patterns) {
      const m = t.match(p.re);
      // A captured name is translated too when it is itself interface text ("Badge: First game",
      // "Badge: Season gold medal"); it is always shorter than the whole, so this ends.
      if (m) { let i = 1; return s.replace(t, p.to.replace(/\{[nx]\}/g, () => { const v = m[i++] ?? ''; const out = v === t ? v : translate(v); return rtl && /[A-Za-z]/.test(out) ? `\u2068${out}\u2069` : out; })); }   // isolate Latin names inside Arabic and Hebrew so their punctuation stays put
    }
    return s;
  }
  const done = new WeakSet();
  const skip = (el) => !el || el.closest('[translate="no"], script, style');
  function walk(root) {
    if (root.nodeType === 3) return text(root);
    if (root.nodeType !== 1 || skip(root)) return;
    for (const a of ['placeholder', 'aria-label', 'title']) if (root.hasAttribute?.(a)) root.setAttribute(a, translate(root.getAttribute(a)));
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let n = w.currentNode; n; n = w.nextNode()) {
      if (n.nodeType === 3) text(n);
      else if (n !== root) for (const a of ['placeholder', 'aria-label', 'title']) if (n.hasAttribute(a) && !skip(n)) n.setAttribute(a, translate(n.getAttribute(a)));
    }
  }
  function text(n) {
    if (done.has(n) || skip(n.parentElement)) return;
    const v = translate(n.nodeValue);
    done.add(n);
    if (v !== n.nodeValue) n.nodeValue = v;
  }

  const ready = (async () => {
    document.documentElement.lang = lang;
    rtl = RTL.has(lang);
    if (rtl) document.documentElement.dir = 'rtl';
    if (lang === 'en') return;
    const r = await fetch(`locales/${lang}.json`).catch(() => null);
    if (!r?.ok) return;
    compile(await r.json());
    walk(document.body);
    new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === 'characterData') { done.delete(m.target); text(m.target); }
        else m.addedNodes.forEach(walk);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  })();

  // The picker in Settings: a change reloads the page in the new language.
  function picker() {
    const sel = document.getElementById('lang-select');
    if (!sel) return;
    sel.innerHTML = Object.entries(LANGS).map(([c, name]) => `<option value="${c}"${c === lang ? ' selected' : ''}>${name}</option>`).join('');
    sel.onchange = () => { try { localStorage.setItem(KEY, sel.value); } catch {} location.reload(); };
  }
  picker();
  window.I18N = { t: translate, ready, lang, LANGS };
})();

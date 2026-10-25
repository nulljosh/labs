// UI text in the reader's language. Each lang/<code>.js file fills LANG_TEXT[code], keyed by the English string.
// Loaded after them and before lib.js; lib.js's tr() falls back to English, which is what node tests see.
const LANGS = ['fr', 'es', 'de', 'ja', 'zh', 'pt', 'ko', 'it', 'nl', 'ar', 'hi'];
const LANG_NAMES = { en: 'English', fr: 'Français', es: 'Español', de: 'Deutsch', ja: '日本語', zh: '中文', pt: 'Português', ko: '한국어', it: 'Italiano', nl: 'Nederlands', ar: 'العربية', hi: 'हिन्दी' };
// The reader's language: a choice saved in Settings, else the first browser language we have.
const LANG = (() => {
  let saved; try { saved = JSON.parse(localStorage.getItem('lang')); } catch {}
  const want = [saved, ...(navigator.languages || [navigator.language])].filter(Boolean).map(l => l.slice(0, 2).toLowerCase());
  return want.find(l => l === 'en' || LANGS.includes(l)) || 'en';
})();
const I18N = (LANG !== 'en' && self.LANG_TEXT?.[LANG]) || {};
document.documentElement.lang = LANG;
document.documentElement.dir = LANG === 'ar' ? 'rtl' : 'ltr';
// The page as written: every text node and label that is a known string, translated once at load.
if (LANG !== 'en') {
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walk.nextNode());) { const k = n.nodeValue.trim(); if (I18N[k]) n.nodeValue = n.nodeValue.replace(k, I18N[k]); }
  document.querySelectorAll('[aria-label], [placeholder], [title]').forEach(el => ['aria-label', 'placeholder', 'title'].forEach(a => { const v = el.getAttribute(a); if (v && I18N[v]) el.setAttribute(a, I18N[v]); }));
}

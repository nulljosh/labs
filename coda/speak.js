// Quip reads it (v28). Classic script after reveal.js: when "Read quotes aloud" is on in Settings,
// every line is spoken with the device's own speech voice (speechSynthesis, nothing leaves the device).
// Poster, album and timeline questions have no line to read; an answer cuts the reading short.
const SPEAK_KEY = 'quotestreak_speak';
const speakToggle = $('speak-toggle');
speakToggle.checked = localStorage.getItem(SPEAK_KEY) === 'true';
speakToggle.onchange = () => { localStorage.setItem(SPEAK_KEY, speakToggle.checked); if (!speakToggle.checked) speechSynthesis?.cancel(); };
if (!('speechSynthesis' in window)) speakToggle.closest('label').classList.add('hidden');
// An English voice, preferring the device's natural ones over the robotic defaults.
const pickVoice = () => {
  const en = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
  return en.find(v => /Samantha|Daniel|Karen|Moira|Google US English|Natural/.test(v.name)) || en.find(v => v.default) || en[0];
};
const shownBeforeSpeak = window.quotableShown;
window.quotableShown = (q) => {
  shownBeforeSpeak?.(q);
  if (!speakToggle.checked || !('speechSynthesis' in window) || q.image || q.plain) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(q.display || q.quote);
  u.voice = pickVoice() || null;
  speechSynthesis.speak(u);
};
const hush = () => window.speechSynthesis?.cancel();
optionsEl.addEventListener('click', hush);
$('type-form').addEventListener('submit', hush);
$('end-btn').addEventListener('click', hush);

// Answer out loud (v29). Classic script after speak.js: when "Answer by voice" is on in Settings,
// the game listens after each line (and after Quip finishes reading it) and picks the option you
// say. Safari recognizes on the device; Chrome sends the audio to Google, so it is off by default.
const VOICE_KEY = 'quotestreak_voice';
const Recognizer = window.SpeechRecognition || window.webkitSpeechRecognition;
const voiceToggle = $('voice-toggle');
voiceToggle.checked = !!Recognizer && localStorage.getItem(VOICE_KEY) === 'true';
voiceToggle.onchange = () => localStorage.setItem(VOICE_KEY, voiceToggle.checked);
if (!Recognizer) voiceToggle.closest('label').classList.add('hidden');
const heardEl = document.createElement('p');
heardEl.id = 'heard';
heardEl.className = 'prompt hidden';
optionsEl.after(heardEl);
let ear = null;
function listen(q, tries = 2) {
  ear?.abort();
  if (q !== current || !tries) return heardEl.classList.add('hidden');
  if (window.speechSynthesis?.speaking) return setTimeout(() => listen(q, tries), 250);  // let Quip finish first
  ear = Object.assign(new Recognizer(), { lang: 'en-US', maxAlternatives: 3, interimResults: false });
  heardEl.textContent = 'Listening…';
  heardEl.classList.remove('hidden');
  ear.onresult = (e) => {
    const said = [...e.results[0]].map(a => a.transcript);
    const opt = Match.pick(said, q.options);
    const btn = [...optionsEl.children].find(b => b.textContent === opt);
    if (btn && !btn.disabled) { heardEl.classList.add('hidden'); btn.click(); }
    else { heardEl.textContent = `Heard “${said[0]}”. Say one of the answers.`; setTimeout(() => listen(q, tries - 1), 900); }
  };
  ear.onerror = () => heardEl.classList.add('hidden');
  ear.start();
}
const shownBeforeVoice = window.quotableShown;
window.quotableShown = (q) => {
  shownBeforeVoice?.(q);
  heardEl.classList.add('hidden');
  if (voiceToggle.checked && !typeMode && q.options?.length) listen(q);
};
optionsEl.addEventListener('click', () => { ear?.abort(); heardEl.classList.add('hidden'); });
$('end-btn').addEventListener('click', () => ear?.abort());

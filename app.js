// First occurrences in the supplied dialogues, excluding input boxes and answer/feedback sections.
const vocabulary = [
  ['Adónde', 'Where to'], ['vas', 'you go'], ['los', 'the'], ['fines', 'ends'],
  ['de', 'of / from'], ['semana', 'week'], ['al', 'to the'], ['centro', 'center'],
  ['comercial', 'commercial / shopping'], ['con', 'with'], ['mis', 'my'], ['amigos', 'friends'],
  ['Cómo', 'How'], ['eres', 'you are'], ['bastante', 'quite'], ['atrevido', 'daring'],
  ['Me', 'me / to me'], ['gusta', 'is pleasing (to someone)'], ['montar', 'to ride'], ['en', 'in / on'], ['monopatín', 'skateboard'],
  ['Qué', 'What'], ['le', 'to him / her'], ['dices', 'you say'], ['a', 'to / at'], ['tu', 'your'],
  ['abuelita', 'grandma'], ['cuando', 'when'], ['te', 'you / to you'], ['da', 'gives'], ['un', 'a / an'],
  ['regalo', 'gift'], ['muchísimas', 'very many'], ['gracias', 'thanks'],
  ['Dónde', 'Where'], ['estás', 'you are'], ['ahora', 'now'], ['mismo', 'same / right (now)'],
  ['haciendo', 'doing'], ['esta', 'this'], ['tarea', 'homework'], ['divertida', 'fun'], ['casa', 'home / house'],
  ['Cuántas', 'How many'], ['clases', 'classes'], ['tienes', 'you have'], ['este', 'this'], ['año', 'year'],
  ['cinco', 'five'], ['pero', 'but'], ['gustaría', 'would be pleasing (to someone)'], ['tomar', 'to take'],
  ['una', 'a / an'], ['clase', 'class'], ['cerámica', 'ceramics'], ['también', 'also / too'],
  ['Generalmente', 'Generally'], ['hora', 'time / hour'], ['vienes', 'you come'], ['Pues', 'Well'],
  ['muchos', 'many'], ['días', 'days'], ['las', 'the / them'], ['ocho', 'eight'], ['menos', 'minus / less'], ['cuarto', 'quarter'],
  ['Conoces', 'you know'], ['muchas', 'many'], ['personas', 'people'], ['Sí', 'Yes'], ['todas', 'all'],
  ['Siempre', 'Always'], ['obedeces', 'you obey'], ['tus', 'your'], ['padres', 'parents'], ['No', 'No / not'],
  ['veces', 'times'], ['reglas', 'rules'], ['la', 'the / it'],
  ['Haces', 'you do / make'], ['todos', 'all / every'], ['traes', 'you bring'],
  ['el', 'the'], ['libro', 'book'], ['texto', 'text'], ['cuaderno', 'notebook'], ['y', 'and'], ['unos', 'some'], ['lápices', 'pencils']
];

const list = document.querySelector('#words');
const status = document.querySelector('#audio-status');
const supportsSpeech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let voices = [];
function updateVoices() { voices = window.speechSynthesis.getVoices(); }
if (supportsSpeech) {
  updateVoices();
  window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
} else {
  status.textContent = 'Audio is unavailable in this browser. Try a browser with speech support.';
}

function speak(text, rate, language = 'es') {
  if (!supportsSpeech) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const preferred = language === 'en' ? 'en-US' : 'es-MX';
  const voice = voices.find(v => v.lang.replace('_', '-').toLowerCase() === preferred.toLowerCase())
    || voices.find(v => v.lang.toLowerCase().split(/[-_]/)[0] === language);
  utterance.lang = voice ? voice.lang : preferred;
  if (voice) utterance.voice = voice;
  utterance.rate = rate;
  utterance.onstart = () => { status.textContent = `Playing: ${text} (${rate === 1 ? 'normal' : 'slow'})`; };
  utterance.onend = () => { status.textContent = ''; };
  utterance.onerror = event => {
    if (!['interrupted', 'canceled'].includes(event.error)) status.textContent = `Could not play audio. Check that an ${language === 'en' ? 'English' : 'available Spanish'} voice is installed on your device and try again.`;
  };
  window.speechSynthesis.speak(utterance);
}

for (const [spanish, english] of vocabulary) {
  const row = document.createElement('li');
  const word = document.createElement('button');
  word.type = 'button';
  word.className = 'word';
  word.textContent = spanish;
  word.lang = 'es';
  word.setAttribute('aria-pressed', 'false');
  word.setAttribute('aria-label', `${spanish}: show English translation`);
  word.addEventListener('click', () => {
    const showEnglish = word.getAttribute('aria-pressed') === 'false';
    word.textContent = showEnglish ? english : spanish;
    word.lang = showEnglish ? 'en' : 'es';
    word.setAttribute('aria-pressed', String(showEnglish));
    word.setAttribute('aria-label', showEnglish ? `${english}: show Spanish word` : `${spanish}: show English translation`);
    if (showEnglish) speak(english, 1, 'en');
  });
  row.append(word);
  for (const [label, rate] of [['Slow', 0.6], ['Normal', 1]]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'audio';
    button.textContent = label;
    button.setAttribute('aria-label', `Play ${spanish} in Spanish at ${label.toLowerCase()} speed`);
    button.disabled = !supportsSpeech;
    button.addEventListener('click', () => speak(spanish, rate));
    row.append(button);
  }
  list.append(row);
}

document.querySelector('#text-size').addEventListener('change', event => {
  document.documentElement.style.setProperty('--word-size', `${event.target.value}rem`);
});

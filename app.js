// First occurrences in the supplied dialogues, excluding input boxes and answer/feedback sections.
const vocabulary = [
  ['Adónde', 'Where to'], ['vas', 'you go'], ['los', 'the (masculine plural)'], ['fines', 'ends (weekends in this sentence)'],
  ['de', 'of / from'], ['semana', 'week'], ['al', 'to the'], ['centro', 'center'],
  ['comercial', 'commercial / shopping'], ['con', 'with'], ['mis', 'my (before plural nouns)'], ['amigos', 'friends'],
  ['Cómo', 'How'], ['eres', 'you are (a trait or characteristic)'], ['bastante', 'quite'], ['atrevido', 'daring'],
  ['Me', 'me / to me'], ['gusta', 'is pleasing (with me: I like)'], ['montar', 'to ride'], ['en', 'in / on'], ['monopatín', 'skateboard'],
  ['Qué', 'What'], ['le', 'to him / her'], ['dices', 'you say'], ['a', 'to / at'], ['tu', 'your (before a singular noun)'],
  ['abuelita', 'grandma'], ['cuando', 'when'], ['te', 'you / to you'], ['da', 'gives'], ['un', 'a / an (masculine singular)'],
  ['regalo', 'gift'], ['muchísimas', 'very many'], ['gracias', 'thanks'],
  ['Dónde', 'Where'], ['estás', 'you are (location or condition)'], ['ahora', 'now'], ['mismo', 'same / right (now)'],
  ['haciendo', 'doing'], ['esta', 'this (feminine singular)'], ['tarea', 'homework'], ['divertida', 'fun'], ['casa', 'home / house'],
  ['Cuántas', 'How many'], ['clases', 'classes'], ['tienes', 'you have'], ['este', 'this (masculine singular)'], ['año', 'year'],
  ['cinco', 'five'], ['pero', 'but'], ['gustaría', 'would be pleasing (with me: I would like)'], ['tomar', 'to take'],
  ['una', 'a / an (feminine singular)'], ['clase', 'class'], ['cerámica', 'ceramics'], ['también', 'also / too'],
  ['Generalmente', 'Generally'], ['hora', 'time / hour'], ['vienes', 'you come'], ['Pues', 'Well'],
  ['muchos', 'many (masculine plural)'], ['días', 'days'], ['las', 'the / them (feminine plural)'], ['ocho', 'eight'], ['menos', 'minus / less'], ['cuarto', 'quarter (15 minutes when telling time)'],
  ['Conoces', 'you know (are familiar with a person or place)'], ['muchas', 'many (feminine plural)'], ['personas', 'people'], ['Sí', 'Yes'], ['todas', 'all (feminine plural)'],
  ['Siempre', 'Always'], ['obedeces', 'you obey'], ['tus', 'your (before plural nouns)'], ['padres', 'parents'], ['No', 'No / not'],
  ['veces', 'times (occasions)'], ['reglas', 'rules'], ['la', 'the / it (feminine singular)'],
  ['Haces', 'you do / make'], ['todos', 'all (masculine plural; every in every day)'], ['traes', 'you bring'],
  ['el', 'the (masculine singular)'], ['libro', 'book'], ['texto', 'text'], ['cuaderno', 'notebook'], ['y', 'and'], ['unos', 'some (masculine plural)'], ['lápices', 'pencils']
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

let pendingSpeech;
let speechSequence = 0;
function cancelSpeech() {
  speechSequence += 1;
  clearTimeout(pendingSpeech);
  pendingSpeech = undefined;
  if (supportsSpeech) window.speechSynthesis.cancel();
}

function speak(text, rate, language = 'es', delay = 0, onComplete) {
  cancelSpeech();
  const sequence = speechSequence;
  if (!supportsSpeech) return;
  const utterance = new SpeechSynthesisUtterance(text);
  const preferred = language === 'en' ? 'en-US' : 'es-MX';
  const voice = voices.find(v => v.lang.replace('_', '-').toLowerCase() === preferred.toLowerCase())
    || voices.find(v => v.lang.toLowerCase().split(/[-_]/)[0] === language);
  utterance.lang = voice ? voice.lang : preferred;
  if (voice) utterance.voice = voice;
  utterance.rate = rate;
  utterance.onstart = () => { status.textContent = ''; };
  utterance.onend = () => {
    if (sequence !== speechSequence) return;
    status.textContent = '';
    if (onComplete) onComplete();
  };
  utterance.onerror = event => {
    if (!['interrupted', 'canceled'].includes(event.error)) status.textContent = `Could not play audio. Check that an ${language === 'en' ? 'English' : 'available Spanish'} voice is installed on your device and try again.`;
  };
  if (delay > 0) {
    pendingSpeech = setTimeout(() => {
      pendingSpeech = undefined;
      window.speechSynthesis.speak(utterance);
    }, delay);
  } else {
    window.speechSynthesis.speak(utterance);
  }
}

const ENGLISH_RATE = 0.55;

function speakTranslation(spanish, english, onComplete) {
  const parts = spanish === 'al' ? ['to', 'the']
    : english.split(/\s*\/\s*/).flatMap((part, index) => index ? ['or', part] : [part]);
  function speakPart(index) {
    speak(parts[index], ENGLISH_RATE, 'en', index === 0 ? 250 : 350, () => {
      if (index + 1 < parts.length) speakPart(index + 1);
      else if (onComplete) onComplete();
    });
  }
  speakPart(0);
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
  let resetTimer;
  let displaySequence = 0;
  function showSpanish() {
    word.textContent = spanish;
    word.lang = 'es';
    word.setAttribute('aria-pressed', 'false');
    word.setAttribute('aria-label', `${spanish}: show English translation`);
  }
  word.addEventListener('click', () => {
    clearTimeout(resetTimer);
    const currentDisplay = ++displaySequence;
    const showEnglish = word.getAttribute('aria-pressed') === 'false';
    word.textContent = showEnglish ? english : spanish;
    word.lang = showEnglish ? 'en' : 'es';
    word.setAttribute('aria-pressed', String(showEnglish));
    word.setAttribute('aria-label', showEnglish ? `${english}: show Spanish word` : `${spanish}: show English translation`);
    if (showEnglish) speakTranslation(spanish, english, () => {
      resetTimer = setTimeout(() => {
        if (currentDisplay === displaySequence) showSpanish();
      }, 1000);
    });
    else cancelSpeech();
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

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

function findChineseVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  const voices = speechSynthesis.getVoices();
  cachedVoice = voices.find(v => v.lang.startsWith('zh')) ?? null;
  return cachedVoice;
}

export function preloadVoices(): void {
  if (voicesLoaded) return;
  voicesLoaded = true;
  findChineseVoice();
  if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.addEventListener('voiceschanged', () => {
      cachedVoice = null;
      findChineseVoice();
    }, { once: true });
  }
}

export function speakChinese(text: string): void {
  if (typeof speechSynthesis === 'undefined') return;

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.85;
  utterance.volume = 1;

  const voice = findChineseVoice();
  if (voice) utterance.voice = voice;

  speechSynthesis.speak(utterance);
}

/** Speak text and call onDone when finished */
export function speakChineseWithCallback(text: string, onDone: () => void): void {
  if (typeof speechSynthesis === 'undefined') { onDone(); return; }

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.85;
  utterance.volume = 1;

  const voice = findChineseVoice();
  if (voice) utterance.voice = voice;

  utterance.onend = () => onDone();
  utterance.onerror = () => onDone();

  speechSynthesis.speak(utterance);
}

/** Speak multiple texts in sequence, waiting for each to finish before the next */
export function speakChineseSequence(texts: string[], pauseMs: number = 500): void {
  if (typeof speechSynthesis === 'undefined') return;

  speechSynthesis.cancel();

  let index = 0;
  const speakNext = () => {
    if (index >= texts.length) return;
    const text = texts[index];
    index++;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;
    utterance.volume = 1;

    const voice = findChineseVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      setTimeout(speakNext, pauseMs);
    };

    speechSynthesis.speak(utterance);
  };

  speakNext();
}

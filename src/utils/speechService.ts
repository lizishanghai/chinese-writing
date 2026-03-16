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

/** Speak text with configurable rate (for karaoke speed control) */
export function speakChineseWithRate(text: string, rate: number): void {
  if (typeof speechSynthesis === 'undefined') return;

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = rate;
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

  let done = false;
  const finish = () => { if (!done) { done = true; onDone(); } };

  utterance.onend = finish;
  utterance.onerror = finish;

  // Fallback timeout in case speech never fires events (e.g., no audio output)
  const maxDuration = Math.max(2000, text.length * 400);
  setTimeout(finish, maxDuration);

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

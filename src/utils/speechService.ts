let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

/** Prefer enhanced/natural voices across platforms:
 *  - iOS: "Lili", "Yu-shu" (downloaded enhanced voices) >> "Ting-Ting" (default)
 *  - Windows: "Microsoft Xiaoxiao Online (Natural)" >> legacy voices
 *  - Android: Google voices
 */
function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  let s = 0;

  // Strongly prefer natural/neural/enhanced/premium voices
  if (name.includes('natural') || name.includes('neural') || name.includes('enhanced') || name.includes('premium')) s += 100;

  // iOS enhanced voices (downloaded in Settings > Accessibility > Spoken Content)
  // These are MUCH better than the default "Ting-Ting"
  if (name.includes('lili')) s += 90;       // iOS zh-CN enhanced female
  if (name.includes('yu-shu')) s += 85;     // iOS zh-CN enhanced male
  if (name.includes('meijia')) s += 40;     // zh-TW but decent

  // Deprioritize the robotic default iOS voice
  if (name.includes('ting-ting')) s -= 20;

  // Windows natural voices
  if (name.includes('online')) s += 50;
  if (name.includes('xiaoxiao') || name.includes('xiaoyi')) s += 20;

  // Google voices (Android/Chrome)
  if (name.includes('google') && v.lang.startsWith('zh')) s += 30;

  // Prefer zh-CN over zh-TW/zh-HK for mainland Mandarin
  if (v.lang === 'zh-CN') s += 10;

  return s;
}

function findChineseVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  const voices = speechSynthesis.getVoices();
  const zhVoices = voices.filter(v => v.lang.startsWith('zh'));
  if (zhVoices.length === 0) return null;
  // Pick the highest-scored voice
  zhVoices.sort((a, b) => scoreVoice(b) - scoreVoice(a));
  cachedVoice = zhVoices[0];
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

/** Default rate: 0.9 is slightly slower than normal but sounds natural */
const DEFAULT_RATE = 0.9;

export function speakChinese(text: string): void {
  if (typeof speechSynthesis === 'undefined') return;

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = DEFAULT_RATE;
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
  utterance.rate = DEFAULT_RATE;
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
    utterance.rate = DEFAULT_RATE;
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

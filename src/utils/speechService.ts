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

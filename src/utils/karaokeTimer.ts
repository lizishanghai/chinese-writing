/** Karaoke timer: highlights characters one-by-one in sync with speech */

/** Speed presets: speech rate + per-character duration */
export interface KaraokeSpeed {
  label: string;
  emoji: string;
  rate: number;     // SpeechSynthesis rate
  charMs: number;   // ms per Chinese character
  punctMs: number;  // ms per punctuation
}

export const KARAOKE_SPEEDS: KaraokeSpeed[] = [
  { label: '慢', emoji: '🐢', rate: 0.7, charMs: 450, punctMs: 150 },
  { label: '正常', emoji: '🚶', rate: 0.85, charMs: 350, punctMs: 120 },
  { label: '快', emoji: '🐇', rate: 1.0, charMs: 280, punctMs: 80 },
];

/** Check if a character is Chinese */
function isChinese(ch: string): boolean {
  return /[\u4e00-\u9fff]/.test(ch);
}

/**
 * Start karaoke timer for a sentence.
 * Highlights each character in sequence with timing matched to speech rate.
 *
 * @param sentence - The sentence to animate
 * @param speed - Karaoke speed preset
 * @param onCharActive - Called with char index as each character activates (-1 = none)
 * @param onDone - Called when all characters have been highlighted
 * @returns cleanup function to cancel the timer
 */
export function startKaraokeTimer(
  sentence: string,
  speed: KaraokeSpeed,
  onCharActive: (index: number) => void,
  onDone: () => void
): () => void {
  const chars = sentence.split('');
  let cancelled = false;
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  // Compute cumulative delays
  let cumulativeDelay = 0;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const delay = cumulativeDelay;

    const t = setTimeout(() => {
      if (cancelled) return;
      onCharActive(i);
    }, delay);
    timeouts.push(t);

    // Duration for this character
    cumulativeDelay += isChinese(ch) ? speed.charMs : speed.punctMs;
  }

  // Final "done" after last char finishes
  const doneTimeout = setTimeout(() => {
    if (cancelled) return;
    onCharActive(-1);
    onDone();
  }, cumulativeDelay);
  timeouts.push(doneTimeout);

  // Return cleanup
  return () => {
    cancelled = true;
    timeouts.forEach(clearTimeout);
  };
}

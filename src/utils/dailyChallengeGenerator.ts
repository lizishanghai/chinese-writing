import type { TestQuestion, DailyChallengeState } from '../types';
import { characterLevels } from '../data/characterLibrary';

const STORAGE_KEY = 'hanzi-daily-challenge';

/** Simple seeded PRNG (mulberry32) */
function seededRandom(seed: number) {
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Convert date string to numeric seed */
function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Seeded shuffle */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Regular shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Get today's date string in YYYY-MM-DD */
export function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Get yesterday's date string */
function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Generate 10 mixed daily challenge questions, deterministic per date */
export function generateDailyChallenge(
  completedLevels: Set<number>,
  dateStr: string
): TestQuestion[] {
  const seed = dateToSeed(dateStr);
  const levels = Array.from(completedLevels);

  // Get all chars from completed levels
  const targetChars = levels.flatMap(lvl => {
    const config = characterLevels[lvl - 1];
    return config ? config.characters : [];
  });

  if (targetChars.length === 0) return [];

  const allChars = characterLevels.flatMap(l => l.characters);
  const allMeanings = allChars.map(c => c.meaning);

  // Pick 10 characters deterministically
  const shuffled = seededShuffle(targetChars, seed);
  const selected = shuffled.slice(0, Math.min(10, shuffled.length));

  // Assign question types: 4 recognition, 3 comprehension, 3 listeningChoice
  const typePattern: Array<'recognition' | 'comprehension' | 'listeningChoice'> = [
    'recognition', 'recognition', 'recognition', 'recognition',
    'comprehension', 'comprehension', 'comprehension',
    'listeningChoice', 'listeningChoice', 'listeningChoice',
  ];
  const shuffledTypes = seededShuffle(typePattern.slice(0, selected.length), seed + 1);

  return selected.map((target, i) => {
    const qType = shuffledTypes[i] || 'recognition';
    const rng = seededRandom(seed + i * 7);

    if (qType === 'recognition') {
      // 50/50 charToPinyin or pinyinToChar
      if (rng < 0.5) {
        const wrongOptions = shuffle(
          allChars.filter(c => c.pinyin !== target.pinyin)
        ).slice(0, 3);
        const options = shuffle([target.pinyin, ...wrongOptions.map(c => c.pinyin)]);
        return {
          type: 'charToPinyin' as const,
          target,
          options,
          correctIndex: options.indexOf(target.pinyin),
        };
      } else {
        const wrongOptions = shuffle(
          allChars.filter(c => c.char !== target.char)
        ).slice(0, 3);
        const options = shuffle([target.char, ...wrongOptions.map(c => c.char)]);
        return {
          type: 'pinyinToChar' as const,
          target,
          options,
          correctIndex: options.indexOf(target.char),
        };
      }
    }

    if (qType === 'comprehension') {
      const word = target.words?.[0] || target.char;
      const wrongMeanings = shuffle(
        allMeanings.filter(m => m !== target.meaning)
      ).slice(0, 3);
      const options = shuffle([target.meaning, ...wrongMeanings]);
      return {
        type: 'comprehension' as const,
        target,
        word,
        options,
        correctIndex: options.indexOf(target.meaning),
      };
    }

    // listeningChoice: hear character, pick from 4 character options
    const wrongOptions = shuffle(
      allChars.filter(c => c.char !== target.char)
    ).slice(0, 3);
    const options = shuffle([target.char, ...wrongOptions.map(c => c.char)]);
    return {
      type: 'listeningChoice' as const,
      target,
      options,
      correctIndex: options.indexOf(target.char),
    };
  });
}

/** Load daily challenge state from localStorage */
export function getDailyChallengeState(): DailyChallengeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { lastDate: '', streak: 0, scores: {} };
}

/** Save daily challenge result */
export function saveDailyChallengeResult(dateStr: string, scorePercent: number): DailyChallengeState {
  const state = getDailyChallengeState();
  const yesterday = getYesterdayStr();

  // Update streak
  if (state.lastDate === yesterday) {
    state.streak += 1;
  } else if (state.lastDate !== dateStr) {
    state.streak = 1;  // Reset streak (missed a day or first time)
  }
  // If lastDate === dateStr, don't change streak (already completed today)

  state.lastDate = dateStr;
  state.scores[dateStr] = scorePercent;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

/** Check if today's challenge is already completed */
export function isTodayCompleted(): boolean {
  const state = getDailyChallengeState();
  return state.lastDate === getTodayStr();
}

import type { WordGameQuestion } from '../types';
import { characterLevels } from '../data/characterLibrary';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

interface WordEntry {
  word: string;
  meaning: string;
  targetChar: typeof characterLevels[0]['characters'][0];
}

/** Collect all 2-char words from completed levels */
function getWordPool(completedLevels: Set<number>): WordEntry[] {
  const pool: WordEntry[] = [];
  for (const lvl of completedLevels) {
    const config = characterLevels[lvl - 1];
    if (!config) continue;
    for (const char of config.characters) {
      if (!char.words) continue;
      for (const word of char.words) {
        // Only 2-char words for reliable game mechanics
        if (word.length === 2) {
          pool.push({ word, meaning: char.meaning, targetChar: char });
        }
      }
    }
  }
  return pool;
}

/** Get all single characters from the library for distractors */
function getAllChars(): string[] {
  return characterLevels.flatMap(l => l.characters.map(c => c.char));
}

/** Generate arrange question: scramble the 2 chars of a word */
function makeArrangeQuestion(entry: WordEntry): WordGameQuestion {
  const chars = entry.word.split('');
  // Always reverse for 2-char words (guaranteed different order)
  const scrambled = [...chars].reverse();

  return {
    type: 'arrange',
    word: entry.word,
    meaning: entry.meaning,
    targetChar: entry.targetChar,
    scrambled,
  };
}

/** Generate fill-blank question: blank one char, provide 4 options */
function makeFillBlankQuestion(entry: WordEntry): WordGameQuestion {
  const chars = entry.word.split('');
  const blankIndex = Math.random() < 0.5 ? 0 : 1;
  const correctChar = chars[blankIndex];

  const allChars = getAllChars();
  const distractors = pickRandom(
    allChars.filter(c => c !== correctChar),
    3
  );

  const options = shuffle([correctChar, ...distractors]);

  return {
    type: 'fillblank',
    word: entry.word,
    meaning: entry.meaning,
    targetChar: entry.targetChar,
    blankIndex,
    options,
    correctIndex: options.indexOf(correctChar),
  };
}

/** Generate mixed word game questions */
export function generateWordGameQuestions(
  completedLevels: Set<number>,
  count: number = 10
): WordGameQuestion[] {
  const pool = getWordPool(completedLevels);
  if (pool.length === 0) return [];

  const selected = pickRandom(pool, Math.min(count, pool.length));

  // Split roughly 50/50 between arrange and fillblank
  const half = Math.ceil(selected.length / 2);

  const questions: WordGameQuestion[] = [];
  for (let i = 0; i < selected.length; i++) {
    if (i < half) {
      questions.push(makeArrangeQuestion(selected[i]));
    } else {
      questions.push(makeFillBlankQuestion(selected[i]));
    }
  }

  return shuffle(questions);
}

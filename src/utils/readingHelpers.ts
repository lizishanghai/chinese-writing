import type { CharacterEntry } from '../types';
import { characterLevels } from '../data/characterLibrary';

/** Get set of all characters the user has learned (from completed levels) */
export function getLearnedChars(completedLevels: Set<number>): Set<string> {
  const chars = new Set<string>();
  for (const lvl of completedLevels) {
    const config = characterLevels[lvl - 1];
    if (config) {
      for (const c of config.characters) {
        chars.add(c.char);
      }
    }
  }
  return chars;
}

/** Build a map of char → pinyin for all 100 characters */
export function buildPinyinMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const level of characterLevels) {
    for (const c of level.characters) {
      map.set(c.char, c.pinyin);
    }
  }
  return map;
}

/** Shuffle array */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface ReadingQuizQuestion {
  word: string;
  correctMeaning: string;
  options: string[];
  correctIndex: number;
}

/** Generate reading quiz questions: show a word, pick the correct meaning */
export function generateReadingQuizQuestions(
  levelChars: CharacterEntry[]
): ReadingQuizQuestion[] {
  // Build a pool of word→meaning pairs from this level
  const allMeanings = characterLevels
    .flatMap(l => l.characters)
    .map(c => c.meaning);

  return levelChars.map(char => {
    // Pick a random word from this character's words
    const word = char.words?.[0] || char.char;
    const correctMeaning = char.meaning;

    // Pick 3 wrong meanings (not the same as correct)
    const wrongMeanings = shuffle(
      allMeanings.filter(m => m !== correctMeaning)
    ).slice(0, 3);

    const options = shuffle([correctMeaning, ...wrongMeanings]);

    return {
      word,
      correctMeaning,
      options,
      correctIndex: options.indexOf(correctMeaning),
    };
  });
}

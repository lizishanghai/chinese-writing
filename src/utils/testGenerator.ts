import type { CharacterEntry, TestQuestion } from '../types';
import { characterLevels } from '../data/characterLibrary';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Get all characters from specified levels */
function getCharsFromLevels(levels: number[]): CharacterEntry[] {
  const chars: CharacterEntry[] = [];
  for (const lvl of levels) {
    const config = characterLevels[lvl - 1];
    if (config) chars.push(...config.characters);
  }
  return chars;
}

/** Get all characters NOT in the specified levels (for distractors) */
function getDistractorPool(levels: number[]): CharacterEntry[] {
  const chars: CharacterEntry[] = [];
  const levelSet = new Set(levels);
  characterLevels.forEach((config, idx) => {
    if (!levelSet.has(idx + 1)) {
      chars.push(...config.characters);
    }
  });
  return chars;
}

/** Pick n unique random items from array */
function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, n);
}

/** Generate recognition test questions (multiple choice) */
export function generateRecognitionQuestions(
  levels: number[],
  questionCount: number = 10
): TestQuestion[] {
  const targetChars = getCharsFromLevels(levels);
  const distractorPool = getDistractorPool(levels);

  // If not enough distractors outside selected levels, use all characters
  const allChars = characterLevels.flatMap(c => c.characters);

  const selected = pickRandom(targetChars, Math.min(questionCount, targetChars.length));

  return selected.map(target => {
    // Randomly choose question type
    const isCharToPinyin = Math.random() < 0.5;

    if (isCharToPinyin) {
      // Show character, pick correct pinyin
      const pool = distractorPool.length >= 3 ? distractorPool : allChars;
      const wrongOptions = pickRandom(
        pool.filter(c => c.pinyin !== target.pinyin),
        3
      );
      const options = shuffle([
        target.pinyin,
        ...wrongOptions.map(c => c.pinyin)
      ]);
      return {
        type: 'charToPinyin' as const,
        target,
        options,
        correctIndex: options.indexOf(target.pinyin),
      };
    } else {
      // Show pinyin + meaning, pick correct character
      const pool = distractorPool.length >= 3 ? distractorPool : allChars;
      const wrongOptions = pickRandom(
        pool.filter(c => c.char !== target.char),
        3
      );
      const options = shuffle([
        target.char,
        ...wrongOptions.map(c => c.char)
      ]);
      return {
        type: 'pinyinToChar' as const,
        target,
        options,
        correctIndex: options.indexOf(target.char),
      };
    }
  });
}

/** Generate listening test questions */
export function generateListeningQuestions(
  levels: number[],
  questionCount: number = 10
): TestQuestion[] {
  const targetChars = getCharsFromLevels(levels);
  const selected = pickRandom(targetChars, Math.min(questionCount, targetChars.length));

  return selected.map(target => ({
    type: 'listening' as const,
    target,
  }));
}

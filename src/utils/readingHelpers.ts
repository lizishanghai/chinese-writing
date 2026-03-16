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

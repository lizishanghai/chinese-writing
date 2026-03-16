export type DifficultyLevel = number; // 1-20
export type AppMode = 'demo' | 'practice';

export interface CharacterEntry {
  char: string;
  pinyin: string;
  meaning: string;
  strokeCount: number;
  emoji?: string;
  words?: string[];
  sentence?: string;
}

export interface LevelConfig {
  label: string;
  labelZh: string;
  description: string;
  characters: CharacterEntry[];
}

export interface QuizState {
  isActive: boolean;
  currentStroke: number;
  totalStrokes: number;
  mistakesPerStroke: number[];
  totalMistakes: number;
  score: number;
  completed: boolean;
}

export interface AppState {
  selectedLevel: DifficultyLevel;
  selectedCharacter: string;
  mode: AppMode;
  quizState: QuizState;
}

// Test types
export type TestType = 'recognition' | 'listening' | 'comprehension';

export interface TestQuestion {
  type: 'charToPinyin' | 'pinyinToChar' | 'listening' | 'comprehension' | 'listeningChoice';
  target: CharacterEntry;
  options?: string[];  // 4 options for multiple choice
  correctIndex?: number;
  word?: string;  // For comprehension: the word to display
}

export interface TestResultData {
  questions: TestQuestion[];
  answers: (number | null)[];
  correct: boolean[];
  score: number;
}

// Daily challenge
export interface DailyChallengeState {
  lastDate: string;           // "YYYY-MM-DD" of last completed challenge
  streak: number;             // consecutive days completed
  scores: Record<string, number>;  // date -> score percentage
}

// Word game
export interface WordGameQuestion {
  type: 'arrange' | 'fillblank';
  word: string;              // The correct word (e.g. "二月")
  meaning: string;           // The character's meaning
  targetChar: CharacterEntry;
  scrambled?: string[];      // For arrange: shuffled characters
  blankIndex?: number;       // For fillblank: which char is blanked (0 or 1)
  options?: string[];        // For fillblank: 4 char options
  correctIndex?: number;     // For fillblank: index of correct option
}

export interface WordGameResult {
  questions: WordGameQuestion[];
  correct: boolean[];
  score: number;
}

export type AppAction =
  | { type: 'SET_LEVEL'; level: DifficultyLevel }
  | { type: 'SET_CHARACTER'; character: string }
  | { type: 'SET_MODE'; mode: AppMode }
  | { type: 'QUIZ_START'; totalStrokes: number }
  | { type: 'QUIZ_CORRECT_STROKE' }
  | { type: 'QUIZ_MISTAKE' }
  | { type: 'QUIZ_COMPLETE'; score: number }
  | { type: 'QUIZ_RESET' };

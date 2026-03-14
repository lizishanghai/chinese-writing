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
export type TestType = 'recognition' | 'listening';

export interface TestQuestion {
  type: 'charToPinyin' | 'pinyinToChar' | 'listening';
  target: CharacterEntry;
  options?: string[];  // 4 options for multiple choice
  correctIndex?: number;
}

export interface TestResultData {
  questions: TestQuestion[];
  answers: (number | null)[];
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

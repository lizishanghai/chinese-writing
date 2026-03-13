import { useState, useCallback, useEffect, useRef } from 'react';
import type { AppMode } from './types';
import { getLevelConfig, TOTAL_LEVEL_COUNT } from './data/characterLibrary';
import { useQuiz } from './hooks/useQuiz';
import { useStrokeAudio } from './hooks/useStrokeAudio';
import { speakChinese } from './utils/speechService';
import { useResponsive } from './hooks/useResponsive';
import { WritingArea } from './components/WritingArea/WritingArea';
import { FeedbackPanel } from './components/FeedbackPanel/FeedbackPanel';
import { LevelSelect } from './components/LevelSelect/LevelSelect';
import { Congratulations } from './components/Congratulations/Congratulations';

import './styles/variables.css';
import './styles/animations.css';
import './components/Layout/AppLayout.css';

type Page = 'levelSelect' | 'practice' | 'congrats';

function loadScores(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem('hanzi-scores') || '{}');
  } catch {
    return {};
  }
}

function loadCompletedLevels(): Set<number> {
  try {
    const arr = JSON.parse(localStorage.getItem('hanzi-completed-levels') || '[]');
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveScore(char: string, score: number) {
  const scores = loadScores();
  if (!scores[char] || score > scores[char]) {
    scores[char] = score;
    localStorage.setItem('hanzi-scores', JSON.stringify(scores));
  }
  return scores;
}

function saveCompletedLevel(level: number) {
  const completed = loadCompletedLevels();
  completed.add(level);
  localStorage.setItem('hanzi-completed-levels', JSON.stringify([...completed]));
  return completed;
}

export default function App() {
  const [page, setPage] = useState<Page>('levelSelect');
  const [level, setLevel] = useState(1);
  const [charIndex, setCharIndex] = useState(0);
  const [mode, setMode] = useState<AppMode>('demo');
  const [scores, setScores] = useState<Record<string, number>>(loadScores);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(loadCompletedLevels);
  const [lastEvent, setLastEvent] = useState<'correct' | 'mistake' | null>(null);
  const { canvasSize } = useResponsive();

  const levelConfig = getLevelConfig(level);
  const character = levelConfig.characters[charIndex]?.char || levelConfig.characters[0].char;
  const characterEntry = levelConfig.characters[charIndex] || levelConfig.characters[0];

  const { quizState, startQuiz, onCorrectStroke, onMistake, onComplete, resetQuiz } = useQuiz();
  const { speakStrokeName, playCompletionSound } = useStrokeAudio(character);

  // Save score on quiz complete
  useEffect(() => {
    if (quizState.completed && quizState.score > 0) {
      setScores(saveScore(character, quizState.score));
    }
  }, [quizState.completed, quizState.score, character]);

  const handleSelectLevel = useCallback((lvl: number) => {
    setLevel(lvl);
    setCharIndex(0);
    setMode('demo');
    resetQuiz();
    setLastEvent(null);
    setPage('practice');
  }, [resetQuiz]);

  const handleBackToLevels = useCallback(() => {
    setPage('levelSelect');
    resetQuiz();
    setLastEvent(null);
  }, [resetQuiz]);

  const handleModeChange = useCallback((newMode: AppMode) => {
    setMode(newMode);
    resetQuiz();
    setLastEvent(null);
  }, [resetQuiz]);

  // Stable quiz callbacks ref
  const quizCallbacksRef = useRef({
    onCorrectStroke: (_data: any) => {},
    onMistake: (_data: any) => {},
    onComplete: (_summary: any) => {},
  });

  useEffect(() => {
    quizCallbacksRef.current = {
      onCorrectStroke: (data: any) => {
        onCorrectStroke(data);
        setLastEvent('correct');
        speakStrokeName(data.strokeNum);
      },
      onMistake: (data: any) => {
        onMistake(data);
        setLastEvent('mistake');
        speakStrokeName(data.strokeNum);
      },
      onComplete: (summary: any) => {
        onComplete(summary);
        setLastEvent(null);
        playCompletionSound();
      },
    };
  }, [onCorrectStroke, onMistake, onComplete, speakStrokeName, playCompletionSound]);

  const [quizCallbacks] = useState(() => ({
    onCorrectStroke: (data: any) => quizCallbacksRef.current.onCorrectStroke(data),
    onMistake: (data: any) => quizCallbacksRef.current.onMistake(data),
    onComplete: (summary: any) => quizCallbacksRef.current.onComplete(summary),
  }));

  const handleRetry = useCallback(() => {
    resetQuiz();
    setLastEvent(null);
    setMode('demo');
    setTimeout(() => setMode('practice'), 50);
  }, [resetQuiz]);

  const handlePrev = useCallback(() => {
    if (charIndex > 0) {
      setCharIndex(charIndex - 1);
      resetQuiz();
      setLastEvent(null);
      setMode('demo');
    }
  }, [charIndex, resetQuiz]);

  const handleNext = useCallback(() => {
    const chars = getLevelConfig(level).characters;
    const nextIdx = charIndex + 1;

    if (nextIdx >= chars.length) {
      // Level completed!
      const newCompleted = saveCompletedLevel(level);
      setCompletedLevels(newCompleted);
      setPage('congrats');
    } else {
      setCharIndex(nextIdx);
      resetQuiz();
      setLastEvent(null);
      setMode('demo');
    }
  }, [level, charIndex, resetQuiz]);

  // Auto-advance after quiz completion (2s delay)
  useEffect(() => {
    if (quizState.completed && mode === 'practice') {
      const timer = setTimeout(() => {
        handleNext();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [quizState.completed, mode, handleNext]);

  const handleContinueToNextLevel = useCallback(() => {
    const nextLevel = Math.min(level + 1, TOTAL_LEVEL_COUNT);
    setLevel(nextLevel);
    setCharIndex(0);
    setMode('demo');
    resetQuiz();
    setLastEvent(null);
    setPage('practice');
  }, [level, resetQuiz]);

  const handleReadWords = useCallback(() => {
    if (!characterEntry) return;
    const parts: string[] = [characterEntry.char];
    if (characterEntry.words) parts.push(characterEntry.words.join('，'));
    if (characterEntry.sentence) parts.push(characterEntry.sentence);
    speakChinese(parts.join('。'));
  }, [characterEntry]);

  // Level select page
  if (page === 'levelSelect') {
    return (
      <LevelSelect
        onSelectLevel={handleSelectLevel}
        completedLevels={completedLevels}
        scores={scores}
      />
    );
  }

  // Congratulations page
  if (page === 'congrats') {
    return (
      <Congratulations
        level={level}
        onContinue={handleContinueToNextLevel}
        onBackToLevels={handleBackToLevels}
      />
    );
  }

  // Practice page (no sidebar)
  return (
    <div className="app-layout">
      <header className="app-header">
        <button className="back-btn" onClick={handleBackToLevels}>
          ← 选关
        </button>
        <h1 className="app-title">
          <span className="app-title-zh">第{level}关 · {levelConfig.description}</span>
          <span className="app-title-progress">{charIndex + 1}/{levelConfig.characters.length}</span>
        </h1>
      </header>
      <div className="app-content app-content--no-sidebar">
        <main className="app-main">
          <WritingArea
            character={character}
            level={level}
            mode={mode}
            canvasSize={canvasSize}
            quizState={quizState}
            onModeChange={handleModeChange}
            quizCallbacks={quizCallbacks}
            onQuizStart={startQuiz}
            onStrokeAnimate={speakStrokeName}
            onReadWords={handleReadWords}
            onPrev={charIndex > 0 ? handlePrev : undefined}
            onNext={handleNext}
          />
        </main>
        <aside className="app-feedback">
          <FeedbackPanel
            mode={mode}
            quizState={quizState}
            lastEvent={lastEvent}
            characterEntry={characterEntry}
            onRetry={handleRetry}
            onNext={handleNext}
          />
        </aside>
      </div>
    </div>
  );
}

import { useState, useCallback, useEffect, useRef } from 'react';
import type { DifficultyLevel, AppMode } from './types';
import { characterLibrary } from './data/characterLibrary';
import { useQuiz } from './hooks/useQuiz';
import { useResponsive } from './hooks/useResponsive';
import { AppLayout } from './components/Layout/AppLayout';
import { Sidebar } from './components/Sidebar/Sidebar';
import { WritingArea } from './components/WritingArea/WritingArea';
import { FeedbackPanel } from './components/FeedbackPanel/FeedbackPanel';

import './styles/variables.css';
import './styles/animations.css';

function loadScores(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem('hanzi-scores') || '{}');
  } catch {
    return {};
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

export default function App() {
  const [level, setLevel] = useState<DifficultyLevel>('beginner');
  const [character, setCharacter] = useState('一');
  const [mode, setMode] = useState<AppMode>('demo');
  const [scores, setScores] = useState<Record<string, number>>(loadScores);
  const [lastEvent, setLastEvent] = useState<'correct' | 'mistake' | null>(null);
  const { canvasSize } = useResponsive();

  const { quizState, startQuiz, onCorrectStroke, onMistake, onComplete, resetQuiz } = useQuiz();

  // Save score on quiz complete
  useEffect(() => {
    if (quizState.completed && quizState.score > 0) {
      setScores(saveScore(character, quizState.score));
    }
  }, [quizState.completed, quizState.score, character]);

  const handleLevelChange = useCallback((newLevel: DifficultyLevel) => {
    setLevel(newLevel);
    const firstChar = characterLibrary[newLevel].characters[0].char;
    setCharacter(firstChar);
    setMode('demo');
    resetQuiz();
    setLastEvent(null);
  }, [resetQuiz]);

  const handleCharacterChange = useCallback((char: string) => {
    setCharacter(char);
    setMode('demo');
    resetQuiz();
    setLastEvent(null);
  }, [resetQuiz]);

  const handleModeChange = useCallback((newMode: AppMode) => {
    setMode(newMode);
    resetQuiz();
    setLastEvent(null);
  }, [resetQuiz]);

  // Stable quiz callbacks ref to avoid re-creating writer on every render
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
      },
      onMistake: (data: any) => {
        onMistake(data);
        setLastEvent('mistake');
      },
      onComplete: (summary: any) => {
        onComplete(summary);
        setLastEvent(null);
      },
    };
  }, [onCorrectStroke, onMistake, onComplete]);

  // Stable callbacks object that doesn't change identity
  const [quizCallbacks] = useState(() => ({
    onCorrectStroke: (data: any) => quizCallbacksRef.current.onCorrectStroke(data),
    onMistake: (data: any) => quizCallbacksRef.current.onMistake(data),
    onComplete: (summary: any) => quizCallbacksRef.current.onComplete(summary),
  }));

  const handleRetry = useCallback(() => {
    resetQuiz();
    setLastEvent(null);
    // Force re-mount by toggling mode
    setMode('demo');
    setTimeout(() => setMode('practice'), 50);
  }, [resetQuiz]);

  const handleNext = useCallback(() => {
    const chars = characterLibrary[level].characters;
    const idx = chars.findIndex(c => c.char === character);
    const nextIdx = (idx + 1) % chars.length;
    setCharacter(chars[nextIdx].char);
    resetQuiz();
    setLastEvent(null);
    setMode('demo');
  }, [level, character, resetQuiz]);

  return (
    <AppLayout
      sidebar={
        <Sidebar
          selectedLevel={level}
          selectedCharacter={character}
          onSelectLevel={handleLevelChange}
          onSelectCharacter={handleCharacterChange}
          scores={scores}
        />
      }
      writingArea={
        <WritingArea
          character={character}
          level={level}
          mode={mode}
          canvasSize={canvasSize}
          quizState={quizState}
          onModeChange={handleModeChange}
          quizCallbacks={quizCallbacks}
          onQuizStart={startQuiz}
        />
      }
      feedbackPanel={
        <FeedbackPanel
          mode={mode}
          quizState={quizState}
          lastEvent={lastEvent}
          character={character}
          onRetry={handleRetry}
          onNext={handleNext}
        />
      }
    />
  );
}

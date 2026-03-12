import { useState, useCallback, useRef } from 'react';
import type { StrokeData } from 'hanzi-writer';
import type { QuizState } from '../types';
import { calculateScore } from '../utils/scoring';

const initialQuizState: QuizState = {
  isActive: false,
  currentStroke: 0,
  totalStrokes: 0,
  mistakesPerStroke: [],
  totalMistakes: 0,
  score: 0,
  completed: false,
};

export function useQuiz() {
  const [quizState, setQuizState] = useState<QuizState>(initialQuizState);
  const mistakesRef = useRef<number[]>([]);

  const startQuiz = useCallback((totalStrokes: number) => {
    mistakesRef.current = new Array(totalStrokes).fill(0);
    setQuizState({
      isActive: true,
      currentStroke: 0,
      totalStrokes,
      mistakesPerStroke: new Array(totalStrokes).fill(0),
      totalMistakes: 0,
      score: 0,
      completed: false,
    });
  }, []);

  const onCorrectStroke = useCallback((_data: StrokeData) => {
    setQuizState(prev => ({
      ...prev,
      currentStroke: prev.currentStroke + 1,
      mistakesPerStroke: [...mistakesRef.current],
    }));
  }, []);

  const onMistake = useCallback((data: StrokeData) => {
    mistakesRef.current[data.strokeNum] = data.mistakesOnStroke;
    setQuizState(prev => ({
      ...prev,
      totalMistakes: data.totalMistakes,
      mistakesPerStroke: [...mistakesRef.current],
    }));
  }, []);

  const onComplete = useCallback((summary: { character: string; totalMistakes: number }) => {
    setQuizState(prev => {
      const result = calculateScore(prev.totalStrokes, mistakesRef.current);
      return {
        ...prev,
        isActive: false,
        completed: true,
        totalMistakes: summary.totalMistakes,
        score: result.score,
        currentStroke: prev.totalStrokes,
      };
    });
  }, []);

  const resetQuiz = useCallback(() => {
    mistakesRef.current = [];
    setQuizState(initialQuizState);
  }, []);

  return {
    quizState,
    startQuiz,
    onCorrectStroke,
    onMistake,
    onComplete,
    resetQuiz,
  };
}

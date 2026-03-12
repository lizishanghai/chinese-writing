import { useState, useEffect, useMemo } from 'react';
import type { QuizState } from '../../types';
import { calculateScore } from '../../utils/scoring';
import { getCorrectMessage, getMistakeMessage, getCompletionMessage } from '../../utils/encouragement';
import './FeedbackPanel.css';

interface EncouragementBannerProps {
  quizState: QuizState;
  lastEvent: 'correct' | 'mistake' | null;
}

export function EncouragementBanner({ quizState, lastEvent }: EncouragementBannerProps) {
  const [message, setMessage] = useState<{ en: string; zh: string } | null>(null);
  const [animKey, setAnimKey] = useState(0);

  const grade = useMemo(() => {
    if (!quizState.completed) return null;
    return calculateScore(quizState.totalStrokes, quizState.mistakesPerStroke).grade;
  }, [quizState.completed, quizState.totalStrokes, quizState.mistakesPerStroke]);

  useEffect(() => {
    if (quizState.completed && grade) {
      setMessage(getCompletionMessage(grade));
      setAnimKey(k => k + 1);
    } else if (lastEvent === 'correct') {
      setMessage(getCorrectMessage());
      setAnimKey(k => k + 1);
    } else if (lastEvent === 'mistake') {
      setMessage(getMistakeMessage());
      setAnimKey(k => k + 1);
    }
  }, [lastEvent, quizState.completed, grade]);

  if (!message) return null;

  const isCompletion = quizState.completed;
  const isMistake = lastEvent === 'mistake' && !isCompletion;

  return (
    <div
      key={animKey}
      className={`encouragement ${
        isCompletion ? 'encouragement--complete' : isMistake ? 'encouragement--mistake' : 'encouragement--correct'
      } animate-fade-in-up`}
    >
      <div className="encouragement-en">{message.en}</div>
      <div className="encouragement-zh">{message.zh}</div>
    </div>
  );
}

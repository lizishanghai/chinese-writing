import { useMemo } from 'react';
import type { QuizState } from '../../types';
import { calculateScore } from '../../utils/scoring';
import { StarRating } from '../common/StarRating';
import './FeedbackPanel.css';

interface ScoreDisplayProps {
  quizState: QuizState;
}

export function ScoreDisplay({ quizState }: ScoreDisplayProps) {
  const result = useMemo(() => {
    if (!quizState.completed) return null;
    return calculateScore(quizState.totalStrokes, quizState.mistakesPerStroke);
  }, [quizState.completed, quizState.totalStrokes, quizState.mistakesPerStroke]);

  if (!result) return null;

  return (
    <div className="score-display animate-fade-in-up">
      <StarRating stars={result.stars} animated />
      <div className="score-number">{result.score}</div>
      <div className="score-label">分数 Score</div>
      {result.perfectStrokes > 0 && (
        <div className="score-perfect">
          {result.perfectStrokes} perfect stroke{result.perfectStrokes > 1 ? 's' : ''}!
        </div>
      )}
    </div>
  );
}

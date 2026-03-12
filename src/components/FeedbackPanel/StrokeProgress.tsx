import type { QuizState } from '../../types';
import './FeedbackPanel.css';

interface StrokeProgressProps {
  quizState: QuizState;
}

export function StrokeProgress({ quizState }: StrokeProgressProps) {
  const { totalStrokes, currentStroke, mistakesPerStroke } = quizState;

  if (totalStrokes === 0) return null;

  return (
    <div className="stroke-progress">
      <h3 className="stroke-progress-title">笔画进度 Strokes</h3>
      <div className="stroke-progress-bar">
        <div
          className="stroke-progress-fill"
          style={{ width: `${(currentStroke / totalStrokes) * 100}%` }}
        />
      </div>
      <div className="stroke-progress-label">
        {currentStroke} / {totalStrokes}
      </div>
      <div className="stroke-dots">
        {Array.from({ length: totalStrokes }, (_, i) => {
          const done = i < currentStroke;
          const mistakes = mistakesPerStroke[i] || 0;
          return (
            <span
              key={i}
              className={`stroke-dot ${
                done
                  ? mistakes === 0
                    ? 'stroke-dot--perfect'
                    : 'stroke-dot--done'
                  : i === currentStroke
                  ? 'stroke-dot--current'
                  : ''
              }`}
              title={done ? `Stroke ${i + 1}: ${mistakes} mistake(s)` : `Stroke ${i + 1}`}
            >
              {done ? (mistakes === 0 ? '✓' : '~') : i + 1}
            </span>
          );
        })}
      </div>
    </div>
  );
}

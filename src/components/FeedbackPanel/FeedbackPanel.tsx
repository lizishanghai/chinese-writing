import type { AppMode, QuizState, CharacterEntry } from '../../types';
import { StrokeProgress } from './StrokeProgress';
import { ScoreDisplay } from './ScoreDisplay';
import { EncouragementBanner } from './EncouragementBanner';
import './FeedbackPanel.css';

interface FeedbackPanelProps {
  mode: AppMode;
  quizState: QuizState;
  lastEvent: 'correct' | 'mistake' | null;
  characterEntry?: CharacterEntry;
  onRetry: () => void;
  onNext: () => void;
}

export function FeedbackPanel({
  mode,
  quizState,
  lastEvent,
  characterEntry,
  onRetry,
  onNext,
}: FeedbackPanelProps) {
  return (
    <div className="feedback-panel">
      {mode === 'demo' ? (
        <div className="feedback-demo">
          {characterEntry?.emoji && (
            <div className="char-info-emoji">{characterEntry.emoji}</div>
          )}
          {characterEntry?.words && characterEntry.words.length > 0 && (
            <div className="char-info-section">
              <h4 className="char-info-label">组词</h4>
              <div className="char-info-words">
                {characterEntry.words.map((word, i) => (
                  <span key={i} className="char-info-word-pill">{word}</span>
                ))}
              </div>
            </div>
          )}
          {characterEntry?.sentence && (
            <div className="char-info-section">
              <h4 className="char-info-label">造句</h4>
              <p className="char-info-sentence">{characterEntry.sentence}</p>
            </div>
          )}
          <div className="char-info-hint">
            <p>观看动画学习笔顺，然后切换到练习模式！</p>
          </div>
        </div>
      ) : (
        <>
          <StrokeProgress quizState={quizState} />
          <EncouragementBanner quizState={quizState} lastEvent={lastEvent} />
          <ScoreDisplay quizState={quizState} />

          {quizState.completed && (
            <div className="feedback-actions">
              <button className="ctrl-btn ctrl-btn--primary" onClick={onRetry}>
                🔄 再试一次 Retry
              </button>
              <button className="ctrl-btn" onClick={onNext}>
                ➡️ 下一个 Next
              </button>
            </div>
          )}

          {!quizState.isActive && !quizState.completed && (
            <div className="feedback-idle">
              <p>Switch to Practice mode and start writing!</p>
              <p className="feedback-idle-zh">切换到练习模式开始写字！</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

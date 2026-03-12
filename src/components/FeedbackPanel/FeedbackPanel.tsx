import type { AppMode, QuizState } from '../../types';
import { StrokeProgress } from './StrokeProgress';
import { ScoreDisplay } from './ScoreDisplay';
import { EncouragementBanner } from './EncouragementBanner';
import './FeedbackPanel.css';

interface FeedbackPanelProps {
  mode: AppMode;
  quizState: QuizState;
  lastEvent: 'correct' | 'mistake' | null;
  character: string;
  onRetry: () => void;
  onNext: () => void;
}

export function FeedbackPanel({
  mode,
  quizState,
  lastEvent,
  character,
  onRetry,
  onNext,
}: FeedbackPanelProps) {
  return (
    <div className="feedback-panel">
      {mode === 'demo' ? (
        <div className="feedback-demo">
          <div className="feedback-demo-icon">👁️</div>
          <h3>演示模式</h3>
          <p>Watch the animation to learn stroke order, then switch to Practice mode!</p>
          <p className="feedback-demo-zh">观看动画学习笔顺，然后切换到练习模式！</p>
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

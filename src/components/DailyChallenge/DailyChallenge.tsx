import { useMemo } from 'react';
import { getDailyChallengeState, getTodayStr } from '../../utils/dailyChallengeGenerator';
import './DailyChallenge.css';

interface DailyChallengeProps {
  onStart: () => void;
  onBack: () => void;
}

export function DailyChallenge({ onStart, onBack }: DailyChallengeProps) {
  const state = useMemo(() => getDailyChallengeState(), []);
  const today = getTodayStr();
  const todayCompleted = state.lastDate === today;
  const todayScore = state.scores[today];

  // Format date for display
  const dateObj = new Date();
  const dateDisplay = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const dayOfWeek = `星期${weekdays[dateObj.getDay()]}`;

  // Best score across all days
  const allScores = Object.values(state.scores);
  const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0;

  return (
    <div className="daily-page">
      <div className="daily-header">
        <button className="daily-back-btn" onClick={onBack}>← 返回</button>
        <h1 className="daily-title">🏆 每日挑战</h1>
      </div>

      <div className="daily-date-card">
        <div className="daily-date">{dateDisplay}</div>
        <div className="daily-weekday">{dayOfWeek}</div>
      </div>

      <div className="daily-stats">
        <div className="daily-stat">
          <div className="daily-stat-value">🔥 {state.streak}</div>
          <div className="daily-stat-label">连续打卡</div>
        </div>
        <div className="daily-stat">
          <div className="daily-stat-value">⭐ {bestScore}%</div>
          <div className="daily-stat-label">最佳成绩</div>
        </div>
        <div className="daily-stat">
          <div className="daily-stat-value">📅 {allScores.length}</div>
          <div className="daily-stat-label">累计天数</div>
        </div>
      </div>

      {todayCompleted ? (
        <div className="daily-completed-card">
          <div className="daily-completed-emoji">✅</div>
          <div className="daily-completed-score">今日得分：{todayScore}%</div>
          <div className="daily-completed-text">
            {todayScore! >= 80 ? '太棒了！' : '继续加油！'}
          </div>
          <div className="daily-completed-hint">明天再来挑战吧！</div>
        </div>
      ) : (
        <div className="daily-start-card">
          <div className="daily-start-emoji">💪</div>
          <div className="daily-start-text">
            今天的挑战等着你！
          </div>
          <div className="daily-start-desc">
            10道综合题（认字 + 听力 + 阅读理解）
          </div>
          <button className="daily-start-btn" onClick={onStart}>
            🚀 开始今日挑战
          </button>
        </div>
      )}
    </div>
  );
}

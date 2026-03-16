import { characterLevels, TOTAL_LEVEL_COUNT } from '../../data/characterLibrary';
import './LevelSelect.css';

interface LevelSelectProps {
  onSelectLevel: (level: number) => void;
  completedLevels: Set<number>;
  scores: Record<string, number>;
  onBack: () => void;
}

export function LevelSelect({ onSelectLevel, completedLevels, scores, onBack }: LevelSelectProps) {
  return (
    <div className="level-select">
      <div className="level-select-header">
        <button className="level-select-back-btn" onClick={onBack}>← 首页</button>
        <h2 className="level-select-title">
          <span>✏️</span> 写字小课堂
        </h2>
        <p className="level-select-subtitle">选择关卡开始练习 Choose a level</p>
      </div>
      <div className="level-grid">
        {characterLevels.map((config, i) => {
          const levelNum = i + 1;
          const isCompleted = completedLevels.has(levelNum);
          const charsInLevel = config.characters;
          const levelScore = charsInLevel.reduce((sum, c) => sum + (scores[c.char] || 0), 0);
          const hasStarted = charsInLevel.some(c => scores[c.char] > 0);

          return (
            <button
              key={levelNum}
              className={`level-card ${isCompleted ? 'level-card--completed' : ''} ${hasStarted && !isCompleted ? 'level-card--started' : ''}`}
              onClick={() => onSelectLevel(levelNum)}
            >
              <div className="level-card-num">
                {isCompleted ? '💎' : `${levelNum}`}
              </div>
              <div className="level-card-name">{config.description}</div>
              <div className="level-card-chars">
                {charsInLevel.map(c => c.char).join(' ')}
              </div>
              {hasStarted && (
                <div className="level-card-progress">
                  {Math.round(levelScore / charsInLevel.length)}%
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="level-select-footer">
        <p>{TOTAL_LEVEL_COUNT} 关 · 100 字</p>
      </div>
    </div>
  );
}

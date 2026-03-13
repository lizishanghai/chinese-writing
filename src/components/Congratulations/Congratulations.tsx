import { useEffect, useState } from 'react';
import { getLevelConfig, TOTAL_LEVEL_COUNT } from '../../data/characterLibrary';
import './Congratulations.css';

interface CongratulationsProps {
  level: number;
  onContinue: () => void;
  onBackToLevels: () => void;
}

export function Congratulations({ level, onContinue, onBackToLevels }: CongratulationsProps) {
  const [showDiamond, setShowDiamond] = useState(false);
  const config = getLevelConfig(level);
  const isLastLevel = level >= TOTAL_LEVEL_COUNT;

  useEffect(() => {
    const timer = setTimeout(() => setShowDiamond(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="congrats">
      <div className="congrats-card">
        <div className={`congrats-diamond ${showDiamond ? 'congrats-diamond--show' : ''}`}>
          💎
        </div>
        <h2 className="congrats-title">恭喜过关！</h2>
        <p className="congrats-subtitle">Congratulations!</p>
        <div className="congrats-level">
          第{level}关 · {config.description}
        </div>
        <div className="congrats-chars">
          {config.characters.map(c => (
            <span key={c.char} className="congrats-char">{c.char}</span>
          ))}
        </div>
        <div className="congrats-actions">
          {!isLastLevel ? (
            <button className="ctrl-btn ctrl-btn--primary congrats-btn" onClick={onContinue}>
              ➡️ 下一关 Next Level
            </button>
          ) : (
            <div className="congrats-finish">🎉 全部完成！All levels complete!</div>
          )}
          <button className="ctrl-btn congrats-btn" onClick={onBackToLevels}>
            🏠 返回选关 Back to Levels
          </button>
        </div>
      </div>
    </div>
  );
}

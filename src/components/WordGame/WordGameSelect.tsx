import { characterLevels } from '../../data/characterLibrary';
import './WordGame.css';

interface WordGameSelectProps {
  completedLevels: Set<number>;
  onStart: (levels: number[]) => void;
  onBack: () => void;
}

export function WordGameSelect({ completedLevels, onStart, onBack }: WordGameSelectProps) {
  const completedArr = Array.from(completedLevels).sort((a, b) => a - b);

  return (
    <div className="wordgame-select">
      <div className="wordgame-select-header">
        <button className="wordgame-back-btn" onClick={onBack}>← 返回</button>
        <h1 className="wordgame-select-title">🧩 组词游戏</h1>
      </div>
      <p className="wordgame-select-subtitle">选择关卡，用字组成词语</p>

      <button
        className="wordgame-start-all"
        onClick={() => onStart(completedArr)}
      >
        🚀 全部已学关卡 ({completedArr.length}关)
      </button>

      <div className="wordgame-level-grid">
        {completedArr.map(lvl => {
          const config = characterLevels[lvl - 1];
          return (
            <button
              key={lvl}
              className="wordgame-level-card"
              onClick={() => onStart([lvl])}
            >
              <div className="wordgame-level-num">第{lvl}关</div>
              <div className="wordgame-level-name">{config.description}</div>
              <div className="wordgame-level-chars">
                {config.characters.map(c => c.char).join(' ')}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

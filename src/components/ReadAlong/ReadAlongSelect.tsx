import { characterLevels } from '../../data/characterLibrary';
import './ReadAlong.css';

interface ReadAlongSelectProps {
  completedLevels: Set<number>;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

export function ReadAlongSelect({ completedLevels, onSelectLevel, onBack }: ReadAlongSelectProps) {
  const completedArr = Array.from(completedLevels).sort((a, b) => a - b);

  return (
    <div className="readalong-select">
      <div className="readalong-select-header">
        <button className="readalong-back-btn" onClick={onBack}>← 返回</button>
        <h1 className="readalong-select-title">🎤 跟读练习</h1>
      </div>
      <p className="readalong-select-subtitle">选择关卡，跟着读句子</p>

      <div className="readalong-level-grid">
        {completedArr.map(lvl => {
          const config = characterLevels[lvl - 1];
          return (
            <button
              key={lvl}
              className="readalong-level-card"
              onClick={() => onSelectLevel(lvl)}
            >
              <div className="readalong-level-num">第{lvl}关</div>
              <div className="readalong-level-name">{config.description}</div>
              <div className="readalong-level-chars">
                {config.characters.map(c => c.char).join(' ')}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

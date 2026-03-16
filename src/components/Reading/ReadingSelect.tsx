import { characterLevels } from '../../data/characterLibrary';
import './Reading.css';

interface ReadingSelectProps {
  completedLevels: Set<number>;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

export function ReadingSelect({ completedLevels, onSelectLevel, onBack }: ReadingSelectProps) {
  const completedArr = Array.from(completedLevels).sort((a, b) => a - b);

  return (
    <div className="reading-select">
      <div className="reading-select-header">
        <button className="reading-back-btn" onClick={onBack}>← 返回</button>
        <h1 className="reading-select-title">📖 阅读小课堂</h1>
      </div>
      <p className="reading-select-subtitle">选择一个关卡开始阅读</p>

      <div className="reading-level-grid">
        {completedArr.map(lvl => {
          const config = characterLevels[lvl - 1];
          return (
            <button
              key={lvl}
              className="reading-level-card"
              onClick={() => onSelectLevel(lvl)}
            >
              <div className="reading-level-num">第{lvl}关</div>
              <div className="reading-level-name">{config.description}</div>
              <div className="reading-level-chars">
                {config.characters.map(c => c.char).join(' ')}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import type { DifficultyLevel } from '../../types';
import { characterLevels } from '../../data/characterLibrary';
import './Sidebar.css';

interface LevelSelectorProps {
  selectedLevel: DifficultyLevel;
  onSelectLevel: (level: DifficultyLevel) => void;
}

export function LevelSelector({ selectedLevel, onSelectLevel }: LevelSelectorProps) {
  return (
    <div className="level-selector">
      {characterLevels.map((config, i) => {
        const levelNum = i + 1;
        return (
          <button
            key={levelNum}
            className={`level-tab ${selectedLevel === levelNum ? 'level-tab--active' : ''}`}
            onClick={() => onSelectLevel(levelNum)}
          >
            <span className="level-tab-label">{config.labelZh}</span>
          </button>
        );
      })}
    </div>
  );
}

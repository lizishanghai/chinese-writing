import type { DifficultyLevel } from '../../types';
import { characterLibrary } from '../../data/characterLibrary';
import './Sidebar.css';

interface LevelSelectorProps {
  selectedLevel: DifficultyLevel;
  onSelectLevel: (level: DifficultyLevel) => void;
}

const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];

const levelEmoji: Record<DifficultyLevel, string> = {
  beginner: '⭐',
  intermediate: '🌟',
  advanced: '💫',
};

export function LevelSelector({ selectedLevel, onSelectLevel }: LevelSelectorProps) {
  return (
    <div className="level-selector">
      {levels.map(level => {
        const config = characterLibrary[level];
        return (
          <button
            key={level}
            className={`level-tab ${selectedLevel === level ? 'level-tab--active' : ''}`}
            onClick={() => onSelectLevel(level)}
          >
            <span className="level-tab-emoji">{levelEmoji[level]}</span>
            <span className="level-tab-label">{config.labelZh}</span>
          </button>
        );
      })}
    </div>
  );
}

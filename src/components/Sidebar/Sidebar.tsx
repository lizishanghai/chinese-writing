import type { DifficultyLevel } from '../../types';
import { getLevelConfig } from '../../data/characterLibrary';
import { LevelSelector } from './LevelSelector';
import { CharacterList } from './CharacterList';
import './Sidebar.css';

interface SidebarProps {
  selectedLevel: DifficultyLevel;
  selectedCharacter: string;
  onSelectLevel: (level: DifficultyLevel) => void;
  onSelectCharacter: (char: string) => void;
  scores: Record<string, number>;
}

export function Sidebar({
  selectedLevel,
  selectedCharacter,
  onSelectLevel,
  onSelectCharacter,
  scores,
}: SidebarProps) {
  const levelConfig = getLevelConfig(selectedLevel);

  return (
    <div className="sidebar">
      <LevelSelector selectedLevel={selectedLevel} onSelectLevel={onSelectLevel} />
      <div className="sidebar-info">
        <span className="sidebar-info-label">{levelConfig.description}</span>
        <span className="sidebar-info-count">{levelConfig.characters.length} characters</span>
      </div>
      <CharacterList
        characters={levelConfig.characters}
        selectedCharacter={selectedCharacter}
        onSelectCharacter={onSelectCharacter}
        scores={scores}
      />
    </div>
  );
}

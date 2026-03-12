import type { CharacterEntry } from '../../types';
import { CharacterCard } from '../common/CharacterCard';
import './Sidebar.css';

interface CharacterListProps {
  characters: CharacterEntry[];
  selectedCharacter: string;
  onSelectCharacter: (char: string) => void;
  scores: Record<string, number>;
}

export function CharacterList({
  characters,
  selectedCharacter,
  onSelectCharacter,
  scores,
}: CharacterListProps) {
  return (
    <div className="char-list">
      {characters.map(entry => (
        <CharacterCard
          key={entry.char}
          entry={entry}
          isSelected={entry.char === selectedCharacter}
          onClick={() => onSelectCharacter(entry.char)}
          bestScore={scores[entry.char]}
        />
      ))}
    </div>
  );
}

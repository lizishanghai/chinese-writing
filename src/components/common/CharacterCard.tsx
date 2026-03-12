import type { CharacterEntry } from '../../types';
import './CharacterCard.css';

interface CharacterCardProps {
  entry: CharacterEntry;
  isSelected: boolean;
  onClick: () => void;
  bestScore?: number;
}

export function CharacterCard({ entry, isSelected, onClick, bestScore }: CharacterCardProps) {
  return (
    <button
      className={`char-card ${isSelected ? 'char-card--selected' : ''}`}
      onClick={onClick}
      title={`${entry.pinyin} - ${entry.meaning}`}
    >
      <span className="char-card-char">{entry.char}</span>
      <span className="char-card-pinyin">{entry.pinyin}</span>
      {bestScore !== undefined && bestScore > 0 && (
        <span className="char-card-score">
          {bestScore >= 90 ? '⭐' : bestScore >= 60 ? '✓' : ''}
        </span>
      )}
    </button>
  );
}

import type { AppMode } from '../../types';
import './WritingArea.css';

interface ModeToggleProps {
  mode: AppMode;
  onToggle: (mode: AppMode) => void;
}

export function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  return (
    <div className="mode-toggle">
      <button
        className={`mode-btn ${mode === 'demo' ? 'mode-btn--active' : ''}`}
        onClick={() => onToggle('demo')}
      >
        <span className="mode-btn-icon">👁️</span>
        <span>演示 Demo</span>
      </button>
      <button
        className={`mode-btn ${mode === 'practice' ? 'mode-btn--active' : ''}`}
        onClick={() => onToggle('practice')}
      >
        <span className="mode-btn-icon">✍️</span>
        <span>练习 Practice</span>
      </button>
    </div>
  );
}

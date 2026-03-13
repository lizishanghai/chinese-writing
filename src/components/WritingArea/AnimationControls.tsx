import './WritingArea.css';

interface AnimationControlsProps {
  onAnimate: () => void;
  onReadWords?: () => void;
  isDemo: boolean;
}

export function AnimationControls({ onAnimate, onReadWords, isDemo }: AnimationControlsProps) {
  if (!isDemo) return null;

  return (
    <div className="animation-controls">
      <button className="ctrl-btn" onClick={onAnimate}>
        <span>✏️</span> 写字
      </button>
      {onReadWords && (
        <button className="ctrl-btn" onClick={onReadWords}>
          <span>🔊</span> 朗读
        </button>
      )}
    </div>
  );
}

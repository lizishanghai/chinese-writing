import './WritingArea.css';

interface AnimationControlsProps {
  onAnimate: () => void;
  onLoop: () => void;
  isDemo: boolean;
}

export function AnimationControls({ onAnimate, onLoop, isDemo }: AnimationControlsProps) {
  if (!isDemo) return null;

  return (
    <div className="animation-controls">
      <button className="ctrl-btn ctrl-btn--primary" onClick={onAnimate}>
        <span>▶️</span> 播放 Play
      </button>
      <button className="ctrl-btn" onClick={onLoop}>
        <span>🔁</span> 循环 Loop
      </button>
    </div>
  );
}

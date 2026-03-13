import { useState, useCallback } from 'react';
import './WritingArea.css';

interface AnimationControlsProps {
  onAnimate: () => void;
  onReadWords?: () => void;
  onNext?: () => void;
  isDemo: boolean;
}

export function AnimationControls({ onAnimate, onReadWords, onNext, isDemo }: AnimationControlsProps) {
  const [isReading, setIsReading] = useState(false);

  const handleRead = useCallback(() => {
    if (!onReadWords) return;
    setIsReading(true);
    onReadWords();
    // Listen for speech end to remove highlight
    const check = () => {
      if (!speechSynthesis.speaking) {
        setIsReading(false);
      } else {
        setTimeout(check, 200);
      }
    };
    setTimeout(check, 300);
  }, [onReadWords]);

  if (!isDemo) return null;

  return (
    <div className="animation-controls">
      <button className="ctrl-btn ctrl-btn--primary" onClick={onAnimate}>
        <span>✏️</span> 写字
      </button>
      {onReadWords && (
        <button
          className={`ctrl-btn${isReading ? ' ctrl-btn--active' : ''}`}
          onClick={handleRead}
        >
          <span>🔊</span> 朗读
        </button>
      )}
      {onNext && (
        <button className="ctrl-btn" onClick={onNext}>
          <span>➡️</span> 下一个
        </button>
      )}
    </div>
  );
}

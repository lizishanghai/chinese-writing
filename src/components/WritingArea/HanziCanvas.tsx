import { useRef, useEffect } from 'react';
import type { AppMode } from '../../types';
import type { QuizCallbacks } from '../../hooks/useHanziWriter';
import { useHanziWriter } from '../../hooks/useHanziWriter';
import './WritingArea.css';

interface HanziCanvasProps {
  character: string;
  mode: AppMode;
  canvasSize: number;
  quizCallbacks: QuizCallbacks;
  onWriterReady: (controls: {
    animate: () => void;
    animateWithAudio: (onStrokeStart?: (strokeNum: number) => void) => Promise<void>;
    loopAnimation: () => void;
    startQuiz: (callbacks: QuizCallbacks) => void;
    totalStrokes: number;
  }) => void;
}

export function HanziCanvas({
  character,
  mode,
  canvasSize,
  quizCallbacks,
  onWriterReady,
}: HanziCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDemo = mode === 'demo';

  const {
    isLoading,
    totalStrokes,
    strokePaths,
    animate,
    animateWithAudio,
    loopAnimation,
    startQuiz,
  } = useHanziWriter(containerRef, character, {
    width: canvasSize,
    height: canvasSize,
    showCharacter: isDemo,
    showOutline: true,
    strokeColor: '#3B82F6',
    outlineColor: isDemo ? '#E0E7FF' : '#F1F5F9',
    drawingColor: '#F59E0B',
    highlightColor: '#FCD34D',
    drawingWidth: 6,
    strokeAnimationSpeed: 0.8,
    delayBetweenStrokes: 300,
  });

  // Notify parent when writer is ready
  useEffect(() => {
    if (!isLoading && totalStrokes > 0) {
      onWriterReady({ animate, animateWithAudio, loopAnimation, startQuiz, totalStrokes });
    }
  }, [isLoading, totalStrokes, animate, animateWithAudio, loopAnimation, startQuiz, onWriterReady]);

  // Auto-start quiz when in practice mode
  useEffect(() => {
    if (!isLoading && mode === 'practice' && totalStrokes > 0) {
      startQuiz(quizCallbacks);
    }
  }, [isLoading, mode, character, totalStrokes, startQuiz, quizCallbacks]);

  // Match HanziWriter's internal Positioner: CHARACTER_BOUNDS = [{x:0,y:-124}, {x:1024,y:900}]
  const padding = 20;
  const scale = (canvasSize - padding * 2) / 1024;
  const yOffset = 124 * scale + padding; // from.y = -124, so -(-124)*scale + padding
  const translateY = canvasSize - yOffset;

  return (
    <div className={`hanzi-canvas-wrapper ${!isDemo ? 'hanzi-canvas-wrapper--practice' : ''}`}>
      {/* 田字格 grid background */}
      <div
        className="hanzi-canvas-grid"
        style={{ width: canvasSize, height: canvasSize }}
      >
        <div className="grid-line grid-line--h" />
        <div className="grid-line grid-line--v" />
        <div className="grid-line grid-line--d1" />
        <div className="grid-line grid-line--d2" />
      </div>

      {/* Red dashed stroke guide overlay (practice mode only) */}
      {!isDemo && strokePaths.length > 0 && (
        <svg
          className="hanzi-dashed-overlay"
          width={canvasSize}
          height={canvasSize}
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <g transform={`translate(${padding}, ${translateY}) scale(${scale}, ${-scale})`}>
            {strokePaths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="#EF4444"
                strokeWidth={2 / scale}
                strokeDasharray={`${8 / scale} ${6 / scale}`}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
        </svg>
      )}

      <div
        ref={containerRef}
        className="hanzi-canvas"
        style={{
          width: canvasSize,
          height: canvasSize,
          touchAction: 'none',
        }}
      />
      {isLoading && (
        <div className="hanzi-canvas-loading">
          <span className="animate-pulse">Loading...</span>
        </div>
      )}
    </div>
  );
}

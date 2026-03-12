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
    animate,
    loopAnimation,
    startQuiz,
  } = useHanziWriter(containerRef, character, {
    width: canvasSize,
    height: canvasSize,
    showCharacter: isDemo,
    showOutline: true,
    strokeColor: '#3B82F6',
    outlineColor: isDemo ? '#E0E7FF' : '#CBD5E1',
    drawingColor: '#F59E0B',
    highlightColor: '#FCD34D',
    drawingWidth: 6,
    strokeAnimationSpeed: 0.8,
    delayBetweenStrokes: 300,
  });

  // Notify parent when writer is ready
  useEffect(() => {
    if (!isLoading && totalStrokes > 0) {
      onWriterReady({ animate, loopAnimation, startQuiz, totalStrokes });
    }
  }, [isLoading, totalStrokes, animate, loopAnimation, startQuiz, onWriterReady]);

  // Auto-start quiz when in practice mode
  useEffect(() => {
    if (!isLoading && mode === 'practice' && totalStrokes > 0) {
      startQuiz(quizCallbacks);
    }
  }, [isLoading, mode, character, totalStrokes, startQuiz, quizCallbacks]);

  return (
    <div className="hanzi-canvas-wrapper">
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

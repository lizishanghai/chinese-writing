import { useCallback, useRef } from 'react';
import type { AppMode, QuizState } from '../../types';
import type { QuizCallbacks } from '../../hooks/useHanziWriter';
import { getLevelConfig } from '../../data/characterLibrary';
import { ModeToggle } from './ModeToggle';
import { AnimationControls } from './AnimationControls';
import { HanziCanvas } from './HanziCanvas';
import type { DifficultyLevel } from '../../types';
import './WritingArea.css';

interface WritingAreaProps {
  character: string;
  level: DifficultyLevel;
  mode: AppMode;
  canvasSize: number;
  quizState: QuizState;
  onModeChange: (mode: AppMode) => void;
  quizCallbacks: QuizCallbacks;
  onQuizStart: (totalStrokes: number) => void;
  onStrokeAnimate?: (strokeNum: number) => void;
  onReadWords?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function WritingArea({
  character,
  level,
  mode,
  canvasSize,
  quizState,
  onModeChange,
  quizCallbacks,
  onQuizStart,
  onStrokeAnimate,
  onReadWords,
  onPrev,
  onNext,
}: WritingAreaProps) {
  const controlsRef = useRef<{
    animate: () => void;
    animateWithAudio: (onStrokeStart?: (strokeNum: number) => void) => Promise<void>;
    loopAnimation: () => void;
    startQuiz: (callbacks: QuizCallbacks) => void;
    totalStrokes: number;
  } | null>(null);

  const charInfo = getLevelConfig(level).characters.find(c => c.char === character);

  const handleWriterReady = useCallback((controls: typeof controlsRef.current) => {
    controlsRef.current = controls;
    if (controls && mode === 'practice') {
      onQuizStart(controls.totalStrokes);
    }
  }, [mode, onQuizStart]);

  const handleAnimate = useCallback(() => {
    if (onStrokeAnimate) {
      controlsRef.current?.animateWithAudio(onStrokeAnimate);
    } else {
      controlsRef.current?.animate();
    }
  }, [onStrokeAnimate]);

  const handleModeChange = useCallback((newMode: AppMode) => {
    onModeChange(newMode);
    if (newMode === 'practice' && controlsRef.current) {
      onQuizStart(controlsRef.current.totalStrokes);
    }
  }, [onModeChange, onQuizStart]);

  return (
    <div className="writing-area">
      {charInfo && (
        <div className="writing-area-charinfo">
          <span className="charinfo-char">{charInfo.char}</span>
          <span className="charinfo-pinyin">{charInfo.pinyin}</span>
          <span className="charinfo-meaning">{charInfo.meaning}</span>
          <span className="charinfo-strokes">{charInfo.strokeCount} stroke{charInfo.strokeCount !== 1 ? 's' : ''}</span>
        </div>
      )}

      <ModeToggle mode={mode} onToggle={handleModeChange} />

      <HanziCanvas
        character={character}
        mode={mode}
        canvasSize={canvasSize}
        quizCallbacks={quizCallbacks}
        onWriterReady={handleWriterReady}
      />

      <AnimationControls
        onAnimate={handleAnimate}
        onReadWords={onReadWords}
        isDemo={mode === 'demo'}
      />

      {mode === 'practice' && (
        <div className="practice-controls">
          {!quizState.completed && quizState.isActive && (
            <p className="writing-hint">
              Draw the strokes in the correct order!
              <br />
              <span className="writing-hint-zh">按正确顺序写出笔画！</span>
            </p>
          )}
          <div className="practice-nav">
            {onPrev && (
              <button className="ctrl-btn" onClick={onPrev}>
                <span>⬅️</span> 上一个
              </button>
            )}
            {onNext && (
              <button className="ctrl-btn" onClick={onNext}>
                <span>➡️</span> 下一个
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

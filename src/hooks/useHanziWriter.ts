import { useEffect, useRef, useState, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';
import type { QuizOptions, StrokeData } from 'hanzi-writer';

export interface UseHanziWriterOptions {
  width?: number;
  height?: number;
  showCharacter?: boolean;
  showOutline?: boolean;
  strokeColor?: string;
  outlineColor?: string;
  drawingColor?: string;
  highlightColor?: string;
  drawingWidth?: number;
  strokeAnimationSpeed?: number;
  delayBetweenStrokes?: number;
}

export interface QuizCallbacks {
  onCorrectStroke?: (data: StrokeData) => void;
  onMistake?: (data: StrokeData) => void;
  onComplete?: (summary: { character: string; totalMistakes: number }) => void;
}

export function useHanziWriter(
  containerRef: React.RefObject<HTMLDivElement | null>,
  character: string,
  options: UseHanziWriterOptions = {}
) {
  const writerRef = useRef<HanziWriter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalStrokes, setTotalStrokes] = useState(0);

  const {
    width = 300,
    height = 300,
    showCharacter = true,
    showOutline = true,
    strokeColor = '#3B82F6',
    outlineColor = '#E0E7FF',
    drawingColor = '#F59E0B',
    highlightColor = '#FCD34D',
    drawingWidth = 6,
    strokeAnimationSpeed = 0.8,
    delayBetweenStrokes = 300,
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !character) return;

    // Clear previous
    container.innerHTML = '';
    setIsLoading(true);

    const writer = HanziWriter.create(container, character, {
      width,
      height,
      padding: 20,
      showCharacter,
      showOutline,
      strokeColor,
      outlineColor,
      drawingColor,
      highlightColor,
      drawingWidth,
      strokeAnimationSpeed,
      delayBetweenStrokes,
      strokeHighlightDuration: 500,
      charDataLoader: (char, onLoad, onError) => {
        import(`hanzi-writer/dist/hanzi-writer-data/${char}.json`)
          .then(module => onLoad(module.default || module))
          .catch(() => {
            // Fallback: try loading from CDN
            fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${char}.json`)
              .then(r => r.json())
              .then(onLoad)
              .catch(onError);
          });
      },
      onLoadCharDataSuccess: () => {
        setIsLoading(false);
        // Get stroke count from character data
        writer.getCharacterData().then(charData => {
          setTotalStrokes(charData.strokes.length);
        });
      },
      onLoadCharDataError: () => {
        setIsLoading(false);
      },
    });

    writerRef.current = writer;

    return () => {
      writerRef.current = null;
    };
  }, [character, width, height, showCharacter, showOutline, strokeColor, outlineColor, drawingColor, highlightColor, drawingWidth, strokeAnimationSpeed, delayBetweenStrokes]);

  const animate = useCallback(() => {
    writerRef.current?.animateCharacter();
  }, []);

  const animateWithAudio = useCallback(async (onStrokeStart?: (strokeNum: number) => void) => {
    const writer = writerRef.current;
    if (!writer) return;
    const charData = await writer.getCharacterData();
    const numStrokes = charData.strokes.length;
    await writer.hideCharacter();
    for (let i = 0; i < numStrokes; i++) {
      onStrokeStart?.(i);
      await writer.animateStroke(i);
      // Wait long enough for the speech to finish before next stroke
      await new Promise(r => setTimeout(r, 800));
    }
  }, []);

  const loopAnimation = useCallback(() => {
    writerRef.current?.loopCharacterAnimation();
  }, []);

  const pauseAnimation = useCallback(() => {
    writerRef.current?.pauseAnimation();
  }, []);

  const resumeAnimation = useCallback(() => {
    writerRef.current?.resumeAnimation();
  }, []);

  const startQuiz = useCallback((callbacks: QuizCallbacks, quizOptions?: Partial<QuizOptions>) => {
    writerRef.current?.quiz({
      leniency: 1.2,
      showHintAfterMisses: 2,
      highlightOnComplete: true,
      ...quizOptions,
      onCorrectStroke: callbacks.onCorrectStroke,
      onMistake: callbacks.onMistake,
      onComplete: callbacks.onComplete,
    });
  }, []);

  const cancelQuiz = useCallback(() => {
    writerRef.current?.cancelQuiz();
  }, []);

  const highlightStroke = useCallback((strokeNum: number) => {
    writerRef.current?.highlightStroke(strokeNum);
  }, []);

  const showChar = useCallback(() => {
    writerRef.current?.showCharacter();
  }, []);

  const hideChar = useCallback(() => {
    writerRef.current?.hideCharacter();
  }, []);

  return {
    writer: writerRef.current,
    isLoading,
    totalStrokes,
    animate,
    animateWithAudio,
    loopAnimation,
    pauseAnimation,
    resumeAnimation,
    startQuiz,
    cancelQuiz,
    highlightStroke,
    showCharacter: showChar,
    hideCharacter: hideChar,
  };
}

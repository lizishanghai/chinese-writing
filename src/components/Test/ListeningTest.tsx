import { useState, useRef, useEffect, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';
import type { TestQuestion, TestResultData } from '../../types';
import { speakChinese } from '../../utils/speechService';
import { playCompletionChime } from '../../utils/soundEffects';
import { useResponsive } from '../../hooks/useResponsive';
import './Test.css';

interface ListeningTestProps {
  questions: TestQuestion[];
  onComplete: (result: TestResultData) => void;
  onBack: () => void;
}

export function ListeningTest({ questions, onComplete, onBack }: ListeningTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [correctArr, setCorrectArr] = useState<boolean[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const { canvasSize } = useResponsive();

  const question = questions[currentIndex];
  const total = questions.length;

  // Initialize HanziWriter for current character
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !question) return;

    container.innerHTML = '';
    setShowFeedback(false);
    setTotalMistakes(0);

    const writer = HanziWriter.create(container, question.target.char, {
      width: canvasSize,
      height: canvasSize,
      padding: 20,
      showCharacter: false,
      showOutline: false,
      strokeColor: '#3B82F6',
      outlineColor: '#CBD5E1',
      drawingColor: '#F59E0B',
      highlightColor: '#FCD34D',
      drawingWidth: 6,
      strokeAnimationSpeed: 0.8,
      charDataLoader: (char, onLoad, onError) => {
        import(`hanzi-writer/dist/hanzi-writer-data/${char}.json`)
          .then(module => onLoad(module.default || module))
          .catch(() => {
            fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${char}.json`)
              .then(r => r.json())
              .then(onLoad)
              .catch(onError);
          });
      },
      onLoadCharDataSuccess: () => {
        writerRef.current = writer;
        // Read hint first, then play character audio
        setTimeout(() => speakChinese('听声音，写出这个汉字'), 300);
        setTimeout(() => speakChinese(question.target.char), 2500);
        // Start quiz mode
        writer.quiz({
          leniency: 1.2,
          showHintAfterMisses: 3,
          highlightOnComplete: true,
          onMistake: () => {
            setTotalMistakes(prev => prev + 1);
          },
          onComplete: (summary) => {
            const correct = summary.totalMistakes <= 3;
            setIsCorrect(correct);
            setShowFeedback(true);
            if (correct) playCompletionChime();
          },
        });
      },
    });

    return () => {
      writerRef.current = null;
    };
  }, [currentIndex, question, canvasSize]);

  const handleReplay = useCallback(() => {
    if (question) speakChinese(question.target.char);
  }, [question]);

  // Auto-advance after feedback
  useEffect(() => {
    if (!showFeedback) return;
    const timer = setTimeout(() => {
      const newAnswers = [...answers, isCorrect ? 1 : 0];
      const newCorrect = [...correctArr, isCorrect];

      if (currentIndex + 1 < total) {
        setAnswers(newAnswers);
        setCorrectArr(newCorrect);
        setCurrentIndex(prev => prev + 1);
      } else {
        const score = newCorrect.filter(Boolean).length;
        onComplete({
          questions,
          answers: newAnswers,
          correct: newCorrect,
          score,
        });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [showFeedback, isCorrect, currentIndex, total, answers, correctArr, questions, onComplete]);

  if (!question) return null;

  return (
    <div className="test-page">
      <div className="test-page-header">
        <button className="test-back-btn" onClick={onBack}>← 退出</button>
        <div className="test-progress">
          <div className="test-progress-text">{currentIndex + 1} / {total}</div>
          <div className="test-progress-bar">
            <div
              className="test-progress-fill"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="test-listening-card">
        <div className="test-listening-prompt">
          <button className="test-listen-btn" onClick={handleReplay}>
            🔊 再听一次
          </button>
          <p className="test-listening-hint">听声音，写出这个汉字</p>
        </div>

        <div className="test-listening-canvas">
          <div className="hanzi-canvas-wrapper">
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
              style={{ width: canvasSize, height: canvasSize, touchAction: 'none' }}
            />
          </div>
        </div>

        {showFeedback && (
          <div className={`test-feedback ${isCorrect ? 'test-feedback--correct' : 'test-feedback--wrong'}`}>
            {isCorrect ? (
              <>✅ 正确！ {question.target.char} ({question.target.pinyin})</>
            ) : (
              <>
                ❌ 答案：{question.target.char} ({question.target.pinyin})
                <span className="test-feedback-detail"> 错误 {totalMistakes} 次</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

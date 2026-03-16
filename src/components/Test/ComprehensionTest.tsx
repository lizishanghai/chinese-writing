import { useState, useCallback, useEffect } from 'react';
import type { TestQuestion, TestResultData } from '../../types';
import { playCompletionChime } from '../../utils/soundEffects';
import { speakChineseSequence, speakChineseWithCallback } from '../../utils/speechService';
import './Test.css';

interface ComprehensionTestProps {
  questions: TestQuestion[];
  onComplete: (result: TestResultData) => void;
  onBack: () => void;
}

export function ComprehensionTest({ questions, onComplete, onBack }: ComprehensionTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [correctArr, setCorrectArr] = useState<boolean[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const question = questions[currentIndex];
  const total = questions.length;
  const isCorrect = selectedAnswer === question?.correctIndex;

  // Read question aloud when it appears
  useEffect(() => {
    if (!question) return;
    const word = question.word || question.target.char;
    const timer = setTimeout(() => {
      speakChineseSequence(['这个词是什么意思？', word], 400);
    }, 300);
    return () => { clearTimeout(timer); speechSynthesis?.cancel(); };
  }, [currentIndex, question]);

  const handleSelect = useCallback((optionIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(optionIndex);
    setShowFeedback(true);

    const correct = optionIndex === question.correctIndex;
    if (correct) {
      playCompletionChime();
    }

    setAnswers(prev => [...prev, optionIndex]);
    setCorrectArr(prev => [...prev, correct]);
  }, [showFeedback, question]);

  // Speak feedback then advance
  useEffect(() => {
    if (!showFeedback || selectedAnswer === null) return;
    const correct = selectedAnswer === question.correctIndex;
    const correctOption = question.options?.[question.correctIndex!];
    const feedbackText = correct
      ? '正确'
      : `不对，正确答案是${correctOption}`;

    const timer = setTimeout(() => {
      speakChineseWithCallback(feedbackText, () => {
        setTimeout(() => {
          if (currentIndex + 1 < total) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowFeedback(false);
          } else {
            const finalAnswers = [...answers];
            const finalCorrect = [...correctArr];
            if (finalAnswers.length < total) {
              finalAnswers.push(selectedAnswer);
              finalCorrect.push(correct);
            }
            const score = finalCorrect.filter(Boolean).length;
            onComplete({
              questions,
              answers: finalAnswers,
              correct: finalCorrect,
              score,
            });
          }
        }, 500);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [showFeedback, selectedAnswer, currentIndex, total, answers, correctArr, question, questions, onComplete]);

  if (!question) return null;

  const word = question.word || question.target.char;

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

      <div className="test-question-card">
        <div className="test-question-prompt">
          <div className="test-question-char">{word}</div>
          <div className="test-question-hint">这个词是什么意思？</div>
        </div>

        <div className="test-options">
          {question.options?.map((opt, i) => {
            let btnClass = 'test-option-btn';
            if (showFeedback) {
              if (i === question.correctIndex) btnClass += ' test-option--correct';
              else if (i === selectedAnswer && !isCorrect) btnClass += ' test-option--wrong';
            } else if (i === selectedAnswer) {
              btnClass += ' test-option--selected';
            }

            return (
              <button
                key={i}
                className={btnClass}
                onClick={() => handleSelect(i)}
                disabled={showFeedback}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className={`test-feedback ${isCorrect ? 'test-feedback--correct' : 'test-feedback--wrong'}`}>
            {isCorrect ? '✅ 正确！' : `❌ 正确答案：${question.options?.[question.correctIndex!]}`}
          </div>
        )}
      </div>
    </div>
  );
}

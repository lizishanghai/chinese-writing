import { useState, useCallback, useEffect } from 'react';
import type { TestQuestion, TestResultData } from '../../types';
import { playCompletionChime } from '../../utils/soundEffects';
import { speakChinese, speakChineseSequence, speakChineseWithCallback } from '../../utils/speechService';
import './Test.css';

interface RecognitionTestProps {
  questions: TestQuestion[];
  onComplete: (result: TestResultData) => void;
  onBack: () => void;
}

export function RecognitionTest({ questions, onComplete, onBack }: RecognitionTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [correctArr, setCorrectArr] = useState<boolean[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const question = questions[currentIndex];
  const total = questions.length;
  const isCorrect = selectedAnswer === question?.correctIndex;

  // Read hint and question aloud in sequence when it appears
  useEffect(() => {
    if (!question) return;
    const hint = question.type === 'charToPinyin'
      ? '这个字的拼音是？'
      : '请选择正确的汉字';
    const timer = setTimeout(() => {
      speakChineseSequence([hint, question.target.char], 600);
    }, 300);
    return () => { clearTimeout(timer); speechSynthesis?.cancel(); };
  }, [currentIndex, question]);

  const handleSelect = useCallback((optionIndex: number) => {
    if (showFeedback) return; // Already answered
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

  const isCharToPinyin = question.type === 'charToPinyin';

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
        {isCharToPinyin ? (
          <div className="test-question-prompt">
            <div className="test-question-char">{question.target.char}</div>
            <button className="test-speak-btn" onClick={() => speakChinese(question.target.char)}>🔊</button>
            <div className="test-question-hint">这个字的拼音是？</div>
          </div>
        ) : (
          <div className="test-question-prompt">
            <div className="test-question-pinyin">{question.target.pinyin}</div>
            <div className="test-question-meaning">{question.target.meaning}</div>
            <button className="test-speak-btn" onClick={() => speakChinese(question.target.char)}>🔊</button>
            <div className="test-question-hint">请选择正确的汉字</div>
          </div>
        )}

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
                {isCharToPinyin ? (
                  <span className="test-option-pinyin">{opt}</span>
                ) : (
                  <span className="test-option-char">{opt}</span>
                )}
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

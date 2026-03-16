import { useState, useCallback, useEffect } from 'react';
import type { CharacterEntry } from '../../types';
import { generateReadingQuizQuestions, type ReadingQuizQuestion } from '../../utils/readingHelpers';
import { speakChinese } from '../../utils/speechService';
import { playCompletionChime } from '../../utils/soundEffects';
import { playCelebrationFanfare } from '../../utils/soundEffects';
import './Reading.css';

interface ReadingQuizProps {
  levelChars: CharacterEntry[];
  onBack: () => void;
  onFinish: () => void;
}

export function ReadingQuiz({ levelChars, onBack, onFinish }: ReadingQuizProps) {
  const [questions] = useState<ReadingQuizQuestion[]>(() =>
    generateReadingQuizQuestions(levelChars)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[currentIndex];
  const total = questions.length;
  const isCorrect = selectedAnswer === question?.correctIndex;

  const handleSelect = useCallback((optionIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(optionIndex);
    setShowFeedback(true);

    const correct = optionIndex === question.correctIndex;
    if (correct) {
      playCompletionChime();
      setCorrectCount(prev => prev + 1);
    }
    // Read the word aloud
    speakChinese(question.word);
  }, [showFeedback, question]);

  // Auto-advance after feedback
  useEffect(() => {
    if (!showFeedback) return;
    const timer = setTimeout(() => {
      if (currentIndex + 1 < total) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setFinished(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [showFeedback, currentIndex, total]);

  // Play fanfare on finish
  useEffect(() => {
    if (finished && correctCount >= Math.ceil(total * 0.8)) {
      playCelebrationFanfare();
    }
  }, [finished, correctCount, total]);

  if (finished) {
    const percentage = Math.round((correctCount / total) * 100);
    return (
      <div className="reading-quiz-result">
        <div className="reading-quiz-result-card">
          <div className="reading-quiz-result-emoji">
            {percentage === 100 ? '🏆' : percentage >= 80 ? '⭐' : percentage >= 60 ? '👍' : '💪'}
          </div>
          <div className="reading-quiz-result-score">
            {correctCount} / {total}
          </div>
          <div className="reading-quiz-result-text">
            {percentage === 100 ? '满分！太棒了！' :
             percentage >= 80 ? '非常好！' :
             percentage >= 60 ? '不错，继续加油！' : '再练练，你可以的！'}
          </div>
          <div className="reading-quiz-result-actions">
            <button className="reading-quiz-btn reading-quiz-btn--primary" onClick={onBack}>
              📖 继续阅读
            </button>
            <button className="reading-quiz-btn" onClick={onFinish}>
              🏠 返回选关
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="reading-quiz-page">
      <div className="reading-page-header">
        <button className="reading-back-btn" onClick={onBack}>← 返回</button>
        <div className="reading-progress">
          <span className="reading-progress-text">小测验 {currentIndex + 1}/{total}</span>
        </div>
      </div>

      <div className="reading-quiz-card">
        <div className="reading-quiz-prompt">
          <div className="reading-quiz-word">{question.word}</div>
          <div className="reading-quiz-hint">这个词是什么意思？</div>
        </div>

        <div className="reading-quiz-options">
          {question.options.map((opt, i) => {
            let cls = 'reading-quiz-option';
            if (showFeedback) {
              if (i === question.correctIndex) cls += ' reading-quiz-option--correct';
              else if (i === selectedAnswer && !isCorrect) cls += ' reading-quiz-option--wrong';
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleSelect(i)}
                disabled={showFeedback}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className={`reading-quiz-feedback ${isCorrect ? 'reading-quiz-feedback--correct' : 'reading-quiz-feedback--wrong'}`}>
            {isCorrect ? '✅ 正确！' : `❌ 正确答案：${question.correctMeaning}`}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useCallback, useEffect } from 'react';
import type { TestQuestion, TestResultData } from '../../types';
import { playCompletionChime } from '../../utils/soundEffects';
import { speakChineseSequence, speakChineseWithCallback, speakChinese } from '../../utils/speechService';
import './DailyChallenge.css';

interface DailyChallengeQuizProps {
  questions: TestQuestion[];
  onComplete: (result: TestResultData) => void;
  onBack: () => void;
}

/** Get hint text for each question type */
function getHint(q: TestQuestion): string {
  switch (q.type) {
    case 'charToPinyin': return '这个字的拼音是？';
    case 'pinyinToChar': return '请选择正确的汉字';
    case 'comprehension': return '这个词是什么意思？';
    case 'listeningChoice': return '听声音，选出这个汉字';
    default: return '';
  }
}

/** Get what to speak for each question */
function getSpeechTexts(q: TestQuestion): string[] {
  const hint = getHint(q);
  switch (q.type) {
    case 'charToPinyin': return [hint, q.target.char];
    case 'pinyinToChar': return [hint];
    case 'comprehension': return [hint, q.word || q.target.char];
    case 'listeningChoice': return [hint, q.target.char];
    default: return [hint];
  }
}

/** Get display content for the question */
function getDisplayChar(q: TestQuestion): string {
  switch (q.type) {
    case 'charToPinyin': return q.target.char;
    case 'pinyinToChar': return `${q.target.pinyin} (${q.target.meaning})`;
    case 'comprehension': return q.word || q.target.char;
    case 'listeningChoice': return '🔊';
    default: return q.target.char;
  }
}

/** Get badge label for question type */
function getTypeBadge(q: TestQuestion): string {
  switch (q.type) {
    case 'charToPinyin':
    case 'pinyinToChar': return '认字';
    case 'comprehension': return '阅读';
    case 'listeningChoice': return '听力';
    default: return '';
  }
}

export function DailyChallengeQuiz({ questions, onComplete, onBack }: DailyChallengeQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [correctArr, setCorrectArr] = useState<boolean[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const question = questions[currentIndex];
  const total = questions.length;
  const isCorrect = selectedAnswer === question?.correctIndex;

  // Read question aloud
  useEffect(() => {
    if (!question) return;
    const texts = getSpeechTexts(question);
    const timer = setTimeout(() => {
      speakChineseSequence(texts, 400);
    }, 300);
    return () => { clearTimeout(timer); speechSynthesis?.cancel(); };
  }, [currentIndex, question]);

  const handleSelect = useCallback((optionIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(optionIndex);
    setShowFeedback(true);

    const correct = optionIndex === question.correctIndex;
    if (correct) playCompletionChime();

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

  const displayChar = getDisplayChar(question);
  const hint = getHint(question);
  const badge = getTypeBadge(question);

  return (
    <div className="daily-quiz-page">
      <div className="daily-quiz-header">
        <button className="daily-back-btn" onClick={onBack}>← 退出</button>
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

      <div className="daily-quiz-card">
        <span className="daily-quiz-badge">{badge}</span>

        <div className="daily-quiz-prompt">
          <div
            className={`daily-quiz-char ${question.type === 'listeningChoice' ? 'daily-quiz-char--listen' : ''}`}
            onClick={question.type === 'listeningChoice' ? () => speakChinese(question.target.char) : undefined}
          >
            {displayChar}
          </div>
          <div className="daily-quiz-hint">{hint}</div>
        </div>

        <div className="daily-quiz-options">
          {question.options?.map((opt, i) => {
            let btnClass = 'daily-quiz-option';
            if (showFeedback) {
              if (i === question.correctIndex) btnClass += ' daily-quiz-option--correct';
              else if (i === selectedAnswer && !isCorrect) btnClass += ' daily-quiz-option--wrong';
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
          <div className={`daily-quiz-feedback ${isCorrect ? 'daily-quiz-feedback--correct' : 'daily-quiz-feedback--wrong'}`}>
            {isCorrect ? '✅ 正确！' : `❌ 正确答案：${question.options?.[question.correctIndex!]}`}
          </div>
        )}
      </div>
    </div>
  );
}

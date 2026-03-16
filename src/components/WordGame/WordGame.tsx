import { useState, useCallback, useEffect } from 'react';
import type { WordGameQuestion, WordGameResult } from '../../types';
import { playCompletionChime, playCelebrationFanfare } from '../../utils/soundEffects';
import { speakChineseWithCallback, speakChinese } from '../../utils/speechService';
import './WordGame.css';

interface WordGameProps {
  questions: WordGameQuestion[];
  onComplete: (result: WordGameResult) => void;
  onBack: () => void;
}

export function WordGame({ questions, onComplete, onBack }: WordGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctArr, setCorrectArr] = useState<boolean[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Arrange state
  const [selected, setSelected] = useState<number[]>([]);
  const [shaking, setShaking] = useState(false);

  // Fillblank state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const question = questions[currentIndex];
  const total = questions.length;

  // Speak the word when question appears
  useEffect(() => {
    if (!question) return;
    const timer = setTimeout(() => speakChinese(question.word), 300);
    return () => clearTimeout(timer);
  }, [currentIndex, question]);

  const advanceToNext = useCallback((correct: boolean) => {
    setCorrectArr(prev => [...prev, correct]);
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) playCompletionChime();

    const feedbackText = correct ? '正确' : `正确答案是${question.word}`;
    speakChineseWithCallback(feedbackText, () => {
      setTimeout(() => {
        if (currentIndex + 1 < total) {
          setCurrentIndex(prev => prev + 1);
          setShowFeedback(false);
          setSelected([]);
          setSelectedOption(null);
          setIsCorrect(false);
        } else {
          const finalCorrect = [...correctArr, correct];
          const score = finalCorrect.filter(Boolean).length;
          onComplete({
            questions,
            correct: finalCorrect,
            score,
          });
        }
      }, 500);
    });
  }, [currentIndex, total, correctArr, question, questions, onComplete]);

  // === ARRANGE HANDLERS ===
  const handleTapChar = useCallback((charIndex: number) => {
    if (showFeedback || !question || question.type !== 'arrange') return;
    if (selected.includes(charIndex)) return;

    const newSelected = [...selected, charIndex];
    setSelected(newSelected);

    // Check if all chars selected
    if (newSelected.length === question.scrambled!.length) {
      const built = newSelected.map(i => question.scrambled![i]).join('');
      if (built === question.word) {
        advanceToNext(true);
      } else {
        // Wrong order - shake and reset
        setShaking(true);
        setTimeout(() => {
          setShaking(false);
          setSelected([]);
        }, 600);
      }
    }
  }, [selected, showFeedback, question, advanceToNext]);

  // === FILLBLANK HANDLERS ===
  const handleSelectFillOption = useCallback((optIndex: number) => {
    if (showFeedback || !question || question.type !== 'fillblank') return;
    setSelectedOption(optIndex);
    const correct = optIndex === question.correctIndex;
    advanceToNext(correct);
  }, [showFeedback, question, advanceToNext]);

  if (!question) return null;

  return (
    <div className="wordgame-page">
      <div className="wordgame-header">
        <button className="wordgame-back-btn" onClick={onBack}>← 退出</button>
        <div className="test-progress">
          <div className="test-progress-text">{currentIndex + 1} / {total}</div>
          <div className="test-progress-bar">
            <div className="test-progress-fill" style={{ width: `${((currentIndex + 1) / total) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="wordgame-card">
        <span className="wordgame-type-badge">
          {question.type === 'arrange' ? '🔀 组词' : '✏️ 填空'}
        </span>

        <div className="wordgame-hint">
          {question.targetChar.emoji && <span className="wordgame-hint-emoji">{question.targetChar.emoji}</span>}
          <span className="wordgame-hint-meaning">{question.meaning}</span>
        </div>

        {question.type === 'arrange' ? (
          /* === ARRANGE MODE === */
          <div className="wordgame-arrange">
            {/* Answer slots */}
            <div className="wordgame-answer-slots">
              {question.scrambled!.map((_, i) => (
                <div key={i} className="wordgame-answer-slot">
                  {selected[i] !== undefined
                    ? <span className="wordgame-slot-char">{question.scrambled![selected[i]]}</span>
                    : <span className="wordgame-slot-placeholder">?</span>
                  }
                </div>
              ))}
            </div>

            <div className="wordgame-arrange-hint">点击字，按正确顺序组词</div>

            {/* Scrambled tiles */}
            <div className={`wordgame-tiles ${shaking ? 'wordgame-tiles--shake' : ''}`}>
              {question.scrambled!.map((ch, i) => (
                <button
                  key={i}
                  className={`wordgame-tile ${selected.includes(i) ? 'wordgame-tile--used' : ''}`}
                  onClick={() => handleTapChar(i)}
                  disabled={selected.includes(i) || showFeedback}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* === FILLBLANK MODE === */
          <div className="wordgame-fillblank">
            {/* Word with blank */}
            <div className="wordgame-word-display">
              {question.word.split('').map((ch, i) => (
                <span
                  key={i}
                  className={`wordgame-word-char ${i === question.blankIndex ? 'wordgame-word-char--blank' : ''}`}
                >
                  {i === question.blankIndex ? (
                    showFeedback ? ch : '___'
                  ) : ch}
                </span>
              ))}
            </div>

            <div className="wordgame-fillblank-hint">选择正确的字填入空格</div>

            {/* Options */}
            <div className="wordgame-fill-options">
              {question.options!.map((opt, i) => {
                let cls = 'wordgame-fill-option';
                if (showFeedback) {
                  if (i === question.correctIndex) cls += ' wordgame-fill-option--correct';
                  else if (i === selectedOption && !isCorrect) cls += ' wordgame-fill-option--wrong';
                }
                return (
                  <button
                    key={i}
                    className={cls}
                    onClick={() => handleSelectFillOption(i)}
                    disabled={showFeedback}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showFeedback && (
          <div className={`wordgame-feedback ${isCorrect ? 'wordgame-feedback--correct' : 'wordgame-feedback--wrong'}`}>
            {isCorrect ? `✅ 正确！${question.word}` : `❌ 正确答案：${question.word}`}
          </div>
        )}
      </div>
    </div>
  );
}

// Result component (inline)
interface WordGameResultProps {
  result: WordGameResult;
  onRetry: () => void;
  onBack: () => void;
}

export function WordGameResultView({ result, onRetry, onBack }: WordGameResultProps) {
  const pct = Math.round((result.score / result.questions.length) * 100);

  useEffect(() => {
    if (pct >= 80) playCelebrationFanfare();
    else playCompletionChime();
  }, [pct]);

  const gradeEmoji = pct === 100 ? '🏆' : pct >= 80 ? '⭐' : pct >= 60 ? '👍' : '💪';
  const gradeText = pct === 100 ? '满分！太棒了！' : pct >= 80 ? '非常好！' : pct >= 60 ? '不错，继续加油！' : '再练练，你可以的！';

  const wrongQuestions = result.questions.filter((_, i) => !result.correct[i]);

  return (
    <div className="wordgame-result">
      <div className="wordgame-result-card">
        <div className="wordgame-result-emoji">{gradeEmoji}</div>
        <div className="wordgame-result-score">{result.score} / {result.questions.length}</div>
        <div className="wordgame-result-pct">{pct}%</div>
        <div className="wordgame-result-text">{gradeText}</div>

        {wrongQuestions.length > 0 && (
          <div className="wordgame-result-review">
            <div className="wordgame-result-review-title">❌ 需要复习的词</div>
            {wrongQuestions.map((q, i) => (
              <div key={i} className="wordgame-result-review-item">
                <span className="wordgame-result-review-word">{q.word}</span>
                <span className="wordgame-result-review-meaning">{q.meaning}</span>
              </div>
            ))}
          </div>
        )}

        <div className="wordgame-result-actions">
          <button className="wordgame-result-btn wordgame-result-btn--primary" onClick={onRetry}>
            🔄 再玩一次
          </button>
          <button className="wordgame-result-btn" onClick={onBack}>
            🏠 返回
          </button>
        </div>
      </div>
    </div>
  );
}

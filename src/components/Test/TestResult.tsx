import { useEffect } from 'react';
import type { TestResultData, TestType } from '../../types';
import { playCelebrationFanfare, playCompletionChime } from '../../utils/soundEffects';
import './Test.css';

interface TestResultProps {
  result: TestResultData;
  testType: TestType;
  onRetry: () => void;
  onBack: () => void;
}

export function TestResult({ result, testType: _testType, onRetry, onBack }: TestResultProps) {
  const { questions, correct, score } = result;
  const total = questions.length;
  const percentage = Math.round((score / total) * 100);

  // Play sound on mount
  useEffect(() => {
    if (percentage >= 80) {
      playCelebrationFanfare();
    } else {
      playCompletionChime();
    }
  }, [percentage]);

  const getGrade = () => {
    if (percentage === 100) return { emoji: '🏆', text: '满分！太棒了！', color: '#F59E0B' };
    if (percentage >= 80) return { emoji: '⭐', text: '非常好！', color: '#10B981' };
    if (percentage >= 60) return { emoji: '👍', text: '不错，继续加油！', color: '#3B82F6' };
    return { emoji: '💪', text: '再练练，你可以的！', color: '#8B5CF6' };
  };

  const grade = getGrade();

  // Collect wrong answers
  const wrongItems = questions
    .map((q, i) => ({ question: q, isCorrect: correct[i], index: i }))
    .filter(item => !item.isCorrect);

  return (
    <div className="test-result-page">
      <div className="test-result-card">
        <div className="test-result-emoji">{grade.emoji}</div>
        <div className="test-result-score" style={{ color: grade.color }}>
          {score} / {total}
        </div>
        <div className="test-result-percentage">{percentage}%</div>
        <div className="test-result-grade">{grade.text}</div>

        {wrongItems.length > 0 && (
          <div className="test-result-wrong">
            <h3 className="test-result-wrong-title">❌ 需要复习的字</h3>
            <div className="test-result-wrong-list">
              {wrongItems.map(({ question }, i) => (
                <div key={i} className="test-result-wrong-item">
                  <span className="test-result-wrong-char">{question.target.char}</span>
                  <span className="test-result-wrong-pinyin">{question.target.pinyin}</span>
                  <span className="test-result-wrong-meaning">{question.target.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="test-result-actions">
          <button className="test-result-btn test-result-btn--retry" onClick={onRetry}>
            🔄 再测一次
          </button>
          <button className="test-result-btn test-result-btn--back" onClick={onBack}>
            🏠 返回选关
          </button>
        </div>
      </div>
    </div>
  );
}

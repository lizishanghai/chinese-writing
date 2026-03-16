import { useState, useEffect, useRef, useCallback } from 'react';
import type { CharacterEntry } from '../../types';
import { characterLevels } from '../../data/characterLibrary';
import { speakChinese } from '../../utils/speechService';
import { playCelebrationFanfare, playCompletionChime } from '../../utils/soundEffects';
import './WhackMole.css';

const GAME_DURATION = 45; // seconds
const SPAWN_INTERVAL = 1200; // ms between new moles

interface MoleState {
  char: CharacterEntry | null;
  visible: boolean;
  feedback: 'none' | 'correct' | 'wrong';
  hideTimeout?: ReturnType<typeof setTimeout>;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getCharPool(completedLevels: Set<number>): CharacterEntry[] {
  const pool: CharacterEntry[] = [];
  for (const lvl of completedLevels) {
    const config = characterLevels[lvl - 1];
    if (config) pool.push(...config.characters);
  }
  return pool;
}

function loadHighScore(): number {
  try {
    return parseInt(localStorage.getItem('whack-mole-high') || '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score: number): void {
  try {
    const prev = loadHighScore();
    if (score > prev) localStorage.setItem('whack-mole-high', String(score));
  } catch {
    // ignore
  }
}

/** Get mole visibility duration based on elapsed time */
function getMoleDuration(elapsed: number): number {
  if (elapsed < 15) return 2500;
  if (elapsed < 30) return 2000;
  return 1500;
}

interface WhackMoleProps {
  completedLevels: Set<number>;
  onBack: () => void;
}

export function WhackMole({ completedLevels, onBack }: WhackMoleProps) {
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'result'>('countdown');
  const [countdownNum, setCountdownNum] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [target, setTarget] = useState<CharacterEntry | null>(null);
  const [moles, setMoles] = useState<MoleState[]>(
    Array.from({ length: 6 }, () => ({ char: null, visible: false, feedback: 'none' }))
  );
  const [scorePopup, setScorePopup] = useState(false);
  const [totalTaps, setTotalTaps] = useState(0);
  const [correctTaps, setCorrectTaps] = useState(0);
  const [highScore] = useState(loadHighScore);

  const charPool = useRef<CharacterEntry[]>([]);
  const gameStartTime = useRef(0);
  const spawnTimer = useRef<ReturnType<typeof setInterval>>(undefined);
  const timerInterval = useRef<ReturnType<typeof setInterval>>(undefined);
  const molesRef = useRef(moles);
  molesRef.current = moles;
  const targetRef = useRef(target);
  targetRef.current = target;
  const scoreRef = useRef(score);
  scoreRef.current = score;

  // Initialize char pool
  useEffect(() => {
    charPool.current = getCharPool(completedLevels);
  }, [completedLevels]);

  // Countdown phase
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdownNum <= 0) {
      setPhase('playing');
      return;
    }
    const t = setTimeout(() => setCountdownNum(n => n - 1), 800);
    return () => clearTimeout(t);
  }, [phase, countdownNum]);

  // Pick a new target
  const pickNewTarget = useCallback(() => {
    if (charPool.current.length === 0) return;
    const newTarget = pickRandom(charPool.current);
    setTarget(newTarget);
    return newTarget;
  }, []);

  // Spawn a mole in a random empty hole
  const spawnMole = useCallback(() => {
    const pool = charPool.current;
    if (pool.length === 0 || !targetRef.current) return;

    const current = molesRef.current;
    const emptyIndices = current
      .map((m, i) => (!m.visible ? i : -1))
      .filter(i => i >= 0);

    if (emptyIndices.length === 0) return;

    const holeIndex = pickRandom(emptyIndices);
    const elapsed = (Date.now() - gameStartTime.current) / 1000;
    const duration = getMoleDuration(elapsed);

    // 40% chance to spawn the target character for balanced gameplay
    const isTarget = Math.random() < 0.4;
    const char = isTarget
      ? targetRef.current
      : pickRandom(pool.filter(c => c.char !== targetRef.current?.char));

    if (!char) return;

    const hideTimeout = setTimeout(() => {
      setMoles(prev => {
        const next = [...prev];
        if (next[holeIndex].visible && next[holeIndex].feedback === 'none') {
          next[holeIndex] = { char: null, visible: false, feedback: 'none' };
        }
        return next;
      });
    }, duration);

    setMoles(prev => {
      const next = [...prev];
      next[holeIndex] = { char, visible: true, feedback: 'none', hideTimeout };
      return next;
    });
  }, []);

  // Start game
  useEffect(() => {
    if (phase !== 'playing') return;

    gameStartTime.current = Date.now();
    const initialTarget = pickNewTarget();
    if (!initialTarget) return;

    // Initial spawn: put target + 1-2 distractors
    const pool = charPool.current;
    const indices = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 2);

    setMoles(prev => {
      const next = [...prev];
      // Put target in first slot
      const dur = getMoleDuration(0);
      const t1 = setTimeout(() => {
        setMoles(p => {
          const n = [...p];
          if (n[indices[0]].visible && n[indices[0]].feedback === 'none') {
            n[indices[0]] = { char: null, visible: false, feedback: 'none' };
          }
          return n;
        });
      }, dur);
      next[indices[0]] = { char: initialTarget, visible: true, feedback: 'none', hideTimeout: t1 };

      // Put distractor in second slot
      if (indices.length > 1 && pool.length > 1) {
        const distractor = pickRandom(pool.filter(c => c.char !== initialTarget.char));
        if (distractor) {
          const t2 = setTimeout(() => {
            setMoles(p => {
              const n = [...p];
              if (n[indices[1]].visible && n[indices[1]].feedback === 'none') {
                n[indices[1]] = { char: null, visible: false, feedback: 'none' };
              }
              return n;
            });
          }, dur);
          next[indices[1]] = { char: distractor, visible: true, feedback: 'none', hideTimeout: t2 };
        }
      }
      return next;
    });

    // Spawn interval
    spawnTimer.current = setInterval(spawnMole, SPAWN_INTERVAL);

    // Countdown timer
    timerInterval.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Game over
          clearInterval(spawnTimer.current);
          clearInterval(timerInterval.current);
          setPhase('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnTimer.current);
      clearInterval(timerInterval.current);
      // Clear all mole hide timeouts
      molesRef.current.forEach(m => {
        if (m.hideTimeout) clearTimeout(m.hideTimeout);
      });
    };
  }, [phase, pickNewTarget, spawnMole]);

  // Save high score on result
  useEffect(() => {
    if (phase === 'result') {
      saveHighScore(scoreRef.current);
      if (scoreRef.current >= 15) {
        playCelebrationFanfare();
      } else {
        playCompletionChime();
      }
    }
  }, [phase]);

  // Handle tapping a mole
  const handleTap = useCallback((index: number) => {
    if (phase !== 'playing') return;
    const mole = molesRef.current[index];
    if (!mole.visible || mole.feedback !== 'none' || !mole.char) return;

    setTotalTaps(prev => prev + 1);

    if (mole.char.char === targetRef.current?.char) {
      // Correct!
      setCorrectTaps(prev => prev + 1);
      setScore(prev => prev + 1);
      speakChinese(mole.char!.char);

      // Show popup
      setScorePopup(true);
      setTimeout(() => setScorePopup(false), 600);

      // Clear the hide timeout
      if (mole.hideTimeout) clearTimeout(mole.hideTimeout);

      // Animate correct
      setMoles(prev => {
        const next = [...prev];
        next[index] = { ...next[index], feedback: 'correct' };
        return next;
      });

      // Remove after animation
      setTimeout(() => {
        setMoles(prev => {
          const next = [...prev];
          next[index] = { char: null, visible: false, feedback: 'none' };
          return next;
        });
      }, 400);

      // New target
      pickNewTarget();
    } else {
      // Wrong tap
      setMoles(prev => {
        const next = [...prev];
        next[index] = { ...next[index], feedback: 'wrong' };
        return next;
      });

      // Reset feedback after animation
      setTimeout(() => {
        setMoles(prev => {
          const next = [...prev];
          if (next[index].feedback === 'wrong') {
            next[index] = { ...next[index], feedback: 'none' };
          }
          return next;
        });
      }, 400);

      // Time penalty
      setTimeLeft(prev => Math.max(0, prev - 0.5));
    }
  }, [phase, pickNewTarget]);

  // Retry handler
  const handleRetry = useCallback(() => {
    setPhase('countdown');
    setCountdownNum(3);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setTarget(null);
    setTotalTaps(0);
    setCorrectTaps(0);
    setMoles(Array.from({ length: 6 }, () => ({ char: null, visible: false, feedback: 'none' })));
  }, []);

  // Countdown overlay
  if (phase === 'countdown') {
    return (
      <div className="whack-page">
        <div className="whack-header">
          <button className="whack-back-btn" onClick={onBack}>← 退出</button>
        </div>
        <div className="whack-countdown">
          <div className="whack-countdown-num" key={countdownNum}>
            {countdownNum > 0 ? countdownNum : '开始!'}
          </div>
        </div>
      </div>
    );
  }

  // Result screen
  if (phase === 'result') {
    const finalScore = scoreRef.current;
    const prevHigh = highScore;
    const isNewHigh = finalScore > prevHigh;
    const accuracy = totalTaps > 0 ? Math.round((correctTaps / totalTaps) * 100) : 0;
    const gradeEmoji = finalScore >= 20 ? '🏆' : finalScore >= 15 ? '⭐' : finalScore >= 10 ? '👍' : '💪';
    const gradeText = finalScore >= 20 ? '太厉害了！' : finalScore >= 15 ? '非常棒！' : finalScore >= 10 ? '不错哦！' : '再来一次！';

    return (
      <div className="whack-result">
        <div className="whack-result-card">
          <div className="whack-result-emoji">{gradeEmoji}</div>
          <div className="whack-result-score">{finalScore}</div>
          <div className="whack-result-label">得分</div>
          {isNewHigh && <div className="whack-result-new-high">🎉 新纪录!</div>}
          <div className="whack-result-high">最高分: {Math.max(finalScore, prevHigh)}</div>

          <div className="whack-result-stats">
            <div className="whack-result-stat">
              <div className="whack-result-stat-value">{totalTaps}</div>
              <div className="whack-result-stat-label">总点击</div>
            </div>
            <div className="whack-result-stat">
              <div className="whack-result-stat-value">{accuracy}%</div>
              <div className="whack-result-stat-label">准确率</div>
            </div>
          </div>

          <div className="whack-result-text">{gradeText}</div>

          <div className="whack-result-actions">
            <button className="whack-result-btn whack-result-btn--primary" onClick={handleRetry}>
              🔄 再来一次
            </button>
            <button className="whack-result-btn" onClick={onBack}>
              🏠 返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing phase
  const timerPct = (timeLeft / GAME_DURATION) * 100;

  return (
    <div className="whack-page">
      <div className="whack-header">
        <button className="whack-back-btn" onClick={onBack}>← 退出</button>
        <div className="whack-score">⭐ {score}</div>
      </div>

      <div className="whack-timer">
        <div
          className={`whack-timer-fill ${timeLeft <= 10 ? 'whack-timer-fill--low' : ''}`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      {target && (
        <div className="whack-prompt">
          <div className="whack-prompt-emoji">{target.emoji || '❓'}</div>
          <div className="whack-prompt-text">{target.meaning}</div>
          <div className="whack-prompt-hint">找到这个字!</div>
        </div>
      )}

      <div className="whack-grid">
        {moles.map((mole, i) => (
          <div
            key={i}
            className={`whack-hole ${!mole.visible ? 'whack-hole--empty' : ''}`}
            onClick={() => handleTap(i)}
          >
            {mole.visible && mole.char && (
              <div className={`whack-mole whack-mole--visible ${
                mole.feedback === 'correct' ? 'whack-mole--correct' :
                mole.feedback === 'wrong' ? 'whack-mole--wrong' : ''
              }`}>
                {mole.char.char}
              </div>
            )}
          </div>
        ))}
      </div>

      {scorePopup && (
        <div className="whack-score-popup">+1</div>
      )}
    </div>
  );
}

import { useState, useCallback, useMemo, useRef } from 'react';
import { getLevelConfig } from '../../data/characterLibrary';
import { speakChineseWithRate } from '../../utils/speechService';
import { buildPinyinMap } from '../../utils/readingHelpers';
import { startKaraokeTimer, KARAOKE_SPEEDS } from '../../utils/karaokeTimer';
import type { KaraokeSpeed } from '../../utils/karaokeTimer';
import './ReadAlong.css';

interface ReadAlongProps {
  level: number;
  onBack: () => void;
}

export function ReadAlong({ level, onBack }: ReadAlongProps) {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [activeCharIndex, setActiveCharIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1); // Default: normal
  const cancelRef = useRef<(() => void) | null>(null);

  const config = getLevelConfig(level);
  const sentences = useMemo(() =>
    config.characters.map(c => c.sentence).filter((s): s is string => !!s),
    [config]
  );
  const pinyinMap = useMemo(() => buildPinyinMap(), []);
  const total = sentences.length;
  const sentence = sentences[sentenceIndex] || '';
  const speed: KaraokeSpeed = KARAOKE_SPEEDS[speedIndex];
  const charEntry = config.characters[sentenceIndex];

  const stopPlayback = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setActiveCharIndex(-1);
  }, []);

  const startPlayback = useCallback(() => {
    stopPlayback();
    if (!sentence) return;

    setIsPlaying(true);

    // Start TTS
    speakChineseWithRate(sentence, speed.rate);

    // Start karaoke timer
    const cancel = startKaraokeTimer(
      sentence,
      speed,
      (index) => setActiveCharIndex(index),
      () => setIsPlaying(false)
    );
    cancelRef.current = cancel;
  }, [sentence, speed, stopPlayback]);

  const handlePrev = useCallback(() => {
    stopPlayback();
    if (sentenceIndex > 0) setSentenceIndex(sentenceIndex - 1);
  }, [sentenceIndex, stopPlayback]);

  const handleNext = useCallback(() => {
    stopPlayback();
    if (sentenceIndex + 1 < total) {
      setSentenceIndex(sentenceIndex + 1);
    }
  }, [sentenceIndex, total, stopPlayback]);

  const handleSpeedChange = useCallback(() => {
    stopPlayback();
    setSpeedIndex((prev) => (prev + 1) % KARAOKE_SPEEDS.length);
  }, [stopPlayback]);

  const handleBack = useCallback(() => {
    stopPlayback();
    onBack();
  }, [stopPlayback, onBack]);

  // Check if char is Chinese
  const isChinese = (ch: string) => /[\u4e00-\u9fff]/.test(ch);

  return (
    <div className="readalong-page">
      <div className="readalong-header">
        <button className="readalong-back-btn" onClick={handleBack}>← 返回</button>
        <div className="readalong-progress">
          第{level}关 · {sentenceIndex + 1}/{total}
        </div>
      </div>

      {/* Character info */}
      {charEntry && (
        <div className="readalong-char-info">
          <span className="readalong-char-main">{charEntry.char}</span>
          <span className="readalong-char-pinyin">{charEntry.pinyin}</span>
          <span className="readalong-char-meaning">{charEntry.meaning}</span>
        </div>
      )}

      {/* Karaoke sentence display */}
      <div className="readalong-sentence">
        {sentence.split('').map((ch, i) => {
          let cls = 'karaoke-char';
          if (i === activeCharIndex) cls += ' karaoke-char--active';
          else if (activeCharIndex > i && isPlaying) cls += ' karaoke-char--done';

          const pinyin = isChinese(ch) ? pinyinMap.get(ch) : undefined;

          return (
            <span key={i} className={cls}>
              {pinyin && (
                <span className="karaoke-pinyin">{pinyin}</span>
              )}
              <span className="karaoke-hanzi">{ch}</span>
            </span>
          );
        })}
      </div>

      {/* Controls */}
      <div className="readalong-controls">
        <button
          className={`readalong-play-btn ${isPlaying ? 'readalong-play-btn--playing' : ''}`}
          onClick={isPlaying ? stopPlayback : startPlayback}
        >
          {isPlaying ? '⏸ 暂停' : '▶️ 播放'}
        </button>

        <button className="readalong-replay-btn" onClick={startPlayback} disabled={isPlaying}>
          🔄 再读一遍
        </button>

        <button className="readalong-speed-btn" onClick={handleSpeedChange}>
          {speed.emoji} {speed.label}
        </button>
      </div>

      {/* Navigation */}
      <div className="readalong-nav">
        {sentenceIndex > 0 ? (
          <button className="readalong-nav-btn" onClick={handlePrev}>
            ⬅️ 上一句
          </button>
        ) : <div />}
        {sentenceIndex + 1 < total ? (
          <button className="readalong-nav-btn" onClick={handleNext}>
            下一句 ➡️
          </button>
        ) : (
          <button className="readalong-nav-btn" onClick={handleBack}>
            ✅ 完成
          </button>
        )}
      </div>
    </div>
  );
}

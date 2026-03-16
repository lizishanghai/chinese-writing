import { useState, useCallback, useMemo } from 'react';
import type { CharacterEntry } from '../../types';
import { getLevelConfig } from '../../data/characterLibrary';
import { speakChinese } from '../../utils/speechService';
import { getLearnedChars, buildPinyinMap } from '../../utils/readingHelpers';
import './Reading.css';

interface ReadingProps {
  level: number;
  completedLevels: Set<number>;
  onBack: () => void;
}

export function Reading({ level, completedLevels, onBack }: ReadingProps) {
  const [cardIndex, setCardIndex] = useState(0);

  const config = getLevelConfig(level);
  const chars = config.characters;
  const char = chars[cardIndex];
  const total = chars.length;

  const learnedChars = useMemo(() => getLearnedChars(completedLevels), [completedLevels]);
  const pinyinMap = useMemo(() => buildPinyinMap(), []);

  const handlePrev = useCallback(() => {
    if (cardIndex > 0) setCardIndex(cardIndex - 1);
  }, [cardIndex]);

  const handleNext = useCallback(() => {
    if (cardIndex + 1 < total) {
      setCardIndex(cardIndex + 1);
    }
  }, [cardIndex, total]);

  const handleReadCard = useCallback((entry: CharacterEntry) => {
    const parts = [entry.char];
    if (entry.words) parts.push(entry.words.join('，'));
    if (entry.sentence) parts.push(entry.sentence);
    speakChinese(parts.join('。'));
  }, []);

  const handleTapChar = useCallback((text: string) => {
    speakChinese(text);
  }, []);

  return (
    <div className="reading-page">
      <div className="reading-page-header">
        <button className="reading-back-btn" onClick={onBack}>← 返回</button>
        <div className="reading-progress">
          <span className="reading-progress-text">
            第{level}关 · {config.description} · {cardIndex + 1}/{total}
          </span>
        </div>
      </div>

      <div className="reading-card">
        {/* Character header */}
        <div className="reading-card-header">
          <span
            className="reading-card-char"
            onClick={() => handleTapChar(char.char)}
          >
            {char.char}
          </span>
          <span className="reading-card-pinyin">{char.pinyin}</span>
          <span className="reading-card-meaning">{char.meaning}</span>
          {char.emoji && <span className="reading-card-emoji">{char.emoji}</span>}
        </div>

        {/* Words */}
        {char.words && char.words.length > 0 && (
          <div className="reading-card-section">
            <div className="reading-card-label">词语 Words</div>
            <div className="reading-word-list">
              {char.words.map((word, i) => (
                <button
                  key={i}
                  className="reading-word-pill"
                  onClick={() => handleTapChar(word)}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sentence */}
        {char.sentence && (
          <div className="reading-card-section">
            <div className="reading-card-label">句子 Sentence</div>
            <div
              className="reading-sentence"
              onClick={() => handleTapChar(char.sentence!)}
            >
              {renderSentence(char.sentence, learnedChars, pinyinMap)}
            </div>
          </div>
        )}

        {/* Read aloud button */}
        <button
          className="reading-read-btn"
          onClick={() => handleReadCard(char)}
        >
          🔊 朗读全部
        </button>
      </div>

      {/* Navigation */}
      <div className="reading-nav">
        {cardIndex > 0 ? (
          <button className="reading-nav-btn" onClick={handlePrev}>
            ⬅️ 上一个
          </button>
        ) : <div />}
        {cardIndex + 1 < total ? (
          <button className="reading-nav-btn" onClick={handleNext}>
            下一个 ➡️
          </button>
        ) : (
          <button className="reading-nav-btn" onClick={onBack}>
            ✅ 完成
          </button>
        )}
      </div>
    </div>
  );
}

/** Render sentence with ruby annotations for unlearned characters */
function renderSentence(
  sentence: string,
  learnedChars: Set<string>,
  pinyinMap: Map<string, string>
) {
  return sentence.split('').map((ch, i) => {
    // Only annotate Chinese characters that are unlearned
    const isChinese = /[\u4e00-\u9fff]/.test(ch);
    const isLearned = learnedChars.has(ch);
    const pinyin = pinyinMap.get(ch);

    if (isChinese && !isLearned && pinyin) {
      return (
        <ruby key={i} className="reading-ruby reading-ruby--unlearned">
          {ch}<rp>(</rp><rt>{pinyin}</rt><rp>)</rp>
        </ruby>
      );
    }

    if (isChinese && isLearned) {
      return (
        <span key={i} className="reading-char-learned">{ch}</span>
      );
    }

    // Punctuation or non-Chinese
    return <span key={i}>{ch}</span>;
  });
}

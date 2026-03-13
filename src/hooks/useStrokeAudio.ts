import { useEffect, useRef, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';
import type { CharacterJson } from 'hanzi-writer';
import { classifyStroke } from '../utils/strokeClassifier';
import { speakChinese, preloadVoices } from '../utils/speechService';
import { playCompletionChime } from '../utils/soundEffects';

export function useStrokeAudio(character: string) {
  const charDataRef = useRef<CharacterJson | null>(null);

  useEffect(() => {
    preloadVoices();
  }, []);

  useEffect(() => {
    charDataRef.current = null;
    HanziWriter.loadCharacterData(character, {
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
    }).then(data => {
      if (data) charDataRef.current = data;
    });
  }, [character]);

  const speakStrokeName = useCallback((strokeNum: number) => {
    const data = charDataRef.current;
    if (!data || strokeNum < 0 || strokeNum >= data.medians.length) return;
    const classification = classifyStroke(data.medians[strokeNum]);
    speakChinese(classification.name);
  }, []);

  const playCompletionSound = useCallback(() => {
    playCompletionChime();
  }, []);

  return { speakStrokeName, playCompletionSound };
}

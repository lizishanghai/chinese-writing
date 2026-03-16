import { useState } from 'react';
import type { TestType } from '../../types';
import { characterLevels } from '../../data/characterLibrary';
import './Test.css';

interface TestSelectProps {
  completedLevels: Set<number>;
  onStartTest: (type: TestType, levels: number[]) => void;
  onBack: () => void;
}

export function TestSelect({ completedLevels, onStartTest, onBack }: TestSelectProps) {
  const [testType, setTestType] = useState<TestType>('recognition');
  const [scope, setScope] = useState<'all' | 'pick'>('all');
  const [pickedLevels, setPickedLevels] = useState<Set<number>>(new Set());

  const completedArr = Array.from(completedLevels).sort((a, b) => a - b);

  const toggleLevel = (lvl: number) => {
    setPickedLevels(prev => {
      const next = new Set(prev);
      if (next.has(lvl)) next.delete(lvl);
      else next.add(lvl);
      return next;
    });
  };

  const selectedLevels = scope === 'all' ? completedArr : Array.from(pickedLevels).sort((a, b) => a - b);
  const canStart = selectedLevels.length > 0;

  return (
    <div className="test-select">
      <div className="test-select-header">
        <button className="test-back-btn" onClick={onBack}>← 返回</button>
        <h1 className="test-select-title">📝 测试</h1>
      </div>

      <div className="test-select-card">
        <h2 className="test-section-title">选择测试类型</h2>
        <div className="test-type-options">
          <button
            className={`test-type-btn ${testType === 'recognition' ? 'test-type-btn--active' : ''}`}
            onClick={() => setTestType('recognition')}
          >
            <span className="test-type-icon">🔤</span>
            <span className="test-type-label">认字测试</span>
            <span className="test-type-desc">看字选拼音 / 看拼音选字</span>
          </button>
          <button
            className={`test-type-btn ${testType === 'listening' ? 'test-type-btn--active' : ''}`}
            onClick={() => setTestType('listening')}
          >
            <span className="test-type-icon">👂</span>
            <span className="test-type-label">听写测试</span>
            <span className="test-type-desc">听声音写汉字</span>
          </button>
          <button
            className={`test-type-btn ${testType === 'comprehension' ? 'test-type-btn--active' : ''}`}
            onClick={() => setTestType('comprehension')}
          >
            <span className="test-type-icon">📖</span>
            <span className="test-type-label">阅读理解</span>
            <span className="test-type-desc">看词语选意思</span>
          </button>
        </div>

        <h2 className="test-section-title">选择测试范围</h2>
        <div className="test-scope-options">
          <button
            className={`test-scope-btn ${scope === 'all' ? 'test-scope-btn--active' : ''}`}
            onClick={() => setScope('all')}
          >
            全部已学 ({completedArr.length}关)
          </button>
          <button
            className={`test-scope-btn ${scope === 'pick' ? 'test-scope-btn--active' : ''}`}
            onClick={() => setScope('pick')}
          >
            选择关卡
          </button>
        </div>

        {scope === 'pick' && (
          <div className="test-level-grid">
            {completedArr.map(lvl => {
              const config = characterLevels[lvl - 1];
              return (
                <button
                  key={lvl}
                  className={`test-level-chip ${pickedLevels.has(lvl) ? 'test-level-chip--active' : ''}`}
                  onClick={() => toggleLevel(lvl)}
                >
                  <span className="test-level-chip-num">第{lvl}关</span>
                  <span className="test-level-chip-name">{config.labelZh}</span>
                </button>
              );
            })}
          </div>
        )}

        <button
          className="test-start-btn"
          disabled={!canStart}
          onClick={() => onStartTest(testType, selectedLevels)}
        >
          🚀 开始测试
        </button>
      </div>
    </div>
  );
}

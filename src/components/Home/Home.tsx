import './Home.css';

interface Section {
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  locked?: boolean;
  onClick: () => void;
}

interface HomeProps {
  completedLevels: Set<number>;
  onGoToWriting: () => void;
  onGoToReading: () => void;
  onGoToTest: () => void;
  onGoToDaily: () => void;
  onGoToReadAlong: () => void;
  onGoToWordGame: () => void;
  onGoToWhackMole: () => void;
}

export function Home({ completedLevels, onGoToWriting, onGoToReading, onGoToTest, onGoToDaily, onGoToReadAlong, onGoToWordGame, onGoToWhackMole }: HomeProps) {
  const hasCompleted = completedLevels.size > 0;

  const sections: Section[] = [
    {
      emoji: '✏️',
      title: '写字小课堂',
      subtitle: '练习写汉字',
      color: 'blue',
      onClick: onGoToWriting,
    },
    {
      emoji: '📖',
      title: '阅读小课堂',
      subtitle: '阅读词语和句子',
      color: 'green',
      locked: !hasCompleted,
      onClick: onGoToReading,
    },
    {
      emoji: '📝',
      title: '测试',
      subtitle: '测试学过的字',
      color: 'purple',
      locked: !hasCompleted,
      onClick: onGoToTest,
    },
    {
      emoji: '🏆',
      title: '每日挑战',
      subtitle: '每天综合闯关',
      color: 'orange',
      locked: !hasCompleted,
      onClick: onGoToDaily,
    },
    {
      emoji: '🎤',
      title: '跟读练习',
      subtitle: '跟着读句子',
      color: 'red',
      locked: !hasCompleted,
      onClick: onGoToReadAlong,
    },
    {
      emoji: '🧩',
      title: '组词游戏',
      subtitle: '用字组成词语',
      color: 'teal',
      locked: !hasCompleted,
      onClick: onGoToWordGame,
    },
    {
      emoji: '🎯',
      title: '打地鼠',
      subtitle: '快速找到正确的字',
      color: 'amber',
      locked: !hasCompleted,
      onClick: onGoToWhackMole,
    },
  ];

  return (
    <div className="home">
      <div className="home-header">
        <h1 className="home-title">学中文</h1>
        <p className="home-subtitle">选择一个板块开始学习</p>
      </div>

      <div className="home-grid">
        {sections.map(section => (
          <button
            key={section.title}
            className={`home-card home-card--${section.color} ${section.locked ? 'home-card--locked' : ''}`}
            onClick={section.locked ? undefined : section.onClick}
            disabled={section.locked}
          >
            <span className="home-card-emoji">{section.locked ? '🔒' : section.emoji}</span>
            <span className="home-card-title">{section.title}</span>
            <span className="home-card-subtitle">
              {section.locked ? '完成1关后解锁' : section.subtitle}
            </span>
          </button>
        ))}
      </div>

      <div className="home-footer">
        <p>20关 · 100字 · 听说读写</p>
      </div>
    </div>
  );
}

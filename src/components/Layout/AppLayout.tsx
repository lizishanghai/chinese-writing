import type { ReactNode } from 'react';
import './AppLayout.css';

interface AppLayoutProps {
  sidebar: ReactNode;
  writingArea: ReactNode;
  feedbackPanel: ReactNode;
}

export function AppLayout({ sidebar, writingArea, feedbackPanel }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="app-title">
          <span className="app-title-icon">✏️</span>
          <span className="app-title-zh">写字小课堂</span>
          <span className="app-title-en">Chinese Writing</span>
        </h1>
      </header>
      <div className="app-content">
        <aside className="app-sidebar">{sidebar}</aside>
        <main className="app-main">{writingArea}</main>
        <aside className="app-feedback">{feedbackPanel}</aside>
      </div>
    </div>
  );
}

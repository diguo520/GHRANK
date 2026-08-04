/**
 * About 关于页 —— Next.js App Router
 * 迁移自 about.html + 内联脚本
 * 功能：侧边栏目录导航 + 无刷新切换面板 + hash 路由 + 键盘方向键
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AboutSidebar from './_components/AboutSidebar';
import { AboutPanel, SponsorsPanel, ChangelogPanel, AchievementsPanel, TermsPanel } from './_components/AboutPanels';
import { VALID_PANELS, isValidPanel, type PanelId } from './_data/about-data';

export default function AboutPage() {
  const [activePanel, setActivePanel] = useState<PanelId>('about');
  const layoutRef = useRef<HTMLDivElement>(null);

  /** 激活指定面板：更新状态 + 同步 hash + 滚动到内容顶部 */
  const activatePanel = useCallback((name: PanelId) => {
    setActivePanel(name);
    // 同步 hash（无刷新），支持浏览器前进/后退
    if (typeof window !== 'undefined' && window.location.hash !== '#' + name) {
      window.history.replaceState(null, '', '#' + name);
    }
    // 滚动到布局顶部（保留 sticky nav 上方空间）
    const layout = layoutRef.current;
    if (layout) {
      const top = layout.getBoundingClientRect().top + window.scrollY - 80;
      if (window.scrollY > top + 20) {
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  }, []);

  // 初始 hash 路由 + hashchange 监听（支持浏览器前进/后退）
  useEffect(() => {
    const initial = window.location.hash.replace('#', '');
    if (isValidPanel(initial)) {
      setActivePanel(initial);
    }
    const onHashChange = () => {
      const name = window.location.hash.replace('#', '');
      if (isValidPanel(name)) {
        setActivePanel(name);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // 键盘上下方向键切换面板
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框内的按键与组合键
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const current = isValidPanel(activePanel) ? activePanel : 'about';
        let idx = VALID_PANELS.indexOf(current);
        idx = e.key === 'ArrowDown'
          ? Math.min(VALID_PANELS.length - 1, idx + 1)
          : Math.max(0, idx - 1);
        activatePanel(VALID_PANELS[idx]);
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activePanel, activatePanel]);

  return (
    <main className="main-content">
      <div
        ref={layoutRef}
        className="about-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '40px',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '32px 32px 60px',
          alignItems: 'start',
        }}
      >
        <AboutSidebar activePanel={activePanel} onActivate={activatePanel} />

        {/* 主内容区 */}
        <div style={{ minWidth: 0 }}>
          {/* 面板切换入场动画 —— key 变化时重新触发 */}
          <div
            key={activePanel}
            style={{ animation: 'about-panel-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) both' }}
          >
            {activePanel === 'about' && <AboutPanel />}
            {activePanel === 'sponsors' && <SponsorsPanel />}
            {activePanel === 'changelog' && <ChangelogPanel />}
            {activePanel === 'achievements' && <AchievementsPanel />}
            {activePanel === 'terms' && <TermsPanel />}
          </div>

          {/* 返回顶部 */}
          <div
            style={{
              marginTop: '48px',
              paddingTop: '24px',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
            }}
          >
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                activatePanel('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                padding: '10px 22px',
                border: '1px solid var(--border)',
                transition: 'color 0.2s ease, border-color 0.2s ease, background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--gold)';
                e.currentTarget.style.borderColor = 'var(--gold)';
                e.currentTarget.style.background = 'rgba(245, 197, 24, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-dim)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {'\u2191'} BACK TO TOP
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

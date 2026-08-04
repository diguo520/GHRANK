/**
 * 首页 Leaderboard —— EVE Online HUD 风格项目排行
 * 整合 Hero + 统计条 + 分类滚动 + 卡片网格（骨架屏+IO+分块加载）
 */
'use client';

import { useState, useCallback } from 'react';
import LeaderboardGrid from './_components/leaderboard/LeaderboardGrid';
import { CATEGORIES, type CategoryItem } from './_data/leaderboard-data';
import StatsStrip from './_components/StatsStrip';
import ActivityMap from './_components/ActivityMap';

/** 时间段选项 —— 与原始 .design index.html data-period 一致 */
const TIME_PERIODS = ['day', 'week', 'month', 'year'] as const;
type TimePeriod = (typeof TIME_PERIODS)[number];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  // 默认选中 week，与原始 .design index.html 的 active 状态一致
  const [activeTimePeriod, setActiveTimePeriod] = useState<TimePeriod>('week');

  const handleCategoryClick = useCallback((cat: CategoryItem) => {
    setActiveCategory(cat.categoryKey);
  }, []);

  const handleTimeTabClick = useCallback((period: TimePeriod) => {
    setActiveTimePeriod(period);
  }, []);
  return (
    <main className="main-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 var(--sp-5)', position: 'relative' }}>
      {/* ═══ HERO 区域 —— 与 .design 首页保持文案/结构一致 ═══ */}
      <section className="hero py-8 text-center" style={{ padding: 'var(--sp-8) 0 var(--sp-6)' }}>
        <h1
          className="hero-title font-display font-extrabold uppercase"
          style={{
            fontSize: 'clamp(2rem, 6vw, 4.2rem)',
            letterSpacing: '4px',
            lineHeight: 1.1,
            color: 'var(--text)',
            marginBottom: 'var(--sp-3)',
          }}
        >
          OPEN SOURCE{' '}
          <span className="typewriter gold-glow" style={{ display: 'inline-block', color: 'var(--gold)', borderRight: '2px solid var(--gold)', paddingRight: '4px', animation: 'cursor-blink 1s step-end infinite' }}>
            OPERATING SYSTEM
          </span>
        </h1>
        <p
          className="hero-sub font-body"
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.3rem)',
            color: 'var(--text-dim)',
            letterSpacing: '1px',
            marginBottom: 'var(--sp-6)',
          }}
        >
          Every Repo. Every Star. Every Contributor. <span className="gold">Connected.</span>
        </p>

        {/* HERO 三栏布局：侧面板 + 星图 + 侧面板 */}
        <div className="hero-content flex flex-wrap items-center justify-center gap-6" style={{ marginTop: 'var(--sp-5)' }}>
          {/* 左侧面板 —— 与 .design 一致 */}
          <div className="flank-panel left hidden md:flex flex-col gap-4 min-w-[180px] text-right">
            <div className="flank-item flex flex-col gap-0.5 items-end">
              <span className="flank-label font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>TRACKING &rarr;</span>
              <span className="flank-value font-display text-sm font-semibold tracking-wide" style={{ color: 'var(--text)' }}><span className="gold">12,847</span> Repos</span>
            </div>
            <div className="flank-item flex flex-col gap-0.5 items-end">
              <span className="flank-label font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>RANKING &rarr;</span>
              <span className="flank-value font-display text-sm font-semibold tracking-wide" style={{ color: 'var(--text)' }}>Multi-Factor Score</span>
            </div>
          </div>

          {/* 中央星图 */}
          <ActivityMap />

          {/* 右侧面板 —— 与 .design 一致 */}
          <div className="flank-panel right hidden md:flex flex-col gap-4 min-w-[180px] text-left">
            <div className="flank-item flex flex-col gap-0.5 items-start">
              <span className="flank-label font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>LIVE &rarr;</span>
              <span className="flank-value font-display text-sm font-semibold tracking-wide" style={{ color: 'var(--text)' }}>Real-time Data</span>
            </div>
            <div className="flank-item flex flex-col gap-0.5 items-start">
              <span className="flank-label font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>SCOUTING &rarr;</span>
              <span className="flank-value font-display text-sm font-semibold tracking-wide" style={{ color: 'var(--text)' }}>Trend Detection</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 统计条 ═══ */}
      <StatsStrip />

      {/* ═══ 分类滚动条 ═══ */}
      <section className="category-section mb-4 relative">
        <div className="category-label font-display text-[10px] font-bold uppercase mb-3 pl-3 border-l-2 border-gold leading-none opacity-70" style={{ letterSpacing: '3px', color: 'var(--gold)' }}>
          CATEGORIES
        </div>
        <div className="category-scroll flex gap-0 overflow-x-auto overflow-y-hidden pb-2" style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat, i) => {
            const isActive = activeCategory === cat.categoryKey;
            return (
              <button
                key={cat.label}
                onClick={() => handleCategoryClick(cat)}
                className={`chip relative inline-flex items-center gap-2 px-3.5 py-1.5 border font-display text-[11px] font-semibold uppercase whitespace-nowrap transition-all ${i === 0 ? 'border-l' : 'border-l-0'} ${isActive ? 'bg-gold-subtle border-gold text-gold' : 'border-border text-text-dim hover:text-text hover:bg-gold/5'}`}
                style={{
                  borderRadius: 0,
                  letterSpacing: '1px',
                  userSelect: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'var(--gold-subtle)' : 'transparent',
                  borderColor: isActive ? 'var(--gold)' : 'var(--border)',
                  color: isActive ? 'var(--gold)' : 'var(--text-dim)',
                }}
              >
                {cat.label}
                <span className="count font-mono text-[10px]" style={{ color: isActive ? 'var(--gold)' : 'var(--text-muted)', opacity: isActive ? 1 : 0.6 }}>
                  {cat.count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══ 控制行 ═══ */}
      <section className="controls-row flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="controls-left font-mono text-xs" style={{ color: 'var(--text-dim)', letterSpacing: '0.5px' }}>
          // SHOWING 1-12 OF 12,847 REPOS
        </div>
        <div className="controls-right flex items-center gap-3">
          {/* 时间段切换 —— 与 .design 一致：Day / Week / Month / Year */}
          <div className="time-tabs inline-flex overflow-hidden rounded-sm border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            {TIME_PERIODS.map((period) => {
              const isActive = activeTimePeriod === period;
              return (
                <button
                  key={period}
                  onClick={() => handleTimeTabClick(period)}
                  className="time-tab px-3 py-2 font-display text-xs font-semibold uppercase transition-all"
                  style={{
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    color: isActive ? 'var(--gold)' : 'var(--text-dim)',
                    background: isActive ? 'var(--gold-subtle)' : 'transparent',
                  }}
                >
                  {period}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 卡片网格（骨架屏 + IO + 分块加载） ═══ */}
      {/* key 绑定分类+时间段，筛选变化时强制重挂载，确保 useChunkedData 状态完全重置 */}
      <LeaderboardGrid
        key={`${activeCategory ?? 'all'}-${activeTimePeriod}`}
        activeCategory={activeCategory}
        activeTimePeriod={activeTimePeriod}
      />
    </main>
  );
}

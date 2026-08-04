/**
 * SkillsGrid —— 技能列表网格
 * 核心逻辑：骨架屏逐批替换 → IntersectionObserver 无限滚动 → 数据分块加载
 * 迁移自 skills.js 的 renderNextBatch / initSkeletonReplace / initInfiniteScroll
 * 参考 LeaderboardGrid 的 React 实现模式
 */

'use client';

import { useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { useChunkedData } from '@/hooks/useChunkedData';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { Skill, SortMode } from '../_data/skills-data';
import SkillCard from './SkillCard';

/** 每批骨架屏替换数量 */
const SKELETON_BATCH = 6;
/** 无限滚动每批加载数量 */
const INFINITE_BATCH = 6;
/** 初始骨架屏延迟（ms） */
const INITIAL_DELAY = 1200;
/** 无限滚动加载延迟（ms） */
const LOAD_DELAY = 600;

/** 行式 grid 布局列宽 */
const GRID_COLS = '48px 44px 1fr auto 130px 90px';

/** 高对比 shimmer 背景（匹配原始 skills.css 骨架屏样式） */
const shimmerBg = {
  background:
    'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.2s infinite',
  borderRadius: '3px',
};

/** 单行骨架屏 —— 列结构匹配 skills-card 的 grid 布局 */
function SkeletonRow() {
  return (
    <div
      className="skeleton-card skills-card"
      style={{
        display: 'grid',
        gridTemplateColumns: GRID_COLS,
        alignItems: 'center',
        gap: '16px',
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        pointerEvents: 'none',
      }}
    >
      {/* 排名占位 */}
      <div style={{ ...shimmerBg, width: '28px', height: '18px', margin: '0 auto' }} />
      {/* 趋势占位 */}
      <div style={{ ...shimmerBg, width: '20px', height: '18px', margin: '0 auto' }} />
      {/* 技能信息占位 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ ...shimmerBg, height: '14px', width: '130px' }} />
        <div style={{ ...shimmerBg, height: '12px', width: '110px' }} />
      </div>
      {/* 标签占位 */}
      <div style={{ ...shimmerBg, width: '60px', height: '16px' }} />
      {/* 统计占位 */}
      <div style={{ ...shimmerBg, width: '90px', height: '14px', marginLeft: 'auto' }} />
      {/* Sparkline 占位 */}
      <div style={{ ...shimmerBg, width: '60px', height: '24px', marginLeft: 'auto' }} />
    </div>
  );
}

interface SkillsGridProps {
  /** 已筛选+排序的技能列表 */
  skills: Skill[];
  /** 当前排序模式 */
  sortMode: SortMode;
}

export default function SkillsGrid({ skills, sortMode }: SkillsGridProps) {
  // 将数据拆分为初始数据（首屏骨架屏替换）和更多数据（无限滚动）
  const initialData = skills.slice(0, SKELETON_BATCH);
  const moreData = skills.slice(SKELETON_BATCH);

  // 分块数据管理
  const {
    visibleItems,
    skeletonCount,
    loading,
    exhausted,
    initialDone,
    loadMore: chunkedLoadMore,
    replaceNextBatch,
  } = useChunkedData<Skill>({
    initialData,
    moreData,
    skeletonBatch: SKELETON_BATCH,
    infiniteBatch: INFINITE_BATCH,
    initialDelay: INITIAL_DELAY,
  });

  // 无限滚动 hook
  const { sentinelRef, pause, resume } = useInfiniteScroll<HTMLDivElement>({
    hasMore: !exhausted,
    loading,
    onLoadMore: chunkedLoadMore,
    initialDone,
  });

  // ── 阶段 1：初始骨架屏逐批替换 ──
  const replacingRef = useRef(false);

  const tryReplaceBatch = useCallback(() => {
    if (replacingRef.current || initialDone) return;
    replacingRef.current = true;
    replaceNextBatch();
    replacingRef.current = false;
  }, [replaceNextBatch, initialDone]);

  // 初始延迟后替换第一批
  useEffect(() => {
    const timer = setTimeout(tryReplaceBatch, INITIAL_DELAY);
    return () => clearTimeout(timer);
  }, [tryReplaceBatch]);

  // 持续替换：当还有骨架屏时，定时触发下一批
  useEffect(() => {
    if (initialDone || skeletonCount === 0) return;
    const interval = setInterval(() => {
      if (initialDone || skeletonCount === 0) {
        clearInterval(interval);
        return;
      }
      tryReplaceBatch();
    }, 400);
    return () => clearInterval(interval);
  }, [initialDone, skeletonCount, tryReplaceBatch]);

  // ── 阶段 2：无限滚动加载时暂停/恢复 observer ──
  useEffect(() => {
    if (loading) {
      pause();
      const timer = setTimeout(() => resume(), LOAD_DELAY + 50);
      return () => clearTimeout(timer);
    }
  }, [loading, pause, resume]);

  // 骨架屏数组
  const skeletons = Array.from({ length: skeletonCount }, (_, i) => i);

  // 列表表头
  const headerStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: GRID_COLS,
    alignItems: 'center',
    gap: '16px',
    padding: '10px 18px',
    borderBottom: '1px solid var(--border)',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  };

  return (
    <div className="skills-grid" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 列表表头 */}
      <div className="skills-list-header" style={headerStyle}>
        <span style={{ textAlign: 'center' }}>#</span>
        <span style={{ textAlign: 'center' }}>Trend</span>
        <span>Skill</span>
        <span className="col-tags">Tags</span>
        <span style={{ textAlign: 'right' }}>Installs</span>
        <span className="col-sparkline" style={{ textAlign: 'right' }}>Activity</span>
      </div>

      {/* 已加载的真实卡片 */}
      {visibleItems.map((skill, idx) => (
        <SkillCard
          key={skill.id}
          skill={skill}
          rank={idx + 1}
          sortMode={sortMode}
        />
      ))}

      {/* 骨架屏占位 */}
      {skeletons.map((i) => (
        <SkeletonRow key={`skel-${i}`} />
      ))}

      {/* 无限滚动哨兵 + 加载指示器 */}
      <div
        ref={sentinelRef}
        className="infinite-scroll-sentinel"
        style={{ padding: '24px 0', minHeight: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        {loading && (
          <div
            className="scroll-loader"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}
          >
            <div
              className="scroll-loader-spinner"
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: '2px solid var(--border)',
                borderTopColor: 'var(--gold)',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            LOADING MORE...
          </div>
        )}
        {exhausted && !loading && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '1px',
              color: 'var(--text-muted)',
              opacity: 0.4,
            }}
          >
            // END OF FEED
          </div>
        )}
      </div>
    </div>
  );
}

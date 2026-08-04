/**
 * PromptGrid —— Prompt 卡片网格（骨架屏 + IO + 分块加载 + 分类过滤）
 * 核心逻辑：useChunkedData 管理分块替换 → useInfiniteScroll 触发无限滚动
 * 迁移自 prompt.js 的骨架屏 Intersection Observer + 无限滚动体系
 */
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useChunkedData } from '@/hooks/useChunkedData';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import {
  INITIAL_PROMPTS,
  MORE_PROMPTS,
  type PromptCardData,
} from '../_data/prompt-data';
import PromptCard from './PromptCard';

/* ── 常量配置 ── */
const SKELETON_BATCH = 8; // 每批替换骨架屏数量
const INFINITE_BATCH = 6; // 无限滚动每批加载数量
const INITIAL_DELAY = 1200; // 初始骨架屏延迟（ms）
const LOAD_DELAY = 600; // 无限滚动加载延迟（ms）

/* ── shimmer 背景样式（骨架屏占位） ── */
const shimmerBg = {
  background:
    'linear-gradient(90deg, var(--surface) 25%, var(--surface-overlay) 50%, var(--surface) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
} as const;

/**
 * Prompt 骨架卡片 —— 填充网格单元格的 shimmer 占位
 * 根据 height 类型决定 grid-row 跨度，与真实卡片尺寸一致避免布局抖动
 */
function PromptSkeletonCard({ height }: { height: 'tall' | 'short' }) {
  return (
    <div
      className={`overflow-hidden rounded-xl ${height === 'tall' ? 'md:row-span-2' : ''}`}
      style={{
        ...shimmerBg,
        border: '1px solid var(--border)',
        pointerEvents: 'none',
      }}
    />
  );
}

interface PromptGridProps {
  /** 当前激活的分类筛选（'all' 表示全部） */
  activeCategory: string;
}

export default function PromptGrid({ activeCategory }: PromptGridProps) {
  // ── 分块数据管理 ──
  const {
    visibleItems,
    skeletonCount,
    loading,
    exhausted,
    initialDone,
    loadMore: chunkedLoadMore,
    replaceNextBatch,
  } = useChunkedData<PromptCardData>({
    initialData: INITIAL_PROMPTS,
    moreData: MORE_PROMPTS,
    skeletonBatch: SKELETON_BATCH,
    infiniteBatch: INFINITE_BATCH,
    initialDelay: INITIAL_DELAY,
  });

  // ── 无限滚动 hook ──
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

  // 持续替换：当还有骨架屏时，用定时器触发下一批
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

  // ── 分类过滤：在渲染层过滤已加载的卡片 ──
  const filteredItems =
    activeCategory === 'all'
      ? visibleItems
      : visibleItems.filter((item) => item.model.includes(activeCategory));

  // 骨架屏对应的卡片高度（按初始数据顺序推断）
  const skeletonHeights: ('tall' | 'short')[] = [];
  for (let i = 0; i < skeletonCount; i++) {
    const idx = visibleItems.length + i;
    const height = INITIAL_PROMPTS[idx]?.height || 'tall';
    skeletonHeights.push(height);
  }

  return (
    <div
      className="grid gap-4 [grid-auto-flow:dense] [grid-auto-rows:220px] md:[grid-auto-rows:200px] grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
      style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 32px 48px' }}
    >
      {/* 已加载的真实卡片（按分类过滤） */}
      {filteredItems.map((item, i) => (
        <div
          key={`prompt-${i}`}
          className={`h-full ${item.height === 'tall' ? 'md:row-span-2' : ''}`}
          style={{ animation: 'cardFadeIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
        >
          <PromptCard item={item} />
        </div>
      ))}

      {/* 骨架屏占位（初始加载阶段） */}
      {skeletonHeights.map((height, i) => (
        <PromptSkeletonCard key={`skel-${i}`} height={height} />
      ))}

      {/* 无限滚动哨兵 + 加载指示器 */}
      <div
        ref={sentinelRef}
        className="col-span-full flex min-h-[60px] items-center justify-center py-6"
        style={{ pointerEvents: 'none' }}
      >
        {loading && (
          <div
            className="flex items-center gap-2.5 font-mono text-[10px] tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            <div
              className="h-4 w-4 rounded-full border-2"
              style={{
                borderColor: 'var(--border)',
                borderTopColor: 'var(--gold)',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            LOADING MORE...
          </div>
        )}
        {exhausted && !loading && (
          <div
            className="font-mono text-[11px] tracking-wide"
            style={{ color: 'var(--text-muted)', opacity: 0.4 }}
          >
            // END OF FEED
          </div>
        )}
      </div>
    </div>
  );
}

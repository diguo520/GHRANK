/**
 * LeaderboardGrid —— 卡片网格组件
 * 核心逻辑：骨架屏逐批替换 → IntersectionObserver 无限滚动 → 数据分块加载
 * 迁移自 index.js 的骨架屏 + IO + 分块加载体系
 */
'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useChunkedData } from '@/hooks/useChunkedData';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { SkeletonCard } from '@/components/skeleton/Skeleton';
import LeaderboardCard from './LeaderboardCard';
import {
  INITIAL_CARDS,
  generateMoreCards,
  type LeaderboardCard as CardData,
} from '../../_data/leaderboard-data';

const SKELETON_BATCH = 8; // 每批替换骨架屏数量
const INFINITE_BATCH = 4; // 无限滚动每批加载数量
const INITIAL_DELAY = 1200; // 初始骨架屏延迟（ms）
const LOAD_DELAY = 600; // 无限滚动加载延迟（ms）

/**
 * 时间段包含关系：day ⊂ week ⊂ month ⊂ year
 * 选 week 时也显示 day 的卡片，选 month 时显示 day+week+month，以此类推
 */
const PERIOD_RANK: Record<string, number> = { day: 1, week: 2, month: 3, year: 4 };

interface LeaderboardGridProps {
  /** 当前激活的分类筛选，null 表示全部 */
  activeCategory: string | null;
  /** 当前激活的时间段筛选（day/week/month/year） */
  activeTimePeriod: string;
}

export default function LeaderboardGrid({ activeCategory, activeTimePeriod }: LeaderboardGridProps) {
  const activeRank = PERIOD_RANK[activeTimePeriod] ?? 4;

  // 根据分类 + 时间段筛选数据（初始数据 + 无限滚动数据）
  const filterByPeriod = useCallback(
    (card: CardData) => (PERIOD_RANK[card.updated] ?? 4) <= activeRank,
    [activeRank],
  );

  const filteredInitial = useMemo(() => {
    let result = INITIAL_CARDS;
    if (activeCategory) {
      result = result.filter((card) => card.category === activeCategory);
    }
    return result.filter(filterByPeriod);
  }, [activeCategory, filterByPeriod]);

  const filteredMore = useMemo(() => {
    let result = generateMoreCards(40);
    if (activeCategory) {
      result = result.filter((card) => card.category === activeCategory);
    }
    return result.filter(filterByPeriod);
  }, [activeCategory, filterByPeriod]);

  const moreCardsRef = useRef<CardData[]>(filteredMore);
  // 分类变化时同步 moreCardsRef
  useEffect(() => {
    moreCardsRef.current = filteredMore;
  }, [filteredMore]);

  // 分块数据管理
  const {
    visibleItems,
    skeletonCount,
    loading,
    exhausted,
    initialDone,
    loadMore: chunkedLoadMore,
    replaceNextBatch,
    reset,
  } = useChunkedData<CardData>({
    initialData: filteredInitial,
    moreData: moreCardsRef.current,
    skeletonBatch: SKELETON_BATCH,
    infiniteBatch: INFINITE_BATCH,
    initialDelay: INITIAL_DELAY,
  });

  // 分类或时间段切换时重置列表状态
  useEffect(() => {
    reset();
  }, [activeCategory, activeTimePeriod, reset]);

  // 无限滚动 hook
  const { sentinelRef, pause, resume } = useInfiniteScroll<HTMLDivElement>({
    hasMore: !exhausted,
    loading,
    onLoadMore: chunkedLoadMore,
    initialDone,
  });

  // ── 阶段 1：初始骨架屏逐批替换 ──
  // 延迟后开始替换，然后持续检查是否需要继续替换
  const replacingRef = useRef(false);

  const tryReplaceBatch = useCallback(() => {
    if (replacingRef.current || initialDone) return;
    replacingRef.current = true;
    replaceNextBatch();
    replacingRef.current = false;
  }, [replaceNextBatch, initialDone]);

  useEffect(() => {
    // 初始延迟后替换第一批
    const timer = setTimeout(tryReplaceBatch, INITIAL_DELAY);
    return () => clearTimeout(timer);
  }, [tryReplaceBatch]);

  // 持续替换：当还有骨架屏时，用定时器触发下一批
  useEffect(() => {
    if (initialDone || skeletonCount === 0) return;

    // 使用定时器持续替换（每 400ms 替换一批，直到骨架屏清空）
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

  // 生成骨架屏数组
  const skeletons = Array.from({ length: skeletonCount }, (_, i) => i);

  return (
    <div className="mb-8">
      {/* 卡片网格 */}
      <div
        className="card-grid grid gap-4"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        }}
      >
        {/* 已加载的真实卡片 */}
        {visibleItems.map((item) => (
          <LeaderboardCard key={`card-${item.rank}`} item={item} />
        ))}

        {/* 骨架屏占位 */}
        {skeletons.map((i) => (
          <SkeletonCard key={`skel-${i}`} />
        ))}

        {/* 无限滚动哨兵 + 加载指示器 */}
        <div
          ref={sentinelRef}
          className="infinite-scroll-sentinel col-span-full flex min-h-[60px] justify-center py-6"
        >
          {loading && (
            <div className="scroll-loader flex items-center gap-2 font-mono text-xs text-text-muted">
              <div
                className="scroll-loader-spinner h-[18px] w-[18px] rounded-full border-2 border-border"
                style={{ borderTopColor: 'var(--gold)', animation: 'spin 0.8s linear infinite' }}
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
    </div>
  );
}

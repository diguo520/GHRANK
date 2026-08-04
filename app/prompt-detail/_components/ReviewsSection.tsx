/**
 * ReviewsSection —— 评论区主容器
 * 迁移自 prompt-detail.html 的 .detail-reviews-section + prompt-detail-init.js 的过滤/无限滚动/灯箱逻辑
 * 职责：评论输入、过滤切换、骨架屏 → 初始数据 → 无限滚动加载、图片灯箱
 */
'use client';

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import {
  INITIAL_THREADS, generateReview, REVIEWS_CONFIG,
  formatNum, type ReviewThread,
} from '../_data/prompt-detail-data';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { usePromptDetail } from './PromptDetailProvider';
import ReviewCompose from './ReviewCompose';
import ReviewsToolbar from './ReviewsToolbar';
import DiscussionThread from './DiscussionThread';
import ImageLightbox from './ImageLightbox';

/** shimmer 背景（骨架屏占位） */
const shimmerBg = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-shimmer 1.6s infinite linear',
} as const;

/** 评论骨架屏占位 */
function ReviewSkeleton() {
  return (
    <div className="relative pointer-events-none" style={{ paddingLeft: '24px' }}>
      <span className="absolute rounded-full" style={{ left: 0, top: '18px', width: '11px', height: '11px', borderRadius: '50%', background: 'var(--text-muted)', border: '1px solid var(--border)' }} />
      <span className="absolute" style={{ left: '5px', top: '18px', bottom: 0, width: '1px', background: 'var(--border)' }} />
      <div className="flex gap-3">
        <div className="h-9 w-9 flex-shrink-0 rounded-full" style={{ ...shimmerBg, border: '1px solid transparent' }} />
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap gap-2">
            <div style={{ ...shimmerBg, width: '96px', height: '10px', borderRadius: '999px' }} />
            <div style={{ ...shimmerBg, width: '58px', height: '10px', borderRadius: '999px' }} />
            <div style={{ ...shimmerBg, width: '72px', height: '10px', borderRadius: '999px' }} />
          </div>
          <div className="mb-3 flex flex-col gap-2">
            <div style={{ ...shimmerBg, width: '100%', height: '10px', borderRadius: '999px' }} />
            <div style={{ ...shimmerBg, width: '62%', height: '10px', borderRadius: '999px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsSection() {
  const { reviewTotal } = usePromptDetail();

  // ── 状态 ──
  const [filter, setFilter] = useState('all');
  const [threads, setThreads] = useState<ReviewThread[]>([]);
  const [skeletonCount, setSkeletonCount] = useState(REVIEWS_CONFIG.INITIAL_SKELETON_COUNT);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // ── Refs ──
  const pageRef = useRef(0);
  const genCounterRef = useRef(0);
  const loadingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── 灯箱状态 ──
  const [lightbox, setLightbox] = useState<{ open: boolean; images: string[]; index: number }>({ open: false, images: [], index: 0 });

  /** 初始加载 / 过滤切换 */
  useEffect(() => {
    // 重置状态
    setThreads([]);
    setSkeletonCount(REVIEWS_CONFIG.INITIAL_SKELETON_COUNT);
    setExhausted(false);
    setInitialLoaded(false);
    pageRef.current = 0;
    genCounterRef.current = 0;

    const timer = setTimeout(() => {
      if (filter === 'all') {
        setThreads(INITIAL_THREADS);
      } else {
        // 过滤模式：生成 8 条初始评论
        const initial = Array.from({ length: 8 }, (_, i) => generateReview(i, filter));
        genCounterRef.current = 8;
        setThreads(initial);
      }
      setSkeletonCount(0);
      setInitialLoaded(true);
    }, REVIEWS_CONFIG.INITIAL_DELAY);

    return () => clearTimeout(timer);
  }, [filter]);

  /** 加载更多（无限滚动） */
  const loadMore = useCallback(() => {
    if (loadingRef.current || exhausted || !initialLoaded) return;
    loadingRef.current = true;
    setLoading(true);
    setSkeletonCount(REVIEWS_CONFIG.CHUNK_SIZE);

    setTimeout(() => {
      const startIdx = genCounterRef.current;
      const newThreads = Array.from(
        { length: REVIEWS_CONFIG.CHUNK_SIZE },
        (_, i) => generateReview(startIdx + i, filter),
      );
      genCounterRef.current += REVIEWS_CONFIG.CHUNK_SIZE;

      setThreads((prev) => [...prev, ...newThreads]);
      setSkeletonCount(0);
      setLoading(false);
      loadingRef.current = false;
      pageRef.current += 1;

      if (pageRef.current >= REVIEWS_CONFIG.MAX_PAGES) {
        setExhausted(true);
      }
    }, REVIEWS_CONFIG.CHUNK_DELAY);
  }, [filter, exhausted, initialLoaded]);

  // ── 无限滚动 ──
  const { sentinelRef, pause, resume } = useInfiniteScroll<HTMLDivElement>({
    hasMore: !exhausted,
    loading,
    onLoadMore: loadMore,
    initialDone: initialLoaded,
  });

  // 加载中暂停 observer
  useEffect(() => {
    if (loading) {
      pause();
      const timer = setTimeout(() => resume(), REVIEWS_CONFIG.CHUNK_DELAY + 50);
      return () => clearTimeout(timer);
    }
  }, [loading, pause, resume]);

  // ── 灯箱操作 ──
  const handleImageClick = (images: string[], index: number) => setLightbox({ open: true, images, index });
  const handleLightboxClose = () => setLightbox((p) => ({ ...p, open: false }));
  const handleLightboxPrev = () => setLightbox((p) => ({ ...p, index: (p.index - 1 + p.images.length) % p.images.length }));
  const handleLightboxNext = () => setLightbox((p) => ({ ...p, index: (p.index + 1) % p.images.length }));

  return (
    <div ref={containerRef} className="flex flex-col gap-5">
      {/* 标题行 */}
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
          User Reviews &amp; Discussion
        </h2>
        <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
          {formatNum(reviewTotal)} reviews
        </span>
      </div>

      {/* 评论输入 */}
      <ReviewCompose />

      {/* 过滤工具栏 */}
      <ReviewsToolbar active={filter} onSelect={setFilter} />

      {/* 讨论帖列表 */}
      <div className="flex flex-col gap-4">
        {threads.map((thread, i) => (
          <DiscussionThread key={`thread-${i}`} thread={thread} isFirst={i === 0} onImageClick={handleImageClick} />
        ))}

        {/* 骨架屏占位 */}
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ReviewSkeleton key={`skel-${i}`} />
        ))}
      </div>

      {/* 无限滚动哨兵 */}
      <div
        ref={sentinelRef}
        className="flex min-h-[60px] items-center justify-center py-5"
        style={{ pointerEvents: 'none' }}
      >
        {loading && (
          <div className="flex items-center gap-2.5 font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            <div className="h-4 w-4 rounded-full border-2" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)', animation: 'spin 0.8s linear infinite' }} />
            LOADING...
          </div>
        )}
        {exhausted && !loading && (
          <div className="font-mono text-center" style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px', opacity: 0.4, padding: '20px 0' }}>
            // End of feed
          </div>
        )}
      </div>

      {/* 图片灯箱 */}
      <ImageLightbox
        open={lightbox.open}
        images={lightbox.images}
        index={lightbox.index}
        onClose={handleLightboxClose}
        onPrev={handleLightboxPrev}
        onNext={handleLightboxNext}
      />
    </div>
  );
}

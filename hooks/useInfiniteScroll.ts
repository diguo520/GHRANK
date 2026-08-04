/**
 * useInfiniteScroll —— 封装 IntersectionObserver 无限滚动逻辑
 * 保留原有的 sentinel + rootMargin 预加载策略
 */
'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  /** 是否还有更多数据 */
  hasMore: boolean;
  /** 是否正在加载 */
  loading: boolean;
  /** 触发加载回调 */
  onLoadMore: () => void;
  /** 预加载距离（px），默认 400 */
  rootMargin?: string;
  /** 初始数据是否已加载完成（防止骨架屏阶段提前触发） */
  initialDone?: boolean;
}

export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>({
  hasMore,
  loading,
  onLoadMore,
  rootMargin = '400px',
  initialDone = true,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<T>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  // 用 ref 保存最新回调，避免 observer 频繁重建
  const callbackRef = useRef(onLoadMore);
  callbackRef.current = onLoadMore;

  const setupObserver = useCallback(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    if (!('IntersectionObserver' in window)) return;

    // 清理旧 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (!initialDone) return;
          callbackRef.current();
        });
      },
      { rootMargin }
    );

    observerRef.current.observe(sentinel);
  }, [rootMargin, initialDone]);

  useEffect(() => {
    setupObserver();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [setupObserver]);

  /** 暂停观察（加载中时） */
  const pause = useCallback(() => {
    if (observerRef.current && sentinelRef.current) {
      observerRef.current.unobserve(sentinelRef.current);
    }
  }, []);

  /** 恢复观察（加载完成后） */
  const resume = useCallback(() => {
    if (observerRef.current && sentinelRef.current && hasMore && !loading) {
      observerRef.current.observe(sentinelRef.current);
    }
  }, [hasMore, loading]);

  return { sentinelRef, pause, resume };
}

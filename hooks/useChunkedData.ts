/**
 * useChunkedData —— 封装数据分块加载逻辑
 * 保留原有的 SKELETON_BATCH + INFINITE_BATCH 分块策略
 * 骨架屏逐批替换 → 真实数据 → IntersectionObserver 无限滚动
 */
'use client';

import { useState, useRef, useCallback } from 'react';

interface UseChunkedDataOptions<T> {
  /** 初始数据（首屏） */
  initialData: T[];
  /** 更多数据（无限滚动用） */
  moreData: T[];
  /** 每批替换骨架屏数量，默认 8 */
  skeletonBatch?: number;
  /** 无限滚动每批加载数量，默认 4 */
  infiniteBatch?: number;
  /** 初始骨架屏延迟（ms），模拟数据请求，默认 1200 */
  initialDelay?: number;
}

interface UseChunkedDataResult<T> {
  /** 当前已显示的卡片 */
  visibleItems: T[];
  /** 当前骨架屏数量 */
  skeletonCount: number;
  /** 是否正在加载更多 */
  loading: boolean;
  /** 是否已加载全部 */
  exhausted: boolean;
  /** 初始骨架屏是否已全部替换 */
  initialDone: boolean;
  /** 触发加载更多（由 IntersectionObserver 调用） */
  loadMore: () => void;
  /** 替换下一批骨架屏为真实数据 */
  replaceNextBatch: () => void;
  /** 重置状态 */
  reset: () => void;
}

export function useChunkedData<T>({
  initialData,
  moreData,
  skeletonBatch = 8,
  infiniteBatch = 4,
  initialDelay = 1200,
}: UseChunkedDataOptions<T>): UseChunkedDataResult<T> {
  // 初始骨架屏数量：与首批数据一致，但不超过 skeletonBatch
  const initialSkeletonCount = Math.min(skeletonBatch, initialData.length);
  // 补充额外骨架屏，模拟完整网格
  const totalSkeletonCount = Math.min(skeletonBatch * 3, initialData.length + skeletonBatch * 2);

  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [skeletonCount, setSkeletonCount] = useState(totalSkeletonCount);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [initialDone, setInitialDone] = useState(false);

  // 用 ref 跟踪索引，避免闭包陷阱
  const initialIdxRef = useRef(0);
  const pageRef = useRef(0);
  const loadingRef = useRef(false);
  const exhaustedRef = useRef(false);
  const initialDoneRef = useRef(false);

  /** 替换下一批骨架屏为真实数据 */
  const replaceNextBatch = useCallback(() => {
    if (initialDoneRef.current) return;

    const toReplace = Math.min(skeletonBatch, skeletonCount);
    const start = initialIdxRef.current;
    const end = Math.min(start + toReplace, initialData.length);
    const batch = initialData.slice(start, end);

    if (batch.length === 0) {
      initialDoneRef.current = true;
      setInitialDone(true);
      setSkeletonCount(0);
      return;
    }

    initialIdxRef.current = end;
    setVisibleItems((prev) => [...prev, ...batch]);
    setSkeletonCount((prev) => Math.max(0, prev - batch.length));

    // 检查是否已加载完所有初始数据
    if (end >= initialData.length) {
      initialDoneRef.current = true;
      setInitialDone(true);
      setSkeletonCount(0);
    }
  }, [initialData, skeletonBatch, skeletonCount]);

  /** 加载更多（无限滚动） */
  const loadMore = useCallback(() => {
    if (loadingRef.current || exhaustedRef.current || !initialDoneRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    // 模拟网络延迟
    setTimeout(() => {
      const start = pageRef.current * infiniteBatch;
      const batch = moreData.slice(start, start + infiniteBatch);

      if (batch.length === 0) {
        exhaustedRef.current = true;
        setExhausted(true);
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      setVisibleItems((prev) => [...prev, ...batch]);
      pageRef.current += 1;
      setLoading(false);
      loadingRef.current = false;
    }, 600);
  }, [moreData, infiniteBatch]);

  /** 重置状态 */
  const reset = useCallback(() => {
    initialIdxRef.current = 0;
    pageRef.current = 0;
    loadingRef.current = false;
    exhaustedRef.current = false;
    initialDoneRef.current = false;
    setVisibleItems([]);
    setSkeletonCount(totalSkeletonCount);
    setLoading(false);
    setExhausted(false);
    setInitialDone(false);
  }, [totalSkeletonCount]);

  return {
    visibleItems,
    skeletonCount,
    loading,
    exhausted,
    initialDone,
    loadMore,
    replaceNextBatch,
    reset,
  };
}

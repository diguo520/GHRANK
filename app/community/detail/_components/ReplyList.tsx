/**
 * ReplyList —— 回复列表
 * 迁移自 community-detail.html 的 .post-replies 与 community-detail.js 的回复加载逻辑
 *
 * 加载流程：
 *   1. 初始显示 4 个骨架屏
 *   2. 600ms 后替换为前 6 条真实回复（按当前排序）
 *   3. IntersectionObserver 触发无限滚动，每次加载 6 条
 *   4. 全部加载完毕显示 End of replies
 *
 * 排序切换：通过 key={sortOrder} 重新挂载内部组件，触发骨架屏流程
 */
'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Segmented } from 'antd';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { SkeletonAvatar, SkeletonLine } from '@/components/skeleton/Skeleton';
import ReplyItem from './ReplyItem';
import { useCommunityToast } from './ToastContext';
import {
  generateReplies,
  sortReplies,
  TOTAL_REPLIES,
  REPLY_PAGE_SIZE,
  REPLY_SKELETON_COUNT,
  REPLY_INITIAL_DELAY,
  type SortOrder,
} from '../_data/community-detail-data';

/* ── 排序选项 ── */
const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'oldest', label: 'Oldest' },
  { value: 'newest', label: 'Newest' },
  { value: 'best', label: 'Best' },
];

/* ── 回复骨架屏（匹配 reply-item 紧凑布局） ── */
function ReplySkeleton() {
  return (
    <div
      className="flex gap-3"
      style={{
        padding: '8px 0',
        marginBottom: '2px',
      }}
    >
      <SkeletonAvatar size={32} shape="round" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex gap-2">
          <SkeletonLine width="80px" height="10px" />
          <SkeletonLine width="60px" height="8px" />
        </div>
        <SkeletonLine width="60%" height="10px" />
        <SkeletonLine width="90%" height="10px" />
      </div>
    </div>
  );
}

/* ── 加载指示器 ── */
function ScrollLoader() {
  return (
    <div
      className="flex items-center gap-2.5 font-mono text-[10px]"
      style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}
    >
      <div
        className="w-4 h-4 rounded-full border-2"
        style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)', animation: 'spin 0.8s linear infinite' }}
      />
      LOADING MORE...
    </div>
  );
}

/* ── 回复列表内部组件（管理骨架屏 + IO 无限滚动） ──
   通过 key={sortOrder} 重新挂载，触发骨架屏重新加载流程 */
function ReplyListInner({ sortOrder }: { sortOrder: SortOrder }) {
  // 确定性生成全部回复（SSR 安全）
  const allReplies = useMemo(() => generateReplies(), []);
  // 按排序方式排序
  const sortedReplies = useMemo(() => sortReplies(allReplies, sortOrder), [allReplies, sortOrder]);

  // 加载状态
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [visibleCount, setVisibleCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(false);

  // 用 ref 跟踪 loading，防止 IO 重复触发
  const loadingRef = useRef(false);

  /* ── 初始加载：延迟后显示首页回复 ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
      setVisibleCount(REPLY_PAGE_SIZE);
      if (REPLY_PAGE_SIZE >= sortedReplies.length) {
        setExhausted(true);
      }
    }, REPLY_INITIAL_DELAY);
    return () => clearTimeout(timer);
  }, [sortedReplies]);

  /* ── 加载更多（由 IO 触发） ── */
  const loadMore = useCallback(() => {
    if (loadingRef.current || exhausted || showSkeleton) return;
    loadingRef.current = true;
    setLoading(true);

    setTimeout(() => {
      setVisibleCount((prev) => {
        const next = prev + REPLY_PAGE_SIZE;
        if (next >= sortedReplies.length) {
          setExhausted(true);
          return sortedReplies.length;
        }
        return next;
      });
      setLoading(false);
      loadingRef.current = false;
    }, 600);
  }, [exhausted, showSkeleton, sortedReplies.length]);

  // IO 哨兵：骨架屏完成后才启用
  const { sentinelRef } = useInfiniteScroll<HTMLDivElement>({
    hasMore: !exhausted,
    loading,
    onLoadMore: loadMore,
    initialDone: !showSkeleton,
    rootMargin: '200px',
  });

  const visibleReplies = sortedReplies.slice(0, visibleCount);

  return (
    <div className="replies-list flex flex-col">
      {/* 骨架屏占位 */}
      {showSkeleton &&
        Array.from({ length: REPLY_SKELETON_COUNT }, (_, i) => (
          <ReplySkeleton key={`skel-${i}`} />
        ))}

      {/* 真实回复 */}
      {visibleReplies.map((reply) => (
        <ReplyItem key={reply.id} reply={reply} />
      ))}

      {/* 哨兵 + 加载指示器 */}
      <div
        ref={sentinelRef}
        className="flex min-h-[60px] justify-center py-6"
      >
        {loading && <ScrollLoader />}
        {exhausted && !loading && !showSkeleton && (
          <div
            className="font-mono text-[11px]"
            style={{ color: 'var(--text-muted)', opacity: 0.4, letterSpacing: '1px' }}
          >
            // End of replies
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ReplyList 主组件 ── */
export default function ReplyList() {
  const { showToast } = useCommunityToast();
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order);
    showToast(`Sorted by ${order}`);
  };

  return (
    <section className="post-replies mb-6">
      {/* 头部：标题 + 排序按钮 */}
      <div
        className="replies-header flex items-center justify-between mb-[18px] flex-wrap gap-3"
      >
        <h2
          className="replies-title font-display text-[18px] font-bold"
          style={{ color: 'var(--text)' }}
        >
          {TOTAL_REPLIES} Replies
        </h2>
        <div className="replies-sort flex items-center gap-1">
          <span
            className="replies-sort-label font-mono text-[10px] uppercase mr-1.5"
            style={{ color: 'var(--text-dim)', letterSpacing: '0.08em' }}
          >
            Sort
          </span>
          <Segmented
            className="gh-segmented"
            size="small"
            options={SORT_OPTIONS}
            value={sortOrder}
            onChange={(v) => handleSortChange(v as SortOrder)}
          />
        </div>
      </div>

      {/* 回复列表（key 切换排序时重新挂载，触发骨架屏流程） */}
      <ReplyListInner key={sortOrder} sortOrder={sortOrder} />
    </section>
  );
}

/**
 * PostList —— 社区中栏主组件
 * 包含：Tabs 切换 + 帖子列表（骨架屏+IO+分块加载）
 * 迁移自 community.html 的 .community-content 与 community.js 的 CommunityPage 组件
 *
 * 数据加载：useChunkedData（骨架屏逐批替换 + 无限滚动分块）
 *           useInfiniteScroll（IntersectionObserver 哨兵）
 * 切换 Tab：通过 key 重新挂载 ThreadListInner，触发骨架屏重新加载流程
 */
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Tabs, App, Divider } from 'antd';
import { useChunkedData } from '@/hooks/useChunkedData';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { SkeletonAvatar, SkeletonLine } from '@/components/skeleton/Skeleton';
import ThreadItem from './ThreadItem';
import {
  BASE_THREADS,
  COMMUNITY_TABS,
  PAGE_SIZE,
  filterAndSortThreads,
  generateMoreThreads,
  type Thread,
} from '../_data/community-data';

const SKELETON_BATCH = 2; // 每批替换骨架屏数量（控制初始骨架为 6 个）
const INFINITE_BATCH = 6; // 无限滚动每批加载数量
const INITIAL_DELAY = 600; // 初始骨架屏延迟（ms）
const LOAD_DELAY = 600; // 无限滚动加载延迟（ms）

/* ── 帖子骨架屏（匹配 thread-item 横向布局） ── */
function PostSkeleton() {
  return (
    <div
      className="grid items-center"
      style={{
        gridTemplateColumns: '44px 1fr auto',
        gap: '16px',
        padding: '18px 22px',
        background: 'transparent',
      }}
    >
      <SkeletonAvatar size={44} shape="round" />
      <div className="flex flex-col gap-2 min-w-0">
        <SkeletonLine width="60%" height="14px" />
        <SkeletonLine width="75%" height="11px" />
      </div>
      <SkeletonAvatar size={22} shape="round" />
    </div>
  );
}

/* ── 帖子列表内部组件（管理骨架屏+IO+分块加载） ──
   通过 key={tab} 重新挂载，触发骨架屏重新加载流程 */
function ThreadListInner({ tab, onLike }: { tab: string; onLike: (author: string) => void }) {
  // 过滤+排序后的基础帖子（SSR 安全，不依赖 Math.random）
  const filteredBase = useMemo(() => filterAndSortThreads(BASE_THREADS, tab, null), [tab]);
  const initialData = useMemo(() => filteredBase.slice(0, PAGE_SIZE), [filteredBase]);

  // moreData：初始为基础帖子剩余部分，客户端追加生成的更多帖子（按 tab 过滤）
  const [moreData, setMoreData] = useState<Thread[]>(() => filteredBase.slice(PAGE_SIZE));

  // 客户端挂载后生成更多帖子并按当前 tab 过滤（使用 Math.random，仅客户端执行）
  useEffect(() => {
    const extra = filterAndSortThreads(generateMoreThreads(48), tab, null);
    setMoreData((prev) => [...prev, ...extra]);
  }, [tab]);

  const {
    visibleItems,
    skeletonCount,
    loading,
    exhausted,
    initialDone,
    loadMore,
    replaceNextBatch,
  } = useChunkedData<Thread>({
    initialData,
    moreData,
    skeletonBatch: SKELETON_BATCH,
    infiniteBatch: INFINITE_BATCH,
    initialDelay: INITIAL_DELAY,
  });

  const { sentinelRef, pause, resume } = useInfiniteScroll<HTMLDivElement>({
    hasMore: !exhausted,
    loading,
    onLoadMore: loadMore,
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

  useEffect(() => {
    const timer = setTimeout(tryReplaceBatch, INITIAL_DELAY);
    return () => clearTimeout(timer);
  }, [tryReplaceBatch]);

  // 持续替换：每 400ms 替换一批，直到骨架屏清空
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

  const skeletons = Array.from({ length: skeletonCount }, (_, i) => i);

  return (
    <div className="thread-list flex flex-col">
      {/* 已加载的真实帖子，使用 Divider 分割线分隔 */}
      {visibleItems.map((item, index) => (
        <div key={`thread-${item.id}`}>
          <ThreadItem thread={item} onLike={onLike} />
          {index < visibleItems.length - 1 && (
            <Divider style={{ margin: 0, borderColor: 'var(--border-subtle)' }} />
          )}
        </div>
      ))}

      {/* 骨架屏占位 */}
      {skeletons.map((i) => (
        <PostSkeleton key={`skel-${i}`} />
      ))}

      {/* 无限滚动哨兵 + 加载指示器 */}
      <div
        ref={sentinelRef}
        className="infinite-scroll-sentinel flex min-h-[60px] justify-center py-6"
      >
        {loading && (
          <div className="scroll-loader flex items-center gap-2.5 font-mono text-[10px]" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            <div
              className="scroll-loader-spinner w-4 h-4 rounded-full border-2"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)', animation: 'spin 0.8s linear infinite' }}
            />
            LOADING MORE...
          </div>
        )}
        {exhausted && !loading && (
          <div className="font-mono text-[11px]" style={{ color: 'var(--text-muted)', opacity: 0.4, letterSpacing: '1px' }}>
            // END OF FEED
          </div>
        )}
      </div>
    </div>
  );
}

/* ── PostList 主组件 ── */
export default function PostList() {
  const [currentTab, setCurrentTab] = useState('All');
  // antd message 实例（必须在 <App> 内部使用）
  const { message } = App.useApp();

  // 点赞回调：显示 antd message
  const handleLike = useCallback((author: string) => {
    message.success(`Liked ${author}'s post`, 2.2);
  }, [message]);

  // antd Tabs items 配置
  const tabItems = useMemo(() => COMMUNITY_TABS.map((tab) => ({
    key: tab.key,
    label: tab.label,
  })), []);

  return (
    <main className="community-content min-w-0">
      {/* antd Tabs */}
      <Tabs
        activeKey={currentTab}
        onChange={setCurrentTab}
        items={tabItems}
        className="community-tabs mb-5"
        style={{ marginBottom: '20px' }}
      />

      {/* 帖子列表（key 切换 tab 时重新挂载，触发骨架屏流程） */}
      <ThreadListInner key={currentTab} tab={currentTab} onLike={handleLike} />
    </main>
  );
}

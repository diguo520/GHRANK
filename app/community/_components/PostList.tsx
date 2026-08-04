/**
 * PostList —— 社区中栏主组件
 * 包含：Hero（打字机动画）+ 公告区 + Tabs 切换 + 帖子列表（骨架屏+IO+分块加载）
 * 迁移自 community.html 的 .community-content 与 community.js 的 CommunityPage 组件
 *
 * 数据加载：useChunkedData（骨架屏逐批替换 + 无限滚动分块）
 *           useInfiniteScroll（IntersectionObserver 哨兵）
 * 切换 Tab：通过 key 重新挂载 ThreadListInner，触发骨架屏重新加载流程
 */
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useChunkedData } from '@/hooks/useChunkedData';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { SkeletonAvatar, SkeletonLine } from '@/components/skeleton/Skeleton';
import TextTypeHero from './TextTypeHero';
import ThreadItem from './ThreadItem';
import {
  BASE_THREADS,
  COMMUNITY_TABS,
  ANNOUNCEMENTS,
  HERO_TEXTS,
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
        background: 'var(--surface)',
        border: '1px solid var(--border)',
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

/* ── 公告区 ── */
function AnnouncementList() {
  return (
    <div
      className="community-announcements mb-6"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px 24px' }}
    >
      <div className="flex items-center justify-between mb-3.5">
        <div
          className="font-display text-sm font-bold uppercase"
          style={{ color: 'var(--text)', letterSpacing: '0.04em' }}
        >
          Community Announcements
        </div>
        <div
          className="inline-flex items-center gap-1.5 font-mono text-[9px] font-semibold uppercase"
          style={{ color: 'var(--green)', letterSpacing: '0.1em' }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--green)', boxShadow: '0 0 8px rgba(63, 185, 80, 0.5)', animation: 'live-pulse 1.6s ease-in-out infinite' }}
          />
          Live
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {ANNOUNCEMENTS.map((a, i) => {
          const tagColor =
            a.tagType === 'update' ? 'var(--cyan)' : a.tagType === 'event' ? 'var(--purple)' : 'var(--gold)';
          const tagBg =
            a.tagType === 'update'
              ? 'rgba(57, 210, 192, 0.08)'
              : a.tagType === 'event'
                ? 'rgba(163, 113, 247, 0.08)'
                : 'rgba(245, 197, 24, 0.08)';
          const tagBorder =
            a.tagType === 'update'
              ? 'rgba(57, 210, 192, 0.35)'
              : a.tagType === 'event'
                ? 'rgba(163, 113, 247, 0.35)'
                : 'rgba(245, 197, 24, 0.35)';
          return (
            <Link
              key={i}
              href="/community/detail"
              className="flex items-center gap-3.5 p-3 no-underline transition-all"
              style={{ background: 'var(--bg)', border: '1px solid var(--border-subtle)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.35)';
                e.currentTarget.style.transform = 'translateX(2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = '';
              }}
            >
              <span
                className="font-mono text-[9px] font-semibold uppercase px-2 py-0.5 flex-shrink-0"
                style={{ color: tagColor, background: tagBg, border: `1px solid ${tagBorder}`, letterSpacing: '0.08em' }}
              >
                {a.tag}
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className="font-body text-[13px] overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ color: 'var(--text)', lineHeight: 1.5 }}
                >
                  {a.text}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
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
    <div className="thread-list flex flex-col gap-2.5">
      {/* 已加载的真实帖子 */}
      {visibleItems.map((item) => (
        <ThreadItem key={`thread-${item.id}`} thread={item} onLike={onLike} />
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
  // Toast 状态：点赞反馈提示
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 点赞回调：显示 Toast
  const handleLike = useCallback((author: string) => {
    setToastMsg(`Liked ${author}'s post`);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  return (
    <main className="community-content min-w-0">
      {/* Hero */}
      <div
        className="community-hero relative overflow-hidden mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 197, 24, 0.04) 0%, transparent 60%), var(--surface)',
          border: '1px solid var(--border)',
          padding: '32px 36px',
        }}
      >
        {/* 四角金色装饰 */}
        <span className="absolute top-[-1px] left-[-1px] w-[18px] h-[18px]" style={{ borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)' }} />
        <span className="absolute bottom-[-1px] right-[-1px] w-[18px] h-[18px]" style={{ borderBottom: '2px solid var(--gold)', borderRight: '2px solid var(--gold)' }} />
        <div>
          <div
            className="community-hero-eyebrow font-mono text-[11px] font-semibold uppercase mb-2.5"
            style={{ color: 'var(--gold)', letterSpacing: '0.16em' }}
          >
            // GHRANK COMMUNITY
          </div>
          <TextTypeHero
            texts={HERO_TEXTS}
            typingSpeed={80}
            pauseDuration={2200}
            deletingSpeed={45}
            variableSpeed={{ min: 50, max: 130 }}
            cursorCharacter="_"
            loop
          />
          <p
            className="community-hero-sub font-body text-[15px] leading-relaxed"
            style={{ color: 'var(--text-dim)', maxWidth: '640px' }}
          >
            Discuss open source intelligence, share your projects, ask questions, and collaborate with thousands of developers worldwide.
          </p>
        </div>
      </div>

      {/* 公告区 */}
      <AnnouncementList />

      {/* Tabs */}
      <div
        className="community-tabs flex items-center gap-1 mb-5 flex-wrap"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {COMMUNITY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCurrentTab(tab.key)}
            className="font-mono text-[11px] font-semibold uppercase py-2.5 px-4 cursor-pointer transition-colors"
            style={{
              color: currentTab === tab.key ? 'var(--gold)' : 'var(--text-dim)',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${currentTab === tab.key ? 'var(--gold)' : 'transparent'}`,
              letterSpacing: '0.08em',
              marginBottom: '-1px',
            }}
            onMouseEnter={(e) => {
              if (currentTab !== tab.key) e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              if (currentTab !== tab.key) e.currentTarget.style.color = 'var(--text-dim)';
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 帖子列表（key 切换 tab 时重新挂载，触发骨架屏流程） */}
      <ThreadListInner key={currentTab} tab={currentTab} onLike={handleLike} />

      {/* Toast 提示（点赞反馈） */}
      <div
        className="fixed left-1/2 flex items-center justify-center pointer-events-none"
        style={{
          bottom: '32px',
          transform: toastVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
          background: 'var(--surface)',
          border: '1px solid rgba(245, 197, 24, 0.35)',
          padding: '12px 24px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--gold)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(245, 197, 24, 0.15)',
          zIndex: 10000,
          opacity: toastVisible ? 1 : 0,
          transition: 'opacity 0.3s, transform 0.3s',
          letterSpacing: '0.04em',
        }}
      >
        {toastMsg}
      </div>
    </main>
  );
}

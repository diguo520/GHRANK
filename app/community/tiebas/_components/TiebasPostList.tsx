/**
 * TiebasPostList —— 贴吧列表页中栏主组件
 * 迁移自 community-tiebas.html 的 .community-content 与 community-tiebas.js 的渲染逻辑
 *
 * 包含：面包屑 + Tieba Hero（图标/标题/描述）+ Tabs（All/Hot/Latest/Vote/Question）
 *       + 帖子列表（骨架屏逐批替换 + IntersectionObserver 无限滚动分块）
 *
 * 数据加载：useChunkedData + useInfiniteScroll，复用社区页已建立的加载流程
 * 帖子项：复用 ThreadItem，传入 barId 与 interactiveLike={false}（贴吧页点赞为只读统计）
 * 切换 Tab：通过 key 重新挂载 ThreadListInner，触发骨架屏重新加载流程
 */
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useChunkedData } from '@/hooks/useChunkedData';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { SkeletonAvatar, SkeletonLine } from '@/components/skeleton/Skeleton';
import { HEX_CLIP_PATH } from '@/lib/constants';
import ThreadItem from '../../_components/ThreadItem';
import { type Thread, type TiebaCatalogItem } from '../../_data/community-data';
import {
  TIEBA_TABS,
  TIEBA_PAGE_SIZE,
  buildBarPool,
  generateMoreBarThreads,
  filterTiebaThreads,
} from '../_data/community-tiebas-data';

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

/* ── 帖子列表内部组件（管理骨架屏+IO+分块加载） ──
   通过 key={tab} 重新挂载，触发骨架屏重新加载流程 */
function ThreadListInner({
  bar,
  tab,
}: {
  bar: TiebaCatalogItem;
  tab: string;
}) {
  // 贴吧帖子池（确定性，仅依赖 bar，保证 SSR/CSR 一致）
  const pool = useMemo(() => buildBarPool(bar), [bar]);
  // 按 tab 过滤+排序后的基础帖子
  const filteredBase = useMemo(() => filterTiebaThreads(pool, tab), [pool, tab]);
  const initialData = useMemo(() => filteredBase.slice(0, TIEBA_PAGE_SIZE), [filteredBase]);

  // moreData：初始为基础帖子剩余部分，客户端追加生成的更多帖子（按 tab 过滤）
  const [moreData, setMoreData] = useState<Thread[]>(() => filteredBase.slice(TIEBA_PAGE_SIZE));

  // 客户端挂载后生成更多帖子并按当前 tab 过滤（使用 Math.random，仅客户端执行）
  useEffect(() => {
    const extra = filterTiebaThreads(generateMoreBarThreads(bar, 48), tab);
    setMoreData((prev) => [...prev, ...extra]);
  }, [bar, tab]);

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
      {/* 已加载的真实帖子（贴吧页点赞为只读统计） */}
      {visibleItems.map((item) => (
        <ThreadItem
          key={`thread-${item.id}`}
          thread={item}
          barId={bar.id}
          interactiveLike={false}
        />
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

interface TiebasPostListProps {
  /** 当前贴吧目录项 */
  bar: TiebaCatalogItem;
}

export default function TiebasPostList({ bar }: TiebasPostListProps) {
  const [currentTab, setCurrentTab] = useState('All');

  return (
    <main className="community-content min-w-0">
      {/* 面包屑 */}
      <nav
        className="section-breadcrumb flex items-center gap-2 flex-wrap font-mono text-[11px] mb-5"
        style={{ color: 'var(--text-dim)', letterSpacing: '0.04em' }}
      >
        <Link href="/community" className="no-underline transition-colors" style={{ color: 'var(--text-dim)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
        >
          Community
        </Link>
        <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>›</span>
        <Link href="/community" className="no-underline transition-colors" style={{ color: 'var(--text-dim)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
        >
          My Tiebas
        </Link>
        <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>›</span>
        <span style={{ color: 'var(--text)' }}>{bar.name}</span>
      </nav>

      {/* Tieba Hero */}
      <div
        className="community-hero tieba-hero relative overflow-hidden mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 197, 24, 0.04) 0%, transparent 60%), var(--surface)',
          border: '1px solid var(--border)',
          padding: '32px 36px',
        }}
      >
        <span className="absolute top-[-1px] left-[-1px] w-[18px] h-[18px]" style={{ borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)' }} />
        <span className="absolute bottom-[-1px] right-[-1px] w-[18px] h-[18px]" style={{ borderBottom: '2px solid var(--gold)', borderRight: '2px solid var(--gold)' }} />
        <div className="tieba-hero-row flex items-center gap-5">
          {/* 六边形图标 */}
          <span
            className="tieba-hero-icon flex items-center justify-center font-display text-2xl font-extrabold flex-shrink-0"
            style={{
              width: '64px',
              height: '64px',
              background: 'var(--gold-subtle)',
              color: 'var(--gold)',
              clipPath: HEX_CLIP_PATH,
              boxShadow: '0 0 24px rgba(245, 197, 24, 0.25)',
            }}
          >
            {bar.icon}
          </span>
          <div>
            <div
              className="community-hero-eyebrow font-mono text-[11px] font-semibold uppercase mb-2.5"
              style={{ color: 'var(--gold)', letterSpacing: '0.16em' }}
            >
              // TIEBA
            </div>
            <h1
              className="community-hero-title font-display font-extrabold mb-2.5"
              style={{ fontSize: '36px', color: 'var(--text)', lineHeight: 1.1, letterSpacing: '0.01em' }}
            >
              {bar.name}
            </h1>
            <p
              className="community-hero-sub font-body text-[15px] leading-relaxed"
              style={{ color: 'var(--text-dim)', maxWidth: '640px' }}
            >
              {bar.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="community-tabs flex items-center gap-1 mb-5 flex-wrap"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {TIEBA_TABS.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setCurrentTab(tab.key)}
              className="font-mono text-[11px] font-semibold uppercase py-2.5 px-4 cursor-pointer transition-colors"
              style={{
                color: isActive ? 'var(--gold)' : 'var(--text-dim)',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${isActive ? 'var(--gold)' : 'transparent'}`,
                letterSpacing: '0.08em',
                marginBottom: '-1px',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-dim)';
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 帖子列表（key 切换 tab 时重新挂载，触发骨架屏流程） */}
      <ThreadListInner key={currentTab} bar={bar} tab={currentTab} />
    </main>
  );
}

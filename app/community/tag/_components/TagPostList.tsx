/**
 * TagPostList —— 标签详情页中栏主组件
 * 迁移自 community-tag.html 的 .community-content 与 community-tag.js 的渲染逻辑
 *
 * 包含：面包屑 + Tag Hero（标签图标/标题/描述）+ Tabs（All/New/Hot Topics/Most Replies）
 *       + 帖子列表（骨架屏逐批替换 + IntersectionObserver 无限滚动分块）
 *
 * 数据加载：useChunkedData + useInfiniteScroll，复用社区页已建立的加载流程
 * 帖子项：复用 ThreadItem，传入 interactiveLike={true}（标签页点赞可交互）
 * 切换 Tab：通过 key 重新挂载 ThreadListInner，触发骨架屏重新加载流程
 */
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Tabs, App, Divider } from 'antd';
import { useChunkedData } from '@/hooks/useChunkedData';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { SkeletonAvatar, SkeletonLine } from '@/components/skeleton/Skeleton';
import ThreadItem from '../../_components/ThreadItem';
import { type Thread } from '../../_data/community-data';
import { TagIcon } from '@/components/shared/icons';
import {
  TAG_TABS,
  TAG_PAGE_SIZE,
  buildTagPool,
  generateMoreTagThreads,
  filterTagThreads,
} from '../_data/community-tag-data';

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
function ThreadListInner({
  tag,
  tab,
  onLike,
}: {
  tag: string;
  tab: string;
  onLike: (author: string) => void;
}) {
  // 标签帖子池（确定性，仅依赖 tag，保证 SSR/CSR 一致）
  // 该标签不在 POST_TAGS 子集时返回空数组，用于验证筛选效果
  const pool = useMemo(() => buildTagPool(tag), [tag]);
  const isEmpty = pool.length === 0; // 当前标签无帖子的标志位
  // 按 tab 过滤+排序后的基础帖子
  const filteredBase = useMemo(() => filterTagThreads(pool, tab), [pool, tab]);
  const initialData = useMemo(() => filteredBase.slice(0, TAG_PAGE_SIZE), [filteredBase]);

  // moreData：初始为基础帖子剩余部分，客户端追加生成的更多帖子（按 tab 过滤）
  const [moreData, setMoreData] = useState<Thread[]>(() => filteredBase.slice(TAG_PAGE_SIZE));

  // 客户端挂载后生成更多帖子并按当前 tab 过滤（使用 Math.random，仅客户端执行）
  useEffect(() => {
    const extra = filterTagThreads(generateMoreTagThreads(tag, 48), tab);
    setMoreData((prev) => [...prev, ...extra]);
  }, [tag, tab]);

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

  /* 空状态：当前标签不在 POST_TAGS 子集中，无任何帖子，用于验证筛选效果 */
  if (isEmpty) {
    return (
      <div
        className="empty-state flex flex-col items-center justify-center py-20"
        style={{ color: 'var(--text-muted)' }}
      >
        <div
          className="font-mono text-[11px] mb-3"
          style={{ letterSpacing: '0.16em', opacity: 0.6 }}
        >
          // NO POSTS
        </div>
        <div className="font-display text-[18px] mb-2" style={{ color: 'var(--text)' }}>
          No posts under this tag yet
        </div>
        <div className="font-body text-[13px]" style={{ color: 'var(--text-dim)' }}>
          {`#${tag} has no posts in the current filter scope.`}
        </div>
      </div>
    );
  }

  return (
    <div className="thread-list flex flex-col">
      {/* 已加载的真实帖子（标签页点赞可交互），使用 Divider 分割线分隔 */}
      {visibleItems.map((item, index) => (
        <div key={`thread-${item.id}`}>
          <ThreadItem
            thread={item}
            onLike={onLike}
          />
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

interface TagPostListProps {
  /** 当前标签名 */
  tag: string;
}

export default function TagPostList({ tag }: TagPostListProps) {
  const [currentTab, setCurrentTab] = useState('All');
  // antd message 实例（必须在 <App> 内部使用）
  const { message } = App.useApp();

  // 点赞回调：显示 antd message
  const handleLike = useCallback((author: string) => {
    message.success(`Liked ${author}'s post`, 2.2);
  }, [message]);

  // antd Tabs items 配置
  const tabItems = useMemo(() => TAG_TABS.map((tab) => ({
    key: tab.key,
    label: tab.label,
  })), []);

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
          Tags
        </Link>
        <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>›</span>
        <span style={{ color: 'var(--text)' }}>{tag}</span>
      </nav>

      {/* Tag Hero（紧凑型，带标签 SVG 图标） */}
      <div
        className="community-hero section-hero-compact relative overflow-hidden mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(157, 140, 255, 0.04) 0%, transparent 60%), var(--surface)',
          border: '1px solid var(--border)',
          padding: '24px 28px',
        }}
      >
        <span className="absolute top-[-1px] left-[-1px] w-[18px] h-[18px]" style={{ borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)' }} />
        <span className="absolute bottom-[-1px] right-[-1px] w-[18px] h-[18px]" style={{ borderBottom: '2px solid var(--gold)', borderRight: '2px solid var(--gold)' }} />
        <div className="section-hero-row flex items-center gap-4">
          {/* 标签 SVG 图标 */}
          <span
            className="section-hero-icon flex items-center justify-center flex-shrink-0"
            style={{
              width: '52px',
              height: '52px',
              background: 'var(--gold-subtle)',
              color: 'var(--gold)',
              border: '1px solid rgba(157, 140, 255, 0.35)',
            }}
          >
            <TagIcon size={52} />
          </span>
          <div>
            <div
              className="community-hero-eyebrow font-mono text-[11px] font-semibold uppercase mb-2"
              style={{ color: 'var(--gold)', letterSpacing: '0.16em' }}
            >
              // TAGGED POSTS
            </div>
            <h1
              className="community-hero-title font-display font-extrabold mb-2"
              style={{ fontSize: '28px', color: 'var(--text)', lineHeight: 1.1, letterSpacing: '0.01em' }}
            >
              {tag}
            </h1>
            <p
              className="community-hero-sub font-body text-[14px] leading-relaxed"
              style={{ color: 'var(--text-dim)', maxWidth: '640px' }}
            >
              {`Posts tagged with #${tag}`}
            </p>
          </div>
        </div>
      </div>

      {/* antd Tabs */}
      <Tabs
        activeKey={currentTab}
        onChange={setCurrentTab}
        items={tabItems}
        className="community-tabs"
        style={{ marginBottom: '20px' }}
      />

      {/* 帖子列表（key 切换 tab 时重新挂载，触发骨架屏流程） */}
      <ThreadListInner key={currentTab} tag={tag} tab={currentTab} onLike={handleLike} />
    </main>
  );
}

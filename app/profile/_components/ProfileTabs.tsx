/**
 * ProfileTabs —— 极简风格标签页
 *
 * 设计理念：
 * - 居中标签栏，无装饰边框
 * - 简洁的 Prompt 卡片（无缩略图悬浮效果、无装饰角）
 * - 简洁的活动时间线
 * - 保留 5 个标签：Overview / Prompts / Activity / Bookmarks / Achievements
 */
'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tabs } from 'antd';
import {
  MessageSquare as LucideComment,
  Github as LucideGithub,
  FileText as LucideArticle,
  MessageCircle as LucideThread,
  Star as LucideStar,
  Bookmark as LucideBookmarkMini,
} from 'lucide-react';
import {
  PROFILE_PROMPTS, PROFILE_ACTIVITIES, USER_PROFILE, PROFILE_BOOKMARKS,
  type ProfilePrompt, type ProfileActivity, type ProfileBookmark, type BookmarkKind,
} from '../_data/profile-data';
import {
  HeartIcon, EyeIcon, BookmarkIcon, ClockIcon, StarIcon,
} from '@/components/shared/icons';
import AchievementGrid from '@/components/achievements/AchievementGrid';
import LevelProgress from '@/components/achievements/LevelProgress';
import { useChunkedData } from '@/hooks/useChunkedData';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { shimmerBg } from '@/components/skeleton/Skeleton';

/* ═════════════════════════════════════════════════════
   子组件 —— 活动记录项（极简列表样式）
   ═════════════════════════════════════════════════════ */

function ActivityItem({ activity }: { activity: ProfileActivity }) {
  return (
    <div
      className="flex items-start gap-3 py-3"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={activity.targetHref}
            className="font-body text-[13px] truncate"
            style={{ color: 'var(--text)' }}
          >
            {activity.target}
          </Link>
          <span className="font-mono text-[10px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            {activity.timeAgo}
          </span>
        </div>
        {activity.detail && (
          <p className="font-body text-[12px] mt-0.5" style={{ color: 'var(--text-dim)' }}>
            {activity.detail}
          </p>
        )}
        {activity.amount && (
          <span
            className="font-mono text-[11px] font-bold mt-0.5 inline-block"
            style={{
              color: activity.amount.startsWith('+') ? 'var(--green)' : 'var(--text-dim)',
            }}
          >
            {activity.amount}
          </span>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   子组件 —— Prompt 卡片（极简列表样式）
   ═════════════════════════════════════════════════════ */

function PromptRow({ prompt }: { prompt: ProfilePrompt }) {
  return (
    <Link
      href={`/prompt-detail?id=${prompt.id}`}
      className="flex items-center gap-3 py-3 transition-colors"
      style={{ textDecoration: 'none', borderBottom: '1px solid var(--border-subtle)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-body text-[13px] font-medium truncate" style={{ color: 'var(--text)' }}>
            {prompt.title}
          </span>
          {prompt.status === 'draft' && (
            <span className="font-mono text-[9px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
              Draft
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {prompt.model}
          </span>
          <span className="flex items-center gap-1">
            <HeartIcon size={10} style={{ color: 'var(--text-muted)' }} />
            <span className="font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>
              {prompt.likes}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <EyeIcon size={10} style={{ color: 'var(--text-muted)' }} />
            <span className="font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>
              {prompt.views.toLocaleString()}
            </span>
          </span>
        </div>
      </div>
      <span
        className="font-mono text-[11px] font-bold flex-shrink-0"
        style={{ color: prompt.price === 0 ? 'var(--text-muted)' : 'var(--gold)' }}
      >
        {prompt.price === 0 ? 'Free' : `$${prompt.price}`}
      </span>
    </Link>
  );
}

/* ═════════════════════════════════════════════════════
   子组件 —— Prompt 瀑布流卡片（带缩略图 + 高度变化）
   ═════════════════════════════════════════════════════ */

function PromptCardMasonry({ prompt }: { prompt: ProfilePrompt }) {
  // 用 id 决定缩略图高度，模拟瀑布流不同尺寸
  const heights = ['h-32', 'h-40', 'h-48', 'h-56', 'h-36'];
  const thumbHeight = heights[prompt.id % heights.length];

  return (
    <Link
      href={`/prompt-detail?id=${prompt.id}`}
      className="block group transition-all"
      style={{
        textDecoration: 'none',
      }}
    >
      {/* 卡片主体（圆角，无边框，无装饰） */}
      <div
        className="overflow-hidden transition-all"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(157,140,255,0.3)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '';
        }}
      >
        {/* 缩略图（高度不固定 → 瀑布流效果） */}
        <div className={`relative ${thumbHeight} overflow-hidden`} style={{ background: 'var(--surface-overlay)' }}>
          <Image
            src={prompt.thumbnail}
            alt=""
            fill
            className="object-cover group-hover:scale-105"
            style={{
              transition: 'transform 0.4s ease',
              filter: prompt.status === 'draft' ? 'brightness(0.4) saturate(0.3)' : 'brightness(0.85)',
            }}
          />
          {/* 价格标签 */}
          <span
            className="absolute top-2 right-2 font-mono text-[10px] font-bold"
            style={{
              color: 'var(--gold)',
              background: 'rgba(8,8,10,0.75)',
              border: '1px solid rgba(157,140,255,0.3)',
              padding: '2px 7px',
              borderRadius: '4px',
            }}
          >
            {prompt.price === 0 ? 'Free' : `$${prompt.price}`}
          </span>
          {/* 草稿标签 */}
          {prompt.status === 'draft' && (
            <span
              className="absolute top-2 left-2 font-mono text-[9px] font-bold uppercase"
              style={{
                color: 'var(--orange)',
                background: 'rgba(232,93,4,0.15)',
                border: '1px solid rgba(232,93,4,0.35)',
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.06em',
              }}
            >
              Draft
            </span>
          )}
        </div>

        {/* 信息区 */}
        <div className="p-2.5">
          <div className="font-body text-[12px] font-medium leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
            {prompt.title}
          </div>
          <div className="font-mono text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {prompt.model}
          </div>
          {/* 底部统计行 */}
          <div className="flex items-center gap-2.5 mt-2">
            <span className="flex items-center gap-0.5">
              <HeartIcon size={10} style={{ color: 'var(--text-muted)' }} />
              <span className="font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>
                {prompt.likes}
              </span>
            </span>
            <span className="flex items-center gap-0.5">
              <EyeIcon size={10} style={{ color: 'var(--text-muted)' }} />
              <span className="font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>
                {prompt.views.toLocaleString()}
              </span>
            </span>
            <span className="flex items-center gap-0.5 ml-auto">
              <ClockIcon size={10} style={{ color: 'var(--text-muted)' }} />
              <span className="font-mono text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {prompt.createdAt}
              </span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ═════════════════════════════════════════════════════
   Overview 标签
   ═════════════════════════════════════════════════════ */

function OverviewTab() {
  const recentActivity = PROFILE_ACTIVITIES.slice(0, 5);
  const topPrompts = PROFILE_PROMPTS.filter((p) => p.status === 'published').slice(0, 3);

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* About */}
      <section>
        <h2 className="font-mono text-[10px] font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
          About
        </h2>
        <p className="font-body text-[14px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          {USER_PROFILE.bio}
        </p>
      </section>

      {/* Top Prompts */}
      <section>
        <h2 className="font-mono text-[10px] font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
          Prompts
        </h2>
        {topPrompts.map((prompt) => (
          <PromptRow key={prompt.id} prompt={prompt} />
        ))}
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="font-mono text-[10px] font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
          Recent Activity
        </h2>
        {recentActivity.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </section>
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   Prompts 标签（纯 CSS 4 列瀑布流 —— 避免 antd Masonry 在 client 水合时报错）
   ═════════════════════════════════════════════════════ */

const WATERFALL_COL_STYLE: React.CSSProperties = {
  columnCount: 4,
  columnGap: 12,
};
const WATERFALL_ITEM_STYLE: React.CSSProperties = {
  display: 'inline-block',
  width: '100%',
  marginBottom: 12,
  breakInside: 'avoid',
};

/* 骨架屏 & 无限滚动配置 */
const PROFILE_SKELETON_COUNT = 8;
const PROFILE_BATCH_SIZE = 4;
const PROFILE_SKELETON_DELAY = 350;
const HEIGHT_VARIANTS = ['h-32', 'h-40', 'h-48', 'h-56', 'h-36'];

/* ═════════════════════════════════════════════════════
   公共：瀑布流骨架屏卡片
   —— 可同时用于 Prompt 和 Bookmark（参数区分缩略图高度、是否显示占位角标）
   ═════════════════════════════════════════════════════ */
function WaterfallSkeletonCard({
  thumbHeight = 'h-40',
  showBadges = false,
}: {
  thumbHeight?: string;
  showBadges?: boolean;
}) {
  return (
    <div
      className="overflow-hidden"
      style={{
        background: 'var(--surface)',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* 缩略图占位 */}
      <div className={`relative ${thumbHeight}`} style={{ background: 'var(--surface-overlay)' }}>
        <div
          style={{
            ...shimmerBg,
            position: 'absolute',
            inset: 0,
            borderRadius: 0,
          }}
        />
        {showBadges && (
          <>
            <span
              className="absolute top-2 right-2"
              style={{
                ...shimmerBg,
                width: 40,
                height: 16,
                borderRadius: 4,
              }}
            />
            <span
              className="absolute top-2 left-2"
              style={{
                ...shimmerBg,
                width: 52,
                height: 18,
                borderRadius: 4,
              }}
            />
          </>
        )}
      </div>
      {/* 信息区占位 */}
      <div className="p-2.5 space-y-2">
        <div style={{ ...shimmerBg, height: 12, width: '100%' }} />
        <div style={{ ...shimmerBg, height: 12, width: '75%' }} />
        <div style={{ ...shimmerBg, height: 10, width: '40%' }} />
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div style={{ ...shimmerBg, height: 10, width: 28 }} />
            <div style={{ ...shimmerBg, height: 10, width: 28 }} />
          </div>
          <div style={{ ...shimmerBg, height: 10, width: 36 }} />
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   公共：无限滚动加载指示器 + 结束提示
   ═════════════════════════════════════════════════════ */
function InfiniteSentinel({
  loading,
  exhausted,
  hasItems,
}: {
  loading: boolean;
  exhausted: boolean;
  hasItems: boolean;
}) {
  return (
    <div className="flex justify-center py-6">
      {loading && (
        <div
          className="flex items-center gap-2.5 font-mono text-[10px]"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}
        >
          <div
            className="w-4 h-4 rounded-full border-2"
            style={{
              borderColor: 'var(--border)',
              borderTopColor: 'var(--gold)',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          LOADING MORE...
        </div>
      )}
      {exhausted && hasItems && !loading && (
        <div
          className="font-mono text-[11px]"
          style={{ color: 'var(--text-muted)', opacity: 0.4, letterSpacing: '1px' }}
        >
          // END
        </div>
      )}
    </div>
  );
}

function PromptsTab() {
  const published = useMemo(() => PROFILE_PROMPTS.filter((p) => p.status === 'published'), []);
  const drafts = useMemo(() => PROFILE_PROMPTS.filter((p) => p.status === 'draft'), []);

  // ── 无限滚动：分块加载 published ──
  const {
    visibleItems: visiblePublished,
    skeletonCount: pubSkeletonCount,
    loading: pubLoading,
    exhausted: pubExhausted,
    initialDone: pubInitialDone,
    loadMore: pubLoadMore,
    replaceNextBatch: pubReplaceNext,
    reset: pubReset,
  } = useChunkedData<ProfilePrompt>({
    initialData: published.slice(0, PROFILE_SKELETON_COUNT),
    moreData: published.slice(PROFILE_SKELETON_COUNT),
    skeletonBatch: 4,
    infiniteBatch: PROFILE_BATCH_SIZE,
    initialDelay: PROFILE_SKELETON_DELAY,
  });

  // 骨架屏逐批替换
  const pubReplacingRef = useRef(false);
  const pubTryReplace = useCallback(() => {
    if (pubReplacingRef.current || pubInitialDone) return;
    pubReplacingRef.current = true;
    pubReplaceNext();
    pubReplacingRef.current = false;
  }, [pubReplaceNext, pubInitialDone]);

  useEffect(() => {
    if (pubInitialDone) return;
    const timer = setTimeout(pubTryReplace, PROFILE_SKELETON_DELAY);
    return () => clearTimeout(timer);
  }, [pubTryReplace, pubInitialDone]);

  useEffect(() => {
    if (pubInitialDone || pubSkeletonCount === 0) return;
    const interval = setInterval(() => {
      if (pubInitialDone || pubSkeletonCount === 0) {
        clearInterval(interval);
        return;
      }
      pubTryReplace();
    }, PROFILE_SKELETON_DELAY);
    return () => clearInterval(interval);
  }, [pubInitialDone, pubSkeletonCount, pubTryReplace]);

  const { sentinelRef: pubSentinelRef, pause: pubPause, resume: pubResume } = useInfiniteScroll<HTMLDivElement>({
    hasMore: !pubExhausted,
    loading: pubLoading,
    onLoadMore: pubLoadMore,
    initialDone: pubInitialDone,
  });

  useEffect(() => {
    if (pubLoading) {
      pubPause();
      const timer = setTimeout(() => pubResume(), 700);
      return () => clearTimeout(timer);
    }
  }, [pubLoading, pubPause, pubResume]);

  const pubSkeletons = Array.from({ length: pubSkeletonCount }, (_, i) => i);

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Published 分区 */}
      <section>
        <h2 className="font-mono text-[10px] font-semibold uppercase mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
          Published · {published.length}
        </h2>
        <div className="gh-waterfall" style={WATERFALL_COL_STYLE}>
          {visiblePublished.map((prompt) => (
            <div key={prompt.id} style={WATERFALL_ITEM_STYLE}>
              <PromptCardMasonry prompt={prompt} />
            </div>
          ))}
          {pubSkeletons.map((i) => (
            <div key={`pub-sk-${i}`} style={WATERFALL_ITEM_STYLE}>
              <WaterfallSkeletonCard thumbHeight={HEIGHT_VARIANTS[i % HEIGHT_VARIANTS.length]} />
            </div>
          ))}
        </div>
        {/* 无限滚动哨兵（绑定 sentinel ref） */}
        <div ref={pubSentinelRef}>
          <InfiniteSentinel
            loading={pubLoading}
            exhausted={pubExhausted}
            hasItems={visiblePublished.length > 0}
          />
        </div>
      </section>

      {/* Drafts 分区 —— 小数据，直接渲染，无骨架/无限滚动 */}
      {drafts.length > 0 && (
        <section>
          <h2 className="font-mono text-[10px] font-semibold uppercase mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
            Drafts · {drafts.length}
          </h2>
          <div className="gh-waterfall" style={WATERFALL_COL_STYLE}>
            {drafts.map((prompt) => (
              <div key={prompt.id} style={WATERFALL_ITEM_STYLE}>
                <PromptCardMasonry prompt={prompt} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   Activity 标签
   ═════════════════════════════════════════════════════ */

function ActivityTab() {
  return (
    <section className="pt-4">
      {PROFILE_ACTIVITIES.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </section>
  );
}

/* ═════════════════════════════════════════════════════
   Bookmarks 标签
   —— 独立 6 条混合类型（prompts / repos / tieba threads / AI articles）
   ═════════════════════════════════════════════════════ */

/** 根据书签 kind 渲染左侧主图标 */
function KindIcon({ kind }: { kind: BookmarkKind }) {
  const commonProps = { size: 13, strokeWidth: 2 };
  switch (kind) {
    case 'repo':     return <LucideGithub {...commonProps} />;
    case 'article':  return <LucideArticle {...commonProps} />;
    case 'thread':   return <LucideThread {...commonProps} />;
    case 'prompt':   return <LucideBookmarkMini {...commonProps} />;
  }
}

/** accent 色 → CSS 配色映射（和全局变量保持一致） */
const ACCENT_MAP: Record<NonNullable<ProfileBookmark['accent']>, { color: string; bg: string; border: string }> = {
  gold:  { color: 'var(--gold)',              bg: 'rgba(232,168,56,0.12)',  border: 'rgba(232,168,56,0.3)' },
  cyan:  { color: 'var(--cyan)',              bg: 'rgba(157,140,255,0.12)', border: 'rgba(157,140,255,0.3)' },
  green: { color: 'var(--green)',             bg: 'rgba(63,185,80,0.12)',   border: 'rgba(63,185,80,0.3)' },
  pink:  { color: '#F778BA',                  bg: 'rgba(247,120,186,0.12)', border: 'rgba(247,120,186,0.3)' },
};

/** 书签瀑布流卡片 —— 与 PromptCardMasonry 保持相同圆角 / 边框 / 悬浮效果，但多了 kind 图标和分类 badge */
function BookmarkCard({ item }: { item: ProfileBookmark }) {
  // 依据 heightVariant 决定缩略图高度（营造错落感）
  const thumbHeight =
    item.heightVariant === 'tall'   ? 'h-[220px]' :
    item.heightVariant === 'short'  ? 'h-[110px]' :
    item.heightVariant === 'wide'   ? 'h-[160px]' :
    /* normal */                      'h-[150px]';

  const accent = ACCENT_MAP[item.accent ?? 'cyan'];

  return (
    <Link
      href={item.href}
      className="block group transition-all"
      style={{ textDecoration: 'none' }}
      target={item.href.startsWith('http') ? '_blank' : undefined}
      rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
    >
      <div
        className="overflow-hidden transition-all"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(157,140,255,0.3)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '';
        }}
      >
        {/* 缩略图（AI 在线封面，不会本地 404） */}
        <div className={`relative ${thumbHeight} overflow-hidden`} style={{ background: 'var(--surface-overlay)' }}>
          <Image
            src={item.thumbnail}
            alt=""
            fill
            className="object-cover group-hover:scale-105"
            style={{ transition: 'transform 0.4s ease', filter: 'brightness(0.88)' }}
            unoptimized
          />
          {/* 右上角分类角标 */}
          <span
            className="absolute top-2 right-2 font-mono text-[10px] font-bold"
            style={{
              color: accent.color,
              background: accent.bg,
              border: `1px solid ${accent.border}`,
              padding: '2px 7px',
              borderRadius: '4px',
            }}
          >
            {item.category}
          </span>
          {/* 左上角 kind 图标 chip */}
          <span
            className="absolute top-2 left-2 flex items-center gap-1 font-mono text-[10px] uppercase"
            style={{
              color: 'var(--text)',
              background: 'rgba(8,8,10,0.75)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '3px 7px',
              borderRadius: '4px',
              letterSpacing: '0.06em',
            }}
          >
            <span style={{ color: accent.color, display: 'inline-flex' }}>
              <KindIcon kind={item.kind} />
            </span>
            {item.kind}
          </span>
        </div>

        {/* 信息区 */}
        <div className="p-2.5">
          <div className="font-body text-[12px] font-medium leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
            {item.title}
          </div>
          <div className="font-mono text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {item.subtitle}
          </div>
          {/* 底部统计行 */}
          <div className="flex items-center gap-2.5 mt-2">
            {item.stars !== undefined && (
              <span className="flex items-center gap-0.5">
                <LucideStar size={10} style={{ color: 'var(--gold)' }} />
                <span className="font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>
                  {item.stars >= 1000 ? `${(item.stars / 1000).toFixed(1)}K` : item.stars.toLocaleString()}
                </span>
              </span>
            )}
            {item.commentCount !== undefined && (
              <span className="flex items-center gap-0.5">
                <LucideComment size={10} style={{ color: 'var(--text-muted)' }} />
                <span className="font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>
                  {item.commentCount.toLocaleString()}
                </span>
              </span>
            )}
            <span className="flex items-center gap-0.5 ml-auto">
              <ClockIcon size={10} style={{ color: 'var(--text-muted)' }} />
              <span className="font-mono text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {item.savedAt}
              </span>
            </span>
          </div>
          {/* 标签 row */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="font-mono text-[9px]"
                  style={{
                    color: 'var(--text-dim)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-subtle)',
                    padding: '1px 5px',
                    borderRadius: '3px',
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/* 书签缩略图高度变体（映射到骨架屏占位高度） */
const BOOKMARK_HEIGHT_VARIANTS = ['h-[110px]', 'h-[150px]', 'h-[160px]', 'h-[220px]', 'h-[150px]'];

function BookmarksTab() {
  // ── 无限滚动：分块加载 bookmarks ──
  const {
    visibleItems: visibleBookmarks,
    skeletonCount: bmSkeletonCount,
    loading: bmLoading,
    exhausted: bmExhausted,
    initialDone: bmInitialDone,
    loadMore: bmLoadMore,
    replaceNextBatch: bmReplaceNext,
    reset: bmReset,
  } = useChunkedData<ProfileBookmark>({
    initialData: PROFILE_BOOKMARKS.slice(0, PROFILE_SKELETON_COUNT),
    moreData: PROFILE_BOOKMARKS.slice(PROFILE_SKELETON_COUNT),
    skeletonBatch: 4,
    infiniteBatch: PROFILE_BATCH_SIZE,
    initialDelay: PROFILE_SKELETON_DELAY,
  });

  // 骨架屏逐批替换
  const bmReplacingRef = useRef(false);
  const bmTryReplace = useCallback(() => {
    if (bmReplacingRef.current || bmInitialDone) return;
    bmReplacingRef.current = true;
    bmReplaceNext();
    bmReplacingRef.current = false;
  }, [bmReplaceNext, bmInitialDone]);

  useEffect(() => {
    if (bmInitialDone) return;
    const timer = setTimeout(bmTryReplace, PROFILE_SKELETON_DELAY);
    return () => clearTimeout(timer);
  }, [bmTryReplace, bmInitialDone]);

  useEffect(() => {
    if (bmInitialDone || bmSkeletonCount === 0) return;
    const interval = setInterval(() => {
      if (bmInitialDone || bmSkeletonCount === 0) {
        clearInterval(interval);
        return;
      }
      bmTryReplace();
    }, PROFILE_SKELETON_DELAY);
    return () => clearInterval(interval);
  }, [bmInitialDone, bmSkeletonCount, bmTryReplace]);

  const { sentinelRef: bmSentinelRef, pause: bmPause, resume: bmResume } = useInfiniteScroll<HTMLDivElement>({
    hasMore: !bmExhausted,
    loading: bmLoading,
    onLoadMore: bmLoadMore,
    initialDone: bmInitialDone,
  });

  useEffect(() => {
    if (bmLoading) {
      bmPause();
      const timer = setTimeout(() => bmResume(), 700);
      return () => clearTimeout(timer);
    }
  }, [bmLoading, bmPause, bmResume]);

  const bmSkeletons = Array.from({ length: bmSkeletonCount }, (_, i) => i);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <BookmarkIcon size={12} filled style={{ color: 'var(--gold)' }} />
            <h2 className="font-mono text-[10px] font-semibold uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
              Saved · {PROFILE_BOOKMARKS.length}
            </h2>
          </div>
          <span className="font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>
            Mixed · Repos / Prompts / Threads / Articles
          </span>
        </div>
        <div className="gh-waterfall" style={WATERFALL_COL_STYLE}>
          {visibleBookmarks.map((b) => (
            <div key={b.id} style={WATERFALL_ITEM_STYLE}>
              <BookmarkCard item={b} />
            </div>
          ))}
          {bmSkeletons.map((i) => (
            <div key={`bm-sk-${i}`} style={WATERFALL_ITEM_STYLE}>
              <WaterfallSkeletonCard
                thumbHeight={BOOKMARK_HEIGHT_VARIANTS[i % BOOKMARK_HEIGHT_VARIANTS.length]}
                showBadges
              />
            </div>
          ))}
        </div>
        {/* 无限滚动哨兵（绑定 sentinel ref） */}
        <div ref={bmSentinelRef}>
          <InfiniteSentinel
            loading={bmLoading}
            exhausted={bmExhausted}
            hasItems={visibleBookmarks.length > 0}
          />
        </div>
      </section>
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   Achievements 标签
   ═════════════════════════════════════════════════════ */

function AchievementsTab() {
  return (
    <div className="flex flex-col gap-6 pt-4">
      <section>
        <h2 className="font-mono text-[10px] font-semibold uppercase mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
          Level Path
        </h2>
        <LevelProgress showPath />
      </section>
      <section>
        <h2 className="font-mono text-[10px] font-semibold uppercase mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
          Achievement Badges
        </h2>
        <AchievementGrid showFilter showStats />
      </section>
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   主组件
   ═════════════════════════════════════════════════════ */

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      centered
      size="small"
      items={[
        { key: 'overview', label: 'Overview', children: <OverviewTab /> },
        { key: 'prompts', label: 'Prompts', children: <PromptsTab /> },
        { key: 'activity', label: 'Activity', children: <ActivityTab /> },
        { key: 'bookmarks', label: 'Bookmarks', children: <BookmarksTab /> },
        { key: 'achievements', label: 'Achievements', children: <AchievementsTab /> },
      ]}
    />
  );
}

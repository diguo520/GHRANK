/**
 * ExploreTiebasPage —— 加入贴吧组主页面
 *
 * 核心交互：
 *  - 搜索：输入关键词即时匹配贴吧名称/描述
 *  - 选项卡：关注的贴吧 / 热门贴吧 / 新建贴吧
 *  - 骨架屏：初始加载时显示骨架屏，逐批替换为真实数据
 *  - 无限滚动：IntersectionObserver 哨兵，自动加载更多
 *  - 卡片网格：响应式 1/2/3 列，含六边形图标、主题色徽标、推荐星标、成员/帖子/今日发帖、加入按钮
 *  - 加入状态：localStorage 持久化，登录检查 + App.message Toast 反馈
 *  - 左栏：社区统一侧边栏（CommunitySidebar）
 *  - 右栏：已加入计数 + 分类导航 + 官方推荐 + 贴吧文化速览
 */
'use client';

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input, Button, App, Tooltip } from 'antd';
// Note: Pagination removed, using infinite scroll instead
import {
  SearchIcon,
  UsersIcon,
  FileTextIcon,
  PlusIcon,
  CheckIcon,
  StarIcon,
  EyeIcon,
  ArrowRightIcon,
  ListIcon,
  ShieldIcon,
  BookmarkIcon,
  HotIcon,
  NewIcon,
} from '@/components/shared/icons';
import { HEX_CLIP_PATH } from '@/lib/constants';
import {
  TIEBA_CATEGORIES,
  EXPANDED_TIEBA_CATALOG,
  fmtNum,
  type ExpandedTieba,
} from '../../../_data/community-data';
import CommunitySidebar from '../../../_components/CommunitySidebar';
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn';
import { safeStorage } from '@/lib/safeStorage';
import { getCreatedCount, MAX_CREATED_TIEBAS } from '@/lib/tieba-storage';
import { useChunkedData } from '@/hooks/useChunkedData';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { shimmerBg } from '@/components/skeleton/Skeleton';
import CreateTiebaModal from '../../../_components/CreateTiebaModal';

/* ─── 主题色 → CSS 变量映射（保持 HUD 紫金风格扩展） ─── */
const THEME_VARS: Record<NonNullable<ExpandedTieba['theme']>, { bg: string; border: string; fg: string }> = {
  gold:   { bg: 'rgba(255, 224, 102, 0.10)', border: 'rgba(255, 224, 102, 0.55)', fg: 'var(--gold)' },
  purple: { bg: 'rgba(157, 140, 255, 0.12)', border: 'rgba(157, 140, 255, 0.55)', fg: 'rgba(191, 176, 255, 1)' },
  cyan:   { bg: 'rgba(94, 234, 212, 0.10)',  border: 'rgba(94, 234, 212, 0.55)',  fg: '#5EEAD4' },
  green:  { bg: 'rgba(74, 222, 128, 0.10)',  border: 'rgba(74, 222, 128, 0.55)',  fg: '#4ADE80' },
  red:    { bg: 'rgba(248, 113, 113, 0.10)', border: 'rgba(248, 113, 113, 0.55)', fg: '#F87171' },
  blue:   { bg: 'rgba(96, 165, 250, 0.10)',  border: 'rgba(96, 165, 250, 0.55)',  fg: '#60A5FA' },
};

/** 初始骨架屏数量 */
const INITIAL_SKELETON_COUNT = 9;
/** 每批加载数量 */
const BATCH_SIZE = 6;
/** 骨架屏延迟（ms） */
const SKELETON_DELAY = 400;

/* ═══════════════════════════════════════════════════════════
   骨架屏卡片组件（复用项目标准 shimmerBg）
   ═══════════════════════════════════════════════════════════ */
function TiebaCardSkeleton() {
  return (
    <div
      className="tieba-card-skeleton relative flex flex-col h-full"
      style={{
        background: 'var(--surface)',
        borderRadius: 8,
        padding: '20px 20px 18px',
        overflow: 'hidden',
      }}
    >
      {/* 头部骨架 */}
      <div className="flex items-start gap-3 mb-3.5">
        <div
          style={{
            ...shimmerBg,
            width: 44,
            height: 44,
            clipPath: HEX_CLIP_PATH,
            flexShrink: 0,
          }}
        />
        <div className="flex-1 min-w-0 space-y-2">
          <div style={{ ...shimmerBg, height: 16, width: '70%' }} />
          <div style={{ ...shimmerBg, height: 12, width: '40%' }} />
        </div>
      </div>

      {/* 描述骨架 */}
      <div className="flex-1 space-y-2 mb-4">
        <div style={{ ...shimmerBg, height: 12, width: '100%' }} />
        <div style={{ ...shimmerBg, height: 12, width: '90%' }} />
        <div style={{ ...shimmerBg, height: 12, width: '60%' }} />
      </div>

      {/* 底部骨架 */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-3">
          <div style={{ ...shimmerBg, height: 12, width: 40 }} />
          <div style={{ ...shimmerBg, height: 12, width: 35 }} />
        </div>
        <div style={{ ...shimmerBg, height: 24, width: 60, borderRadius: 4 }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   单个贴吧卡片组件
   ═══════════════════════════════════════════════════════════ */
function TiebaCard({
  bar,
  joined,
  onToggleJoin,
}: {
  bar: ExpandedTieba;
  joined: boolean;
  onToggleJoin: (b: ExpandedTieba) => void;
}) {
  const theme = bar.theme ? THEME_VARS[bar.theme] : null;
  // 今日帖子数：≥100 红色徽标、≥50 橙色徽标、其余蓝色文字
  const todayTagColor = bar.todayPosts >= 100 ? '#F87171' : bar.todayPosts >= 50 ? '#FB923C' : '#60A5FA';

  return (
    <div
      className="tieba-card relative flex flex-col h-full"
      style={{
        background: 'var(--surface)',
        borderRadius: 8,
        padding: '20px 20px 18px',
        transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
        animation: 'cardFadeIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.35), 0 0 24px rgba(157,140,255,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* 官方推荐：左上金色星标 + 左上装饰角 */}
      {bar.featured && (
        <>
          <span
            className="absolute top-[-1px] left-[-1px] w-3 h-3 pointer-events-none"
            style={{
              borderTop: '1px solid rgba(255, 224, 102, 0.7)',
              borderLeft: '1px solid rgba(255, 224, 102, 0.7)',
            }}
          />
          <Tooltip title="Official recommended" placement="topLeft">
            <span
              className="absolute top-2 left-2 flex items-center justify-center"
              style={{
                width: 18,
                height: 18,
                borderRadius: 3,
                background: 'rgba(255,224,102,0.12)',
                border: '1px solid rgba(255,224,102,0.45)',
              }}
            >
              <StarIcon size={11} filled style={{ color: 'var(--gold)' }} />
            </span>
          </Tooltip>
        </>
      )}

      {/* 头部：六边形图标 + 主题色分类徽标 + 今日发帖数 */}
      <div className="flex items-start gap-3 mb-3.5">
        <span
          className="tieba-card-icon flex items-center justify-center font-display text-[15px] font-extrabold flex-shrink-0"
          style={{
            width: 44,
            height: 44,
            background: theme?.bg || 'var(--gold-subtle)',
            color: theme?.fg || 'var(--gold)',
            clipPath: HEX_CLIP_PATH,
          }}
        >
          {bar.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <Link
              href={`/community/tiebas?bar=${encodeURIComponent(bar.id)}`}
              className="tieba-card-name font-display text-[14px] font-bold no-underline hover:underline min-w-0 truncate"
              style={{ color: 'var(--text)', lineHeight: 1.2 }}
            >
              {bar.name}
            </Link>
            {/* 今日发帖数（紧凑标签，右对齐） */}
            <span
              className="font-mono text-[9px] font-semibold flex-shrink-0 px-1.5 py-0.5"
              style={{
                color: todayTagColor,
                background: `${todayTagColor}1A`,
                border: `1px solid ${todayTagColor}4D`,
                borderRadius: 3,
                letterSpacing: '0.04em',
              }}
              title={`${bar.todayPosts} posts today`}
            >
              {bar.todayPosts} TODAY
            </span>
          </div>
          {/* 分类徽标：主题色边框 pill */}
          <div className="flex items-center gap-1.5">
            <span
              className="tag-hud-pill px-2 py-0.5"
              style={{
                color: theme?.fg || 'var(--text-muted)',
                background: theme?.bg || 'transparent',
                border: `1px solid ${theme?.border || 'var(--border)'}`,
                borderRadius: 999,
              }}
            >
              {bar.category}
            </span>
            {joined && (
              <span
                className="tag-hud-pill px-2 py-0.5 flex items-center gap-1"
                style={{
                  color: '#4ADE80',
                  background: 'rgba(74, 222, 128, 0.10)',
                  border: '1px solid rgba(74, 222, 128, 0.5)',
                  borderRadius: 999,
                }}
              >
                <CheckIcon size={9} /> Joined
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 贴吧描述（3 行省略，避免过长卡片高度不一致） */}
      <p
        className="tieba-card-desc font-body text-[12px] leading-relaxed mb-4 flex-1"
        style={{
          color: 'var(--text-dim)',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {bar.desc}
      </p>

      {/* 统计：成员数 / 帖子数 + 加入按钮 */}
      <div className="flex items-center justify-between gap-2 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <UsersIcon size={12} style={{ opacity: 0.7 }} />
            {fmtNum(bar.members)}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <FileTextIcon size={12} style={{ opacity: 0.7 }} />
            {fmtNum(bar.posts)}
          </span>
        </div>
        <Button
          onClick={() => onToggleJoin(bar)}
          size="small"
          type={joined ? 'default' : 'primary'}
          icon={joined ? <CheckIcon size={12} /> : <PlusIcon size={12} />}
          className="btn-hud-sm"
          style={{
            height: 28,
            padding: '0 12px',
            background: joined ? 'rgba(74, 222, 128, 0.10)' : 'var(--gold)',
            borderColor: joined ? 'rgba(74, 222, 128, 0.5)' : 'var(--gold)',
            color: joined ? '#4ADE80' : 'var(--bg)',
            boxShadow: joined ? 'none' : '0 0 12px rgba(157,140,255,0.22)',
          }}
        >
          {joined ? 'Joined' : 'Join'}
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   主页面组件
   ═══════════════════════════════════════════════════════════ */
/** 选项卡类型 */
type TiebaTabKey = 'following' | 'hot' | 'new';

/** 选项卡配置 */
const TIEBA_TABS: { key: TiebaTabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'following', label: 'Following', icon: <BookmarkIcon size={12} /> },
  { key: 'hot', label: 'Hot', icon: <HotIcon size={12} /> },
  { key: 'new', label: 'New', icon: <NewIcon size={12} /> },
];

export default function ExploreTiebasPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const { loggedIn } = useIsLoggedIn();

  // ── UI 状态 ──
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TiebaTabKey>('following');
  /** 已加入贴吧 ID 集合（从 localStorage 同步） */
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({});

  // 挂载时读取 localStorage 中全部贴吧的加入状态（避免 hydration mismatch）
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const b of EXPANDED_TIEBA_CATALOG) {
      if (safeStorage.get(`ghrank_joined_bar_${b.id}`) === '1') next[b.id] = true;
    }
    setJoinedMap(next);
  }, []);

  // 用户创建的贴吧计数 + 弹窗状态
  const [createdCount, setCreatedCount] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  useEffect(() => {
    setCreatedCount(getCreatedCount());
  }, [createModalOpen]); // 弹窗关闭时刷新计数

  // ── 加入/退出切换 ──
  const handleToggleJoin = useCallback(
    (bar: ExpandedTieba) => {
      if (!loggedIn) {
        message.warning('Please log in to join tieba groups');
        return;
      }
      const key = `ghrank_joined_bar_${bar.id}`;
      const nowJoined = joinedMap[bar.id];
      if (nowJoined) {
        safeStorage.remove(key);
        setJoinedMap((p) => ({ ...p, [bar.id]: false }));
        message.info(`Left ${bar.name}`);
      } else {
        safeStorage.set(key, '1');
        setJoinedMap((p) => ({ ...p, [bar.id]: true }));
        message.success(`Joined ${bar.name}`);
      }
    },
    [loggedIn, joinedMap, message],
  );

  // ── 派生数据：按选项卡过滤 ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = EXPANDED_TIEBA_CATALOG.slice();

    // 按选项卡过滤
    switch (activeTab) {
      case 'following':
        // 关注的贴吧：用户已加入的
        list = list.filter((b) => joinedMap[b.id]);
        break;
      case 'hot':
        // 热门贴吧：按今日发帖数降序
        list.sort((a, b) => b.todayPosts - a.todayPosts);
        break;
      case 'new':
        // 新建贴吧：推荐 + 新发布的
        list = list.filter((b) => b.featured);
        break;
    }

    // 搜索过滤
    if (q) list = list.filter((b) => (b.name + ' ' + b.desc + ' ' + b.tags.join(' ')).toLowerCase().includes(q));

    // 如果没有按选项卡排序，则按默认规则排序
    if (activeTab !== 'hot') {
      list.sort((a, b) => {
        if (!!b.featured - !!a.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        if (b.todayPosts !== a.todayPosts) return b.todayPosts - a.todayPosts;
        return b.members - a.members;
      });
    }

    return list;
  }, [search, activeTab, joinedMap]);

  // ── 无限滚动：数据分块加载 ──
  const {
    visibleItems,
    skeletonCount,
    loading,
    exhausted,
    initialDone,
    loadMore,
    replaceNextBatch,
    reset,
  } = useChunkedData<ExpandedTieba>({
    initialData: filtered.slice(0, INITIAL_SKELETON_COUNT),
    moreData: filtered.slice(INITIAL_SKELETON_COUNT),
    skeletonBatch: 3,
    infiniteBatch: BATCH_SIZE,
    initialDelay: SKELETON_DELAY,
  });

  // 选项卡/搜索变化时重置
  useEffect(() => {
    reset();
  }, [activeTab, search, reset]);

  // 骨架屏逐批替换
  const replacingRef = useRef(false);
  const tryReplaceBatch = useCallback(() => {
    if (replacingRef.current || initialDone) return;
    replacingRef.current = true;
    replaceNextBatch();
    replacingRef.current = false;
  }, [replaceNextBatch, initialDone]);

  useEffect(() => {
    if (initialDone) return;
    const timer = setTimeout(tryReplaceBatch, SKELETON_DELAY);
    return () => clearTimeout(timer);
  }, [tryReplaceBatch, initialDone]);

  useEffect(() => {
    if (initialDone || skeletonCount === 0) return;
    const interval = setInterval(() => {
      if (initialDone || skeletonCount === 0) {
        clearInterval(interval);
        return;
      }
      tryReplaceBatch();
    }, SKELETON_DELAY);
    return () => clearInterval(interval);
  }, [initialDone, skeletonCount, tryReplaceBatch]);

  // 无限滚动哨兵
  const { sentinelRef, pause, resume } = useInfiniteScroll<HTMLDivElement>({
    hasMore: !exhausted,
    loading,
    onLoadMore: loadMore,
    initialDone,
  });

  useEffect(() => {
    if (loading) {
      pause();
      const timer = setTimeout(() => resume(), 700);
      return () => clearTimeout(timer);
    }
  }, [loading, pause, resume]);

  const total = filtered.length;
  const skeletons = Array.from({ length: skeletonCount }, (_, i) => i);

  // ── 右栏：分类计数（用于分类导航） ──
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { All: EXPANDED_TIEBA_CATALOG.length };
    for (const b of EXPANDED_TIEBA_CATALOG) counts[b.category] = (counts[b.category] || 0) + 1;
    return counts;
  }, []);

  // 已加入数量
  const joinedCount = useMemo(
    () => EXPANDED_TIEBA_CATALOG.reduce((s, b) => s + (joinedMap[b.id] ? 1 : 0), 0),
    [joinedMap],
  );

  return (
    <div className="grid gap-5 lg:gap-6 py-6 pb-16 items-start grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_300px]">
      {/* ─── 左栏：社区统一侧边栏 ─────────────────────────────────────── */}
      <div className="hidden lg:block">
        <CommunitySidebar />
      </div>

      {/* ─── 中栏：Hero + 搜索 + Tab + 网格 + 分页 ─────────────────── */}
      <section id="explore-grid-top" className="min-w-0">
        {/* Hero 标题区：页面标题 + 副标题 + 面包屑返回 */}
        <div className="mb-6">
          <div
            className="flex items-center gap-2 mb-2 meta-hud-mono"
            style={{ color: 'var(--text-muted)' }}
          >
            <Link href="/community" className="no-underline hover:underline" style={{ color: 'inherit' }}>
              Community
            </Link>
            <span>/</span>
            <Link href="/community/tiebas" className="no-underline hover:underline" style={{ color: 'inherit' }}>
              Tiebas
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--gold)' }}>Explore &amp; Join</span>
          </div>
          <h1
            className="font-display mb-2"
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: '-0.01em',
              lineHeight: 1.15,
              color: 'var(--text)',
            }}
          >
            Explore <span style={{ color: 'var(--gold)' }}>51 Tieba Groups</span>
          </h1>
          <p className="font-body" style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6 }}>
            Curated communities for AI researchers, data engineers, frontend artisans, open-source maintainers, and career builders — join the conversations that match your interests.
          </p>
        </div>

        {/* 搜索框 + 结果摘要行 */}
        <div
          className="mb-5"
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            padding: '16px 18px',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Input
              allowClear
              size="large"
              prefix={<SearchIcon size={14} style={{ color: 'var(--text-muted)' }} />}
              placeholder="Search tieba by name, topic, or keyword…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                maxWidth: 520,
                background: 'transparent',
              }}
            />
            <div className="flex items-center gap-4 meta-hud-mono" style={{ color: 'var(--text-muted)' }}>
              <span className="inline-flex items-center gap-1.5">
                <ListIcon size={13} style={{ opacity: 0.7 }} />
                Showing {visibleItems.length} · Total {total}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <EyeIcon size={13} style={{ opacity: 0.7 }} />
                Sorted by Featured · Today · Members
              </span>
            </div>
          </div>
        </div>

        {/* 选项卡：关注的贴吧 / 热门贴吧 / 新建贴吧 + 右侧创建按钮 */}
        <div
          className="flex flex-wrap items-center justify-between gap-1.5 mb-5"
          role="tablist"
          aria-label="Tieba tabs"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {TIEBA_TABS.map((tab) => {
              const active = tab.key === activeTab;
              // 计算各选项卡的数量
              let count = 0;
              if (tab.key === 'following') {
                count = joinedCount;
              } else if (tab.key === 'hot') {
                count = EXPANDED_TIEBA_CATALOG.filter(
                  (b) => b.todayPosts >= 50,
                ).length;
              } else if (tab.key === 'new') {
                count = EXPANDED_TIEBA_CATALOG.filter((b) => b.featured).length;
              }
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.key)}
                  className="tab-hud-mono px-3 py-1.5 flex items-center gap-1.5"
                  style={{
                    background: active ? 'var(--gold)' : 'transparent',
                    border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                    color: active ? 'var(--bg)' : 'var(--text-dim)',
                    cursor: 'pointer',
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {tab.icon}
                  {tab.label}
                  <span
                    className="ml-1"
                    style={{
                      opacity: active ? 0.8 : 1,
                      color: active ? 'var(--bg)' : 'var(--text-muted)',
                      fontSize: 11,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 右侧：创建贴吧按钮（未达上限时显示） */}
          {createdCount < MAX_CREATED_TIEBAS && (
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-1.5"
              style={{
                padding: '6px 12px', borderRadius: 6,
                background: 'linear-gradient(180deg, rgba(157,140,255,0.22), rgba(157,140,255,0.10))',
                color: 'var(--gold)',
                border: '1px solid rgba(157,140,255,0.32)',
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                fontFamily: 'var(--font-display)',
                transition: 'all 0.2s ease',
              }}
            >
              <PlusIcon size={12} /> Create New Tieba
            </button>
          )}
        </div>

        {/* 空状态提示 */}
        {activeTab === 'following' && joinedCount === 0 && (
          <div
            className="mb-5 flex items-center justify-center py-6"
            style={{
              border: '1px dashed var(--border)',
              borderRadius: 4,
              color: 'var(--text-muted)',
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <BookmarkIcon size={20} style={{ opacity: 0.5, display: 'block', lineHeight: 0 }} />
              <div className="font-display text-[13px]">No followed tiebas yet</div>
              <div className="font-mono text-[11px] text-center" style={{ letterSpacing: '0.04em' }}>
                Browse the Hot or New tabs to discover and join tiebas
              </div>
            </div>
          </div>
        )}

        {/* 卡片网格：响应式 1/2/3 列 + 骨架屏 + 无限滚动 */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
          }}
        >
          {/* 利用 CSS 响应式：sm→2 列；lg→3 列 */}
          <style jsx global>{`
            @media (min-width: 640px) {
              .explore-tieba-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            }
            @media (min-width: 1280px) {
              .explore-tieba-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            }
          `}</style>
          <div
            className="explore-tieba-grid grid gap-4"
            style={{ gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' }}
          >
            {visibleItems.length === 0 && skeletons.length === 0 ? (
              <div
                className="col-span-full flex flex-col items-center justify-center py-16"
                style={{ color: 'var(--text-muted)' }}
              >
                <SearchIcon size={22} style={{ opacity: 0.5, marginBottom: 10 }} />
                <div className="font-display text-[14px] mb-1">No tieba groups match your filters</div>
                <div className="font-mono text-[11px]" style={{ letterSpacing: '0.04em' }}>
                  Try a different keyword or clear the filters
                </div>
              </div>
            ) : (
              <>
                {/* 已加载的真实卡片 */}
                {visibleItems.map((b) => (
                  <TiebaCard key={b.id} bar={b} joined={!!joinedMap[b.id]} onToggleJoin={handleToggleJoin} />
                ))}
                {/* 骨架屏占位 */}
                {skeletons.map((i) => (
                  <TiebaCardSkeleton key={`skeleton-${i}`} />
                ))}
              </>
            )}
          </div>
        </div>

        {/* 无限滚动哨兵 + 加载指示器 */}
        <div
          ref={sentinelRef}
          className="flex justify-center py-8"
        >
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
          {exhausted && visibleItems.length > 0 && !loading && (
            <div
              className="font-mono text-[11px]"
              style={{ color: 'var(--text-muted)', opacity: 0.4, letterSpacing: '1px' }}
            >
              // END OF TIEBAS
            </div>
          )}
        </div>
      </section>

      {/* ─── 右栏：贴吧统计 + 分类导航 + 官方推荐 + 贴吧文化 ─────────── */}
      <aside
        className="hidden xl:flex flex-col gap-5"
        style={{ position: 'sticky', top: 88, maxHeight: 'calc(100vh - 104px)', overflowY: 'auto', paddingRight: 4 }}
      >
        {/* 合并统计卡片：Joined + Created */}
        <div
          className="relative"
          style={{ background: 'transparent', border: '1px solid var(--border)', padding: '18px 16px' }}
        >
          {/* 左上装饰角 */}
          <span
            className="absolute top-0 left-0 w-2.5 h-2.5"
            style={{
              borderTop: '1px solid rgba(157,140,255,0.5)',
              borderLeft: '1px solid rgba(157,140,255,0.5)',
            }}
          />
          <div className="meta-hud-mono mb-3" style={{ color: 'var(--text-muted)' }}>
            Tieba Stats
          </div>

          {/* 双列统计 */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Joined */}
            <div>
              <div className="font-mono text-[10px] mb-1.5" style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                JOINED
              </div>
              <div className="flex items-baseline gap-1 mb-1.5">
                <div className="font-display text-[24px] font-extrabold leading-none" style={{ color: 'var(--gold)' }}>
                  {joinedCount}
                </div>
                <div className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  / {EXPANDED_TIEBA_CATALOG.length}
                </div>
              </div>
              <div className="w-full h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, (joinedCount / EXPANDED_TIEBA_CATALOG.length) * 100)}%`,
                    background: 'linear-gradient(90deg, var(--gold) 0%, rgba(157,140,255,1) 100%)',
                  }}
                />
              </div>
            </div>
            {/* Created */}
            <div>
              <div className="font-mono text-[10px] mb-1.5" style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                CREATED
              </div>
              <div className="flex items-baseline gap-1 mb-1.5">
                <div className="font-display text-[24px] font-extrabold leading-none" style={{ color: 'var(--gold)' }}>
                  {createdCount}
                </div>
                <div className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  / {MAX_CREATED_TIEBAS}
                </div>
              </div>
              <div className="w-full h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, (createdCount / MAX_CREATED_TIEBAS) * 100)}%`,
                    background: 'linear-gradient(90deg, var(--gold) 0%, rgba(255,224,102,0.6) 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 分类导航 */}
        <section className="sidebar-section">
          <div
            className="sidebar-section-title meta-hud-mono px-1 mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Categories
          </div>
          <nav className="flex flex-col gap-1">
            {TIEBA_CATEGORIES.filter((c) => c.key !== 'All').map((c) => {
              const active = c.key === activeTab;
              return (
                <div
                  key={c.key}
                  className="flex items-center justify-between px-2.5 py-2 tab-hud-mono"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-dim)',
                  }}
                >
                  <span className="truncate">{c.label}</span>
                  <span
                    className="meta-hud-mono ml-2 flex-shrink-0"
                    style={{ color: 'var(--text-muted)', fontSize: 10 }}
                  >
                    {catCounts[c.key] || 0}
                  </span>
                </div>
              );
            })}
          </nav>
        </section>

        {/* 官方推荐（置顶展示 featured） */}
        <section className="sidebar-section">
          <div
            className="sidebar-section-title meta-hud-mono px-1 mb-2 flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <StarIcon size={11} filled style={{ color: 'var(--gold)' }} />
            Editor's Pick
          </div>
          <div className="flex flex-col gap-2">
            {EXPANDED_TIEBA_CATALOG.filter((b) => b.featured).slice(0, 3).map((b) => {
              const t = b.theme ? THEME_VARS[b.theme] : null;
              return (
                <Link
                  key={b.id}
                  href={`/community/tiebas?bar=${encodeURIComponent(b.id)}`}
                  className="flex items-center gap-3 p-2.5 no-underline"
                  style={{
                    background: 'transparent',
                    border: `1px solid ${t?.border || 'var(--border-subtle)'}`,
                    color: 'inherit',
                  }}
                >
                  <span
                    className="flex items-center justify-center font-display text-[13px] font-extrabold flex-shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      background: t?.bg || 'var(--gold-subtle)',
                      color: t?.fg || 'var(--gold)',
                      clipPath: HEX_CLIP_PATH,
                    }}
                  >
                    {b.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className="font-display text-[13px] font-semibold truncate"
                      style={{ color: 'var(--text)' }}
                    >
                      {b.name}
                    </div>
                    <div
                      className="font-mono text-[10px]"
                      style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}
                    >
                      {fmtNum(b.members)} members · {b.todayPosts} today
                    </div>
                  </div>
                  <ArrowRightIcon size={13} style={{ opacity: 0.5, color: 'var(--gold)' }} />
                </Link>
              );
            })}
          </div>
        </section>

        {/* 贴吧文化 & 准则 */}
        <section className="sidebar-section">
          <div
            className="sidebar-section-title font-mono text-[10px] font-semibold uppercase px-1 mb-2 flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
          >
            <ShieldIcon size={11} />
            Tieba Culture
          </div>
          <div
            className="flex flex-col gap-2 p-3"
            style={{ background: 'transparent', border: '1px solid var(--border-subtle)' }}
          >
            {[
              'Respectful discourse — no personal attacks.',
              'Credit sources and cite original work.',
              'Self-promo only in Show & Tell threads.',
              'Use tags so others can find your posts.',
            ].map((line, i) => (
              <div
                key={i}
                className="font-body text-[12px] pl-2"
                style={{
                  color: 'var(--text-dim)',
                  borderLeft: '2px solid var(--border)',
                  lineHeight: 1.45,
                }}
              >
                {i + 1}. {line}
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

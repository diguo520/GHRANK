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
import { Tabs, Divider, Button } from 'antd';
import { useChunkedData } from '@/hooks/useChunkedData';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { SkeletonAvatar, SkeletonLine } from '@/components/skeleton/Skeleton';
import { HEX_CLIP_PATH } from '@/lib/constants';
import { fmtNum } from '../../_data/community-data';
import ThreadItem from '../../_components/ThreadItem';
import { type Thread, type TiebaCatalogItem } from '../../_data/community-data';
import { UsersIcon, FileTextIcon, PlusIcon } from '@/components/shared/icons';
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn';
import { safeStorage } from '@/lib/safeStorage';
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
    <div className="thread-list flex flex-col">
      {/* 已加载的真实帖子（贴吧页点赞为只读统计），使用 Divider 分割线分隔 */}
      {visibleItems.map((item, index) => (
        <div key={`thread-${item.id}`}>
          <ThreadItem
            thread={item}
            barId={bar.id}
            interactiveLike={false}
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

interface TiebasPostListProps {
  /** 当前贴吧目录项 */
  bar: TiebaCatalogItem;
}

export default function TiebasPostList({ bar }: TiebasPostListProps) {
  const [currentTab, setCurrentTab] = useState('All');
  // 加入状态（客户端挂载后从 localStorage 读取，避免 hydration mismatch）
  const [joined, setJoined] = useState(false);
  const { loggedIn } = useIsLoggedIn();
  // Toast 状态：加入贴吧反馈提示
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 显示 Toast（固定在视口底部，2.2s 后自动隐藏）
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  useEffect(() => {
    setJoined(safeStorage.get(`ghrank_joined_bar_${bar.id}`) === '1');
  }, [bar.id]);

  // 清理 Toast 定时器
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  /** 加入贴吧：检查登录 -> 标记 localStorage -> 切换按钮状态 */
  const handleJoin = useCallback(() => {
    if (!loggedIn) {
      showToast('Please log in to join this tieba');
      return;
    }
    safeStorage.set(`ghrank_joined_bar_${bar.id}`, '1');
    setJoined(true);
    showToast(`Joined ${bar.name}`);
  }, [loggedIn, bar.id, bar.name, showToast]);

  // 已加入且已登录时显示"New Post"，否则显示"Join Tieba"
  const showNewPost = joined && loggedIn;

  // antd Tabs items 配置
  const tabItems = useMemo(() => TIEBA_TABS.map((tab) => ({
    key: tab.key,
    label: tab.label,
  })), []);

  return (
    <main className="community-content min-w-0">
      {/* Tieba Hero：图片横幅背景 + 图标、标题、描述、统计（成员/帖子）、按钮 */}
      <div
        className="community-hero tieba-hero relative overflow-hidden mb-6"
        style={{
          // 有横幅图片时用图片背景，否则用渐变占位
          backgroundImage: bar.banner ? `url(${bar.banner})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 0,
        }}
      >
        {/* 渐变遮罩：左侧深色不透明（保证文字可读）→ 右侧完全透明（完整展示横幅图片） */}
        <div
          className="absolute inset-0"
          style={{
            background: bar.banner
              ? 'linear-gradient(90deg, rgba(15,15,16,0.99) 20%, rgba(15,15,16,0.89) 70%, rgba(15,15,16,0.79) 80%, rgba(15,15,16,0.69) 90%, rgba(15,15,16,0.59) 100%)'
              : 'linear-gradient(135deg, rgba(157, 140, 255, 0.04) 0%, transparent 60%), var(--surface)',
          }}
        />
        {/* 顶部细微高光条，增强横幅层次感 */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(157,140,255,0.25), transparent)' }}
        />
        <span className="absolute top-0 left-0 w-[18px] h-[18px] z-10" style={{ borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)', borderTopLeftRadius: 12 }} />
        <span className="absolute bottom-0 right-0 w-[18px] h-[18px] z-10" style={{ borderBottom: '2px solid var(--gold)', borderRight: '2px solid var(--gold)', borderBottomRightRadius: 12 }} />
        <div className="tieba-hero-wrapper relative z-[1] flex flex-col gap-5 md:flex-row md:items-start md:justify-between" style={{ padding: '28px 32px' }}>
          {/* 左：图标 + 标题 + 描述 + 统计 */}
          <div className="tieba-hero-main flex items-start gap-5 min-w-0">
            {/* 六边形图标 */}
            <span
              className="tieba-hero-icon flex items-center justify-center font-display text-2xl font-extrabold flex-shrink-0"
              style={{
                width: '64px',
                height: '64px',
                background: 'var(--gold-subtle)',
                color: 'var(--gold)',
                clipPath: HEX_CLIP_PATH,
                boxShadow: '0 0 24px rgba(157, 140, 255, 0.25)',
              }}
            >
              {bar.icon}
            </span>
            <div className="min-w-0">
              <div
                className="community-hero-eyebrow font-mono text-[11px] font-semibold uppercase mb-2.5"
                style={{ color: 'var(--gold)', letterSpacing: '0.16em' }}
              >
                // TIEBA
              </div>
              <h1
                className="community-hero-title font-display font-extrabold mb-2"
                style={{ fontSize: '32px', color: 'var(--text)', lineHeight: 1.1, letterSpacing: '0.01em' }}
              >
                {bar.name}
              </h1>
              <p
                className="community-hero-sub font-body text-[14px] leading-relaxed mb-4"
                style={{ color: 'var(--text-dim)', maxWidth: '640px' }}
              >
                {bar.desc}
              </p>
              {/* 统计：成员数 + 帖子数 */}
              <div className="tieba-hero-stats flex items-center gap-5 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 font-mono text-[11px]"
                  style={{ color: 'var(--text-dim)', letterSpacing: '0.04em' }}
                >
                  <UsersIcon size={14} style={{ color: 'var(--gold)' }} />
                  <span style={{ color: 'var(--text)', fontWeight: 700 }}>{fmtNum(bar.members)}</span>
                  <span style={{ opacity: 0.65 }}>members</span>
                </span>
                <span
                  className="inline-flex items-center gap-1.5 font-mono text-[11px]"
                  style={{ color: 'var(--text-dim)', letterSpacing: '0.04em' }}
                >
                  <FileTextIcon size={14} style={{ color: 'var(--gold)' }} />
                  <span style={{ color: 'var(--text)', fontWeight: 700 }}>{fmtNum(bar.posts)}</span>
                  <span style={{ opacity: 0.65 }}>posts</span>
                </span>
              </div>
            </div>
          </div>

          {/* 右：按钮（Join Tieba / New Post） */}
          <div className="tieba-hero-actions flex flex-col gap-2 flex-shrink-0">
            {!showNewPost ? (
              <Button
                onClick={handleJoin}
                size="large"
                type="primary"
                icon={<PlusIcon size={14} />}
                className="btn-hud-lg"
                style={{
                  height: 'auto',
                  padding: '10px 20px',
                  background: 'var(--gold)',
                  borderColor: 'var(--gold)',
                  color: 'var(--bg)',
                  boxShadow: '0 0 16px rgba(157,140,255,0.25)',
                  minWidth: '160px',
                }}
              >
                Join Tieba
              </Button>
            ) : (
              <Link
                href={`/community/new?tieba=${encodeURIComponent(bar.name)}`}
                className="flex items-center justify-center gap-2 no-underline btn-hud-lg"
                style={{
                  color: 'var(--bg)',
                  background: 'var(--gold)',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  boxShadow: '0 0 16px rgba(157,140,255,0.25)',
                  transition: 'background 0.2s, box-shadow 0.2s',
                  minWidth: '160px',
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ffe066';
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(157,140,255,0.25), 0 0 48px rgba(157,140,255,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--gold)';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(157,140,255,0.25)';
                }}
              >
                <PlusIcon size={14} />
                New Post
              </Link>
            )}
          </div>
        </div>

        {/* Toast 提示：加入成功 / 需登录 */}
        {toastVisible && (
          <div
            className="absolute left-1/2 z-10 font-mono text-[12px]"
            style={{
              bottom: '16px',
              transform: 'translateX(-50%)',
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              padding: '8px 16px',
              borderRadius: '4px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              animation: 'cardFadeIn 0.25s ease-out',
            }}
          >
            {toastMsg}
          </div>
        )}
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
      <ThreadListInner key={currentTab} bar={bar} tab={currentTab} />
    </main>
  );
}

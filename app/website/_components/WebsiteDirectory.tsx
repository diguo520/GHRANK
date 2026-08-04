/**
 * WebsiteDirectory —— 网站目录页交互主组件
 * 管理：分类筛选（侧边栏 toggle）、实时搜索（防抖）、排序、骨架屏 + 无限滚动、toast
 * 迁移自 website.js 的 WebsitePage 组件
 * 布局：sidebar + content（搜索栏 + hero + 结果元信息 + 卡片网格）
 */
'use client';

import { useState, useEffect, useRef, useCallback, useMemo, CSSProperties } from 'react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { SkeletonLine } from '@/components/skeleton/Skeleton';
import {
  type WebsiteCategory,
  SITES,
  CATEGORY_LABELS,
  CATEGORY_NAV,
  SORT_OPTIONS,
  PAGE_SIZE,
} from '../_data/website-data';
import { SearchIcon, ArrowRightIcon } from '../../_components/icons';
import WebsiteSidebar from './WebsiteSidebar';
import WebsiteCard from './WebsiteCard';

/* ── 骨架屏卡片数 ── */
const SKELETON_COUNT = 6;
const LOAD_DELAY = 600;

/* ── 骨架屏卡片：匹配真实卡片布局，避免替换时布局抖动 ── */
function WebsiteSkeletonCard() {
  const shimmer = {
    background: 'linear-gradient(90deg, var(--surface) 25%, var(--surface-overlay) 50%, var(--surface) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '3px',
  } as CSSProperties;

  return (
    <div className="flex" style={{ gap: '16px', padding: '18px 20px', border: '1px solid var(--border)', pointerEvents: 'none' }}>
      <div style={{ ...shimmer, width: '48px', height: '48px', flexShrink: 0 }} />
      <div className="flex flex-col" style={{ flex: 1, gap: '8px' }}>
        <SkeletonLine width="40%" />
        <SkeletonLine width="65%" />
        <SkeletonLine width="90%" />
        <SkeletonLine width="90%" />
      </div>
    </div>
  );
}

export default function WebsiteDirectory() {
  // ── 状态 ──
  const [currentCategory, setCurrentCategory] = useState<WebsiteCategory | 'all'>('all');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [currentSort, setCurrentSort] = useState('popular');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toastUrl, setToastUrl] = useState('');

  // ── 稳定引用 ──（React 19 useRef 需显式传入初始值）
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const loadingMoreRef = useRef(false);
  const filteredRef = useRef<typeof SITES>([]);

  // ── 过滤 + 排序 ──
  const filteredSites = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let result = SITES.filter((site) => {
      const catMatch = currentCategory === 'all' || site.category === currentCategory;
      const queryMatch = !q ||
        site.name.toLowerCase().includes(q) ||
        site.url.toLowerCase().includes(q) ||
        site.desc.toLowerCase().includes(q);
      return catMatch && queryMatch;
    });

    if (currentSort === 'alphabetical') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === 'newest') {
      result = [...result].reverse();
    } else {
      result = [...result].sort((a, b) => b.visits - a.visits);
    }
    return result;
  }, [currentCategory, debouncedQuery, currentSort]);

  filteredRef.current = filteredSites;

  // ── Toast 提示 ──
  const showToast = useCallback((url: string) => {
    setToastUrl(url);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastUrl(''), 2200);
  }, []);

  // ── 分类变更：更新 URL hash ──
  const handleCategoryChange = useCallback((cat: WebsiteCategory | 'all') => {
    setCurrentCategory(cat);
    if (cat === 'all') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } else {
      window.history.replaceState(null, '', `#${cat}`);
    }
  }, []);

  // ── 搜索输入防抖（120ms） ──
  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 120);
  };

  // ── hash 路由初始化 + 监听 ──
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash in CATEGORY_LABELS) {
      setCurrentCategory(hash as WebsiteCategory);
    }
    const onHashChange = () => {
      const h = window.location.hash.replace('#', '');
      if (!h) {
        setCurrentCategory('all');
      } else if (h in CATEGORY_LABELS) {
        setCurrentCategory(h as WebsiteCategory);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // ── 筛选条件变化：重置加载状态，显示骨架屏 ──
  useEffect(() => {
    setLoading(true);
    setVisibleCount(0);
    const timer = setTimeout(() => {
      setLoading(false);
      setVisibleCount(PAGE_SIZE);
    }, LOAD_DELAY);
    return () => clearTimeout(timer);
  }, [currentCategory, debouncedQuery, currentSort]);

  // ── 无限滚动：加载更多 ──
  const handleLoadMore = useCallback(() => {
    if (loadingMoreRef.current || loading) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredRef.current.length));
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }, LOAD_DELAY);
  }, [loading]);

  const hasMore = visibleCount < filteredSites.length;
  const { sentinelRef } = useInfiniteScroll<HTMLDivElement>({
    hasMore,
    loading: loading || loadingMore,
    onLoadMore: handleLoadMore,
    initialDone: !loading,
    rootMargin: '120px',
  });

  // 清理 toast 定时器
  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const visibleCards = filteredSites.slice(0, visibleCount);
  const totalResults = filteredSites.length;
  const isExhausted = !loading && !loadingMore && visibleCount >= totalResults;

  return (
    <div
      className="grid website-layout"
      style={{
        gridTemplateColumns: '280px 1fr',
        gap: '32px',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '24px 32px 64px',
        alignContent: 'start',
      }}
    >
      {/* ═══ 侧边栏 ═══ */}
      <WebsiteSidebar currentCategory={currentCategory} onCategoryChange={handleCategoryChange} />

      {/* ═══ 主内容区 ═══ */}
      <main className="min-w-0">
        {/* 搜索栏 + 排序 */}
        <div className="flex flex-wrap items-center" style={{ gap: '16px', marginBottom: '28px' }}>
          <div className="flex flex-1 items-center" style={{ minWidth: '240px', background: 'var(--surface)', border: '1px solid var(--border)', transition: 'border-color 0.18s, box-shadow 0.18s' } as CSSProperties}>
            <span className="flex items-center justify-center" style={{ padding: '0 12px', color: 'var(--text-muted)', flexShrink: 0 }}>
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search 1,284 sites by name, url, or description..."
              spellCheck={false}
              autoComplete="off"
              style={{
                flex: 1,
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--text)',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '12px 0',
                minWidth: 0,
              }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', padding: '0 14px', letterSpacing: '0.06em', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {totalResults} {totalResults === 1 ? 'site' : 'sites'}
            </span>
          </div>
          <div className="flex items-center" style={{ gap: '8px', flexShrink: 0 }}>
            <label htmlFor="website-sort" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Sort
            </label>
            <select
              id="website-sort"
              value={currentSort}
              onChange={(e) => setCurrentSort(e.target.value)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '9px 32px 9px 12px',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                letterSpacing: '0.04em',
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Hero 头部 */}
        <header style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '10px' }}>
            // CURATED DIRECTORY
          </div>
          <h1 className="font-display font-extrabold" style={{ fontSize: '36px', lineHeight: 1.1, letterSpacing: '0.01em', color: 'var(--text)', marginBottom: '10px' }}>
            Website Directory
          </h1>
          <p className="font-body" style={{ fontSize: '15px', color: 'var(--text-dim)', lineHeight: 1.55, maxWidth: '720px' }}>
            A hand-curated index of the tools, platforms, and communities powering the agentic web — ranked by traffic, vetted by maintainers.
          </p>
        </header>

        {/* 结果元信息 */}
        <div className="flex items-center" style={{ gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.04em', marginBottom: '24px' }}>
          <span style={{ color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {CATEGORY_LABELS[currentCategory]}
          </span>
          <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>/</span>
          <span>{totalResults} {totalResults === 1 ? 'result' : 'results'}</span>
        </div>

        {/* 卡片网格 */}
        {totalResults === 0 && !loading ? (
          /* 空状态 */
          <div className="text-center" style={{ padding: '64px 20px' }}>
            <div style={{ fontSize: '32px', color: 'var(--text-muted)', marginBottom: '12px' }}>⏳</div>
            <div className="font-display font-semibold" style={{ fontSize: '16px', color: 'var(--text-dim)', marginBottom: '6px' }}>No sites match your filters</div>
            <div className="font-body" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Try a different search term or category</div>
          </div>
        ) : (
          <div className="grid website-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {/* 骨架屏 */}
            {loading && Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <WebsiteSkeletonCard key={`skel-${i}`} />
            ))}

            {/* 真实卡片 */}
            {!loading && visibleCards.map((site, i) => (
              <WebsiteCard
                key={`${site.url}-${i}`}
                site={site}
                onClick={showToast}
                animationDelay={(i % PAGE_SIZE) * 35}
              />
            ))}

            {/* 无限滚动哨兵 + 加载指示器 */}
            {!loading && hasMore && (
              <div
                ref={sentinelRef}
                className="col-span-full flex items-center justify-center"
                style={{ padding: '28px 0' }}
              >
                {loadingMore && (
                  <div
                    className="h-6 w-6 rounded-full border-2"
                    style={{
                      borderColor: 'var(--border)',
                      borderTopColor: 'var(--gold)',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                )}
              </div>
            )}

            {/* 加载完毕标记 */}
            {isExhausted && (
              <div className="col-span-full text-center" style={{ padding: '24px 0', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                — End of results —
              </div>
            )}
          </div>
        )}
      </main>

      {/* ═══ Toast 提示 ═══ */}
      {toastUrl && (
        <div
          className="fixed left-1/2 flex items-center"
          style={{
            bottom: '32px',
            transform: 'translateX(-50%)',
            gap: '10px',
            padding: '12px 20px',
            background: 'var(--surface)',
            border: '1px solid rgba(245,197,24,0.35)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text)',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            animation: 'toastSlideIn 0.25s ease',
          }}
        >
          <span className="flex items-center" style={{ color: 'var(--gold)' }}>
            <ArrowRightIcon size={14} />
          </span>
          <span>Opening external link</span>
          <span style={{ color: 'var(--text-dim)', marginLeft: '4px' }}>{toastUrl}</span>
        </div>
      )}
    </div>
  );
}

/**
 * SkillsCategoriesClient —— 分类排行页客户端组件
 * 迁移自 skills.js 的 initCategoriesPage
 * 职责：Hero 统计、面包屑、分类区块三列网格、骨架屏 + 无限滚动
 * 每个分类展示 Top 10 技能（按安装量降序），趋势箭头替代统计数字
 */

'use client';

import { useEffect, useRef, useCallback, type CSSProperties } from 'react';
import Link from 'next/link';
import {
  skills as ALL_SKILLS,
  categoryTree as CATEGORY_TREE,
  formatNumber,
  type Skill,
  type CategoryTreeNode,
} from '../_data/skills-data';
import { useChunkedData } from '@/hooks/useChunkedData';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

/* ═══════════════════════════════════════════════════════════════
   常量
   ═══════════════════════════════════════════════════════════════ */

/** 首屏骨架屏替换数量（与原始 HTML 硬编码的 3 个骨架区块一致） */
const SKELETON_BATCH = 3;
/** 无限滚动每批加载数量 */
const INFINITE_BATCH = 2;
/** 初始骨架屏延迟（ms） */
const INITIAL_DELAY = 1200;
/** 无限滚动加载延迟（ms） */
const LOAD_DELAY = 700;

/* ═══════════════════════════════════════════════════════════════
   预计算数据
   ═══════════════════════════════════════════════════════════════ */

/** 单个分类区块：分类树节点 + 该分类下 Top 10 技能 */
interface CatSection {
  cat: CategoryTreeNode;
  topSkills: Skill[];
}

/** 预计算各 Domain 的 Top 10 技能（按安装量降序） */
const CAT_SECTIONS: CatSection[] = CATEGORY_TREE.map((cat) => {
  const top = ALL_SKILLS
    .filter((s) => s.domain === cat.id)
    .sort((a, b) => b.installs - a.installs)
    .slice(0, 10);
  return { cat, topSkills: top };
}).filter((s) => s.topSkills.length > 0);

/** Hero 统计预计算 */
const TOP_COUNT = CATEGORY_TREE.length;
const SUB_COUNT = CATEGORY_TREE.reduce((sum, cat) => sum + (cat.children?.length || 0), 0);
const TOTAL_SKILLS = ALL_SKILLS.length;

/** 最大 Domain：按实际技能数统计 */
const LARGEST_CATEGORY = (() => {
  let largest = { name: '-', count: 0 };
  for (const cat of CATEGORY_TREE) {
    const count = ALL_SKILLS.filter((s) => s.domain === cat.id).length;
    if (count > largest.count) {
      largest = { name: cat.nameEn, count };
    }
  }
  return largest.name;
})();

/* ═══════════════════════════════════════════════════════════════
   辅助函数
   ═══════════════════════════════════════════════════════════════ */

/** 根据趋势排名计算升降箭头 */
function getTrend(trendingRank: number): { cls: string; arrow: string; value: string } {
  if (trendingRank <= 200) return { cls: 'up', arrow: '\u25B2', value: String(trendingRank) };
  if (trendingRank >= 300) return { cls: 'down', arrow: '\u25BC', value: String(500 - trendingRank) };
  return { cls: 'flat', arrow: '\u2014', value: '' };
}

/** 分类颜色 → CSS 变量映射 */
const COLOR_MAP: Record<string, { color: string; border: string; bg: string }> = {
  cyan: { color: 'var(--cyan)', border: 'rgba(57, 210, 192, 0.5)', bg: 'rgba(57, 210, 192, 0.06)' },
  green: { color: 'var(--green)', border: 'rgba(63, 185, 80, 0.5)', bg: 'rgba(63, 185, 80, 0.06)' },
  purple: { color: 'var(--purple)', border: 'rgba(163, 113, 247, 0.5)', bg: 'rgba(163, 113, 247, 0.06)' },
  orange: { color: 'var(--orange)', border: 'rgba(232, 93, 4, 0.5)', bg: 'rgba(232, 93, 4, 0.06)' },
  pink: { color: 'var(--pink, #f778ba)', border: 'rgba(247, 120, 186, 0.5)', bg: 'rgba(247, 120, 186, 0.06)' },
  gold: { color: 'var(--gold)', border: 'rgba(245, 197, 24, 0.5)', bg: 'rgba(245, 197, 24, 0.18)' },
};

/* ═══════════════════════════════════════════════════════════════
   样式常量
   ═══════════════════════════════════════════════════════════════ */

/** 高对比 shimmer 背景（匹配原始 skills.css 骨架屏样式） */
const shimmerBg: CSSProperties = {
  background:
    'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.2s infinite',
  borderRadius: '3px',
};

const heroStyle: CSSProperties = {
  textAlign: 'center',
  padding: '56px 24px 40px',
  maxWidth: '1200px',
  margin: '0 auto',
  position: 'relative',
};

const heroStatsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '16px',
  maxWidth: '860px',
  margin: '0 auto',
};

const breadcrumbStyle: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto 28px',
  padding: '0 24px',
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  color: 'var(--text-muted)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const listStyle: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px 64px',
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '28px',
};

/* ═══════════════════════════════════════════════════════════════
   骨架屏组件
   ═══════════════════════════════════════════════════════════════ */

/** 分类区块骨架屏 —— 头部 + 5 行占位 */
function CategorySectionSkeleton() {
  return (
    <div className="skeleton-card skills-cat-section" style={{ position: 'relative' }}>
      {/* 头部：图标占位 + 标题占位 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '12px',
        }}
      >
        <div style={{ ...shimmerBg, width: '44px', height: '44px', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...shimmerBg, height: '18px', width: '140px' }} />
          <div style={{ ...shimmerBg, height: '12px', width: '90px', marginTop: '6px' }} />
        </div>
      </div>
      {/* 正文：5 行占位 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ ...shimmerBg, height: '32px' }} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   分类区块子组件
   ═══════════════════════════════════════════════════════════════ */

/** 分类排行行 —— 排名 + 名称 + 仓库 + 趋势箭头 */
function CatSkillRow({ skill, rank }: { skill: Skill; rank: number }) {
  const trend = getTrend(skill.trendingRank);

  return (
    <article
      className="skills-cat-row card-fade-in"
      style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr 70px',
        alignItems: 'center',
        gap: '10px',
        padding: '11px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background 0.15s',
      }}
    >
      {/* 排名 */}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '15px',
          fontWeight: 800,
          color: 'var(--gold)',
          textAlign: 'center',
          lineHeight: 1,
        }}
      >
        #{rank}
      </span>

      {/* 技能信息：名称 + 仓库路径 */}
      <div style={{ minWidth: 0 }}>
        <Link
          href={`/skills/detail?id=${encodeURIComponent(skill.id)}`}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--text)',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
          }}
        >
          {skill.name}
        </Link>
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginTop: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {skill.repo}
        </span>
      </div>

      {/* 趋势箭头 */}
      <span
        className={`skills-card-trend ${trend.cls}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          justifySelf: 'end',
          color:
            trend.cls === 'up'
              ? 'var(--green)'
              : trend.cls === 'down'
                ? '#f85149'
                : 'var(--text-muted)',
        }}
      >
        <span style={{ fontSize: '14px', lineHeight: 1 }}>{trend.arrow}</span>
        {trend.value && <span>{trend.value}</span>}
      </span>
    </article>
  );
}

/** 分类区块 —— 头部（图标 + 标题 + View All）+ Top 10 排行列表 */
function CategorySection({ section }: { section: CatSection }) {
  const { cat, topSkills } = section;
  const colors = COLOR_MAP[cat.color] || COLOR_MAP.gold;
  // 图标使用 categoryTree 中预定义的 icon 字段
  const iconText = cat.icon || cat.nameEn.slice(0, 3).toUpperCase();

  return (
    <section className="skills-cat-section" style={{ position: 'relative' }}>
      {/* 头部 */}
      <div
        className="skills-cat-section-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border)',
          marginBottom: '2px',
        }}
      >
        {/* 分类图标 */}
        <div
          className={`skills-cat-section-icon ${cat.color}`}
          style={{
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            border: `1px solid ${colors.border}`,
            color: colors.color,
            background: colors.bg,
            flexShrink: 0,
          }}
        >
          {iconText}
        </div>

        {/* 标题 + 计数 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--text)',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {cat.nameEn}
          </h2>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--gold)',
              letterSpacing: '0.04em',
            }}
          >
            {topSkills.length} of {formatNumber(cat.count)} skills
          </span>
        </div>

        {/* View All 链接 */}
        <Link
          href={`/skills?category=${encodeURIComponent(cat.id)}`}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--gold)',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
          }}
        >
          View All {'\u2192'}
        </Link>
      </div>

      {/* Top 10 排行列表 */}
      <div className="skills-cat-section-body">
        {topSkills.map((skill, i) => (
          <CatSkillRow key={skill.id} skill={skill} rank={i + 1} />
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   主组件
   ═══════════════════════════════════════════════════════════════ */

export default function SkillsCategoriesClient() {
  // 将数据拆分为初始数据（首屏骨架屏替换）和更多数据（无限滚动）
  const initialData = CAT_SECTIONS.slice(0, SKELETON_BATCH);
  const moreData = CAT_SECTIONS.slice(SKELETON_BATCH);

  // 分块数据管理
  const {
    visibleItems,
    skeletonCount,
    loading,
    exhausted,
    initialDone,
    loadMore: chunkedLoadMore,
    replaceNextBatch,
  } = useChunkedData<CatSection>({
    initialData,
    moreData,
    skeletonBatch: SKELETON_BATCH,
    infiniteBatch: INFINITE_BATCH,
    initialDelay: INITIAL_DELAY,
  });

  // 无限滚动 hook
  const { sentinelRef, pause, resume } = useInfiniteScroll<HTMLDivElement>({
    hasMore: !exhausted,
    loading,
    onLoadMore: chunkedLoadMore,
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

  // 初始延迟后替换第一批
  useEffect(() => {
    const timer = setTimeout(tryReplaceBatch, INITIAL_DELAY);
    return () => clearTimeout(timer);
  }, [tryReplaceBatch]);

  // 持续替换：当还有骨架屏时，定时触发下一批
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

  // 骨架屏数组
  const skeletons = Array.from({ length: skeletonCount }, (_, i) => i);

  // Hero 统计数据
  const heroStats = [
    { value: String(TOP_COUNT), label: 'Top Categories' },
    { value: String(SUB_COUNT), label: 'Sub-Categories' },
    { value: formatNumber(TOTAL_SKILLS), label: 'Total Skills' },
    { value: LARGEST_CATEGORY, label: 'Largest Category' },
  ];

  return (
    <main className="main-content">
      {/* ── Hero 区 ── */}
      <section style={heroStyle}>
        {/* 徽章 */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--gold)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          {'\u25C6'} SKILL CATEGORIES {'\u25C6'}
        </div>

        {/* 标题 */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '52px',
            fontWeight: 800,
            color: 'var(--text)',
            lineHeight: 1.05,
            letterSpacing: '0.02em',
            marginBottom: '14px',
          }}
        >
          <span
            style={{
              color: 'var(--gold)',
              textShadow: '0 0 24px rgba(245,197,24,0.18), 0 0 48px rgba(245,197,24,0.12)',
            }}
          >
            CATEGORIES
          </span>
        </h1>

        {/* 副标题 */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
            color: 'var(--text-dim)',
            maxWidth: '620px',
            margin: '0 auto 32px',
          }}
        >
          Top 10 skills per category, ranked by installs. Track trends at a glance.
        </p>

        {/* 统计数字 */}
        <div style={heroStatsStyle}>
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                padding: '18px 16px',
                position: 'relative',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
            >
              {/* 左上角金色装饰角 */}
              <div
                style={{
                  position: 'absolute',
                  top: '-1px',
                  left: '-1px',
                  width: '10px',
                  height: '10px',
                  borderTop: '1px solid rgba(245,197,24,0.5)',
                  borderLeft: '1px solid rgba(245,197,24,0.5)',
                }}
              />
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '28px',
                  fontWeight: 700,
                  color: 'var(--gold)',
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginTop: '4px',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 面包屑 ── */}
      <nav style={breadcrumbStyle}>
        <Link
          href="/skills"
          style={{ color: 'var(--text-dim)', textDecoration: 'none' }}
        >
          Skills Market
        </Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span style={{ color: 'var(--text)' }}>Categories</span>
      </nav>

      {/* ── 分类排行三列网格 ── */}
      <div style={listStyle}>
        {/* 已加载的真实分类区块 */}
        {visibleItems.map((section) => (
          <CategorySection key={section.cat.id} section={section} />
        ))}

        {/* 骨架屏占位 */}
        {skeletons.map((i) => (
          <CategorySectionSkeleton key={`skel-${i}`} />
        ))}

        {/* 无限滚动哨兵 + 加载指示器 */}
        <div
          ref={sentinelRef}
          className="infinite-scroll-sentinel"
          style={{
            gridColumn: '1 / -1',
            padding: '24px 0',
            minHeight: '60px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {loading && (
            <div
              className="scroll-loader"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}
            >
              <div
                className="scroll-loader-spinner"
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid var(--border)',
                  borderTopColor: 'var(--gold)',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              LOADING MORE...
            </div>
          )}
          {exhausted && !loading && (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '1px',
                color: 'var(--text-muted)',
                opacity: 0.4,
              }}
            >
              // END OF FEED
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/**
 * CommunitySidebar —— 社区左栏
 * 特性：丝滑滑动指示器 + 标签热度排名 + 社区统计卡片 + 版权信息
 * 指示器使用绝对定位 + CSS transition 实现平滑上下滑动效果
 */
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { TrendUpIcon, TrendDownIcon, TrendFlatIcon } from '@/components/shared/icons';
import { TAG_RANKINGS, COMMUNITY_STATS, fmtCount, type TagRanking, type CommunityStat } from '../_data/community-data';

/* ── 趋势箭头 ── */
function TrendArrow({ trend }: { trend: TagRanking['trend'] }) {
  const color =
    trend === 'up' ? 'var(--green)' : trend === 'down' ? 'var(--danger)' : 'var(--text-muted)';
  const Icon = trend === 'up' ? TrendUpIcon : trend === 'down' ? TrendDownIcon : TrendFlatIcon;
  return (
    <span style={{ color, display: 'inline-flex', transition: 'color 0.3s ease' }}>
      <Icon size={10} />
    </span>
  );
}

/* ── 单个标签排名项（带 ref，供指示器定位） ── */
function TagRankItem({
  item,
  isActive = false,
  linkRef,
}: {
  item: TagRanking;
  isActive?: boolean;
  linkRef?: (el: HTMLAnchorElement | null) => void;
}) {
  return (
    <Link
      ref={linkRef}
      href={`/community/tag?tag=${encodeURIComponent(item.tag)}`}
      className="tag-rank-item gh-sidebar-nav-item flex items-center gap-2.5 px-3 py-2 no-underline"
      style={{
        color: isActive ? 'var(--gold)' : 'var(--text-dim)',
        borderRadius: '6px',
        position: 'relative',
        zIndex: 1,
        transition: 'color 0.18s',
      }}
      onMouseEnter={(e) => {
        if (isActive) return;
        e.currentTarget.style.color = 'var(--text)';
      }}
      onMouseLeave={(e) => {
        if (isActive) return;
        e.currentTarget.style.color = 'var(--text-dim)';
      }}
    >
      <span
        className="font-mono text-[11px] font-bold w-[18px] text-center flex-shrink-0"
        style={{ color: isActive ? 'var(--gold)' : 'var(--text-muted)', transition: 'color 0.3s ease' }}
      >
        {item.rank}
      </span>
      <span className="tag-rank-name flex-1 min-w-0 font-body text-[13px] font-medium overflow-hidden text-ellipsis whitespace-nowrap">
        #{item.tag}
      </span>
      <span className="tag-rank-trend inline-flex items-center gap-0.5 font-mono text-[10px] font-semibold flex-shrink-0">
        <TrendArrow trend={item.trend} />
        {item.change > 0 && <span>{item.change}</span>}
      </span>
    </Link>
  );
}

/* ── 单个统计卡片 ── */
function StatCard({ stat, onlineCount, delta }: { stat: CommunityStat; onlineCount?: number; delta?: number }) {
  // 变化量展示：增加=绿色向上箭头+数字，减少=红色向下箭头+数字
  const hasDelta = typeof delta === 'number' && delta !== 0;
  const isUp = (delta ?? 0) > 0;

  return (
    <div
      className="community-stat-card relative p-3 transition-all"
      style={{
        background: 'transparent',
        border: '1px solid var(--border-subtle)',
        borderRadius: 8,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(157, 140, 255, 0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <div
          className="font-display text-[20px] font-extrabold tracking-tight"
          style={{ color: 'var(--text)', lineHeight: 1.1 }}
        >
          {/* 全站统一格式化规则 */}
          {stat.dynamic && typeof onlineCount === 'number' ? fmtCount(onlineCount) : fmtCount(stat.value)}
        </div>
        {hasDelta && (
          <span
            className="font-mono text-[10px] font-bold"
            style={{
              color: isUp ? 'var(--green)' : 'var(--danger)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {isUp ? <TrendUpIcon size={10} /> : <TrendDownIcon size={10} />}
            {Math.abs(delta!)}
          </span>
        )}
      </div>
      <div
        className="font-mono text-[9px] font-medium uppercase mt-1"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
      >
        {stat.label}
      </div>
    </div>
  );
}

export default function CommunitySidebar({ activeTag }: { activeTag?: string }) {
  const [onlineCount, setOnlineCount] = useState<number>(1247);
  const [onlineDelta, setOnlineDelta] = useState<number>(0);

  /* ── 指示器位置状态 ── */
  const [indicatorStyle, setIndicatorStyle] = useState<{ top: number; height: number; opacity: number }>({
    top: 0,
    height: 0,
    opacity: 0,
  });
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  /* ── 在线人数模拟波动 ── */
  useEffect(() => {
    let current = 1247;
    const updateOnline = () => {
      let delta = Math.floor(Math.random() * 5) + 1;
      if (Math.random() < 0.5) delta = -delta;
      current = Math.max(800, current + delta);
      setOnlineCount(current);
      setOnlineDelta(delta);
    };
    const interval = setInterval(updateOnline, (Math.floor(Math.random() * 4) + 5) * 1000);
    return () => clearInterval(interval);
  }, []);

  /* ── 当 activeTag 变化时，更新指示器位置 ── */
  useEffect(() => {
    if (!activeTag) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }
    const el = linkRefs.current[activeTag];
    if (el && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicatorStyle({
        top: elRect.top - navRect.top,
        height: elRect.height,
        opacity: 1,
      });
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [activeTag]);

  /* ── 窗口尺寸变化时重新计算指示器位置 ── */
  useEffect(() => {
    const handleResize = () => {
      if (activeTag && linkRefs.current[activeTag] && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const elRect = linkRefs.current[activeTag]!.getBoundingClientRect();
        setIndicatorStyle({
          top: elRect.top - navRect.top,
          height: elRect.height,
          opacity: 1,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTag]);

  return (
    <aside
      className="community-sidebar flex flex-col gap-6"
      style={{
        position: 'sticky',
        top: '88px',
        maxHeight: 'calc(100vh - 104px)',
        overflowY: 'auto',
        paddingRight: '4px',
      }}
    >
      {/* 标签热度排名（带丝滑滑动指示器动画） */}
      <section className="sidebar-section flex flex-col gap-2.5">
        <div
          className="sidebar-section-title font-mono text-[10px] font-semibold uppercase px-1 mb-1"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
        >
          Hot Tags
        </div>
        <div
          ref={navRef}
          className="gh-sidebar-nav"
          style={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}
        >
          {/* 丝滑滑动指示器 —— 绝对定位的背景层 + 金色左边框 */}
          <div
            style={{
              position: 'absolute',
              top: indicatorStyle.top,
              height: indicatorStyle.height,
              left: 0,
              right: 0,
              background: 'rgba(157,140,255,0.12)',
              borderRadius: '6px',
              borderLeft: '2px solid var(--gold)',
              transition:
                'top 0.35s cubic-bezier(0.32, 0.72, 0, 1), height 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease',
              zIndex: 0,
              opacity: indicatorStyle.opacity,
              pointerEvents: 'none',
              boxShadow: 'inset 0 0 0 1px rgba(157,140,255,0.15)',
            }}
          />

          {TAG_RANKINGS.map((item) => (
            <TagRankItem
              key={item.tag}
              item={item}
              isActive={item.tag === activeTag}
              linkRef={(el) => {
                linkRefs.current[item.tag] = el;
              }}
            />
          ))}
        </div>
      </section>

      {/* 社区统计 */}
      <section className="sidebar-section flex flex-col gap-2.5">
        <div
          className="sidebar-section-title font-mono text-[10px] font-semibold uppercase px-1 mb-1"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
        >
          Community Stats
        </div>
        <div className="community-stats-grid grid grid-cols-2 gap-2">
          {COMMUNITY_STATS.map((stat) => (
            <StatCard
              key={stat.label}
              stat={stat}
              onlineCount={stat.dynamic ? onlineCount : undefined}
              delta={stat.dynamic ? onlineDelta : undefined}
            />
          ))}
        </div>
      </section>

      {/* 版权信息 */}
      <section className="sidebar-section flex flex-col gap-2.5">
        <div
          className="sidebar-copyright pt-3 text-center"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <div
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[10px]"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}
          >
            <Link href="/about" className="hover:text-[var(--gold)] transition-colors">About Us</Link>
            <Link href="/about#sponsors" className="hover:text-[var(--gold)] transition-colors">Sponsors</Link>
            <Link href="/about#changelog" className="hover:text-[var(--gold)] transition-colors">Changelog</Link>
            <Link href="/about#terms" className="hover:text-[var(--gold)] transition-colors">Terms</Link>
          </div>
          <div
            className="font-display text-[12px] font-bold mt-2"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}
          >
            © 2026 GHRANK
          </div>
          <div
            className="font-mono text-[9px] mt-1"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
          >
            Open Source Intelligence
          </div>
        </div>
      </section>
    </aside>
  );
}

/**
 * CommunitySidebar —— 社区左栏
 * 包含：标签热度排名（Top 10）+ 社区统计卡片 + 版权信息
 * 迁移自 community.html 的 .community-sidebar 与 community.js 的渲染逻辑
 *
 * 在线人数波动：使用 useEffect + setInterval 模拟实时波动（仅客户端）
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendUpIcon, TrendDownIcon, TrendFlatIcon } from '../../_components/icons';
import { TAG_RANKINGS, COMMUNITY_STATS, type TagRanking, type CommunityStat } from '../_data/community-data';

/* ── 趋势箭头 ── */
function TrendArrow({ trend }: { trend: TagRanking['trend'] }) {
  const color =
    trend === 'up' ? 'var(--green)' : trend === 'down' ? 'var(--danger)' : 'var(--text-muted)';
  const Icon = trend === 'up' ? TrendUpIcon : trend === 'down' ? TrendDownIcon : TrendFlatIcon;
  return (
    <span style={{ color, display: 'inline-flex' }}>
      <Icon size={10} />
    </span>
  );
}

/* ── 单个标签排名项 ── */
function TagRankItem({ item, isActive = false }: { item: TagRanking; isActive?: boolean }) {
  return (
    <Link
      href={`/community/tag?tag=${encodeURIComponent(item.tag)}`}
      className={`tag-rank-item flex items-center gap-2.5 px-3 py-2 no-underline transition-colors ${isActive ? 'is-active' : ''}`}
      style={{
        borderLeft: '2px solid transparent',
        color: isActive ? 'var(--gold)' : 'var(--text-dim)',
        background: isActive ? 'rgba(245, 197, 24, 0.06)' : 'transparent',
        borderLeftColor: isActive ? 'var(--gold)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (isActive) return;
        e.currentTarget.style.background = 'rgba(245, 197, 24, 0.04)';
        e.currentTarget.style.borderLeftColor = 'rgba(245, 197, 24, 0.5)';
        e.currentTarget.style.color = 'var(--text)';
      }}
      onMouseLeave={(e) => {
        if (isActive) return;
        e.currentTarget.style.background = '';
        e.currentTarget.style.borderLeftColor = 'transparent';
        e.currentTarget.style.color = 'var(--text-dim)';
      }}
    >
      <span
        className="font-mono text-[11px] font-bold w-[18px] text-center flex-shrink-0"
        style={{ color: isActive ? 'var(--gold)' : 'var(--text-muted)' }}
      >
        {item.rank}
      </span>
      <span className="tag-rank-name flex-1 min-w-0 font-body text-[13px] font-medium overflow-hidden text-ellipsis whitespace-nowrap">
        {item.tag}
      </span>
      <span className="tag-rank-trend inline-flex items-center gap-0.5 font-mono text-[10px] font-semibold flex-shrink-0">
        <TrendArrow trend={item.trend} />
        {item.change > 0 && <span>{item.change}</span>}
      </span>
    </Link>
  );
}

/* ── 单个统计卡片 ── */
function StatCard({ stat, onlineCount }: { stat: CommunityStat; onlineCount?: string }) {
  return (
    <div
      className="community-stat-card relative p-3 transition-all"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.35)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = '';
      }}
    >
      {/* 左上角金色装饰角 */}
      <span
        className="absolute top-[-1px] left-[-1px] w-2 h-2"
        style={{
          borderTop: '1px solid rgba(245, 197, 24, 0.5)',
          borderLeft: '1px solid rgba(245, 197, 24, 0.5)',
        }}
      />
      <div
        className="font-display text-[18px] font-bold leading-[1.1] tracking-tight"
        style={{ color: 'var(--text)' }}
      >
        {stat.dynamic && onlineCount ? onlineCount : stat.value}
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
  // 在线人数波动状态（仅客户端渲染后才有值，避免 hydration mismatch）
  const [onlineCount, setOnlineCount] = useState('1,247');

  useEffect(() => {
    let current = 1247;
    const updateOnline = () => {
      let delta = Math.floor(Math.random() * 5) + 1;
      if (Math.random() < 0.5) delta = -delta;
      current = Math.max(800, current + delta);
      setOnlineCount(current.toLocaleString());
    };
    // 随机间隔 5-8 秒波动一次
    const interval = setInterval(updateOnline, (Math.floor(Math.random() * 4) + 5) * 1000);
    return () => clearInterval(interval);
  }, []);

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
      {/* 标签热度排名 */}
      <section className="sidebar-section flex flex-col gap-2.5">
        <div
          className="sidebar-section-title font-mono text-[10px] font-semibold uppercase px-1 mb-1"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
        >
          Hot Tags
        </div>
        <div className="tag-rank-list flex flex-col gap-0.5">
          {TAG_RANKINGS.map((item) => (
            <TagRankItem key={item.tag} item={item} isActive={item.tag === activeTag} />
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
            <StatCard key={stat.label} stat={stat} onlineCount={onlineCount} />
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

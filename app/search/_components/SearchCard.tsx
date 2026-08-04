/**
 * SearchCard —— 搜索结果卡片组件
 * 支持三种结果类型：repo（仓库）/ prompt（提示词）/ community（社区帖子）
 * 迁移自 search.js 的 renderRepoCard / renderPromptCard / renderCommunityCard
 * 保留鼠标跟随光晕、金色装饰角、高亮匹配文本等视觉效果
 */
'use client';

import { CSSProperties, MouseEvent, ReactNode } from 'react';
import Link from 'next/link';
import {
  type SearchResult,
  type RepoResult,
  type PromptResult,
  type CommunityResult,
  TAG_STYLES,
  MODEL_TAG_STYLES,
} from '../_data/search-data';

/* ═══ 高亮匹配文本：将查询词包裹在金色高亮 span 中 ═══ */
function highlightText(text: string, query: string): ReactNode[] {
  if (!query) return [text];
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safe})`, 'gi');
  const parts = text.split(regex).filter(Boolean);
  return parts.map((part, i) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return (
        <span
          key={i}
          style={{
            color: 'var(--gold)',
            background: 'rgba(245, 197, 24, 0.12)',
            padding: '0 2px',
            borderRadius: '2px',
            fontWeight: 700,
          }}
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/* ═══ 火花线图表：将数值数组渲染为 SVG 折线 ═══ */
function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 48;
      const y = 16 - ((v - min) / range) * 14;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width="48" height="16" viewBox="0 0 48 16" style={{ display: 'inline-block', verticalAlign: 'middle', opacity: 0.85 }}>
      <polyline fill="none" stroke="var(--green)" strokeWidth="1.5" points={points} />
    </svg>
  );
}

/* ═══ 通用卡片外壳：光晕 + 装饰角 + 内部布局 ═══ */
function CardShell({
  href,
  children,
  onMouseMove,
}: {
  href: string;
  children: ReactNode;
  onMouseMove: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={href}
      className="sr-card group relative block no-underline"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        transition: 'border-color 0.22s, transform 0.22s, box-shadow 0.22s',
      }}
      onMouseMove={onMouseMove}
    >
      {/* 鼠标跟随光晕 —— 由 --mouse-x / --mouse-y 驱动 */}
      <div
        className="sr-card-glow pointer-events-none absolute inset-0"
        style={
          {
            background:
              'radial-gradient(240px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(245, 197, 24, 0.1), transparent 60%)',
            opacity: 0,
            transition: 'opacity 0.3s',
            zIndex: 0,
          } as CSSProperties
        }
      />
      {/* 悬停时显示的金色装饰角 */}
      <div
        className="pointer-events-none absolute top-[-1px] left-[-1px] z-[2] h-3 w-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)' }}
      />
      <div className="relative z-[1] flex h-full flex-col" style={{ padding: '18px 20px', gap: '14px' }}>
        {children}
      </div>
    </Link>
  );
}

/* ═══ 仓库卡片 ═══ */
function RepoCard({ item, query }: { item: RepoResult; query: string }) {
  const tagStyle = TAG_STYLES[item.tagClass] || TAG_STYLES['tag-frontend'];

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <CardShell href={item.url} onMouseMove={handleMouseMove}>
      {/* 顶部：头像 + 信息 */}
      <div className="flex items-start" style={{ gap: '14px' }}>
        <div
          className="flex shrink-0 items-center justify-center"
          style={{
            width: '44px',
            height: '44px',
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--gold)',
            background: 'rgba(245, 197, 24, 0.08)',
            border: '1px solid rgba(245, 197, 24, 0.35)',
          }}
        >
          {item.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <span
            className="inline-block"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              padding: '2px 7px',
              marginBottom: '6px',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              background: 'rgba(245, 197, 24, 0.08)',
              border: '1px solid rgba(245, 197, 24, 0.35)',
            }}
          >
            REPO
          </span>
          <div
            className="font-display font-bold"
            style={{ fontSize: '16px', lineHeight: 1.3, color: 'var(--text)', marginBottom: '4px', wordBreak: 'break-word' }}
          >
            {highlightText(item.name, query)}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              lineHeight: 1.55,
              color: 'var(--text-dim)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.desc}
          </div>
        </div>
      </div>

      {/* 分类标签 */}
      <div className="flex flex-wrap" style={{ gap: '6px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 600,
            padding: '3px 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: tagStyle.color,
            background: tagStyle.bg,
            border: `1px solid ${tagStyle.border}`,
          }}
        >
          {item.tag}
        </span>
      </div>

      {/* 元信息：星标 + Fork + 语言 | 增长 + 火花线 */}
      <div
        className="flex flex-wrap items-center justify-between"
        style={{ gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="flex flex-wrap items-center" style={{ gap: '14px' }}>
          <Stat icon="★" value={item.stars} />
          <Stat icon="⚙" value={item.forks} />
          <span className="flex items-center" style={{ gap: '5px', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#555' }} />
            {item.lang}
          </span>
        </div>
        <div className="flex items-center" style={{ gap: '14px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--green)',
              padding: '2px 7px',
              background: 'rgba(63, 185, 80, 0.08)',
              border: '1px solid rgba(63, 185, 80, 0.25)',
            }}
          >
            {item.growth}
          </span>
          <Sparkline data={item.sparkline} />
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
        Updated {item.time}
      </div>
    </CardShell>
  );
}

/* ═══ 提示词卡片 ═══ */
function PromptCard({ item, query }: { item: PromptResult; query: string }) {
  const modelStyle = MODEL_TAG_STYLES[item.modelClass] || MODEL_TAG_STYLES['tag-custom'];

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <CardShell href={item.url} onMouseMove={handleMouseMove}>
      <div className="flex items-start" style={{ gap: '14px' }}>
        <div
          className="flex shrink-0 items-center justify-center"
          style={{
            width: '44px',
            height: '44px',
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--purple)',
            background: 'rgba(163, 113, 247, 0.08)',
            border: '1px solid rgba(163, 113, 247, 0.35)',
          }}
        >
          {item.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <span
            className="inline-block"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              padding: '2px 7px',
              marginBottom: '6px',
              textTransform: 'uppercase',
              color: 'var(--purple)',
              background: 'rgba(163, 113, 247, 0.08)',
              border: '1px solid rgba(163, 113, 247, 0.35)',
            }}
          >
            PROMPT
          </span>
          <div className="font-display font-bold" style={{ fontSize: '16px', lineHeight: 1.3, color: 'var(--text)', marginBottom: '4px', wordBreak: 'break-word' }}>
            {highlightText(item.name, query)}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              lineHeight: 1.55,
              color: 'var(--text-dim)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.desc}
          </div>
        </div>
      </div>

      {/* 模型标签 */}
      <div className="flex flex-wrap" style={{ gap: '6px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 600,
            padding: '3px 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: modelStyle.color,
            background: modelStyle.bg,
            border: `1px solid ${modelStyle.border}`,
          }}
        >
          {item.model}
        </span>
      </div>

      {/* 元信息：评分 + 使用次数 | 价格 */}
      <div
        className="flex flex-wrap items-center justify-between"
        style={{ gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="flex flex-wrap items-center" style={{ gap: '14px' }}>
          <Stat icon="★" value={item.rating} />
          <Stat icon="▷" value={`${item.uses} uses`} />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--gold)' }}>
          {item.price}
        </span>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
        Updated {item.time}
      </div>
    </CardShell>
  );
}

/* ═══ 社区帖子卡片 ═══ */
function CommunityCard({ item, query }: { item: CommunityResult; query: string }) {
  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <CardShell href={item.url} onMouseMove={handleMouseMove}>
      <div className="flex items-start" style={{ gap: '14px' }}>
        <div
          className="flex shrink-0 items-center justify-center"
          style={{
            width: '44px',
            height: '44px',
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 800,
            color: '#58a6ff',
            background: 'rgba(88, 166, 255, 0.1)',
            border: '1px solid rgba(88, 166, 255, 0.3)',
          }}
        >
          {item.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <span
            className="inline-block"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              padding: '2px 7px',
              marginBottom: '6px',
              textTransform: 'uppercase',
              color: '#58a6ff',
              background: 'rgba(88, 166, 255, 0.08)',
              border: '1px solid rgba(88, 166, 255, 0.3)',
            }}
          >
            COMMUNITY
          </span>
          <div className="font-display font-bold" style={{ fontSize: '16px', lineHeight: 1.3, color: 'var(--text)', marginBottom: '4px', wordBreak: 'break-word' }}>
            {highlightText(item.name, query)}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              lineHeight: 1.55,
              color: 'var(--text-dim)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.desc}
          </div>
        </div>
      </div>

      {/* 元信息：成员数 + 回复数 */}
      <div
        className="flex flex-wrap items-center justify-between"
        style={{ gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="flex flex-wrap items-center" style={{ gap: '14px' }}>
          <span className="flex items-center" style={{ gap: '5px', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--gold)', fontSize: '11px' }}>👥</span> {item.members} members
          </span>
          <span className="flex items-center" style={{ gap: '5px', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--gold)', fontSize: '11px' }}>💬</span> {item.replies} replies
          </span>
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
        Last active {item.time}
      </div>
    </CardShell>
  );
}

/* ═══ 统计项小组件 ═══ */
function Stat({ icon, value }: { icon: string; value: string }) {
  return (
    <span className="flex items-center" style={{ gap: '5px', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)' }}>
      <span style={{ color: 'var(--gold)', fontSize: '11px' }}>{icon}</span>
      {value}
    </span>
  );
}

/* ═══ 对外导出：根据结果类型分发到对应卡片 ═══ */
export default function SearchCard({ item, query }: { item: SearchResult; query: string }) {
  switch (item.type) {
    case 'repo':
      return <RepoCard item={item} query={query} />;
    case 'prompt':
      return <PromptCard item={item} query={query} />;
    case 'community':
      return <CommunityCard item={item} query={query} />;
    default:
      return null;
  }
}

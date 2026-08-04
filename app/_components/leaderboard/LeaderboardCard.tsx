/**
 * LeaderboardCard —— 单张项目卡片
 * 保留 EVE Online HUD 风格：六边形头像、排名背景、金色 glow 追踪
 */
'use client';

import { useRef, type MouseEvent } from 'react';
import Link from 'next/link';
import type { LeaderboardCard as CardData } from '../../_data/leaderboard-data';
import { HEX_CLIP_PATH } from '@/lib/constants';

export default function LeaderboardCard({ item }: { item: CardData }) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 鼠标位置追踪 —— 实现径向 glow 效果
  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }

  return (
    <Link href={`/github/detail?repo=${encodeURIComponent(item.repo)}`} className="block">
      <div
        ref={cardRef}
        className="card group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-surface transition-all duration-250 hover:border-gold hover:-translate-y-0.5"
        style={{ transition: 'border-color 0.25s ease, transform 0.25s ease' }}
        onMouseMove={handleMouseMove}
      >
        {/* 径向 glow —— 鼠标追踪 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(220px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(245, 197, 24, 0.08), transparent 60%)',
          }}
        />

        {/* 排名背景徽章 */}
        <div
          className={`card-rank-bg pointer-events-none absolute top-3 right-4 font-display text-[2.2rem] font-extrabold leading-none tracking-tighter z-0 ${item.rankClass === 'gold' ? 'text-gold/10' : 'text-white/3'}`}
        >
          {item.rank}
        </div>

        <div className="card-inner relative z-10 p-4">
          {/* 顶部：头像 + 信息 */}
          <div className="card-top mb-3 flex gap-3">
            <div
              className="card-avatar flex h-12 w-12 flex-shrink-0 items-center justify-center bg-surface-overlay"
              style={{
                clipPath: HEX_CLIP_PATH,
              }}
            >
              <span className="font-display text-lg font-bold text-gold">{item.avatar}</span>
            </div>
            <div className="card-info min-w-0 flex-1">
              <div className="card-repo mb-1 truncate font-display text-[15px] font-bold text-text">
                {item.repo}
              </div>
              <div
                className="card-desc overflow-hidden font-body text-[13px] text-text-dim leading-snug"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {item.desc}
              </div>
            </div>
          </div>

          {/* 标签行 */}
          <div className="card-tags mb-3 flex flex-wrap gap-1.5">
            <span
              className={`tag rounded-xs border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide ${item.tagClass}`}
              style={{
                background: 'var(--surface-overlay)',
                color: 'var(--text-dim)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              {item.tag}
            </span>
          </div>

          {/* 统计行 */}
          <div className="card-stats mb-3 flex flex-wrap items-center gap-3">
            <span className="card-stat inline-flex items-center gap-1 font-mono text-xs text-text-dim">
              <span className="text-star-gold text-[13px]" style={{ color: 'var(--star-gold)' }}>
                &#9733;
              </span>
              {item.stars}
            </span>
            <span className="card-stat inline-flex items-center gap-1 font-mono text-xs text-text-dim">
              &#x1F4C4; {item.forks}
            </span>
            <span className="card-stat inline-flex items-center gap-1 font-mono text-xs text-text-dim">
              <span
                className="lang-dot inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ background: item.langColor }}
              />
              {item.lang}
            </span>
            <span className="growth-badge rounded-xs bg-green/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-green">
              {item.growth}
            </span>
            {/* 迷你折线图 */}
            <svg
              className="sparkline ml-auto flex-shrink-0"
              width="50"
              height="16"
              viewBox="0 0 50 16"
              fill="none"
            >
              <polyline
                points={item.sparkPts}
                fill="none"
                stroke="var(--gold)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
              />
            </svg>
          </div>

          {/* 底部：更新时间 + 点赞 */}
          <div className="card-top mt-3 flex items-center justify-between border-t border-border-subtle pt-3 font-mono text-[11px] text-text-muted">
            <span className="card-time inline-flex items-center gap-1">
              &#x23F1; {item.time}
            </span>
            <span className="card-likes text-text-dim">&#x1F44D; {item.likes}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

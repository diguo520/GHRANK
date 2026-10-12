'use client';

import { CSSProperties, useEffect, useState } from 'react';
import Link from 'next/link';
import type { PageConfig } from '@/lib/config';

/* ── 徽章样式 —— 金色背景 + 金色文字，用于星数/状态标签 ── */
const badgeStyle: CSSProperties = {
  display: 'inline-block',
  marginLeft: 'var(--sp-2)',
  padding: '1px var(--sp-2)',
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  fontWeight: 600,
  color: 'var(--gold)',
  background: 'var(--gold-subtle)',
  border: '1px solid rgba(157, 140, 255, 0.3)',
  borderRadius: '3px',
  letterSpacing: '0.5px',
};

/**
 * 解析播报条文本，分离主文本与徽章内容
 * 原始格式: "xxx <span>badge</span>"
 */
function parseTickerText(text: string): { main: string; badge: string | null } {
  const match = text.match(/^(.*?)<span>(.*?)<\/span>$/);
  if (!match) return { main: text, badge: null };

  const decode = (s: string) =>
    s
      .replace(/&#9733;/g, '\u2605')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

  return { main: decode(match[1]), badge: decode(match[2]) };
}

/* ═══ SSR 阶段默认配置（空壳，确保 server/client 首帧一致） ═══ */
const SSR_FALLBACK_LABEL = 'LIVE FEED';
const SSR_FALLBACK_ITEMS: { text: string; href: string }[] = [
  { text: 'Welcome to GHRANK Community', href: '/community' },
  { text: 'Welcome to GHRANK Community', href: '/community' },
  { text: 'Welcome to GHRANK Community', href: '/community' },
  { text: 'Welcome to GHRANK Community', href: '/community' },
  { text: 'Welcome to GHRANK Community', href: '/community' },
  { text: 'Welcome to GHRANK Community', href: '/community' },
];

/**
 * Ticker —— 顶部滚动播报条
 * SSR 安全：首次渲染（SSR + client hydration）用固定空壳，
 *          客户端挂载后 useEffect 切换为真实 config 内容。
 */
export default function Ticker({ config }: { config: PageConfig }) {
  /* 水合保护：mounted=false（SSR + 首帧）时使用 SSR_FALLBACK */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const label = mounted ? config.tickerLabel : SSR_FALLBACK_LABEL;
  const items = mounted ? config.tickerItems || [] : SSR_FALLBACK_ITEMS;
  const doubled = [...items, ...items];

  return (
    <div
      className="group flex items-center overflow-hidden relative"
      style={{ height: '36px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
    >
      {/* 左侧金色标签 —— 固定不滚动 */}
      <div
        className="flex items-center h-full px-4 z-[2] flex-shrink-0 uppercase"
        suppressHydrationWarning
        style={{
          background: 'var(--gold)',
          color: 'var(--bg)',
          fontFamily: 'var(--font-display)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '2px',
        }}
      >
        {label}
      </div>

      {/* 滚动轨道 */}
      <div className="flex-1 overflow-hidden h-full relative">
        <div
          className="flex items-center h-full whitespace-nowrap animate-ticker-scroll group-hover:[animation-play-state:paused]"
          suppressHydrationWarning
        >
          {doubled.map((item, i) => {
            const { main, badge } = parseTickerText(item.text);
            return (
              <Link
                key={i}
                href={item.href || '#'}
                className="inline-flex items-center px-6 whitespace-nowrap transition-colors duration-200 hover:text-[var(--text)]"
                style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-body)', fontSize: '13px' }}
              >
                {main}
                {badge && <span style={badgeStyle}>{badge}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

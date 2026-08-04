'use client';

import { CSSProperties } from 'react';
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
  border: '1px solid rgba(245, 197, 24, 0.3)',
  borderRadius: '3px',
  letterSpacing: '0.5px',
};

/**
 * 解析播报条文本，分离主文本与徽章内容
 * 原始格式: "facebook/react <span>230K&#9733;</span>"
 */
function parseTickerText(text: string): { main: string; badge: string | null } {
  const match = text.match(/^(.*?)<span>(.*?)<\/span>$/);
  if (!match) return { main: text, badge: null };

  // 解码常见 HTML 实体，避免使用 dangerouslySetInnerHTML
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

/**
 * Ticker —— 顶部滚动播报条
 * 双倍内容 + CSS 动画 ticker-scroll 实现无缝循环，悬停时暂停
 */
export default function Ticker({ config }: { config: PageConfig }) {
  const items = config.tickerItems || [];
  // 双倍循环实现无缝滚动：translateX(-50%) 恰好滚动一组内容
  const doubled = [...items, ...items];

  return (
    <div
      className="group flex items-center overflow-hidden relative"
      style={{ height: '36px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
    >
      {/* 左侧金色标签 —— 固定不滚动 */}
      <div
        className="flex items-center h-full px-4 z-[2] flex-shrink-0 uppercase"
        style={{
          background: 'var(--gold)',
          color: 'var(--bg)',
          fontFamily: 'var(--font-display)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '2px',
        }}
      >
        {config.tickerLabel}
      </div>

      {/* 滚动轨道 */}
      <div className="flex-1 overflow-hidden h-full relative">
        <div className="flex items-center h-full whitespace-nowrap animate-ticker-scroll group-hover:[animation-play-state:paused]">
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

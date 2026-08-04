'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { NewsCategory, NewsItem as NewsItemType } from '../_data/news-data';
import { FAVICON_PREFIX } from '../_data/news-data';

/**
 * 分类配色：accent bar 的静态色 / 悬停色 / 光晕色
 * 对应原始 news.css 中 data-category 选择器的 ::before 配色
 */
const CATEGORY_COLORS: Record<NewsCategory, { idle: string; hover: string; glow: string }> = {
  release: { idle: 'rgba(63, 185, 80, 0.35)', hover: '#3fb950', glow: 'rgba(63, 185, 80, 0.3)' },
  funding: { idle: 'rgba(245, 197, 24, 0.35)', hover: '#f5c518', glow: 'rgba(245, 197, 24, 0.3)' },
  research: { idle: 'rgba(57, 210, 192, 0.35)', hover: '#39d2c0', glow: 'rgba(57, 210, 192, 0.3)' },
  product: { idle: 'rgba(163, 113, 247, 0.35)', hover: '#a371f7', glow: 'rgba(163, 113, 247, 0.3)' },
  regulation: { idle: 'rgba(232, 93, 4, 0.35)', hover: '#e85d04', glow: 'rgba(232, 93, 4, 0.3)' },
};

interface NewsItemProps {
  item: NewsItemType;
  /** 是否为实时插入条目，触发青色背景高亮动画 */
  flash?: boolean;
}

/**
 * 单条新闻 —— 横向排版：accent bar | 时间 | 来源 | 标题 | 箭头
 * 悬停时 accent bar 加宽、换色并产生光晕，迁移自原始 .tl-item 的伪类交互
 */
export default function NewsItem({ item, flash = false }: NewsItemProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const colors = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.release;
  const faviconUrl = `${FAVICON_PREFIX}${item.domain}`;
  const fallback = item.domain.charAt(0).toUpperCase();

  // accent bar：悬停时加宽、换色、加光晕
  const accentBar = hovered
    ? { width: '3px', background: colors.hover, boxShadow: `0 0 8px ${colors.glow}` }
    : { width: '2px', background: colors.idle, boxShadow: 'none' };

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="tl-item relative flex items-center"
      style={{
        padding: '9px 0 9px 14px',
        textDecoration: 'none',
        background: hovered ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
        transition: 'background 0.2s ease',
        ...(flash ? { animation: 'newsFlashBg 3s ease-out' } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 左侧 accent bar（替代原始 ::before 伪元素） */}
      <span
        className="tl-accent absolute left-0 rounded-[1px]"
        style={{
          top: '6px',
          bottom: '6px',
          ...accentBar,
          transition: 'width 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
        }}
      />

      {/* 时间 */}
      <span
        className="tl-time font-mono whitespace-nowrap shrink-0"
        style={{
          fontSize: '11px',
          letterSpacing: '0.04em',
          width: '42px',
          paddingRight: '12px',
          color: hovered ? 'var(--text-dim)' : 'var(--text-muted)',
          transition: 'color 0.2s',
        }}
      >
        {item.time}
      </span>

      {/* 来源：favicon + 标签 */}
      <span
        className="tl-source flex items-center shrink-0"
        style={{ gap: '6px', paddingRight: '14px', borderRight: '1px solid var(--border-subtle)', marginRight: '14px' }}
      >
        {!imgError ? (
          <Image
            src={faviconUrl}
            alt=""
            width={12}
            height={12}
            onError={() => setImgError(true)}
            className="rounded-[2px] shrink-0"
            style={{ opacity: hovered ? 1 : 0.7, transition: 'opacity 0.2s' }}
          />
        ) : (
          <span
            className="tl-source-fallback flex items-center justify-center shrink-0 font-mono"
            style={{
              width: '12px',
              height: '12px',
              fontSize: '8px',
              fontWeight: 700,
              color: 'var(--gold)',
              background: 'rgba(245, 197, 24, 0.1)',
              border: '1px solid rgba(245, 197, 24, 0.35)',
              borderRadius: '2px',
            }}
          >
            {fallback}
          </span>
        )}
        <span
          className="tl-source-label font-mono uppercase"
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: hovered ? 'var(--gold)' : 'var(--text-muted)',
            transition: 'color 0.2s',
          }}
        >
          {item.sourceLabel}
        </span>
      </span>

      {/* 标题（单行省略） */}
      <span
        className="tl-title flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-body"
        style={{
          fontSize: '13px',
          fontWeight: 500,
          lineHeight: 1.45,
          color: 'var(--text)',
          transition: 'color 0.2s',
        }}
      >
        {item.title}
      </span>

      {/* 箭头：悬停时滑入显示 */}
      <span
        className="tl-arrow shrink-0"
        style={{
          paddingLeft: '10px',
          fontSize: '12px',
          color: hovered ? 'var(--gold)' : 'var(--text-muted)',
          opacity: hovered ? 0.8 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(-4px)',
          transition: 'opacity 0.2s, transform 0.2s, color 0.2s',
        }}
      >
        ➤
      </span>
    </a>
  );
}

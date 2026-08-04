/**
 * PreviewCarousel —— 图片轮播 + 标签 + 实时统计
 * 迁移自 prompt-detail.html 的 .detail-preview 区域 + prompt-detail-init.js 轮播/统计逻辑
 * 轮播交互：前进/后退/点击指示点/键盘左右键（hover 时）
 * 统计动画：数字增减动画 + 浮动 +N 指示器 + live-dot 脉冲
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { PROMPT_DETAIL, formatNum } from '../_data/prompt-detail-data';
import { usePromptDetail } from './PromptDetailProvider';
import { EyeIcon, UserIcon, MessageIcon, CoffeeIcon } from '../../_components/icons';
import type { LiveStats } from '../_data/prompt-detail-data';

/** 统计项配置 */
const STAT_ITEMS: { key: keyof LiveStats; label: string; Icon: typeof EyeIcon; color: string }[] = [
  { key: 'views', label: 'Views', Icon: EyeIcon, color: 'var(--gold)' },
  { key: 'commenters', label: 'Commenters', Icon: UserIcon, color: 'var(--cyan)' },
  { key: 'comments', label: 'Comments', Icon: MessageIcon, color: 'var(--green)' },
  { key: 'tips', label: 'Tips', Icon: CoffeeIcon, color: '#C68E3E' },
];

export default function PreviewCarousel() {
  const images = PROMPT_DETAIL.previewImages;
  const tags = PROMPT_DETAIL.tags;
  const { stats, floatIndicators } = usePromptDetail();

  // ── 轮播状态 ──
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const total = images.length;

  /** 轮播跳转（循环） */
  const goTo = (index: number) => {
    setCurrent(((index % total) + total) % total);
  };

  // 键盘左右键导航（仅 hover 时生效）
  useEffect(() => {
    if (!isHovering) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isHovering, current, total]);

  return (
    <div className="flex min-w-0 flex-col">
      {/* ── 轮播区 ── */}
      <div
        ref={carouselRef}
        className="relative overflow-hidden rounded-md"
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* 左上角标签 */}
        <span
          className="pointer-events-none absolute z-[2] backdrop-blur-xs"
          style={{
            top: '12px', left: '12px',
            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600,
            color: 'var(--text-dim)',
            background: 'rgba(10,10,10,0.6)',
            border: '1px solid var(--border)',
            padding: '3px 10px',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}
        >
          Preview Area
        </span>

        {/* 轨道 */}
        <div
          className="flex will-change-transform"
          style={{
            transform: `translateX(-${current * 100}%)`,
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {images.map((src, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%]">
              <img
                src={src}
                alt=""
                className="block w-full"
                style={{ aspectRatio: '16 / 10', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>

        {/* 前进/后退按钮 */}
        {total > 1 && (
          <>
            <button
              onClick={() => goTo(current - 1)}
              className="absolute left-3 top-1/2 z-[3] flex h-9 w-9 -translate-y-1/2 items-center justify-center backdrop-blur-xs transition-colors"
              style={{
                background: 'rgba(10,10,10,0.6)',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)', fontSize: '16px', cursor: 'pointer',
              }}
              aria-label="Previous"
            >
              {'\u276E'}
            </button>
            <button
              onClick={() => goTo(current + 1)}
              className="absolute right-3 top-1/2 z-[3] flex h-9 w-9 -translate-y-1/2 items-center justify-center backdrop-blur-xs transition-colors"
              style={{
                background: 'rgba(10,10,10,0.6)',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)', fontSize: '16px', cursor: 'pointer',
              }}
              aria-label="Next"
            >
              {'\u276F'}
            </button>
          </>
        )}

        {/* 指示点 */}
        {total > 1 && (
          <div
            className="absolute bottom-3 left-1/2 z-[3] flex -translate-x-1/2 gap-1.5"
          >
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="h-2 w-2 rounded-full transition-all duration-200"
                style={{
                  background: i === current ? 'var(--gold)' : 'var(--text-muted)',
                  boxShadow: i === current ? '0 0 8px rgba(245,197,24,0.25)' : 'none',
                  cursor: 'pointer',
                  transform: i === current ? 'scale(1)' : 'scale(1)',
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 标签 + 统计 ── */}
      <div
        className="mt-5 flex flex-col gap-4"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: '16px 20px',
        }}
      >
        {/* 标签 */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="transition-colors duration-200"
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600,
                color: 'var(--text-dim)',
                background: 'rgba(245,197,24,0.06)',
                border: '1px solid rgba(245,197,24,0.35)',
                padding: '3px 10px',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 统计行 */}
        <div
          className="grid grid-cols-4"
          style={{
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(90deg, rgba(245,197,24,0.03), transparent 60%)',
          }}
        >
          {STAT_ITEMS.map(({ key, label, Icon, color }, idx) => (
            <div
              key={key}
              className="group relative flex items-center justify-center gap-3 px-2 py-3 transition-colors"
              style={{
                borderRight: idx < 3 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              {/* 悬停顶部金线 */}
              <div
                className="pointer-events-none absolute left-0 right-0 top-0 h-px opacity-0 transition-opacity group-hover:opacity-100"
                style={{ background: 'var(--gold)' }}
              />
              <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center" style={{ color }}>
                <Icon className="h-full w-full" />
              </span>
              <div className="flex min-w-0 flex-col gap-px">
                <div className="relative inline-block" style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>
                  {/* live-dot 脉冲指示器 */}
                  <span
                    className="absolute -right-2 top-1/2 -translate-y-1/2"
                    style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green)', animation: 'livePulse 2s infinite' }}
                    aria-hidden="true"
                  />
                  {formatNum(stats[key])}
                  {/* 浮动 +N 指示器 */}
                  {floatIndicators
                    .filter((f) => f.statKey === key)
                    .map((f) => (
                      <span
                        key={f.id}
                        className="pointer-events-none absolute left-0 top-0"
                        style={{
                          fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
                          color: 'var(--green)', animation: 'floatUp 0.95s ease-out forwards',
                        }}
                      >
                        {f.text}
                      </span>
                    ))}
                </div>
                <div
                  className="font-mono uppercase"
                  style={{ fontSize: '9px', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.1em' }}
                >
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

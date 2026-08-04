/**
 * PromptCard —— Prompt 市场特色卡片（图片为主）
 * 保留 EVE Online HUD 风格：图片填充 + 悬浮渐变遮罩 + 金色标签
 * 交互：书签收藏、鼠标光晕追踪、点击跳转详情页
 */
'use client';

import { useState, useRef, type MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookmarkIcon } from '../../_components/icons';
import type { PromptCardData } from '../_data/prompt-data';
import { MODEL_LABEL_MAP } from '../_data/prompt-data';

/* ── 模型标签样式（图片卡片上统一使用深色底 + 金色字/边框） ── */
const tagStyle = {
  color: 'var(--gold)',
  background: 'rgba(8, 8, 10, 0.78)',
  border: '1px solid rgba(245, 197, 24, 0.35)',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
} as const;

export default function PromptCard({ item }: { item: PromptCardData }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 鼠标位置追踪 —— 实现径向 glow 效果
  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }

  // 解析模型标签列表（一张卡片可包含多个模型分类）
  const models = item.model.split(' ').filter(Boolean);

  return (
    <Link href="/prompt-detail" className="block h-full" style={{ textDecoration: 'none' }}>
      <div
        ref={cardRef}
        className="group relative h-full cursor-pointer overflow-hidden rounded-xl border border-border bg-surface hover:border-gold hover:-translate-y-[3px] hover:shadow-[0_8px_28px_rgba(0,0,0,0.4),0_0_0_1px_rgba(245,197,24,0.35)]"
        style={{
          minHeight: 0,
          transition: 'border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
        }}
        data-height={item.height}
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

        {/* 卡片图片 */}
        <div className="relative h-full w-full overflow-hidden" style={{ background: 'var(--surface)' }}>
          <Image
            src={item.img}
            alt=""
            fill
            className="object-cover group-hover:scale-[1.06]"
            style={{
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onLoad={() => setImgLoaded(true)}
          />

          {/* 书签按钮 —— 默认隐藏，hover 卡片或已收藏时显示 */}
          <button
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border border-border text-text-dim opacity-0 backdrop-blur-md transition-all duration-200 group-hover:opacity-100"
            style={{
              background: bookmarked ? 'rgba(245, 197, 24, 0.15)' : 'rgba(10, 10, 10, 0.6)',
              borderColor: bookmarked ? 'rgba(245, 197, 24, 0.35)' : 'var(--border)',
              color: bookmarked ? 'var(--gold)' : 'var(--text-dim)',
              opacity: bookmarked ? 1 : undefined,
              zIndex: 3,
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setBookmarked((prev) => !prev);
            }}
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <BookmarkIcon size={14} filled={bookmarked} />
          </button>

          {/* 悬浮遮罩 —— 顶部标签 + 底部作者信息 */}
          <div
            className="absolute inset-0 flex flex-col justify-between p-3.5 transition-all duration-300"
            style={{ zIndex: 2 }}
          >
            {/* 渐变背景 —— hover 时显示 */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  'linear-gradient(180deg, rgba(10,10,10,0.6) 0%, transparent 25%, transparent 45%, rgba(10,10,10,0.92) 100%)',
              }}
            />

            {/* 顶部：模型标签（hover 时显示） */}
            <div className="relative flex flex-wrap gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {models.map((m) => (
                <span
                  key={m}
                  className="px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider backdrop-blur-xs"
                  style={tagStyle}
                >
                  {MODEL_LABEL_MAP[m] || 'Image'}
                </span>
              ))}
            </div>

            {/* 底部：作者头像 + 用户名（hover 时显示） */}
            <div className="relative flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div
                className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-full"
                style={{ border: '1px solid rgba(245, 197, 24, 0.35)' }}
              >
                <Image
                  src={item.img}
                  alt=""
                  width={24}
                  height={24}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-mono text-[11px] font-semibold tracking-wide" style={{ color: 'var(--text)' }}>
                {item.author}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

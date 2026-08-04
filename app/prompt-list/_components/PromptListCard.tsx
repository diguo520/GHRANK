/**
 * PromptListCard —— 列表页 Prompt 卡片（缩略图 + 正文结构）
 * 迁移自 prompt-list.html 的 .prompt-card（列表页变体，区别于主页特色卡片）
 *
 * 结构：180px 缩略图（图片 + 渐变叠层 + Preview 标签）+ 正文（模型标签/标题/描述/星级价格/加购按钮）
 * 交互：点击卡片跳转详情页、Add to Cart 按钮独立交互（阻止冒泡）
 * 采用 Tailwind group-hover 处理悬浮态，数据驱动的配色用 inline style
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  type PromptListItem,
  MODEL_TAG_STYLES,
  GRADIENT_STYLES,
} from '../_data/prompt-list-data';

interface PromptListCardProps {
  item: PromptListItem;
}

export default function PromptListCard({ item }: PromptListCardProps) {
  const [added, setAdded] = useState(false);
  const tagStyle = MODEL_TAG_STYLES[item.model];

  /** 加购按钮：阻止冒泡到卡片跳转，切换已加入状态 */
  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setAdded((prev) => !prev);
  }

  // 星级渲染：实心 ★ + 空心 ☆
  const stars = '★'.repeat(item.stars) + '☆'.repeat(5 - item.stars);

  return (
    <Link
      href="/prompt-detail"
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-[3px]"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {/* 缩略图区 */}
      <div className="relative h-[180px] w-full overflow-hidden" style={{ background: 'var(--bg)' }}>
        <Image
          src={item.img}
          alt=""
          fill
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
        {/* 渐变叠层：默认 opacity-50，悬浮降至 opacity-30 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen transition-opacity duration-300 group-hover:opacity-30"
          style={{ background: GRADIENT_STYLES[item.grad] || GRADIENT_STYLES[1] }}
        />
        {/* Preview 标签 */}
        <span
          className="pointer-events-none absolute left-2.5 top-2.5 backdrop-blur-xs"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            fontWeight: 600,
            color: 'var(--text)',
            background: 'rgba(10, 10, 10, 0.6)',
            border: '1px solid var(--border)',
            padding: '3px 8px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Preview
        </span>
      </div>

      {/* 正文区 */}
      <div className="flex flex-1 flex-col gap-2" style={{ padding: '16px 18px 18px' }}>
        {/* 模型标签（配色随模型变化） */}
        <span
          className="self-start"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            fontWeight: 700,
            padding: '3px 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: tagStyle.color,
            background: tagStyle.bg,
            border: `1px solid ${tagStyle.border}`,
          }}
        >
          {item.modelLabel}
        </span>

        {/* 标题：悬浮变金色 */}
        <div
          className="font-display font-bold transition-colors duration-200 group-hover:text-[color:var(--gold)]"
          style={{ fontSize: '15px', color: 'var(--text)', lineHeight: 1.3, letterSpacing: '0.01em' }}
        >
          {item.title}
        </div>

        {/* 描述 */}
        <div
          className="flex-1 font-body"
          style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.5 }}
        >
          {item.snippet}
        </div>

        {/* 元信息：星级 + 价格 */}
        <div
          className="mt-1 flex items-center justify-between pt-2.5"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <span
            style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--gold)', letterSpacing: '0.04em' }}
          >
            {stars}
          </span>
          <span
            className="font-display font-extrabold"
            style={{ fontSize: '16px', color: 'var(--gold)', letterSpacing: '0.01em' }}
          >
            {item.price}
          </span>
        </div>

        {/* 加购按钮：已加入态切换文案与配色 */}
        <button
          onClick={handleAddToCart}
          className="mt-2 self-stretch font-mono font-bold uppercase transition-[background,box-shadow] duration-200"
          style={{
            fontSize: '10px',
            color: added ? 'var(--gold)' : 'var(--bg)',
            background: added ? 'transparent' : 'var(--gold)',
            border: added ? '1px solid rgba(245,197,24,0.35)' : 'none',
            padding: '8px 14px',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            boxShadow: added ? 'none' : '0 0 12px rgba(245,197,24,0.2)',
          }}
          onMouseEnter={(e) => {
            if (!added) {
              e.currentTarget.style.background = '#ffe066';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(245,197,24,0.25)';
            }
          }}
          onMouseLeave={(e) => {
            if (!added) {
              e.currentTarget.style.background = 'var(--gold)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(245,197,24,0.2)';
            }
          }}
        >
          {added ? 'Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}

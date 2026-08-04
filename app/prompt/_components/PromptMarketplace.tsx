/**
 * PromptMarketplace —— 市场交互区（分类筛选 + 区块标题 + 卡片网格）
 * 管理分类筛选状态，作为 CategoryFilter 与 PromptGrid 的共享状态容器
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PROMPT_CATEGORIES } from '../_data/prompt-data';
import CategoryFilter from './CategoryFilter';
import PromptGrid from './PromptGrid';

export default function PromptMarketplace() {
  // 分类筛选状态（'all' = 全部）
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <>
      {/* 分类筛选区 */}
      <CategoryFilter
        categories={PROMPT_CATEGORIES}
        active={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* 区块标题 */}
      <div
        className="mb-5 flex items-center justify-between"
        style={{ maxWidth: '1440px', margin: '0 auto 20px', padding: '0 32px' }}
      >
        <h2
          className="font-display text-2xl font-bold"
          style={{ color: 'var(--text)', letterSpacing: '0.02em' }}
        >
          Featured Prompts
        </h2>
        <Link
          href="/prompt-list"
          className="font-mono text-[11px] font-semibold uppercase transition-colors duration-150 hover:text-gold-hover"
          style={{ color: 'var(--gold)', letterSpacing: '0.08em' }}
        >
          View All {'\u2192'}
        </Link>
      </div>

      {/* 卡片网格（骨架屏 + IO + 分块加载） */}
      <PromptGrid activeCategory={activeCategory} />
    </>
  );
}

/**
 * SearchPagination —— 搜索结果分页组件
 * 展示页码按钮，点击切换激活页并滚动到页面顶部
 * 迁移自 search.html 的静态分页结构 + search.js 的交互逻辑
 */
'use client';

import { useState } from 'react';

export default function SearchPagination() {
  const [activePage, setActivePage] = useState(1);

  // 分页按钮配置：上一页 + 页码 + 省略号 + 末页 + 下一页
  const pageButtons = [
    { type: 'prev', label: '←' },
    { type: 'page', label: '1', page: 1 },
    { type: 'page', label: '2', page: 2 },
    { type: 'page', label: '3', page: 3 },
    { type: 'ellipsis', label: '...' },
    { type: 'page', label: '12', page: 12 },
    { type: 'next', label: '→' },
  ] as const;

  const handleClick = (page: number) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="mx-auto flex flex-wrap items-center justify-center"
      style={{ maxWidth: '1280px', margin: '0 auto 48px', padding: '24px 32px', gap: '6px' }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          marginRight: '12px',
        }}
      >
        // PAGE
      </span>
      {pageButtons.map((btn, i) => {
        if (btn.type === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${i}`}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', padding: '0 4px' }}
            >
              {btn.label}
            </span>
          );
        }

        const isPrev = btn.type === 'prev';
        const isNext = btn.type === 'next';
        const page = isPrev ? activePage - 1 : isNext ? activePage + 1 : (btn as { page: number }).page;
        const isActive = !isPrev && !isNext && page === activePage;
        const isDisabled = (isPrev || isNext) && (page < 1 || page > 12);

        return (
          <button
            key={`btn-${i}`}
            disabled={isDisabled}
            className="font-display font-bold"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: isActive ? 'var(--bg)' : 'var(--text-dim)',
              background: isActive ? 'var(--gold)' : 'var(--surface)',
              border: '1px solid var(--border)',
              borderColor: isActive ? 'var(--gold)' : 'var(--border)',
              padding: '8px 14px',
              minWidth: '38px',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.4 : 1,
              transition: 'color 0.18s, border-color 0.18s, background 0.18s, transform 0.12s',
            }}
            onClick={() => !isDisabled && handleClick(page)}
            onMouseEnter={(e) => {
              if (!isActive && !isDisabled) {
                e.currentTarget.style.color = 'var(--text)';
                e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.5)';
                e.currentTarget.style.background = 'rgba(245, 197, 24, 0.04)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive && !isDisabled) {
                e.currentTarget.style.color = 'var(--text-dim)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--surface)';
              }
            }}
            onMouseDown={(e) => {
              if (!isDisabled) e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {btn.label}
          </button>
        );
      })}
    </div>
  );
}

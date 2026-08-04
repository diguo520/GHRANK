/**
 * CategoryFilter —— 分类筛选 chips（模型过滤）
 * 保留 EVE Online HUD 风格：横向滚动 + 拖拽滚动 + 激活态金色高亮
 * 交互：点击切换分类、再次点击已选中的非 All 分类恢复全部
 */
'use client';

import { useRef, useCallback, type MouseEvent, type WheelEvent } from 'react';
import type { PromptCategory } from '../_data/prompt-data';

interface CategoryFilterProps {
  /** 分类列表 */
  categories: PromptCategory[];
  /** 当前激活的分类标识 */
  active: string;
  /** 选择分类回调 */
  onSelect: (model: string) => void;
}

export default function CategoryFilter({ categories, active, onSelect }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // 拖拽滚动状态（使用 ref 避免重渲染）
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

  // 鼠标按下：开始拖拽
  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current.isDown = true;
    dragState.current.startX = e.pageX - el.offsetLeft;
    dragState.current.scrollLeft = el.scrollLeft;
  }, []);

  // 鼠标移动：拖拽滚动
  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!dragState.current.isDown) return;
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragState.current.startX) * 2;
    el.scrollLeft = dragState.current.scrollLeft - walk;
  }, []);

  // 结束拖拽
  const handleDragEnd = useCallback(() => {
    dragState.current.isDown = false;
  }, []);

  // 垂直滚轮转水平滚动
  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
    }
  }, []);

  // 点击 chip：切换分类（再次点击已选中的非 All 分类恢复 All）
  const handleChipClick = useCallback(
    (model: string) => {
      if (model === active && model !== 'all') {
        onSelect('all');
      } else {
        onSelect(model);
      }
    },
    [active, onSelect],
  );

  return (
    <section style={{ maxWidth: '1440px', margin: '0 auto 32px', padding: '0 32px' }}>
      {/* 区域标签 */}
      <div
        className="mb-3.5 font-mono text-[10px] font-semibold uppercase"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
      >
        // FILTER BY MODEL
      </div>

      {/* 横向滚动 chip 容器 */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto pb-1.5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleDragEnd}
        onMouseUp={handleDragEnd}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
      >
        {categories.map((cat) => {
          const isActive = active === cat.model;
          return (
            <button
              key={cat.model}
              className="flex-shrink-0 whitespace-nowrap border px-4 py-2 font-mono text-xs font-semibold transition-all duration-200"
              style={{
                color: isActive ? 'var(--bg)' : 'var(--text-dim)',
                background: isActive ? 'var(--gold)' : 'var(--surface)',
                borderColor: isActive ? 'var(--gold)' : 'var(--border)',
                boxShadow: isActive ? '0 0 16px rgba(245, 197, 24, 0.25)' : 'none',
                letterSpacing: '0.04em',
              }}
              onClick={() => handleChipClick(cat.model)}
            >
              {cat.label}
              <span
                className="ml-1 font-medium"
                style={{
                  color: isActive ? 'var(--bg)' : 'var(--text-muted)',
                  opacity: isActive ? 0.7 : 1,
                }}
              >
                ({cat.count.toLocaleString('en-US')})
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

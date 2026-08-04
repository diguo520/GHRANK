/**
 * FilterSidebar —— Prompt 列表页左侧筛选侧边栏
 * 迁移自 prompt-list.html 的 .filter-sidebar
 *
 * 包含 4 个筛选面板：AI 模型 / 价格范围 / 最低评分 / 分类
 * 桌面端 sticky 定位 + 独立滚动；移动端（<=1024px）变为静态块
 *
 * 状态由父组件 PromptListClient 统一管理，本组件为纯受控组件
 */
'use client';

import {
  AI_MODEL_FILTERS,
  CATEGORY_FILTERS,
  RATING_OPTIONS,
  type CheckboxFilter,
  type SortOption,
} from '../_data/prompt-list-data';

interface FilterSidebarProps {
  /** 已选中的 AI 模型集合 */
  selectedModels: Set<string>;
  /** 切换 AI 模型选中态 */
  onToggleModel: (value: string) => void;
  /** 已选中的分类集合 */
  selectedCategories: Set<string>;
  /** 切换分类选中态 */
  onToggleCategory: (value: string) => void;
  /** 价格下限 */
  priceMin: string;
  setPriceMin: (v: string) => void;
  /** 价格上限 */
  priceMax: string;
  setPriceMax: (v: string) => void;
  /** 最低评分值 */
  rating: string;
  setRating: (v: string) => void;
}

export default function FilterSidebar({
  selectedModels,
  onToggleModel,
  selectedCategories,
  onToggleCategory,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  rating,
  setRating,
}: FilterSidebarProps) {
  return (
    <aside
      className="filter-sidebar flex flex-col gap-5"
      style={{
        position: 'sticky',
        top: '88px',
        maxHeight: 'calc(100vh - 104px)',
        overflowY: 'auto',
        paddingRight: '4px',
      }}
    >
      {/* AI 模型筛选面板 */}
      <FilterPanel title="AI Model">
        {AI_MODEL_FILTERS.map((item) => (
          <FilterOption
            key={item.value}
            item={item}
            selected={selectedModels.has(item.value)}
            onToggle={() => onToggleModel(item.value)}
          />
        ))}
      </FilterPanel>

      {/* 价格范围面板 */}
      <FilterPanel title="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-1/2 font-mono"
            style={{
              fontSize: '12px',
              color: 'var(--text)',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              padding: '8px 10px',
              outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,197,24,0.5)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>&#8212;</span>
          <input
            type="text"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-1/2 font-mono"
            style={{
              fontSize: '12px',
              color: 'var(--text)',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              padding: '8px 10px',
              outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,197,24,0.5)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
        </div>
      </FilterPanel>

      {/* 最低评分面板 */}
      <FilterPanel title="Minimum Rating">
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-full cursor-pointer"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--text)',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            padding: '9px 32px 9px 12px',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            backgroundImage:
              "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236e7681' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(245,197,24,0.5)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          {RATING_OPTIONS.map((opt: SortOption) => (
            <option key={opt.value} value={opt.value} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
              {opt.label}
            </option>
          ))}
        </select>
      </FilterPanel>

      {/* 分类筛选面板 */}
      <FilterPanel title="Category">
        {CATEGORY_FILTERS.map((item) => (
          <FilterOption
            key={item.value}
            item={item}
            selected={selectedCategories.has(item.value)}
            onToggle={() => onToggleCategory(item.value)}
          />
        ))}
      </FilterPanel>
    </aside>
  );
}

/* ═══ 子组件：筛选面板容器 ═══ */

function FilterPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        padding: '16px 18px',
      }}
    >
      <div
        className="mb-3 pb-2.5 font-display font-bold uppercase"
        style={{
          fontSize: '12px',
          color: 'var(--text)',
          letterSpacing: '0.08em',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

/* ═══ 子组件：复选框筛选项 ═══ */

function FilterOption({
  item,
  selected,
  onToggle,
}: {
  item: CheckboxFilter;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex cursor-pointer items-center gap-2.5 py-1.5 transition-colors"
      onClick={onToggle}
    >
      {/* 自定义复选框：选中态显示金色对勾 */}
      <div
        className="relative flex-shrink-0"
        style={{
          width: '14px',
          height: '14px',
          border: `1px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
          background: selected ? 'var(--gold)' : 'var(--bg)',
          transition: 'border-color 0.18s, background 0.18s',
        }}
      >
        {selected && (
          <span
            className="absolute"
            style={{
              left: '3px',
              top: '0',
              width: '4px',
              height: '8px',
              border: 'solid var(--bg)',
              borderWidth: '0 2px 2px 0',
              transform: 'rotate(45deg)',
            }}
          />
        )}
      </div>
      {/* 标签文字 */}
      <span
        className="flex-1 font-body transition-colors"
        style={{
          fontSize: '13px',
          color: selected ? 'var(--text)' : 'var(--text-dim)',
          fontWeight: selected ? 600 : 400,
        }}
      >
        {item.label}
      </span>
      {/* 数量 */}
      <span
        className="font-mono"
        style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}
      >
        {item.count.toLocaleString('en-US')}
      </span>
    </div>
  );
}

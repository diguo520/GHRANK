/**
 * PromptListClient —— Prompt 列表页主交互组件
 * 迁移自 prompt-list.html 的 .listing-layout + .pagination
 *
 * 布局：左侧筛选侧边栏（260px）+ 右侧主网格（1fr）
 * 响应式：<=1024px 侧边栏变为静态块堆叠在上方
 *
 * 状态管理委托给 usePromptListFilters hook，本组件负责渲染
 */
'use client';

import { usePromptListFilters } from './usePromptListFilters';
import { SORT_OPTIONS } from '../_data/prompt-list-data';
import FilterSidebar from './FilterSidebar';
import PromptListCard from './PromptListCard';
import Pagination from './Pagination';

export default function PromptListClient() {
  const filters = usePromptListFilters();

  return (
    <>
      {/* 列表布局：筛选侧边栏 + 主网格（响应式：<=1024px 单列堆叠） */}
      <div
        className="listing-layout grid items-start gap-5 pb-12 pt-6 lg:gap-7"
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '24px 32px 48px',
          gridTemplateColumns: 'minmax(0, 1fr)',
        }}
      >
      <style>{`
        @media (min-width: 1024px) {
          .listing-layout { grid-template-columns: 260px minmax(0, 1fr) !important; }
        }
        @media (max-width: 1024px) {
          .listing-layout { padding: 20px 20px 40px; }
          .filter-sidebar { position: static !important; max-height: none !important; overflow-y: visible !important; }
        }
        @media (max-width: 768px) {
          .listing-layout { padding: 16px 14px 32px; gap: 20px; }
          .pagination { padding: 16px 14px 32px !important; gap: 4px !important; }
        }
      `}</style>
        {/* 左栏：筛选侧边栏 */}
        <FilterSidebar
          selectedModels={filters.selectedModels}
          onToggleModel={filters.onToggleModel}
          selectedCategories={filters.selectedCategories}
          onToggleCategory={filters.onToggleCategory}
          priceMin={filters.priceMin}
          setPriceMin={filters.setPriceMin}
          priceMax={filters.priceMax}
          setPriceMax={filters.setPriceMax}
          rating={filters.rating}
          setRating={filters.setRating}
        />

        {/* 右栏：控制栏 + 卡片网格 */}
        <div className="listing-grid" style={{ minWidth: 0 }}>
          {/* 控制栏：结果计数 + 排序选择 */}
          <div
            className="mb-4 flex flex-wrap items-center justify-between gap-3"
          >
            <span
              className="font-mono"
              style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.06em' }}
            >
              Showing {filters.pagedItems.length} of{' '}
              {filters.totalPrompts.toLocaleString('en-US')} prompts
            </span>
            <SortSelect value={filters.sort} onChange={filters.setSort} />
          </div>

          {/* 卡片网格：1 列（移动）/ 2 列（平板）/ 3 列（桌面） */}
          {filters.pagedItems.length > 0 ? (
            <div className="prompt-card-grid grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
              {filters.pagedItems.map((item) => (
                <PromptListCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* 分页导航 */}
      <Pagination
        currentPage={filters.currentPage}
        totalPages={filters.totalPages}
        onPageChange={filters.onPageChange}
      />
    </>
  );
}

/* ═══ 子组件：排序下拉框 ═══ */

function SortSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="cursor-pointer font-mono"
      style={{
        fontSize: '11px',
        color: 'var(--text)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: '8px 32px 8px 12px',
        outline: 'none',
        appearance: 'none',
        WebkitAppearance: 'none',
        letterSpacing: '0.04em',
        backgroundImage:
          "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236e7681' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(245,197,24,0.5)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

/* ═══ 子组件：空状态 ═══ */

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center"
      style={{ border: '1px dashed var(--border)', background: 'var(--surface)' }}
    >
      <div
        className="font-display font-bold"
        style={{ fontSize: '18px', color: 'var(--text-dim)', marginBottom: '8px' }}
      >
        No Prompts Found
      </div>
      <div
        className="font-mono"
        style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}
      >
        Try adjusting your filters to see more results
      </div>
    </div>
  );
}

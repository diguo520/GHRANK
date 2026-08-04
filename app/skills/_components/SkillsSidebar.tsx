/**
 * SkillsSidebar —— 多维度筛选面板
 * 迁移自 skills.js 的 renderFilters / initFilterHandlers
 * 包含：Occupation / Domain / Category 三维下拉 + Sort 按钮组 + Clear All
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import type { SortMode } from '../_data/skills-data';
import {
  occupations as OCCUPATIONS,
  categoryTree as CATEGORY_TREE,
  getSubcategoryOptions,
} from '../_data/skills-data';

/* ═══════════════════════════════════════════════════════════════
   下拉选项类型
   ═══════════════════════════════════════════════════════════════ */

interface DropdownOption {
  id: string;
  name: string;
}

/* ═══════════════════════════════════════════════════════════════
   FilterDropdown —— 可复用的自定义下拉组件
   处理展开/收起、选中态、点击外部关闭
   ═══════════════════════════════════════════════════════════════ */

interface FilterDropdownProps {
  label: string;
  allLabel: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
}

function FilterDropdown({ label, allLabel, options, value, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部时关闭下拉
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  // 当前选中项的显示文本
  const selectedOpt = options.find((o) => o.id === value);
  const displayText = selectedOpt ? selectedOpt.name : allLabel;

  function handleSelect(val: string) {
    onChange(val);
    setIsOpen(false);
  }

  return (
    <div className="skills-filter-group" style={{ marginBottom: '16px' }}>
      <div
        className="skills-filter-label"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '8px',
        }}
      >
        {label}
      </div>
      <div ref={dropdownRef} className="skills-dropdown" style={{ position: 'relative' }}>
        {/* 触发器 */}
        <button
          type="button"
          className="skills-dropdown-trigger"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px 12px',
            background: 'transparent',
            border: `1px solid ${isOpen ? 'var(--gold)' : 'var(--border-subtle)'}`,
            borderRadius: '4px',
            color: isOpen ? 'var(--text)' : 'var(--text-dim)',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            transition: 'border-color 0.2s, color 0.2s',
          }}
        >
          <span
            className="skills-dropdown-value"
            style={{
              flex: 1,
              textAlign: 'left',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayText}
          </span>
          <span
            className="skills-dropdown-chevron"
            style={{
              fontSize: '9px',
              marginLeft: '8px',
              transition: 'transform 0.2s',
              transform: isOpen ? 'rotate(180deg)' : 'none',
            }}
          >
            {'\u25BC'}
          </span>
        </button>

        {/* 下拉菜单 */}
        {isOpen && (
          <div
            className="skills-dropdown-menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              zIndex: 50,
              maxHeight: '240px',
              overflowY: 'auto',
              background: 'var(--surface)',
              border: '1px solid rgba(245, 197, 24, 0.5)',
              borderRadius: '4px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 12px rgba(245,197,24,0.1)',
            }}
          >
            {/* All 选项 */}
            <div
              className={`skills-dropdown-option ${value === 'all' ? 'active' : ''}`}
              onClick={() => handleSelect('all')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                color: value === 'all' ? 'var(--gold)' : 'var(--text-dim)',
                cursor: 'pointer',
                background: value === 'all' ? 'rgba(245,197,24,0.1)' : 'transparent',
                transition: 'background 0.12s, color 0.12s',
              }}
            >
              <span className="skills-dropdown-option-name" style={{ flex: 1 }}>{allLabel}</span>
            </div>
            {/* 具体选项 */}
            {options.map((opt) => (
              <div
                key={opt.id}
                className={`skills-dropdown-option ${value === opt.id ? 'active' : ''}`}
                onClick={() => handleSelect(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: value === opt.id ? 'var(--gold)' : 'var(--text-dim)',
                  cursor: 'pointer',
                  background: value === opt.id ? 'rgba(245,197,24,0.1)' : 'transparent',
                  transition: 'background 0.12s, color 0.12s',
                }}
              >
                <span className="skills-dropdown-option-name" style={{ flex: 1 }}>{opt.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SortButtonGroup —— 排序按钮组
   ═══════════════════════════════════════════════════════════════ */

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'allTime', label: 'All Time' },
  { value: 'trending', label: 'Trending' },
  { value: 'hot', label: 'Hot' },
];

function SortButtonGroup({ value, onChange }: { value: SortMode; onChange: (v: SortMode) => void }) {
  return (
    <div className="skills-filter-group" style={{ marginBottom: '16px' }}>
      <div
        className="skills-filter-label"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '8px',
        }}
      >
        Sort
      </div>
      <div
        className="skills-filter-btns"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}
      >
        {SORT_OPTIONS.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              className={`skills-filter-btn ${isActive ? 'active' : ''}`}
              onClick={() => onChange(opt.value)}
              style={{
                padding: '9px 8px',
                background: isActive
                  ? 'linear-gradient(180deg, rgba(245,197,24,0.12) 0%, rgba(245,197,24,0.04) 100%)'
                  : 'transparent',
                border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border-subtle)'}`,
                borderRadius: '4px',
                color: isActive ? 'var(--gold)' : 'var(--text-dim)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s',
                boxShadow: isActive ? '0 0 12px rgba(245,197,24,0.25), inset 0 0 8px rgba(245,197,24,0.06)' : 'none',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SkillsSidebar —— 主组件
   ═══════════════════════════════════════════════════════════════ */

export interface SkillsSidebarProps {
  occupation: string;
  domain: string;
  subcategory: string;
  sort: SortMode;
  onOccupationChange: (value: string) => void;
  onDomainChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onSortChange: (value: SortMode) => void;
  onClearAll: () => void;
}

export default function SkillsSidebar({
  occupation,
  domain,
  subcategory,
  sort,
  onOccupationChange,
  onDomainChange,
  onSubcategoryChange,
  onSortChange,
  onClearAll,
}: SkillsSidebarProps) {
  // 构建下拉选项数据
  const occOptions: DropdownOption[] = OCCUPATIONS.map((o) => ({ id: o.id, name: o.nameEn }));
  const domOptions: DropdownOption[] = CATEGORY_TREE.map((d) => ({ id: d.id, name: d.nameEn }));
  // 子分类选项根据已选 domain 联动
  const subcatOptions: DropdownOption[] = getSubcategoryOptions(domain).map((c) => ({
    id: c.id,
    name: c.nameEn || c.name,
  }));

  return (
    <aside
      className="skills-sidebar"
      style={{
        position: 'sticky',
        top: '100px',
        alignSelf: 'start',
      }}
    >
      <div className="skills-filter-panel" style={{ padding: 0 }}>
        {/* 头部：标题 + Clear All */}
        <div
          className="skills-filter-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            paddingBottom: '10px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span
            className="skills-filter-title"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--gold)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {'<// FILTERS'}
          </span>
          <a
            href="#"
            className="skills-filter-clear"
            onClick={(e) => {
              e.preventDefault();
              onClearAll();
            }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            Clear All
          </a>
        </div>

        {/* 筛选分组 */}
        <div className="skills-filter-body">
          <FilterDropdown
            label="Occupation"
            allLabel="All Occupations"
            options={occOptions}
            value={occupation}
            onChange={onOccupationChange}
          />
          <FilterDropdown
            label="Domain"
            allLabel="All Domains"
            options={domOptions}
            value={domain}
            onChange={onDomainChange}
          />
          <FilterDropdown
            label="Category"
            allLabel="All Categories"
            options={subcatOptions}
            value={subcategory}
            onChange={onSubcategoryChange}
          />
          <SortButtonGroup value={sort} onChange={onSortChange} />
        </div>
      </div>
    </aside>
  );
}

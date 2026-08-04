/**
 * SearchSortDropdown —— 搜索结果排序下拉菜单
 * 点击按钮展开选项列表，选择后关闭并回调
 * 迁移自 search.js 的排序下拉逻辑
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '../../_components/icons';
import { SORT_OPTIONS } from '../_data/search-data';
import styles from '../search.module.css';

interface SearchSortDropdownProps {
  /** 当前选中的排序索引 */
  sortIdx: number;
  /** 选择排序选项时的回调 */
  onChange: (idx: number) => void;
}

export default function SearchSortDropdown({ sortIdx, onChange }: SearchSortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* 排序按钮 */}
      <button
        className="inline-flex items-center"
        style={{
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-dim)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: '7px 14px',
          letterSpacing: '0.04em',
          transition: 'color 0.18s, border-color 0.18s',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text)';
          e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-dim)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        {SORT_OPTIONS[sortIdx]}
        <ChevronDownIcon size={10} style={{ opacity: 0.7 }} />
      </button>

      {/* 下拉选项列表 */}
      {open && (
        <div
          className="absolute right-0 z-50"
          style={{
            top: 'calc(100% + 6px)',
            minWidth: '180px',
            background: 'var(--surface-overlay)',
            border: '1px solid rgba(245, 197, 24, 0.35)',
            padding: '6px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
            animation: `${styles.sortDropdownIn} 0.18s ease`,
          }}
        >
          {SORT_OPTIONS.map((opt, idx) => (
            <button
              key={opt}
              className="block w-full text-left"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 500,
                color: idx === sortIdx ? 'var(--gold)' : 'var(--text-dim)',
                background: idx === sortIdx ? 'rgba(245, 197, 24, 0.1)' : 'transparent',
                border: 'none',
                padding: '8px 12px',
                transition: 'color 0.15s, background 0.15s',
              }}
              onClick={(e) => {
                e.stopPropagation();
                onChange(idx);
                setOpen(false);
              }}
              onMouseEnter={(e) => {
                if (idx !== sortIdx) {
                  e.currentTarget.style.color = 'var(--gold)';
                  e.currentTarget.style.background = 'rgba(245, 197, 24, 0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (idx !== sortIdx) {
                  e.currentTarget.style.color = 'var(--text-dim)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

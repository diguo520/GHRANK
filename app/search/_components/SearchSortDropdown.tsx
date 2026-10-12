/**
 * SearchSortDropdown —— 搜索结果排序下拉菜单
 * 使用 antd Dropdown 组件实现，点击展开选项列表
 */
'use client';

import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { ChevronDownIcon } from '@/components/shared/icons';
import { SORT_OPTIONS } from '../_data/search-data';

interface SearchSortDropdownProps {
  /** 当前选中的排序索引 */
  sortIdx: number;
  /** 选择排序选项时的回调 */
  onChange: (idx: number) => void;
}

export default function SearchSortDropdown({ sortIdx, onChange }: SearchSortDropdownProps) {
  // 构建 antd Menu items
  const items: MenuProps['items'] = SORT_OPTIONS.map((opt, idx) => ({
    key: String(idx),
    label: opt,
  }));

  return (
    <Dropdown
      menu={{
        items,
        selectable: true,
        selectedKeys: [String(sortIdx)],
        onClick: ({ key }) => onChange(Number(key)),
      }}
      trigger={['click']}
      placement="bottomRight"
    >
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
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text)';
          e.currentTarget.style.borderColor = 'rgba(157, 140, 255, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-dim)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        {SORT_OPTIONS[sortIdx]}
        <ChevronDownIcon size={10} style={{ opacity: 0.7 }} />
      </button>
    </Dropdown>
  );
}

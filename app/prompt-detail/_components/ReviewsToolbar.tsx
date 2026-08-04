/**
 * ReviewsToolbar —— 过滤工具栏
 * 迁移自 prompt-detail.html 的 .reviews-toolbar + prompt-detail-init.js 过滤切换逻辑
 * 包含 All / Liked / Saved / Tipped 四个过滤 chip
 */
'use client';

import { FILTER_CHIPS } from '../_data/prompt-detail-data';
import { ListIcon, HeartIcon, BookmarkIcon, CoffeeIcon } from '../../_components/icons';

/** 过滤 chip 图标映射 */
const CHIP_ICONS: Record<string, typeof ListIcon> = {
  all: ListIcon,
  liked: HeartIcon,
  saved: BookmarkIcon,
  tipped: CoffeeIcon,
};

interface ReviewsToolbarProps {
  /** 当前激活的过滤 */
  active: string;
  /** 切换过滤 */
  onSelect: (filter: string) => void;
}

export default function ReviewsToolbar({ active, onSelect }: ReviewsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="font-mono uppercase" style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
        Filter:
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_CHIPS.map((chip) => {
          const Icon = CHIP_ICONS[chip.filter] || ListIcon;
          const isActive = chip.filter === active;
          return (
            <button
              key={chip.filter}
              onClick={() => onSelect(chip.filter)}
              className="inline-flex items-center gap-1.5 transition-all duration-200"
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                color: isActive ? 'var(--bg)' : 'var(--text-dim)',
                background: isActive ? 'var(--gold)' : 'var(--surface)',
                border: '1px solid', borderColor: isActive ? 'var(--gold)' : 'var(--border)',
                padding: '6px 12px', cursor: 'pointer', letterSpacing: '0.04em',
                boxShadow: isActive ? '0 0 12px rgba(245,197,24,0.25)' : 'none',
              }}
            >
              <span className="flex items-center" style={{ opacity: isActive ? 1 : 0.7 }}>
                <Icon className="h-3 w-3" />
              </span>
              <span style={{ fontWeight: 600 }}>{chip.label}</span>
              <span style={{ fontSize: '10px', opacity: 0.6 }}>{chip.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

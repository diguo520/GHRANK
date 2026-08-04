/**
 * WebsiteSidebar —— 网站目录侧边栏
 * 分类导航树（带竖直连接线 + 节点圆点）+ More 区块
 * 点击分类项触发 toggle：已激活则回到 All Sites，否则切换到该分类
 * 迁移自 website.html 的侧边栏结构 + website.js 的 handleNavClick
 */
'use client';

import { CSSProperties } from 'react';
import { PlusIcon, InfoIcon, MailIcon } from '../../_components/icons';
import {
  type WebsiteCategory,
  CATEGORY_NAV,
  CATEGORY_LABELS,
  MORE_LINK_LABELS,
} from '../_data/website-data';

interface WebsiteSidebarProps {
  /** 当前激活的分类（'all' 表示全部） */
  currentCategory: WebsiteCategory | 'all';
  /** 分类变更回调 */
  onCategoryChange: (cat: WebsiteCategory | 'all') => void;
}

/* ── More 区块的图标 ── */
function MoreIcon({ index }: { index: number }) {
  if (index === 0) return <PlusIcon size={14} />;
  if (index === 1) return <InfoIcon size={14} />;
  return <MailIcon size={14} />;
}

export default function WebsiteSidebar({ currentCategory, onCategoryChange }: WebsiteSidebarProps) {
  return (
    <aside
      className="website-sidebar flex flex-col"
      style={{
        position: 'sticky',
        top: '88px',
        gap: '24px',
        maxHeight: 'calc(100vh - 104px)',
        overflowY: 'auto',
        paddingRight: '4px',
      }}
    >
      {/* 分组标题 */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          padding: '0 4px',
          marginBottom: '10px',
        }}
      >
        Browse Categories
      </div>

      {/* 分类导航树 */}
      <nav className="relative flex flex-col" style={{ gap: '2px', paddingLeft: '14px' } as CSSProperties}>
        {/* 竖直连接线 */}
        <div
          className="pointer-events-none absolute"
          style={{ left: '4px', top: '8px', bottom: '8px', width: '1px', background: 'var(--border-subtle)' }}
        />

        {CATEGORY_NAV.map(({ category, index, count }) => {
          const isActive = currentCategory === category;
          return (
            <button
              key={category}
              className="relative flex items-center"
              style={{
                gap: '12px',
                padding: '10px 12px',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 500,
                color: isActive ? 'var(--gold)' : 'var(--text-dim)',
                background: isActive ? 'rgba(245,197,24,0.06)' : 'transparent',
                transition: 'color 0.18s, background 0.18s',
                textAlign: 'left',
              }}
              onClick={() => onCategoryChange(isActive ? 'all' : category)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text)';
                  e.currentTarget.style.background = 'rgba(245,197,24,0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-dim)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {/* 节点连接小横线 */}
              <span className="pointer-events-none absolute" style={{ left: '-10px', top: '50%', width: '10px', height: '1px', background: isActive ? 'rgba(245,197,24,0.5)' : 'var(--border-subtle)' }} />
              {/* 节点圆点 */}
              <span
                className="pointer-events-none absolute"
                style={{
                  left: '-11px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: isActive ? 'var(--gold)' : 'var(--border)',
                  boxShadow: isActive ? '0 0 8px rgba(245,197,24,0.25)' : 'none',
                  transition: 'background 0.18s, box-shadow 0.18s',
                }}
              />
              {/* 编号 */}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                  letterSpacing: '0.06em',
                  flexShrink: 0,
                  width: '18px',
                }}
              >
                {index}
              </span>
              {/* 分类名 */}
              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {CATEGORY_LABELS[category]}
              </span>
              {/* 数量 */}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 500,
                  color: isActive ? 'var(--text-dim)' : 'var(--text-muted)',
                  letterSpacing: '0.04em',
                  flexShrink: 0,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* More 区块 */}
      <div className="flex flex-col" style={{ gap: '2px', paddingTop: '16px', marginTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            padding: '0 4px',
            marginBottom: '8px',
          }}
        >
          More
        </div>
        {MORE_LINK_LABELS.map((label, i) => (
          <a
            key={label}
            href="#"
            className="group/more flex items-center"
            style={{
              gap: '10px',
              padding: '9px 12px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-dim)',
              transition: 'color 0.18s, background 0.18s',
            }}
            onClick={(e) => e.preventDefault()}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.background = 'rgba(245,197,24,0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-dim)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ width: '14px', height: '14px', opacity: 0.7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MoreIcon index={i} />
            </span>
            <span className="flex-1">{label}</span>
            <span
              className="font-mono"
              style={{
                color: 'var(--text-muted)',
                opacity: 0,
                transform: 'translateX(-4px)',
                transition: 'opacity 0.18s, transform 0.18s, color 0.18s',
              }}
            >
              ›
            </span>
          </a>
        ))}
      </div>
    </aside>
  );
}

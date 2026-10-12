/**
 * TiebasRightPanel —— 贴吧列表页右栏
 * 迁移自 community-tiebas.html 的 .community-aside-right
 *
 * 包含：Tieba Rules + Moderators + 广告位
 * （贴吧信息卡已移至中栏 Hero 区域，避免重复展示）
 */
'use client';

import Link from 'next/link';
import { EXPANDED_TIEBA_CATALOG, type TiebaCatalogItem } from '../../_data/community-data';
import { TIEBA_RULES, MODERATORS } from '../_data/community-tiebas-data';
import { PlusIcon, ArrowRightIcon } from '@/components/shared/icons';

interface TiebasRightPanelProps {
  /** 当前贴吧目录项 */
  bar: TiebaCatalogItem;
}

export default function TiebasRightPanel({}: TiebasRightPanelProps) {
  return (
    <aside
      className="community-aside-right flex flex-col gap-5"
      style={{
        position: 'sticky',
        top: '88px',
        maxHeight: 'calc(100vh - 104px)',
        overflowY: 'auto',
        paddingRight: '4px',
      }}
    >
      {/* 浏览更多贴吧组入口（原位于贴吧信息卡底部，移至顶部） */}
      <Link
        href="/community/tiebas/explore"
        className="flex items-center justify-between gap-2 w-full no-underline"
        style={{
          background: 'transparent',
          border: '1px dashed var(--border-subtle)',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'color 0.2s, border-color 0.2s',
          padding: '10px 14px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--gold)';
          e.currentTarget.style.borderColor = 'rgba(157,140,255,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
        }}
      >
        <span className="flex items-center gap-1.5 font-mono text-[11px]" style={{ letterSpacing: '0.04em' }}>
          <PlusIcon size={10} />
          Browse {EXPANDED_TIEBA_CATALOG.length} groups
        </span>
        <ArrowRightIcon size={11} />
      </Link>

      {/* 贴吧规则 */}
      <section className="sidebar-section flex flex-col gap-2.5">
        <div
          className="sidebar-section-title font-mono text-[10px] font-semibold uppercase px-1 mb-1"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
        >
          Tieba Rules
        </div>
        <div className="tieba-rules-list flex flex-col gap-2">
          {TIEBA_RULES.map((rule, i) => (
            <div
              key={i}
              className="tieba-rule font-body text-xs pl-3"
              style={{ color: 'var(--text-dim)', lineHeight: 1.45, borderLeft: '2px solid var(--border-subtle)' }}
            >
              {i + 1}. {rule}
            </div>
          ))}
        </div>
      </section>

      {/* 版主：仅头像排列 */}
      <section className="sidebar-section flex flex-col gap-2.5">
        <div
          className="sidebar-section-title font-mono text-[10px] font-semibold uppercase px-1 mb-1"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
        >
          Moderators
        </div>
        <div className="tieba-moderators flex flex-wrap gap-2">
          {MODERATORS.map((mod) => (
            <span
              key={mod.name}
              title={mod.name}
              className="flex items-center justify-center rounded-full font-display text-xs font-bold flex-shrink-0"
              style={{
                width: '32px',
                height: '32px',
                background: 'var(--bg)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--gold)',
              }}
            >
              {mod.avatar}
            </span>
          ))}
        </div>
      </section>

      {/* 广告位 300 × 250 */}
      <section className="sidebar-section flex flex-col gap-2.5">
        <div
          className="ad-slot ad-slot-sidebar relative flex items-center justify-center"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: '20px 24px',
            minHeight: '120px',
          }}
        >
          <span
            className="absolute top-1.5 left-2 font-mono text-[8px]"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}
          >
            AD
          </span>
          <span
            className="absolute bottom-1.5 right-2 font-mono text-[9px] font-medium pointer-events-none"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}
          >
            300 × 250
          </span>
          <div
            className="ad-slot-content font-mono text-xs text-center"
            style={{ color: 'var(--text-dim)', letterSpacing: '0.05em' }}
          >
            <div
              className="ad-line-1 text-[9px] uppercase mb-1.5"
              style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}
            >
              Sponsored
            </div>
            <div
              className="ad-line-2 font-display text-base font-bold mb-1"
              style={{ color: 'var(--gold)', letterSpacing: '0.06em' }}
            >
              VEX LABS
            </div>
            <div className="ad-line-3 text-[11px]" style={{ color: 'var(--text-dim)' }}>
              Build faster. Ship smarter.
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}

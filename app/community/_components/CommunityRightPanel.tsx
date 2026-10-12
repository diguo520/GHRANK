/**
 * CommunityRightPanel —— 社区右栏
 * 包含：创建贴吧卡片 + 热门贴吧列表 + 广告位
 * 迁移自 community.html 的 .community-aside-right 与 community.js 的渲染逻辑
 *
 * 创建贴吧按钮：点击后显示 Toast 提示（固定在视口底部）
 */
'use client';

import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from 'antd';
import { PlusIcon, UsersIcon, ArrowRightIcon } from '@/components/shared/icons';
import { HOT_TIEBAS, EXPANDED_TIEBA_CATALOG, type HotTieba } from '../_data/community-data';
import { HEX_CLIP_PATH } from '@/lib/constants';
import CreateTiebaModal from './CreateTiebaModal';

/* ── 热门贴吧项（六边形图标 + 名称 + 元信息） ── */
function HotBarItem({ bar }: { bar: HotTieba }) {
  return (
    <Link
      href={`/community/tiebas?bar=${encodeURIComponent(bar.id)}`}
      className="hot-bar-item flex items-center gap-3 p-2.5 no-underline transition-all"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border-subtle)',
        color: 'inherit',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(157, 140, 255, 0.35)';
        e.currentTarget.style.transform = 'translateX(2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = '';
      }}
    >
      {/* 六边形图标 */}
      <span
        className="hot-bar-icon w-9 h-9 flex items-center justify-center font-display text-[14px] font-extrabold flex-shrink-0"
        style={{
          background: 'var(--gold-subtle)',
          color: 'var(--gold)',
          clipPath: HEX_CLIP_PATH,
        }}
      >
        {bar.icon}
      </span>
      <div className="hot-bar-info flex-1 min-w-0">
        <div className="hot-bar-name font-display text-[13px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap text-text">
          {bar.name}
        </div>
        <div
          className="hot-bar-meta font-mono text-[10px]"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}
        >
          {bar.members} members · {bar.posts} posts
        </div>
      </div>
    </Link>
  );
}

export default function CommunityRightPanel({
  header,
  showCreateTieba = true,
  showHotTiebas = true,
}: {
  header?: ReactNode;
  showCreateTieba?: boolean;
  showHotTiebas?: boolean;
}) {
  // Toast 状态：创建贴吧按钮的反馈提示
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 创建贴吧弹窗状态
  const [createOpen, setCreateOpen] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  // 清理 Toast 定时器
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

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
      {/* 可选 header（如详情页的作者卡+贴吧信息） */}
      {header}
      {/* 加入贴吧组主入口卡片（原 Create Tieba 位置） */}
      {showCreateTieba && (
        <div
          className="join-groups-card relative p-5"
          style={{ background: 'transparent', border: '1px solid rgba(157,140,255,0.45)' }}
        >
          {/* 左上金色装饰角 */}
          <span
            className="absolute top-[-1px] left-[-1px] w-2.5 h-2.5"
            style={{
              borderTop: '1px solid rgba(255, 224, 102, 0.7)',
              borderLeft: '1px solid rgba(255, 224, 102, 0.7)',
            }}
          />
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div>
              <div
                className="font-display text-[14px] font-bold uppercase mb-1"
                style={{ color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1.2 }}
              >
                Join Tieba Groups
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                <UsersIcon size={11} style={{ opacity: 0.7 }} />
                {EXPANDED_TIEBA_CATALOG.length} curated communities
              </div>
            </div>
          </div>
          <div
            className="font-body text-xs mb-4 leading-snug"
            style={{ color: 'var(--text-dim)' }}
          >
            AI &amp; ML · Data Infra · Dev Tools · Frontend · Open Source · Career — one click to join.
          </div>
          {/* 主按钮：跳转到 explore 页加入贴吧组 */}
          <Link
            href="/community/tiebas/explore"
            className="flex items-center justify-center gap-2 w-full no-underline btn-hud-lg"
            style={{
              color: 'var(--bg)',
              background: 'var(--gold)',
              padding: '11px 16px',
              boxShadow: '0 0 16px rgba(157, 140, 255, 0.25)',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffe066';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(157,140,255,0.25), 0 0 48px rgba(157,140,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--gold)';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(157,140,255,0.25)';
            }}
          >
            <PlusIcon size={14} />
            Browse &amp; Join Groups
            <ArrowRightIcon size={13} />
          </Link>
          {/* 次级：创建贴吧 — 点击打开弹窗 */}
          <button
            onClick={() => setCreateOpen(true)}
            className="w-full mt-2.5 py-1.5 btn-hud-mono-link"
            style={{
              background: 'transparent',
              border: '1px dashed var(--border)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            + Create a new tieba
          </button>
        </div>
      )}

      {/* 热门贴吧列表 */}
      {showHotTiebas && (
        <section className="sidebar-section flex flex-col gap-2.5">
          <div
            className="sidebar-section-title font-mono text-[10px] font-semibold uppercase px-1 mb-1"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
          >
            Hot Tiebas
          </div>
          <div className="hot-bars-list flex flex-col gap-2">
            {HOT_TIEBAS.map((bar) => (
              <HotBarItem key={bar.id} bar={bar} />
            ))}
          </div>
        </section>
      )}

      {/* 广告位 300 × 250 */}
      <section className="sidebar-section flex flex-col gap-2.5">
        <div
          className="ad-slot ad-slot-sidebar relative flex items-center justify-center"
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            padding: '20px 24px',
            minHeight: '120px',
          }}
        >
          {/* AD 标记 */}
          <span
            className="absolute top-1.5 left-2 font-mono text-[8px]"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}
          >
            AD
          </span>
          {/* 尺寸标注 */}
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

      {/* 创建贴吧弹窗 */}
      <CreateTiebaModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          showToast('Tieba created successfully');
        }}
      />

      {/* Toast 提示（固定在视口底部） */}
      <div
        className="community-toast fixed left-1/2 flex items-center justify-center pointer-events-none"
        style={{
          bottom: '32px',
          transform: toastVisible
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(20px)',
          background: 'transparent',
          border: '1px solid rgba(157, 140, 255, 0.35)',
          padding: '12px 24px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--gold)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(157, 140, 255, 0.15)',
          zIndex: 10000,
          opacity: toastVisible ? 1 : 0,
          transition: 'opacity 0.3s, transform 0.3s',
          letterSpacing: '0.04em',
        }}
      >
        {toastMsg}
      </div>
    </aside>
  );
}

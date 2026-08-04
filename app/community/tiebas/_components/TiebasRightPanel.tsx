/**
 * TiebasRightPanel —— 贴吧列表页右栏
 * 迁移自 community-tiebas.html 的 .community-aside-right
 *
 * 包含：贴吧信息卡（图标/名称/统计/描述 + Join/New Post 按钮）
 *       + Tieba Rules + Moderators + 广告位
 *
 * 加入贴吧交互：localStorage 持久化 + 登录检查 + Toast 反馈
 *   - 未登录：提示 "Please log in"
 *   - 已登录未加入：点击 Join，标记已加入，显示 New Post 入口
 *   - 已加入且已登录：直接显示 New Post 入口
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { fmtNum, type TiebaCatalogItem } from '../../_data/community-data';
import { TIEBA_RULES, MODERATORS } from '../_data/community-tiebas-data';
import { UsersIcon, FileTextIcon, PlusIcon } from '../../../_components/icons';
import { HEX_CLIP_PATH } from '@/lib/constants';
import { useIsLoggedIn } from '@/app/_hooks/useIsLoggedIn';
import { safeStorage } from '@/lib/safeStorage';

interface TiebasRightPanelProps {
  /** 当前贴吧目录项 */
  bar: TiebaCatalogItem;
}

export default function TiebasRightPanel({ bar }: TiebasRightPanelProps) {
  // 加入状态（客户端挂载后从 localStorage 读取，避免 hydration mismatch）
  const [joined, setJoined] = useState(false);
  const { loggedIn } = useIsLoggedIn();
  // Toast 状态：加入贴吧反馈提示
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 显示 Toast（固定在视口底部，2.2s 后自动隐藏）
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  useEffect(() => {
    setJoined(safeStorage.get(`ghrank_joined_bar_${bar.id}`) === '1');
  }, [bar.id]);

  // 清理 Toast 定时器
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  /** 加入贴吧：检查登录 -> 标记 localStorage -> 切换按钮状态 */
  const handleJoin = useCallback(() => {
    if (!loggedIn) {
      showToast('Please log in to join this tieba');
      return;
    }
    safeStorage.set(`ghrank_joined_bar_${bar.id}`, '1');
    setJoined(true);
    showToast(`Joined ${bar.name}`);
  }, [loggedIn, bar.id, bar.name, showToast]);

  // 已加入且已登录时显示"New Post"，否则显示"Join Tieba"
  const showNewPost = joined && loggedIn;

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
      {/* 贴吧信息卡 */}
      <div
        className="tieba-info-card relative"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: '22px 24px',
        }}
      >
        {/* 左上角金色装饰角 */}
        <span
          className="absolute top-[-1px] left-[-1px] w-3 h-3 pointer-events-none"
          style={{ borderTop: '1px solid rgba(245,197,24,0.5)', borderLeft: '1px solid rgba(245,197,24,0.5)' }}
        />
        {/* 头部：图标 + 名称 + 统计 */}
        <div className="tieba-info-header flex items-center gap-3.5 mb-3.5">
          <span
            className="tieba-info-icon flex items-center justify-center font-display text-[18px] font-extrabold flex-shrink-0"
            style={{
              width: '48px',
              height: '48px',
              background: 'var(--gold-subtle)',
              color: 'var(--gold)',
              clipPath: HEX_CLIP_PATH,
            }}
          >
            {bar.icon}
          </span>
          <div className="min-w-0">
            <Link
              href={`/community/tiebas?bar=${encodeURIComponent(bar.id)}`}
              className="tieba-info-name font-display text-[18px] font-bold no-underline hover:underline"
              style={{ color: 'var(--text)', lineHeight: 1.2 }}
            >
              {bar.name}
            </Link>
            <div
              className="tieba-info-meta flex flex-row items-center gap-3 mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              <span className="tieba-meta-stat inline-flex items-center gap-1.5 font-mono text-[10px]" style={{ letterSpacing: '0.04em' }}>
                <UsersIcon size={12} style={{ opacity: 0.7 }} /> {fmtNum(bar.members)}
              </span>
              <span className="tieba-meta-stat inline-flex items-center gap-1.5 font-mono text-[10px]" style={{ letterSpacing: '0.04em' }}>
                <FileTextIcon size={12} style={{ opacity: 0.7 }} /> {fmtNum(bar.posts)}
              </span>
            </div>
          </div>
        </div>
        {/* 描述 */}
        <p
          className="tieba-info-desc font-body text-[13px] mb-[18px]"
          style={{ color: 'var(--text-dim)', lineHeight: 1.5 }}
        >
          {bar.desc}
        </p>
        {/* 加入按钮 / 新帖按钮（互斥显示） */}
        {!showNewPost ? (
          <button
            onClick={handleJoin}
            className="tieba-join-btn flex items-center justify-center gap-2 w-full font-display text-xs font-bold uppercase"
            style={{
              color: 'var(--bg)',
              background: 'var(--gold)',
              border: 'none',
              padding: '11px 16px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(245,197,24,0.25)',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffe066';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(245,197,24,0.25), 0 0 48px rgba(245,197,24,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--gold)';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(245,197,24,0.25)';
            }}
          >
            <PlusIcon size={14} />
            Join Tieba
          </button>
        ) : (
          <Link
            href={`/community/new?tieba=${encodeURIComponent(bar.name)}`}
            className="tieba-new-post-btn flex items-center justify-center gap-2 w-full font-display text-xs font-bold uppercase no-underline"
            style={{
              color: 'var(--bg)',
              background: 'var(--gold)',
              border: 'none',
              padding: '11px 16px',
              marginTop: '10px',
              letterSpacing: '0.1em',
              boxShadow: '0 0 16px rgba(245,197,24,0.25)',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffe066';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(245,197,24,0.25), 0 0 48px rgba(245,197,24,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--gold)';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(245,197,24,0.25)';
            }}
          >
            <PlusIcon size={14} />
            New Post
          </Link>
        )}
      </div>

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

      {/* 版主 */}
      <section className="sidebar-section flex flex-col gap-2.5">
        <div
          className="sidebar-section-title font-mono text-[10px] font-semibold uppercase px-1 mb-1"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
        >
          Moderators
        </div>
        <div className="tieba-moderators flex flex-col gap-2.5">
          {MODERATORS.map((mod) => (
            <div
              key={mod.name}
              className="tieba-moderator flex items-center gap-2.5 font-body text-[13px] font-medium"
              style={{ color: 'var(--text)' }}
            >
              <span
                className="flex items-center justify-center rounded-full font-display text-xs font-bold flex-shrink-0"
                style={{
                  width: '30px',
                  height: '30px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--gold)',
                }}
              >
                {mod.avatar}
              </span>
              <span>{mod.name}</span>
            </div>
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

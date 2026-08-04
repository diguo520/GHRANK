/**
 * SideNav —— 右侧悬浮导航 + 弹出面板
 * 迁移自 core.js 的 SideNav 组件
 *
 * 包含：通知(Alerts) / 消息(Messages) / 钱包(Wallet) / 笔记(Notes→/notes) / 发帖(New Post) / 设置(Settings→/settings) / 回到顶部
 * 面板：通知列表 / 消息列表 / 钱包余额+交易记录 / 发帖分类选择
 * 交互：滚动超过 120px 显示 / ESC 关闭面板 / 徽章脉冲 / 钱包数字滚动动画
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SidePanel } from './SidePanel';
import { ALERTS, MESSAGES, WALLET, CATEGORIES } from '@/app/_data/sidenav-data';
import type { AlertItem, MessageItem } from '@/app/_data/sidenav-data';

type PanelId = 'alert' | 'mail' | 'wallet' | 'post' | null;

/* ═══ SVG 图标 —— 内联 React 元素，避免 dangerouslySetInnerHTML ═══ */

const Icons = {
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h12v4" />
      <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2z" />
      <circle cx="17" cy="13" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  ),
  note: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h10l4 4v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M15 3v4h4" />
      <path d="M8 12h8M8 16h5" />
    </svg>
  ),
  post: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  top: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </svg>
  ),

  catHot: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M8 1c1 2 3 3 3 6a3 3 0 0 1-6 0c0-1 .5-2 1-2.5C5 6 4 7 4 9a4 4 0 0 0 8 0c0-4-4-5-4-8z" />
    </svg>
  ),
  catShow: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2" y="3" width="12" height="10" />
      <path d="M5 6h6M5 9h4" />
    </svg>
  ),
  catHelp: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="8" r="5.5" />
      <path d="M6.5 6.5a1.5 1.5 0 0 1 3 0c0 1-.5 1.3-1 1.6-.3.2-.5.4-.5.8v.6" />
      <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
    </svg>
  ),
  catTutorials: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2 3l4 5-4 5M8 13h6" />
    </svg>
  ),
  catDevlogs: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <polyline points="5 6 8 3 11 6" />
      <polyline points="5 10 8 13 11 10" />
      <path d="M8 3v10" />
    </svg>
  ),
  catOfftopic: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 3h8v10H4z" />
      <path d="M6 6h4M6 9h4" />
    </svg>
  ),
};

/* ═══ 导航项定义 ═══ */

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  badge?: number;
  href?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'alert', label: 'Alerts', icon: Icons.alert, badge: 3 },
  { id: 'mail', label: 'Messages', icon: Icons.mail, badge: 3 },
  { id: 'wallet', label: 'Wallet', icon: Icons.wallet },
  { id: 'note', label: 'Notes', icon: Icons.note, href: '/notes' },
  { id: 'post', label: 'New Post', icon: Icons.post },
  { id: 'gear', label: 'Settings', icon: Icons.gear, href: '/settings' },
];

/* ═══════════════════════════════════════════════════════════════
   子组件 —— 通知项 / 消息项 / 交易项 / 分类项
   ═══════════════════════════════════════════════════════════════ */

/** 通知事件项 —— 头像 + 用户 + 动作 + 目标/金额 + 未读指示 */
function AlertRow({ alert }: { alert: AlertItem }) {
  const isSystem = alert.type === 'system' || alert.avatar === 'LOGO';
  const userName = isSystem ? alert.user : `@${alert.user}`;

  return (
    <div className={`gh-evt${alert.read ? '' : ' is-unread'}`}>
      {/* 系统通知用六边形 Logo，用户通知用头像 */}
      {isSystem ? (
        <div className="gh-evt-avatar gh-evt-avatar-system">
          <div className="logo-hex">G</div>
        </div>
      ) : (
        <div className="gh-evt-avatar">
          <Image src={alert.avatar} alt="" width={32} height={32} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="gh-evt-main">
        <div className="gh-evt-top">
          <span className={`gh-evt-user${isSystem ? ' gh-evt-user-system' : ''}`}>{userName}</span>
          <span className="gh-evt-time">{alert.time} ago</span>
        </div>
        <div className="gh-evt-action">{alert.action}</div>
        {/* 目标 / 金额 */}
        {(alert.target || alert.amount) && (
          <div className="gh-evt-meta">
            {alert.target && <span className="gh-evt-target">{alert.target}</span>}
            {alert.amount && <span className="gh-evt-amount">{alert.amount}</span>}
          </div>
        )}
        {/* 带图片的系统消息缩略图 */}
        {alert.image && (
          <div className="gh-evt-image" style={{ position: 'relative', width: '100%' }}>
            <Image src={alert.image} alt={alert.imageAlt || ''} fill style={{ aspectRatio: '16 / 9', objectFit: 'cover' }} />
          </div>
        )}
      </div>
      {/* 未读小圆点 */}
      {!alert.read && <div className="gh-evt-icon" aria-label="unread" />}
    </div>
  );
}

/** 消息项 —— 字母头像 + 用户 + 预览 + 未读指示 */
function MessageRow({ msg }: { msg: MessageItem }) {
  return (
    <div className={`gh-msg${msg.read ? '' : ' is-unread'}`}>
      <div className="gh-msg-avatar">{msg.avatar}</div>
      <div className="gh-msg-main">
        <div className="gh-msg-top">
          <span className="gh-msg-user">@{msg.user}</span>
          <span className="gh-msg-time">{msg.time}</span>
        </div>
        <div className="gh-msg-preview">{msg.preview}</div>
      </div>
      {!msg.read && <div className="gh-msg-dot" aria-label="unread" />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SideNav 主组件
   ═══════════════════════════════════════════════════════════════ */
export default function SideNav() {
  const [visible, setVisible] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelId>(null);
  const [badges, setBadges] = useState({ alert: 3, mail: 3 });
  const walletNumRef = useRef<HTMLSpanElement>(null);

  // 滚动显示 —— 超过 120px 显示悬浮导航
  useEffect(() => {
    function onScroll() {
      const s = window.pageYOffset || document.documentElement.scrollTop;
      setVisible(s > 120);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ESC 关闭面板
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setActivePanel(null);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // 钱包数字滚动动画 —— 打开钱包面板时触发
  useEffect(() => {
    if (activePanel !== 'wallet' || !walletNumRef.current) return;
    const el = walletNumRef.current;
    const target = parseFloat(el.getAttribute('data-count') || '0');
    if (isNaN(target)) return;

    const dur = 900;
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [activePanel]);

  /** 打开/关闭面板，同时清除对应 badge */
  const openPanel = useCallback((id: PanelId) => {
    setActivePanel((cur) => (cur === id ? null : id));
    if (id === 'alert' || id === 'mail') {
      setBadges((b) => ({ ...b, [id]: 0 }));
    }
  }, []);

  /** 回到顶部 */
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      {/* ── 右侧悬浮导航按钮组 ── */}
      <div
        className={`gh-side-nav${visible ? ' is-ready' : ' is-hidden'}`}
        id="ghSideNav"
        role="navigation"
        aria-label="Side navigation"
      >
        {NAV_ITEMS.map((item) => {
          const badge = badges[item.id as keyof typeof badges];
          const cls = `gh-side-nav-item${activePanel === item.id ? ' is-panel-open' : ''}`;

          // 带 href 的项渲染为链接（笔记→/notes，设置→/settings）
          if (item.href) {
            return (
              <Link key={item.id} href={item.href} className={cls} data-nav={item.id} aria-label={item.label}>
                {item.icon}
              </Link>
            );
          }
          return (
            <button
              key={item.id}
              type="button"
              className={cls}
              data-nav={item.id}
              aria-label={item.label}
              onClick={() => openPanel(item.id as PanelId)}
            >
              {item.icon}
              {/* 通知徽章（≥3 时脉冲） */}
              {badge ? (
                <span className={`gh-side-nav-badge${badge >= 3 ? ' is-pulse' : ''}`}>{badge}</span>
              ) : null}
            </button>
          );
        })}

        {/* 分隔线 + 回到顶部 */}
        <div className="gh-side-nav-divider" />
        <button
          type="button"
          className="gh-side-nav-item gh-side-nav-top"
          id="ghSideNavTop"
          aria-label="Back to top"
          onClick={scrollToTop}
        >
          {Icons.top}
        </button>
      </div>

      {/* ── 弹出面板组 ── */}
      <div className="gh-side-panels" id="ghSidePanels">
        {/* 通知面板 */}
        <SidePanel isOpen={activePanel === 'alert'} title="Notifications" onClose={() => setActivePanel(null)} data-panel="alert" ariaLabel="Notifications">
          {ALERTS.map((alert, i) => (
            <AlertRow key={i} alert={alert} />
          ))}
        </SidePanel>

        {/* 消息面板 */}
        <SidePanel isOpen={activePanel === 'mail'} title="Messages" onClose={() => setActivePanel(null)} data-panel="mail" ariaLabel="Messages">
          {MESSAGES.map((msg, i) => (
            <MessageRow key={i} msg={msg} />
          ))}
        </SidePanel>

        {/* 钱包面板 */}
        <SidePanel isOpen={activePanel === 'wallet'} title="Wallet" onClose={() => setActivePanel(null)} data-panel="wallet" ariaLabel="Wallet">
          {/* 余额 */}
          <div className="gh-wallet-balance">
            <div className="gh-wallet-label">Available Balance</div>
            <div className="gh-wallet-amount">
              <span className="gh-wallet-num" data-count={WALLET.balance} ref={walletNumRef}>
                0.00
              </span>
              <span className="gh-wallet-cur">{WALLET.currency}</span>
            </div>
            <div className="gh-wallet-pending">
              {WALLET.pending} {WALLET.currency} pending
            </div>
          </div>
          {/* 操作按钮 */}
          <div className="gh-wallet-actions">
            <button className="gh-wallet-btn">Deposit</button>
            <button className="gh-wallet-btn">Withdraw</button>
          </div>
          {/* 交易记录 */}
          <div className="gh-wallet-section-title">Recent Activity</div>
          <div className="gh-tx-list">
            {WALLET.transactions.map((tx, i) => (
              <div className="gh-tx" key={i}>
                <div className="gh-tx-info">
                  <span className="gh-tx-label">{tx.label}</span>
                  <span className="gh-tx-time">{tx.time}</span>
                </div>
                <span className={`gh-tx-amount gh-tx-${tx.type}`}>
                  {tx.amount} {WALLET.currency}
                </span>
              </div>
            ))}
          </div>
        </SidePanel>

        {/* 发帖分类面板 */}
        <SidePanel isOpen={activePanel === 'post'} title="New Post — Choose Category" onClose={() => setActivePanel(null)} data-panel="post" ariaLabel="New Post — Choose Category">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={i}
              href={`/community/new?cat=${encodeURIComponent(cat.name)}`}
              className="gh-cat"
            >
              <span className="gh-cat-icon">
                {/* 根据分类名选择对应图标 */}
                {Icons[cat.icon as keyof typeof Icons] || Icons.catHot}
              </span>
              <span className="gh-cat-info">
                <span className="gh-cat-name">{cat.name}</span>
                <span className="gh-cat-desc">{cat.desc}</span>
              </span>
              <span className="gh-cat-count">{cat.count}</span>
            </Link>
          ))}
        </SidePanel>

        {/* 遮罩层 —— 点击关闭面板 */}
        <div
          className={`gh-side-backdrop${activePanel ? ' is-open' : ''}`}
          id="ghSideBackdrop"
          onClick={() => setActivePanel(null)}
        />
      </div>
    </>
  );
}

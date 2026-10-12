/**
 * SideNav —— 右侧悬浮导航 + 弹出面板（v2.0 antd 迁移）
 *
 * 迁移内容：
 * - 弹出面板 → 由 SidePanel（antd Drawer）接管，自带遮罩与 ESC 关闭
 * - 移除冗余的 gh-side-backdrop（Drawer 自带遮罩）
 *
 * 保留（核心 HUD 视觉，不迁移）：
 * - 右侧悬浮按钮组（gh-side-nav）—— 项目独特的 HUD 设计
 * - 滚动超过 120px 显示 / 徽章脉冲 / 钱包数字滚动动画
 * - 内联 SVG 图标（B5 阶段统一替换为 lucide-react）
 * - 通知项 / 消息项 / 交易项 / 分类项 的 HUD 卡片样式
 *
 * 设计决策：FloatButton.Group 的"点击展开"语义与本组件的"多按钮常驻侧边"
 * 不匹配，强行替换会破坏徽章脉冲、滚动显隐等核心交互。
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { App, Button, Tooltip } from 'antd';
import { SidePanel } from './SidePanel';
import { ALERTS, WALLET } from '@/lib/data/sidenav-data';
import type { AlertItem } from '@/lib/data/sidenav-data';
import {
  Bell as LucideBell,
  Wallet as LucideWallet,
  StickyNote as LucideNote,
  SquarePen as LucidePost,
  Settings as LucideGear,
  ArrowUp as LucideTop,
  MessageSquarePlus as LucideMockMsg,
} from 'lucide-react';
import { useMockFeed, type NewItemMarker } from '@/app/_components/MockFeedContext';
import { isImageAvatar } from '@/lib/avatar';

type PanelId = 'alert' | 'wallet' | null;

/* ═══ 图标 —— lucide-react 组件（B5 阶段统一替换） ═══ */

const Icons = {
  alert: <LucideBell size={20} strokeWidth={1.8} />,
  wallet: <LucideWallet size={20} strokeWidth={1.8} />,
  note: <LucideNote size={20} strokeWidth={1.8} />,
  post: <LucidePost size={20} strokeWidth={1.8} />,
  gear: <LucideGear size={20} strokeWidth={1.8} />,
  top: <LucideTop size={20} strokeWidth={1.8} />,
  mock: <LucideMockMsg size={20} strokeWidth={1.8} />,
};

/* ═══ 导航项定义 ═══ */

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  /** 是否由 useMockFeed 动态提供 badge（否则用静态 badge 初始值） */
  dynamicBadgeFrom?: 'alert';
  /** 静态 badge 初始值（用于未挂 Provider 的兜底） */
  badgeStatic?: number;
  href?: string; // 有 href：点击直接跳转；无 href：打开 Drawer 面板
}

const NAV_ITEMS: NavItem[] = [
  { id: 'alert',  label: 'Alerts',   icon: Icons.alert,  dynamicBadgeFrom: 'alert', badgeStatic: 3 },
  // —— 钱包：点击直接跳转 /wallet（充值/提现页面）
  { id: 'wallet', label: 'Wallet',   icon: Icons.wallet, href: '/wallet' },
  { id: 'note',   label: 'Notes',    icon: Icons.note,   href: '/notes' },
  { id: 'post',   label: 'Post',    icon: Icons.post,   href: '/community/tiebas/explore' },
  // —— 设置：跳转设置中心（X 模式重构后的 /settings）
  { id: 'gear',   label: 'Settings', icon: Icons.gear,   href: '/settings' },
  // —— 模拟推送（点一下推一条通知或站内信，长按跳菜单关闭自动推送）
  { id: 'mock',   label: 'Simulate new message', icon: Icons.mock },
];

/* ═══════════════════════════════════════════════════════════════
   子组件 —— 通知项 / 消息项 / 交易项 / 分类项
   ═══════════════════════════════════════════════════════════════ */

/** 通知事件项 —— 用户头像 + 用户 + 动作 + 目标/金额 + 未读指示
 *
 *  Bug 修复：
 *    - 用户头像原本直接 next/image 传入字母徽章字符串 / 不存在的 /images/demo/*.jpg
 *      → new URL() 抛 "Invalid URL" + 404。现在用 isImageAvatar 双路判断。
 *  Mock 推送增强：
 *    - 传入 newMarkers，若 (alert.id in markers) 则显示新推送高亮（2.4s 自动消失）
 */
function AlertRow({
  alert,
  newMarkers,
}: {
  alert: AlertItem & { id?: string };
  newMarkers: NewItemMarker[];
}) {
  const isSystem = alert.type === 'system' || alert.avatar === 'LOGO';
  const userName = isSystem ? alert.user : `@${alert.user}`;
  const useImgAvatar = !isSystem && isImageAvatar(alert.avatar);
  const isNew = alert.id && newMarkers.some((m) => m.kind === 'alert' && m.id === alert.id);

  return (
    <div className={`gh-evt${alert.read ? '' : ' is-unread'}${isNew ? ' is-new' : ''}`}>
      {/* 系统通知：六边形 G 徽标；用户通知：字母徽章（或真实图片） */}
      {isSystem ? (
        <div className="gh-evt-avatar gh-evt-avatar-system">
          <div className="logo-hex">G</div>
        </div>
      ) : (
        <div
          className="gh-evt-avatar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: useImgAvatar ? 'var(--surface-overlay)' : 'var(--gold-subtle)',
          }}
        >
          {useImgAvatar ? (
            <Image
              src={alert.avatar}
              alt=""
              width={32}
              height={32}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <span
              className="font-display"
              style={{
                color: 'var(--gold)',
                fontWeight: 800,
                fontSize: alert.avatar.length >= 3 ? 11 : 14,
                lineHeight: 1,
                letterSpacing: 0.2,
                userSelect: 'none',
              }}
            >
              {alert.avatar}
            </span>
          )}
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
        {alert.image && isImageAvatar(alert.image) && (
          <div className="gh-evt-image" style={{ position: 'relative', width: '100%' }}>
            <Image
              src={alert.image}
              alt={alert.imageAlt || ''}
              fill
              unoptimized
              style={{ aspectRatio: '16 / 9', objectFit: 'cover' }}
            />
          </div>
        )}
      </div>
      {/* 未读小圆点 */}
      {!alert.read && <div className="gh-evt-icon" aria-label="unread" />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SideNav 主组件
   ═══════════════════════════════════════════════════════════════ */
export default function SideNav() {
  const { message } = App.useApp();
  const feed = useMockFeed();

  const [visible, setVisible] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelId>(null);
  const walletNumRef = useRef<HTMLSpanElement>(null);

  // 「模拟新消息」按钮：是否启用自动 30s 推送；默认启用
  const [autoPushEnabled, setAutoPushEnabled] = useState(true);

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

  // 自动推送开关同步到 Context
  useEffect(() => {
    feed.setAutoPushInterval(autoPushEnabled ? 30_000 : 0);
  }, [feed, autoPushEnabled]);

  // ESC 关闭逻辑已由 antd Drawer 内置，无需手动监听

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

  /** 打开/关闭面板，同时清除对应未读 */
  const openPanel = useCallback(
    (id: PanelId) => {
      setActivePanel((cur) => (cur === id ? null : id));
      if (id === 'alert') feed.markAllAlertsRead();
    },
    [feed],
  );

  /** 模拟推一条 —— 触发后弹出 Toast 说明本次推送内容 */
  const triggerMockPush = useCallback(() => {
    const { kind, summary } = feed.pushRandom();
    message.success(
      {
        content: summary,
        className: 'meta-hud-mono',
        style: { marginBottom: 12, fontSize: 12 },
      },
      2.2,
    );
    // 同时如果开了对应面板 → 清除未读
    if (kind === 'alert' && activePanel === 'alert') feed.markAllAlertsRead();
  }, [feed, activePanel, message]);

  /** 回到顶部 */
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 通知列表（优先 MockFeed；没挂 Provider 则用静态 ALERTS）
  const sideAlerts: (AlertItem & { id?: string })[] =
    feed.alerts?.length ? feed.alerts : ALERTS;

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
          // 动态 badge：优先用 MockFeed，没有则兜底静态
          let badge: number = 0;
          if (item.dynamicBadgeFrom) {
            const n =
              item.dynamicBadgeFrom === 'alert'
                ? feed.unreadAlertCount
                : feed.unreadChatCount;
            badge = Number.isFinite(n) ? n : item.badgeStatic ?? 0;
          } else {
            badge = item.badgeStatic ?? 0;
          }

          const cls = `gh-side-nav-item${activePanel === item.id ? ' is-panel-open' : ''}${
            item.id === 'mock' ? ' gh-side-nav-item-mock' : ''
          }`;

          // —— 「模拟新消息」特殊按钮
          if (item.id === 'mock') {
            return (
              <Tooltip
                key={item.id}
                title={
                  autoPushEnabled
                    ? 'Click: push a new alert/DM right now ·  Auto: every 30s ON'
                    : 'Click: push a new alert/DM right now ·  Auto: OFF'
                }
                placement="left"
              >
                <Button
                  type="text"
                  className={cls}
                  data-nav={item.id}
                  aria-label={item.label}
                  onClick={triggerMockPush}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setAutoPushEnabled((v) => !v);
                    message.info(
                      autoPushEnabled
                        ? 'Auto 30s push OFF'
                        : 'Auto 30s push ON',
                      1.8,
                    );
                  }}
                  style={{
                    padding: 0,
                    color: '#9D8CFF',
                  }}
                >
                  {item.icon}
                  {autoPushEnabled ? (
                    <span
                      className="gh-side-nav-pulse"
                      aria-label="auto-push-on"
                    />
                  ) : null}
                </Button>
              </Tooltip>
            );
          }

          // 带 href 的项渲染为链接（笔记→/notes，设置→/settings）
          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cls}
                data-nav={item.id}
                aria-label={item.label}
              >
                {item.icon}
                {badge ? (
                  <span
                    className={`gh-side-nav-badge${badge >= 3 ? ' is-pulse' : ''}`}
                  >
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          }
          return (
            <Button
              key={item.id}
              type="text"
              className={cls}
              data-nav={item.id}
              aria-label={item.label}
              onClick={() => openPanel(item.id as PanelId)}
              style={{ padding: 0 }}
            >
              {item.icon}
              {/* 通知徽章（≥3 时脉冲） */}
              {badge ? (
                <span
                  className={`gh-side-nav-badge${badge >= 3 ? ' is-pulse' : ''}`}
                >
                  {badge}
                </span>
              ) : null}
            </Button>
          );
        })}

        {/* 分隔线 + 回到顶部 */}
        <div className="gh-side-nav-divider" />
        <Button
          type="text"
          className="gh-side-nav-item gh-side-nav-top"
          id="ghSideNavTop"
          aria-label="Back to top"
          onClick={scrollToTop}
          style={{ padding: 0, width: 'auto', height: 'auto' }}
        >
          {Icons.top}
        </Button>
      </div>

      {/* ── 弹出面板组 ── */}
      <div className="gh-side-panels" id="ghSidePanels">
        {/* 通知面板 —— 页脚加「查看全部通知」链接（→ /settings/notifications） */}
        <SidePanel
          isOpen={activePanel === 'alert'}
          title="Notifications"
          onClose={() => setActivePanel(null)}
          data-panel="alert"
          ariaLabel="Notifications"
        >
          {sideAlerts.map((alert, i) => (
            <AlertRow
              key={alert.id ?? i}
              alert={alert}
              newMarkers={feed.newMarkers}
            />
          ))}
          <Link
            href="/settings/notifications"
            className="meta-hud-mono"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '10px 14px',
              margin: '10px -16px -16px',
              color: 'var(--gold)',
              background: 'rgba(157, 140, 255, 0.04)',
              borderTop: '1px solid var(--border-subtle)',
              textDecoration: 'none',
              fontSize: 11,
              letterSpacing: '0.04em',
            }}
          >
            See all notifications →
          </Link>
        </SidePanel>

        {/* 钱包面板 —— Deposit / Withdraw 跳转到 /wallet 对应 tab；页脚加「打开钱包」链接 */}
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
          {/* 操作按钮 —— 跳 /wallet 充值/提现 tab */}
          <div className="gh-wallet-actions">
            <Link
              href="/wallet?tab=deposit"
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                padding: '6px 12px',
                borderRadius: 3,
                background: 'linear-gradient(180deg, rgba(212,175,55,0.95), rgba(168,140,38,0.95))',
                color: '#1a1708',
                fontWeight: 700,
                fontSize: 12,
                textDecoration: 'none',
                border: '1px solid rgba(212,175,55,0.5)',
                letterSpacing: '0.02em',
              }}
              className="meta-hud-mono"
            >
              Deposit
            </Link>
            <Link
              href="/wallet?tab=withdraw"
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                padding: '6px 12px',
                borderRadius: 3,
                background: 'transparent',
                color: 'var(--text)',
                fontWeight: 600,
                fontSize: 12,
                textDecoration: 'none',
                border: '1px solid var(--border)',
                letterSpacing: '0.02em',
              }}
              className="meta-hud-mono"
            >
              Withdraw
            </Link>
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
          <Link
            href="/wallet"
            className="meta-hud-mono"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '10px 14px',
              margin: '10px -16px -16px',
              color: 'var(--gold)',
              background: 'rgba(157, 140, 255, 0.04)',
              borderTop: '1px solid var(--border-subtle)',
              textDecoration: 'none',
              fontSize: 11,
              letterSpacing: '0.04em',
            }}
          >
            Open full wallet →
          </Link>
        </SidePanel>

        {/* 遮罩层已由 antd Drawer 内置，无需单独渲染 */}
      </div>
    </>
  );
}

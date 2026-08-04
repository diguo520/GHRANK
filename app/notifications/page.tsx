/**
 * Notifications —— 全屏提醒列表页
 *
 * 复用 SideNav 的 gh-evt 样式，支持分类筛选、标记已读、清空全部。
 */
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SettingsShell from '../settings/_components/SettingsShell';
import { panelStyle } from '../settings/_components/SettingsForm';
import { BellIcon, CheckIcon, TrashIcon } from '../_components/icons';

/* ═══ 类型与初始数据 ═══ */

type AlertType = 'tip' | 'like' | 'follow' | 'system';

interface AlertItem {
  id: string;
  type: AlertType;
  user: string;
  avatar: string;
  action: string;
  target?: string;
  amount?: string;
  time: string;
  read: boolean;
  image?: string;
  imageAlt?: string;
}

type FilterValue = AlertType | 'all' | 'unread';

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'tip', label: 'Tips' },
  { value: 'like', label: 'Likes' },
  { value: 'follow', label: 'Follows' },
  { value: 'system', label: 'System' },
];

const INITIAL_ALERTS: AlertItem[] = [
  { id: '1', type: 'tip', user: 'alexshader', avatar: '/images/demo/prompt_1.jpg', action: 'tipped your prompt', target: 'Cinematic Portrait Generator', amount: '50 GHR', time: '2m', read: false },
  { id: '2', type: 'like', user: 'kairos', avatar: '/images/demo/prompt_2.jpg', action: 'liked your repo analysis', target: 'facebook/react', time: '15m', read: false },
  { id: '3', type: 'follow', user: 'nova_dev', avatar: '/images/demo/prompt_3.jpg', action: 'started following you', time: '1h', read: false },
  { id: '4', type: 'system', user: 'GHRANK', avatar: 'LOGO', action: 'announced a new milestone: 12,847 repos now tracked on the platform', time: '2h', read: false },
  { id: '5', type: 'system', user: 'GHRANK', avatar: 'LOGO', action: 'Hackathon 2026 is live — build agent integrations and win from $50K in prizes.', time: '45m', read: false, image: '/images/demo/prompt_7.jpg', imageAlt: 'GHRANK Hackathon 2026 banner' },
  { id: '6', type: 'tip', user: 'byteforge', avatar: '/images/demo/prompt_5.jpg', action: 'tipped your prompt', target: 'SEO Blog Writer Pro', amount: '20 GHR', time: '3h', read: true },
  { id: '7', type: 'like', user: 'pixelwitch', avatar: '/images/demo/prompt_4.jpg', action: 'liked your prompt', target: 'Neon Cyberpunk City', time: '5h', read: true },
  { id: '8', type: 'follow', user: 'code_sage', avatar: '/images/demo/prompt_6.jpg', action: 'started following you', time: '1d', read: true },
];

/* ═══ 子组件 ═══ */

/** 单条提醒 —— 复用 globals.css 的 gh-evt 系列类名 */
function NotificationRow({ alert, onToggleRead }: { alert: AlertItem; onToggleRead: (id: string) => void }) {
  const isSystem = alert.type === 'system' || alert.avatar === 'LOGO';
  const userName = isSystem ? alert.user : `@${alert.user}`;

  return (
    <div className={`gh-evt${alert.read ? '' : ' is-unread'}`}>
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
        {(alert.target || alert.amount) && (
          <div className="gh-evt-meta">
            {alert.target && <span className="gh-evt-target">{alert.target}</span>}
            {alert.amount && <span className="gh-evt-amount">{alert.amount}</span>}
          </div>
        )}
        {alert.image && (
          <div className="gh-evt-image" style={{ position: 'relative', width: '100%' }}>
            <Image src={alert.image} alt={alert.imageAlt || ''} fill style={{ aspectRatio: '16 / 9', objectFit: 'cover' }} />
          </div>
        )}
      </div>
      {!alert.read && <div className="gh-evt-icon" aria-label="unread" />}
      <button
        type="button"
        onClick={() => onToggleRead(alert.id)}
        title={alert.read ? 'Mark unread' : 'Mark read'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          marginLeft: '6px',
          flexShrink: 0,
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: '3px',
          color: 'var(--text-dim)',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--gold)';
          e.currentTarget.style.color = 'var(--gold)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-dim)';
        }}
      >
        <CheckIcon size={14} />
      </button>
    </div>
  );
}

/* ═══ 主页面 ═══ */

export default function NotificationsPage() {
  const [filter, setFilter] = useState<FilterValue>('all');
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  const unreadCount = useMemo(() => alerts.filter((a) => !a.read).length, [alerts]);

  const filtered = useMemo(() => {
    if (filter === 'all') return alerts;
    if (filter === 'unread') return alerts.filter((a) => !a.read);
    return alerts.filter((a) => a.type === filter);
  }, [alerts, filter]);

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const clearAll = () => {
    setAlerts([]);
  };

  const toggleRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: !a.read } : a)));
  };

  return (
    <SettingsShell
      title="Notifications"
      subtitle="Track tips, likes, follows, and platform updates in one place."
    >
      <div>
        <section style={{ ...panelStyle, padding: '8px 24px 18px' }}>
          {/* 工具栏 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '16px 0',
              borderBottom: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {FILTERS.map((f) => {
                const isActive = filter === f.value;
                const isUnreadFilter = f.value === 'unread';
                const count = isUnreadFilter
                  ? unreadCount
                  : f.value === 'all'
                    ? alerts.length
                    : alerts.filter((a) => a.type === f.value).length;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFilter(f.value)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: isActive ? 'rgba(245, 197, 24, 0.08)' : 'transparent',
                      border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border)'}`,
                      borderRadius: '3px',
                      color: isActive ? 'var(--gold)' : 'var(--text-dim)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {f.label}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '18px',
                        height: '18px',
                        padding: '0 5px',
                        borderRadius: '9px',
                        background: isActive ? 'var(--gold)' : 'var(--border)',
                        color: isActive ? 'var(--bg)' : 'var(--text-dim)',
                        fontSize: '10px',
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={markAllRead}
                disabled={unreadCount === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                  color: unreadCount === 0 ? 'var(--text-muted)' : 'var(--text-dim)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (unreadCount === 0) return;
                  e.currentTarget.style.borderColor = 'var(--gold)';
                  e.currentTarget.style.color = 'var(--gold)';
                }}
                onMouseLeave={(e) => {
                  if (unreadCount === 0) return;
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-dim)';
                }}
              >
                <CheckIcon size={14} />
                Mark All Read
              </button>
              <button
                type="button"
                onClick={clearAll}
                disabled={alerts.length === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                  color: alerts.length === 0 ? 'var(--text-muted)' : 'var(--text-dim)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  cursor: alerts.length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (alerts.length === 0) return;
                  e.currentTarget.style.borderColor = 'var(--danger)';
                  e.currentTarget.style.color = 'var(--danger)';
                }}
                onMouseLeave={(e) => {
                  if (alerts.length === 0) return;
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-dim)';
                }}
              >
                <TrashIcon size={14} />
                Clear All
              </button>
            </div>
          </div>

          {/* 列表 */}
          {filtered.length > 0 ? (
            filtered.map((alert) => <NotificationRow key={alert.id} alert={alert} onToggleRead={toggleRead} />)
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '56px 0',
                textAlign: 'center',
              }}
            >
              <BellIcon size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  marginBottom: '6px',
                }}
              >
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>
                When someone tips, likes, or follows you, it will show up here.
              </p>
              <Link
                href="/settings/preferences"
                style={{
                  marginTop: '18px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--gold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  textDecoration: 'none',
                }}
              >
                Manage notification preferences →
              </Link>
            </div>
          )}
        </section>
      </div>
    </SettingsShell>
  );
}

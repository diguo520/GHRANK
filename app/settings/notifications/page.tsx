/**
 * Notifications —— 站点通知与系统消息
 *
 * 展示所有网站通知（系统 / 互动 / 财务），支持分类筛选与一键已读。
 */
'use client';

import { useState, useEffect } from 'react';
import type { CSSProperties, ComponentType } from 'react';
import { Tag, Badge, Button } from 'antd';
import SettingsShell from '../_components/SettingsShell';
import { panelStyle } from '../_components/SettingsForm';
import { useMockFeed } from '@/app/_components/MockFeedContext';
import type { AlertItem } from '@/lib/data/sidenav-data';
import {
  BellIcon,
  HeartIcon,
  MessageIcon,
  UserIcon,
  CoffeeIcon,
  TrophyIcon,
} from '@/components/shared/icons';

/* ═══════════════════════════════════════════════════════════════
   类型定义
   ═══════════════════════════════════════════════════════════════ */

type NotificationCategory =
  | 'system'
  | 'like'
  | 'comment'
  | 'follow'
  | 'tip'
  | 'purchase';

type FilterType = 'all' | 'system' | 'interaction' | 'financial';

interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  timeAgo: string;
  unread: boolean;
}

interface CategoryMeta {
  color: string;
  label: string;
  Icon: ComponentType<{ size?: number; style?: CSSProperties }>;
  filter: FilterType;
}

/* ═══════════════════════════════════════════════════════════════
   常量配置：分类元数据、筛选项、初始数据
   ═══════════════════════════════════════════════════════════════ */

// 按类型映射颜色 / 图标 / 标签 / 所属筛选维度
const categoryMeta: Record<NotificationCategory, CategoryMeta> = {
  system: { color: 'var(--cyan)', label: 'System', Icon: BellIcon, filter: 'system' },
  like: { color: 'var(--pink)', label: 'Likes', Icon: HeartIcon, filter: 'interaction' },
  comment: { color: 'var(--pink)', label: 'Comments', Icon: MessageIcon, filter: 'interaction' },
  follow: { color: 'var(--pink)', label: 'Follows', Icon: UserIcon, filter: 'interaction' },
  tip: { color: 'var(--gold)', label: 'Tips', Icon: CoffeeIcon, filter: 'financial' },
  purchase: { color: 'var(--gold)', label: 'Purchases', Icon: TrophyIcon, filter: 'financial' },
};

const filters: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'system', label: 'System' },
  { value: 'interaction', label: 'Interaction' },
  { value: 'financial', label: 'Financial' },
];

const initialNotifications: Notification[] = [
  {
    id: '1',
    category: 'system',
    title: 'System Maintenance Notice',
    description: 'The platform will undergo routine maintenance tonight at 23:00, expected to last 30 minutes. Please save your work in advance.',
    timeAgo: '10 minutes ago',
    unread: true,
  },
  {
    id: '2',
    category: 'like',
    title: 'Alex Shader liked your work',
    description: 'Liked your content in "Cyberpunk City Nightscape".',
    timeAgo: '2 hours ago',
    unread: true,
  },
  {
    id: '3',
    category: 'comment',
    title: 'Kairos commented on your post',
    description: 'Great insights! I would like to add some thoughts on the third point...',
    timeAgo: '5 hours ago',
    unread: false,
  },
  {
    id: '4',
    category: 'follow',
    title: 'Nova Dev followed you',
    description: 'Started following your updates, looking forward to more of your work.',
    timeAgo: '1 day ago',
    unread: true,
  },
  {
    id: '5',
    category: 'tip',
    title: 'Byte Forge tipped you',
    description: 'Your article "React Architecture Practices" received a 50 credit tip.',
    timeAgo: '2 days ago',
    unread: false,
  },
  {
    id: '6',
    category: 'purchase',
    title: 'Pro membership activated',
    description: 'Your Pro membership has been successfully activated, valid for 365 days.',
    timeAgo: '3 days ago',
    unread: false,
  },
];

/** 将 MockFeed 中的 AlertItem 映射为 Notification，新增条目会被 newMarkers 识别为「新高亮」 */
function alertToNotification(a: AlertItem & { id?: string }): Notification {
  const id = a.id ?? `alert-${a.time}-${Math.random().toString(36).slice(2, 7)}`;
  switch (a.type) {
    case 'system':
      return {
        id,
        category: 'system',
        title: a.target || a.action,
        description: a.action,
        timeAgo: a.time,
        unread: !a.read,
      };
    case 'like':
      return {
        id,
        category: 'like',
        title: `@${a.user} liked your work`,
        description: a.target || 'Left a like on your post.',
        timeAgo: a.time,
        unread: !a.read,
      };
    case 'follow':
      return {
        id,
        category: 'follow',
        title: `@${a.user} followed you`,
        description: a.target || 'Started following your updates, looking forward to more of your work.',
        timeAgo: a.time,
        unread: !a.read,
      };
    case 'tip':
      return {
        id,
        category: 'tip',
        title: `@${a.user} tipped you`,
        description: a.target || 'Received a credit tip.',
        timeAgo: a.time,
        unread: !a.read,
      };
    case 'comment':
    default:
      return {
        id,
        category: 'comment',
        title: `@${a.user} commented on your post`,
        description: a.target || a.action,
        timeAgo: a.time,
        unread: !a.read,
      };
  }
}

/* ═══════════════════════════════════════════════════════════════
   通知行 —— 单条通知的可点击卡片
   ═══════════════════════════════════════════════════════════════ */

interface NotificationRowProps {
  item: Notification;
  onClick: (id: string) => void;
  isNew?: boolean;
}

function NotificationRow({ item, onClick, isNew }: NotificationRowProps) {
  const { color, label, Icon } = categoryMeta[item.category];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(item.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick(item.id);
      }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px',
        border: `1px solid ${isNew ? 'rgba(157, 140, 255, 0.55)' : 'var(--border-subtle)'}`,
        borderRadius: '4px',
        background: isNew ? 'rgba(157, 140, 255, 0.06)' : 'var(--surface)',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s, box-shadow 0.3s',
        boxShadow: isNew ? '0 0 0 2px rgba(157, 140, 255, 0.12), 0 12px 30px -16px rgba(157, 140, 255, 0.6)' : 'none',
        animation: isNew ? 'push-in 0.42s cubic-bezier(.2,.8,.2,1)' : 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--gold)';
        e.currentTarget.style.background = 'var(--surface-overlay)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isNew ? 'rgba(157, 140, 255, 0.55)' : 'var(--border-subtle)';
        e.currentTarget.style.background = isNew ? 'rgba(157, 140, 255, 0.06)' : 'var(--surface)';
      }}
    >
      {/* 图标圆圈 + 未读小金点 */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: `1px solid ${color}`,
            color,
            background: 'var(--bg)',
          }}
        >
          <Icon size={18} />
        </div>
        {item.unread && (
          <div style={{ position: 'absolute', top: '-2px', right: '-2px' }}>
            <Badge color="var(--gold)" />
          </div>
        )}
      </div>

      {/* 标题 + 类型标签 + 描述 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '4px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            {item.title}
          </span>
          <Tag
            bordered={false}
            style={{
              color,
              border: `1px solid ${color}`,
              background: 'transparent',
              borderRadius: '2px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: 0,
              padding: '0 6px',
              lineHeight: '18px',
            }}
          >
            {label}
          </Tag>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--text-dim)',
            lineHeight: 1.5,
          }}
        >
          {item.description}
        </div>
      </div>

      {/* 时间戳 */}
      <div
        style={{
          flexShrink: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
        }}
      >
        {item.timeAgo}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   筛选标签条
   ═══════════════════════════════════════════════════════════════ */

interface FilterTabsProps {
  active: FilterType;
  onChange: (value: FilterType) => void;
  unreadCount: number;
}

function FilterTabs({ active, onChange, unreadCount }: FilterTabsProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {filters.map((f) => {
        const isActive = active === f.value;
        return (
          <button
            key={f.value}
            type="button"
            onClick={() => onChange(f.value)}
            style={{
              padding: '6px 14px',
              background: isActive ? 'rgba(157, 140, 255, 0.08)' : 'transparent',
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
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--gold)';
                e.currentTarget.style.color = 'var(--gold)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-dim)';
              }
            }}
          >
            {f.label}
          </button>
        );
      })}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginLeft: '4px',
        }}
      >
        {unreadCount > 0 ? `${unreadCount} unread` : 'No unread'}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   通知页面
   ═══════════════════════════════════════════════════════════════ */

export default function NotificationsPage() {
  const feed = useMockFeed();
  const [filter, setFilter] = useState<FilterType>('all');
  const [localUnread, setLocalUnread] = useState<Record<string, boolean>>({});

  // 初始通知用 initialNotifications 静态数据；动态 push 进来的用 feed.alerts
  // 合并策略：以 feed.alerts 优先（它们都有 id），再 append 静态 fallback（如果 id 不存在）
  const base: Notification[] =
    feed.alerts?.length
      ? feed.alerts.map(alertToNotification)
      : initialNotifications;

  // 合并 local 单条已读与 feed.markAlertRead
  const notifications = base.map((n) => ({
    ...n,
    unread: localUnread[n.id] === false ? false : n.unread,
  }));

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    return categoryMeta[n.category].filter === filter;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  // 打开页面时如果 feed 正在 auto-push，顺手也把 auto-push 开启（保持默认 30s）
  useEffect(() => {
    // 保证不会重复开启：已经开启则维持原间隔，否则默认 30s
    if (feed.currentAutoPushIntervalMs === 0) {
      feed.setAutoPushInterval(30_000);
    }
  }, [feed]);

  // 一键全部标记为已读
  const handleMarkAllRead = () => {
    feed.markAllAlertsRead();
    // 同时本地合并：避免 fallback 静态数据没被 Context 影响
    const merged: Record<string, boolean> = {};
    notifications.forEach((n) => {
      merged[n.id] = false;
    });
    setLocalUnread(merged);
  };

  // 点击单条通知后标记为已读
  const handleClickItem = (id: string) => {
    // 若对应一条 Context.alert → 调用 Context 的方法（这样侧栏红点也同步）
    feed.markAlertRead(id);
    setLocalUnread((prev) => ({ ...prev, [id]: false }));
  };

  const newIds = new Set(
    feed.newMarkers.filter((m) => m.kind === 'alert').map((m) => m.id),
  );

  return (
    <SettingsShell title="Notifications" subtitle="View all site notifications and system messages">
      <section style={{ ...panelStyle, padding: '8px 24px 18px' }}>
        {/* 顶部工具栏：筛选标签 + 全部已读按钮 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '16px 0',
            borderBottom: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
          }}
        >
          <FilterTabs active={filter} onChange={setFilter} unreadCount={unreadCount} />

          <Button
            type="text"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: unreadCount > 0 ? 'var(--gold)' : 'var(--text-muted)',
              height: '32px',
              padding: '0 12px',
            }}
          >
            Mark all as read
          </Button>
        </div>

        {/* 通知列表 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingTop: '16px',
          }}
        >
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                onClick={handleClickItem}
                isNew={newIds.has(item.id)}
              />
            ))
          ) : (
            <div
              style={{
                padding: '40px 0',
                textAlign: 'center',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}
            >
              No notifications.
            </div>
          )}
        </div>
      </section>
    </SettingsShell>
  );
}

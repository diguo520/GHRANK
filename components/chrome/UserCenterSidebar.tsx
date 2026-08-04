'use client';

import { cloneElement, CSSProperties, ReactElement, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useIsLoggedIn } from '@/app/_hooks/useIsLoggedIn';
import { useAppEvent } from '@/app/_context/AppEventContext';
import { safeStorage } from '@/lib/safeStorage';
import { STORAGE_KEYS } from '@/lib/constants';

/* ═══ 静态数据 —— 定义在组件外部避免每次渲染重建 ═══ */

/** 导航项类型 —— icon 需标注 props 泛型，React 19 cloneElement 类型更严格 */
interface NavEntry {
  label: string;
  href: string;
  icon: ReactElement<{ style?: CSSProperties }>;
}

/** 账户导航项 */
const ACCOUNT_NAV: NavEntry[] = [
  {
    label: 'Profile',
    href: '/profile',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="8" cy="5" r="3" />
        <path d="M2 14c0-3 3-5 6-5s6 2 6 5" />
      </svg>
    ),
  },
  {
    label: 'My Prompts',
    href: '/my-prompts',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M3 2h7l3 3v9H3V2z" />
        <path d="M10 2v3h3" />
      </svg>
    ),
  },
  {
    label: 'Purchases',
    href: '/purchases',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z" />
      </svg>
    ),
  },
  {
    label: 'Billing',
    href: '/billing',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="4" width="12" height="9" rx="1" />
        <path d="M2 7h12" />
      </svg>
    ),
  },
];

/** 偏好设置导航项 */
const PREFERENCES_NAV: NavEntry[] = [
  {
    label: 'Settings',
    href: '/settings',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="8" cy="8" r="2.5" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" />
      </svg>
    ),
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M8 2C5 2 3 4 3 7c0 2 1 3 1 4M8 2c3 0 5 2 5 5 0 2-1 3-1 4M6 11h4M7 13h2" />
      </svg>
    ),
  },
  {
    label: 'History',
    href: '/history',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4v4l3 2" />
      </svg>
    ),
  },
];

/** 笔记本预览数据 */
const NOTEBOOKS = [
  { title: 'Cinematic lighting notes', preview: '--s 750 gives best film stock look for portraits. Combine with --style raw for...' },
  { title: 'Color grading refs', preview: 'Teal-orange split tone works best. Avoid --q 1 for client work, stick to...' },
];

/** 统计三联数据 */
const STATS = [
  { value: '142', label: 'Prompts' },
  { value: '2.4K', label: 'Followers' },
  { value: '89', label: 'Following' },
];

/* ═══ 样式常量 ═══ */

const sectionTitleStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  letterSpacing: '2px',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  marginBottom: 'var(--sp-2)',
};

const navItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--sp-3)',
  padding: 'var(--sp-2) var(--sp-3)',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--text-dim)',
  borderRadius: '4px',
  transition: 'all 0.2s ease',
};

/* ═══════════════════════════════════════════════════════════════
   子组件 —— 导航项、笔记本卡片、统计项
   ═══════════════════════════════════════════════════════════════ */

/** 导航项 —— 图标 + 标签，悬停金色高亮 */
function SidebarNavItem({ entry }: { entry: NavEntry }) {
  return (
    <Link
      href={entry.href}
      className="rounded-sm transition-all duration-200 hover:text-[var(--gold)] hover:bg-[var(--surface-overlay)]"
      style={navItemStyle}
    >
      {/* cloneElement 注入尺寸样式，保留原始 SVG 的 viewBox / stroke 等属性 */}
      {cloneElement(entry.icon, {
        style: { width: '16px', height: '16px', flexShrink: 0 },
      })}
      {entry.label}
    </Link>
  );
}

/** 笔记本预览卡片 */
function NotebookCard({ title, preview }: { title: string; preview: string }) {
  return (
    <div
      className="rounded-sm cursor-pointer transition-colors duration-200 hover:border-[var(--gold)] mb-2"
      style={{
        padding: 'var(--sp-3)',
        background: 'var(--surface-overlay)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="mb-1"
        style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}
      >
        {title}
      </div>
      <div
        className="overflow-hidden"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {preview}
      </div>
    </div>
  );
}

/** 统计项 —— 数值 + 标签 */
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center rounded-sm" style={{ padding: 'var(--sp-2)', background: 'var(--surface-overlay)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold)' }}>
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   UserCenterSidebar —— 用户中心抽屉
   通过 AppEventContext 的 sidebarOpen 控制显示/隐藏
   ESC 关闭，退出登录清除 localStorage 并跳转 /login
   ═══════════════════════════════════════════════════════════════ */
export default function UserCenterSidebar() {
  const { userAvatar } = useIsLoggedIn();
  const { sidebarOpen, closeSidebar } = useAppEvent();

  useEffect(() => {
    /** ESC 关闭抽屉 */
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSidebar();
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [closeSidebar]);

  /** 退出登录 —— 清除 localStorage 并跳转登录页 */
  function logout() {
    safeStorage.remove(STORAGE_KEYS.LOGGED_IN);
    safeStorage.remove(STORAGE_KEYS.USER_AVATAR);
    closeSidebar();
    window.location.href = '/login';
  }

  const open = sidebarOpen;

  return (
    <>
      {/* 背景遮罩 —— 点击关闭 */}
      <div
        className="fixed inset-0 transition-opacity duration-[250ms]"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          cursor: open ? 'pointer' : 'default',
          zIndex: 150,
        }}
        onClick={closeSidebar}
      />

      {/* 侧边栏主体 —— 从右侧滑入 */}
      <aside
        className="fixed top-0 right-0 bottom-0 flex flex-col"
        style={{
          width: '340px',
          maxWidth: '90vw',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)',
          zIndex: 160,
        }}
      >
        {/* ── 头部：关闭按钮 + 用户资料 + 统计 ── */}
        <div className="relative" style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--border-subtle)' }}>
          {/* 关闭按钮 */}
          <button
            className="absolute flex items-center justify-center rounded-sm transition-all duration-200 hover:text-[var(--gold)] hover:bg-[var(--surface-overlay)]"
            style={{
              top: 'var(--sp-3)',
              right: 'var(--sp-3)',
              width: '28px',
              height: '28px',
              fontSize: '22px',
              color: 'var(--text-dim)',
              zIndex: 1,
            }}
            onClick={closeSidebar}
          >
            &times;
          </button>

          {/* 用户资料 */}
          <div className="flex items-center gap-3 mt-3">
            <div
              className="rounded-full overflow-hidden flex-shrink-0"
              style={{ width: '56px', height: '56px', border: '2px solid var(--gold)' }}
            >
              <Image src={userAvatar} alt="" width={56} height={56} className="w-full h-full object-cover" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
                AlexShader
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Top Seller
              </div>
            </div>
          </div>

          {/* 统计三联 */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {STATS.map((stat) => (
              <StatItem key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>

        {/* ── 主体：可滚动区域 ── */}
        <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--sp-4)' }}>
          {/* 账户导航 */}
          <div className="mb-6">
            <div style={sectionTitleStyle}>// Account</div>
            {ACCOUNT_NAV.map((entry) => (
              <SidebarNavItem key={entry.label} entry={entry} />
            ))}
          </div>

          {/* 笔记本预览 */}
          <div className="mb-6">
            <div style={sectionTitleStyle}>// Notebook</div>
            {NOTEBOOKS.map((nb) => (
              <NotebookCard key={nb.title} title={nb.title} preview={nb.preview} />
            ))}
          </div>

          {/* 偏好设置 */}
          <div className="mb-6">
            <div style={sectionTitleStyle}>// Preferences</div>
            {PREFERENCES_NAV.map((entry) => (
              <SidebarNavItem key={entry.label} entry={entry} />
            ))}
          </div>
        </div>

        {/* ── 底部：退出登录 ── */}
        <div style={{ padding: 'var(--sp-4)', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            className="w-full rounded-sm transition-all duration-200 hover:bg-[rgba(248,81,73,0.1)] hover:shadow-[0_0_12px_rgba(248,81,73,0.3)]"
            style={{
              padding: 'var(--sp-3)',
              background: 'transparent',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
            onClick={logout}
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

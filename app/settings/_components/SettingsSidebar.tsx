/**
 * SettingsSidebar —— 用户仪表盘左侧导航
 * 特性：Segmented 风格丝滑滑动指示器
 * 所有分组同时可见，选中项有平滑滑动背景 + 金色指示条
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  BarChart3 as LucideStats,
  Bell as LucideBell,
  User as LucideUser,
  CreditCard as LucideBilling,
  Coins as LucideCredits,
  Gift as LucideReferral,
  Lock as LucideLock,
  Shield as LucideShield,
  SlidersHorizontal as LucidePrefs,
  Bookmark as LucideBookmark,
  Heart as LucideHeart,
  ChevronRight as LucideChev,
  ShieldCheck as LucideShieldSmall,
  HelpCircle as LucideHelp,
} from 'lucide-react';

type MenuItem = {
  icon: ReactNode;
  label: string;
  hint?: string;
  href: string;
};
type MenuGroup = { heading: string; items: MenuItem[] };

const GROUPS: MenuGroup[] = [
  {
    heading: 'GENERAL',
    items: [
      { icon: <LucideStats size={15} strokeWidth={1.9} />, label: 'Statistics',    hint: 'Engagement + earnings', href: '/settings/stats' },
      { icon: <LucideBell size={15} strokeWidth={1.9} />,  label: 'Notifications', hint: 'Email, push, digest',   href: '/settings/notifications' },
      { icon: <LucideUser size={15} strokeWidth={1.9} />,  label: 'Your account',  hint: 'Profile details',      href: '/settings' },
    ],
  },
  {
    heading: 'WALLET & EARNINGS',
    items: [
      { icon: <LucideBilling size={15} strokeWidth={1.9} />,  label: 'Wallet (GHR)',     hint: 'Deposit / withdraw', href: '/wallet' },
      { icon: <LucideCredits size={15} strokeWidth={1.9} />,  label: 'Task Credits',  hint: 'Earn by tasks', href: '/settings/credits' },
      { icon: <LucideReferral size={15} strokeWidth={1.9} />, label: 'Referral Rewards',  hint: 'Invite, earn GHR', href: '/settings/referral' },
    ],
  },
  {
    heading: 'ACCOUNT',
    items: [
      { icon: <LucideLock size={15} strokeWidth={1.9} />,    label: 'Security',      hint: '2FA, sessions, passkeys', href: '/settings/security' },
      { icon: <LucideShield size={15} strokeWidth={1.9} />,  label: 'Privacy',       hint: 'Visibility, DMs, data',   href: '/settings/privacy' },
      { icon: <LucidePrefs size={15} strokeWidth={1.9} />,   label: 'Preferences',   hint: 'Theme, language, media',  href: '/settings/preferences' },
      { icon: <LucideBookmark size={15} strokeWidth={1.9} />,label: 'Bookmarks',     hint: 'Saved prompts + repos',   href: '/settings/bookmarks' },
      { icon: <LucideHeart size={15} strokeWidth={1.9} />,   label: 'Following',     hint: 'Creators, tiebas, tags',  href: '/settings/following' },
    ],
  },
];

export default function SettingsSidebar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [indicator, setIndicator] = useState<{ top: number; height: number }>({ top: 0, height: 0 });

  const activeHref = (() => {
    if (pathname === '/settings') return '/settings';
    const all = GROUPS.flatMap((g) => g.items.map((i) => i.href));
    return all
      .filter((href) => href !== '/settings' && pathname.startsWith(href))
      .sort((a, b) => b.length - a.length)[0] ?? '/settings';
  })();

  const updateIndicator = useCallback(() => {
    const el = itemRefs.current.get(activeHref);
    if (el && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = el.getBoundingClientRect();
      setIndicator({
        top: itemRect.top - navRect.top,
        height: itemRect.height,
      });
    }
  }, [activeHref]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const setItemRef = useCallback((href: string) => (el: HTMLAnchorElement | null) => {
    if (el) itemRefs.current.set(href, el);
    else itemRefs.current.delete(href);
  }, []);

  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '28px 18px 40px 26px',
      }}
    >
      {/* 大标题区 */}
      <div style={{ marginBottom: 18 }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="meta-hud-mono" style={{
            fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--text-muted)', marginBottom: 6,
          }}>
            / Home · GHRANK
          </div>
        </Link>
        <h1 className="font-display" style={{
          fontSize: 28, fontWeight: 800, color: 'var(--text)', margin: 0,
          letterSpacing: '-0.01em',
        }}>
          Settings
        </h1>
      </div>

      {/* 全分组列表 —— 带滑动指示器 */}
      <div
        ref={navRef}
        className="gh-sidebar-nav"
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          position: 'relative',
          overflowY: 'auto',
          paddingRight: '4px',
        }}
      >
        {/* 滑动指示器 */}
        <div
          className="gh-sidebar-nav-indicator"
          style={{
            top: indicator.top,
            height: indicator.height,
            left: '0px',
            right: '0px',
            background: 'rgba(157,140,255,0.08)',
          }}
        />

        {GROUPS.map((g) => (
          <div key={g.heading} style={{ position: 'relative', zIndex: 1 }}>
            <div className="meta-hud-mono" style={{
              fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--text-muted)', padding: '12px 8px 6px',
            }}>
              {g.heading}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {g.items.map((it) => {
                const active = activeHref === it.href;
                return (
                  <Link
                    key={it.href}
                    ref={setItemRef(it.href)}
                    href={it.href}
                    className="gh-sidebar-nav-item"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '9px 10px',
                      borderRadius: 8,
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'color 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    {/* 图标方块 */}
                    <span style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: active
                        ? 'linear-gradient(180deg, rgba(212,175,55,0.18), rgba(157,140,255,0.08))'
                        : 'var(--surface)',
                      border: '1px solid var(--border-subtle)',
                      color: active ? 'var(--gold)' : 'var(--text-dim)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'color 0.3s ease, background 0.3s ease, border-color 0.3s ease',
                    }}>
                      {it.icon}
                    </span>
                    {/* 标题 + 子说明 */}
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="font-display block" style={{
                        fontSize: 13.5, fontWeight: 700,
                        color: active ? 'var(--text)' : 'var(--text-dim)',
                        transition: 'color 0.3s ease',
                      }}>
                        {it.label}
                      </span>
                      {it.hint && (
                        <span className="meta-hud-mono block" style={{
                          fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2,
                        }}>
                          {it.hint}
                        </span>
                      )}
                    </span>
                    <span style={{
                      color: active ? 'var(--gold)' : 'transparent',
                      flexShrink: 0,
                      transition: 'color 0.3s ease',
                    }}>
                      <LucideChev size={14} strokeWidth={2.2} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 底部：安全提示 + 帮助 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
        <Link href="/settings/security" style={footBtn('var(--green)')}>
          <LucideShieldSmall size={14} strokeWidth={1.9} />
          <span className="font-display" style={{ fontSize: 12, fontWeight: 700 }}>Account is secure</span>
        </Link>
        <Link href="#help" style={footBtn('var(--text-dim)')}>
          <LucideHelp size={14} strokeWidth={1.9} />
          <span className="font-body" style={{ fontSize: 12 }}>Help center</span>
        </Link>
      </div>
    </aside>
  );
}

function footBtn(color: string): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 12px',
    borderRadius: 10,
    background: 'var(--surface)',
    border: '1px solid var(--border-subtle)',
    textDecoration: 'none',
    color,
  };
}

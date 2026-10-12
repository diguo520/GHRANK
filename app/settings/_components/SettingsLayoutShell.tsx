/**
 * SettingsLayoutShell —— X / Twitter Settings 模式三栏布局外壳
 *
 *  X 风格三栏骨架（同 /wallet 和 /messages）：
 *   ┌──── 260px ───┬────────── 1fr ──────────┬──── 320px ───┐
 *   │ Settings     │ Middle · 当前设置页     │ Right · 当前 │
 *   │ 分组导航     │ title + form            │ 账号预览卡片 │
 *   │              │                         │ 快捷链接     │
 *   └──────────────┴─────────────────────────┴──────────────┘
 *
 *  - 原 lobehub 的 grid-template-columns: 240px 1fr → 改为 260 1fr 320 三栏
 *  - 中栏（中间那一列）仍然渲染 children，所以子页面的 SettingsShell 结构完全不用改
 *  - 右栏是 shell 统一渲染的账号卡片 + 同组快捷方式，与中栏选中项无关（保持 X 的信息密度）
 *
 * 响应式：
 *  - < 1200px：隐藏右栏，保持 260 / 1fr
 *  - < 768px：隐藏左栏，只显示中栏（内容区）
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import SettingsSidebar from './SettingsSidebar';
import { USER_PROFILE } from '../../profile/_data/profile-data';
import { isImageAvatar } from '@/lib/avatar';
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn';
import {
  User as LucideUser,
  Bell as LucideBell,
  Shield as LucideShield,
  Eye as LucideEye,
  Wallet as LucideWallet,
  Download as LucideExport,
} from 'lucide-react';

export default function SettingsLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/settings';

  return (
    <main className="main-content" style={{
      maxWidth: 1480, margin: '0 auto',
      padding: '12px 24px 32px',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr 320px',
        minHeight: 'calc(100vh - 80px)',
      }} className="settings-layout-x">
        {/* LEFT · Settings 分组导航 */}
        <div className="x-settings-left">
          <SettingsSidebar />
        </div>

        {/* MIDDLE · 当前子页面 */}
        <div className="x-settings-middle" style={{
          minWidth: 0,
          padding: '24px 36px 40px',
        }}>
          {children}
        </div>

        {/* RIGHT · 账号预览 + 快捷链接 */}
        <aside className="x-settings-right" style={{
          padding: '24px 20px 32px',
        }}>
          <SettingsRightCard pathname={pathname} />
        </aside>
      </div>

      <style jsx global>{`
        @media (max-width: 1200px) {
          .settings-layout-x { grid-template-columns: 240px 1fr; }
          .x-settings-right { display: none; }
        }
        @media (max-width: 768px) {
          .settings-layout-x { grid-template-columns: 1fr; }
          .x-settings-left { display: none; }
        }
      `}</style>
    </main>
  );
}

/* ══════════════════════════════════════════════════════
   RIGHT 侧栏
   ══════════════════════════════════════════════════════ */

function SettingsRightCard({ pathname }: { pathname: string }) {
  // 头像统一走 useIsLoggedIn，与顶部导航栏 / 个人中心页保持同一数据源
  const { userAvatar } = useIsLoggedIn();
  const useImg = isImageAvatar(userAvatar);

  // 把当前 pathname 分组（影响右下角的同组链接）
  const group = (() => {
    if (['/settings/stats', '/settings/notifications', '/settings'].includes(pathname)) return 'general';
    if (['/settings/billing', '/settings/credits', '/settings/referral'].includes(pathname)) return 'wallet';
    return 'account';
  })();

  const sameGroupLinks =
    group === 'general' ? [
      { href: '/settings/stats',          label: 'Statistics',     glyph: <LucideUser size={14} strokeWidth={1.9} /> },
      { href: '/settings/notifications',  label: 'Notifications',  glyph: <LucideBell size={14} strokeWidth={1.9} /> },
      { href: '/settings',                label: 'Your account',   glyph: <LucideUser size={14} strokeWidth={1.9} /> },
    ] : group === 'wallet' ? [
      { href: '/wallet',             label: 'Wallet (GHR)',    glyph: <LucideWallet size={14} strokeWidth={1.9} />, external: true },
      { href: '/settings/credits',   label: 'Task Credits',   glyph: <LucideWallet size={14} strokeWidth={1.9} /> },
      { href: '/settings/referral',  label: 'Referral Rewards', glyph: <LucideExport size={14} strokeWidth={1.9} /> },
    ] : [
      { href: '/settings/security',    label: 'Security',    glyph: <LucideShield size={14} strokeWidth={1.9} /> },
      { href: '/settings/privacy',     label: 'Privacy',     glyph: <LucideEye size={14} strokeWidth={1.9} /> },
      { href: '/settings/preferences', label: 'Preferences', glyph: <LucideUser size={14} strokeWidth={1.9} /> },
    ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 账号卡片 */}
      <div style={{
        position: 'relative',
        padding: 18,
        borderRadius: 14,
        background: 'linear-gradient(160deg, rgba(212,175,55,0.12), rgba(157,140,255,0.08))',
        border: '1px solid rgba(212,175,55,0.35)',
        overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: -1,
          background: 'repeating-linear-gradient(135deg, rgba(212,175,55,0.07) 0 2px, transparent 2px 7px)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 56, height: 56, borderRadius: '50%',
                overflow: 'hidden',
                background: useImg ? 'var(--surface-overlay)' : 'var(--gold-subtle)',
                border: '2px solid rgba(212,175,55,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {useImg ? (
                // 原生 img 避免 next/image 布局问题
                <img
                  src={userAvatar}
                  alt={`${USER_PROFILE.displayName} avatar`}
                  referrerPolicy="no-referrer"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                <span className="font-display" style={{
                  color: 'var(--gold)', fontWeight: 800, lineHeight: 1,
                  fontSize: userAvatar.length >= 3 ? 18 : 24,
                }}>
                  {userAvatar}
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="font-display" style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>
                {USER_PROFILE.displayName}
              </div>
              <Link
                href="/profile"
                className="meta-hud-mono"
                style={{ fontSize: 11.5, color: 'var(--text-muted)', textDecoration: 'none' }}
              >
                @{USER_PROFILE.username} ↗
              </Link>
              <div className="font-body" style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.45 }}>
                {USER_PROFILE.bio}
              </div>
            </div>
          </div>

          {/* 快速数字 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14 }}>
            <MiniStat label="Followers" value={USER_PROFILE.stats.followers.toLocaleString()} />
            <MiniStat label="Following" value={USER_PROFILE.stats.following.toLocaleString()} />
            <MiniStat label="Prompts"   value={USER_PROFILE.stats.prompts.toLocaleString()} accent />
          </div>

          <Link
            href="/profile"
            style={{
              display: 'block', marginTop: 12,
              padding: '8px 10px', textAlign: 'center',
              borderRadius: 8,
              background: 'linear-gradient(180deg, rgba(212,175,55,0.95), rgba(168,140,38,0.95))',
              color: '#1a1708',
              border: '1px solid rgba(212,175,55,0.5)',
              textDecoration: 'none',
            }}
            className="meta-hud-mono"
          >
            View public profile →
          </Link>
        </div>
      </div>

      {/* 当前分组快捷方式 */}
      <div style={{
        padding: 14,
        borderRadius: 12,
        border: '1px solid var(--border-subtle)',
        background: 'var(--surface)',
      }}>
        <div className="meta-hud-mono" style={{
          fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'var(--text-muted)', marginBottom: 10,
        }}>
          IN THIS SECTION
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sameGroupLinks.map((l) => {
            const active = !l.external && pathname === l.href;
            const Wrapper: any = l.external
              ? ({ children }: any) => <Link href={l.href} className="inline-settings" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 8px', borderRadius: 6, background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'none' }}>{children}</Link>
              : ({ children }: any) => <Link href={l.href} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 8px', borderRadius: 6, background: active ? 'rgba(157,140,255,0.08)' : 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'none' }}>{children}</Link>;
            return (
              <Wrapper key={l.href}>
                <span style={{ color: 'var(--gold)', display: 'inline-flex' }}>{l.glyph}</span>
                <span className="font-display" style={{ fontSize: 12.5, fontWeight: 700, color: active ? 'var(--text)' : 'var(--text-dim)' }}>
                  {l.label}
                </span>
                {l.external && (
                  <span className="meta-hud-mono" style={{ fontSize: 9, marginLeft: 'auto', color: 'var(--gold)', padding: '2px 6px', borderRadius: 999, border: '1px solid rgba(212,175,55,0.4)' }}>NEW</span>
                )}
              </Wrapper>
            );
          })}
        </div>
      </div>

      {/* 会话迁移 / 导出提示 */}
      <div style={{
        padding: 14,
        borderRadius: 12,
        border: '1px solid var(--border-subtle)',
        background: 'var(--surface)',
      }}>
        <div className="font-display" style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
          Data portability
        </div>
        <p className="font-body" style={{ fontSize: 11.5, color: 'var(--text-dim)', margin: '0 0 10px', lineHeight: 1.45 }}>
          Download all your prompts, bookmarks and invoices as JSON.
        </p>
        <button
          type="button"
          style={{
            width: '100%', padding: '7px 10px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--gold)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 11, fontWeight: 700,
            cursor: 'pointer',
          }}
          className="meta-hud-mono"
        >
          <LucideExport size={13} strokeWidth={2} /> Export account data
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{
      padding: '8px 6px',
      borderRadius: 8,
      background: accent ? 'rgba(212,175,55,0.10)' : 'rgba(255,255,255,0.02)',
      border: '1px solid var(--border-subtle)',
      textAlign: 'center',
    }}>
      <div className="meta-hud-mono" style={{
        fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)',
      }}>{label}</div>
      <div className="font-display" style={{
        fontSize: 15, fontWeight: 800, color: accent ? 'var(--gold)' : 'var(--text)', marginTop: 2,
      }}>{value}</div>
    </div>
  );
}

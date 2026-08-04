/**
 * ProfileSidebar —— 个人主页右栏
 * 包含：快速操作 + 等级概览 + 精选成就 + 账户信息
 * 风格：EVE Online HUD，sticky 定位，六边形装饰
 */
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { HEX_CLIP_PATH } from '@/lib/constants';
import {
  USER_LEVEL_INFO,
  USER_ACHIEVEMENT_STATS,
  ACHIEVEMENT_DEFS,
  USER_ACHIEVEMENT_PROGRESS,
  RARITY_META,
} from '../../_data/achievements-data';
import {
  EditIcon, ShareIcon, SettingsIcon, TrophyIcon,
  CalendarIcon, MailIcon, UserIcon,
} from '../../_components/icons';

/* ── 等级概览卡片 ── */
function LevelOverview() {
  const info = USER_LEVEL_INFO;
  const { current, next, totalXp, progressPercent, xpToNext, isMaxLevel } = info;

  return (
    <div
      className="relative p-4"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      {/* 左上角金色装饰角 */}
      <span
        className="absolute top-[-1px] left-[-1px] w-2.5 h-2.5"
        style={{
          borderTop: '1px solid rgba(245,197,24,0.5)',
          borderLeft: '1px solid rgba(245,197,24,0.5)',
        }}
      />
      <div className="flex items-center gap-3 mb-3">
        {/* 等级六边形徽章 */}
        <span
          className="flex items-center justify-center w-11 h-11 font-display text-lg font-bold flex-shrink-0"
          style={{
            color: current.color,
            background: `${current.color.replace('var--', 'rgba(').replace(')', ', 0.12)')}`,
            border: `1.5px solid ${current.color}`,
            clipPath: HEX_CLIP_PATH,
          }}
        >
          {current.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-sm font-extrabold" style={{ color: 'var(--text)' }}>
              Lv.{current.level}
            </span>
            <span className="font-display text-[13px] font-bold" style={{ color: current.color }}>
              {current.name}
            </span>
          </div>
          <div className="font-mono text-[10px]" style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            {totalXp.toLocaleString()} XP
          </div>
        </div>
      </div>
      {/* 迷你进度条 */}
      <div className="relative h-1.5 w-full" style={{ background: 'var(--surface-overlay)' }}>
        <div
          className="absolute top-0 left-0 h-full"
          style={{
            width: `${progressPercent}%`,
            background: `linear-gradient(90deg, ${current.color}, ${next ? next.color : current.color})`,
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="font-mono text-[9px]" style={{ color: 'var(--text-muted)' }}>
          {progressPercent.toFixed(0)}%
        </span>
        {!isMaxLevel ? (
          <span className="font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>
            {xpToNext.toLocaleString()} XP to go
          </span>
        ) : (
          <span className="font-mono text-[9px] font-bold" style={{ color: current.color }}>
            MAX
          </span>
        )}
      </div>
    </div>
  );
}

/* ── 精选成就（最近解锁的 4 个） ── */
function FeaturedAchievements() {
  // 取已解锁的前 4 个成就
  const unlocked = ACHIEVEMENT_DEFS
    .map((def) => {
      const progress = USER_ACHIEVEMENT_PROGRESS.find((p) => p.defId === def.id);
      return { def, progress };
    })
    .filter((item) => item.progress?.unlocked)
    .slice(0, 4);

  return (
    <div className="grid grid-cols-2 gap-2">
      {unlocked.map(({ def, progress }) => {
        const rarity = RARITY_META[def.rarity];
        return (
          <div
            key={def.id}
            className="flex flex-col items-center gap-1 p-2.5 text-center"
            style={{
              background: `${rarity.glow}`,
              border: `1px solid ${rarity.color}`,
            }}
          >
            <span
              className="flex items-center justify-center w-9 h-9 font-display text-base font-bold"
              style={{
                color: rarity.color,
                background: `${rarity.color.replace('var(--', 'rgba(').replace(')', ', 0.1)')}`,
                clipPath: HEX_CLIP_PATH,
              }}
            >
              {def.icon}
            </span>
            <span
              className="font-display text-[10px] font-bold leading-tight"
              style={{ color: 'var(--text)' }}
            >
              {def.name}
            </span>
            <span
              className="font-mono text-[8px]"
              style={{ color: 'var(--green)', letterSpacing: '0.04em' }}
            >
              +{def.rewardXp} XP
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── 快速操作按钮 ── */
function QuickAction({
  icon: Icon, label, onClick,
}: {
  icon: typeof EditIcon; label: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-3 py-2.5 transition-all"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border-subtle)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(245,197,24,0.35)';
        e.currentTarget.style.transform = 'translateX(2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = '';
      }}
    >
      <Icon size={14} style={{ color: 'var(--gold)' }} />
      <span className="font-display text-[12px] font-semibold" style={{ color: 'var(--text)' }}>
        {label}
      </span>
    </button>
  );
}

/* ── 账户信息行 ── */
function InfoRow({ icon: Icon, label, value }: { icon: typeof CalendarIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon size={13} style={{ color: 'var(--text-muted)' }} />
        <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
          {label}
        </span>
      </div>
      <span className="font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>
        {value}
      </span>
    </div>
  );
}

export default function ProfileSidebar() {
  const [toast, setToast] = useState('');
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }, []);

  const stats = USER_ACHIEVEMENT_STATS;

  return (
    <aside
      className="flex flex-col gap-5"
      style={{
        position: 'sticky',
        top: '88px',
        maxHeight: 'calc(100vh - 104px)',
        overflowY: 'auto',
        paddingRight: '4px',
      }}
    >
      {/* ═══ 等级概览 ═══ */}
      <section className="flex flex-col gap-2.5">
        <div
          className="font-mono text-[10px] font-semibold uppercase px-1 mb-1"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
        >
          Level Progress
        </div>
        <LevelOverview />
      </section>

      {/* ═══ 快速操作 ═══ */}
      <section className="flex flex-col gap-2.5">
        <div
          className="font-mono text-[10px] font-semibold uppercase px-1 mb-1"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
        >
          Quick Actions
        </div>
        <QuickAction icon={EditIcon} label="Edit Profile" onClick={() => showToast('Edit Profile — coming soon')} />
        <QuickAction icon={ShareIcon} label="Share Profile" onClick={() => showToast('Profile link copied')} />
        <Link href="/settings" className="block">
          <QuickAction icon={SettingsIcon} label="Settings" onClick={() => {}} />
        </Link>
      </section>

      {/* ═══ 精选成就 ═══ */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1 mb-1">
          <div
            className="font-mono text-[10px] font-semibold uppercase flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
          >
            <TrophyIcon size={12} style={{ color: 'var(--gold)' }} />
            Recent Achievements
          </div>
          <span className="font-mono text-[10px]" style={{ color: 'var(--gold)' }}>
            {stats.unlocked}/{stats.total}
          </span>
        </div>
        <FeaturedAchievements />
      </section>

      {/* ═══ 账户信息 ═══ */}
      <section className="flex flex-col">
        <div
          className="font-mono text-[10px] font-semibold uppercase px-1 mb-1"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
        >
          Account
        </div>
        <div
          className="px-4 py-2"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <InfoRow icon={UserIcon} label="Role" value="Top Seller" />
          <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
          <InfoRow icon={CalendarIcon} label="Joined" value="Jan 2025" />
          <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
          <InfoRow icon={MailIcon} label="Email" value="alex@ghrank.io" />
        </div>
      </section>

      {/* Toast */}
      {toast && (
        <div
          className="fixed left-1/2 flex items-center justify-center pointer-events-none"
          style={{
            bottom: '32px',
            transform: 'translateX(-50%)',
            background: 'var(--surface)',
            border: '1px solid rgba(245,197,24,0.35)',
            padding: '12px 24px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--gold)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(245,197,24,0.15)',
            zIndex: 10000,
            letterSpacing: '0.04em',
          }}
        >
          {toast}
        </div>
      )}
    </aside>
  );
}

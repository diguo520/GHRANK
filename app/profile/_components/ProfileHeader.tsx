/**
 * ProfileHeader —— 用户头部横幅
 * 包含：Banner 大图 + 六边形头像 + 用户名/角色/Bio + 元信息 + 统计 + 操作按钮
 * 风格：EVE Online HUD，金色强调，深色底，monospace 元信息
 */
'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { USER_PROFILE, PROFILE_STATS, type ProfileStat } from '../_data/profile-data';
import { HEX_CLIP_PATH } from '@/lib/constants';
import {
  TerminalIcon, UsersIcon, UserIcon, CoffeeIcon,
  MapPinIcon, CalendarIcon, LinkIcon, GitHubIcon, MailIcon,
  EditIcon, ShareIcon,
} from '../../_components/icons';
import LevelProgress from '../../_components/LevelProgress';

/* ── 统计图标映射 ── */
const STAT_ICONS: Record<ProfileStat['icon'], typeof TerminalIcon> = {
  prompt: TerminalIcon,
  follower: UsersIcon,
  following: UserIcon,
  tip: CoffeeIcon,
};

/* ── 单个统计项 ── */
function StatItem({ stat }: { stat: ProfileStat }) {
  const Icon = STAT_ICONS[stat.icon];
  return (
    <div
      className="flex flex-col items-center gap-1 px-4 py-3 flex-1"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <Icon size={16} style={{ color: 'var(--gold)' }} />
      <span
        className="font-display text-lg font-extrabold"
        style={{ color: 'var(--text)', lineHeight: 1 }}
      >
        {stat.value}
      </span>
      <span
        className="font-mono text-[10px] uppercase"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}
      >
        {stat.label}
      </span>
    </div>
  );
}

/* ── 元信息行（图标 + 文字） ── */
function MetaItem({ icon: Icon, children }: { icon: typeof MapPinIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={13} style={{ color: 'var(--text-muted)' }} />
      <span
        className="font-mono text-[11px]"
        style={{ color: 'var(--text-dim)', letterSpacing: '0.02em' }}
      >
        {children}
      </span>
    </div>
  );
}

export default function ProfileHeader() {
  const [toast, setToast] = useState('');
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      {/* ═══ Banner 大图 ═══ */}
      <div className="relative h-[180px] overflow-hidden">
        <Image
          src={USER_PROFILE.banner}
          alt=""
          fill
          className="object-cover"
          style={{ filter: 'brightness(0.55) saturate(1.1)' }}
        />
        {/* 底部渐变遮罩，让头像区过渡自然 */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(17,19,24,0.6) 60%, var(--surface) 100%)',
          }}
        />
        {/* 左上角金色装饰角 */}
        <span
          className="absolute top-0 left-0 w-3 h-3"
          style={{
            borderTop: '2px solid var(--gold)',
            borderLeft: '2px solid var(--gold)',
            opacity: 0.6,
          }}
        />
        {/* 右上角金色装饰角 */}
        <span
          className="absolute top-0 right-0 w-3 h-3"
          style={{
            borderTop: '2px solid var(--gold)',
            borderRight: '2px solid var(--gold)',
            opacity: 0.6,
          }}
        />
      </div>

      {/* ═══ 用户信息区 ═══ */}
      <div className="relative px-6 pb-6">
        {/* 头像 + 名称行 */}
        <div className="flex items-end gap-4 -mt-12 mb-4">
          {/* 六边形头像 */}
          <div className="relative flex-shrink-0">
            <div
              className="w-24 h-24 flex items-center justify-center"
              style={{
                background: 'var(--surface)',
                clipPath: HEX_CLIP_PATH,
                border: '2px solid var(--gold)',
                padding: '3px',
              }}
            >
              <Image
                src={USER_PROFILE.avatar}
                alt={USER_PROFILE.displayName}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                style={{
                  clipPath: HEX_CLIP_PATH,
                }}
              />
            </div>
          </div>

          {/* 名称 + 角色 */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                className="font-display font-extrabold"
                style={{ fontSize: '24px', color: 'var(--text)', lineHeight: 1.1, letterSpacing: '0.01em' }}
              >
                {USER_PROFILE.displayName}
              </h1>
              {/* 角色徽章 */}
              <span
                className="font-mono text-[10px] font-bold uppercase"
                style={{
                  color: 'var(--gold)',
                  background: 'var(--gold-subtle)',
                  border: '1px solid rgba(245,197,24,0.35)',
                  padding: '2px 8px',
                  letterSpacing: '0.1em',
                }}
              >
                {USER_PROFILE.role}
              </span>
            </div>
            <div
              className="font-mono text-[12px] mt-0.5"
              style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}
            >
              @{USER_PROFILE.username}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pb-1">
            <button
              onClick={() => showToast('Edit Profile — coming soon')}
              className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase transition-all"
              style={{
                color: 'var(--bg)',
                background: 'var(--gold)',
                padding: '8px 16px',
                letterSpacing: '0.08em',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(245,197,24,0.25)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--gold-hover)';
                e.currentTarget.style.boxShadow = '0 0 24px rgba(245,197,24,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--gold)';
                e.currentTarget.style.boxShadow = '0 0 16px rgba(245,197,24,0.25)';
              }}
            >
              <EditIcon size={13} />
              Edit
            </button>
            <button
              onClick={() => showToast('Profile link copied')}
              className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase transition-all"
              style={{
                color: 'var(--text-dim)',
                background: 'transparent',
                border: '1px solid var(--border)',
                padding: '8px 14px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245,197,24,0.35)';
                e.currentTarget.style.color = 'var(--gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-dim)';
              }}
            >
              <ShareIcon size={13} />
              Share
            </button>
          </div>
        </div>

        {/* Bio */}
        <p
          className="font-body text-[14px] leading-relaxed mb-4"
          style={{ color: 'var(--text-dim)', maxWidth: '640px' }}
        >
          {USER_PROFILE.bio}
        </p>

        {/* 元信息行 */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
          <MetaItem icon={MapPinIcon}>{USER_PROFILE.location}</MetaItem>
          <MetaItem icon={LinkIcon}>{USER_PROFILE.website}</MetaItem>
          <MetaItem icon={GitHubIcon}>{USER_PROFILE.github}</MetaItem>
          <MetaItem icon={MailIcon}>{USER_PROFILE.email}</MetaItem>
          <MetaItem icon={CalendarIcon}>Joined {USER_PROFILE.joinedDate}</MetaItem>
        </div>

        {/* 统计四联 */}
        <div className="flex gap-3 flex-wrap mb-4">
          {PROFILE_STATS.map((stat) => (
            <StatItem key={stat.label} stat={stat} />
          ))}
        </div>

        {/* 等级进度条 */}
        <LevelProgress />
      </div>

      {/* Toast 提示 */}
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
    </section>
  );
}

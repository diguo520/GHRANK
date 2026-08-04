/**
 * ProfileTabs —— 主内容标签页
 * 包含：Overview / Prompts / Activity / Bookmarks 四个标签
 * 风格：EVE Online HUD，金色下划线指示器，深色面板
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PROFILE_PROMPTS, PROFILE_ACTIVITIES, USER_PROFILE, PROFILE_STATS,
  type ProfilePrompt, type ProfileActivity,
} from '../_data/profile-data';
import {
  FileTextIcon, HeartIcon, MessageIcon, CoffeeIcon, UserIcon, TagIcon,
  EyeIcon, ClockIcon, BookmarkIcon, TrophyIcon,
} from '../../_components/icons';
import AchievementGrid from '../../_components/AchievementGrid';
import LevelProgress from '../../_components/LevelProgress';

/* ═════════════════════════════════════════════════════
   标签定义
   ═════════════════════════════════════════════════════ */

type TabId = 'overview' | 'prompts' | 'activity' | 'bookmarks' | 'achievements';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'activity', label: 'Activity' },
  { id: 'bookmarks', label: 'Bookmarks' },
  { id: 'achievements', label: 'Achievements' },
];

/* ═════════════════════════════════════════════════════
   活动记录图标 + 颜色映射
   ═════════════════════════════════════════════════════ */

const ACTIVITY_CONFIG: Record<
  ProfileActivity['type'],
  { icon: typeof FileTextIcon; color: string; bg: string; label: string }
> = {
  publish: { icon: FileTextIcon, color: 'var(--cyan)', bg: 'rgba(57,210,192,0.1)', label: 'Published' },
  like: { icon: HeartIcon, color: 'var(--pink)', bg: 'rgba(247,120,186,0.1)', label: 'Like' },
  comment: { icon: MessageIcon, color: 'var(--purple)', bg: 'rgba(163,113,247,0.1)', label: 'Comment' },
  tip: { icon: CoffeeIcon, color: 'var(--gold)', bg: 'rgba(245,197,24,0.1)', label: 'Tip' },
  follow: { icon: UserIcon, color: 'var(--green)', bg: 'rgba(63,185,80,0.1)', label: 'Follow' },
  purchase: { icon: TagIcon, color: 'var(--orange)', bg: 'rgba(232,93,4,0.1)', label: 'Purchase' },
};

/* ═════════════════════════════════════════════════════
   子组件 —— 活动记录项
   ═════════════════════════════════════════════════════ */

function ActivityItem({ activity }: { activity: ProfileActivity }) {
  const config = ACTIVITY_CONFIG[activity.type];
  const Icon = config.icon;

  return (
    <div
      className="flex items-start gap-3 p-3 transition-all"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* 活动图标 */}
      <span
        className="flex items-center justify-center w-8 h-8 flex-shrink-0"
        style={{
          background: config.bg,
          border: `1px solid ${config.color}`,
        }}
      >
        <Icon size={14} style={{ color: config.color }} />
      </span>

      {/* 活动内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={activity.targetHref}
            className="font-display text-[13px] font-semibold truncate"
            style={{ color: 'var(--text)' }}
          >
            {activity.target}
          </Link>
          <span
            className="font-mono text-[10px] flex-shrink-0"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}
          >
            {activity.timeAgo}
          </span>
        </div>
        {activity.detail && (
          <p
            className="font-body text-[12px] mt-0.5"
            style={{ color: 'var(--text-dim)' }}
          >
            {activity.detail}
          </p>
        )}
        {activity.amount && (
          <span
            className="font-mono text-[11px] font-bold mt-0.5 inline-block"
            style={{
              color: activity.amount.startsWith('+') ? 'var(--green)' : 'var(--text-dim)',
            }}
          >
            {activity.amount}
          </span>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   子组件 —— Prompt 卡片（紧凑型）
   ═════════════════════════════════════════════════════ */

function PromptCardCompact({ prompt }: { prompt: ProfilePrompt }) {
  return (
    <Link
      href={`/prompt-detail?id=${prompt.id}`}
      className="group block overflow-hidden transition-all"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border-subtle)',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(245,197,24,0.35)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = '';
      }}
    >
      {/* 缩略图 */}
      <div className="relative h-28 overflow-hidden" style={{ background: 'var(--surface-overlay)' }}>
        <Image
          src={prompt.thumbnail}
          alt=""
          fill
          className="object-cover group-hover:scale-105"
          style={{ transition: 'transform 0.4s ease', filter: 'brightness(0.8)' }}
        />
        {/* 状态标签 */}
        {prompt.status === 'draft' && (
          <span
            className="absolute top-2 left-2 font-mono text-[9px] font-bold uppercase"
            style={{
              color: 'var(--orange)',
              background: 'rgba(232,93,4,0.15)',
              border: '1px solid rgba(232,93,4,0.35)',
              padding: '2px 6px',
              letterSpacing: '0.08em',
            }}
          >
            Draft
          </span>
        )}
        {/* 价格标签 */}
        <span
          className="absolute top-2 right-2 font-mono text-[10px] font-bold"
          style={{
            color: 'var(--gold)',
            background: 'rgba(8,8,10,0.78)',
            border: '1px solid rgba(245,197,24,0.35)',
            padding: '2px 8px',
          }}
        >
          {prompt.price === 0 ? 'FREE' : `$${prompt.price}`}
        </span>
      </div>

      {/* 卡片信息 */}
      <div className="p-3">
        <div
          className="font-display text-[13px] font-bold truncate mb-1"
          style={{ color: 'var(--text)' }}
        >
          {prompt.title}
        </div>
        <div
          className="font-mono text-[10px] mb-2"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}
        >
          {prompt.model} · {prompt.category}
        </div>
        {/* 统计行 */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <HeartIcon size={11} style={{ color: 'var(--text-muted)' }} />
            <span className="font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>
              {prompt.likes}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <EyeIcon size={11} style={{ color: 'var(--text-muted)' }} />
            <span className="font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>
              {prompt.views.toLocaleString()}
            </span>
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <ClockIcon size={11} style={{ color: 'var(--text-muted)' }} />
            <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {prompt.createdAt}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ═════════════════════════════════════════════════════
   子组件 —— Overview 标签内容
   ═════════════════════════════════════════════════════ */

function OverviewTab() {
  const recentActivity = PROFILE_ACTIVITIES.slice(0, 4);
  const topPrompts = PROFILE_PROMPTS.filter((p) => p.status === 'published').slice(0, 3);

  return (
    <div className="flex flex-col gap-5">
      {/* About 区块 */}
      <section
        className="p-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <h2
          className="font-mono text-[10px] font-semibold uppercase mb-3"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
        >
          About
        </h2>
        <p
          className="font-body text-[14px] leading-relaxed"
          style={{ color: 'var(--text-dim)' }}
        >
          {USER_PROFILE.bio}
        </p>
        {/* 统计快览 */}
        <div className="flex gap-4 mt-4 flex-wrap">
          {PROFILE_STATS.map((stat) => (
            <div key={stat.label} className="flex items-center gap-1.5">
              <span className="font-display text-base font-bold" style={{ color: 'var(--gold)' }}>
                {stat.value}
              </span>
              <span className="font-mono text-[10px] uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 热门 Prompt */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="font-mono text-[10px] font-semibold uppercase"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
          >
            Top Prompts
          </h2>
          <span className="font-mono text-[10px]" style={{ color: 'var(--gold)' }}>
            {PROFILE_PROMPTS.filter((p) => p.status === 'published').length} published
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topPrompts.map((prompt) => (
            <PromptCardCompact key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </section>

      {/* 最近活动 */}
      <section>
        <h2
          className="font-mono text-[10px] font-semibold uppercase mb-3"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
        >
          Recent Activity
        </h2>
        <div className="flex flex-col gap-2">
          {recentActivity.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   子组件 —— Prompts 标签内容
   ═════════════════════════════════════════════════════ */

function PromptsTab() {
  const published = PROFILE_PROMPTS.filter((p) => p.status === 'published');
  const drafts = PROFILE_PROMPTS.filter((p) => p.status === 'draft');

  return (
    <div className="flex flex-col gap-5">
      {/* 发布的 Prompt */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="font-mono text-[10px] font-semibold uppercase"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
          >
            Published · {published.length}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {published.map((prompt) => (
            <PromptCardCompact key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </section>

      {/* 草稿 */}
      {drafts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="font-mono text-[10px] font-semibold uppercase"
              style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
            >
              Drafts · {drafts.length}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {drafts.map((prompt) => (
              <PromptCardCompact key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   子组件 —— Activity 标签内容
   ═════════════════════════════════════════════════════ */

function ActivityTab() {
  return (
    <section>
      <h2
        className="font-mono text-[10px] font-semibold uppercase mb-3"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
      >
        Activity Feed · {PROFILE_ACTIVITIES.length} events
      </h2>
      <div className="flex flex-col gap-2">
        {PROFILE_ACTIVITIES.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════
   子组件 —— Bookmarks 标签内容
   ═════════════════════════════════════════════════════ */

function BookmarksTab() {
  // 复用前 4 条作为收藏数据展示
  const bookmarked = PROFILE_PROMPTS.slice(0, 4);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2
          className="font-mono text-[10px] font-semibold uppercase flex items-center gap-1.5"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
        >
          <BookmarkIcon size={12} style={{ color: 'var(--gold)' }} />
          Bookmarked · {bookmarked.length}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {bookmarked.map((prompt) => (
          <PromptCardCompact key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════
   子组件 —— Achievements 标签内容
   ═════════════════════════════════════════════════════ */

function AchievementsTab() {
  return (
    <div className="flex flex-col gap-5">
      {/* 等级路径全览 */}
      <section>
        <div className="flex items-center gap-1.5 mb-3">
          <TrophyIcon size={12} style={{ color: 'var(--gold)' }} />
          <h2
            className="font-mono text-[10px] font-semibold uppercase"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
          >
            Level Path
          </h2>
        </div>
        <LevelProgress showPath />
      </section>

      {/* 成就网格（含统计概览 + 类别筛选） */}
      <section>
        <h2
          className="font-mono text-[10px] font-semibold uppercase mb-3"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
        >
          Achievement Badges
        </h2>
        <AchievementGrid showFilter showStats />
      </section>
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   主组件
   ═════════════════════════════════════════════════════ */

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div>
      {/* ═══ 标签栏 ═══ */}
      <div
        className="flex items-center gap-0 mb-5"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1 px-4 py-3 transition-all"
              style={{
                color: isActive ? 'var(--gold)' : 'var(--text-dim)',
                cursor: 'pointer',
                background: isActive ? 'var(--gold-subtle)' : 'transparent',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                borderRight: tab.id !== 'achievements' ? '1px solid var(--border-subtle)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-dim)';
              }}
            >
              {tab.label}
              {/* 活动下划线指示器 */}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0"
                  style={{ height: '2px', background: 'var(--gold)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ 标签内容 ═══ */}
      <div>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'prompts' && <PromptsTab />}
        {activeTab === 'activity' && <ActivityTab />}
        {activeTab === 'bookmarks' && <BookmarksTab />}
        {activeTab === 'achievements' && <AchievementsTab />}
      </div>
    </div>
  );
}

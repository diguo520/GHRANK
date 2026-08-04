/**
 * AchievementGrid —— 成就徽章网格组件
 * 展示：成就统计概览 + 按类别筛选 + 徽章网格（含进度条、稀有度光效）
 * 用于 Profile 页面和社区页面
 */
'use client';

import { useState, useMemo } from 'react';
import {
  ACHIEVEMENT_DEFS,
  USER_ACHIEVEMENT_PROGRESS,
  USER_ACHIEVEMENT_STATS,
  CATEGORY_META,
  RARITY_META,
  type AchievementCategory,
  type AchievementDef,
  type AchievementRarity,
} from '../_data/achievements-data';
import { LockClosedIcon, TrophyIcon } from './icons';
import { HEX_CLIP_PATH } from '@/lib/constants';

/* ── 进度计算辅助：根据 defId 查找用户进度 ── */
function useProgressMap() {
  return useMemo(() => {
    const map = new Map<string, typeof USER_ACHIEVEMENT_PROGRESS[0]>();
    for (const p of USER_ACHIEVEMENT_PROGRESS) {
      map.set(p.defId, p);
    }
    return map;
  }, []);
}

/* ═════════════════════════════════════════════════════
   子组件：单个成就徽章
   ═════════════════════════════════════════════════════ */

function AchievementBadge({
  def,
  progress,
}: {
  def: AchievementDef;
  progress: { current: number; unlocked: boolean } | undefined;
}) {
  const rarity = RARITY_META[def.rarity];
  const category = CATEGORY_META[def.category];
  const isUnlocked = progress?.unlocked ?? false;
  const currentVal = progress?.current ?? 0;
  const progressPercent = Math.min(100, (currentVal / def.target) * 100);

  return (
    <div
      className="relative flex flex-col items-center gap-1.5 p-3 text-center transition-all"
      style={{
        background: isUnlocked ? `${rarity.glow}` : 'var(--bg)',
        border: `1px solid ${isUnlocked ? rarity.color : 'var(--border-subtle)'}`,
        opacity: isUnlocked ? 1 : 0.6,
      }}
      onMouseEnter={(e) => {
        if (isUnlocked) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 4px 16px ${rarity.glow}`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* 稀有度标签（已解锁时显示） */}
      {isUnlocked && (
        <span
          className="absolute top-1.5 right-1.5 font-mono text-[7px] font-bold uppercase"
          style={{
            color: rarity.color,
            letterSpacing: '0.08em',
            opacity: 0.8,
          }}
        >
          {rarity.label}
        </span>
      )}

      {/* 徽章图标 —— 六边形 */}
      <span
        className="flex items-center justify-center w-11 h-11 font-display text-lg font-bold"
        style={{
          color: isUnlocked ? rarity.color : 'var(--text-muted)',
          background: isUnlocked ? `${rarity.color.replace('var(--', 'rgba(').replace(')', ', 0.1)')}` : 'var(--surface-overlay)',
          clipPath: HEX_CLIP_PATH,
          filter: isUnlocked ? `drop-shadow(0 0 6px ${rarity.glow})` : 'none',
        }}
      >
        {isUnlocked ? def.icon : <LockClosedIcon size={15} />}
      </span>

      {/* 成就名称 */}
      <span
        className="font-display text-[11px] font-bold leading-tight"
        style={{ color: isUnlocked ? 'var(--text)' : 'var(--text-dim)' }}
      >
        {def.name}
      </span>

      {/* 成就描述 */}
      <span
        className="font-body text-[9px] leading-snug"
        style={{ color: 'var(--text-muted)' }}
      >
        {def.desc}
      </span>

      {/* 进度条（未解锁且已有进度时显示） */}
      {!isUnlocked && currentVal > 0 && (
        <div className="w-full mt-0.5">
          <div className="relative h-1 w-full" style={{ background: 'var(--surface-overlay)' }}>
            <div
              className="absolute top-0 left-0 h-full"
              style={{
                width: `${progressPercent}%`,
                background: category.color,
                opacity: 0.7,
              }}
            />
          </div>
          <span
            className="font-mono text-[8px] mt-0.5 block"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}
          >
            {currentVal.toLocaleString()} / {def.target.toLocaleString()}
          </span>
        </div>
      )}

      {/* 解锁状态 / 奖励 XP */}
      {isUnlocked ? (
        <span
          className="font-mono text-[8px] mt-0.5"
          style={{ color: 'var(--green)', letterSpacing: '0.04em' }}
        >
          +{def.rewardXp} XP
        </span>
      ) : (
        currentVal === 0 && (
          <span
            className="font-mono text-[8px] mt-0.5"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}
          >
            0 / {def.target.toLocaleString()}
          </span>
        )
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   子组件：统计概览条
   ═════════════════════════════════════════════════════ */

function StatsOverview() {
  const stats = USER_ACHIEVEMENT_STATS;
  const percent = Math.round((stats.unlocked / stats.total) * 100);

  return (
    <div
      className="flex items-center gap-4 p-3 mb-4"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <span
        className="flex items-center justify-center w-10 h-10 flex-shrink-0"
        style={{ color: 'var(--gold)' }}
      >
        <TrophyIcon size={20} />
      </span>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className="font-display text-lg font-extrabold"
            style={{ color: 'var(--text)' }}
          >
            {stats.unlocked}
            <span style={{ color: 'var(--text-muted)' }}>/{stats.total}</span>
          </span>
          <span
            className="font-mono text-[10px] uppercase"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
          >
            Unlocked · {percent}%
          </span>
        </div>
        {/* 总进度条 */}
        <div className="relative h-1.5 w-full mt-1.5" style={{ background: 'var(--surface-overlay)' }}>
          <div
            className="absolute top-0 left-0 h-full"
            style={{
              width: `${percent}%`,
              background: 'linear-gradient(90deg, var(--gold), var(--gold-hover))',
              boxShadow: '0 0 8px rgba(245,197,24,0.4)',
            }}
          />
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div
          className="font-mono text-[9px] uppercase"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
        >
          XP Earned
        </div>
        <div
          className="font-display text-sm font-bold"
          style={{ color: 'var(--gold)' }}
        >
          +{stats.earnedRewardXp.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   子组件：类别筛选器
   ═════════════════════════════════════════════════════ */

function CategoryFilter({
  active,
  onChange,
}: {
  active: AchievementCategory | 'all';
  onChange: (cat: AchievementCategory | 'all') => void;
}) {
  const categories: (AchievementCategory | 'all')[] = ['all', 'publish', 'engagement', 'impact', 'community', 'milestone'];

  return (
    <div className="flex items-center gap-1.5 mb-4 flex-wrap">
      {categories.map((cat) => {
        const isActive = active === cat;
        const meta = cat === 'all' ? { label: 'All', color: 'var(--text)' } : CATEGORY_META[cat];
        const count = cat === 'all'
          ? USER_ACHIEVEMENT_STATS.unlocked
          : USER_ACHIEVEMENT_STATS.byCategory[cat]?.unlocked ?? 0;
        const total = cat === 'all'
          ? USER_ACHIEVEMENT_STATS.total
          : USER_ACHIEVEMENT_STATS.byCategory[cat]?.total ?? 0;

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 transition-all"
            style={{
              background: isActive ? `${meta.color.replace('var(--', 'rgba(').replace(')', ', 0.12)')}` : 'var(--bg)',
              border: `1px solid ${isActive ? meta.color : 'var(--border-subtle)'}`,
              cursor: 'pointer',
            }}
          >
            <span
              className="font-mono text-[10px] font-bold uppercase"
              style={{
                color: isActive ? meta.color : 'var(--text-dim)',
                letterSpacing: '0.06em',
              }}
            >
              {meta.label}
            </span>
            <span
              className="font-mono text-[9px]"
              style={{ color: 'var(--text-muted)' }}
            >
              {count}/{total}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   主组件
   ═════════════════════════════════════════════════════ */

export default function AchievementGrid({
  showFilter = true,
  showStats = true,
}: {
  /** 是否显示类别筛选器 */
  showFilter?: boolean;
  /** 是否显示统计概览 */
  showStats?: boolean;
}) {
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');
  const progressMap = useProgressMap();

  // 按类别筛选成就
  const filteredDefs = useMemo(() => {
    if (activeCategory === 'all') return ACHIEVEMENT_DEFS;
    return ACHIEVEMENT_DEFS.filter((d) => d.category === activeCategory);
  }, [activeCategory]);

  return (
    <div>
      {/* 统计概览 */}
      {showStats && <StatsOverview />}

      {/* 类别筛选 */}
      {showFilter && (
        <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
      )}

      {/* 成就徽章网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {filteredDefs.map((def) => {
          const progress = progressMap.get(def.id);
          return (
            <AchievementBadge
              key={def.id}
              def={def}
              progress={progress}
            />
          );
        })}
      </div>
    </div>
  );
}

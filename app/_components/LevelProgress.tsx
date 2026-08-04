/**
 * LevelProgress —— 等级进度条组件
 * 展示：当前等级徽章 + 等级名称 + XP 进度条 + 距下一级 XP
 * 用于 Profile 页面头部和社区用户卡片
 */
'use client';

import { USER_LEVEL_INFO, LEVELS } from '../_data/achievements-data';
import { HEX_CLIP_PATH } from '@/lib/constants';

/* ── 等级节点（用于全等级路径展示） ── */
function LevelNode({
  level,
  isCurrent,
  isPassed,
}: {
  level: typeof LEVELS[0];
  isCurrent: boolean;
  isPassed: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <span
        className="flex items-center justify-center w-7 h-7 font-display text-[11px] font-bold"
        style={{
          color: isCurrent ? 'var(--bg)' : isPassed ? level.color : 'var(--text-muted)',
          background: isCurrent ? level.color : isPassed ? 'transparent' : 'var(--surface-overlay)',
          border: `1px solid ${isCurrent ? level.color : isPassed ? level.color : 'var(--border)'}`,
          clipPath: HEX_CLIP_PATH,
          opacity: isPassed || isCurrent ? 1 : 0.4,
        }}
      >
        {level.icon}
      </span>
      <span
        className="font-mono text-[8px] uppercase"
        style={{
          color: isCurrent ? level.color : 'var(--text-muted)',
          letterSpacing: '0.04em',
          opacity: isPassed || isCurrent ? 1 : 0.5,
        }}
      >
        Lv{level.level}
      </span>
    </div>
  );
}

export default function LevelProgress({ showPath = false }: { showPath?: boolean }) {
  const info = USER_LEVEL_INFO;
  const { current, next, totalXp, progressPercent, xpToNext, isMaxLevel } = info;

  return (
    <div
      className="p-4"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      {/* ═══ 等级头部：徽章 + 名称 + XP 数值 ═══ */}
      <div className="flex items-center gap-3 mb-3">
        {/* 当前等级六边形徽章 */}
        <span
          className="flex items-center justify-center w-12 h-12 font-display text-xl font-bold flex-shrink-0"
          style={{
            color: current.color,
            background: `${current.color.replace('var(--', 'rgba(').replace(')', ', 0.12)')}`,
            border: `1.5px solid ${current.color}`,
            clipPath: HEX_CLIP_PATH,
          }}
        >
          {current.icon}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span
              className="font-display text-base font-extrabold"
              style={{ color: 'var(--text)' }}
            >
              Lv.{current.level}
            </span>
            <span
              className="font-display text-sm font-bold"
              style={{ color: current.color }}
            >
              {current.name}
            </span>
          </div>
          <div
            className="font-mono text-[10px]"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}
          >
            {totalXp.toLocaleString()} XP · {current.desc}
          </div>
        </div>

        {/* 下一级提示 */}
        {!isMaxLevel && next && (
          <div className="text-right flex-shrink-0">
            <div
              className="font-mono text-[9px] uppercase"
              style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
            >
              Next
            </div>
            <div
              className="font-display text-[12px] font-bold"
              style={{ color: next.color }}
            >
              {next.name}
            </div>
          </div>
        )}
      </div>

      {/* ═══ XP 进度条 ═══ */}
      <div className="relative">
        <div
          className="relative h-2.5 w-full overflow-hidden"
          style={{ background: 'var(--surface-overlay)' }}
        >
          {/* 进度填充 */}
          <div
            className="absolute top-0 left-0 h-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${current.color}, ${next ? next.color : current.color})`,
              boxShadow: `0 0 12px ${current.color.replace('var(--', 'rgba(').replace(')', ', 0.4)')}`,
            }}
          />
          {/* 进度条刻度标记 */}
          <div
            className="absolute top-0 right-0 h-full w-0.5"
            style={{ background: 'var(--text-muted)', opacity: 0.4 }}
          />
        </div>

        {/* 进度数值 */}
        <div className="flex items-center justify-between mt-1.5">
          <span
            className="font-mono text-[10px]"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}
          >
            {progressPercent.toFixed(0)}%
          </span>
          {!isMaxLevel ? (
            <span
              className="font-mono text-[10px]"
              style={{ color: 'var(--text-dim)', letterSpacing: '0.04em' }}
            >
              {xpToNext.toLocaleString()} XP to Lv.{next.level}
            </span>
          ) : (
            <span
              className="font-mono text-[10px] font-bold"
              style={{ color: current.color, letterSpacing: '0.04em' }}
            >
              MAX LEVEL
            </span>
          )}
        </div>
      </div>

      {/* ═══ 全等级路径（可选展示） ═══ */}
      {showPath && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div
            className="font-mono text-[9px] uppercase mb-2.5"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}
          >
            Level Path
          </div>
          <div className="flex items-center justify-between gap-1">
            {LEVELS.map((lvl) => (
              <LevelNode
                key={lvl.level}
                level={lvl}
                isCurrent={lvl.level === current.level}
                isPassed={lvl.level < current.level}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

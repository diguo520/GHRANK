/**
 * 数据统计 —— 用户行为数据与活动趋势
 *
 * 参考 lobehub /settings/stats 模式：
 * - 顶部 4 张关键指标卡片（浏览量 / 发布数 / 获赞数 / 收入）
 * - 活动趋势：GitHub 风格热力图（7 行 × 53 列，每格 = 1 天）
 * - 内容分布：横向进度条
 * - 最近活动：时间线
 *
 * 数据管线：
 *   - 一次生成 365 天 × 24 小时全量原始活动分数（种子固定保证 SSR/CSR 一致）
 *   - 1 年视图：取最后 365 天，按「星期 × 周」展开（7 行 × 53 列，每格 = 1 天）
 *   - 等级映射使用全局 maxDailyAvg 做归一化
 */
'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import SettingsShell from '../_components/SettingsShell';
import { panelStyle } from '../_components/SettingsForm';

/* ═══════════════════════════════════════════════════════════════
   样式常量
   ═══════════════════════════════════════════════════════════════ */

const panelSectionStyle: CSSProperties = {
  background: 'transparent',
  borderRadius: 12,
  padding: '24px 28px 28px',
  marginBottom: '16px',
};

const sectionHeadingStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  padding: '16px 0 8px',
  borderBottom: '1px solid var(--border-subtle)',
};

/* ═══════════════════════════════════════════════════════════════
   静态数据
   ═══════════════════════════════════════════════════════════════ */

const STATS = [
  { label: 'Views', value: '12,847', accent: 'var(--cyan)', delta: '+12.4%' },
  { label: 'Publishes', value: '38', accent: 'var(--green)', delta: '+3' },
  { label: 'Likes', value: '2,193', accent: 'var(--pink)', delta: '+186' },
  { label: 'Revenue', value: '$1,247', accent: 'var(--gold)', delta: '+8.2%' },
];

const DISTRIBUTION = [
  { label: 'Prompts', percent: 45, color: 'var(--purple)' },
  { label: 'Notes', percent: 25, color: 'var(--cyan)' },
  { label: 'Community', percent: 20, color: 'var(--green)' },
  { label: 'Bookmarks', percent: 10, color: 'var(--orange)' },
];

const ACTIVITIES = [
  { date: '08-05', action: 'Published new Prompt', count: 2 },
  { date: '08-04', action: 'Received likes', count: 47 },
  { date: '08-03', action: 'Community interaction', count: 18 },
  { date: '08-02', action: 'Bookmarked content', count: 5 },
  { date: '08-01', action: 'Earned income', count: 1 },
];

/* ═══════════════════════════════════════════════════════════════
   指标卡片
   ═══════════════════════════════════════════════════════════════ */

interface StatCardProps {
  label: string;
  value: string;
  accent: string;
  delta: string;
}

function StatCard({ label, value, accent, delta }: StatCardProps) {
  return (
    <div
      style={{
        background: 'transparent',
        borderRadius: 12,
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      {/* 顶部渐变装饰条 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${accent}, transparent)`,
        }}
      />
      {/* 左侧金色装饰竖条 */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          bottom: '16px',
          left: 0,
          width: '3px',
          background: accent,
          borderRadius: '0 2px 2px 0',
          opacity: 0.6,
        }}
      />
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '32px',
          fontWeight: 800,
          color: 'var(--text)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: accent,
          fontWeight: 600,
          marginTop: '4px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: accent }} />
        {delta}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   热力图：数据管线
   ═══════════════════════════════════════════════════════════════ */

const HEATMAP_LEVELS = [
  'transparent',
  'rgba(157, 140, 255, 0.10)',
  'rgba(157, 140, 255, 0.25)',
  'rgba(157, 140, 255, 0.50)',
  'rgba(157, 140, 255, 0.75)',
  'var(--gold)',
];

const LEVEL_LABELS = ['No activity', 'Very low', 'Low', 'Normal', 'High', 'Very high'];

const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function makeSeededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateHourlyScores(days: number, startSeed = 42): number[][] {
  const rand = makeSeededRand(startSeed);
  const scores: number[][] = [];

  const dowForOffset = (offset: number) => ((2 - offset) % 7 + 7) % 7;

  for (let offset = days - 1; offset >= 0; offset--) {
    const row: number[] = [];
    const dow = dowForOffset(offset);
    const isWeekend = dow === 5 || dow === 6;
    const monthPhase = Math.sin((offset / 28) * Math.PI * 2) * 0.1;

    for (let h = 0; h < 24; h++) {
      let base = rand();
      if (h >= 9 && h <= 18) base += 0.45;
      else if (h >= 19 && h <= 23) base += 0.25;
      if (isWeekend) base += 0.15;
      base += monthPhase;
      if (h === 12) base -= 0.1;
      if (offset < 7) base += 0.2;
      row.push(Math.max(0, Math.min(1, base)));
    }
    scores.push(row);
  }
  return scores;
}

const HOURLY_SCORES_365 = generateHourlyScores(365, 42);

function dailyAvgScore(dayRow: number[]): number {
  let sum = 0;
  for (let h = 0; h < dayRow.length; h++) sum += dayRow[h];
  return sum / dayRow.length;
}

const DAILY_AVG_365 = HOURLY_SCORES_365.map(dailyAvgScore);
const GLOBAL_MAX_DAILY_AVG = Math.max(...DAILY_AVG_365);

function scoreToLevel(score: number): number {
  const ratio = GLOBAL_MAX_DAILY_AVG <= 0 ? 0 : Math.min(1, score / GLOBAL_MAX_DAILY_AVG);
  if (ratio <= 0.02) return 0;
  if (ratio <= 0.22) return 1;
  if (ratio <= 0.42) return 2;
  if (ratio <= 0.62) return 3;
  if (ratio <= 0.82) return 4;
  return 5;
}

const DAILY_LEVEL_365 = DAILY_AVG_365.map(scoreToLevel);

const ANCHOR_YEAR = 2026;
const ANCHOR_MONTH = 8;
const ANCHOR_DAY = 5;

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function dateFromOffset(offset: number): {
  Y: number;
  M: number;
  D: number;
  monthLabel: string;
  dayLabel: string;
  dowIdx: number;
} {
  let Y = ANCHOR_YEAR;
  let M = ANCHOR_MONTH;
  let D = ANCHOR_DAY;
  for (let i = 0; i < offset; i++) {
    D--;
    if (D < 1) {
      M--;
      if (M < 1) {
        M = 12;
        Y--;
      }
      D = daysInMonth(Y, M);
    }
  }
  const dowIdx = ((2 - offset) % 7 + 7) % 7;
  return { Y, M, D, monthLabel: MONTHS_SHORT[M - 1], dayLabel: `${MONTHS_SHORT[M - 1]} ${D}`, dowIdx };
}

/* —— 1 年视图：GitHub 风格（7 行 × 53 列，每格 = 1 天） —— */

interface YearLevels365 {
  levels: (number | null)[][];
  dayOffset: (number | null)[][];
  monthAtColStart: (number | null)[];
}

function getYearLevels365(): YearLevels365 {
  const levels: (number | null)[][] = Array.from({ length: 7 }, () => Array(53).fill(null));
  const dayOffset: (number | null)[][] = Array.from({ length: 7 }, () => Array(53).fill(null));
  const monthAtColStart: (number | null)[] = Array(53).fill(null);

  for (let offset = 0; offset < 365; offset++) {
    const diff = offset - 3;
    const weekIdx = Math.floor((diff + 7) / 7);
    const colIdx = 52 - weekIdx;
    const rowIdx = ((2 - offset) % 7 + 7) % 7;

    if (colIdx < 0 || colIdx >= 53) continue;
    levels[rowIdx][colIdx] = DAILY_LEVEL_365[365 - 1 - offset];
    dayOffset[rowIdx][colIdx] = offset;
  }

  for (let c = 0; c < 53; c++) {
    for (let r = 0; r < 7; r++) {
      const off = dayOffset[r][c];
      if (off !== null) {
        const dt = dateFromOffset(off);
        monthAtColStart[c] = dt.M;
        break;
      }
    }
  }

  return { levels, dayOffset, monthAtColStart };
}

/* ═══════════════════════════════════════════════════════════════
   热力图渲染组件（仅 1 年视图）
   ═══════════════════════════════════════════════════════════════ */

type HoveredCell = { dowIdx: number; colIdx: number; x: number; y: number };

function HeatmapChart() {
  const [hovered, setHovered] = useState<HoveredCell | null>(null);

  const year365 = useMemo(() => getYearLevels365(), []);
  const grandTotal = useMemo(() => {
    let total = 0;
    for (let offset = 0; offset < 365; offset++) {
      total += DAILY_LEVEL_365[365 - 1 - offset];
    }
    return total;
  }, []);

  const onCellEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    cell: Omit<HoveredCell, 'x' | 'y'>
  ) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const root = (e.currentTarget.closest('.heatmap-root') as HTMLElement | null)?.getBoundingClientRect();
    if (!root) return;
    setHovered({ ...cell, x: rect.left + rect.width / 2 - root.left, y: rect.top - root.top });
  };

  return (
    <div className="heatmap-root" style={{ position: 'relative', padding: '20px 0 8px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {/* Y 轴：星期缩写（只显示周一/周三/周五） */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            paddingTop: '18px',
            width: '26px',
          }}
        >
          {DAYS_SHORT.map((d, i) => (
            <div
              key={i}
              style={{
                height: '12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: i % 2 === 1 ? 'var(--text-muted)' : 'transparent',
                lineHeight: '12px',
                textAlign: 'right',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          {/* X 轴：月份标签 */}
          <div style={{ position: 'relative', height: '14px', marginBottom: '4px' }}>
            {(() => {
              const seen = new Set<number>();
              const labels: { colIdx: number; label: string }[] = [];
              for (let c = 0; c < 53; c++) {
                const m = year365.monthAtColStart[c];
                if (m !== null && !seen.has(m)) {
                  seen.add(m);
                  labels.push({ colIdx: c, label: MONTHS_SHORT[m - 1] });
                }
              }
              return labels.map(({ colIdx, label }) => (
                <span
                  key={`${colIdx}-${label}`}
                  style={{
                    position: 'absolute',
                    left: `${colIdx * 14}px`,
                    transform: 'translateX(-2px)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    lineHeight: '14px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </span>
              ));
            })()}
          </div>

          {/* 网格：7 行 × 53 列 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {year365.levels.map((row, dowIdx) => (
              <div
                key={dowIdx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(53, 12px)`,
                  gap: '2px',
                }}
              >
                {row.map((level, colIdx) => {
                  const isHover =
                    hovered?.dowIdx === dowIdx && hovered.colIdx === colIdx;
                  const dayOff = year365.dayOffset[dowIdx][colIdx];
                  const isEmpty = dayOff === null || level === null;
                  return (
                    <div
                      key={`${dowIdx}-${colIdx}`}
                      onMouseEnter={
                        !isEmpty
                          ? (e) => onCellEnter(e, { dowIdx, colIdx })
                          : undefined
                      }
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '2px',
                        background: isEmpty
                          ? 'transparent'
                          : HEATMAP_LEVELS[level as number],
                        outline: isHover
                          ? '1px solid var(--gold)'
                          : '1px solid transparent',
                        outlineOffset: '-1px',
                        cursor:
                          !isEmpty && (level as number) > 0 ? 'pointer' : 'default',
                        boxShadow:
                          !isEmpty && (level as number) >= 4
                            ? '0 0 4px rgba(157,140,255,0.25)'
                            : 'none',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <HeatmapFooter total={grandTotal} rangeLabel="Last year" />
        </div>
      </div>

      {/* Tooltip */}
      {hovered &&
        (() => {
          const dayOff = year365.dayOffset[hovered.dowIdx][hovered.colIdx];
          if (dayOff === null) return null;
          const level = year365.levels[hovered.dowIdx][hovered.colIdx] as number;
          const dt = dateFromOffset(dayOff);
          return (
            <div
              style={{
                position: 'absolute',
                transform: 'translate(-50%, -100%)',
                left: hovered.x,
                top: hovered.y - 6,
                pointerEvents: 'none',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '8px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 10,
                whiteSpace: 'nowrap',
                borderTop: '2px solid var(--gold)',
              }}
            >
              <div style={{ marginBottom: '4px', color: 'var(--text-muted)' }}>
                {dt.dayLabel} ({dt.Y}) · {DAYS_SHORT[dt.dowIdx]}
                {dayOff === 0
                  ? ' (today)'
                  : dayOff === 1
                    ? ' (yesterday)'
                    : ` (${dayOff} days ago)`}
              </div>
              <div>
                Intensity:
                <span style={{ color: 'var(--gold)' }}>{LEVEL_LABELS[level]}</span>
              </div>
              <div style={{ color: 'var(--text-dim)' }}>Level: {level} / 5</div>
            </div>
          );
        })()}
    </div>
  );
}

/** 底部图例 + 汇总 */
function HeatmapFooter({ total, rangeLabel }: { total: number; rangeLabel: string }) {
  return (
    <div
      style={{
        marginTop: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          letterSpacing: '0.05em',
        }}
      >
        {rangeLabel} total activity:
        <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{total}</span> activities
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-muted)',
            marginRight: '4px',
          }}
        >
          Less
        </span>
        {HEATMAP_LEVELS.map((c, i) => (
          <div
            key={i}
            title={LEVEL_LABELS[i]}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              background: c,
              border: i === 0 ? '1px solid var(--border-subtle)' : 'none',
            }}
          />
        ))}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-muted)',
            marginLeft: '4px',
          }}
        >
          More
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   内容分布（横向进度条）
   ═══════════════════════════════════════════════════════════════ */

function DistributionBars() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 0 8px' }}>
      {DISTRIBUTION.map((item) => (
        <div key={item.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)' }}>{item.label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: item.color }}>{item.percent}%</span>
          </div>
          <div style={{ height: '6px', background: 'var(--surface-overlay)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${item.percent}%`, height: '100%', background: item.color, borderRadius: '3px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   最近活动时间线
   ═══════════════════════════════════════════════════════════════ */

function ActivityTimeline() {
  return (
    <div style={{ padding: '16px 0 4px' }}>
      {ACTIVITIES.map((item, index) => {
        const isLast = index === ACTIVITIES.length - 1;
        return (
          <div
            key={item.date}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 0',
              borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--gold)',
                width: '52px',
                flexShrink: 0,
              }}
            >
              {item.date}
            </div>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--gold)',
                flexShrink: 0,
                boxShadow: '0 0 0 3px rgba(157, 140, 255, 0.12)',
              }}
            />
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)' }}>{item.action}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--text-dim)' }}>
              ×{item.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   页面
   ═══════════════════════════════════════════════════════════════ */

export default function StatsPage() {
  return (
    <SettingsShell title="Statistics" subtitle="View your platform usage and activity trends">
      <div>
        {/* Key metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Activity trends: GitHub-style heatmap (last year) */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>Activity Trends</h2>
          <HeatmapChart />
        </section>

        {/* Content distribution */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>Content Distribution</h2>
          <DistributionBars />
        </section>

        {/* Recent activity */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>Recent Activity</h2>
          <ActivityTimeline />
        </section>
      </div>
    </SettingsShell>
  );
}

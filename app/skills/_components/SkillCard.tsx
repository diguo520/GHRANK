/**
 * SkillCard —— 单行技能卡片（Finder 式行排列）
 * 迁移自 skills.js 的 skillCardHtml / trendHtml / sparklineHtml / tagsHtml
 * 布局：排名 | 趋势 | 技能信息 | 标签 | 统计 | 活跃度
 */

import Link from 'next/link';
import type { Skill, SortMode } from '../_data/skills-data';

/** 趋势显示：根据 trendingRank 给出升降箭头 + 数值 */
function getTrend(trendingRank: number): { cls: string; arrow: string; value: string } {
  if (trendingRank <= 200) {
    return { cls: 'up', arrow: '\u25B2', value: String(trendingRank) };
  }
  if (trendingRank >= 300) {
    return { cls: 'down', arrow: '\u25BC', value: String(500 - trendingRank) };
  }
  return { cls: 'flat', arrow: '\u2014', value: '' };
}

/** 合并 category + tags 并去重，取前 5 个 */
function getUniqueTags(skill: Skill): string[] {
  const all = [...(skill.category || []), ...(skill.tags || [])];
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const t of all) {
    if (t && !seen.has(t)) {
      seen.add(t);
      unique.push(t);
    }
  }
  return unique.slice(0, 5);
}

interface SkillCardProps {
  skill: Skill;
  rank: number;
  sortMode: SortMode;
}

export default function SkillCard({ skill, rank, sortMode }: SkillCardProps) {
  const trend = getTrend(skill.trendingRank);
  // Hot 模式显示 8 周活跃度，其他模式显示安装量
  const statValue = sortMode === 'hot' ? skill.activity8w : skill.installsFormatted;
  const statUnit = sortMode === 'hot' ? ' / 8W' : '';
  const tags = getUniqueTags(skill);

  // 行式 grid 布局列宽：排名 | 趋势 | 技能信息 | 标签 | 统计 | 活跃度
  const gridCols = '48px 44px 1fr auto 130px 90px';

  return (
    <article
      className="skills-card group card-fade-in"
      data-id={skill.id}
      style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        alignItems: 'center',
        gap: '16px',
        padding: '14px 18px',
        background: 'transparent',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background 0.15s',
        position: 'relative',
      }}
    >
      {/* 排名 */}
      <span
        className="skills-card-rank"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '18px',
          fontWeight: 800,
          color: 'var(--gold)',
          lineHeight: 1,
          textAlign: 'center',
        }}
      >
        #{rank}
      </span>

      {/* 趋势箭头 */}
      <span
        className={`skills-card-trend ${trend.cls}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: trend.cls === 'up'
            ? 'var(--green)'
            : trend.cls === 'down'
              ? 'var(--danger, #f85149)'
              : 'var(--text-muted)',
        }}
      >
        <span style={{ fontSize: '14px', lineHeight: 1 }}>{trend.arrow}</span>
        {trend.value && <span>{trend.value}</span>}
      </span>

      {/* 技能信息：名称 + 仓库路径 */}
      <div className="skills-card-info" style={{ minWidth: 0 }}>
        <h3
          className="skills-card-title"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '15px',
            fontWeight: 700,
            lineHeight: 1.2,
            display: 'flex',
            alignItems: 'baseline',
            gap: '10px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <Link
            href={`/skills/detail?id=${encodeURIComponent(skill.id)}`}
            className="skills-card-name"
            style={{
              color: 'var(--text)',
              textDecoration: 'none',
              flexShrink: 0,
              maxWidth: '55%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {skill.name}
          </Link>
          <span
            className="skills-card-repo"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexShrink: 1,
            }}
          >
            {skill.repo}
          </span>
        </h3>
      </div>

      {/* 标签列 */}
      <div
        className="skills-card-tags"
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: '4px',
          overflow: 'hidden',
        }}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="skills-card-tag"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              padding: '2px 6px',
              background: 'rgba(245, 197, 24, 0.08)',
              border: '1px solid rgba(245, 197, 24, 0.2)',
              color: 'var(--gold)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* 统计列 */}
      <span
        className="skills-card-stat"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-dim)',
          textAlign: 'right',
        }}
      >
        <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{statValue}</strong>
        {statUnit}
      </span>

      {/* Sparkline 柱状图 */}
      <div
        className="skills-card-sparkline"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '2px',
          height: '24px',
          justifyContent: 'flex-end',
        }}
      >
        {(skill.sparkline || [30, 40, 35, 50, 45, 60, 55, 70]).map((p, i) => (
          <div
            key={i}
            className="skills-card-sparkline-bar"
            style={{
              width: '4px',
              height: `${p}%`,
              background: 'var(--gold)',
              opacity: 0.7,
            }}
          />
        ))}
      </div>
    </article>
  );
}

/**
 * SkillsHero —— Hero 区域（统计数字）
 * 迁移自 skills.html 的 .skills-hero 区块
 * 包含：徽章、标题、副标题、四项统计
 */

import { formatNumber, skills, owners, categories } from '../_data/skills-data';

/** 统计数据预计算 */
const totalSkills = skills.length;
const totalOwners = owners.length;
const totalCategories = categories.length;
const totalInstalls = skills.reduce((sum, s) => sum + (s.installs || 0), 0);

interface StatItem {
  value: string;
  label: string;
}

const STATS: StatItem[] = [
  { value: formatNumber(totalSkills), label: 'Total Skills' },
  { value: formatNumber(totalOwners), label: 'Creators' },
  { value: formatNumber(totalCategories), label: 'Categories' },
  { value: formatNumber(totalInstalls), label: 'Installs' },
];

export default function SkillsHero() {
  return (
    <section
      className="skills-hero"
      style={{
        textAlign: 'center',
        padding: '56px 24px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* 徽章 */}
      <div
        className="skills-hero-badge"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--gold)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}
      >
        {'\u25C6'} AGENT SKILLS MARKET {'\u25C6'}
      </div>

      {/* 标题 */}
      <h1
        className="skills-hero-title"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '52px',
          fontWeight: 800,
          color: 'var(--text)',
          lineHeight: 1.05,
          letterSpacing: '0.02em',
          marginBottom: '14px',
        }}
      >
        <span
          className="gold-glow"
          style={{
            color: 'var(--gold)',
            textShadow: '0 0 24px rgba(245,197,24,0.18), 0 0 48px rgba(245,197,24,0.12)',
          }}
        >
          SKILLS
        </span>{' '}
        MARKET
      </h1>

      {/* 副标题 */}
      <p
        className="skills-hero-sub"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          color: 'var(--text-dim)',
          maxWidth: '620px',
          margin: '0 auto 32px',
        }}
      >
        Discover, compare and install community-built Agent Skills. Curated by GHRANK.
      </p>

      {/* 统计数字 */}
      <div
        className="skills-hero-stats"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          maxWidth: '860px',
          margin: '0 auto',
        }}
      >
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="skills-hero-stat"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              padding: '18px 16px',
              position: 'relative',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
          >
            {/* 左上角金色装饰角 */}
            <div
              style={{
                position: 'absolute',
                top: '-1px',
                left: '-1px',
                width: '10px',
                height: '10px',
                borderTop: '1px solid rgba(245,197,24,0.5)',
                borderLeft: '1px solid rgba(245,197,24,0.5)',
              }}
            />
            <div
              className="skills-hero-stat-value"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--gold)',
              }}
            >
              {stat.value}
            </div>
            <div
              className="skills-hero-stat-label"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginTop: '4px',
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

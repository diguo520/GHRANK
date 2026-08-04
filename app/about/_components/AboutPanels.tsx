/**
 * About 页面四个内容面板
 * About Us / Sponsors / Changelog / Terms of Service
 */

import { Prose, ProseP, ProseH3, ProseList, PanelHeader } from './AboutProse';
import { HEX_CLIP_PATH } from '@/lib/constants';
import {
  STATS,
  TEAM,
  TIER_STYLES,
  SPONSORS,
  CHANGELOG_TAG_STYLES,
  CHANGELOG,
  TERMS,
  XP_RULES,
  type ChangelogTag,
} from '../_data/about-data';
import {
  LEVELS,
  CATEGORY_META,
  RARITY_META,
  ACHIEVEMENT_DEFS,
  type AchievementCategory,
  type AchievementRarity,
} from '../../_data/achievements-data';

/** 面板 01：About Us —— 使命、统计、团队 */
export function AboutPanel() {
  return (
    <section>
      <PanelHeader
        eyebrow="Section 01 / Mission"
        title="About GHRANK"
        subtitle="Open source intelligence for the agentic web — ranked, scored, and delivered in real time."
      />
      <Prose>
        <ProseP>
          GHRANK is an independent intelligence platform that tracks, scores, and ranks open source repositories, AI agents, prompt assets, and skills across the global developer ecosystem. Our scoring model combines GitHub activity, community impact, time-decay weighting, and market signals to surface what actually matters.
        </ProseP>
        <ProseP>
          We believe open source intelligence should be transparent, traceable, and accessible. Every ranking on GHRANK can be inspected — the factors, the weights, and the raw signals are all visible to the community.
        </ProseP>

        {/* 统计卡片网格 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', margin: '28px 0' }}>
          {STATS.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '20px 18px',
                position: 'relative',
              }}
            >
              {/* 左上角金色装饰角 */}
              <span
                style={{
                  position: 'absolute',
                  top: '-1px',
                  insetInlineStart: '-1px',
                  width: '12px',
                  height: '12px',
                  borderTop: '2px solid var(--gold)',
                  borderInlineStart: '2px solid var(--gold)',
                }}
              />
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '28px',
                  fontWeight: 700,
                  color: 'var(--gold)',
                  lineHeight: 1.1,
                  marginBottom: '6px',
                  letterSpacing: '-0.02em',
                }}
              >
                {stat.val}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <ProseH3>What We Do</ProseH3>
        <ProseList
          items={[
            'Aggregate GitHub, marketplace, and community signals into a single weighted score',
            'Rank repositories, prompts, and agent skills by real impact — not just stars',
            'Provide a marketplace where creators can publish and monetize intelligence assets',
            'Maintain a transparent, auditable scoring methodology with time-decay weighting',
          ]}
        />

        <ProseH3>Core Principles</ProseH3>
        <ProseList
          items={[
            <><strong style={{ color: 'var(--text)', fontWeight: 700 }}>Transparency</strong> — scoring factors and weights are public</>,
            <><strong style={{ color: 'var(--text)', fontWeight: 700 }}>Independence</strong> — rankings cannot be bought or sponsored</>,
            <><strong style={{ color: 'var(--text)', fontWeight: 700 }}>Community</strong> — open feedback channels for every ranked entity</>,
            <><strong style={{ color: 'var(--text)', fontWeight: 700 }}>Privacy</strong> — no tracking pixels, no behavioral profiling</>,
          ]}
        />

        <ProseH3>Team</ProseH3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', margin: '20px 0 8px' }}>
          {TEAM.map((member) => (
            <div
              key={member.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 18px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                transition: 'border-color 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--bg)',
                  background: 'var(--gold)',
                  borderRadius: '50%',
                  flexShrink: 0,
                  letterSpacing: '0.02em',
                }}
              >
                {member.avatar}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--text)',
                    marginBottom: '2px',
                  }}
                >
                  {member.name}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-dim)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {member.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Prose>
    </section>
  );
}

/** 面板 02：Sponsors —— 分级赞助商 */
export function SponsorsPanel() {
  return (
    <section>
      <PanelHeader
        eyebrow="Section 02 / Backers"
        title="Sponsors"
        subtitle="Organizations and individuals backing GHRANK's infrastructure and independence."
      />
      <Prose>
        <ProseP>
          GHRANK is community-funded. Sponsorships cover infrastructure, data ingestion, and full-time maintainers — never ranking placement. Rankings are independent of sponsorship status, always.
        </ProseP>

        <ProseH3>Tiered Backers</ProseH3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', margin: '24px 0' }}>
          {SPONSORS.map((sponsor) => {
            const tierStyle = TIER_STYLES[sponsor.tier];
            return (
              <div
                key={sponsor.name}
                style={{
                  padding: '20px 22px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  position: 'relative',
                  transition: 'border-color 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    padding: '3px 10px',
                    textTransform: 'uppercase',
                    marginBottom: '10px',
                    color: tierStyle.color,
                    background: tierStyle.bg,
                    border: `1px solid ${tierStyle.border}`,
                  }}
                >
                  {sponsor.tier}
                </span>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--text)',
                    marginBottom: '6px',
                  }}
                >
                  {sponsor.name}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: 'var(--text-dim)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {sponsor.amount}
                </div>
              </div>
            );
          })}
        </div>

        <ProseH3>How Sponsorship Works</ProseH3>
        <ProseList
          items={[
            'Sponsorships fund infrastructure, data pipelines, and maintainer stipends only',
            'Sponsors receive no ranking advantage — the scoring model is independent',
            'All sponsors are listed publicly here with their tier and contribution amount',
            'Sponsors may display a "Backs GHRANK" badge; this is the only perk',
          ]}
        />

        <ProseH3>Become a Sponsor</ProseH3>
        <ProseP>
          Interested in backing open source intelligence? Reach out at{' '}
          <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>sponsors@ghrank.io</span>{' '}
          and we'll walk you through the tiers and what they fund.
        </ProseP>
      </Prose>
    </section>
  );
}

/** 面板 03：Changelog —— 更新日志时间线 */
export function ChangelogPanel() {
  return (
    <section>
      <PanelHeader
        eyebrow="Section 03 / Releases"
        title="Changelog"
        subtitle="Every shipped improvement, fix, and breaking change — newest first."
      />
      <Prose>
        {/* 时间线 */}
        <div style={{ position: 'relative', paddingInlineStart: '24px', marginTop: '8px' }}>
          {/* 竖向连线 */}
          <span
            style={{
              position: 'absolute',
              insetInlineStart: '6px',
              top: '8px',
              bottom: '8px',
              width: '1px',
              background: 'var(--border)',
            }}
          />
          {CHANGELOG.map((entry) => (
            <div key={entry.version} style={{ position: 'relative', paddingBottom: '32px' }}>
              {/* 时间线节点 */}
              <span
                style={{
                  position: 'absolute',
                  insetInlineStart: '-22px',
                  top: '4px',
                  width: '13px',
                  height: '13px',
                  border: '2px solid var(--gold)',
                  background: 'var(--bg)',
                  borderRadius: '50%',
                  zIndex: 1,
                }}
              />
              <span
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--gold)',
                  marginInlineEnd: '12px',
                  letterSpacing: '-0.01em',
                }}
              >
                {entry.version}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.04em',
                }}
              >
                {entry.date}
              </span>
              <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
                {entry.items.map((item, i) => {
                  const tagStyle = CHANGELOG_TAG_STYLES[item.tag as ChangelogTag];
                  return (
                    <li
                      key={i}
                      style={{
                        marginBottom: '8px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        lineHeight: 1.6,
                        color: 'var(--text)',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          padding: '2px 8px',
                          marginInlineEnd: '8px',
                          textTransform: 'uppercase',
                          verticalAlign: 'middle',
                          borderRadius: '2px',
                          color: tagStyle.color,
                          background: tagStyle.bg,
                          border: `1px solid ${tagStyle.border}`,
                        }}
                      >
                        {item.tag}
                      </span>
                      {item.text}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Prose>
    </section>
  );
}

/** 面板 04：Community Achievements —— 社区成就系统说明 */
export function AchievementsPanel() {
  // 每个类别取 1 个代表性成就作为示例
  const exampleAchievements = [
    ACHIEVEMENT_DEFS.find((d) => d.id === 'prompt-50')!,
    ACHIEVEMENT_DEFS.find((d) => d.id === 'likes-1000')!,
    ACHIEVEMENT_DEFS.find((d) => d.id === 'views-100k')!,
    ACHIEVEMENT_DEFS.find((d) => d.id === 'mentor-50')!,
    ACHIEVEMENT_DEFS.find((d) => d.id === 'top-seller')!,
  ];
  const categories = Object.entries(CATEGORY_META) as [AchievementCategory, typeof CATEGORY_META[AchievementCategory]][];
  const rarities = Object.entries(RARITY_META) as [AchievementRarity, typeof RARITY_META[AchievementRarity]][];

  return (
    <section>
      <PanelHeader
        eyebrow="Section 04 / Gamification"
        title="Community Achievements"
        subtitle="Earn XP, level up, and unlock achievement badges by contributing to the GHRANK community."
      />
      <Prose>
        <ProseP>
          The GHRANK achievement system rewards active participation across the platform. Every action — publishing prompts, engaging in discussions, helping others — contributes to your XP total, which determines your level and unlocks achievement badges. Your level is displayed beside your name throughout the community, signaling your experience and standing.
        </ProseP>

        {/* ═══ 等级体系表 ═══ */}
        <ProseH3>Level System</ProseH3>
        <ProseP>
          There are 10 levels, from Initiate to Mythic. Each level requires a cumulative XP threshold. Your current level badge appears next to your username in community threads, replies, and your profile.
        </ProseP>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', margin: '20px 0' }}>
          {LEVELS.map((lvl) => (
            <div
              key={lvl.level}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                position: 'relative',
              }}
            >
              {/* 六边形等级图标 */}
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: lvl.color,
                  background: `${lvl.color.replace('var(--', 'rgba(').replace(')', ', 0.12)')}`,
                  clipPath: HEX_CLIP_PATH,
                  flexShrink: 0,
                }}
              >
                {lvl.icon}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: lvl.color,
                      letterSpacing: '0.04em',
                    }}
                  >
                    Lv.{lvl.level}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--text)',
                    }}
                  >
                    {lvl.name}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {lvl.minXp.toLocaleString()} XP · {lvl.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ XP 获取规则 ═══ */}
        <ProseH3>How to Earn XP</ProseH3>
        <ProseP>
          XP is awarded automatically based on your activity. The more you contribute, the faster you progress. Achievement unlocks also grant bonus XP.
        </ProseP>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '20px 0' }}>
          {XP_RULES.map((rule) => (
            <div
              key={rule.action}
              style={{
                padding: '14px 16px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text)',
                  }}
                >
                  {rule.action}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--gold)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {rule.xp}
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.02em',
                }}
              >
                {rule.desc}
              </span>
            </div>
          ))}
        </div>

        {/* ═══ 成就类别 ═══ */}
        <ProseH3>Achievement Categories</ProseH3>
        <ProseP>
          Badges are organized into five categories, each tracking a different dimension of community contribution. Each category contains multiple achievements across all rarity tiers.
        </ProseP>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '8px', margin: '20px 0' }}>
          {categories.map(([key, meta]) => {
            const count = ACHIEVEMENT_DEFS.filter((d) => d.category === key).length;
            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderLeft: `3px solid ${meta.color}`,
                }}
              >
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: meta.color,
                    background: `${meta.color.replace('var(--', 'rgba(').replace(')', ', 0.12)')}`,
                    clipPath: HEX_CLIP_PATH,
                    flexShrink: 0,
                  }}
                >
                  {meta.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--text)',
                      marginRight: '8px',
                    }}
                  >
                    {meta.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {count} achievements
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ 稀有度 ═══ */}
        <ProseH3>Rarity Tiers</ProseH3>
        <ProseP>
          Every achievement is assigned a rarity tier. Higher-tier achievements are harder to unlock but grant more XP. Legendary achievements are reserved for truly exceptional milestones.
        </ProseP>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', margin: '20px 0' }}>
          {rarities.map(([key, meta]) => {
            const count = ACHIEVEMENT_DEFS.filter((d) => d.rarity === key).length;
            return (
              <div
                key={key}
                style={{
                  padding: '16px 12px',
                  textAlign: 'center',
                  background: meta.glow,
                  border: `1px solid ${meta.color}`,
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: meta.color,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                  }}
                >
                  {meta.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--text)',
                  }}
                >
                  {count}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Badges
                </span>
              </div>
            );
          })}
        </div>

        {/* ═══ 示例成就 ═══ */}
        <ProseH3>Example Achievements</ProseH3>
        <ProseP>
          Here are five representative badges from each category. Visit your profile to see all achievements and track your progress.
        </ProseP>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', margin: '20px 0' }}>
          {exampleAchievements.map((def) => {
            const rarity = RARITY_META[def.rarity];
            const catMeta = CATEGORY_META[def.category];
            return (
              <div
                key={def.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 10px',
                  textAlign: 'center',
                  background: rarity.glow,
                  border: `1px solid ${rarity.color}`,
                }}
              >
                {/* 六边形徽章图标 */}
                <span
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: rarity.color,
                    background: `${rarity.color.replace('var(--', 'rgba(').replace(')', ', 0.1)')}`,
                    clipPath: HEX_CLIP_PATH,
                  }}
                >
                  {def.icon}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--text)',
                    lineHeight: 1.3,
                  }}
                >
                  {def.name}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: catMeta.color,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {catMeta.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'var(--gold)',
                  }}
                >
                  +{def.rewardXp} XP
                </span>
              </div>
            );
          })}
        </div>

        <ProseH3>Where Badges Appear</ProseH3>
        <ProseList
          items={[
            <><strong style={{ color: 'var(--text)', fontWeight: 700 }}>Profile Header</strong> — your current level badge and XP progress bar are prominently displayed</>,
            <><strong style={{ color: 'var(--text)', fontWeight: 700 }}>Profile Sidebar</strong> — a compact level overview and your four most recently unlocked achievements</>,
            <><strong style={{ color: 'var(--text)', fontWeight: 700 }}>Profile Achievements Tab</strong> — the full achievement grid with category filtering and progress tracking</>,
            <><strong style={{ color: 'var(--text)', fontWeight: 700 }}>Community Threads</strong> — a level badge appears beside each author&apos;s name in thread listings and replies</>,
          ]}
        />
      </Prose>
    </section>
  );
}

/** 面板 05：Terms of Service —— 服务条款 */
export function TermsPanel() {
  return (
    <section>
      <PanelHeader
        eyebrow="Section 05 / Legal"
        title="Terms of Service"
        subtitle="The agreement between you and GHRANK. Last updated 2026-07-26."
      />
      <Prose>
        <ProseP>
          By accessing GHRANK you agree to the terms below. These terms are written in plain language — if a section is ambiguous, the plain-language meaning controls.
        </ProseP>
        {TERMS.map((term) => (
          <div
            key={term.title}
            style={{
              marginBottom: '24px',
              paddingInlineStart: '16px',
              borderInlineStart: '2px solid var(--border)',
            }}
          >
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--gold)',
                margin: '0 0 10px',
              }}
            >
              {term.title}
            </h4>
            <p style={{ margin: 0 }}>{term.body}</p>
          </div>
        ))}
      </Prose>
    </section>
  );
}

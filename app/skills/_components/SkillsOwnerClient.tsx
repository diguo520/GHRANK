/**
 * SkillsOwnerClient —— 创作者页客户端组件
 * 迁移自 skills.js 的 initOwnerPage
 * 职责：排序切换 + 技能列表渲染
 * 接收服务端获取的 owner 数据和技能列表，提供排序交互
 */
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  sortSkills,
  formatNumber,
  type Owner,
  type Skill,
  type SortMode,
} from '../_data/skills-data';
import SkillsGrid from '../_components/SkillsGrid';

/* ═══════════════════════════════════════════════════════════════
   排序选项
   ═══════════════════════════════════════════════════════════════ */
const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: 'allTime', label: 'All Time' },
  { mode: 'trending', label: 'Trending' },
  { mode: 'hot', label: 'Hot' },
];

interface SkillsOwnerClientProps {
  /** 创作者信息 */
  owner: Owner;
  /** 该创作者发布的全部技能（未排序） */
  ownerSkills: Skill[];
}

export default function SkillsOwnerClient({ owner, ownerSkills }: SkillsOwnerClientProps) {
  const [sort, setSort] = useState<SortMode>('allTime');

  // 按当前排序模式排序技能列表
  const sortedSkills = useMemo(
    () => sortSkills(ownerSkills, sort),
    [ownerSkills, sort],
  );

  // 过滤签名：排序变化时让 SkillsGrid 重新挂载，重置骨架屏状态
  const gridKey = `owner-${owner.id}|${sort}`;

  return (
    <main className="main-content">
      {/* ── Hero 区：创作者信息 ── */}
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
          {'\u25C6'} SKILL CREATOR {'\u25C6'}
        </div>

        {/* 创作者名称 */}
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
            {owner.name}
          </span>
        </h1>

        {/* 统计信息 */}
        <p
          className="skills-hero-sub"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
            color: 'var(--text-dim)',
            maxWidth: '620px',
            margin: '0 auto',
          }}
        >
          {formatNumber(owner.totalInstalls)} total installs ·{' '}
          {ownerSkills.length} skills published
        </p>
      </section>

      {/* ── 面包屑 + 排序切换栏 ── */}
      <section
        className="skills-controls"
        style={{
          maxWidth: '1200px',
          margin: '0 auto 28px',
          padding: '0 24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* 面包屑导航 */}
        <nav
          aria-label="breadcrumb"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Link
            href="/skills"
            style={{
              color: 'var(--text-dim)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            Skills
          </Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span style={{ color: 'var(--text)' }}>{owner.name}</span>
        </nav>

        {/* 排序按钮组 */}
        <div
          className="skills-tabs"
          style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
        >
          {SORT_OPTIONS.map((opt) => {
            const isActive = sort === opt.mode;
            return (
              <button
                key={opt.mode}
                className={`skills-tab ${isActive ? 'active' : ''}`}
                onClick={() => setSort(opt.mode)}
                style={{
                  padding: '10px 18px',
                  background: isActive ? 'var(--gold)' : 'var(--surface)',
                  border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border)'}`,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: isActive ? 'var(--bg)' : 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 技能列表 ── */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 64px',
        }}
      >
        {sortedSkills.length > 0 ? (
          <SkillsGrid
            key={gridKey}
            skills={sortedSkills}
            sortMode={sort}
          />
        ) : (
          /* 空列表占位 */
          <div
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--text-muted)',
              letterSpacing: '0.04em',
            }}
          >
            // NO SKILLS PUBLISHED YET
          </div>
        )}
      </div>
    </main>
  );
}

/**
 * SkillsMarket —— Skills 市场页主客户端组件
 * 迁移自 skills.js 的 initListPage
 * 职责：状态管理（筛选/搜索/排序）、URL 参数解析、布局编排
 * 包含：Hero + 搜索栏 + 侧边筛选面板 + 技能列表网格
 */

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  skills as ALL_SKILLS,
  sortSkills,
  categoryTree as CATEGORY_TREE,
  type SortMode,
} from '../_data/skills-data';
import SkillsHero from './SkillsHero';
import SkillsSidebar from './SkillsSidebar';
import SkillsGrid from './SkillsGrid';

interface SkillsMarketProps {
  /** 来自 URL ?category= 参数，用于初始筛选 */
  initialCategory?: string;
}

export default function SkillsMarket({ initialCategory }: SkillsMarketProps) {
  // ── 筛选状态 ──
  const [occupation, setOccupation] = useState('all');
  const [domain, setDomain] = useState('all');
  const [subcategory, setSubcategory] = useState('all');
  const [sort, setSort] = useState<SortMode>('allTime');

  // ── 搜索状态（输入值 + 防抖后的查询值）──
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── URL 参数初始化：支持从外部跳转后自动筛选 ──
  useEffect(() => {
    if (!initialCategory) return;
    const matchedDomain = CATEGORY_TREE.some((d) => d.id === initialCategory);
    if (matchedDomain) {
      setDomain(initialCategory);
    } else {
      setSearchInput(initialCategory);
      setDebouncedQuery(initialCategory);
    }
  }, [initialCategory]);

  // ── 搜索防抖：200ms 延迟后更新查询值 ──
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 200);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchInput]);

  // ── 筛选 + 排序（useMemo 缓存，仅在依赖变化时重算）──
  const filteredSkills = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    const filtered = ALL_SKILLS.filter((skill) => {
      // 职业筛选
      if (occupation !== 'all' && skill.occupation !== occupation) return false;
      // 领域筛选
      if (domain !== 'all' && skill.domain !== domain) return false;
      // 子分类筛选
      if (subcategory !== 'all' && skill.subcategory !== subcategory) return false;
      // 关键词搜索
      if (!q) return true;
      const haystack = (
        skill.name + ' ' +
        skill.repo + ' ' +
        skill.description + ' ' +
        skill.category.join(' ') + ' ' +
        skill.tags.join(' ')
      ).toLowerCase();
      return haystack.includes(q);
    });
    return sortSkills(filtered, sort);
  }, [occupation, domain, subcategory, sort, debouncedQuery]);

  // ── 过滤签名：用于 SkillsGrid 的 key，筛选变化时重新挂载 ──
  const filterSignature = `${occupation}|${domain}|${subcategory}|${sort}|${debouncedQuery}`;

  // ── 事件处理 ──

  /** Domain 变化时重置 subcategory（联动逻辑） */
  function handleDomainChange(value: string) {
    setDomain(value);
    setSubcategory('all');
  }

  /** Clear All：重置全部筛选条件 */
  function handleClearAll() {
    setOccupation('all');
    setDomain('all');
    setSubcategory('all');
    setSort('allTime');
    setSearchInput('');
    setDebouncedQuery('');
  }

  return (
    <main className="main-content">
      {/* Hero 统计区 */}
      <SkillsHero />

      {/* 搜索栏 */}
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
        <div className="skills-search" style={{ position: 'relative', flex: '1 1 320px', minWidth: '260px' }}>
          <span
            className="skills-search-icon"
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)',
              fontSize: '14px',
              pointerEvents: 'none',
            }}
          >
            {'\u{1F50D}\uFE0E'}
          </span>
          <input
            type="text"
            className="skills-search-input"
            placeholder="Search skills..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border)',
              borderRadius: 0,
              color: 'var(--text)',
              padding: '10px 16px 10px 36px',
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderBottomColor = 'var(--gold)'; }}
            onBlur={(e) => { e.target.style.borderBottomColor = 'var(--border)'; }}
          />
        </div>
      </section>

      {/* 主布局：侧边栏 + 列表 */}
      <div
        className="skills-layout"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 64px',
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: '28px',
        }}
      >
        {/* 侧边筛选面板 */}
        <SkillsSidebar
          occupation={occupation}
          domain={domain}
          subcategory={subcategory}
          sort={sort}
          onOccupationChange={setOccupation}
          onDomainChange={handleDomainChange}
          onSubcategoryChange={setSubcategory}
          onSortChange={setSort}
          onClearAll={handleClearAll}
        />

        {/* 技能列表网格 —— key 变化时重新挂载，重置分块加载状态 */}
        <SkillsGrid
          key={filterSignature}
          skills={filteredSkills}
          sortMode={sort}
        />
      </div>
    </main>
  );
}

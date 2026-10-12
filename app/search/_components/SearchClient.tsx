/**
 * SearchClient —— 搜索结果页交互主组件（v2.0 antd 迁移）
 *
 * 迁移内容：
 * - 搜索输入框 + 按钮 → antd Input.Search
 * - 清除按钮 → antd Input.Search 的 allowClear
 *
 * 保留：
 * - 英雄区装饰（金色细线、网格底纹、徽章、标题）
 * - 类型筛选 Chips / 排序下拉 / 分页 / 相关搜索
 * - 实时搜索、高亮匹配、类型过滤逻辑
 */
'use client';

import { useState, useMemo, CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from 'antd';
import { SearchIcon } from '@/components/shared/icons';
import {
  SEARCH_ALL_DATA,
  FILTER_CHIPS,
  SORT_OPTIONS,
  RELATED_SEARCHES,
  parseStars,
  parseTimeToMinutes,
  type SearchType,
  type SearchResult,
} from '../_data/search-data';
import SearchCard from './SearchCard';
import SearchSortDropdown from './SearchSortDropdown';
import SearchPagination from './SearchPagination';
import styles from '../search.module.css';

export default function SearchClient() {
  // 从 URL 查询参数读取初始搜索词，默认 'react'
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || 'react';

  const [inputValue, setInputValue] = useState(initialQuery);
  const [currentType, setCurrentType] = useState<SearchType>('community');
  const [sortIdx, setSortIdx] = useState(0);

  // ── 过滤 + 排序：根据类型、查询词、排序选项计算结果列表 ──
  const results = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    const data = SEARCH_ALL_DATA[currentType] || [];

    // 文本匹配：在 name / desc / tag / model 字段中搜索
    const filtered = query
      ? data.filter((item) => {
          const r = item as SearchResult & { tag?: string; model?: string };
          return (
            item.name.toLowerCase().includes(query) ||
            item.desc.toLowerCase().includes(query) ||
            (r.tag && r.tag.toLowerCase().includes(query)) ||
            (r.model && r.model.toLowerCase().includes(query))
          );
        })
      : data;

    // 排序
    const sorted = [...filtered];
    if (sortIdx === 1) {
      // Recently Updated：时间越小越新
      sorted.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
    } else if (sortIdx === 2) {
      // Name A-Z
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [inputValue, currentType, sortIdx]);

  const queryDisplay = inputValue.trim() || '*';
  const hasResults = results.length > 0;

  // ── 点击相关搜索标签 ──
  const handleRelatedClick = (tag: string) => {
    setInputValue(tag);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* ═══ 搜索英雄区 ═══ */}
      <section
        className="relative overflow-hidden text-center"
        style={{
          padding: '64px 32px 40px',
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(157,140,255,0.08) 0%, transparent 60%), linear-gradient(180deg, var(--bg) 0%, transparent 100%)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* 顶部金色细线装饰 */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 h-[2px] -translate-x-1/2"
          style={{ width: '280px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0.6 }}
        />
        {/* 网格底纹 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(157,140,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(157,140,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.5,
          }}
        />

        <div className="relative" style={{ zIndex: 1 }}>
          {/* 徽章 */}
          <div
            className="inline-block"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--gold)',
              letterSpacing: '0.18em',
              padding: '6px 18px',
              border: '1px solid rgba(157,140,255,0.35)',
              background: 'rgba(157,140,255,0.04)',
              marginBottom: '20px',
            }}
          >
            ◆ GLOBAL SEARCH ENGINE ◆
          </div>

          {/* 标题 */}
          <h1
            className="font-display font-extrabold"
            style={{ fontSize: 'clamp(40px, 6vw, 64px)', letterSpacing: '0.02em', lineHeight: 1, color: 'var(--text)', marginBottom: '14px' }}
          >
            FIND <span className="gold-glow">ANYTHING</span>
          </h1>

          {/* 副标题 */}
          <p
            className="mx-auto font-body"
            style={{ fontSize: '16px', color: 'var(--text-dim)', maxWidth: '560px', marginBottom: '32px' }}
          >
            Search across community posts, threads, and discussions
          </p>

          {/* 搜索栏 —— antd Input.Search */}
          <div className="mx-auto relative" style={{ maxWidth: '760px' }}>
            {/* 四角装饰（保留 HUD 风格） */}
            {/* 对角装饰：定位在容器内部，避免被圆角裁剪 */}
            <div className="pointer-events-none absolute top-0 left-0 h-[10px] w-[10px] z-10" style={{ borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)' }} />
            <div className="pointer-events-none absolute bottom-0 right-0 h-[10px] w-[10px] z-10" style={{ borderBottom: '2px solid var(--gold)', borderRight: '2px solid var(--gold)' }} />

            <Input.Search
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onSearch={(value) => setInputValue(value)}
              placeholder="Type to search community posts, threads..."
              enterButton="SEARCH"
              size="large"
              allowClear
              autoComplete="off"
              spellCheck={false}
              style={{
                background: 'var(--surface)',
              }}
            />
          </div>
        </div>
      </section>

      {/* ═══ 过滤器：类型 Chips + 排序 ═══ */}
      <div
        className="mx-auto flex flex-wrap items-center justify-between"
        style={{ maxWidth: '1280px', margin: '24px auto 0', padding: '0 32px', gap: '16px' }}
      >
        <div className="flex flex-wrap" style={{ gap: '8px' }}>
          {FILTER_CHIPS.map((chip) => {
            const isActive = currentType === chip.type;
            return (
              <button
                key={chip.type}
                className="inline-flex items-center"
                style={{
                  gap: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: isActive ? 'var(--gold)' : 'var(--text-dim)',
                  background: isActive ? 'rgba(157,140,255,0.06)' : 'var(--surface)',
                  border: '1px solid',
                  borderColor: isActive ? 'rgba(157,140,255,0.35)' : 'var(--border)',
                  padding: '7px 14px',
                  letterSpacing: '0.04em',
                  transition: 'color 0.18s, border-color 0.18s, background 0.18s',
                }}
                onClick={() => setCurrentType(chip.type)}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isActive ? 'var(--gold)' : 'var(--text-muted)',
                    boxShadow: isActive ? '0 0 8px rgba(157,140,255,0.6)' : 'none',
                    transition: 'background 0.18s, box-shadow 0.18s',
                  }}
                />
                {chip.label}
                <span style={{ color: isActive ? 'rgba(157,140,255,0.5)' : 'var(--text-muted)', fontWeight: 500 }}>
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
        <SearchSortDropdown sortIdx={sortIdx} onChange={setSortIdx} />
      </div>

      {/* ═══ 状态栏 ═══ */}
      <div
        className="mx-auto flex flex-wrap items-center justify-between"
        style={{ maxWidth: '1280px', margin: '28px auto 18px', padding: '14px 32px', gap: '16px', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex flex-wrap items-center" style={{ gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            // RESULTS FOR
          </span>
          <span className="font-display font-bold" style={{ fontSize: '15px', color: 'var(--gold)' }}>
            &ldquo;{queryDisplay}&rdquo;
          </span>
        </div>
        <div className="flex flex-wrap items-center" style={{ gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)' }}>
            Showing {results.length} results
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--green)',
              padding: '2px 8px',
              border: '1px solid rgba(63,185,80,0.25)',
              background: 'rgba(63,185,80,0.05)',
            }}
          >
            0.042s
          </span>
        </div>
      </div>

      {/* ═══ 结果网格 / 无结果状态 ═══ */}
      {hasResults ? (
        <div
          className="mx-auto grid"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 32px 32px',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '18px',
            alignContent: 'start',
          }}
        >
          {results.map((item, i) => (
            <SearchCard key={`${currentType}-${i}`} item={item} query={inputValue.trim()} />
          ))}
        </div>
      ) : (
        <div className="mx-auto text-center" style={{ maxWidth: '1280px', padding: '80px 32px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', animation: `${styles.noResultsPulse} 2s ease-in-out infinite` }}>
            <SearchIcon size={48} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          </div>
          <div className="font-display font-extrabold" style={{ fontSize: '24px', color: 'var(--text)', letterSpacing: '0.04em', marginBottom: '10px' }}>
            NO RESULTS FOUND
          </div>
          <div className="font-body" style={{ fontSize: '15px', color: 'var(--text-dim)', marginBottom: '24px' }}>
            Try adjusting your search terms or filters
          </div>
          <div className="flex flex-wrap justify-center" style={{ gap: '20px' }}>
            {['Check spelling', 'Use broader keywords', 'Try different category filters'].map((hint) => (
              <span
                key={hint}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  padding: '6px 14px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--surface)',
                }}
              >
                {hint}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 分页 ═══ */}
      {hasResults && <SearchPagination />}

      {/* ═══ 相关搜索 ═══ */}
      <div className="mx-auto" style={{ maxWidth: '1280px', margin: '0 auto 64px', padding: '24px 32px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '16px' }}>
          // RELATED SEARCHES
        </div>
        <div className="flex flex-wrap" style={{ gap: '10px' }}>
          {RELATED_SEARCHES.map((tag) => (
            <button
              key={tag}
              className="font-body font-semibold"
              style={{
                fontSize: '14px',
                color: 'var(--text-dim)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '8px 16px',
                transition: 'color 0.18s, border-color 0.18s, background 0.18s, transform 0.12s',
              }}
              onClick={() => handleRelatedClick(tag)}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--gold)';
                e.currentTarget.style.borderColor = 'rgba(157,140,255,0.35)';
                e.currentTarget.style.background = 'rgba(157,140,255,0.05)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-dim)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--surface)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

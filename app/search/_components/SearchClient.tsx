/**
 * SearchClient —— 搜索结果页交互主组件
 * 管理：搜索输入、类型筛选（Repos/Prompts/Community）、排序、结果渲染
 * 迁移自 search.js 的 SearchPage 组件
 * 保留：实时搜索、高亮匹配、类型过滤、排序下拉、分页、相关搜索
 */
'use client';

import { useState, useMemo, useRef, CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const [currentType, setCurrentType] = useState<SearchType>('repos');
  const [sortIdx, setSortIdx] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      // Stars 降序
      sorted.sort((a, b) => {
        const sa = 'stars' in a ? parseStars(a.stars) : 0;
        const sb = 'stars' in b ? parseStars(b.stars) : 0;
        return sb - sa;
      });
    } else if (sortIdx === 2) {
      // Recently Updated：时间越小越新
      sorted.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
    } else if (sortIdx === 3) {
      // Name A-Z
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [inputValue, currentType, sortIdx]);

  const queryDisplay = inputValue.trim() || '*';
  const hasResults = results.length > 0;

  // ── 清除搜索 ──
  const handleClear = () => {
    setInputValue('');
    inputRef.current?.focus();
  };

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
            'radial-gradient(ellipse at 50% 0%, rgba(245,197,24,0.08) 0%, transparent 60%), linear-gradient(180deg, var(--bg) 0%, transparent 100%)',
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
              'linear-gradient(rgba(245,197,24,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,197,24,0.03) 1px, transparent 1px)',
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
              border: '1px solid rgba(245,197,24,0.35)',
              background: 'rgba(245,197,24,0.04)',
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
            Search across repositories, prompts, news, and community resources
          </p>

          {/* 搜索栏 */}
          <div className="mx-auto" style={{ maxWidth: '760px', position: 'relative' }}>
            <div
              className={`${styles.searchHeroBar} flex items-center`}
              style={
                {
                  gap: '8px',
                  background: 'var(--surface)',
                  border: '1px solid',
                  borderColor: inputFocused ? 'rgba(245,197,24,0.35)' : 'var(--border)',
                  padding: '6px 6px 6px 18px',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxShadow: inputFocused ? '0 0 0 3px rgba(245,197,24,0.1), 0 0 24px rgba(245,197,24,0.08)' : 'none',
                  position: 'relative',
                } as CSSProperties
              }
            >
              {/* 四角装饰 */}
              <div className="pointer-events-none absolute top-[-1px] left-[-1px] h-[10px] w-[10px]" style={{ borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)' }} />
              <div className="pointer-events-none absolute bottom-[-1px] right-[-1px] h-[10px] w-[10px]" style={{ borderBottom: '2px solid var(--gold)', borderRight: '2px solid var(--gold)' }} />

              <span style={{ fontSize: '18px', color: 'var(--text-dim)', flexShrink: 0 }}>🔍︎</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Type to search repos, prompts, categories..."
                autoComplete="off"
                spellCheck={false}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: 'var(--text)',
                  padding: '10px 4px',
                }}
              />
              {inputValue && (
                <button
                  onClick={handleClear}
                  title="Clear search"
                  style={{
                    width: '28px',
                    height: '28px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-dim)',
                    fontSize: '18px',
                    lineHeight: 1,
                    flexShrink: 0,
                    transition: 'color 0.18s, border-color 0.18s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--orange)';
                    e.currentTarget.style.borderColor = 'rgba(232,93,4,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-dim)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  &times;
                </button>
              )}
              <button
                className="font-display"
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: 'var(--bg)',
                  background: 'var(--gold)',
                  border: '1px solid var(--gold)',
                  padding: '10px 24px',
                  flexShrink: 0,
                  transition: 'background 0.18s, box-shadow 0.18s, transform 0.12s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ffd028';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(245,197,24,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--gold)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                SEARCH
              </button>
            </div>
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
                  background: isActive ? 'rgba(245,197,24,0.06)' : 'var(--surface)',
                  border: '1px solid',
                  borderColor: isActive ? 'rgba(245,197,24,0.35)' : 'var(--border)',
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
                    boxShadow: isActive ? '0 0 8px rgba(245,197,24,0.6)' : 'none',
                    transition: 'background 0.18s, box-shadow 0.18s',
                  }}
                />
                {chip.label}
                <span style={{ color: isActive ? 'rgba(245,197,24,0.5)' : 'var(--text-muted)', fontWeight: 500 }}>
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
          <div style={{ fontSize: '56px', color: 'var(--gold)', opacity: 0.4, marginBottom: '20px', animation: `${styles.noResultsPulse} 2s ease-in-out infinite` }}>
            ⏳
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
                e.currentTarget.style.borderColor = 'rgba(245,197,24,0.35)';
                e.currentTarget.style.background = 'rgba(245,197,24,0.05)';
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

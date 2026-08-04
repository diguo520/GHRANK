'use client';

import { CSSProperties, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SEARCH_DATA } from '@/lib/config';

/** 搜索数据项类型 */
type SearchItem = (typeof SEARCH_DATA)[number];

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

/* ── 标签配色映射 —— 替代原始 CSS 类，按 tagClass 索引 ── */
const TAG_STYLE_MAP: Record<string, CSSProperties> = {
  'tag-frontend': { background: 'rgba(57, 210, 192, 0.12)', color: 'var(--cyan)', borderColor: 'rgba(57, 210, 192, 0.3)' },
  'tag-backend': { background: 'rgba(245, 197, 24, 0.12)', color: 'var(--gold)', borderColor: 'rgba(245, 197, 24, 0.3)' },
  'tag-ai': { background: 'rgba(163, 113, 247, 0.12)', color: 'var(--purple)', borderColor: 'rgba(163, 113, 247, 0.3)' },
  'tag-devops': { background: 'rgba(247, 120, 186, 0.12)', color: 'var(--pink)', borderColor: 'rgba(247, 120, 186, 0.3)' },
  'tag-games': { background: 'rgba(232, 93, 4, 0.12)', color: 'var(--orange)', borderColor: 'rgba(232, 93, 4, 0.3)' },
  'tag-mobile': { background: 'rgba(163, 113, 247, 0.12)', color: 'var(--purple)', borderColor: 'rgba(163, 113, 247, 0.3)' },
  'tag-data': { background: 'rgba(57, 210, 192, 0.12)', color: 'var(--cyan)', borderColor: 'rgba(57, 210, 192, 0.3)' },
};

/** 标签默认样式 —— 未命中 TAG_STYLE_MAP 时使用 */
const TAG_DEFAULT_STYLE: CSSProperties = {
  background: 'var(--surface-overlay)',
  color: 'var(--text-dim)',
  border: '1px solid var(--border-subtle)',
};

/**
 * 高亮匹配文字 —— 将查询匹配部分包裹金色 span
 * 使用 React 节点分割替代 dangerouslySetInnerHTML，避免 XSS 风险
 */
function highlightMatch(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return text;

  // 转义正则特殊字符，防止用户输入破坏正则
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <span key={i} style={{ color: 'var(--gold)' }}>{part}</span>
    ) : (
      part
    ),
  );
}

/* ═══════════════════════════════════════════════════════════════
   SearchResultItem —— 单条搜索结果
   ═══════════════════════════════════════════════════════════════ */
function SearchResultItem({
  item,
  isActive,
  query,
}: {
  item: SearchItem;
  isActive: boolean;
  query: string;
}) {
  const tagStyle = TAG_STYLE_MAP[item.tagClass] || TAG_DEFAULT_STYLE;

  return (
    <Link
      href={item.url}
      className="flex items-center gap-3 cursor-pointer transition-colors duration-150"
      style={{
        padding: 'var(--sp-3) var(--sp-4)',
        borderBottom: '1px solid var(--border-subtle)',
        background: isActive ? 'rgba(245, 197, 24, 0.08)' : 'transparent',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {/* 左侧圆形头像 —— 仓库名首字母 */}
      <div
        className="flex items-center justify-center flex-shrink-0 rounded-full"
        style={{
          width: '36px',
          height: '36px',
          background: 'var(--gold-subtle)',
          border: '1px solid rgba(245, 197, 24, 0.3)',
          color: 'var(--gold)',
          fontFamily: 'var(--font-display)',
          fontSize: '15px',
          fontWeight: 700,
        }}
      >
        {item.name.charAt(0).toUpperCase()}
      </div>

      {/* 中间信息区 */}
      <div className="flex-1 min-w-0">
        <div
          className="overflow-hidden text-ellipsis whitespace-nowrap mb-[2px]"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text)',
          }}
        >
          {highlightMatch(item.name, query)}
        </div>
        <div
          className="overflow-hidden text-ellipsis whitespace-nowrap"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--text-dim)',
            lineHeight: 1.4,
          }}
        >
          {item.desc}
        </div>
      </div>

      {/* 右侧元信息：星数 + 标签 */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--star-gold)' }}>
          {'\u2605'} {item.stars}
        </span>
        <span
          className="inline-block rounded-sm"
          style={{
            ...tagStyle,
            padding: '1px var(--sp-2)',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            fontWeight: 500,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          {item.tag}
        </span>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SearchOverlay —— 全屏搜索覆盖层
   支持：↑↓ 键盘导航 / Enter 打开 / ESC 关闭 / Ctrl+K 关闭
   ═══════════════════════════════════════════════════════════════ */
export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  /* 过滤搜索结果 —— 按名称、描述、标签匹配 */
  const results = useMemo<SearchItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_DATA.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        it.desc.toLowerCase().includes(q) ||
        it.tag.toLowerCase().includes(q),
    ).slice(0, 6);
  }, [query]);

  /* 外部 open 变化时：清空输入、重置选中、聚焦输入框 */
  useEffect(() => {
    if (open && inputRef.current) {
      setQuery('');
      setActiveIdx(-1);
      // 延迟聚焦，等待 DOM 过渡完成
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  /* 键盘导航：↑↓ 选择 / Enter 打开 / ESC 关闭 / Ctrl+K 关闭 */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ctrl+K —— 打开时关闭，关闭时不处理（由父组件负责打开）
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        if (open) {
          e.preventDefault();
          onClose();
        }
        return;
      }

      if (!open) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, -1));
      } else if (e.key === 'Enter' && activeIdx >= 0 && results[activeIdx]) {
        e.preventDefault();
        router.push(results[activeIdx].url);
      }
    }

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, results, activeIdx, onClose, router]);

  const hasQuery = query.trim().length > 0;
  const hasResults = results.length > 0;

  return (
    <div
      className="fixed inset-0 transition-opacity duration-200"
      style={{
        zIndex: 200,
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      {/* 背景遮罩 —— 点击关闭 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* 搜索容器 —— 居中，入场时上滑 */}
      <div
        className="relative mx-auto overflow-hidden rounded-lg"
        style={{
          maxWidth: '640px',
          marginTop: '80px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          transform: open ? 'translateY(0)' : 'translateY(-12px)',
          transition: 'transform 0.25s ease',
        }}
      >
        {/* 输入框区域 */}
        <div
          className="flex items-center gap-3"
          style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-xl flex-shrink-0" style={{ color: 'var(--text-dim)' }}>
            {'\u{1F50D}\uFE0E'}
          </span>
          <input
            type="text"
            ref={inputRef}
            placeholder="Search repos, categories, languages..."
            autoComplete="off"
            spellCheck="false"
            className="flex-1 bg-transparent border-none outline-hidden min-w-0"
            style={{
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
              fontSize: '18px',
              fontWeight: 500,
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(-1);
            }}
          />
          <span
            className="flex-shrink-0 rounded-sm"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              background: 'var(--surface-overlay)',
              padding: 'var(--sp-1) var(--sp-2)',
              border: '1px solid var(--border-subtle)',
              letterSpacing: '1px',
            }}
          >
            ESC
          </span>
        </div>

        {/* 搜索结果区域 */}
        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
          {hasQuery && !hasResults ? (
            /* 空状态 */
            <div
              className="flex flex-col items-center justify-center text-center gap-2"
              style={{ padding: 'var(--sp-7) var(--sp-4)' }}
            >
              <div className="text-[32px]" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                {'\u23F3'}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: 'var(--text-dim)' }}>
                No results found
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                Try a different search term
              </div>
            </div>
          ) : hasResults ? (
            <>
              {/* 结果区头部：标签 + 计数 */}
              <div
                className="flex items-center justify-between"
                style={{
                  padding: 'var(--sp-2) var(--sp-4)',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '1.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  // SEARCH RESULTS
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)' }}>
                  {results.length} of {SEARCH_DATA.length}
                </span>
              </div>

              {/* 结果列表 */}
              {results.map((item, idx) => (
                <SearchResultItem
                  key={idx}
                  item={item}
                  isActive={idx === activeIdx}
                  query={query}
                />
              ))}
            </>
          ) : null}
        </div>

        {/* 底部快捷键提示 */}
        <div
          className="flex items-center gap-4"
          style={{ padding: 'var(--sp-3) var(--sp-4)', borderTop: '1px solid var(--border)' }}
        >
          <span className="inline-flex items-center gap-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            <kbd style={kbdStyle}>{'\u2191'}{'\u2193'}</kbd> Navigate
          </span>
          <span className="inline-flex items-center gap-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            <kbd style={kbdStyle}>{'\u21B5'}</kbd> Open
          </span>
          <span className="inline-flex items-center gap-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            <kbd style={kbdStyle}>ESC</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── kbd 键盘按键样式 ── */
const kbdStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '22px',
  height: '20px',
  padding: '0 5px',
  background: 'var(--surface-overlay)',
  border: '1px solid var(--border)',
  borderRadius: '3px',
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  color: 'var(--text-dim)',
  lineHeight: 1,
};

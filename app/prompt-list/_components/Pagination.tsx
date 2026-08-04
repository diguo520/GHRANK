/**
 * Pagination —— Prompt 列表页底部分页导航
 * 迁移自 prompt-list.html 的 .pagination
 *
 * 结构：PAGE NAV 标签 + 上一页箭头 + 页码按钮 + 省略号 + 下一页箭头 + SEC 标签
 * 交互：点击页码切换当前页，首尾页禁用对应箭头
 *
 * 页码生成策略：始终显示首页/尾页/当前页±1，中间用省略号占位
 */
'use client';

interface PaginationProps {
  /** 当前页码（1-based） */
  currentPage: number;
  /** 总页数 */
  totalPages: number;
  /** 切换页码回调 */
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  /** 生成页码序列：首页/尾页/当前页相邻页，其余用 -1 表示省略号占位 */
  function buildPageList(): number[] {
    const pages: number[] = [];
    const window = 1; // 当前页左右各显示的页数

    for (let i = 1; i <= totalPages; i++) {
      // 首页、尾页、当前页窗口
      if (i === 1 || i === totalPages || (i >= currentPage - window && i <= currentPage + window)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== -1) {
        // 避免连续省略号
        pages.push(-1);
      }
    }
    return pages;
  }

  const pageList = buildPageList();
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div
      className="pagination flex flex-wrap items-center justify-center gap-1.5"
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '24px 32px 48px',
      }}
    >
      {/* 左侧标签 */}
      <span
        className="font-mono"
        style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 8px' }}
      >
        PAGE NAV
      </span>

      {/* 上一页箭头 */}
      <PageButton
        label="←"
        disabled={!canPrev}
        onClick={() => canPrev && onPageChange(currentPage - 1)}
      />

      {/* 页码按钮序列 */}
      {pageList.map((page, idx) => {
        if (page === -1) {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="font-mono"
              style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '0 4px' }}
            >
              ...
            </span>
          );
        }
        return (
          <PageButton
            key={page}
            label={String(page)}
            active={page === currentPage}
            onClick={() => onPageChange(page)}
          />
        );
      })}

      {/* 下一页箭头 */}
      <PageButton
        label="→"
        disabled={!canNext}
        onClick={() => canNext && onPageChange(currentPage + 1)}
      />

      {/* 右侧标签 */}
      <span
        className="font-mono"
        style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 8px' }}
      >
        SEC 2.4.1
      </span>
    </div>
  );
}

/* ═══ 子组件：单个页码按钮 ═══ */

function PageButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="font-mono font-semibold transition-all duration-150"
      style={{
        fontSize: '12px',
        color: active ? 'var(--bg)' : disabled ? 'var(--text-muted)' : 'var(--text-dim)',
        background: active ? 'var(--gold)' : 'var(--surface)',
        border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
        boxShadow: active ? '0 0 12px rgba(245, 197, 24, 0.25)' : 'none',
        padding: '8px 14px',
        cursor: disabled ? 'default' : 'pointer',
        letterSpacing: '0.04em',
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled) {
          e.currentTarget.style.color = 'var(--gold)';
          e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.35)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active && !disabled) {
          e.currentTarget.style.color = 'var(--text-dim)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }
      }}
    >
      {label}
    </button>
  );
}

/**
 * 骨架屏组件 —— 保留 EVE Online HUD 主题的 shimmer 效果
 * 包含 SkeletonCard、SkeletonLine、SkeletonAvatar
 */
import { CSSProperties } from 'react';
import { HEX_CLIP_PATH } from '@/lib/constants';

/* ── 通用 shimmer 背景样式 ── */
const shimmerBg: CSSProperties = {
  background:
    'linear-gradient(90deg, var(--surface) 25%, var(--surface-overlay) 50%, var(--surface) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: '4px',
};

/* ── 骨架文本行 ── */
export function SkeletonLine({
  width = '100%',
  height = '12px',
  className = '',
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`skeleton-line ${className}`}
      style={{ ...shimmerBg, width, height, borderRadius: '3px' }}
    />
  );
}

/* ── 六边形骨架头像 ── */
export function SkeletonAvatar({
  size = 48,
  shape = 'hex',
}: {
  size?: number;
  shape?: 'hex' | 'round';
}) {
  const clipPath =
    shape === 'hex'
      ? HEX_CLIP_PATH
      : 'circle(50%)';

  return (
    <div
      className="skeleton-avatar"
      style={{
        ...shimmerBg,
        width: `${size}px`,
        height: `${size}px`,
        clipPath,
        flexShrink: 0,
      }}
    />
  );
}

/* ── 骨架卡片 —— 与真实卡片尺寸一致，避免替换时布局抖动 ── */
export function SkeletonCard() {
  return (
    <div
      className="skeleton-card card"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: 'var(--sp-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
        minHeight: '140px',
        pointerEvents: 'none',
      }}
    >
      {/* 顶部：头像 + 文本行 */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <SkeletonAvatar size={48} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonLine width="55%" height="13px" />
          <SkeletonLine width="85%" height="11px" className="short" />
        </div>
      </div>
      {/* 标签行 */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <SkeletonLine width="60px" height="22px" />
      </div>
      {/* 统计行 */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
        <SkeletonLine width="50px" height="11px" />
        <SkeletonLine width="50px" height="11px" />
        <SkeletonLine width="40px" height="11px" />
        <SkeletonLine width="60px" height="11px" />
      </div>
    </div>
  );
}

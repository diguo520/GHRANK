/**
 * 骨架屏组件 —— 基于 Ant Design Skeleton
 *
 * 组件映射：
 * - SkeletonLine   → antd Skeleton.Input（文本行占位）
 * - SkeletonAvatar → antd Skeleton.Avatar（头像占位，hex 形状保留自定义）
 * - SkeletonButton → antd Skeleton.Button（按钮/标签占位）
 * - SkeletonImage  → antd Skeleton.Image（图片占位）
 * - SkeletonCard   → antd Skeleton 组合（卡片骨架，与真实卡片尺寸一致）
 *
 * 文档：https://ant.design/components/skeleton-cn
 */
import { Skeleton as AntSkeleton } from 'antd';
import type { CSSProperties } from 'react';
import { HEX_CLIP_PATH } from '@/lib/constants';

/**
 * 全站统一 shimmer 背景样式（深灰基底 + 白色扫光叠加）
 * ✅ 唯一标准来源：全站所有骨架屏形状必须直接引用此导出，禁止在本地重复定义
 *
 * - 基底色 rgba(255,255,255,0.08)：保证在深色背景上的最小可见对比度
 * - 扫光两端全透明 → 中间 0.28 高亮：形成「白色光斑」自然流动效果
 * - backgroundSize 300%：配合 @keyframes shimmer (300% → -300%) 扫光全覆盖
 * - 1.5s ease-in-out：柔和的加速减速节奏，避免机械感
 */
export const shimmerBg: CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.08)',
  backgroundImage:
    'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 100%)',
  backgroundSize: '300% 100%',
  animation: 'shimmer 1.5s ease-in-out infinite',
  borderRadius: '4px',
};

/* ── 骨架文本行 —— antd Skeleton.Input ── */
export function SkeletonLine({
  width = '100%',
  height = '12px',
  className = '',
}: {
  width?: string | number;
  height?: string | number;
  className?: string;
}) {
  return (
    <AntSkeleton.Input
      active
      size="small"
      className={className}
      style={{
        width,
        height,
        borderRadius: '3px',
      }}
    />
  );
}

/* ── 骨架按钮/标签 —— antd Skeleton.Button ── */
export function SkeletonButton({
  width = '60px',
  height = '22px',
  shape = 'round',
  size = 'small',
  block = false,
  className = '',
}: {
  width?: string | number;
  height?: string | number;
  shape?: 'default' | 'round' | 'square' | 'circle';
  size?: 'large' | 'medium' | 'small';
  block?: boolean;
  className?: string;
}) {
  return (
    <AntSkeleton.Button
      active
      shape={shape}
      size={size}
      block={block}
      className={className}
      style={{ width, height }}
    />
  );
}

/* ── 骨架图片 —— antd Skeleton.Image ── */
export function SkeletonImage({
  width = '100%',
  height = 120,
  className = '',
}: {
  width?: string | number;
  height?: number;
  className?: string;
}) {
  return (
    <AntSkeleton.Image
      active
      className={className}
      style={{ width, height }}
    />
  );
}

/* ── 骨架头像 —— antd Skeleton.Avatar（hex 形状保留自定义） ── */
export function SkeletonAvatar({
  size = 48,
  shape = 'hex',
}: {
  size?: number;
  shape?: 'hex' | 'round' | 'square';
}) {
  // hex 形状保留自定义实现（项目独特 HUD 视觉）
  if (shape === 'hex') {
    return (
      <div
        className="skeleton-avatar"
        style={{
          ...shimmerBg,
          width: `${size}px`,
          height: `${size}px`,
          clipPath: HEX_CLIP_PATH,
          flexShrink: 0,
        }}
      />
    );
  }

  // round / square 形状使用 antd Skeleton.Avatar
  const antdShape = shape === 'round' ? 'circle' : 'square';
  return <AntSkeleton.Avatar active size={size} shape={antdShape} />;
}

/* ── 骨架卡片 —— 与真实卡片尺寸一致，避免替换时布局抖动
   注意：antd v6 的 <Skeleton avatar title paragraph> 组合渲染时
   paragraph 的 <ul> 在 loading=true 下为空，且 children 不会渲染。
   因此这里改用纯 div + shimmerBg 组合，确保所有形状都可见且样式统一。
   结构参照 LeaderboardCard：头像 + 标题 + 描述 + 标签 + 统计 + 底部 ── */
export function SkeletonCard() {
  return (
    <div
      className="skeleton-card card"
      style={{
        background: 'transparent',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: 'var(--sp-4)',
        minHeight: '140px',
        pointerEvents: 'none',
      }}
    >
      {/* 顶部：头像 + 标题/描述 */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
        {/* hex 头像占位 */}
        <div
          style={{
            ...shimmerBg,
            width: '48px',
            height: '48px',
            clipPath: HEX_CLIP_PATH,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* 标题行 */}
          <div style={{ ...shimmerBg, width: '55%', height: '15px' }} />
          {/* 描述行 1 */}
          <div style={{ ...shimmerBg, width: '85%', height: '11px' }} />
          {/* 描述行 2 */}
          <div style={{ ...shimmerBg, width: '60%', height: '11px' }} />
        </div>
      </div>

      {/* 标签行 */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        <div style={{ ...shimmerBg, width: '60px', height: '18px', borderRadius: '2px' }} />
        <div style={{ ...shimmerBg, width: '48px', height: '18px', borderRadius: '2px' }} />
      </div>

      {/* 统计行 */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <div style={{ ...shimmerBg, width: '50px', height: '12px' }} />
        <div style={{ ...shimmerBg, width: '50px', height: '12px' }} />
        <div style={{ ...shimmerBg, width: '40px', height: '12px' }} />
        <div style={{ ...shimmerBg, width: '60px', height: '12px' }} />
        {/* sparkline 占位 */}
        <div style={{ ...shimmerBg, width: '50px', height: '16px', marginLeft: 'auto' }} />
      </div>

      {/* 底部：时间 + 点赞 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '12px',
        }}
      >
        <div style={{ ...shimmerBg, width: '70px', height: '11px' }} />
        <div style={{ ...shimmerBg, width: '50px', height: '11px' }} />
      </div>
    </div>
  );
}

// 默认导出 antd Skeleton 以便外部直接引用
export default AntSkeleton;

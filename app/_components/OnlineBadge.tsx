/**
 * OnlineBadge —— 用户头像在线状态标识
 *
 * 绿色圆点 + 脉冲扩散动画，表示用户当前在线。
 * 仅在当前用户已登录时由调用方决定是否渲染。
 *
 * 用法：<OnlineBadge /> 或 <OnlineBadge size={10} />
 */
'use client';

import type { CSSProperties } from 'react';

interface OnlineBadgeProps {
  /** 绿点直径（px），默认 12 */
  size?: number;
  /** 额外样式（如定位） */
  style?: CSSProperties;
}

export default function OnlineBadge({ size = 12, style }: OnlineBadgeProps) {
  return (
    <span
      className="online-badge absolute rounded-full"
      style={{
        bottom: '-2px',
        right: '-2px',
        width: `${size}px`,
        height: `${size}px`,
        background: 'var(--green)',
        border: '2px solid var(--surface)',
        zIndex: 2,
        animation: 'online-pulse 2s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

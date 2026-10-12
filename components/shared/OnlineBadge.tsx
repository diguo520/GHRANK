/**
 * OnlineBadge —— 用户在线状态标识
 *
 * 绿色圆点 + 脉冲扩散动画，表示用户当前在线。
 * 支持两种模式：
 *   - 头像角标（默认）：absolute 定位在头像右下角
 *   - 内联（inline）：在用户 ID 右侧行内显示
 *
 * 用法：<OnlineBadge /> 或 <OnlineBadge size={8} inline />
 */
'use client';

import type { CSSProperties } from 'react';

interface OnlineBadgeProps {
  /** 绿点直径（px），默认 12 */
  size?: number;
  /** 内联模式：在用户名右侧行内显示，而非头像角标 */
  inline?: boolean;
  /** 额外样式（如定位） */
  style?: CSSProperties;
}

export default function OnlineBadge({ size = 12, inline = false, style }: OnlineBadgeProps) {
  const baseStyle: CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    background: 'var(--green)',
    animation: 'online-pulse 2s ease-in-out infinite',
    flexShrink: 0,
    ...style,
  };

  if (inline) {
    // 内联模式：在用户名右侧显示，不带边框
    return (
      <span
        className="online-badge inline-block rounded-full"
        style={{
          ...baseStyle,
          marginLeft: '2px',
        }}
        title="Online"
      />
    );
  }

  // 头像角标模式：absolute 定位在头像右下角
  return (
    <span
      className="online-badge absolute rounded-full"
      style={{
        ...baseStyle,
        bottom: '-2px',
        right: '-2px',
        border: '2px solid var(--surface)',
        zIndex: 2,
      }}
    />
  );
}

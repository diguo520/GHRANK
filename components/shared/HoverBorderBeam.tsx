'use client';

import { useState, type ReactNode, type CSSProperties } from 'react';
import { BorderBeam } from 'antd';

/**
 * HoverBorderBeam —— 全站统一的卡片悬停流光包装组件
 *
 * 使用 Ant Design BorderBeam 实现，鼠标悬停时显示紫色流光边框动画。
 * BorderBeam 需要通过 children 获取真实 DOM 节点以插入流光层，
 * 因此 children 始终包裹在 BorderBeam 内，通过外层 CSS opacity 控制流光显隐，
 * 避免条件渲染导致 children 卸载重挂载（会触发卡片入场动画重播）。
 */
export default function HoverBorderBeam({
  children,
  duration = 12,
  size = 100,
  lineWidth = 1,
  borderRadius = 'inherit',
  style,
}: {
  children: ReactNode;
  duration?: number;
  size?: number;
  lineWidth?: number;
  borderRadius?: string | number;
  style?: CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ position: 'relative', borderRadius, height: '100%', ...style }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <BorderBeam
        duration={duration}
        size={size}
        lineWidth={lineWidth}
        color={[
          { color: 'rgba(157, 140, 255, 0)', percent: 0 },
          { color: 'rgba(157, 140, 255, 0.8)', percent: 40 },
          { color: 'rgba(157, 140, 255, 0)', percent: 100 },
        ]}
      >
        {/* 内层容器继承圆角，供 BorderBeam 读取 border-radius；hovered 控制 opacity 显隐流光 */}
        <div
          className="hover-border-beam-host"
          style={{
            position: 'relative',
            borderRadius: 'inherit',
            height: '100%',
          }}
          data-hovered={hovered ? '1' : '0'}
        >
          {children}
        </div>
      </BorderBeam>
      <style>{`
        .hover-border-beam-host[data-hovered="0"] .ant-border-beam { opacity: 0; }
        .hover-border-beam-host[data-hovered="1"] .ant-border-beam { opacity: 1; transition: opacity 0.2s ease; }
      `}</style>
    </div>
  );
}

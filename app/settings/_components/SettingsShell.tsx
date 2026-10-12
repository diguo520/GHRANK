/**
 * SettingsShell —— 设置页内容区头部
 *
 * lobehub 风格：仅渲染页面标题 + 副标题 + children
 * 左侧导航由 SettingsLayoutShell 统一渲染，子页面无需再包含 sidebar
 */
import type { ReactNode } from 'react';

interface SettingsShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function SettingsShell({ title, subtitle, children }: SettingsShellProps) {
  return (
    <div>
      <header style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.01em',
            margin: '0 0 6px',
          }}
        >
          {title}
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dim)', margin: 0 }}>
          {subtitle}
        </p>
      </header>
      {children}
    </div>
  );
}

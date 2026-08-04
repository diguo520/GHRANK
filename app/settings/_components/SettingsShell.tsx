/**
 * SettingsShell —— 设置页两栏布局外壳
 *
 * 左侧：页面具体内容
 * 右侧：sticky 设置菜单（SettingsSidebar）
 * 风格与 5318 资源社区账户页保持一致
 */
import type { ReactNode } from 'react';
import SettingsSidebar from './SettingsSidebar';

interface SettingsShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function SettingsShell({ title, subtitle, children }: SettingsShellProps) {
  return (
    <main className="main-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px 64px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '26px',
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

      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 280px', alignItems: 'start' }}>
        <div>{children}</div>
        <SettingsSidebar />
      </div>
    </main>
  );
}

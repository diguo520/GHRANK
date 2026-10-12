/**
 * Settings layout —— lobehub 风格：左侧分组导航 + 右侧内容区
 *
 * layout.tsx 为服务端组件（导出 metadata），
 * 实际布局由 SettingsLayoutShell（客户端）渲染
 */
import type { ReactNode } from 'react';
import SettingsLayoutShell from './_components/SettingsLayoutShell';

export const metadata = { title: 'Settings // GHRANK' };

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <SettingsLayoutShell>{children}</SettingsLayoutShell>;
}

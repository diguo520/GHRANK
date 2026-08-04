/**
 * Settings layout —— metadata exported server-side because pages are client components
 */
import type { ReactNode } from 'react';

export const metadata = { title: 'Settings // GHRANK' };

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}

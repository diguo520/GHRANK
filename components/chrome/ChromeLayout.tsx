/**
 * ChromeLayout —— 客户端 chrome 层组合组件
 * 协调 Ticker / Navbar / Footer / SearchOverlay / UserCenterSidebar
 * 替代原 core.js 的 ChromeHost portal 模式
 */
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Ticker from './Ticker';
import Navbar from './Navbar';
import Footer from './Footer';
import SearchOverlay from './SearchOverlay';
import UserCenterSidebar from './UserCenterSidebar';
import SideNav from './SideNav';
import FloatingMessages from './FloatingMessages';
import { useGsapAnimations } from '@/hooks/useGsapAnimations';
import { getConfig } from '@/lib/config';
import { AppEventProvider } from '@/components/providers/AppEventContext';

export default function ChromeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  // 从路径推断当前页面名
  const page = pathname === '/' ? 'index' : pathname.slice(1);
  const config = getConfig(page);

  // GSAP 入场动画 —— 仅在首页 Hero 区域存在时生效
  useGsapAnimations();

  // Ctrl+K 快捷键打开搜索
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <AppEventProvider>
      {/* 扫描线动画 */}
      <div className="scan-line" />

      {/* 顶部滚动播报条 */}
      <Ticker config={config} />

      {/* 主导航栏 */}
      <Navbar config={config} currentPage={page} onOpenSearch={() => setSearchOpen(true)} />

      {/* 页面主体 */}
      {children}

      {/* 页脚 */}
      <Footer config={config} />

      {/* 搜索覆盖层 */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* 用户中心抽屉 */}
      <UserCenterSidebar />

      {/* 右侧悬浮导航（通知/消息/钱包/笔记/发帖/设置/回到顶部） */}
      <SideNav />

      {/* 右下角浮动消息（Facebook/Twitter 风格） */}
      <FloatingMessages />
    </AppEventProvider>
  );
}

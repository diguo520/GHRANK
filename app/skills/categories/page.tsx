/**
 * Skills 分类排行页 —— Next.js App Router 入口
 * 服务端组件：导出 metadata，渲染客户端组件
 * Chrome 层（Navbar/Footer/Ticker）由 ChromeLayout 统一处理，页面只包含 main 区域
 */

import type { Metadata } from 'next';
import SkillsCategoriesClient from '../_components/SkillsCategoriesClient';

export const metadata: Metadata = {
  title: 'Skills Categories // GHRANK',
};

export default function SkillsCategoriesPage() {
  return <SkillsCategoriesClient />;
}

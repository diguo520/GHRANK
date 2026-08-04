/**
 * Skills 市场页 —— Next.js App Router 入口
 * 服务端组件：导出 metadata，读取 URL 参数，渲染客户端组件
 * Chrome 层（Navbar/Footer/Ticker）由 ChromeLayout 统一处理，页面只包含 main 区域
 */

import SkillsMarket from './_components/SkillsMarket';

export const metadata = { title: 'Skills // GHRANK' };

interface SkillsPageProps {
  /** URL 查询参数（Next.js 16 起为 Promise，需 await） */
  searchParams: Promise<{ category?: string }>;
}

export default async function SkillsPage({ searchParams }: SkillsPageProps) {
  const { category } = await searchParams;
  // 支持 ?category=xxx 从外部跳转后自动筛选
  return <SkillsMarket initialCategory={category} />;
}

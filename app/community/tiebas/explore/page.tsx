/**
 * Tieba Explore（加入贴吧组页面）
 * 路由：/community/tiebas/explore
 *
 * 全景：50+ 贴吧卡片，按 6 大类分区 + 关键字搜索 + 分页
 *       + 加入/已加入状态（localStorage 持久化）+ 官方推荐高亮
 *
 * 布局：左栏（快速导航+分类计数）+ 中栏（Hero + 搜索 + 分类Tab + 卡片网格 + 分页）
 *       + 右栏（社区统计 + 推荐贴吧 + 规则）
 * Chrome 层（Ticker/Navbar/Footer）由 ChromeLayout 统一处理
 */
import ExploreTiebasPage from './_components/ExploreTiebasPage';

export const metadata = {
  title: 'Join Tieba Groups // GHRANK',
  description:
    'Browse and join 50+ tieba groups on GHRANK: AI Agents, RAG, DevTools, Frontend, Open Source and Career communities for AI & open-source builders.',
};

export default function TiebasExploreRoute() {
  return (
    <main className="main-content">
      <ExploreTiebasPage />
    </main>
  );
}

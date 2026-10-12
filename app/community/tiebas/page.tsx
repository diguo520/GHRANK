/**
 * 贴吧列表页 —— Next.js App Router
 * 3 栏布局：左栏（相关贴吧+热门贴吧+版权）+ 中栏（面包屑+Tieba Hero+Tabs+帖子列表）+ 右栏（贴吧信息+规则+版主+广告）
 *
 * searchParams：
 *   - bar: 贴吧 ID（决定贴吧信息卡、Hero、面包屑内容），默认 ai-agents
 *
 * 响应式：xl(1280+) 三栏 / lg(1024+) 两栏（隐藏右栏）/ 默认单栏
 * Chrome 层（Ticker/Navbar/Footer 等）由 ChromeLayout 统一处理，此处仅含 main 区域
 */
import CommunitySidebar from '../_components/CommunitySidebar';
import TiebasPostList from './_components/TiebasPostList';
import TiebasRightPanel from './_components/TiebasRightPanel';
import { findBar } from './_data/community-tiebas-data';

export const metadata = { title: 'Tieba // GHRANK' };

export default async function CommunityTiebasPage({
  searchParams,
}: {
  searchParams: Promise<{ bar?: string }>;
}) {
  // 从 URL 获取贴吧 ID，默认 ai-agents
  const params = await searchParams;
  const barId = params.bar || 'ai-agents';
  const bar = findBar(barId);

  return (
    <main className="main-content">
      {/* 3 栏布局：响应式 grid，右栏在 xl 以下隐藏 */}
      <div className="grid gap-5 lg:gap-6 py-6 pb-16 items-start grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_300px]">
        {/* 左栏：与社区首页保持一致 */}
        <CommunitySidebar />
        {/* 中栏：面包屑 + Tieba Hero + Tabs + 帖子列表 */}
        <TiebasPostList bar={bar} />
        {/* 右栏：贴吧信息 + 规则 + 版主 + 广告（xl 以上显示） */}
        <div className="hidden xl:block">
          <TiebasRightPanel bar={bar} />
        </div>
      </div>
    </main>
  );
}

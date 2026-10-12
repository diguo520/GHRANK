/**
 * 标签详情页 —— Next.js App Router
 * 3 栏布局：左栏（标签热度排名+社区统计+版权）+ 中栏（面包屑+Tag Hero+Tabs+帖子列表）+ 右栏（创建贴吧+热门贴吧+广告）
 *
 * searchParams：
 *   - tag: 标签名（决定 Hero、面包屑、帖子池内容），默认 AI-Agents
 *
 * 响应式：xl(1280+) 三栏 / lg(1024+) 两栏（隐藏右栏）/ 默认单栏
 * Chrome 层（Ticker/Navbar/Footer 等）由 ChromeLayout 统一处理，此处仅含 main 区域
 *
 * 复用策略：
 *   - 左栏复用 CommunitySidebar（传入 activeTag 高亮当前标签）
 *   - 右栏复用 CommunityRightPanel（创建贴吧+热门贴吧+广告）
 *   - 中栏使用专属 TagPostList 组件
 */
import CommunitySidebar from '../_components/CommunitySidebar';
import TagPostList from './_components/TagPostList';
import CommunityRightPanel from '../_components/CommunityRightPanel';

export const metadata = { title: 'Community Tag // GHRANK' };

export default async function CommunityTagPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  // 从 URL 获取标签名，默认 AI-Agents
  const params = await searchParams;
  const tag = params.tag || 'AI-Agents';

  return (
    <main className="main-content">
      {/* 3 栏布局：响应式 grid，右栏在 xl 以下隐藏 */}
      <div className="grid gap-5 lg:gap-6 py-6 pb-16 items-start grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_300px]">
        {/* 左栏：标签热度排名 + 社区统计 + 版权（复用社区组件，高亮当前标签） */}
        <CommunitySidebar activeTag={tag} />
        {/* 中栏：面包屑 + Tag Hero + Tabs + 帖子列表 */}
        <TagPostList tag={tag} />
        {/* 右栏：创建贴吧 + 热门贴吧 + 广告（xl 以上显示） */}
        <div className="hidden xl:block">
          <CommunityRightPanel />
        </div>
      </div>
    </main>
  );
}

/**
 * 社区页面 —— 3 栏布局
 * 左栏：标签热度排名 + 社区统计 + 版权
 * 中栏：Hero + 公告 + Tabs + 帖子列表（骨架屏+IO+分块加载）
 * 右栏：创建贴吧 + 热门贴吧 + 广告
 *
 * 响应式：xl(1280+) 三栏 / lg(1024+) 两栏（隐藏右栏）/ 默认单栏
 * Chrome 层（Ticker/Navbar/Footer 等）由 ChromeLayout 统一处理，此处仅含 main 区域
 */
import CommunitySidebar from './_components/CommunitySidebar';
import PostList from './_components/PostList';
import CommunityRightPanel from './_components/CommunityRightPanel';

export const metadata = { title: 'Community // GHRANK' };

export default function CommunityPage() {
  return (
    <main className="main-content">
      {/* 3 栏布局：响应式 grid，右栏在 xl 以下隐藏 */}
      <div className="grid gap-5 lg:gap-6 py-6 pb-16 items-start grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_300px]">
        <CommunitySidebar />
        <PostList />
        <div className="hidden xl:block">
          <CommunityRightPanel />
        </div>
      </div>
    </main>
  );
}

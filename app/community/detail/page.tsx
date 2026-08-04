/**
 * 社区帖子详情页 —— Next.js App Router
 * 3 栏布局：左栏（作者卡+贴吧卡+热门贴吧）+ 中栏（帖子详情+回复+编辑器）+ 右栏（创建贴吧+热门贴吧）
 *
 * searchParams：
 *   - bar: 贴吧 ID（决定左栏贴吧信息卡内容与面包屑），默认 ai-agents
 *   - id:  帖子 ID（预留，当前使用静态帖子数据）
 *
 * 响应式：xl(1280+) 三栏 / lg(1024+) 两栏（隐藏右栏）/ 默认单栏
 * Chrome 层（Ticker/Navbar/Footer 等）由 ChromeLayout 统一处理，此处仅含 main 区域
 */
import { ToastProvider } from './_components/ToastContext';
import DetailSidebar from './_components/DetailSidebar';
import CommunityDetailMain from './_components/CommunityDetailMain';
import CommunityRightPanel from '../_components/CommunityRightPanel';

export const metadata = { title: 'Community Post Detail // GHRANK' };

export default async function CommunityDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; bar?: string }>;
}) {
  // 从 URL 获取贴吧 ID，默认 ai-agents
  const params = await searchParams;
  const barId = params.bar || 'ai-agents';

  return (
    <main className="main-content">
      {/* ToastProvider 包裹所有需要 Toast 反馈的交互组件 */}
      <ToastProvider>
        {/* 3 栏布局：响应式 grid，右栏在 xl 以下隐藏 */}
        <div className="grid gap-5 lg:gap-6 py-6 pb-16 items-start grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_300px]">
          {/* 左栏：作者卡 + 贴吧信息卡 + 热门贴吧 */}
          <DetailSidebar barId={barId} />
          {/* 中栏：面包屑 + 帖子详情 + 回复列表 + 编辑器 + 广告 */}
          <CommunityDetailMain barId={barId} />
          {/* 右栏：创建贴吧 + 热门贴吧 + 广告（xl 以上显示） */}
          <div className="hidden xl:block">
            <CommunityRightPanel />
          </div>
        </div>
      </ToastProvider>
    </main>
  );
}

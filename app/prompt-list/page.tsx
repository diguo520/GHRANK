/**
 * Prompt 列表页 —— Next.js App Router
 * 完整筛选/排序/分页的 Prompt 浏览视图
 *
 * 布局：左侧筛选侧边栏（AI 模型/价格/评分/分类）+ 右侧卡片网格 + 底部分页
 * Chrome 层（Ticker/Navbar/Footer 等）由 ChromeLayout 统一处理，此处仅含 main 区域
 */
import PromptListClient from './_components/PromptListClient';

export const metadata = { title: 'Prompt Listing // GHRANK' };

export default function PromptListPage() {
  return (
    <main className="main-content" style={{ maxWidth: '1440px', padding: 0 }}>
      <PromptListClient />
    </main>
  );
}

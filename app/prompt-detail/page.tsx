/**
 * Prompt 详情页 —— Prompt 详情 + 预览效果 + 购买按钮 + 评论区
 * Chrome 层（Ticker/Navbar/Footer 等）由 ChromeLayout 统一处理，本页面只含 main 区域
 */
import PromptDetailContent from './_components/PromptDetailContent';

export const metadata = { title: 'Prompt Detail // GHRANK' };

export default function PromptDetailPage() {
  return (
    <main className="main-content" style={{ padding: 0 }}>
      <PromptDetailContent />
    </main>
  );
}

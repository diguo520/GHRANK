/**
 * Prompt 市场主页 —— EVE Online HUD 风格 AI Prompt 交易市场
 * 结构：Hero（实时统计模拟）+ 分类筛选 + 特色卡片网格（骨架屏+IO+分块加载）
 * Chrome 层（Ticker/Navbar/Footer 等）由 ChromeLayout 统一处理，本页面只包含 main 区域
 */
import PromptHero from './_components/PromptHero';
import PromptMarketplace from './_components/PromptMarketplace';

export const metadata = { title: 'Prompt Marketplace // GHRANK' };

export default function PromptPage() {
  return (
    <main className="main-content" style={{ maxWidth: '1440px', padding: 0 }}>
      {/* Hero 区域：标题 + 实时统计模拟 */}
      <PromptHero />

      {/* 市场交互区：分类筛选 + 卡片网格 */}
      <PromptMarketplace />
    </main>
  );
}

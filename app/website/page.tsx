/**
 * 网站目录页 —— 精选网站收录
 * 结构：侧边栏（分类导航树）+ 主内容（搜索栏 + Hero + 卡片网格）
 * 支持：分类筛选（hash 路由）、实时搜索（防抖）、排序、骨架屏 + 无限滚动、toast 提示
 * Chrome 层（Ticker/Navbar/Footer）由 ChromeLayout 统一处理，本页只含 main 区域
 */
import WebsiteDirectory from './_components/WebsiteDirectory';

export const metadata = { title: 'Website Directory // GHRANK' };

export default function WebsitePage() {
  return (
    <main className="main-content" style={{ maxWidth: 'none', padding: 0 }}>
      {/* 页面级动画 keyframes + 响应式（迁移自 website.css） */}
      <style>{`
        /* Toast 提示入场动画 */
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* 平板：侧边栏 + 内容区改为单列布局 */
        @media (max-width: 1024px) {
          .website-layout {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            padding: 20px 20px 48px !important;
          }
          .website-sidebar {
            position: static !important;
            max-height: none !important;
            overflow-y: visible !important;
          }
        }

        /* 手机：缩小内边距，卡片网格改为单列 */
        @media (max-width: 768px) {
          .website-layout {
            padding: 16px 14px 40px !important;
          }
          .website-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>

      <WebsiteDirectory />
    </main>
  );
}

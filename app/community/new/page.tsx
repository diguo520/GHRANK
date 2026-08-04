/**
 * 社区发帖页 —— Next.js App Router
 * 结构：面包屑 + 发帖表单（标题/标签/正文编辑器）
 * 居中布局 max-width 800px，保留 EVE Online HUD 风格
 * Chrome 层（Ticker/Navbar/Footer 等）由 ChromeLayout 统一处理，此处仅含 main 区域
 */
import Link from 'next/link';
import NewPostForm from './_components/NewPostForm';

export const metadata = { title: 'New Post // GHRANK' };

export default function CommunityNewPage() {
  return (
    <main className="main-content">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '8px 24px 64px' }}>
        {/* 面包屑：Community / New Post */}
        <nav
          className="mb-6 flex flex-wrap items-center gap-2"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-dim)',
            letterSpacing: '0.04em',
          }}
        >
          <Link
            href="/community"
            className="transition-colors duration-150 hover:text-[var(--gold)]"
            style={{ color: 'var(--text-dim)', textDecoration: 'none' }}
          >
            Community
          </Link>
          <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>/</span>
          <span style={{ color: 'var(--gold)' }}>New Post</span>
        </nav>

        {/* 表单主体（客户端交互） */}
        <NewPostForm />
      </div>
    </main>
  );
}

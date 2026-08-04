/**
 * News 页面 —— AI 新闻时间线
 * Mini Hero + 时间线（按日期分组 + 实时推送）
 * Chrome 层（Navbar / Ticker / Footer）由 ChromeLayout 统一处理，本页只含 <main> 内容
 */
import NewsTimeline from './_components/NewsTimeline';

export const metadata = { title: 'AI News // GHRANK' };

export default function NewsPage() {
  return (
    <main className="main-content">
      {/* 页面级动画 keyframes：badge 脉冲 + 实时插入高亮（迁移自 news.css） */}
      <style>{`
        @keyframes badgePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes newsFlashBg {
          0% { background: rgba(57, 210, 192, 0.05); }
          100% { background: transparent; }
        }
        @media (max-width: 768px) {
          .tl-source-label { display: none; }
          .tl-arrow { display: none; }
        }
      `}</style>

      {/* ═══ MINI HERO（紧凑型情报头） ═══ */}
      <section
        className="news-hero relative overflow-hidden text-center mx-auto"
        style={{ padding: '40px 32px 36px', maxWidth: '1200px' }}
      >
        {/* 背景径向辉光 */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2"
          style={{
            width: '600px',
            height: '400px',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(ellipse at center, rgba(245,197,24,0.06) 0%, transparent 70%)',
          }}
        />
        <div className="relative" style={{ zIndex: 1 }}>
          {/* 状态徽章 */}
          <div
            className="news-hero-badge inline-flex items-center font-mono uppercase"
            style={{
              gap: '8px',
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--gold)',
              letterSpacing: '0.18em',
              border: '1px solid rgba(245,197,24,0.35)',
              background: 'rgba(245,197,24,0.05)',
              padding: '6px 14px',
              marginBottom: '20px',
            }}
          >
            INTELLIGENCE FEED
            <span
              className="badge-dot"
              style={{
                width: '6px',
                height: '6px',
                background: 'var(--green)',
                borderRadius: '50%',
                boxShadow: '0 0 8px rgba(63,185,80,0.5)',
                animation: 'badgePulse 1.4s ease-in-out infinite',
              }}
            />
            ACTIVE
          </div>

          {/* 标题 */}
          <h1
            className="news-hero-title font-display font-extrabold"
            style={{
              fontSize: '48px',
              lineHeight: 1.05,
              letterSpacing: '0.02em',
              color: 'var(--text)',
              marginBottom: '14px',
            }}
          >
            AI NEWS{' '}
            <span style={{ color: 'var(--cyan)', textShadow: '0 0 24px rgba(57,210,192,0.2)' }}>
              TIMELINE
            </span>
          </h1>

          {/* 副标题 */}
          <p
            className="news-hero-sub font-body mx-auto"
            style={{ fontSize: '15px', color: 'var(--text-dim)', lineHeight: 1.55, maxWidth: '560px' }}
          >
            Last 7 days of AI developments — click any item to read the full story
          </p>
        </div>
      </section>

      {/* ═══ TIMELINE（含计时器与实时推送，客户端组件） ═══ */}
      <NewsTimeline />
    </main>
  );
}

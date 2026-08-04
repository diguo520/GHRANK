/**
 * PlaceholderPage —— 占位页面组件
 * 保持 EVE Online HUD 主题风格，含骨架屏占位 + 四角装饰
 * 用于尚未完整迁移的页面，确保导航链接不会 404
 */

import CornerDecor from './CornerDecor';

interface PlaceholderPageProps {
  /** 页面标题 */
  title: string;
  /** 页面副标题/描述 */
  subtitle?: string;
  /** HUD 标签码（如 SECTOR-02） */
  sectorCode?: string;
}

export default function PlaceholderPage({
  title,
  subtitle = 'This module is being calibrated. Full interface incoming.',
  sectorCode = 'SECTOR-00',
}: PlaceholderPageProps) {
  return (
    <main
      className="main-content"
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: 'var(--sp-8) var(--sp-5)',
        position: 'relative',
        minHeight: '60vh',
      }}
    >
      {/* ═══ HUD 取景框容器 ═══ */}
      <div
        className="relative mx-auto"
        style={{
          maxWidth: '720px',
          padding: 'var(--sp-8) var(--sp-6)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {/* 四角标装饰 */}
        <CornerDecor />

        {/* 顶部 HUD 标签码 */}
        <div
          className="text-center mb-6"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '3px',
            color: 'var(--gold)',
            opacity: 0.6,
            textTransform: 'uppercase',
          }}
        >
          // {sectorCode} // STATUS: OFFLINE
        </div>

        {/* 页面标题 —— 金色发光 */}
        <h1
          className="text-center"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            textShadow: '0 0 12px rgba(245, 197, 24, 0.4)',
            marginBottom: 'var(--sp-4)',
          }}
        >
          {title}
        </h1>

        {/* 副标题 */}
        <p
          className="text-center"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            color: 'var(--text-dim)',
            letterSpacing: '0.5px',
            lineHeight: 1.6,
            marginBottom: 'var(--sp-6)',
          }}
        >
          {subtitle}
        </p>

        {/* 骨架屏占位区 —— 模拟内容正在加载 */}
        <div className="flex flex-col gap-3" style={{ marginTop: 'var(--sp-5)' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: '14px',
                borderRadius: '3px',
                background:
                  'linear-gradient(90deg, var(--surface-overlay) 25%, var(--border-subtle) 50%, var(--surface-overlay) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                width: `${[100, 85, 60][i]}%`,
                margin: '0 auto',
              }}
            />
          ))}
        </div>

        {/* 底部进度条 —— 模拟加载中 */}
        <div
          className="mx-auto mt-8"
          style={{
            width: '200px',
            height: '2px',
            background: 'var(--border)',
            borderRadius: '1px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--gold), var(--gold-hover))',
              width: '0%',
              animation: 'loading-fill 2s ease-in-out infinite',
              boxShadow: '0 0 8px rgba(245, 197, 24, 0.5)',
            }}
          />
        </div>

        {/* 底部 HUD 标签 */}
        <div
          className="text-center mt-4"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}
        >
          // AWAITING DATA STREAM
        </div>
      </div>
    </main>
  );
}

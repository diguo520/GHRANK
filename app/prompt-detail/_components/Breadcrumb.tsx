/**
 * Breadcrumb —— 面包屑导航（服务端组件）
 * 迁移自 prompt-detail.html 的 .breadcrumb-bar
 */
import Link from 'next/link';
import { PROMPT_DETAIL } from '../_data/prompt-detail-data';

export default function Breadcrumb() {
  return (
    <div
      className="breadcrumb-bar"
      style={{
        padding: '14px 32px',
        background: 'linear-gradient(180deg, rgba(245,197,24,0.03) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="flex flex-wrap items-center gap-2.5 font-mono"
        style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'var(--text-dim)' }}
      >
        <Link
          href="/prompt"
          className="font-semibold transition-colors duration-150 hover:text-[color:var(--gold-hover)]"
          style={{ color: 'var(--gold)' }}
        >
          {'\u2190'} RETURN TO MARKET
        </Link>
        <Link
          href="/prompt-list"
          className="transition-colors duration-150 hover:text-[color:var(--gold)]"
          style={{ color: 'var(--text-dim)' }}
        >
          Midjourney
        </Link>
        <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>{'>'}</span>
        <span className="font-semibold" style={{ color: 'var(--text)' }}>
          {PROMPT_DETAIL.title}
        </span>
      </div>
    </div>
  );
}

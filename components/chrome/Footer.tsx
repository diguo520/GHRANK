'use client';

import { CSSProperties } from 'react';
import Link from 'next/link';
import type { PageConfig } from '@/lib/config';

/** 页脚链接路由映射 —— 将配置中的链接标签映射到实际路由 */
const FOOTER_LINK_MAP: Record<string, string> = {
  'About Us': '/about#about',
  Sponsors: '/about#sponsors',
  Changelog: '/about#changelog',
  Terms: '/about#terms',
  Docs: '/about#about',
};

/** 链接基础样式 —— font-display 大写小字 */
const linkStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-dim)',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

/**
 * Footer —— 页脚组件
 * 深色背景 + 金色顶部边框，展示数据来源声明与快捷链接
 */
export default function Footer({ config }: { config: PageConfig }) {
  const links = config.footerLinks || [];

  return (
    <footer
      className="text-center"
      style={{
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        padding: 'var(--sp-5) var(--sp-4)',
        marginTop: 'var(--sp-6)',
      }}
    >
      {/* 页脚文本 */}
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          letterSpacing: '0.3px',
        }}
      >
        {config.footerText}
      </p>

      {/* 快捷链接组 —— 悬停时金色 + 下划线展开动画 */}
      <div className="flex items-center justify-center flex-wrap gap-6 mt-2">
        {links.map((label, i) => (
          <Link
            key={i}
            href={FOOTER_LINK_MAP[label] || '/about#about'}
            className="group relative transition-colors duration-200 hover:text-[var(--gold)]"
            style={linkStyle}
          >
            {label}
            {/* 悬停下划线 —— 宽度从 0 展开至 100% */}
            <span
              className="absolute left-0 h-px w-0 transition-all duration-[250ms] group-hover:w-full"
              style={{ bottom: '-4px', background: 'var(--gold)' }}
            />
          </Link>
        ))}
      </div>
    </footer>
  );
}

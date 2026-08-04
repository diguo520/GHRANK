/**
 * About 页面通用排版组件
 * 包含正文容器、段落、小标题、列表、面板头部
 */

import { ReactNode } from 'react';

/** 文章正文容器 —— 统一字体、字号、行高 */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.75, color: 'var(--text)' }}>
      {children}
    </div>
  );
}

/** 正文段落 */
export function ProseP({ children }: { children: ReactNode }) {
  return <p style={{ margin: '0 0 16px' }}>{children}</p>;
}

/** 正文小标题 h3 */
export function ProseH3({ children }: { children: ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '20px',
        fontWeight: 700,
        color: 'var(--text)',
        margin: '32px 0 14px',
        letterSpacing: '-0.01em',
      }}
    >
      {children}
    </h3>
  );
}

/** 无序列表 —— 自定义 ▸ 金色前导符 */
export function ProseList({ items }: { items: ReactNode[] }) {
  return (
    <ul style={{ paddingInlineStart: '22px', margin: '0 0 16px', listStyle: 'none' }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{ position: 'relative', marginBottom: '8px', paddingInlineStart: '4px' }}
        >
          <span
            style={{
              position: 'absolute',
              insetInlineStart: '-18px',
              color: 'var(--gold)',
              fontSize: '12px',
            }}
          >
            {'\u25B8'}
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** 面板头部 —— 章节编号 + 标题 + 副标题 */
export function PanelHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <header style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.18em',
          color: 'var(--cyan)',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}
      >
        {eyebrow}
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '36px',
          fontWeight: 700,
          lineHeight: 1.15,
          color: 'var(--text)',
          margin: '0 0 12px',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          lineHeight: 1.6,
          color: 'var(--text-dim)',
          margin: 0,
          maxWidth: '640px',
        }}
      >
        {subtitle}
      </p>
    </header>
  );
}

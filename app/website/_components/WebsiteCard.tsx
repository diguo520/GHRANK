/**
 * WebsiteCard —— 网站目录卡片组件
 * 展示收录网站的 favicon、名称、URL、描述、分类标签和跳转图标
 * 点击在新标签页打开网站并触发 toast 提示
 * 迁移自 website.js 的 buildCardHTML
 */
'use client';

import { CSSProperties } from 'react';
import { ExternalLinkIcon } from '../../_components/icons';
import { type Site, CATEGORY_STYLES, CATEGORY_LABELS } from '../_data/website-data';

interface WebsiteCardProps {
  site: Site;
  /** 点击卡片时触发，传入网站 URL 用于 toast 显示 */
  onClick: (url: string) => void;
  /** 入场动画延迟（ms），用于错峰入场效果 */
  animationDelay?: number;
}

export default function WebsiteCard({ site, onClick, animationDelay = 0 }: WebsiteCardProps) {
  const catStyle = CATEGORY_STYLES[site.category];
  const catLabel = CATEGORY_LABELS[site.category];

  const handleClick = () => {
    onClick(site.url);
    window.open(`/go?url=${encodeURIComponent(site.url)}`, '_blank');
  };

  return (
    <div
      className="website-card group relative flex cursor-pointer overflow-hidden"
      style={
        {
          alignItems: 'stretch',
          gap: '16px',
          padding: '18px 20px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          transition: 'border-color 0.22s, transform 0.22s, box-shadow 0.22s',
          animation: 'cardFadeIn 0.35s ease',
          animationDelay: `${animationDelay}ms`,
        } as CSSProperties
      }
      onClick={handleClick}
    >
      {/* 悬停时显示的左上角金色装饰角 */}
      <div
        className="pointer-events-none absolute top-[-1px] left-[-1px] h-3 w-3 transition-colors duration-200"
        style={{ borderTop: '1px solid transparent', borderLeft: '1px solid transparent' }}
      >
        <div
          className="h-full w-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }}
        />
      </div>

      {/* Favicon：首字母方块，按分类着色 */}
      <div
        className="flex shrink-0 items-center justify-center"
        style={{
          width: '48px',
          height: '48px',
          fontFamily: 'var(--font-display)',
          fontSize: '20px',
          fontWeight: 800,
          color: catStyle.color,
          background: catStyle.bg,
          border: `1px solid ${catStyle.border}`,
          transition: 'border-color 0.22s, box-shadow 0.22s',
        }}
      >
        {site.favicon}
      </div>

      {/* 卡片正文 */}
      <div className="flex min-w-0 flex-1 flex-col" style={{ gap: '4px' }}>
        {/* 网站名称 */}
        <div
          className="font-display font-bold"
          style={{
            fontSize: '16px',
            lineHeight: 1.2,
            letterSpacing: '0.01em',
            color: 'var(--text)',
            transition: 'color 0.18s',
          }}
        >
          <span className="group-hover:text-[var(--gold)]">{site.name}</span>
        </div>

        {/* URL */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            letterSpacing: '0.04em',
            marginBottom: '4px',
          }}
        >
          {site.url}
        </div>

        {/* 描述（两行截断） */}
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--text-dim)',
            lineHeight: 1.5,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {site.desc}
        </div>

        {/* 底部：分类标签 + 跳转图标 */}
        <div
          className="flex items-center justify-between"
          style={{ gap: '10px', paddingTop: '8px', marginTop: '6px', borderTop: '1px solid var(--border-subtle)' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              fontWeight: 700,
              padding: '3px 8px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              flexShrink: 0,
              color: catStyle.color,
              background: catStyle.bg,
              border: `1px solid ${catStyle.border}`,
            }}
          >
            {catLabel}
          </span>

          {/* 跳转图标 */}
          <span
            className="flex items-center"
            style={{
              gap: '5px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              transition: 'color 0.18s',
            }}
          >
            <ExternalLinkIcon size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}

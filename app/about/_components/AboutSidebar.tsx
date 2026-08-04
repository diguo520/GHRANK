/**
 * About 页面侧边栏
 * 包含目录导航与更多入口
 */

import Link from 'next/link';
import { NAV_ITEMS, MORE_LINKS, type PanelId } from '../_data/about-data';

interface AboutSidebarProps {
  /** 当前激活的面板 */
  activePanel: PanelId;
  /** 点击导航项时切换面板 */
  onActivate: (id: PanelId) => void;
}

export default function AboutSidebar({ activePanel, onActivate }: AboutSidebarProps) {
  return (
    <aside
      className="about-sidebar"
      style={{
        position: 'sticky',
        top: '100px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      {/* 目录导航 */}
      <div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.2em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: '12px',
            paddingBottom: '10px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          Browse Directory
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}>
          {/* 竖向连线 */}
          <span
            style={{
              position: 'absolute',
              insetInlineStart: '14px',
              top: '12px',
              bottom: '12px',
              width: '1px',
              background: 'var(--border)',
            }}
          />
          {NAV_ITEMS.map((item) => {
            const isActive = activePanel === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onActivate(item.id);
                }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 12px 10px 32px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: isActive ? 'var(--gold)' : 'var(--text-dim)',
                  background: isActive ? 'rgba(245, 197, 24, 0.06)' : 'transparent',
                  borderRadius: '4px',
                  transition: 'color 0.2s ease, background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text)';
                    e.currentTarget.style.background = 'rgba(245, 197, 24, 0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-dim)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {/* 节点圆点 */}
                <span
                  style={{
                    position: 'absolute',
                    insetInlineStart: '10px',
                    top: '50%',
                    width: '9px',
                    height: '9px',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--gold)' : 'var(--border)',
                    background: isActive ? 'var(--gold)' : 'var(--bg)',
                    borderRadius: '50%',
                    transform: 'translateY(-50%)',
                    boxShadow: isActive ? '0 0 8px rgba(245, 197, 24, 0.4)' : 'none',
                    zIndex: 1,
                    transition: 'border-color 0.2s ease, background 0.2s ease',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {item.index}
                </span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* 更多入口 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.2em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: '8px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          More Entry Points
        </div>
        {MORE_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="about-nav-more-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 10px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-dim)',
              borderRadius: '4px',
              transition: 'color 0.2s ease, background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.background = 'rgba(245, 197, 24, 0.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-dim)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ width: '15px', height: '15px', flexShrink: 0, opacity: 0.7 }}>
              {link.icon}
            </span>
            <span>{link.label}</span>
            <span
              style={{
                marginInlineStart: 'auto',
                color: 'var(--text-muted)',
                transition: 'color 0.2s ease, transform 0.2s ease',
              }}
            >
              {'\u203A'}
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}

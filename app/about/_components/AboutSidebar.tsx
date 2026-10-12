/**
 * AboutSidebar —— About 页面侧边栏
 * 特性：Segmented 风格丝滑滑动指示器（cubic-bezier 缓动）
 * 当选中项切换时，指示器平滑滑到新位置
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { NAV_ITEMS, MORE_LINKS, type PanelId } from '../_data/about-data';

interface AboutSidebarProps {
  activePanel: PanelId;
  onActivate: (id: PanelId) => void;
}

export default function AboutSidebar({ activePanel, onActivate }: AboutSidebarProps) {
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState<{ top: number; height: number }>({ top: 0, height: 0 });

  /** 更新指示器位置 —— 平滑滑到当前选中项 */
  const updateIndicator = useCallback(() => {
    const el = itemRefs.current.get(activePanel);
    if (el && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = el.getBoundingClientRect();
      setIndicatorStyle({
        top: itemRect.top - navRect.top,
        height: itemRect.height,
      });
    }
  }, [activePanel]);

  useEffect(() => {
    updateIndicator();
    // 窗口尺寸变化时重新定位
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  /** 注册每个 item 的 ref */
  const setItemRef = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) {
      itemRefs.current.set(id, el);
    } else {
      itemRefs.current.delete(id);
    }
  }, []);

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
      {/* 目录导航（带滑动指示器） */}
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

        {/* 导航容器 —— 相对定位承载滑动指示器 */}
        <nav
          ref={navRef as React.RefObject<HTMLDivElement>}
          className="gh-sidebar-nav"
          style={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}
        >
          {/* 滑动指示器背景 */}
          <div
            className="gh-sidebar-nav-indicator"
            style={{
              top: indicatorStyle.top,
              height: indicatorStyle.height,
            }}
          />

          {/* 竖向连线 */}
          <span
            style={{
              position: 'absolute',
              left: '14px',
              top: '12px',
              bottom: '12px',
              width: '1px',
              background: 'var(--border)',
              zIndex: 0,
            }}
          />

          {NAV_ITEMS.map((item) => {
            const isActive = activePanel === item.id;
            return (
              <a
                key={item.id}
                ref={setItemRef(item.id)}
                href={`#${item.id}`}
                className="gh-sidebar-nav-item"
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
                  borderRadius: '4px',
                  zIndex: 1,
                  transition: 'color 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {/* 节点圆点 */}
                <span
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    width: '9px',
                    height: '9px',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--gold)' : 'var(--border)',
                    background: isActive ? 'var(--gold)' : 'var(--bg)',
                    borderRadius: '50%',
                    transform: 'translateY(-50%)',
                    boxShadow: isActive ? '0 0 8px rgba(157, 140, 255, 0.4)' : 'none',
                    zIndex: 2,
                    transition: 'border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
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
            className="about-nav-more-item gh-sidebar-nav-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 10px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-dim)',
              borderRadius: '4px',
              transition: 'color 0.25s ease, background 0.25s ease',
            }}
          >
            <span style={{ width: '15px', height: '15px', flexShrink: 0, opacity: 0.7 }}>
              {link.icon}
            </span>
            <span>{link.label}</span>
            <span
              className="gh-sidebar-nav-arrow"
              style={{
                marginLeft: 'auto',
                color: 'var(--text-muted)',
                opacity: 0.6,
                transition: 'transform 0.25s ease, opacity 0.25s ease, color 0.25s ease',
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

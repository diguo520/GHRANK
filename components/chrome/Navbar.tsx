'use client';

import { CSSProperties, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NAV_LINKS } from '@/lib/config';
import type { PageConfig } from '@/lib/config';
import { HEX_CLIP_PATH } from '@/lib/constants';
import { useIsLoggedIn } from '@/app/_hooks/useIsLoggedIn';
import { useAppEvent } from '@/app/_context/AppEventContext';

interface NavbarProps {
  config: PageConfig;
  currentPage: string;
  onOpenSearch: () => void;
}

/* ═══════════════════════════════════════════════════════════════
   Logo 子组件 —— 六边形 + GHRANK 文字 + 悬停三联动动效
   1. 六边形旋转 60deg + 金色辉光脉冲
   2. 文字字间距展开 + 扫光
   3. 副标题滑入揭示
   ═══════════════════════════════════════════════════════════════ */
function Logo() {
  const [isHovered, setIsHovered] = useState(false);

  /* 六边形主体样式 —— 悬停时旋转 + 辉光 */
  const hexStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    background: isHovered ? 'rgba(245, 197, 24, 0.12)' : 'var(--gold-subtle)',
    border: '1.5px solid var(--gold)',
    clipPath: HEX_CLIP_PATH,
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    fontWeight: 800,
    color: 'var(--gold)',
    flexShrink: 0,
    position: 'relative',
    transform: isHovered ? 'rotate(60deg)' : 'none',
    boxShadow: isHovered
      ? '0 0 16px rgba(245, 197, 24, 0.4), 0 0 32px rgba(245, 197, 24, 0.15)'
      : 'none',
    transition:
      'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease, background 0.4s ease',
  };

  /* 字母层独立旋转，与六边形旋转叠加形成双重动效 */
  const letterStyle: CSSProperties = {
    display: 'block',
    transform: isHovered ? 'rotate(-60deg)' : 'none',
    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
  };

  /* 悬停光环 —— 默认不可见，悬停时放大淡入 */
  const ringStyle: CSSProperties = {
    position: 'absolute',
    top: '-4px',
    left: '-4px',
    right: '-4px',
    bottom: '-4px',
    border: '1px solid var(--gold)',
    clipPath: HEX_CLIP_PATH,
    opacity: isHovered ? 0.6 : 0,
    transform: isHovered ? 'scale(1)' : 'scale(0.85)',
    transition: 'opacity 0.4s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
    pointerEvents: 'none',
  };

  return (
    <Link
      href="/"
      className="flex items-center gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={hexStyle}>
        <span style={letterStyle}>G</span>
        <span style={ringStyle} />
      </div>
      <div className="flex flex-col leading-tight">
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: 800,
            letterSpacing: isHovered ? '4px' : '2px',
            color: 'var(--gold)',
            textShadow: isHovered ? '0 0 12px rgba(245, 197, 24, 0.5)' : 'none',
            transition: 'letter-spacing 0.4s cubic-bezier(0.22, 1, 0.36, 1), text-shadow 0.4s ease',
          }}
        >
          GHRANK
        </span>
        <span
          className="hidden md:inline"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            letterSpacing: '1px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            opacity: isHovered ? 1 : 0.6,
            transform: isHovered ? 'translateX(0)' : 'translateX(-4px)',
            transition: 'opacity 0.4s ease 0.1s, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.1s',
          }}
        >
          Open Source Intelligence
        </span>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Navbar —— 主导航栏
   通过 onOpenSearch 回调与 SearchOverlay 通信
   ═══════════════════════════════════════════════════════════════ */
export default function Navbar({ config, currentPage, onOpenSearch }: NavbarProps) {
  /* 登录状态 —— 统一 hook */
  const { loggedIn, userAvatar } = useIsLoggedIn();
  const { toggleSidebar } = useAppEvent();

  // 登录页隐藏登录按钮
  const hideLogin = currentPage === 'login';

  /* 页面切换进度条状态 —— 监听路由变化触发加载动画 */
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // 路由变化时：重置并启动进度条
    setIsLoading(true);
    setProgress(0);

    if (progressTimerRef.current) {
      window.clearTimeout(progressTimerRef.current);
    }
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }

    // 第一阶段：快速填充到 70%（模拟加载不确定进度）
    progressTimerRef.current = window.setTimeout(() => {
      setProgress(70);
    }, 20);

    // 第二阶段：短暂停顿后完成并淡出
    const finishTimer = window.setTimeout(() => {
      setProgress(100);
      hideTimerRef.current = window.setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 350);
    }, 320);

    return () => {
      window.clearTimeout(progressTimerRef.current!);
      window.clearTimeout(finishTimer);
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, [currentPage]);

  /** 通过 Context 通知 UserCenterSidebar 切换打开状态 */
  function openUserSidebar() {
    toggleSidebar();
  }

  return (
    <nav
      className="flex items-center justify-between gap-4 sticky top-0"
      style={{
        height: '64px',
        padding: '0 var(--sp-5)',
        background: 'rgba(10, 10, 10, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        zIndex: 100,
        position: 'relative',
      }}
    >
      {/* 页面切换进度条 —— 叠加在现有底部分割线上 */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '1px',
          width: `${progress}%`,
          background: 'var(--gold)',
          boxShadow: '0 0 8px rgba(245, 197, 24, 0.6), 0 0 16px rgba(245, 197, 24, 0.3)',
          opacity: isLoading ? 1 : 0,
          transition: `width ${isLoading ? '300ms' : '150ms'} cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease`,
          pointerEvents: 'none',
          zIndex: 101,
        }}
      />
      {/* ── 左侧：品牌 Logo ── */}
      <div className="flex-shrink-0">
        <Logo />
      </div>

      {/* ── 中间：导航链接 ── */}
      <div className="flex items-center gap-1 flex-1 justify-center">
        {NAV_LINKS.map((n) => {
          const isActive = currentPage === n.page;
          return (
            <Link
              key={n.page}
              href={n.href}
              data-page={n.page}
              className="relative px-4 py-2 rounded-sm transition-colors duration-200 hover:bg-[rgba(245,197,24,0.08)]"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '1px',
                color: isActive ? 'var(--gold)' : 'var(--text-dim)',
                textTransform: 'uppercase',
              }}
            >
              {n.label}
              {/* 当前页底部金色下划线 */}
              {isActive && (
                <span
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    bottom: '-4px',
                    width: '60%',
                    height: '2px',
                    background: 'var(--gold)',
                    boxShadow: '0 0 8px rgba(245, 197, 24, 0.6)',
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* ── 右侧：搜索框 + 登录/头像 ── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* 搜索框 —— 点击触发 onOpenSearch */}
        <div
          className="flex items-center gap-2 rounded-sm cursor-pointer transition-colors duration-200 hover:border-[var(--gold)]"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: 'var(--sp-2) var(--sp-3)',
            minWidth: '200px',
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenSearch();
          }}
        >
          <span className="text-sm flex-shrink-0" style={{ color: 'var(--text-dim)' }}>
            {'\u{1F50D}\uFE0E'}
          </span>
          <input
            type="text"
            placeholder={config.searchPlaceholder}
            spellCheck="false"
            readOnly
            className="flex-1 bg-transparent border-none outline-hidden cursor-pointer min-w-0"
            style={{
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
            }}
          />
        </div>

        {/* 未登录：显示登录按钮 */}
        {!loggedIn && !hideLogin && (
          <Link
            href="/login"
            className="inline-flex items-center rounded-sm whitespace-nowrap transition-all duration-200 hover:shadow-[0_0_16px_rgba(245,197,24,0.4)]"
            style={{
              padding: 'var(--sp-2) var(--sp-5)',
              background: 'var(--gold)',
              color: 'var(--bg)',
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            LOG IN
          </Link>
        )}

        {/* 已登录：显示用户头像 + 在线状态 */}
        {loggedIn && (
          <button
            className="relative flex-shrink-0"
            style={{
              width: '38px',
              height: '38px',
              padding: 0,
              border: 'none',
              background: 'transparent',
              fontSize: 0,
              lineHeight: 0,
              outline: 'none',
            }}
            aria-label="Open user center"
            onClick={openUserSidebar}
          >
            <span
              className="block rounded-full overflow-hidden transition-shadow duration-200"
              style={{
                width: '36px',
                height: '36px',
                border: '1.5px solid var(--gold)',
              }}
            >
              <Image
                src={userAvatar}
                alt=""
                width={36}
                height={36}
                className="w-full h-full object-cover rounded-full"
                style={{ aspectRatio: '1 / 1' }}
              />
            </span>
            {/* 在线状态绿点 */}
            <span
              className="absolute rounded-full"
              style={{
                bottom: '0px',
                right: '-1px',
                width: '10px',
                height: '10px',
                background: '#3fb950',
                border: '2px solid var(--bg)',
                zIndex: 1,
              }}
            />
          </button>
        )}
      </div>
    </nav>
  );
}

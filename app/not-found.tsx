/**
 * 404 错误页 —— Next.js App Router not-found
 * 迁移自 404.html + 404.js + 404.css
 * 功能：雷达扫描动画 + 终端诊断逐行打字效果 + 快速导航
 * 尊重 prefers-reduced-motion：关闭动画时直接展示全部诊断行
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HomeIcon, NewsIcon, TerminalIcon, SearchIcon } from './_components/icons';
import styles from './not-found.module.css';

/* ═══ 动画时序常量（毫秒） ═══ */
const DIAGNOSTICS_DELAY = 1500;
const DIAG_LINE_INTERVAL = 180;
const DIAG_LAST_EXTRA_DELAY = 100;

/* ═══ 诊断日志数据 ═══ */
type DiagStatus = 'ok' | 'fail' | 'timeout' | 'warn' | 'cursor';
interface DiagLine {
  text: string;
  status?: DiagStatus;
  label?: string;
  isLast?: boolean;
}

const STATUS_COLORS: Record<Exclude<DiagStatus, 'cursor'>, string> = {
  ok: 'var(--green)',
  fail: '#F85149',
  timeout: 'var(--orange)',
  warn: 'var(--gold)',
};

const DIAG_LINES: DiagLine[] = [
  { text: 'SYS.INIT: GHRANK ROUTING ENGINE', status: 'ok', label: '[OK]' },
  { text: 'SYS.CHECK: ROUTE_LOOKUP', status: 'fail', label: '[FAILED]' },
  { text: 'SYS.CHECK: NODE_VERIFY', status: 'timeout', label: '[TIMEOUT]' },
  { text: 'SYS.CHECK: SIGNAL_STRENGTH', status: 'fail', label: '[NULL]' },
  { text: 'SYS.CHECK: CACHE_QUERY', status: 'ok', label: '[HIT]' },
  { text: 'SYS.CHECK: INDEX_SCAN', status: 'warn', label: '[EMPTY]' },
  { text: 'SYS.DIAG: AWAITING_INSTRUCTION', isLast: true },
];

/* ═══ 快速导航卡片 ═══ */
const QUICK_NAV: { href: string; name: string; icon: React.ReactNode }[] = [
  { href: '/', name: 'HOME', icon: <HomeIcon size={22} /> },
  { href: '/news', name: 'NEWS', icon: <NewsIcon size={22} /> },
  { href: '/prompt', name: 'PROMPT', icon: <TerminalIcon size={22} /> },
  { href: '/search', name: 'SEARCH', icon: <SearchIcon size={22} /> },
];

/* ═══ 雷达装饰组件 ═══ */
function Radar() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLSpanElement>(null);
  const ring1Ref = useRef<HTMLSpanElement>(null);
  const ring2Ref = useRef<HTMLSpanElement>(null);
  const ring3Ref = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const crossHRef = useRef<HTMLSpanElement>(null);
  const crossVRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    (async () => {
      const gsapModule = await import('gsap');
      const gsap = gsapModule.default;
      if (cancelled || !wrapRef.current) return;

      ctx = gsap.context(() => {
        // 扇形扫描旋转 —— 4s 一圈，匀速无限循环
        gsap.to(sweepRef.current, {
          rotation: 360,
          duration: 4,
          ease: 'none',
          repeat: -1,
          transformOrigin: '50% 50%',
        });

        // 同心圆脉冲 —— 三层依次延迟
        const rings = [ring1Ref.current, ring2Ref.current, ring3Ref.current];
        rings.forEach((ring, i) => {
          if (!ring) return;
          gsap.fromTo(
            ring,
            { opacity: 0.3 },
            {
              opacity: 0.6,
              duration: 1.5,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
              delay: i * 0.5,
            },
          );
        });

        // 中心圆点呼吸闪烁
        gsap.fromTo(
          dotRef.current,
          { opacity: 0.5 },
          {
            opacity: 1,
            duration: 0.75,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          },
        );

        // 十字准线微弱闪烁
        [crossHRef.current, crossVRef.current].forEach((cross) => {
          if (!cross) return;
          gsap.fromTo(
            cross,
            { opacity: 0.4 },
            {
              opacity: 0.8,
              duration: 2,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
            },
          );
        });
      }, wrapRef.current);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div className={styles.radarWrap} ref={wrapRef}>
      <span className={styles.radarCrossH} ref={crossHRef} />
      <span className={styles.radarCrossV} ref={crossVRef} />
      <span className={styles.radarRing1} ref={ring1Ref} />
      <span className={styles.radarRing2} ref={ring2Ref} />
      <span className={styles.radarRing3} ref={ring3Ref} />
      <span className={styles.radarSweep} ref={sweepRef} />
      <span className={styles.radarDot} ref={dotRef} />
    </div>
  );
}

/* ═══ 主组件 ═══ */
export default function NotFound() {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setRevealedCount(DIAG_LINES.length);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, delay: number) => {
      timers.push(setTimeout(fn, delay));
    };
    const normalCount = DIAG_LINES.length - 1;
    schedule(() => {
      for (let i = 0; i < normalCount; i++) {
        schedule(() => setRevealedCount(i + 1), i * DIAG_LINE_INTERVAL);
      }
      schedule(() => setRevealedCount(DIAG_LINES.length), normalCount * DIAG_LINE_INTERVAL + DIAG_LAST_EXTRA_DELAY);
    }, DIAGNOSTICS_DELAY);
    return () => timers.forEach((id) => clearTimeout(id));
  }, []);

  return (
    <main className={`main-content ${styles.mainWrap}`}>
      <span aria-hidden className={styles.bgGlow} />

      <div className={styles.panel}>
        <span className={styles.cornerTr} />
        <span className={styles.cornerBl} />

        <div className={styles.contentCol}>
          <Radar />

          <div className={styles.errorCode}>404</div>
          <div className={styles.errorLabel}>// SIGNAL NOT FOUND</div>
          <p className={styles.errorDesc}>
            The page you're looking for has been lost in the void. The target coordinate does not exist in our index.
          </p>

          {/* 系统诊断日志 */}
          <div className={styles.termBox}>
            {DIAG_LINES.map((line, i) => (
              <div key={i} className={styles.termLine} style={{ opacity: i < revealedCount ? 1 : 0 }}>
                {line.text}
                {line.status && line.label && line.status !== 'cursor' && (
                  <span style={{ fontWeight: 600, letterSpacing: '0.05em', color: STATUS_COLORS[line.status] }}>
                    {' '}{line.label}
                  </span>
                )}
                {line.isLast && <span className={styles.termCursor} />}
              </div>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className={styles.btnRow}>
            <Link href="/" className={styles.btnPrimary}>
              {'\u2190'} RETURN TO BASE
            </Link>
            <Link href="/about" className={styles.btnSecondary}>
              {'\u26A0'} REPORT ANOMALY
            </Link>
          </div>

          {/* 快速导航 */}
          <div className={styles.navSection}>
            <div className={styles.navLabel}>// QUICK NAV</div>
            <div className={styles.navGrid}>
              {QUICK_NAV.map((item) => (
                <Link key={item.name} href={item.href} className={styles.navCard}>
                  <span className={styles.navCardIcon}>{item.icon}</span>
                  <span className={styles.navCardLabel}>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

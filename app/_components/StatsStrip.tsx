/**
 * StatsStrip —— 统计卡片行（保持原视觉 + GSAP 动画增强）
 * 入场 stagger + 数字滚动 + 进度条动画 + hover 放大
 */
'use client';

import { useRef, useEffect, useState } from 'react';
import { STATS_DATA } from '../_data/leaderboard-data';

interface StatsStripProps {
  data?: typeof STATS_DATA;
}

/** 从显示值中提取纯数字（用于滚动动画） */
function parseNumericValue(val: string): number {
  const cleaned = val.replace(/,/g, '');
  return parseFloat(cleaned) || 0;
}

/** 格式化数字回原始样式（带逗号/小数） */
function formatValue(target: number, original: string): string {
  // 判断原始值是否有逗号分隔
  if (original.includes(',')) {
    return Math.round(target).toLocaleString('en-US');
  }
  // 判断小数位数
  const dotIndex = original.indexOf('.');
  if (dotIndex >= 0) {
    const decimals = original.length - dotIndex - 1;
    return target.toFixed(decimals);
  }
  return Math.round(target).toString();
}

/** 获取 accent 对应的 CSS 颜色值 */
function getAccentColor(accent: string): string {
  const map: Record<string, string> = {
    gold: 'var(--gold)',
    cyan: 'var(--cyan)',
    green: 'var(--green)',
    orange: 'var(--orange)',
    purple: 'var(--purple)',
  };
  return map[accent] || 'var(--gold)';
}

export default function StatsStrip({ data }: StatsStripProps) {
  const stats = data ?? STATS_DATA;
  const stripRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gsapCtx = useRef<any>(null);
  const ctxRef = useRef<{ kill: () => void } | null>(null);

  // 当前显示值（用于数字滚动）
  const [displayValues, setDisplayValues] = useState<string[]>(
    stats.map((s) => formatValue(0, s.value))
  );

  useEffect(() => {
    let cancelled = false;

    // 尊重 prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValues(stats.map((s) => s.value));
      return;
    }

    import('gsap').then((mod) => {
      if (cancelled) return;
      const gsap = mod.gsap;
      if (!gsap) return;
      gsapCtx.current = gsap;

      // 清理上一次上下文
      ctxRef.current?.kill();

      const ctx = gsap.context(() => {
        // ── 1. 入场动画：卡片 stagger 从下方滑入 ──
        const cards = cardRefs.current.filter(Boolean);
        if (cards.length > 0) {
          gsap.set(cards, { opacity: 0, y: 30 });
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            delay: 0.2,
          });
        }

        // ── 2. 数字滚动：从 0 到目标值 ──
        stats.forEach((stat, i) => {
          const target = parseNumericValue(stat.value);
          if (target === 0) return;

          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.4,
            delay: 0.4 + i * 0.1,
            ease: 'power2.out',
            onUpdate: () => {
              if (cancelled) return;
              setDisplayValues((prev) => {
                const next = [...prev];
                next[i] = formatValue(obj.val, stat.value);
                return next;
              });
            },
          });
        });

        // ── 3. 进度条动画：宽度从 0 到目标 ──
        barRefs.current.forEach((bar, i) => {
          if (!bar) return;
          const targetWidth = stats[i].barWidth;
          gsap.fromTo(
            bar,
            { width: '0%' },
            {
              width: targetWidth,
              duration: 0.8,
              delay: 0.5 + i * 0.1,
              ease: 'power2.out',
            }
          );
        });

        // ── 4. Hover 效果：卡片微微放大 + 边框高亮 ──
        cards.forEach((card) => {
          const el = card as HTMLDivElement;
          const onEnter = () => {
            gsap.to(el, {
              scale: 1.02,
              borderColor: 'rgba(245, 197, 24, 0.35)',
              duration: 0.25,
              ease: 'power2.out',
            });
          };
          const onLeave = () => {
            gsap.to(el, {
              scale: 1,
              borderColor: 'var(--border-subtle)',
              duration: 0.25,
              ease: 'power2.out',
            });
          };
          el.addEventListener('mouseenter', onEnter);
          el.addEventListener('mouseleave', onLeave);
        });
      }, stripRef.current!);

      ctxRef.current = ctx;
    }).catch(() => {
      // GSAP 加载失败，静默降级
      setDisplayValues(stats.map((s) => s.value));
    });

    return () => {
      cancelled = true;
      ctxRef.current?.kill();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section
      ref={stripRef}
      className="stats-strip grid gap-3 py-6 mb-6"
      style={{
        gridTemplateColumns: 'repeat(5, 1fr)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          ref={(el) => { cardRefs.current[i] = el; }}
          className="stat-card relative flex flex-col gap-2 p-4 overflow-hidden"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
          }}
          data-accent={stat.accent}
        >
          {/* 顶部彩色强调线 */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5 opacity-40"
            style={{
              background: getAccentColor(stat.accent),
            }}
          />
          <div className="stat-header flex items-center gap-2">
            <span
              className="stat-icon text-[10px]"
              style={{ color: getAccentColor(stat.accent), opacity: 0.6 }}
            >
              {stat.icon}
            </span>
            <span
              className="stat-label font-mono text-[10px] tracking-widest uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              {stat.label}
            </span>
          </div>
          <div
            className="stat-value font-display text-[1.8rem] font-extrabold leading-none tracking-wide"
            style={{ color: 'var(--text)' }}
          >
            <span ref={(el) => { valueRefs.current[i] = el; }}>
              {displayValues[i]}
            </span>
            {stat.unit && (
              <span
                className="stat-unit text-base font-semibold"
                style={{ color: 'var(--text-dim)' }}
              >
                {stat.unit}
              </span>
            )}
          </div>
          {/* 微型进度条 */}
          <div
            className="stat-bar h-[3px] rounded-xs overflow-hidden"
            style={{ background: 'var(--surface-overlay)' }}
          >
            <div
              ref={(el) => { barRefs.current[i] = el; }}
              className="stat-bar-fill h-full rounded-xs"
              style={{
                width: stat.barWidth,
                background: 'linear-gradient(90deg, var(--gold), var(--gold-hover))',
                boxShadow: '0 0 6px rgba(245,197,24,0.3)',
              }}
            />
          </div>
          <span
            className="stat-change font-mono text-[11px]"
            style={{ color: stat.changeMuted ? 'var(--text-muted)' : 'var(--green)' }}
          >
            {stat.change}
          </span>
        </div>
      ))}
    </section>
  );
}

/**
 * PromptHero —— Hero 区域（标题 + 实时统计模拟）
 * 保留 EVE Online HUD 风格：金色 glow 标题 + 四宫格统计面板
 * 交互：Total Prompts / Active Creators / Total Tips 实时增长模拟
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { HERO_STATS, type PromptHeroStat } from '../_data/prompt-data';

/* ── 工具：数字千分位格式化 ── */
function formatNum(n: number): string {
  return n.toLocaleString('en-US');
}

interface LiveStatConfig {
  /** 初始值 */
  initial: number;
  /** 每次增长最小值 */
  minDelta: number;
  /** 每次增长最大值 */
  maxDelta: number;
  /** 增长间隔最小值（ms） */
  minInterval: number;
  /** 增长间隔最大值（ms） */
  maxInterval: number;
  /** 小概率大增长的概率阈值（0-1，0 表示无） */
  bigChance?: number;
  /** 小概率大增长的最小值 */
  bigMinDelta?: number;
  /** 小概率大增长的最大值 */
  bigMaxDelta?: number;
}

/** 各统计项的增长参数配置 */
const STAT_CONFIGS: Record<string, LiveStatConfig> = {
  total: { initial: 12487, minDelta: 1, maxDelta: 4, minInterval: 6000, maxInterval: 12000 },
  creators: { initial: 3842, minDelta: 1, maxDelta: 3, minInterval: 10000, maxInterval: 20000 },
  tips: { initial: 1247, minDelta: 1, maxDelta: 5, minInterval: 2500, maxInterval: 6000, bigChance: 0.12, bigMinDelta: 8, bigMaxDelta: 16 },
};

/**
 * 实时统计 hook —— 模拟数据持续增长
 * 使用 requestAnimationFrame 做数字渐变动画，递归 setTimeout 调度下次增长
 */
function useLiveStat(config: LiveStatConfig | null) {
  const initialValue = config?.initial ?? 0;
  const [displayValue, setDisplayValue] = useState(initialValue);
  const [floatDelta, setFloatDelta] = useState(0);
  const [floatKey, setFloatKey] = useState(0);
  const currentValueRef = useRef(initialValue);
  const rafRef = useRef<number | null>(null);

  // 数字渐变动画（cubic ease-out，520ms）
  const animateTo = useCallback((from: number, to: number) => {
    const duration = 520;
    const start = performance.now();

    function frame(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = Math.round(from + (to - from) * eased);
      setDisplayValue(cur);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      }
    }
    rafRef.current = requestAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!config) return;

    let timer: ReturnType<typeof setTimeout>;

    function schedule() {
      const delay = config!.minInterval + Math.random() * (config!.maxInterval - config!.minInterval);
      timer = setTimeout(() => {
        // 计算增长量（含小概率大增长）
        let delta: number;
        if (config!.bigChance && config!.bigMinDelta && config!.bigMaxDelta && Math.random() < config!.bigChance) {
          delta = config!.bigMinDelta + Math.floor(Math.random() * (config!.bigMaxDelta - config!.bigMinDelta));
        } else {
          delta = config!.minDelta + Math.floor(Math.random() * (config!.maxDelta - config!.minDelta));
        }

        const prev = currentValueRef.current;
        const next = prev + delta;
        currentValueRef.current = next;
        animateTo(prev, next);
        setFloatDelta(delta);
        setFloatKey((k) => k + 1);
        schedule();
      }, delay);
    }

    schedule();

    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [config, animateTo]);

  return { displayValue, floatDelta, floatKey };
}

/* ── 单个统计面板 ── */
function StatPanel({ stat }: { stat: PromptHeroStat }) {
  // Total Categories 为静态值，不模拟增长；其余从配置中取增长参数
  const config = STAT_CONFIGS[stat.key] ?? null;
  const { displayValue, floatDelta, floatKey } = useLiveStat(config);

  return (
    <div
      className="group relative border p-4 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* 左上角金色装饰角 */}
      <span
        className="pointer-events-none absolute left-[-1px] top-[-1px] h-2.5 w-2.5"
        style={{
          borderTop: '1px solid rgba(245, 197, 24, 0.5)',
          borderLeft: '1px solid rgba(245, 197, 24, 0.5)',
        }}
      />

      {/* 数值 + 浮动增长指示 */}
      <div className="relative inline-block">
        <span
          className="font-display text-2xl font-extrabold"
          style={{ color: 'var(--gold)', letterSpacing: '0.01em', lineHeight: 1.1 }}
        >
          {formatNum(displayValue)}
        </span>
        {/* 浮动 +N 指示器 */}
        {config && floatDelta > 0 && (
          <span
            key={floatKey}
            className="pointer-events-none absolute left-1/2 top-0 font-mono text-xs font-bold"
            style={{
              color: 'var(--green)',
              animation: 'stat-float 0.95s ease-out forwards',
              transform: 'translateX(-50%)',
            }}
          >
            +{floatDelta}
          </span>
        )}
      </div>

      {/* 标签 */}
      <div
        className="mt-1.5 font-mono text-[10px] font-medium uppercase tracking-widest"
        style={{ color: 'var(--text-muted)' }}
      >
        {stat.label}
      </div>
    </div>
  );
}

export default function PromptHero() {
  return (
    <section
      className="relative text-center"
      style={{ padding: '64px 32px 48px', maxWidth: '1200px', margin: '0 auto' }}
    >
      {/* 顶部徽章 */}
      <div
        className="mb-4 font-mono text-[11px] font-semibold uppercase"
        style={{ color: 'var(--gold)', letterSpacing: '0.18em', opacity: 0.9 }}
      >
        {'\u25C6'} AI PROMPT TRADING HUB {'\u25C6'}
      </div>

      {/* 主标题 */}
      <h1
        className="font-display font-extrabold"
        style={{
          fontSize: '56px',
          lineHeight: 1.05,
          letterSpacing: '0.02em',
          color: 'var(--text)',
          marginBottom: '16px',
        }}
      >
        <span
          style={{
            color: 'var(--gold)',
            textShadow: '0 0 24px rgba(245, 197, 24, 0.25), 0 0 48px rgba(245, 197, 24, 0.12)',
          }}
        >
          PROMPT
        </span>{' '}
        MARKETPLACE
      </h1>

      {/* 副标题 */}
      <p
        className="mx-auto font-body"
        style={{
          fontSize: '16px',
          lineHeight: 1.55,
          color: 'var(--text-dim)',
          maxWidth: '640px',
          marginBottom: '36px',
        }}
      >
        Trade, buy and sell premium AI prompts for every major model.{' '}
        <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Curated by experts.</span>
      </p>

      {/* 四宫格统计面板 */}
      <div
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        style={{ maxWidth: '880px', margin: '0 auto' }}
      >
        {HERO_STATS.map((stat) => (
          <StatPanel key={stat.key} stat={stat} />
        ))}
      </div>
    </section>
  );
}

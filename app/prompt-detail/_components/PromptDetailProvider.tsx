/**
 * PromptDetailProvider —— Toast 提示 + 实时统计 + 登录状态上下文
 * 迁移自 prompt-detail-init.js 的 showToast / isLoggedIn / __liveStats 体系
 * 将全局函数转换为 React Context，避免 prop drilling
 */
'use client';

import {
  createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode,
} from 'react';
import { PROMPT_DETAIL, formatNum, type LiveStats } from '../_data/prompt-detail-data';
import { useIsLoggedIn } from '@/app/_hooks/useIsLoggedIn';

/* ═══ Context 类型定义 ═══ */

interface ToastItem {
  id: number;
  message: string;
}

interface FloatIndicator {
  id: number;
  statKey: string;
  text: string;
}

interface PromptDetailContextValue {
  /** 显示 Toast 提示 */
  showToast: (message: string) => void;
  /** 是否已登录 */
  isLoggedIn: boolean;
  /** 实时统计当前值 */
  stats: LiveStats;
  /** 评论总数（用于 header 显示） */
  reviewTotal: number;
  /** 增减统计值并触发动画 */
  bumpStat: (key: keyof LiveStats, delta: number) => void;
  /** 浮动指示器列表（供统计组件渲染） */
  floatIndicators: FloatIndicator[];
}

/* ═══ Context 实例 ═══ */

const PromptDetailContext = createContext<PromptDetailContextValue | null>(null);

/** 消费 Context 的 hook */
export function usePromptDetail(): PromptDetailContextValue {
  const ctx = useContext(PromptDetailContext);
  if (!ctx) throw new Error('usePromptDetail 必须在 PromptDetailProvider 内部使用');
  return ctx;
}

/* ═══ Provider 组件 ═══ */

export function PromptDetailProvider({ children }: { children: ReactNode }) {
  // ── Toast 状态 ──
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  // ── 登录状态（统一 hook） ──
  const { loggedIn } = useIsLoggedIn();

  // ── 实时统计 ──
  const [stats, setStats] = useState<LiveStats>(PROMPT_DETAIL.stats);
  const [reviewTotal, setReviewTotal] = useState(PROMPT_DETAIL.stats.comments);
  const [floatIndicators, setFloatIndicators] = useState<FloatIndicator[]>([]);
  const floatIdRef = useRef(0);

  /* ── Toast：显示后 2.5s 自动移除 ── */
  const showToast = useCallback((message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  /* ── 增减统计值并生成浮动指示器 ── */
  const bumpStat = useCallback((key: keyof LiveStats, delta: number) => {
    if (delta === 0) return;

    setStats((prev) => {
      const nextVal = Math.max(0, prev[key] + delta);
      return { ...prev, [key]: nextVal };
    });

    // 评论数变化时同步更新 header 总数
    if (key === 'comments') {
      setReviewTotal((prev) => Math.max(0, prev + delta));
    }

    // 正数增减时显示浮动 "+N" 指示器
    if (delta >= 1) {
      const id = ++floatIdRef.current;
      setFloatIndicators((prev) => [...prev, { id, statKey: key, text: `+${delta}` }]);
      setTimeout(() => {
        setFloatIndicators((prev) => prev.filter((f) => f.id !== id));
      }, 950);
    }
  }, []);

  /* ── 模拟实时统计增长（views / comments） ── */
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // 浏览量：每 5-11s 随机增长 1-3
    function scheduleNextView() {
      const tid = setTimeout(() => {
        bumpStat('views', 1 + Math.floor(Math.random() * 3));
        scheduleNextView();
      }, 5000 + Math.random() * 6000);
      timers.push(tid);
    }

    // 评论数：每 18-40s 随机增长 1，30% 概率同时增长评论者
    function scheduleSimulatedComment() {
      const tid = setTimeout(() => {
        bumpStat('comments', 1);
        if (Math.random() < 0.3) bumpStat('commenters', 1);
        scheduleSimulatedComment();
      }, 18000 + Math.random() * 22000);
      timers.push(tid);
    }

    scheduleNextView();
    scheduleSimulatedComment();

    return () => timers.forEach((id) => clearTimeout(id));
  }, [bumpStat]);

  const value: PromptDetailContextValue = {
    showToast,
    isLoggedIn: loggedIn,
    stats,
    reviewTotal,
    bumpStat,
    floatIndicators,
  };

  return (
    <PromptDetailContext.Provider value={value}>
      {children}
      {/* Toast 渲染层 */}
      <div className="pointer-events-none fixed inset-0 z-[200] flex flex-col items-center justify-end pb-24">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="review-toast pointer-events-auto"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text)',
              background: 'var(--surface-overlay)',
              border: '1px solid var(--border)',
              padding: '10px 20px',
              marginBottom: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              animation: 'toastSlideIn 0.3s ease forwards',
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </PromptDetailContext.Provider>
  );
}

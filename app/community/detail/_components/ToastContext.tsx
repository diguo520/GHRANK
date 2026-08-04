/**
 * ToastContext —— 帖子详情页共享 Toast 上下文
 * 提供 showToast 函数和 Toast 渲染元素，避免多个子组件各自维护 Toast
 */
'use client';

import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from 'react';

interface ToastContextValue {
  /** 显示 Toast 提示 */
  showToast: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

/** 在子组件中获取 showToast 函数 */
export function useCommunityToast(): ToastContextValue {
  return useContext(ToastContext);
}

/** Toast 提供者：包裹子组件，渲染唯一的 Toast 元素 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast 提示元素（固定在视口底部） */}
      <div
        className="fixed left-1/2 flex items-center justify-center pointer-events-none"
        style={{
          bottom: '32px',
          transform: toastVisible
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(20px)',
          background: 'var(--surface)',
          border: '1px solid rgba(245, 197, 24, 0.35)',
          padding: '12px 24px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--gold)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(245, 197, 24, 0.15)',
          zIndex: 10000,
          opacity: toastVisible ? 1 : 0,
          transition: 'opacity 0.3s, transform 0.3s',
          letterSpacing: '0.04em',
        }}
      >
        {toastMsg}
      </div>
    </ToastContext.Provider>
  );
}

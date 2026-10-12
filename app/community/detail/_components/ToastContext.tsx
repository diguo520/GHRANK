/**
 * ToastContext —— 帖子详情页共享 Toast 上下文（v2.0 antd 迁移）
 *
 * 迁移内容：
 * - 自定义 Toast DOM → antd App.useApp().message
 * - 手动定时器 → antd message 内置 duration
 *
 * 保持兼容：
 * - useCommunityToast() 返回 { showToast } 签名不变
 * - ToastProvider 仍作为 Provider 包裹子组件
 *
 * 注意：antd message 必须在 <App> 组件内部使用，
 * layout.tsx 已配置 <App>，这里通过 App.useApp() 获取实例
 */
'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { App } from 'antd';

interface ToastContextValue {
  /** 显示 Toast 提示 */
  showToast: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

/** 在子组件中获取 showToast 函数 */
export function useCommunityToast(): ToastContextValue {
  return useContext(ToastContext);
}

/**
 * Toast 提供者：包裹子组件，使用 antd message 实现 Toast
 * 注意：必须在 antd <App> 组件内部使用
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { message } = App.useApp();

  const showToast = (msg: string) => {
    message.success(msg, 2.2);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
}

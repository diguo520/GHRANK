/**
 * NotifyBridge —— 将 antd App.useApp() 获得的 message/modal/notification 实例注入 @/lib/notify 单例
 *
 * 只需要在 layout.tsx 的 <App> 组件内部最上方挂载一次即可。
 * 作用：
 *   - 让工具函数、非组件代码也能安全调用带主题上下文的 message/modal/notification
 *   - 避免新增代码忘记用 App.useApp() 而触发静态方法警告
 */
'use client';

import { useEffect } from 'react';
import { App } from 'antd';
import { setAppInstances } from '@/lib/notify';

export default function NotifyBridge() {
  const { message, modal, notification } = App.useApp();

  // 首次渲染立即同步一次实例到全局单例，避免挂载前的调用丢失
  useEffect(() => {
    setAppInstances({ message, modal, notification });
  }, [message, modal, notification]);

  // 同步：首帧即执行，不等待 useEffect（useEffect 是 render 之后）
  // 模块初始化时组件树还没建立，但第一次触发 message 大概率是用户交互之后，
  // 所以这里的 render 阶段同步赋值可以覆盖绝大多数场景。
  if (typeof window !== 'undefined') {
    setAppInstances({ message, modal, notification });
  }

  return null;
}

/**
 * notify —— 全局 antd message/modal/notification 单例
 *
 * 背景：antd v5 中 message 等静态函数无法消费 ConfigProvider 的动态主题，
 * 必须在 <App> 组件内部通过 App.useApp() 获取实例后调用，否则控制台会警告：
 *   "Static function can not consume context like dynamic theme. Please use 'App' component instead."
 *
 * 使用方式（3 选 1，按优先级）：
 *   1. 函数组件内 → const { message } = App.useApp();           // 最推荐，天然在 <App> 树内
 *   2. 函数组件内/工具文件 → import { message } from '@/lib/notify'; // 需要 NotifyBridge 已挂载（layout 已挂）
 *   3. 纯工具函数、非 React 上下文 → @/lib/notify 同样可用，回退为静态调用（无主题定制时可接受）
 *
 * 配套：在 layout.tsx 的 <App> 内最上方挂载 <NotifyBridge />，将 App.useApp 的实例注入本模块。
 */

import type { MessageInstance } from 'antd/es/message/interface';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';
import type { NotificationInstance } from 'antd/es/notification/interface';
import { message as staticMessage, Modal, notification as staticNotification } from 'antd';

type ModalInstance = Omit<ModalStaticFunctions, 'warn'>;

interface GlobalNotifyInstances {
  message: MessageInstance;
  modal: ModalInstance;
  notification: NotificationInstance;
}

/** 实例 setter：NotifyBridge 挂载后注入 App.useApp() 拿到的实例 */
let active: GlobalNotifyInstances = {
  message: staticMessage,
  // antd 静态 Modal 导出为大写 Modal，但其下 confirm/info/error 等方法即 App.useApp().modal 的静态版
  modal: Modal as unknown as ModalInstance,
  notification: staticNotification,
};

/** 供 NotifyBridge 组件在 <App> 内调用，将实例写入本模块单例 */
export function setAppInstances(instances: GlobalNotifyInstances) {
  active = instances;
}

/** 供外部模块在非组件环境里触发消息提示 */
export const message: MessageInstance = new Proxy({} as MessageInstance, {
  get: (_target, prop) => {
    const fn = (active.message as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof fn === 'function') return fn.bind(active.message);
    return fn;
  },
});

export const modal: ModalInstance = new Proxy({} as ModalInstance, {
  get: (_target, prop) => {
    const fn = (active.modal as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof fn === 'function') return fn.bind(active.modal);
    return fn;
  },
});

export const notification: NotificationInstance = new Proxy({} as NotificationInstance, {
  get: (_target, prop) => {
    const fn = (active.notification as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof fn === 'function') return fn.bind(active.notification);
    return fn;
  },
});

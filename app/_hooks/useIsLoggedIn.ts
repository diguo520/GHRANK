/**
 * useIsLoggedIn —— 统一的登录状态检测 hook
 *
 * 从 localStorage 读取 ghrank_logged_in 标记，判断当前用户是否已登录。
 * 客户端挂载后才读取真实值，避免 SSR/CSR hydration mismatch。
 *
 * 通过 AppEventContext 的 authVersion 响应登录/登出变化（替代 CustomEvent）。
 */
'use client';

import { useState, useEffect } from 'react';
import { safeStorage } from '@/lib/safeStorage';
import { DEFAULT_AVATAR, STORAGE_KEYS } from '@/lib/constants';
import { useAppEvent } from '@/app/_context/AppEventContext';

export function useIsLoggedIn(): { loggedIn: boolean; userAvatar: string; userName: string } {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userAvatar, setUserAvatar] = useState(DEFAULT_AVATAR);
  const [userName, setUserName] = useState('');
  const { authVersion } = useAppEvent();

  useEffect(() => {
    function readAuthState() {
      setLoggedIn(safeStorage.get(STORAGE_KEYS.LOGGED_IN) === '1');
      const savedAvatar = safeStorage.get(STORAGE_KEYS.USER_AVATAR);
      if (savedAvatar) setUserAvatar(savedAvatar);
      const savedName = safeStorage.get(STORAGE_KEYS.USER_NAME);
      if (savedName) setUserName(savedName);
    }

    readAuthState();

    // storage 事件：跨标签页同步
    window.addEventListener('storage', readAuthState);

    return () => {
      window.removeEventListener('storage', readAuthState);
    };
  }, [authVersion]); // authVersion 变化时重新读取（登录/登出后触发）

  return { loggedIn, userAvatar, userName };
}

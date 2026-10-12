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
import { useAppEvent } from '@/components/providers/AppEventContext';

/**
 * 判断头像 URL 是否为已废弃的旧格式：
 * 头像上传路径已从 public/uploads/avatars/ 迁移到 attachments/avatars/，
 * 旧 URL（/uploads/avatars/xxx.webp）所对应的文件已被删除，
 * 需要清理本地缓存，回退到默认头像，避免 next/image 报错。
 */
function isLegacyAvatarUrl(url: string): boolean {
  return url.startsWith('/uploads/avatars/');
}

export function useIsLoggedIn(): { loggedIn: boolean; userAvatar: string; userName: string } {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userAvatar, setUserAvatar] = useState(DEFAULT_AVATAR);
  const [userName, setUserName] = useState('');
  const { authVersion } = useAppEvent();

  useEffect(() => {
    function readAuthState() {
      const isLogged = safeStorage.get(STORAGE_KEYS.LOGGED_IN) === '1';
      setLoggedIn(isLogged);
      const savedAvatar = safeStorage.get(STORAGE_KEYS.USER_AVATAR);
      // 旧 URL 对应的文件已删除，清理本地缓存并回退到默认头像
      if (savedAvatar && !isLegacyAvatarUrl(savedAvatar)) {
        setUserAvatar(savedAvatar);
      } else {
        if (savedAvatar) safeStorage.remove(STORAGE_KEYS.USER_AVATAR);
        setUserAvatar(DEFAULT_AVATAR);
      }
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

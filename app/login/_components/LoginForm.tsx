/**
 * 登录表单组件
 * 处理用户名/密码输入与模拟登录流程
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HEX_CLIP_PATH, STORAGE_KEYS } from '@/lib/constants';
import { safeStorage } from '@/lib/safeStorage';
import { useAppEvent } from '@/app/_context/AppEventContext';
import CornerDecor from '@/components/shared/CornerDecor';

export default function LoginForm() {
  const router = useRouter();
  const { notifyAuthChange } = useAppEvent();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  /** 模拟登录 —— 设置 localStorage 标记并跳转首页 */
  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    safeStorage.set(STORAGE_KEYS.LOGGED_IN, '1');
    safeStorage.set(STORAGE_KEYS.USER_NAME, username.trim());
    // 通知 Context 同步登录态
    notifyAuthChange();
    router.push('/');
  }

  return (
    <div
      className="relative w-full mx-auto"
      style={{
        maxWidth: '400px',
        padding: 'var(--sp-7) var(--sp-6)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* 四角装饰 */}
      <CornerDecor />

      {/* 六边形 Logo */}
      <div className="flex justify-center mb-6">
        <div
          style={{
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--gold-subtle)',
            border: '2px solid var(--gold)',
            clipPath: HEX_CLIP_PATH,
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 800,
            color: 'var(--gold)',
          }}
        >
          G
        </div>
      </div>

      <h1
        className="text-center"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          fontWeight: 800,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: 'var(--sp-2)',
        }}
      >
        ACCESS TERMINAL
      </h1>
      <p
        className="text-center mb-6"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '1.5px',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
        }}
      >
        // Authentication Required
      </p>

      {/* 登录表单 */}
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label
            className="block mb-1"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '1.5px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter callsign..."
            autoComplete="username"
            className="w-full rounded-sm outline-hidden transition-colors"
            style={{
              padding: 'var(--sp-3) var(--sp-4)',
              background: 'var(--surface-overlay)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
        <div>
          <label
            className="block mb-1"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '1.5px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter code..."
            autoComplete="current-password"
            className="w-full rounded-sm outline-hidden transition-colors"
            style={{
              padding: 'var(--sp-3) var(--sp-4)',
              background: 'var(--surface-overlay)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-sm transition-all hover:shadow-[0_0_16px_rgba(245,197,24,0.4)]"
          style={{
            padding: 'var(--sp-3) var(--sp-5)',
            background: 'var(--gold)',
            color: 'var(--bg)',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginTop: 'var(--sp-3)',
          }}
        >
          AUTHENTICATE
        </button>
      </form>
    </div>
  );
}

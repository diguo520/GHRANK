/**
 * 登录表单组件（v2.1 左右布局改版）
 *
 * 布局：左侧第三方登录 | 右侧账号密码登录
 * 无背景框，直接在页面上呈现
 */
'use client';

import { Form, Input, Button, App } from 'antd';
import { useRouter } from 'next/navigation';
import { STORAGE_KEYS } from '@/lib/constants';
import { safeStorage } from '@/lib/safeStorage';
import { useAppEvent } from '@/components/providers/AppEventContext';

interface LoginFormValues {
  username: string;
  password: string;
}

/** 第三方登录按钮配置 */
const OAUTH_PROVIDERS = [
  { key: 'github', label: 'GitHub', icon: GitHubIcon },
  { key: 'google', label: 'Google', icon: GoogleIcon },
  { key: 'discord', label: 'Discord', icon: DiscordIcon },
] as const;

/** GitHub 图标 */
function GitHubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

/** Google 图标 */
function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/** Discord 图标 */
function DiscordIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const { notifyAuthChange } = useAppEvent();
  const { message } = App.useApp();

  /** 模拟登录 —— 设置 localStorage 标记并跳转首页 */
  function handleLogin(values: LoginFormValues) {
    const username = values.username.trim();
    if (!username) return;

    safeStorage.set(STORAGE_KEYS.LOGGED_IN, '1');
    safeStorage.set(STORAGE_KEYS.USER_NAME, username);
    notifyAuthChange();
    message.success(`Welcome back, ${username}`);
    router.push('/');
  }

  /** 模拟第三方登录 */
  function handleOAuth(provider: string) {
    // 模拟 OAuth 流程：直接以 provider 名作为用户名登录
    safeStorage.set(STORAGE_KEYS.LOGGED_IN, '1');
    safeStorage.set(STORAGE_KEYS.USER_NAME, provider);
    notifyAuthChange();
    message.success(`Signed in via ${provider}`);
    router.push('/');
  }

  return (
    <div
      className="w-full mx-auto flex"
      style={{
        maxWidth: '720px',
        gap: '48px',
        alignItems: 'stretch',
      }}
    >
      {/* ========== 左侧：第三方登录 ========== */}
      <div
        className="flex flex-col justify-center"
        style={{ flex: '0 0 200px' }}
      >
        <h2
          className="mb-1"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
          }}
        >
          CONTINUE WITH
        </h2>
        <p
          className="mb-5"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-muted)',
          }}
        >
          // Quick access
        </p>

        <div className="flex flex-col gap-3">
          {OAUTH_PROVIDERS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleOAuth(label)}
              className="flex items-center gap-3 transition-all"
              style={{
                padding: '10px 14px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold)';
                e.currentTarget.style.background = 'var(--gold-subtle)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--surface)';
              }}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        <p
          className="mt-4"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color: 'var(--text-muted)',
            lineHeight: '1.5',
          }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      {/* ========== 分隔线 ========== */}
      <div
        style={{
          width: '1px',
          background: 'var(--border)',
          flexShrink: 0,
        }}
      />

      {/* ========== 右侧：账号密码登录 ========== */}
      <div className="flex-1 flex flex-col justify-center">
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: '4px',
          }}
        >
          ACCESS TERMINAL
        </h1>
        <p
          className="mb-6"
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

        <Form<LoginFormValues>
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="on"
          requiredMark={false}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please enter your username' },
              { min: 2, message: 'Username must be at least 2 characters' },
            ]}
          >
            <Input
              placeholder="Enter callsign..."
              autoComplete="username"
              size="large"
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              placeholder="Enter code..."
              autoComplete="current-password"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '8px' }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
            >
              AUTHENTICATE
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

/**
 * 注册表单 —— 沉浸式单步流程（v3.0）
 *
 * 设计参考：cuiter.hailovers.com/auth/register
 * 特点：
 * 1. 每步只聚焦一个字段，减少认知负担
 * 2. 顶部线性进度条 + 步骤文字
 * 3. teal 主色系（#2DD4BF），纯黑背景
 * 4. 全宽 Continue 大按钮
 * 5. 完成后展示总结页面
 */
'use client';

import { useState } from 'react';
import { Form, Input, Button, App, Progress } from 'antd';
import { useRouter } from 'next/navigation';
import { HEX_CLIP_PATH, STORAGE_KEYS } from '@/lib/constants';
import { safeStorage } from '@/lib/safeStorage';
import { useAppEvent } from '@/components/providers/AppEventContext';

/** 步骤定义 */
interface StepConfig {
  key: string;
  label: string;
  hint: string;
  placeholder: string;
  type?: 'text' | 'password';
  rules?: any[];
  isVerifyCode?: boolean;
}

const STEPS: StepConfig[] = [
  {
    key: 'email',
    label: 'Email Address',
    hint: "You'll use this to log in",
    placeholder: 'Enter your email',
    type: 'text',
    rules: [
      { required: true, message: 'Email is required' },
      { type: 'email', message: 'Please enter a valid email' },
    ],
  },
  {
    key: 'verifyCode',
    label: 'Verification Code',
    hint: 'We sent a code to your email',
    placeholder: 'Enter 6-digit code',
    type: 'text',
    isVerifyCode: true,
    rules: [
      { required: true, message: 'Verification code is required' },
      { len: 6, message: 'Code must be 6 digits' },
      { pattern: /^\d{6}$/, message: 'Code must be 6 digits' },
    ],
  },
  {
    key: 'password',
    label: 'Password',
    hint: 'Use at least 8 characters',
    placeholder: 'Create a strong password',
    type: 'password',
    rules: [
      { required: true, message: 'Password is required' },
      { min: 8, message: 'At least 8 characters' },
    ],
  },
  {
    key: 'username',
    label: 'Username',
    hint: 'This will be your public handle',
    placeholder: 'Choose a username',
    type: 'text',
    rules: [
      { required: true, message: 'Username is required' },
      { min: 3, max: 20, message: '3-20 characters' },
      { pattern: /^[a-zA-Z0-9_]+$/, message: 'Letters, numbers, underscores only' },
    ],
  },
];

/** 主色 - GHRANK 紫色主题 */
const BRAND_COLOR = 'var(--gold)';
const BRAND_COLOR_HEX = '#9D8CFF';

export default function RegisterForm() {
  const router = useRouter();
  const { notifyAuthChange } = useAppEvent();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [stepIdx, setStepIdx] = useState(0);
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const total = STEPS.length;
  const step = STEPS[stepIdx];
  const progress = Math.round(((stepIdx + 1) / total) * 100);
  const isLastStep = stepIdx === total - 1;

  /** 发送验证码 */
  function sendCode(email: string) {
    if (!email) return;
    // 模拟发送
    const code = '123456';
    setValues((prev) => ({ ...prev, _mockCode: code }));
    message.success(`Code sent to ${email}`);
    // 60秒倒计时
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  /** 重新发送 */
  function handleResend() {
    const email = values.email || form.getFieldValue('email');
    sendCode(email);
  }

  /** 手动校验当前步骤 */
  function validateStep(value: string): string | null {
    const rules = step.rules || [];
    for (const rule of rules) {
      if (rule.required && (!value || !value.trim())) {
        return rule.message;
      }
      if (rule.min && value.length < rule.min) {
        return rule.message;
      }
      if (rule.max && value.length > rule.max) {
        return rule.message;
      }
      if (rule.type === 'email' && value) {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(value)) return rule.message;
      }
      if (rule.pattern && value) {
        if (!rule.pattern.test(value)) return rule.message;
      }
    }
    return null;
  }

  /** 校验并进入下一步 */
  function handleContinue() {
    const currentValue = form.getFieldValue(step.key) || '';
    const error = validateStep(currentValue);
    if (error) {
      message.error(error);
      return;
    }

    const merged = { ...values, [step.key]: currentValue };
    setValues(merged);

    if (isLastStep) {
      handleFinish(merged);
    } else {
      // 第一步（email）完成后自动发送验证码
      if (step.key === 'email') {
        sendCode(currentValue);
      }
      setStepIdx((i) => i + 1);
    }
  }

  function handleBack() {
    setStepIdx((i) => Math.max(0, i - 1));
    // 回填上一步的值
    const prev = STEPS[stepIdx - 1];
    if (prev) form.setFieldsValue({ [prev.key]: values[prev.key] || '' });
  }

  function handleFinish(all: Record<string, any>) {
    setSubmitting(true);
    setTimeout(() => {
      const name = all.username?.trim() || 'User';
      safeStorage.set(STORAGE_KEYS.LOGGED_IN, '1');
      safeStorage.set(STORAGE_KEYS.USER_NAME, name);
      notifyAuthChange();
      message.success('Account created successfully!');
      router.push('/');
    }, 1000);
  }

  return (
    <div
      className="w-full flex flex-col items-center"
      style={{
        maxWidth: '420px',
        padding: '80px 0 40px',
      }}
    >
      {/* 六边形 Logo - GHRANK */}
      <div
        className="flex items-center justify-center mb-8"
        style={{
          width: '72px',
          height: '72px',
          background: 'var(--gold-subtle)',
          border: '2px solid var(--gold)',
          clipPath: HEX_CLIP_PATH,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            fontWeight: 800,
            color: 'var(--gold)',
            lineHeight: 1,
          }}
        >
          G
        </span>
      </div>

      {/* 标题 */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: '4px',
          textAlign: 'center',
        }}
      >
        Create Account
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--text-dim)',
          marginBottom: '32px',
          textAlign: 'center',
        }}
      >
        Join us today!
      </p>

      {/* 进度条 */}
      <div className="w-full mb-2">
        <Progress
          percent={progress}
          showInfo={false}
          strokeColor={BRAND_COLOR_HEX}
          railColor="var(--border)"
          size={['100%', '3px']}
        />
      </div>

      {/* 步骤文字 */}
      <p
        className="w-full mb-6"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          textAlign: 'left',
        }}
      >
        Step {stepIdx + 1} of {total}
      </p>

      {/* 当前步骤内容 */}
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="w-full"
        initialValues={{
          email: values.email || '',
          username: values.username || '',
          password: values.password || '',
          displayName: values.displayName || '',
          bio: values.bio || '',
        }}
      >
        {/* 步骤标签 + 提示 */}
        <div className="mb-5">
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: '4px',
            }}
          >
            {step.label}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-dim)',
            }}
          >
            {step.hint}
          </p>
        </div>

        {/* 验证码步骤特殊处理：提示信息在 Form.Item 之外 */}
        {step.isVerifyCode && (
          <div className="mb-3">
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--text-dim)',
              }}
            >
              Code sent to{' '}
              <span style={{ color: 'var(--gold)', fontWeight: 500 }}>
                {values.email}
              </span>
            </p>
          </div>
        )}

        {/* 输入框 */}
        <Form.Item
          name={step.key}
          hasFeedback={false}
          valuePropName={step.isVerifyCode ? 'value' : 'value'}
          getValueFromEvent={step.isVerifyCode ? ((e: any) => e) : undefined}
          style={{ marginBottom: '24px' }}
        >
          {step.type === 'password' ? (
            <Input.Password
              placeholder={step.placeholder}
              size="large"
              style={{ height: '52px', borderRadius: '12px', fontSize: '15px' }}
            />
          ) : step.isVerifyCode ? (
            <Input.OTP
              length={6}
              size="large"
              style={{ gap: '10px' }}
            />
          ) : (
            <Input
              placeholder={step.placeholder}
              size="large"
              style={{ height: '52px', borderRadius: '12px', fontSize: '15px' }}
            />
          )}
        </Form.Item>

        {/* 验证码重新发送链接 */}
        {step.isVerifyCode && (
          <p
            className="mt-0"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              paddingBottom: '16px',
            }}
          >
            Didn&apos;t get the code?{' '}
            {countdown > 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>
                Resend in {countdown}s
              </span>
            ) : (
              <a
                onClick={handleResend}
                style={{
                  color: 'var(--gold)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                Resend
              </a>
            )}
          </p>
        )}

        {/* 按钮组 */}
        <div className="flex gap-3">
          {stepIdx > 0 && (
            <Button
              size="large"
              onClick={handleBack}
              style={{
                height: '52px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 500,
                borderColor: '#333',
                color: '#aaa',
                background: 'transparent',
              }}
            >
              Back
            </Button>
          )}
          <Button
            type="primary"
            size="large"
            loading={submitting}
            onClick={handleContinue}
            style={{
              height: '52px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              flex: 1,
            }}
          >
            {submitting ? 'Creating...' : isLastStep ? 'Create Account' : 'Continue'}
          </Button>
        </div>
      </Form>

      {/* 底部登录链接 */}
      <p
        className="mt-8"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--text-muted)',
        }}
      >
        Already have an account?{' '}
        <a
          href="/login"
          style={{ color: 'var(--gold)', fontWeight: 500, textDecoration: 'none' }}
        >
          Log in
        </a>
      </p>
    </div>
  );
}

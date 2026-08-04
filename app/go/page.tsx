/**
 * /go —— 外部网站跳转提示页
 *
 * 接受 query 参数 url（无需协议），例如 /go?url=openai.com
 * 显示 5 秒倒计时、目标站点信息、安全提示与手动跳转入口。
 */
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ExternalLinkIcon, GlobeIcon, ShieldIcon, ArrowLeftIcon } from '../_components/icons';

const COUNTDOWN_SECONDS = 5;

function normalizeUrl(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // 去除用户可能带上的协议头，统一用 https
  const withoutProtocol = trimmed.replace(/^https?:\/\//, '').replace(/^\/\//, '');
  if (!withoutProtocol) return null;
  return withoutProtocol;
}

function GoPageContent() {
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get('url');
  const target = normalizeUrl(rawUrl);
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!target) return;
    if (seconds <= 0) {
      window.location.href = `https://${target}`;
      return;
    }
    if (isPaused) return;

    const timer = window.setTimeout(() => {
      setSeconds((s) => s - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [target, seconds, isPaused]);

  if (!target) {
    return (
      <main className="main-content" style={{ maxWidth: '720px', margin: '0 auto', padding: '120px 24px' }}>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '48px 32px',
            textAlign: 'center',
          }}
        >
          <GlobeIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: '18px' }} />
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--text)',
              marginBottom: '8px',
            }}
          >
            Missing Destination
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dim)', marginBottom: '24px' }}>
            No target website was provided. Please check the link and try again.
          </p>
          <Link
            href="/website"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'var(--gold)',
              color: 'var(--bg)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderRadius: '3px',
              textDecoration: 'none',
            }}
          >
            <ArrowLeftIcon size={14} />
            Browse Directory
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content" style={{ maxWidth: '720px', margin: '0 auto', padding: '120px 24px' }}>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px',
          padding: '40px 32px',
          textAlign: 'center',
        }}
      >
        {/* 顶部图标 */}
        <div
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--gold)',
            background: 'rgba(245, 197, 24, 0.08)',
            borderRadius: '50%',
          }}
        >
          <GlobeIcon size={28} style={{ color: 'var(--gold)' }} />
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 800,
            color: 'var(--text)',
            marginBottom: '8px',
          }}
        >
          You are leaving GHRANK
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dim)', marginBottom: '28px' }}>
          This link will take you to an external website. We are not responsible for the content or security of third-party sites.
        </p>

        {/* 目标 URL 卡片 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '16px 20px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '3px',
            textAlign: 'left',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: 'var(--surface-overlay)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--gold)',
            }}
          >
            {target.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginBottom: '2px',
              }}
            >
              Destination
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {target}
            </div>
          </div>
          <ExternalLinkIcon size={18} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
        </div>

        {/* 倒计时环 */}
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              border: '3px solid var(--border)',
              borderTopColor: 'var(--gold)',
              transform: 'rotate(-90deg)',
              transition: 'border-color 0.3s',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: 800,
                color: 'var(--gold)',
                transform: 'rotate(90deg)',
              }}
            >
              {seconds}
            </span>
          </div>
          <div
            style={{
              marginTop: '12px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-dim)',
            }}
          >
            Redirecting automatically in {seconds} second{seconds === 1 ? '' : 's'}...
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            href="/website"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderRadius: '3px',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--text-dim)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-dim)';
            }}
          >
            <ArrowLeftIcon size={14} />
            Go Back
          </Link>

          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--gold)';
              e.currentTarget.style.color = 'var(--gold)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-dim)';
            }}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          <a
            href={`https://${target}`}
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'var(--gold)',
              color: 'var(--bg)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderRadius: '3px',
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            <ExternalLinkIcon size={14} />
            Go Now
          </a>
        </div>

        {/* 安全提示 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '28px',
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          <ShieldIcon size={14} />
          <span>Always verify the URL before entering credentials or personal information.</span>
        </div>
      </div>
    </main>
  );
}

export default function GoPage() {
  return (
    <Suspense
      fallback={
        <main className="main-content" style={{ maxWidth: '720px', margin: '0 auto', padding: '120px 24px' }}>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '40px 32px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dim)' }}>Loading redirect...</div>
          </div>
        </main>
      }
    >
      <GoPageContent />
    </Suspense>
  );
}

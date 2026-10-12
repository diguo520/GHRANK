/**
 * Billing 页面已废弃 → 重定向到 Wallet（网站不需要订阅，统一走钱包系统）
 *
 * 保留此页面用于：兼容旧书签 / 历史链接，展示钱包概览 + 一键跳转
 * 实际充值、提现、交易、绑定均在 /wallet 中完成
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';
import { Button } from 'antd';
import {
  Wallet as LucideWallet,
  ArrowDownToLine as LucideDeposit,
  ArrowUpFromLine as LucideWithdraw,
  Receipt as LucideTx,
  CreditCard as LucideCard,
} from 'lucide-react';
import SettingsShell from '../_components/SettingsShell';
import { WALLET_BALANCE, WALLET_PENDING, WALLET_HOLD, WALLET_CURRENCY, USD_RATE } from '@/lib/data/wallet-data';

function fmtGhr(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtUsd(n: number) {
  return `$${fmtGhr(n * USD_RATE)}`;
}

const cardStyle: CSSProperties = {
  padding: '18px',
  borderRadius: 12,
  border: '1px solid var(--border-subtle)',
  background: 'transparent',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  textDecoration: 'none',
  color: 'inherit',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease, transform 0.2s ease',
};

export default function BillingPage() {
  const router = useRouter();

  // 1 秒后自动跳转到 /wallet（保留页面给用户一个视觉过渡）
  useEffect(() => {
    const t = setTimeout(() => router.replace('/wallet'), 1200);
    return () => clearTimeout(t);
  }, [router]);

  const jump = (tab?: string) => {
    const url = tab ? `/wallet?tab=${tab}` : '/wallet';
    router.push(url);
  };

  return (
    <SettingsShell
      title="Wallet"
      subtitle="Subscriptions have been replaced by the wallet system. Redirecting…"
    >
      <div>
        {/* 余额卡：金边高亮 */}
        <section
          style={{
            padding: '28px 32px',
            borderRadius: 12,
            border: '1px solid rgba(212,175,55,0.35)',
            background:
              'linear-gradient(160deg, rgba(212,175,55,0.10), rgba(157,140,255,0.05))',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--gold)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 10,
            }}
          >
            Available Balance
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 40,
                fontWeight: 800,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              {fmtGhr(WALLET_BALANCE)}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--gold)',
              }}
            >
              {WALLET_CURRENCY}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--text-muted)',
                marginLeft: 'auto',
              }}
            >
              ≈ {fmtUsd(WALLET_BALANCE)} · 1 GHR = $1.00
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-muted)',
              }}
            >
              Pending settlement:{' '}
              <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
                {fmtGhr(WALLET_PENDING)} {WALLET_CURRENCY}
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-muted)',
              }}
            >
              On hold:{' '}
              <span style={{ color: 'var(--text)', fontWeight: 700 }}>
                {fmtGhr(WALLET_HOLD)} {WALLET_CURRENCY}
              </span>
            </div>
          </div>
        </section>

        {/* 快捷入口卡片 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14,
            marginBottom: 20,
          }}
        >
          {[
            { label: 'Deposit', hint: 'Top up GHR credits', tab: 'deposit', icon: <LucideDeposit size={18} strokeWidth={1.9} />, accent: true },
            { label: 'Withdraw', hint: 'Cash out to platform', tab: 'withdraw', icon: <LucideWithdraw size={18} strokeWidth={1.9} /> },
            { label: 'Transactions', hint: 'Full history & export', tab: 'history', icon: <LucideTx size={18} strokeWidth={1.9} /> },
            { label: 'Payment Methods', hint: 'Bind Alipay / WeChat / PayPal…', tab: 'methods', icon: <LucideCard size={18} strokeWidth={1.9} /> },
          ].map((q) => (
            <a
              key={q.label}
              onClick={() => jump(q.tab)}
              style={cardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: q.accent
                    ? 'linear-gradient(180deg, rgba(212,175,55,0.18), rgba(157,140,255,0.08))'
                    : 'var(--surface)',
                  border: '1px solid var(--border-subtle)',
                  color: q.accent ? 'var(--gold)' : 'var(--text-dim)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {q.icon}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 15,
                  fontWeight: 800,
                  color: 'var(--text)',
                  marginTop: 4,
                }}
              >
                {q.label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  color: 'var(--text-dim)',
                }}
              >
                {q.hint}
              </span>
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<LucideWallet size={16} strokeWidth={1.9} />}
            onClick={() => jump()}
            style={{
              background:
                'linear-gradient(180deg, rgba(212,175,55,0.95), rgba(168,140,38,0.95))',
              borderColor: 'var(--gold)',
              color: '#1a1708',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              height: 'auto',
              padding: '10px 24px',
            }}
          >
            Open Full Wallet →
          </Button>
        </div>
      </div>
    </SettingsShell>
  );
}

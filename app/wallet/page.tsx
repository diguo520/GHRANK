/**
 * Wallet / 钱包（充值 / 提现 / 交易记录，X 设置中心同款三栏布局）
 *
 *  三栏骨架：
 *   ┌────── 260px ─────┬──────────────── 1fr ────────────────┬──────── 320px ───────┐
 *   │ LEFT             │ MIDDLE                              │ RIGHT                 │
 *   │ 大标题 Wallet     │ 充值 / 提现 / 记录 tab 切换内容      │ 余额卡 / 快捷方式     │
 *   │ · 子菜单项        │ · Deposit · Withdraw · History     │ · Methods 链接        │
 *   │  · Dashboard     │                                     │                       │
 *   │  · Deposit       │                                     │                       │
 *   │  · Withdraw      │                                     │                       │
 *   │  · History       │                                     │                       │
 *   │  · Methods       │                                     │                       │
 *   └──────────────────┴─────────────────────────────────────┴───────────────────────┘
 *
 * 相关链接：
 *   - SideNav Wallet 图标 → /wallet
 *   - SideNav Drawer Deposit → /wallet?tab=deposit
 *   - SideNav Drawer Withdraw → /wallet?tab=withdraw
 *   - Deposit/Withdraw History 行 → prompt 详情页 /prompt-detail?id=…
 *   - "Buy GHR" 站外示例链接（当前用 # 占位）
 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard as LucideDash,
  ArrowDownToLine as LucideDeposit,
  ArrowUpFromLine as LucideWithdraw,
  Receipt as LucideTx,
  CreditCard as LucideCard,
  Copy as LucideCopy,
  Check as LucideCheck,
  CircleDollarSign as LucideDollar,
  ShieldCheck as LucideShield,
  HelpCircle as LucideHelp,
  ChevronRight as LucideChev,
  Clock as LucideClock,
  AlertTriangle as LucideWarn,
  Search as LucideSearch,
  Download as LucideExport,
  Wallet as LucideWallet,
  CircleDot as LucideDot,
} from 'lucide-react';
import {
  WALLET_CURRENCY, WALLET_BALANCE, WALLET_PENDING, WALLET_HOLD, USD_RATE,
  QUICK_AMOUNTS_DEPOSIT, QUICK_AMOUNTS_WITHDRAW,
  PAYMENT_PLATFORMS, PLATFORM_META,
  WALLET_TRANSACTIONS, TX_KIND_META,
  type TxKind, type PlatformKind, type PaymentPlatform,
} from '@/lib/data/wallet-data';
import type { ReactNode } from 'react';
import { isImageAvatar } from '@/lib/avatar';
import { modalOverlayStyle, modalPanelStyle, modalCloseBtnStyle, modalBtnStyle } from '@/lib/modal-styles';
import SettingsSidebar from '../settings/_components/SettingsSidebar';

/* ══════════════════════════════════════════════════════
   工具/常量
   ══════════════════════════════════════════════════════ */

type WalletSection = 'dashboard' | 'deposit' | 'withdraw' | 'history' | 'methods';

function fmtGhr(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtUsd(n: number) {
  return `$${fmtGhr(n * USD_RATE)}`;
}

/* ══════════════════════════════════════════════════════
   头像
   ══════════════════════════════════════════════════════ */

function Avatar({ src, name, size = 32 }: { src: string; name: string; size?: number }) {
  const useImg = isImageAvatar(src);
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', overflow: 'hidden',
        background: useImg ? 'var(--surface-overlay)' : 'var(--gold-subtle)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {useImg ? (
        <img src={src} alt={`${name} avatar`} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
      ) : (
        <span className="font-display" style={{
          color: 'var(--gold)', fontWeight: 800, lineHeight: 1,
          fontSize: size >= 40 ? 16 : 12,
        }}>{src}</span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   统一在线支付平台徽章（支 / 微 / P / S / ₿）
   —— 充值、提现、Methods 列表共用同一套视觉
   ══════════════════════════════════════════════════════ */

function PlatformBadge({ kind, size = 30 }: { kind: PlatformKind; size?: number }) {
  const m = PLATFORM_META[kind];
  return (
    <span
      aria-label={m.display}
      style={{
        width: size,
        height: Math.round(size * 0.75),
        borderRadius: 5,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: m.bg,
        color: m.color,
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: Math.max(10, Math.round(size * 0.42)),
        border: `1px solid ${m.color}33`,
      }}
    >
      {m.glyph}
    </span>
  );
}

/* ══════════════════════════════════════════════════════
   中间面板 header + footer 小壳子
   ══════════════════════════════════════════════════════ */

function Panel({ title, subtitle, children, footer }:
  { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <section style={{
      display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0,
    }}>
      <header style={{
        padding: '22px 36px 18px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <h2 className="font-display" style={{
          fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0,
          letterSpacing: '-0.005em',
        }}>{title}</h2>
        {subtitle && (
          <p className="font-body" style={{
            fontSize: 13, color: 'var(--text-dim)', margin: '6px 0 0', lineHeight: 1.5,
          }}>{subtitle}</p>
        )}
      </header>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 36px 28px' }}>
        {children}
      </div>
      {footer && (
        <footer style={{
          padding: '12px 36px 18px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
        }}>{footer}</footer>
      )}
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   DASHBOARD 概览
   ══════════════════════════════════════════════════════ */

function Dashboard({ go }: { go: (s: WalletSection) => void }) {
  const recent = WALLET_TRANSACTIONS.slice(0, 5);
  return (
    <Panel
      title="Overview"
      subtitle="A glance at your credits, pending settlements, and recent activity."
    >
      {/* 顶部数值卡 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <BalanceCard label="Available Balance" value={fmtGhr(WALLET_BALANCE)} sub={`≈ ${fmtUsd(WALLET_BALANCE)}`}
          accent primary cta={{ text: 'Deposit', onClick: () => go('deposit') }}
          icon={<LucideWallet size={16} strokeWidth={1.9} />} />
        <BalanceCard label="Pending settlement" value={fmtGhr(WALLET_PENDING)} sub="Clearing EOD · 1 transaction"
          cta={{ text: 'View history', onClick: () => go('history') }}
          icon={<LucideClock size={16} strokeWidth={1.9} />} />
        <BalanceCard label="On hold" value={fmtGhr(WALLET_HOLD)} sub="Newly listed prompts · 3 items"
          cta={{ text: 'Payment platforms', onClick: () => go('methods') }}
          icon={<LucideDollar size={16} strokeWidth={1.9} />} />
      </div>

      {/* 最近交易 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 className="font-display" style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
          Recent activity
        </h3>
        <button type="button" onClick={() => go('history')}
          className="meta-hud-mono"
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--gold)', cursor: 'pointer', fontSize: 11, letterSpacing: '0.04em',
          }}>
          All transactions →
        </button>
      </div>
      <TxRows txs={recent} compact />
    </Panel>
  );
}

function BalanceCard({
  label, value, sub, accent, primary, icon, cta,
}: {
  label: string; value: string; sub?: string; accent?: boolean; primary?: boolean; icon: ReactNode;
  cta?: { text: string; onClick: () => void };
}) {
  return (
    <div style={{
      position: 'relative',
      padding: '18px 18px 16px',
      borderRadius: 14,
      background: primary
        ? 'linear-gradient(160deg, rgba(212,175,55,0.08), rgba(157,140,255,0.06))'
        : 'var(--surface)',
      border: `1px solid ${primary ? 'rgba(212,175,55,0.35)' : 'var(--border-subtle)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span className="meta-hud-mono" style={{
          fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)',
        }}>{label}</span>
        <span style={{
          width: 28, height: 28, borderRadius: 8,
          background: accent || primary ? 'rgba(212,175,55,0.15)' : 'var(--surface)',
          color: accent || primary ? 'var(--gold)' : 'var(--text-dim)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--border-subtle)',
        }}>{icon}</span>
      </div>
      <div className="font-display" style={{
        fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1,
      }}>
        {value}&nbsp;
        <span className="meta-hud-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>
          {WALLET_CURRENCY}
        </span>
      </div>
      {sub && (
        <div className="meta-hud-mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
          {sub}
        </div>
      )}
      {cta && (
        <button type="button" onClick={cta.onClick}
          style={{
            marginTop: 12, padding: '6px 12px',
            borderRadius: 999,
            border: `1px solid ${primary ? 'rgba(212,175,55,0.5)' : 'var(--border)'}`,
            background: primary ? 'linear-gradient(180deg, rgba(212,175,55,0.95), rgba(168,140,38,0.95))' : 'transparent',
            color: primary ? '#1a1708' : 'var(--text)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.02em', cursor: 'pointer',
          }}
          className="meta-hud-mono"
        >
          {cta.text} →
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   DEPOSIT 充值
   ══════════════════════════════════════════════════════ */

function Deposit() {
  const [amount, setAmount] = useState<string>('50');
  // 统一使用 PAYMENT_PLATFORMS：同一绑定账户同时用于充值和提现
  const [platforms, setPlatforms] = useState<PaymentPlatform[]>(PAYMENT_PLATFORMS);
  const [method, setMethod] = useState<string>(PAYMENT_PLATFORMS[0].id);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const current = platforms.find((p) => p.id === method) ?? platforms[0];
  const num = Number(amount.replace(/[^\d.]/g, '')) || 0;

  function handleAdd(p: PaymentPlatform) {
    setPlatforms((prev) => [...prev, p]);
  }

  return (
    <Panel
      title="Deposit · Add GHR credits"
      subtitle="Top up via Alipay / WeChat / PayPal / Stripe / crypto. 1 GHR = $1 USD. 绑定账户和提现共用。"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="meta-hud-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            🔒 Deposit via {PLATFORM_META[current.kind].shortLabel} · #DP-{Date.now().toString().slice(-6)}
          </div>
          <button
            type="button"
            disabled={num <= 0}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              background: num > 0
                ? 'linear-gradient(180deg, rgba(212,175,55,0.95), rgba(168,140,38,0.95))'
                : 'var(--border-subtle)',
              color: num > 0 ? '#1a1708' : 'var(--text-muted)',
              fontWeight: 700, fontSize: 13, letterSpacing: '0.02em',
              cursor: num > 0 ? 'pointer' : 'not-allowed',
            }}
            className="meta-hud-mono"
          >
            {num > 0 ? `Deposit ${fmtGhr(num)} GHR` : 'Choose an amount'}
          </button>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20 }}>
        {/* 左：金额 */}
        <div style={{
          padding: 18, borderRadius: 12,
          border: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
        }}>
          <label className="meta-hud-mono" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Amount
          </label>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 10,
            marginTop: 6, paddingBottom: 10,
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <span className="font-display" style={{ fontSize: 44, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {fmtGhr(num)}
            </span>
            <span className="meta-hud-mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>
              GHR
            </span>
            <span className="meta-hud-mono" style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>
              ≈ {fmtUsd(num)}
            </span>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14,
          }}>
            {QUICK_AMOUNTS_DEPOSIT.map((a) => {
              const active = Number(amount) === a;
              return (
                <button key={a} type="button" onClick={() => setAmount(String(a))}
                  style={{
                    padding: '9px 10px', borderRadius: 8,
                    border: `1px solid ${active ? 'rgba(212,175,55,0.5)' : 'var(--border)'}`,
                    background: active ? 'rgba(212,175,55,0.08)' : 'transparent',
                    color: 'var(--text)',
                    fontSize: 13, fontWeight: active ? 800 : 500, cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                  }}>
                  {a} <span className="meta-hud-mono" style={{ color: 'var(--text-muted)', fontSize: 10 }}>GHR</span>
                </button>
              );
            })}
          </div>
          <label style={{ display: 'block', marginTop: 16 }}>
            <span className="meta-hud-mono" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Or enter custom
            </span>
            <div style={{
              marginTop: 6, padding: '8px 12px',
              border: '1px solid var(--border)', borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--surface)',
            }}>
              <span className="meta-hud-mono" style={{ color: 'var(--gold)', fontWeight: 800 }}>GHR</span>
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-display"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text)', fontSize: 16, fontWeight: 700,
                }}
              />
            </div>
          </label>
        </div>

        {/* 右：支付方式（共用统一平台列表） */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            padding: 18, borderRadius: 12,
            border: '1px solid var(--border-subtle)',
            background: 'var(--surface)',
          }}>
            <div className="meta-hud-mono" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
              Pay from · same binding for deposit &amp; withdraw
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {platforms.map((m) => {
                const active = method === m.id;
                return (
                  <label key={m.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1px solid ${active ? 'rgba(212,175,55,0.5)' : 'var(--border-subtle)'}`,
                    background: active ? 'rgba(212,175,55,0.04)' : 'transparent',
                    cursor: 'pointer',
                  }}>
                    <input type="radio" name="deposit-method" checked={active}
                      onChange={() => setMethod(m.id)} style={{ accentColor: '#D4AF37' }} />
                    <PlatformBadge kind={m.kind} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="font-display block" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{m.label}</span>
                      <span className="meta-hud-mono block" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{m.sub}</span>
                    </span>
                    {m.primary && (
                      <span className="meta-hud-mono" style={{
                        fontSize: 9, padding: '2px 6px', borderRadius: 999,
                        border: '1px solid var(--border-subtle)', color: 'var(--text-muted)',
                      }}>DEFAULT</span>
                    )}
                  </label>
                );
              })}
            </div>
            <button type="button" className="meta-hud-mono"
              onClick={() => setDrawerOpen(true)}
              style={{
                marginTop: 10, padding: '7px 10px',
                width: '100%', borderRadius: 8,
                border: '1px dashed var(--border)',
                background: 'transparent',
                color: 'var(--gold)', fontSize: 11, cursor: 'pointer',
                letterSpacing: '0.04em',
              }}>
              + Bind Alipay / WeChat / PayPal / Stripe / Crypto
            </button>
          </div>

          {/* 费用说明 */}
          <div style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--surface)' }}>
            <FeeLine label="Subtotal" value={`${fmtGhr(num)} GHR`} />
            <FeeLine label={`Processing fee · ${PLATFORM_META[current.kind].shortLabel}`}
              value={num > 0 ? `$${(num * 0.029 + 0.3).toFixed(2)}` : '$0.00'} />
            <FeeLine label="Bonus (+1%)" value={num > 0 ? `+${fmtGhr(Number((num * 0.01).toFixed(2)))} GHR` : '+0.00 GHR'} muted color="var(--green)" />
            <hr style={{ border: 'none', borderTop: '1px dashed var(--border-subtle)', margin: '8px 0' }} />
            <FeeLine label="You receive"
              value={num > 0 ? `${fmtGhr(num + num * 0.01)} GHR` : '0.00 GHR'}
              bold color="var(--gold)" />
          </div>
        </div>
      </div>
      <AddPlatformModal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdd={handleAdd}
      />
    </Panel>
  );
}

function FeeLine({ label, value, bold, muted, color }:
  { label: string; value: string; bold?: boolean; muted?: boolean; color?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: 12, padding: '3px 0',
      fontFamily: bold ? 'var(--font-display)' : 'var(--font-body)',
      fontWeight: bold ? 800 : 500,
      color: color ?? (muted ? 'var(--text-muted)' : 'var(--text-dim)'),
    }}>
      <span>{label}</span>
      <span className="meta-hud-mono">{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   WITHDRAW 提现
   ══════════════════════════════════════════════════════ */

function Withdraw() {
  const [amount, setAmount] = useState<string>('100');
  // 提现使用与充值完全相同的 PAYMENT_PLATFORMS 列表（同一绑定账户双向可用）
  const [platforms, setPlatforms] = useState<PaymentPlatform[]>(PAYMENT_PLATFORMS);
  const [method, setMethod] = useState<string>(PAYMENT_PLATFORMS[0].id);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const current = platforms.find((p) => p.id === method) ?? platforms[0];
  const num = Number(amount.replace(/[^\d.]/g, '')) || 0;

  function handleAdd(p: PaymentPlatform) {
    setPlatforms((prev) => [...prev, p]);
  }

  // 按平台差异化提现手续费（模拟真实场景）
  const fee = useMemo(() => {
    switch (current.kind) {
      case 'alipay': return +(num * 0.006 + 0.1).toFixed(2);    // 支付宝 0.6% + ¥0.1 固定
      case 'wechat': return +(num * 0.006 + 0.1).toFixed(2);    // 微信支付 0.6% + ¥0.1
      case 'paypal': return +(num * 0.029 + 0.3).toFixed(2);    // PayPal 国际 2.9% + $0.3
      case 'stripe': return +(num * 0.015).toFixed(2);          // Stripe Instant 1.5%
      case 'crypto': return +(1.0).toFixed(2);                  // 链上固定 $1 网络费
    }
  }, [current.kind, num]);

  const feeLabel = useMemo(() => {
    switch (current.kind) {
      case 'alipay': return '0.6% + ¥0.1';
      case 'wechat': return '0.6% + ¥0.1';
      case 'paypal': return '2.9% + $0.3';
      case 'stripe': return '1.5% Instant';
      case 'crypto': return 'network $1.00';
    }
  }, [current.kind]);

  const receive = Math.max(0, num - fee);
  const over = num > WALLET_BALANCE;

  return (
    <Panel
      title="Withdraw · Cash out GHR"
      subtitle="Cash out to the same payment platform account you use for deposits. Alipay/WeChat ~10 min; PayPal 1–2 days; crypto ~5 min."
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="meta-hud-mono" style={{
            fontSize: 11,
            color: over ? '#F472B6' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {over && <><LucideWarn size={13} strokeWidth={2} /> Balance insufficient.</>}
            {!over && <>Via {PLATFORM_META[current.kind].shortLabel} · Reviewed within 1 business day · #WD-{Date.now().toString().slice(-6)}</>}
          </div>
          <button
            type="button"
            disabled={num <= 0 || over}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              background: num > 0 && !over
                ? 'linear-gradient(180deg, rgba(212,175,55,0.95), rgba(168,140,38,0.95))'
                : 'var(--border-subtle)',
              color: num > 0 && !over ? '#1a1708' : 'var(--text-muted)',
              fontWeight: 700, fontSize: 13, letterSpacing: '0.02em',
              cursor: num > 0 && !over ? 'pointer' : 'not-allowed',
            }}
            className="meta-hud-mono"
          >
            {over ? 'Top up balance first' : `Withdraw ${fmtGhr(receive)} GHR`}
          </button>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20 }}>
        <div style={{ padding: 18, borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div className="meta-hud-mono" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Available
              </div>
              <div className="font-display" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>
                {fmtGhr(WALLET_BALANCE)}
                <span className="meta-hud-mono" style={{ fontSize: 11, color: 'var(--gold)', marginLeft: 6 }}>{WALLET_CURRENCY}</span>
              </div>
            </div>
            <button type="button"
              onClick={() => setAmount(String(Math.max(0, WALLET_BALANCE - 1)))}
              style={{
                padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.4)',
                background: 'rgba(212,175,55,0.05)', cursor: 'pointer',
              }}
              className="meta-hud-mono"
            >Withdraw Max</button>
          </div>

          <label className="meta-hud-mono" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Amount to withdraw
          </label>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 10,
            marginTop: 6, paddingBottom: 10,
            borderBottom: `1px solid ${over ? '#F472B6' : 'var(--border-subtle)'}`,
          }}>
            <span className="font-display" style={{ fontSize: 44, fontWeight: 800, color: over ? '#F472B6' : 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {fmtGhr(num)}
            </span>
            <span className="meta-hud-mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>GHR</span>
            <span className="meta-hud-mono" style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>
              ≈ {fmtUsd(receive)} <span style={{ color: 'var(--text-dim)' }}>after fee</span>
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14 }}>
            {QUICK_AMOUNTS_WITHDRAW.map((a) => {
              const active = Number(amount) === a;
              return (
                <button key={a} type="button" onClick={() => setAmount(String(a))}
                  style={{
                    padding: '9px 10px', borderRadius: 8,
                    border: `1px solid ${active ? 'rgba(212,175,55,0.5)' : 'var(--border)'}`,
                    background: active ? 'rgba(212,175,55,0.08)' : 'transparent',
                    color: 'var(--text)', fontSize: 13,
                    fontWeight: active ? 800 : 500, cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                  }}>
                  {a} <span className="meta-hud-mono" style={{ color: 'var(--text-muted)', fontSize: 10 }}>GHR</span>
                </button>
              );
            })}
          </div>
          <label style={{ display: 'block', marginTop: 16 }}>
            <span className="meta-hud-mono" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Custom amount
            </span>
            <div style={{
              marginTop: 6, padding: '8px 12px',
              border: `1px solid ${over ? '#F472B6' : 'var(--border)'}`, borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--surface)',
            }}>
              <span className="meta-hud-mono" style={{ color: 'var(--gold)', fontWeight: 800 }}>GHR</span>
              <input
                inputMode="decimal" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-display"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: over ? '#F472B6' : 'var(--text)', fontSize: 16, fontWeight: 700,
                }}
              />
            </div>
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 18, borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--surface)' }}>
            <div className="meta-hud-mono" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
              Payout to · same binding as deposits
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {platforms.map((m) => {
                const active = method === m.id;
                return (
                  <label key={m.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1px solid ${active ? 'rgba(212,175,55,0.5)' : 'var(--border-subtle)'}`,
                    background: active ? 'rgba(212,175,55,0.04)' : 'transparent',
                    cursor: 'pointer',
                  }}>
                    <input type="radio" name="withdraw-method" checked={active}
                      onChange={() => setMethod(m.id)} style={{ accentColor: '#D4AF37' }} />
                    <PlatformBadge kind={m.kind} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="font-display block" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{m.label}</span>
                      <span className="meta-hud-mono block" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{m.sub}</span>
                    </span>
                    {m.primary && (
                      <span className="meta-hud-mono" style={{
                        fontSize: 9, padding: '2px 6px', borderRadius: 999,
                        border: '1px solid var(--border-subtle)', color: 'var(--text-muted)',
                      }}>DEFAULT</span>
                    )}
                  </label>
                );
              })}
            </div>
            <button type="button" className="meta-hud-mono"
              onClick={() => setDrawerOpen(true)}
              style={{
                marginTop: 10, padding: '7px 10px',
                width: '100%', borderRadius: 8,
                border: '1px dashed var(--border)',
                background: 'transparent', color: 'var(--gold)', fontSize: 11,
                cursor: 'pointer', letterSpacing: '0.04em',
              }}>
              + Bind a platform account
            </button>
          </div>

          <div style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--surface)' }}>
            <FeeLine label="Requested amount" value={`${fmtGhr(num)} GHR`} />
            <FeeLine label={`Withdrawal fee · ${PLATFORM_META[current.kind].shortLabel} (${feeLabel})`}
              value={`${fmtGhr(fee)} GHR`} />
            <hr style={{ border: 'none', borderTop: '1px dashed var(--border-subtle)', margin: '8px 0' }} />
            <FeeLine label="You receive" value={`${fmtGhr(receive)} GHR · ${fmtUsd(receive)}`} bold color="var(--gold)" />
          </div>
        </div>
      </div>
      <AddPlatformModal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdd={handleAdd}
      />
    </Panel>
  );
}

/* ══════════════════════════════════════════════════════
   HISTORY 交易记录
   ══════════════════════════════════════════════════════ */

const KIND_FILTERS: Array<{ key: 'all' | TxKind; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'deposit', label: 'Deposits' },
  { key: 'withdraw', label: 'Withdrawals' },
  { key: 'tip_in', label: 'Tips in' },
  { key: 'tip_out', label: 'Tips out' },
  { key: 'sale', label: 'Sales' },
  { key: 'purchase', label: 'Purchases' },
  { key: 'bonus', label: 'Bonuses' },
];

function History() {
  const [kind, setKind] = useState<'all' | TxKind>('all');
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const txs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WALLET_TRANSACTIONS.filter((t) => {
      if (kind !== 'all' && t.kind !== kind) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        (t.meta ?? '').toLowerCase().includes(q) ||
        (t.user?.name ?? '').toLowerCase().includes(q) ||
        t.amountGhr.toLowerCase().includes(q)
      );
    });
  }, [kind, query]);

  return (
    <Panel
      title="Transactions"
      subtitle="Deposits, withdrawals, tips and sales. Filter, copy TX IDs or export CSV."
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="meta-hud-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Showing {txs.length} of {WALLET_TRANSACTIONS.length} · Period: Last 3 months
          </span>
          <button type="button" style={{
            padding: '8px 14px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }} className="meta-hud-mono">
            <LucideExport size={13} strokeWidth={2} /> Export CSV
          </button>
        </div>
      }
    >
      {/* 搜索 + filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', flex: '1 1 260px', maxWidth: 360 }}>
          <LucideSearch size={14} strokeWidth={1.9} style={{ position: 'absolute', left: 10, color: 'var(--text-muted)' }} />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title / user / TX id"
            className="font-body"
            style={{
              width: '100%', padding: '8px 10px 8px 30px',
              borderRadius: 8, border: '1px solid var(--border-subtle)',
              background: 'var(--surface)', color: 'var(--text)', fontSize: 12.5,
              outline: 'none',
            }}
          />
        </label>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6,
          padding: 4, borderRadius: 999,
          border: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
        }}>
          {KIND_FILTERS.map((f) => {
            const active = kind === f.key;
            return (
              <button key={f.key} type="button" onClick={() => setKind(f.key)}
                style={{
                  padding: '5px 12px', borderRadius: 999,
                  border: 'none',
                  background: active ? 'linear-gradient(180deg, rgba(212,175,55,0.95), rgba(168,140,38,0.95))' : 'transparent',
                  color: active ? '#1a1708' : 'var(--text-dim)',
                  fontSize: 11, fontWeight: active ? 800 : 600, cursor: 'pointer',
                }}
                className="meta-hud-mono"
              >{f.label}</button>
            );
          })}
        </div>
      </div>

      <TxRows txs={txs} compact={false} onCopyMeta={(t) => {
        setCopied(t.id);
        setTimeout(() => setCopied(null), 1200);
      }} copiedId={copied} />
    </Panel>
  );
}

function TxRows({ txs, compact, onCopyMeta, copiedId }:
  { txs: typeof WALLET_TRANSACTIONS; compact: boolean; onCopyMeta?: (t: typeof WALLET_TRANSACTIONS[number]) => void; copiedId?: string | null }) {
  return (
    <div style={{
      border: '1px solid var(--border-subtle)',
      borderRadius: 12, background: 'var(--surface)', overflow: 'hidden',
    }}>
      {!compact && (
        <div
          className="meta-hud-mono"
          style={{
            display: 'grid',
            gridTemplateColumns: '22px 1fr 110px 160px 36px',
            gap: 14,
            padding: '10px 16px',
            fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--text-muted)',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <span></span>
          <span>Description</span>
          <span style={{ textAlign: 'right' }}>Amount</span>
          <span style={{ textAlign: 'right' }}>Date / Method</span>
          <span></span>
        </div>
      )}
      {txs.length === 0 && (
        <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
          No transactions match this filter.
        </div>
      )}
      {txs.map((t, i) => {
        const meta = TX_KIND_META[t.kind];
        return (
          <Link
            key={t.id}
            href={t.relatedHref ?? '#'}
            style={{
              display: 'grid',
              gridTemplateColumns: compact
                ? '22px 1fr 110px 110px'
                : '22px 1fr 110px 160px 36px',
              gap: 14,
              padding: '13px 16px',
              borderTop: i === 0 && !compact ? 'none' : '1px solid var(--border-subtle)',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {/* Kind glyph */}
            <span style={{
              width: 22, height: 22, borderRadius: 6,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface)', border: '1px solid var(--border-subtle)',
              color: meta.color, fontWeight: 800, fontSize: 12,
              flexShrink: 0, alignSelf: 'center',
            }}>
              {meta.glyph}
            </span>

            {/* 描述 + 元信息 */}
            <div style={{ minWidth: 0 }}>
              <div className="font-display" style={{
                fontSize: 13.5, fontWeight: 700, color: 'var(--text)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {t.title}
                {t.status !== 'completed' && (
                  <span className="meta-hud-mono" style={{
                    fontSize: 9, padding: '2px 6px', borderRadius: 999,
                    border: '1px solid var(--border-subtle)',
                    color: t.status === 'pending' ? '#fbbf24' : '#F472B6',
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                  }}>
                    {t.status === 'pending' ? <LucideDot size={9} strokeWidth={3} /> : <LucideWarn size={9} strokeWidth={2.5} />}
                    {t.status.toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                {t.user && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Avatar src={t.user.avatar} name={t.user.name} size={16} />
                    <span className="meta-hud-mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                      @{t.user.name}
                    </span>
                  </span>
                )}
                {t.meta && (
                  <span className="meta-hud-mono" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                    {t.meta}
                  </span>
                )}
              </div>
            </div>

            {/* 金额 */}
            <div className="meta-hud-mono" style={{ alignSelf: 'center', textAlign: 'right' }}>
              <div style={{
                fontSize: 13, fontWeight: 800, letterSpacing: '0.01em',
                color: t.amountGhr.startsWith('+') ? 'var(--green)' : 'var(--text)',
              }}>
                {t.amountGhr}
                <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: 10, marginLeft: 2 }}>GHR</span>
              </div>
              {t.fiat && (
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{t.fiat}</div>
              )}
            </div>

            {/* 日期 / 方式 */}
            <div className="meta-hud-mono" style={{ alignSelf: 'center', textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{t.time}</div>
              {t.method && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{t.method}</div>}
            </div>

            {/* 复制 meta */}
            {!compact && onCopyMeta && (
              <span style={{ alignSelf: 'center', textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onCopyMeta(t);
                  }}
                  title="Copy TX id"
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--surface)',
                    color: copiedId === t.id ? 'var(--green)' : 'var(--text-dim)',
                    cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {copiedId === t.id ? <LucideCheck size={13} strokeWidth={2.2} /> : <LucideCopy size={13} strokeWidth={1.9} />}
                </button>
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   添加支付平台 · 居中模态框
   —— overlay 居中、panel 固定宽度、圆角、阴影，与举报/编辑弹窗风格一致
   ══════════════════════════════════════════════════════ */

const PLATFORM_OPTIONS: Array<{ kind: PlatformKind; label: string; placeholder: string; helper: string }> = [
  { kind: 'alipay', label: '支付宝 Alipay',     placeholder: '支付宝账号（手机号/邮箱）', helper: '用于充值和提现，即时到账' },
  { kind: 'wechat', label: '微信支付 WeChat',   placeholder: '微信号',                      helper: '用于充值和提现，即时到账' },
  { kind: 'paypal', label: 'PayPal',            placeholder: 'PayPal 邮箱地址',              helper: '国际账户，1–2 工作日结算，手续费 2.9% + $0.3' },
  { kind: 'stripe', label: 'Stripe',            placeholder: '卡号（如 4242 4242 4242 4242）',helper: 'Stripe Connect 绑定卡片，Instant Payout 1.5%' },
  { kind: 'crypto', label: '加密货币 Crypto',   placeholder: '钱包地址（USDC/USDT 等）',      helper: '链上转账，约 5 分钟到账，网络费 ≈ $0.02' },
];

function AddPlatformModal({
  open, onClose, onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (p: PaymentPlatform) => void;
}) {
  const [kind, setKind] = useState<PlatformKind>('alipay');
  const [account, setAccount] = useState('');

  // 关闭时重置表单
  useEffect(() => {
    if (!open) {
      setKind('alipay');
      setAccount('');
    }
  }, [open]);

  if (!open) return null;

  const opt = PLATFORM_OPTIONS.find((o) => o.kind === kind) ?? PLATFORM_OPTIONS[0];
  const canSubmit = account.trim().length >= 2;

  function handleSubmit() {
    if (!canSubmit) return;
    const meta = PLATFORM_META[kind];
    onAdd({
      id: `${kind}-${Date.now().toString().slice(-6)}`,
      kind,
      label: `${meta.shortLabel} · ${account.trim().slice(0, 20)}`,
      sub: opt.helper,
      supportsDeposit: true,
      supportsWithdraw: true,
    });
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={modalOverlayStyle}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...modalPanelStyle,
          width: 480, maxWidth: '100%',
          maxHeight: '85vh',
          borderRadius: 14,
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div>
            <h3 className="font-display" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
              绑定支付平台
            </h3>
            <p className="font-body" style={{ fontSize: 12, color: 'var(--text-dim)', margin: '4px 0 0' }}>
              绑定后同时用于充值与提现
            </p>
          </div>
          <button type="button" onClick={onClose}
            style={modalCloseBtnStyle}
            aria-label="关闭"
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>×</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
          {/* 平台选择 */}
          <div style={{ marginBottom: 20 }}>
            <label className="meta-hud-mono" style={{
              fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text-muted)', display: 'block', marginBottom: 10,
            }}>
              选择平台
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {PLATFORM_OPTIONS.map((o) => {
                const active = kind === o.kind;
                return (
                  <button key={o.kind} type="button" onClick={() => setKind(o.kind)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 12px',
                      borderRadius: 10,
                      border: `1px solid ${active ? 'rgba(212,175,55,0.5)' : 'var(--border-subtle)'}`,
                      background: active ? 'rgba(212,175,55,0.06)' : 'var(--surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <PlatformBadge kind={o.kind} size={28} />
                    <span className="font-display" style={{
                      fontSize: 12.5, fontWeight: 700,
                      color: active ? 'var(--text)' : 'var(--text-dim)',
                    }}>{o.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 账号输入 */}
          <div>
            <label className="meta-hud-mono" style={{
              fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text-muted)', display: 'block', marginBottom: 8,
            }}>
              {opt.label} · 账号
            </label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder={opt.placeholder}
              className="font-body"
              style={{
                width: '100%', padding: '11px 13px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)', fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <p className="font-body" style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>
              {opt.helper}
            </p>
          </div>

          {/* 安全提示 */}
          <div style={{
            marginTop: 20, padding: 14,
            borderRadius: 10,
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <LucideShield size={14} strokeWidth={1.9} style={{ color: 'var(--green)' }} />
              <span className="font-display" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)' }}>
                安全保障
              </span>
            </div>
            <p className="font-body" style={{ margin: 0, fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.45 }}>
              你的支付信息经过端到端加密存储，仅用于充值与提现，不会分享给第三方。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 22px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', gap: 10,
        }}>
          <button type="button" onClick={onClose}
            style={{ ...modalBtnStyle('secondary'), flex: 1 }}
            className="meta-hud-mono"
          >
            取消
          </button>
          <button type="button" onClick={handleSubmit} disabled={!canSubmit}
            style={{ ...modalBtnStyle('primary', !canSubmit), flex: 1 }}
            className="meta-hud-mono"
          >
            确认绑定
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   METHODS / 统一支付平台绑定
   —— 充值与提现共用同一个绑定账户（单栏列表）
   ══════════════════════════════════════════════════════ */

function Methods() {
  const [platforms, setPlatforms] = useState<PaymentPlatform[]>(PAYMENT_PLATFORMS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleAdd(p: PaymentPlatform) {
    setPlatforms((prev) => [...prev, p]);
  }

  return (
    <Panel
      title="Payment platforms · unified binding"
      subtitle="绑定后同时用于充值与提现。可同时绑定多个平台（支付宝 / 微信 / PayPal / Stripe / 加密货币）。"
    >
      <PlatformBlock
        title="已绑定的支付平台"
        subtitle="每个平台账户既可充值到 GHR 钱包，也可从 GHR 钱包提现到账。"
        items={platforms}
        empty="+ Bind Alipay / WeChat / PayPal / Stripe / Crypto"
        onAddClick={() => setDrawerOpen(true)}
      />
      <AddPlatformModal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdd={handleAdd}
      />
    </Panel>
  );
}

function PlatformBlock({ title, subtitle, items, empty, onAddClick }: {
  title: string; subtitle: string;
  items: PaymentPlatform[];
  empty: string;
  onAddClick: () => void;
}) {
  return (
    <div style={{
      padding: 18, borderRadius: 12,
      border: '1px solid var(--border-subtle)',
      background: 'var(--surface)',
      maxWidth: 720,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{title}</h3>
          <p className="font-body" style={{ fontSize: 12, color: 'var(--text-dim)', margin: '4px 0 0' }}>{subtitle}</p>
        </div>
        <span className="meta-hud-mono" style={{
          fontSize: 10, padding: '3px 8px', borderRadius: 999,
          background: 'rgba(80, 255, 170, 0.08)',
          color: 'var(--green)',
          border: '1px solid rgba(80, 255, 170, 0.25)',
          whiteSpace: 'nowrap',
        }}>
          {items.length} linked · deposit &amp; withdraw
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((m) => (
          <div key={m.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 12px',
            borderRadius: 8,
            border: '1px solid var(--border-subtle)',
            background: 'var(--surface)',
          }}>
            <PlatformBadge kind={m.kind} size={34} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="font-display block" style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>{m.label}</span>
              <span className="meta-hud-mono block" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{m.sub}</span>
            </span>
            <span style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4,
            }}>
              {m.primary ? (
                <span className="meta-hud-mono" style={{
                  fontSize: 9, padding: '2px 7px', borderRadius: 999,
                  border: '1px solid rgba(212,175,55,0.4)',
                  background: 'rgba(212,175,55,0.06)',
                  color: 'var(--gold)', fontWeight: 700,
                }}>PRIMARY · 默认</span>
              ) : (
                <button type="button" className="meta-hud-mono"
                  style={{
                    fontSize: 9.5, padding: '2px 7px', borderRadius: 999,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-dim)', cursor: 'pointer', fontWeight: 700,
                  }}>设为默认</button>
              )}
              <span className="meta-hud-mono" style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                充值 ✓ · 提现 ✓
              </span>
            </span>
          </div>
        ))}
      </div>
      <button type="button" className="meta-hud-mono"
        onClick={onAddClick}
        style={{
          marginTop: 14, padding: '9px 10px',
          width: '100%', borderRadius: 8,
          border: '1px dashed var(--border)',
          background: 'transparent', color: 'var(--gold)', fontSize: 11.5, cursor: 'pointer',
          letterSpacing: '0.04em', fontWeight: 700,
        }}>
        {empty}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   RIGHT 侧栏
   ══════════════════════════════════════════════════════ */

function Right({ section, go }: { section: WalletSection; go: (s: WalletSection) => void }) {
  return (
    <aside style={{
      height: '100%',
      padding: '24px 20px 32px',
      background: 'var(--surface)',
      overflowY: 'auto',
    }}>
      {/* 余额卡 */}
      <div style={{
        position: 'relative',
        padding: 18,
        borderRadius: 14,
        background: 'linear-gradient(160deg, rgba(212,175,55,0.15), rgba(157,140,255,0.10))',
        border: '1px solid rgba(212,175,55,0.35)',
        overflow: 'hidden',
        marginBottom: 16,
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: -1,
          background: 'repeating-linear-gradient(135deg, rgba(212,175,55,0.08) 0 2px, transparent 2px 7px)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="meta-hud-mono" style={{
              fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)',
            }}>GHR CREDITS</span>
            <span className="meta-hud-mono" style={{
              fontSize: 10, padding: '2px 7px', borderRadius: 999,
              background: 'rgba(212,175,55,0.12)', color: 'var(--gold)',
              border: '1px solid rgba(212,175,55,0.35)', fontWeight: 700,
            }}>VERIFIED</span>
          </div>
          <div className="font-display" style={{
            fontSize: 34, fontWeight: 800, color: 'var(--text)',
            marginTop: 10, letterSpacing: '-0.02em', lineHeight: 1,
          }}>
            {fmtGhr(WALLET_BALANCE)}
          </div>
          <div className="meta-hud-mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            ≈ {fmtUsd(WALLET_BALANCE)} · 1 GHR = $1.00
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
            <MiniStat label="Pending" value={`+${fmtGhr(WALLET_PENDING)}`} accent="gold" />
            <MiniStat label="On hold" value={fmtGhr(WALLET_HOLD)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
            <button type="button" onClick={() => go('deposit')}
              style={{
                padding: '8px 10px', borderRadius: 8,
                border: '1px solid rgba(212,175,55,0.5)',
                background: 'linear-gradient(180deg, rgba(212,175,55,0.95), rgba(168,140,38,0.95))',
                color: '#1a1708', fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
              }} className="meta-hud-mono">+ Deposit</button>
            <button type="button" onClick={() => go('withdraw')}
              style={{
                padding: '8px 10px', borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
              }} className="meta-hud-mono">Withdraw</button>
          </div>
        </div>
      </div>

      {/* 快捷导航 */}
      <div style={{
        padding: 14, borderRadius: 12,
        border: '1px solid var(--border-subtle)', background: 'var(--surface)',
      }}>
        <div className="meta-hud-mono" style={{
          fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'var(--text-muted)', marginBottom: 10,
        }}>QUICK ACCESS</div>
        {([
          { id: 'dashboard' as WalletSection, label: 'Overview', icon: <LucideDash size={14} strokeWidth={2} /> },
          { id: 'deposit'   as WalletSection, label: 'Deposit',  icon: <LucideDeposit size={14} strokeWidth={2} /> },
          { id: 'withdraw'  as WalletSection, label: 'Withdraw', icon: <LucideWithdraw size={14} strokeWidth={2} /> },
          { id: 'history'   as WalletSection, label: 'Transactions', icon: <LucideTx size={14} strokeWidth={2} /> },
          { id: 'methods'   as WalletSection, label: 'Payment Platforms', icon: <LucideCard size={14} strokeWidth={2} /> },
        ]).map((q) => (
          <button
            key={q.id} type="button" onClick={() => go(q.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '7px 8px', marginBottom: 2,
              background: section === q.id ? 'rgba(157,140,255,0.08)' : 'transparent',
              border: 'none', borderRadius: 6,
              color: section === q.id ? 'var(--text)' : 'var(--text-dim)',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <span style={{ color: 'var(--gold)' }}>{q.icon}</span>
            <span className="font-display" style={{ fontSize: 12.5, fontWeight: 700 }}>{q.label}</span>
          </button>
        ))}
      </div>

      {/* 帮助/税 */}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <QuickCard
          title="Tax documents"
          subtitle="Download 1099 / invoices"
          icon={<LucideTx size={16} strokeWidth={1.9} />}
          href="#tax"
        />
        <QuickCard
          title="Fee schedule"
          subtitle="Deposit, withdrawal, and tipping"
          icon={<LucideHelp size={16} strokeWidth={1.9} />}
          href="#fees"
        />
        <QuickCard
          title="Buy more GHR →"
          subtitle="Top up instantly via Alipay / WeChat / Stripe"
          icon={<LucideDollar size={16} strokeWidth={1.9} />}
          href="#deposit"
          accent
        />
      </div>
    </aside>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: 'gold' }) {
  return (
    <div style={{
      padding: '8px 10px', borderRadius: 8,
      background: accent ? 'rgba(212,175,55,0.10)' : 'rgba(255,255,255,0.02)',
      border: '1px solid var(--border-subtle)',
    }}>
      <div className="meta-hud-mono" style={{
        fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)',
      }}>{label}</div>
      <div className="font-display" style={{
        fontSize: 15, fontWeight: 800, color: accent ? 'var(--gold)' : 'var(--text)', marginTop: 2,
      }}>{value}</div>
    </div>
  );
}

function QuickCard({ title, subtitle, icon, href, accent }:
  { title: string; subtitle: string; icon: ReactNode; href: string; accent?: boolean }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: 12,
      borderRadius: 10,
      background: accent
        ? 'linear-gradient(160deg, rgba(212,175,55,0.08), rgba(157,140,255,0.05))'
        : 'var(--surface)',
      border: `1px solid ${accent ? 'rgba(212,175,55,0.3)' : 'var(--border-subtle)'}`,
      textDecoration: 'none', color: 'inherit',
    }}>
      <span style={{
        width: 30, height: 30, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface)',
        color: accent ? 'var(--gold)' : 'var(--text-dim)',
        border: '1px solid var(--border-subtle)',
      }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="font-display block" style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{title}</span>
        <span className="meta-hud-mono block" style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</span>
      </span>
      <span style={{ color: 'var(--gold)' }}><LucideChev size={14} strokeWidth={2.2} /></span>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════
   主页面
   ══════════════════════════════════════════════════════ */

export default function WalletPage() {
  const params = useSearchParams();
  const router = useRouter();

  // 初始 section：URL ?tab=deposit|withdraw|history|methods
  const sectionFromUrl = (() => {
    const t = params?.get('tab');
    if (t === 'deposit' || t === 'withdraw' || t === 'history' || t === 'methods') return t;
    return 'dashboard';
  })() as WalletSection;
  const [section, setSection] = useState<WalletSection>(sectionFromUrl);

  // 切换 section 时同步 URL（刷新保持、支持外链跳转）
  useEffect(() => {
    setSection(sectionFromUrl);
  }, [sectionFromUrl]);

  function go(s: WalletSection) {
    setSection(s);
    const url = s === 'dashboard' ? '/wallet' : `/wallet?tab=${s}`;
    router.replace(url, { scroll: false });
  }

  return (
    <main className="main-content" style={{
      maxWidth: 1480, margin: '0 auto',
      padding: '12px 24px 32px',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr 320px',
        minHeight: 'calc(100vh - 80px)',
      }} className="wallet-grid">
        <div className="wallet-col-left">
          <SettingsSidebar />
        </div>
        <div className="wallet-col-middle" style={{ minWidth: 0 }}>
          {section === 'dashboard' && <Dashboard go={go} />}
          {section === 'deposit'   && <Deposit />}
          {section === 'withdraw'  && <Withdraw />}
          {section === 'history'   && <History />}
          {section === 'methods'   && <Methods />}
        </div>
        <div className="wallet-col-right">
          <Right section={section} go={go} />
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 1200px) {
          .wallet-grid { grid-template-columns: 220px 1fr; }
          .wallet-col-right { display: none; }
        }
        @media (max-width: 760px) {
          .wallet-grid { grid-template-columns: 1fr; }
          .wallet-col-left { display: none; }
        }
      `}</style>
    </main>
  );
}

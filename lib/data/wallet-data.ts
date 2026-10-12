/**
 * Wallet mock 数据 —— 供 /wallet 充值/提现页面使用
 *
 * 设计更新（2026-08-09）：
 * - 移除银行卡 / 信用卡（card/bank/ACH），仅保留在线支付平台（Alipay / WeChat / PayPal / Stripe / Crypto）
 * - 合并 PAYMENT_METHODS + PAYOUT_ACCOUNTS 为统一的 PAYMENT_PLATFORMS
 *   每个绑定账户同时支持充值和提现（同一个绑定 = 双向可用）
 * - 用户可绑定多个平台（比如同时绑定 Alipay + PayPal + 一个 Crypto 地址）
 *
 * 与 sidenav-data.ts 的 WALLET 余额保持一致（1247.50 GHR）。
 * 复用 monogram 字母头像规则（交易里对手方用户头像）。
 */

/* ═══ 类型 ═══ */

export type TxKind =
  | 'deposit'
  | 'withdraw'
  | 'tip_in'
  | 'tip_out'
  | 'purchase'
  | 'sale'
  | 'bonus'
  | 'refund';

export interface WalletTx {
  id: string;
  kind: TxKind;
  title: string;
  user?: { name: string; avatar: string }; // 打赏/购买的对手方
  relatedHref?: string;                    // 点击跳转到 prompt/帖子
  amountGhr: string;                       // 带正负号，如 +50.00 / -15.00
  fiat?: string;                           // 充值提现场景下对应的 USD
  status: 'completed' | 'pending' | 'failed';
  time: string;
  method?: string;                         // 充值/提现：支付方式显示名
  meta?: string;                           // 小字元数据：TX id、平台信息、网络
}

/**
 * 在线支付平台类型（充值提现共用，无银行卡/信用卡）
 *  - alipay  : 支付宝
 *  - wechat  : 微信支付
 *  - paypal  : PayPal（国际主流）
 *  - stripe  : Stripe Connect / Stripe 余额 / 借记卡(通过 Stripe 绑定)
 *  - crypto  : 加密货币钱包（USDT/USDC 等链上地址）
 */
export type PlatformKind = 'alipay' | 'wechat' | 'paypal' | 'stripe' | 'crypto';

/**
 * 统一的支付平台绑定账户
 *  - 同时用于 Deposit 和 Withdraw（充值提现共用绑定）
 *  - 一个用户可以绑定多个平台（多平台共存）
 *  - primary 标记默认首选
 */
export interface PaymentPlatform {
  id: string;
  kind: PlatformKind;
  label: string;                           // 支付宝 · 张三  /  PayPal · user@email.com  /  USDC (Base)
  sub: string;                             // 小号说明：到账时效、尾号、地址、网络等
  primary?: boolean;                       // 是否为默认首选
  supportsDeposit: true;                   // 所有在线平台都支持充值
  supportsWithdraw: true;                  // 所有在线平台都支持提现
}

/* ═══ 向后兼容别名（防止未同步的旧引用编译失败）═════ */
/** @deprecated Use PaymentPlatform instead */
export type PaymentMethod = PaymentPlatform;
/** @deprecated Use PaymentPlatform instead */
export type PayoutAccount = PaymentPlatform;

/* ═══ 头像辅助 ═══ */

function monogram(username: string): string {
  const parts = username.split(/[_.\-]+/).filter(Boolean);
  const heads = parts.length >= 2
    ? `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`
    : username.slice(0, 1);
  return heads.toUpperCase();
}

/* ═══ 常量 ═══ */

export const WALLET_CURRENCY = 'GHR';
export const WALLET_BALANCE = 1247.5;
export const WALLET_PENDING = 32.0;
export const WALLET_HOLD = 45.0;
export const USD_RATE = 1.0; // 1 GHR = $1.00 便于展示

export const QUICK_AMOUNTS_DEPOSIT = [10, 25, 50, 100, 250, 500];
export const QUICK_AMOUNTS_WITHDRAW = [25, 50, 100, 250, 500, 1000];

/**
 * 统一支付平台绑定列表（充值 & 提现共用）
 *
 * 说明：
 *  - 无银行卡 / 无信用卡实体信息（无 VISA/Mastercard/Chase/ACH）
 *  - 全部是在线支付平台或加密货币钱包
 *  - 同一账户 ID 同时可用于充值和提现
 *  - 用户可绑定多个平台
 */
export const PAYMENT_PLATFORMS: PaymentPlatform[] = [
  {
    id: 'alipay-1',
    kind: 'alipay',
    label: '支付宝 · 张三',
    sub: '账号 138****8888 · 即时到账',
    primary: true,
    supportsDeposit: true,
    supportsWithdraw: true,
  },
  {
    id: 'wechat-1',
    kind: 'wechat',
    label: '微信支付 · Taier_Design',
    sub: '微信号 taier_**** · 即时到账',
    supportsDeposit: true,
    supportsWithdraw: true,
  },
  {
    id: 'paypal-1',
    kind: 'paypal',
    label: 'PayPal · user@email.com',
    sub: '国际账户 · 1–2 工作日 · 手续费 2.9% + $0.3',
    supportsDeposit: true,
    supportsWithdraw: true,
  },
  {
    id: 'stripe-1',
    kind: 'stripe',
    label: 'Stripe · ****4242',
    sub: 'Stripe Connect 绑定卡片 · Instant Payout 1.5%',
    supportsDeposit: true,
    supportsWithdraw: true,
  },
  {
    id: 'crypto-1',
    kind: 'crypto',
    label: 'USDC (Base)',
    sub: '0xAbC1…eF31 · 链上 ~5 分钟 · 网络费 ≈ $0.02',
    supportsDeposit: true,
    supportsWithdraw: true,
  },
];

/* ═══ 向后兼容导出 ═══ */
/** @deprecated Use PAYMENT_PLATFORMS instead */
export const PAYMENT_METHODS: PaymentPlatform[] = PAYMENT_PLATFORMS;
/** @deprecated Use PAYMENT_PLATFORMS instead */
export const PAYOUT_ACCOUNTS: PaymentPlatform[] = PAYMENT_PLATFORMS;

/* ═══ 交易历史（最近 14 条，够做两屏长列表效果）═════
 *   注意：method / meta 字段使用新的在线支付平台文案
 *   ══════════════════════════════════════════════════ */

export const WALLET_TRANSACTIONS: WalletTx[] = [
  { id: 'tx-01', kind: 'tip_in',   title: 'Alex Shader tipped your Prompt', user: { name: 'alexshader', avatar: monogram('alexshader') },
    relatedHref: '/prompt-detail?id=1', amountGhr: '+50.00', status: 'completed', time: '2 minutes ago',
    meta: 'Cinematic Portrait Generator' },
  { id: 'tx-02', kind: 'tip_in',   title: 'Byteforge tipped your Prompt', user: { name: 'byteforge', avatar: monogram('byteforge') },
    relatedHref: '/prompt-detail?id=2', amountGhr: '+20.00', status: 'completed', time: '3 hours ago',
    meta: 'SEO Blog Writer Pro' },
  { id: 'tx-03', kind: 'withdraw', title: 'Withdrawal to 支付宝 · 张三', amountGhr: '-250.00', fiat: '-$250.00',
    status: 'pending', time: '6 hours ago', method: 'Alipay · 138****8888', meta: '预计 10 分钟内到账 · #WD-20481' },
  { id: 'tx-04', kind: 'tip_out',  title: 'You tipped Nova\'s Prompt',      user: { name: 'nova_dev', avatar: monogram('nova_dev') },
    amountGhr: '-15.00', status: 'completed', time: '1 day ago', meta: 'Animation Motion Blueprint' },
  { id: 'tx-05', kind: 'sale',     title: 'Sold Prompt · Film Color Grading',
    relatedHref: '/prompt-detail?id=5', amountGhr: '+40.00', status: 'completed', time: '2 days ago', meta: '3 sales · $185.00 total' },
  { id: 'tx-06', kind: 'bonus',    title: 'Weekly Creator Bonus',         amountGhr: '+120.00', fiat: '+$120.00',
    status: 'completed', time: '2 days ago', meta: 'Top 5% creators week 32' },
  { id: 'tx-07', kind: 'purchase', title: 'Purchased @mirakade\'s Prompt',   user: { name: 'mirakade', avatar: monogram('mirakade') },
    relatedHref: '/prompt-detail?id=5', amountGhr: '-5.00', status: 'completed', time: '2 days ago',
    meta: 'Film Color Grading Assistant' },
  { id: 'tx-08', kind: 'refund',   title: 'Refund · duplicate charge #INV-8812', amountGhr: '+18.00',
    status: 'completed', time: '3 days ago', meta: 'Refunded via PayPal · user@email.com' },
  { id: 'tx-09', kind: 'deposit',  title: 'Deposit — 支付宝 · 张三',        amountGhr: '+500.00', fiat: '+$500.00',
    status: 'completed', time: '5 days ago', method: 'Alipay', meta: '#DP-11230 · 即时到账' },
  { id: 'tx-10', kind: 'tip_in',   title: 'Kairos tipped your analysis post',       user: { name: 'kairos', avatar: monogram('kairos') },
    amountGhr: '+8.00', status: 'completed', time: '1 week ago', meta: 'React Fiber architecture thread' },
  { id: 'tx-11', kind: 'withdraw', title: 'Withdrawal to USDC (Base)',        amountGhr: '-1,000.00', fiat: '-$1,000.00',
    status: 'completed', time: '1 week ago', method: 'ERC-20 · 0xAbC1…eF31', meta: '#WD-20317 · Tx 0x7f…a1b2 · 网络费 $0.02' },
  { id: 'tx-12', kind: 'sale',     title: 'Sold Prompt · React Architecture Advisor',
    relatedHref: '/prompt-detail?id=3', amountGhr: '+0.00', status: 'completed', time: '2 weeks ago', meta: 'Free prompt · 12 new follows' },
  { id: 'tx-13', kind: 'deposit',  title: 'Deposit — PayPal',           amountGhr: '+2,000.00', fiat: '+$2,000.00',
    status: 'completed', time: '3 weeks ago', method: 'PayPal · user@email.com', meta: '#DP-10890 · 1 工作日结算' },
  { id: 'tx-14', kind: 'tip_out',  title: 'You tipped Pixel Witch\'s art post', user: { name: 'pixelwitch', avatar: monogram('pixelwitch') },
    amountGhr: '-10.00', status: 'completed', time: '1 month ago', meta: 'Palette breakdown thread' },
];

/* ═══ 小帮助：TxKind 对应标签与颜色 ═══ */

export const TX_KIND_META: Record<TxKind, { label: string; glyph: string; color: string }> = {
  deposit:  { label: 'Deposit',  glyph: '↓', color: 'var(--cyan)' },
  withdraw: { label: 'Withdraw', glyph: '↑', color: '#F472B6' },
  tip_in:   { label: 'Tip in',   glyph: '¤', color: 'var(--green)' },
  tip_out:  { label: 'Tip out',  glyph: '¤', color: '#F472B6' },
  purchase: { label: 'Purchase', glyph: '→', color: 'var(--text-muted)' },
  sale:     { label: 'Sale',     glyph: '◆', color: 'var(--gold)' },
  bonus:    { label: 'Bonus',    glyph: '✦', color: 'var(--gold)' },
  refund:   { label: 'Refund',   glyph: '←', color: 'var(--cyan)' },
};

/* ═══ PlatformKind 展示元信息（图标、颜色、展示名）═════ */

export const PLATFORM_META: Record<
  PlatformKind,
  { display: string; shortLabel: string; color: string; bg: string; glyph: string }
> = {
  alipay: {
    display: 'Alipay 支付宝',
    shortLabel: 'Alipay',
    color: '#1677FF',
    bg: 'rgba(22, 119, 255, 0.15)',
    glyph: '支',
  },
  wechat: {
    display: 'WeChat Pay 微信支付',
    shortLabel: 'WeChat',
    color: '#07C160',
    bg: 'rgba(7, 193, 96, 0.15)',
    glyph: '微',
  },
  paypal: {
    display: 'PayPal',
    shortLabel: 'PayPal',
    color: '#003087',
    bg: 'rgba(0, 48, 135, 0.18)',
    glyph: 'P',
  },
  stripe: {
    display: 'Stripe',
    shortLabel: 'Stripe',
    color: '#635BFF',
    bg: 'rgba(99, 91, 255, 0.18)',
    glyph: 'S',
  },
  crypto: {
    display: 'Crypto Wallet',
    shortLabel: 'Crypto',
    color: 'var(--green)',
    bg: 'rgba(80, 255, 170, 0.12)',
    glyph: '₿',
  },
};

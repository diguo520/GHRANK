/**
 * SideNav mock 数据 & 类型定义
 * 从 SideNav.tsx 中抽离，供 SideNav 组件导入使用
 *
 * 头像约定（与社区 / about / profile 页面保持一致）：
 *   - 真实用户头像：1~3 个大写字母的「字母徽章」（如 'A'、'K'），渲染金色字母圆底。
 *   - 系统通知：avatar 固定为 'LOGO' → 渲染六边形 G 徽标（由组件端判定）。
 *   - 不使用 /images/demo/*.jpg：public/images/demo 目录不存在，会 404 触发 next/image Invalid URL。
 */

/* ═══ 类型定义 ═══ */

export type AlertType = 'tip' | 'like' | 'follow' | 'system';

export interface AlertItem {
  type: AlertType;
  user: string;
  avatar: string;
  action: string;
  target?: string;
  amount?: string;
  time: string;
  read: boolean;
  image?: string;
  imageAlt?: string;
}

export interface MessageItem {
  user: string;
  avatar: string;
  preview: string;
  time: string;
  read: boolean;
}

export interface Transaction {
  type: 'in' | 'out';
  label: string;
  amount: string;
  time: string;
}

/* ═══ Mock 数据 ═══ */

/**
 * 字母头像辅助：从用户名提取 1~2 个大写字母徽章
 * - 下划线/点分用户名（如 nova_dev, a.b）取两段首字母 → 'ND' / 'AB'
 * - 普通用户名取首字母 → 'A'
 */
function monogram(username: string): string {
  const parts = username.split(/[_.\-]+/).filter(Boolean);
  const heads = parts.length >= 2
    ? `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`
    : username.slice(0, 1);
  return heads.toUpperCase();
}

export const ALERTS: AlertItem[] = [
  { type: 'tip',    user: 'alexshader', avatar: monogram('alexshader'), action: 'tipped your prompt',    target: 'Cinematic Portrait Generator', amount: '50 GHR', time: '2m',  read: false },
  { type: 'like',   user: 'kairos',     avatar: monogram('kairos'),     action: 'liked your repo analysis', target: 'facebook/react',             time: '15m', read: false },
  { type: 'follow', user: 'nova_dev',   avatar: monogram('nova_dev'),   action: 'started following you',                                          time: '1h',  read: false },
  { type: 'system', user: 'GHRANK',     avatar: 'LOGO',                 action: 'announced a new milestone: 12,847 repos now tracked on the platform', time: '2h',  read: false },
  { type: 'system', user: 'GHRANK',     avatar: 'LOGO',                 action: 'Hackathon 2026 is live — build agent integrations and win from $50K in prizes.', time: '45m', read: false /* image 移除：之前的 /images/demo/prompt_7.jpg 在 public 下不存在，会 404 */ },
  { type: 'tip',    user: 'byteforge',  avatar: monogram('byteforge'),  action: 'tipped your prompt',    target: 'SEO Blog Writer Pro',          amount: '20 GHR', time: '3h',  read: true  },
];

export const MESSAGES: MessageItem[] = [
  { user: 'alexshader', avatar: monogram('alexshader'), preview: 'Hey, saw your React analysis — great breakdown of the fiber arch...', time: '5m',  read: false },
  { user: 'kairos',     avatar: monogram('kairos'),     preview: 'Want to collaborate on the vector DB benchmark project?',          time: '32m', read: false },
  { user: 'nova_dev',   avatar: monogram('nova_dev'),   preview: 'The new prompt you published is fire. How did you tune the...',   time: '2h',  read: false },
  { user: 'pixelwitch', avatar: monogram('pixelwitch'), preview: 'Thanks for the tip on SSR caching! Saved my deploy.',            time: '6h',  read: true  },
  { user: 'byteforge',  avatar: monogram('byteforge'),  preview: 'Are you joining the community hackathon next week?',             time: '1d',  read: true  },
];

export const WALLET = {
  balance: 1247.5,
  currency: 'GHR',
  pending: '+32.00',
  transactions: [
    { type: 'in' as const, label: 'Prompt tip from alexshader', amount: '+50.00', time: '2m ago' },
    { type: 'in' as const, label: 'Prompt tip from byteforge', amount: '+20.00', time: '3h ago' },
    { type: 'out' as const, label: 'Tipped nova_dev prompt', amount: '-15.00', time: '1d ago' },
    { type: 'in' as const, label: 'Weekly creator bonus', amount: '+120.00', time: '2d ago' },
  ],
};

/**
 * SideNav mock 数据 & 类型定义
 * 从 SideNav.tsx 中抽离，供 SideNav 组件导入使用
 */

/* ═══ 类型定义 ═══ */

export interface AlertItem {
  type: 'tip' | 'like' | 'follow' | 'system';
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

export interface Category {
  name: string;
  icon: string;
  desc: string;
  count: string;
}

/* ═══ Mock 数据 ═══ */

export const ALERTS: AlertItem[] = [
  { type: 'tip', user: 'alexshader', avatar: '/images/demo/prompt_1.jpg', action: 'tipped your prompt', target: 'Cinematic Portrait Generator', amount: '50 GHR', time: '2m', read: false },
  { type: 'like', user: 'kairos', avatar: '/images/demo/prompt_2.jpg', action: 'liked your repo analysis', target: 'facebook/react', time: '15m', read: false },
  { type: 'follow', user: 'nova_dev', avatar: '/images/demo/prompt_3.jpg', action: 'started following you', time: '1h', read: false },
  { type: 'system', user: 'GHRANK', avatar: 'LOGO', action: 'announced a new milestone: 12,847 repos now tracked on the platform', time: '2h', read: false },
  { type: 'system', user: 'GHRANK', avatar: 'LOGO', action: 'Hackathon 2026 is live — build agent integrations and win from $50K in prizes.', time: '45m', read: false, image: '/images/demo/prompt_7.jpg', imageAlt: 'GHRANK Hackathon 2026 banner' },
  { type: 'tip', user: 'byteforge', avatar: '/images/demo/prompt_5.jpg', action: 'tipped your prompt', target: 'SEO Blog Writer Pro', amount: '20 GHR', time: '3h', read: true },
];

export const MESSAGES: MessageItem[] = [
  { user: 'alexshader', avatar: 'A', preview: 'Hey, saw your React analysis — great breakdown of the fiber arch...', time: '5m', read: false },
  { user: 'kairos', avatar: 'K', preview: 'Want to collaborate on the vector DB benchmark project?', time: '32m', read: false },
  { user: 'nova_dev', avatar: 'N', preview: 'The new prompt you published is fire. How did you tune the...', time: '2h', read: false },
  { user: 'pixelwitch', avatar: 'P', preview: 'Thanks for the tip on SSR caching! Saved my deploy.', time: '6h', read: true },
  { user: 'byteforge', avatar: 'B', preview: 'Are you joining the community hackathon next week?', time: '1d', read: true },
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

export const CATEGORIES: Category[] = [
  { name: 'Hot Topics', icon: 'catHot', desc: 'Trending discussions', count: '342' },
  { name: 'Show & Tell', icon: 'catShow', desc: 'Show off your builds', count: '187' },
  { name: 'Help & Q&A', icon: 'catHelp', desc: 'Get answers fast', count: '894' },
  { name: 'Tutorials', icon: 'catTutorials', desc: 'Share your knowledge', count: '256' },
  { name: 'Dev Logs', icon: 'catDevlogs', desc: 'Build-in-progress updates', count: '143' },
  { name: 'Off-Topic', icon: 'catOfftopic', desc: 'Casual conversation', count: '520' },
];

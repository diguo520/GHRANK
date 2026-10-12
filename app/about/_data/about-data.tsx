/**
 * About 页面静态数据
 * 包含侧边栏导航、统计、团队、赞助商、更新日志、服务条款等常量
 */

import { ReactNode } from 'react';
import { ListIcon, TerminalIcon, SearchIcon } from '@/components/shared/icons';

/** 有效面板标识，用于 hash 校验与键盘切换边界判断 */
export const VALID_PANELS = ['about', 'sponsors', 'changelog', 'achievements', 'terms'] as const;
export type PanelId = (typeof VALID_PANELS)[number];

/** 校验字符串是否为合法面板 ID */
export function isValidPanel(id: string): id is PanelId {
  return (VALID_PANELS as readonly string[]).includes(id);
}

/** 侧边栏导航项 */
export interface NavItem {
  id: PanelId;
  index: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'about', index: '01', label: 'About Us' },
  { id: 'sponsors', index: '02', label: 'Sponsors' },
  { id: 'changelog', index: '03', label: 'Changelog' },
  { id: 'achievements', index: '04', label: 'Community Achievements' },
  { id: 'terms', index: '05', label: 'Terms of Service' },
];

/** 侧边栏更多入口 —— 每项含内联 SVG 图标 */
export interface MoreLink {
  href: string;
  label: string;
  icon: ReactNode;
}

export const MORE_LINKS: MoreLink[] = [
  {
    href: '/',
    label: 'Browse Rankings',
    icon: <ListIcon />,
  },
  {
    href: '/prompt',
    label: 'Prompt Marketplace',
    icon: <TerminalIcon />,
  },
  {
    href: '/search',
    label: 'Search',
    icon: <SearchIcon />,
  },
];

/** 使命面板：统计卡片 */
export interface StatItem {
  val: string;
  label: string;
}

export const STATS: StatItem[] = [
  { val: '2,400+', label: 'Sources Tracked' },
  { val: '186K', label: 'Repos Indexed' },
  { val: '14', label: 'Core Maintainers' },
];

/** 使命面板：团队成员 */
export interface TeamMember {
  avatar: string;
  name: string;
  role: string;
}

export const TEAM: TeamMember[] = [
  { avatar: 'AS', name: 'AlexShader', role: 'Founder / Scoring' },
  { avatar: 'RV', name: 'Raven Vex', role: 'Lead Engineer' },
  { avatar: 'MK', name: 'Mira Kade', role: 'Community Ops' },
  { avatar: 'JT', name: 'Jin Tao', role: 'Marketplace' },
];

/** 样式标签配置 */
export interface StyleConfig {
  color: string;
  bg: string;
  border: string;
}

/** 赞助商等级 → 配色映射 —— 已更新为 LobeHub 紫色主题 */
export const TIER_STYLES: Record<string, StyleConfig> = {
  Platinum: {
    color: 'var(--gold)',
    bg: 'rgba(157, 140, 255, 0.1)',
    border: 'rgba(157, 140, 255, 0.3)',
  },
  Gold: {
    color: 'var(--orange)',
    bg: 'rgba(232, 93, 4, 0.1)',
    border: 'rgba(232, 93, 4, 0.3)',
  },
  Silver: {
    color: 'var(--text-dim)',
    bg: 'rgba(139, 148, 158, 0.1)',
    border: 'rgba(139, 148, 158, 0.3)',
  },
};

/** 赞助面板：分级赞助商 */
export interface Sponsor {
  tier: string;
  name: string;
  amount: string;
}

export const SPONSORS: Sponsor[] = [
  { tier: 'Platinum', name: 'Vex Labs', amount: '$50,000 / yr' },
  { tier: 'Platinum', name: 'Northwind Capital', amount: '$50,000 / yr' },
  { tier: 'Gold', name: 'Hyperion AI', amount: '$20,000 / yr' },
  { tier: 'Gold', name: 'ByteForge', amount: '$20,000 / yr' },
  { tier: 'Silver', name: 'OpenSignal', amount: '$8,000 / yr' },
  { tier: 'Silver', name: 'Quantum Bridge', amount: '$8,000 / yr' },
];

/** 更新日志标签类型 */
export type ChangelogTag = 'New' | 'Imp' | 'Fix';

/** 更新日志标签 → 配色映射 */
export const CHANGELOG_TAG_STYLES: Record<ChangelogTag, StyleConfig> = {
  New: {
    color: 'var(--green)',
    bg: 'rgba(63, 185, 80, 0.12)',
    border: 'rgba(63, 185, 80, 0.3)',
  },
  Imp: {
    color: 'var(--cyan)',
    bg: 'rgba(57, 210, 192, 0.12)',
    border: 'rgba(57, 210, 192, 0.3)',
  },
  Fix: {
    color: 'var(--orange)',
    bg: 'rgba(232, 93, 4, 0.12)',
    border: 'rgba(232, 93, 4, 0.3)',
  },
};

/** 更新日志条目 */
export interface ChangelogEntry {
  version: string;
  date: string;
  items: { tag: ChangelogTag; text: string }[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v2.4.0',
    date: '2026-07-26',
    items: [
      { tag: 'New', text: 'Prompt detail page with carousel preview and reward/tipping flow' },
      { tag: 'New', text: 'Sidebar scroll-switching navigation for About / Sponsors / Changelog / Terms' },
      { tag: 'Imp', text: 'Login-gated interactions: follow, tip, bookmark, reply, and review composer' },
      { tag: 'Fix', text: 'Toast notifications now consistently fired for all auth-gated actions' },
    ],
  },
  {
    version: 'v2.3.1',
    date: '2026-07-12',
    items: [
      { tag: 'Fix', text: 'Time-decay weighting corrected for repositories inactive >180 days' },
      { tag: 'Fix', text: 'Search overlay escape-key regression on Firefox' },
      { tag: 'Imp', text: 'Ticker animation GPU-composited for smoother scrolling' },
    ],
  },
  {
    version: 'v2.3.0',
    date: '2026-06-28',
    items: [
      { tag: 'New', text: 'Agent Skills marketplace with SOC occupational classification' },
      { tag: 'New', text: 'User center sidebar with notebook previews and session stats' },
      { tag: 'Imp', text: 'Scoring model v3 — now weights community impact 2× over raw stars' },
    ],
  },
  {
    version: 'v2.2.0',
    date: '2026-05-15',
    items: [
      { tag: 'New', text: 'Plain-text review composer with textarea input' },
      { tag: 'New', text: 'Live stats row on prompt detail with real-time view counts' },
      { tag: 'Fix', text: 'Avatar resolver now gracefully falls back to initials on 404' },
    ],
  },
  {
    version: 'v2.1.0',
    date: '2026-04-02',
    items: [
      { tag: 'New', text: 'Cinematic dark theme with gold/cyan accent system' },
      { tag: 'Imp', text: 'Navigation restructured into 7 primary sections' },
      { tag: 'Imp', text: 'Loading sequence with scan-line and entrance animations' },
    ],
  },
];

/** 条款项 */
export interface TermItem {
  title: string;
  body: string;
}

export const TERMS: TermItem[] = [
  { title: '1. Acceptance of Terms', body: 'By accessing or using GHRANK ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.' },
  { title: '2. Use of the Service', body: 'You may use GHRANK for personal, educational, and commercial research. You may not scrape, resell, or republish ranking data wholesale without attribution. Automated access must respect our rate limits and identify the client.' },
  { title: '3. Accounts', body: 'Some features require an account. You are responsible for safeguarding your credentials and for all activity under your account. We may suspend accounts that violate these terms or engage in abuse, spam, or manipulation.' },
  { title: '4. Marketplace & Transactions', body: 'The GHRANK marketplace allows creators to publish prompts and skills. Purchases are between you and the creator; GHRANK facilitates the transaction but is not a party to it. Tips and rewards are non-refundable except in cases of demonstrable fraud.' },
  { title: '5. Rankings & Scoring', body: 'Rankings are generated by an automated scoring model and are provided "as is." We do not guarantee the accuracy, completeness, or timeliness of any ranking. Rankings do not constitute an endorsement. Sponsorship does not influence ranking placement.' },
  { title: '6. Intellectual Property', body: "GHRANK's software, design, and scoring methodology are protected by intellectual property laws. Creator-published content remains the property of the creator. You retain rights to content you submit and grant GHRANK a license to display it within the Service." },
  { title: '7. Privacy', body: 'We collect minimal data necessary to operate the Service. We do not sell personal data, deploy behavioral tracking pixels, or profile users for advertising. See our Privacy Policy for details.' },
  { title: '8. Termination', body: 'You may delete your account at any time. We may suspend or terminate access if you violate these Terms or pose a risk to the Service, other users, or third parties.' },
  { title: '9. Changes to These Terms', body: 'We may update these Terms periodically. Material changes will be announced via the Changelog and, where required, by email. Continued use after changes take effect constitutes acceptance.' },
  { title: '10. Contact', body: 'Questions about these terms? Reach out at legal@ghrank.io.' },
];

/* ═══════════════════════════════════════════════════
   社区成就面板数据
   ═══════════════════════════════════════════════════ */

/** XP 获取规则项 */
export interface XpRule {
  action: string;
  xp: string;
  desc: string;
}

/** XP 获取规则列表（行为 → 经验值） */
export const XP_RULES: XpRule[] = [
  { action: 'Publish a Prompt', xp: '+10', desc: 'Each published prompt adds XP' },
  { action: 'Receive a Like', xp: '+2', desc: 'Per like on your prompts or posts' },
  { action: 'Receive a Comment', xp: '+3', desc: 'Per comment on your content' },
  { action: 'Get a View', xp: '+1', desc: 'Per 10 views across your content' },
  { action: 'Earn Tips', xp: '+5', desc: 'Per $1 earned in tips' },
  { action: 'Create a Post', xp: '+5', desc: 'Each community thread created' },
  { action: 'Reply to a Thread', xp: '+2', desc: 'Each reply in community discussions' },
  { action: 'Gain a Follower', xp: '+3', desc: 'Per new follower' },
  { action: 'Daily Streak', xp: '+15', desc: 'Bonus for consecutive daily activity' },
];

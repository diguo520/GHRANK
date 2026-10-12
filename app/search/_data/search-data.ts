/**
 * 搜索结果页数据
 * 仅保留社区帖子类型；repos/prompts 等频道将来作为插件模块出现
 */

/* ═══ 类型定义 ═══ */

/** 仓库搜索结果（保留类型定义供 SearchCard 使用，数据已移除） */
export interface RepoResult {
  name: string;
  desc: string;
  type: 'repo';
  tag: string;
  tagClass: string;
  stars: string;
  forks: string;
  lang: string;
  growth: string;
  time: string;
  url: string;
  sparkline: number[];
}

/** 提示词搜索结果（保留类型定义供 SearchCard 使用，数据已移除） */
export interface PromptResult {
  name: string;
  desc: string;
  type: 'prompt';
  model: string;
  modelClass: string;
  price: string;
  rating: string;
  uses: string;
  time: string;
  url: string;
}

/** 社区帖子搜索结果 */
export interface CommunityResult {
  name: string;
  desc: string;
  type: 'community';
  members: string;
  replies: string;
  time: string;
  url: string;
}

export type SearchResult = CommunityResult;

/* ═══ 标签样式映射（供 SearchCard 的 RepoCard/PromptCard 使用） ═══ */
export const TAG_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  'tag-frontend': { bg: 'rgba(57, 210, 192, 0.10)', color: 'var(--cyan)', border: 'rgba(57, 210, 192, 0.25)' },
  'tag-backend': { bg: 'rgba(157, 140, 255, 0.10)', color: 'var(--gold)', border: 'rgba(157, 140, 255, 0.25)' },
  'tag-ai': { bg: 'rgba(163, 113, 247, 0.10)', color: 'var(--purple)', border: 'rgba(163, 113, 247, 0.25)' },
  'tag-devops': { bg: 'rgba(247, 120, 186, 0.10)', color: 'var(--pink)', border: 'rgba(247, 120, 186, 0.25)' },
  'tag-games': { bg: 'rgba(232, 93, 4, 0.10)', color: 'var(--orange)', border: 'rgba(232, 93, 4, 0.25)' },
  'tag-mobile': { bg: 'rgba(163, 113, 247, 0.10)', color: 'var(--purple)', border: 'rgba(163, 113, 247, 0.25)' },
  'tag-data': { bg: 'rgba(57, 210, 192, 0.10)', color: 'var(--cyan)', border: 'rgba(57, 210, 192, 0.25)' },
};

export const MODEL_TAG_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  'tag-gpt4': { bg: 'rgba(163, 113, 247, 0.10)', color: 'var(--purple)', border: 'rgba(163, 113, 247, 0.25)' },
  'tag-claude': { bg: 'rgba(232, 137, 74, 0.10)', color: 'var(--orange)', border: 'rgba(232, 137, 74, 0.25)' },
  'tag-midjourney': { bg: 'rgba(57, 210, 192, 0.10)', color: 'var(--cyan)', border: 'rgba(57, 210, 192, 0.25)' },
  'tag-dalle': { bg: 'rgba(247, 120, 186, 0.10)', color: 'var(--pink)', border: 'rgba(247, 120, 186, 0.25)' },
  'tag-llama': { bg: 'rgba(157, 140, 255, 0.10)', color: 'var(--gold)', border: 'rgba(157, 140, 255, 0.25)' },
  'tag-custom': { bg: 'var(--surface-overlay)', color: 'var(--text-dim)', border: 'var(--border-subtle)' },
};

/* ═══ 结果类型枚举 ═══ */
export type SearchType = 'community';

/* ═══ 搜索数据 ═══ */
export const SEARCH_ALL_DATA: Record<SearchType, SearchResult[]> = {
  community: [
    { name: 'React Best Practices — 2026 Edition', desc: 'Community-curated guide to React patterns, anti-patterns, and best practices for modern development.', type: 'community', members: '12.4K', replies: '847', time: '2h ago', url: '/community/detail' },
    { name: 'State Management Comparison Thread', desc: 'In-depth comparison of Redux, Zustand, Jotai, and Valtio for React state management.', type: 'community', members: '5.8K', replies: '1,243', time: '1d ago', url: '/community/detail' },
    { name: 'React Performance Optimization Tips', desc: 'Community tips and tricks for optimizing React application performance.', type: 'community', members: '8.2K', replies: '634', time: '3d ago', url: '/community/detail' },
    { name: 'LLM Training Best Practices', desc: 'Discussion on training large language models efficiently with limited GPU resources.', type: 'community', members: '8.7K', replies: '412', time: '5h ago', url: '/community/detail' },
    { name: 'RAG Pipeline Optimization', desc: 'Techniques for optimizing retrieval-augmented generation pipelines in production.', type: 'community', members: '6.1K', replies: '528', time: '8h ago', url: '/community/detail' },
  ],
};

/* ═══ 过滤器配置：类型 + 显示数量 ═══ */
export const FILTER_CHIPS: { type: SearchType; label: string; count: string }[] = [
  { type: 'community', label: 'Community', count: '3,892' },
];

/* ═══ 排序选项 ═══ */
export const SORT_OPTIONS = ['Relevance', 'Recently Updated', 'Name A-Z'] as const;

/* ═══ 相关搜索 ═══ */
export const RELATED_SEARCHES = [
  'react hooks',
  'react native',
  'react server components',
  'react vs vue',
  'react state management',
  'react testing',
];

/* ═══ 工具函数 ═══ */

/** 解析星数字符串为数字（如 "230K" → 230000） */
export function parseStars(s: string): number {
  const match = s.match(/([\d.]+)([KM]?)/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = match[2];
  if (suffix === 'K') return num * 1_000;
  if (suffix === 'M') return num * 1_000_000;
  return num;
}

/** 解析时间字符串为分钟数（如 "2h ago" → 120, "3d ago" → 4320） */
export function parseTimeToMinutes(time: string): number {
  const match = time.match(/(\d+)\s*(m|h|d)/);
  if (!match) return 0;
  const num = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === 'm') return num;
  if (unit === 'h') return num * 60;
  if (unit === 'd') return num * 60 * 24;
  return 0;
}

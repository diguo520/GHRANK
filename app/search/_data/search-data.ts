/**
 * 搜索结果页数据 —— 迁移自 search.js 的 allData
 * 三种结果类型：repos（仓库）、prompts（提示词）、community（社区帖子）
 * 每种类型有不同字段，通过联合类型区分
 */

/* ═══ 类型定义 ═══ */

/** 仓库搜索结果 */
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

/** 提示词搜索结果 */
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

export type SearchResult = RepoResult | PromptResult | CommunityResult;

/* ═══ 结果类型枚举 ═══ */
export type SearchType = 'repos' | 'prompts' | 'community';

/* ═══ 搜索数据 ═══ */
export const SEARCH_ALL_DATA: Record<SearchType, SearchResult[]> = {
  repos: [
    { name: 'facebook/react', desc: 'The library for web and native user interfaces. A declarative, efficient, and flexible JavaScript library.', type: 'repo', tag: 'Frontend', tagClass: 'tag-frontend', stars: '230K', forks: '46.8K', lang: 'JS', growth: '+8.2%', time: '2h ago', url: '/community/detail', sparkline: [12, 10, 11, 7, 8, 4, 3] },
    { name: 'nextjs/next.js', desc: 'The React Framework for the Web. Full-stack web applications used by some of the world\'s largest companies.', type: 'repo', tag: 'Frontend', tagClass: 'tag-frontend', stars: '128K', forks: '27.3K', lang: 'TS', growth: '+11.6%', time: '1h ago', url: '/community/detail', sparkline: [12, 10, 9, 8, 6, 5, 3] },
    { name: 'vercel/next.js', desc: 'The React Framework for the Web — maintained by Vercel with first-class DX and deployment.', type: 'repo', tag: 'Frontend', tagClass: 'tag-frontend', stars: '128K', forks: '27.3K', lang: 'TS', growth: '+10.8%', time: '3h ago', url: '/community/detail', sparkline: [13, 11, 10, 8, 7, 5, 3] },
    { name: 'mui/material-ui', desc: 'Ready-to-use Material Design components for React. Accessible, customizable, and open source.', type: 'repo', tag: 'Frontend', tagClass: 'tag-frontend', stars: '95.8K', forks: '43.2K', lang: 'TS', growth: '+7.4%', time: '5h ago', url: '/community/detail', sparkline: [10, 9, 10, 8, 7, 6, 5] },
    { name: 'vuejs/core', desc: 'The Progressive JavaScript Framework. Approachable, performant and versatile for building web UIs.', type: 'repo', tag: 'Frontend', tagClass: 'tag-frontend', stars: '48.2K', forks: '9.8K', lang: 'TS', growth: '+12.7%', time: '1h ago', url: '/community/detail', sparkline: [13, 11, 9, 7, 5, 3, 2] },
    { name: 'shadcn-ui/ui', desc: 'Beautifully designed components built with Radix UI and Tailwind CSS. Accessible and customizable.', type: 'repo', tag: 'Frontend', tagClass: 'tag-frontend', stars: '81.4K', forks: '4.6K', lang: 'TS', growth: '+22.4%', time: '20m ago', url: '/community/detail', sparkline: [15, 13, 10, 8, 5, 3, 1] },
    { name: 'langchain-ai/langchain', desc: 'Build context-aware reasoning applications. Framework for apps powered by language models.', type: 'repo', tag: 'AI/ML', tagClass: 'tag-ai', stars: '96.7K', forks: '14.2K', lang: 'Py', growth: '+18.1%', time: '30m ago', url: '/community/detail', sparkline: [14, 12, 10, 7, 5, 3, 1] },
    { name: 'openai/whisper', desc: 'Robust Speech Recognition via Large-Scale Weak Supervision by OpenAI.', type: 'repo', tag: 'AI/ML', tagClass: 'tag-ai', stars: '72.8K', forks: '8.4K', lang: 'Py', growth: '+15.3%', time: '3h ago', url: '/community/detail', sparkline: [14, 12, 10, 8, 5, 4, 2] },
    { name: 'torvalds/linux', desc: 'Linux kernel source tree. The core of the Linux operating system.', type: 'repo', tag: 'Backend', tagClass: 'tag-backend', stars: '182K', forks: '38.2K', lang: 'C', growth: '+3.1%', time: '4h ago', url: '/community/detail', sparkline: [8, 9, 7, 10, 9, 8, 7] },
    { name: 'rust-lang/rust', desc: 'Empowering everyone to build reliable and efficient software.', type: 'repo', tag: 'Backend', tagClass: 'tag-backend', stars: '99.8K', forks: '16.1K', lang: 'Rust', growth: '+6.3%', time: '3h ago', url: '/community/detail', sparkline: [10, 9, 11, 9, 8, 7, 6] },
    { name: 'docker/engine', desc: 'Docker Engine — open source containerization technology.', type: 'repo', tag: 'DevOps', tagClass: 'tag-devops', stars: '69.4K', forks: '18.9K', lang: 'Go', growth: '+5.6%', time: '6h ago', url: '/community/detail', sparkline: [10, 9, 10, 8, 7, 6, 5] },
    { name: 'godotengine/godot', desc: 'Godot Engine — Multi-platform 2D and 3D game engine.', type: 'repo', tag: 'Games', tagClass: 'tag-games', stars: '95.3K', forks: '21.4K', lang: 'GDScript', growth: '+9.4%', time: '1h ago', url: '/community/detail', sparkline: [12, 10, 11, 8, 6, 5, 3] },
    { name: 'tiangolo/fastapi', desc: 'FastAPI framework, high performance, easy to learn, fast to code.', type: 'repo', tag: 'Backend', tagClass: 'tag-backend', stars: '82.1K', forks: '6.7K', lang: 'Py', growth: '+7.8%', time: '45m ago', url: '/community/detail', sparkline: [10, 9, 8, 9, 7, 6, 5] },
    { name: 'denoland/deno', desc: 'A modern runtime for JavaScript and TypeScript. Secure by default.', type: 'repo', tag: 'Backend', tagClass: 'tag-backend', stars: '98.2K', forks: '5.4K', lang: 'TS', growth: '+8.9%', time: '2h ago', url: '/community/detail', sparkline: [10, 9, 8, 7, 6, 5, 5] },
    { name: 'flutter/flutter', desc: "Google's UI toolkit for building natively compiled applications.", type: 'repo', tag: 'Mobile', tagClass: 'tag-mobile', stars: '164K', forks: '27.8K', lang: 'Dart', growth: '+4.7%', time: '1h ago', url: '/community/detail', sparkline: [9, 10, 9, 8, 8, 7, 7] },
    { name: 'kubernetes/kubernetes', desc: 'Production-Grade Container Scheduling and Management.', type: 'repo', tag: 'DevOps', tagClass: 'tag-devops', stars: '112K', forks: '39.4K', lang: 'Go', growth: '+6.8%', time: '2h ago', url: '/community/detail', sparkline: [10, 10, 9, 9, 8, 7, 6] },
  ],
  prompts: [
    { name: 'React Component Generator', desc: 'Generate production-ready React components with TypeScript, hooks, and Tailwind CSS styling.', type: 'prompt', model: 'GPT-4', modelClass: 'tag-gpt4', price: '$9.99', rating: '4.8', uses: '3.2K', time: '2h ago', url: '/prompt-detail' },
    { name: 'React Testing Master', desc: 'Create comprehensive test suites for React components using Jest and React Testing Library.', type: 'prompt', model: 'Claude', modelClass: 'tag-claude', price: '$7.49', rating: '4.9', uses: '1.8K', time: '5h ago', url: '/prompt-detail' },
    { name: 'Next.js API Route Builder', desc: 'Build production-grade API routes with authentication, validation, and error handling.', type: 'prompt', model: 'GPT-4', modelClass: 'tag-gpt4', price: '$12.99', rating: '4.7', uses: '2.4K', time: '1h ago', url: '/prompt-detail' },
    { name: 'UI Component Library Generator', desc: 'Generate a complete design system with React components and Storybook stories.', type: 'prompt', model: 'GPT-4', modelClass: 'tag-gpt4', price: '$14.99', rating: '4.6', uses: '856', time: '8h ago', url: '/prompt-detail' },
    { name: 'React Performance Optimizer', desc: 'Analyze and optimize React app performance — memoization, code splitting, lazy loading.', type: 'prompt', model: 'Claude', modelClass: 'tag-claude', price: '$6.99', rating: '4.8', uses: '1.2K', time: '3h ago', url: '/prompt-detail' },
    { name: 'Redux State Architect', desc: 'Design scalable Redux/RTK state management with best practices and type safety.', type: 'prompt', model: 'GPT-4', modelClass: 'tag-gpt4', price: '$8.49', rating: '4.5', uses: '943', time: '12h ago', url: '/prompt-detail' },
    { name: 'Cinematic Portrait Generator', desc: 'Generate photorealistic cinematic portraits with dramatic lighting, film grain, and bokeh.', type: 'prompt', model: 'Midjourney', modelClass: 'tag-midjourney', price: '$4.99', rating: '4.9', uses: '8.1K', time: '30m ago', url: '/prompt-detail' },
    { name: 'Code Review Assistant v3', desc: 'Advanced code review — quality, security, performance analysis with fixes.', type: 'prompt', model: 'GPT-4', modelClass: 'tag-gpt4', price: '$9.99', rating: '4.7', uses: '5.6K', time: '1h ago', url: '/prompt-detail' },
    { name: 'API Documentation Generator', desc: 'Auto-generate OpenAPI specs and endpoint docs from code.', type: 'prompt', model: 'Custom', modelClass: 'tag-custom', price: '$7.99', rating: '4.6', uses: '1.6K', time: '4h ago', url: '/prompt-detail' },
    { name: 'SEO Blog Writer Pro', desc: 'SEO-optimized blog posts with keyword integration.', type: 'prompt', model: 'Claude', modelClass: 'tag-claude', price: '$8.49', rating: '4.8', uses: '2.1K', time: '2h ago', url: '/prompt-detail' },
    { name: 'Logo Concept Generator', desc: 'Generate unique logo concepts with brand identity.', type: 'prompt', model: 'DALL-E 3', modelClass: 'tag-dalle', price: '$6.49', rating: '4.5', uses: '1.4K', time: '6h ago', url: '/prompt-detail' },
    { name: 'Regex Pattern Builder', desc: 'Generate and explain complex regex patterns.', type: 'prompt', model: 'Llama 3', modelClass: 'tag-llama', price: '$2.49', rating: '4.4', uses: '678', time: '1d ago', url: '/prompt-detail' },
  ],
  community: [
    { name: 'React Best Practices — 2026 Edition', desc: 'Community-curated guide to React patterns, anti-patterns, and best practices for modern development.', type: 'community', members: '12.4K', replies: '847', time: '2h ago', url: '/community/detail' },
    { name: 'State Management Comparison Thread', desc: 'In-depth comparison of Redux, Zustand, Jotai, and Valtio for React state management.', type: 'community', members: '5.8K', replies: '1,243', time: '1d ago', url: '/community/detail' },
    { name: 'React Performance Optimization Tips', desc: 'Community tips and tricks for optimizing React application performance.', type: 'community', members: '8.2K', replies: '634', time: '3d ago', url: '/community/detail' },
  ],
};

/* ═══ 过滤器配置：类型 + 显示数量 ═══ */
export const FILTER_CHIPS: { type: SearchType; label: string; count: string }[] = [
  { type: 'repos', label: 'Repos', count: '12,847' },
  { type: 'prompts', label: 'Prompts', count: '12,487' },
  { type: 'community', label: 'Community', count: '3,892' },
];

/* ═══ 排序选项 ═══ */
export const SORT_OPTIONS = ['Relevance', 'Stars', 'Recently Updated', 'Name A-Z'] as const;

/* ═══ 相关搜索 ═══ */
export const RELATED_SEARCHES = [
  'react hooks',
  'react native',
  'react server components',
  'react vs vue',
  'react state management',
  'react testing',
];

/* ═══ 仓库分类标签颜色映射（tagClass → 内联样式） ═══ */
export const TAG_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  'tag-frontend': { color: 'var(--cyan)',   bg: 'rgba(57, 210, 192, 0.08)',  border: 'rgba(57, 210, 192, 0.3)' },
  'tag-ai':       { color: 'var(--purple)', bg: 'rgba(163, 113, 247, 0.08)', border: 'rgba(163, 113, 247, 0.3)' },
  'tag-backend':  { color: 'var(--green)',  bg: 'rgba(63, 185, 80, 0.08)',   border: 'rgba(63, 185, 80, 0.3)' },
  'tag-devops':   { color: 'var(--orange)', bg: 'rgba(232, 93, 4, 0.08)',    border: 'rgba(232, 93, 4, 0.3)' },
  'tag-games':    { color: 'var(--pink)',   bg: 'rgba(247, 120, 186, 0.08)', border: 'rgba(247, 120, 186, 0.3)' },
  'tag-mobile':   { color: 'var(--gold)',   bg: 'rgba(245, 197, 24, 0.08)',  border: 'rgba(245, 197, 24, 0.35)' },
};

/* ═══ Prompt 模型标签颜色映射（modelClass → 内联样式） ═══ */
export const MODEL_TAG_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  'tag-gpt4':       { color: 'var(--green)',  bg: 'rgba(63, 185, 80, 0.08)',   border: 'rgba(63, 185, 80, 0.3)' },
  'tag-claude':     { color: 'var(--orange)', bg: 'rgba(232, 93, 4, 0.08)',    border: 'rgba(232, 93, 4, 0.3)' },
  'tag-midjourney': { color: 'var(--cyan)',   bg: 'rgba(57, 210, 192, 0.08)',  border: 'rgba(57, 210, 192, 0.3)' },
  'tag-dalle':      { color: 'var(--purple)', bg: 'rgba(163, 113, 247, 0.08)', border: 'rgba(163, 113, 247, 0.3)' },
  'tag-llama':      { color: '#58a6ff',       bg: 'rgba(88, 166, 255, 0.08)',  border: 'rgba(88, 166, 255, 0.3)' },
  'tag-custom':     { color: 'var(--text-dim)', bg: 'rgba(139, 148, 158, 0.08)', border: 'var(--border)' },
};

/* ═══ 工具函数：将星标字符串解析为数字（用于排序） ═══ */
export function parseStars(s: string): number {
  const num = parseFloat(s);
  if (s.includes('K')) return num * 1000;
  if (s.includes('M')) return num * 1000000;
  return num;
}

/* ═══ 工具函数：将时间字符串解析为分钟数（用于排序，越小越新） ═══ */
export function parseTimeToMinutes(s: string): number {
  const match = s.match(/(\d+)\s*([hmd])/);
  if (!match) return 999999;
  const n = parseInt(match[1]);
  const unit = match[2];
  if (unit === 'm') return n;
  if (unit === 'h') return n * 60;
  if (unit === 'd') return n * 1440;
  return 999999;
}

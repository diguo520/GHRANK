/**
 * 首页 Leaderboard 数据 —— 初始卡片 + 无限滚动数据
 * 迁移自 index.js 的 INITIAL_CARDS 和 moreCards 生成逻辑
 */

export interface LeaderboardCard {
  rank: number;
  rankClass: 'gold' | 'silver' | 'bronze' | 'normal';
  avatar: string;
  category: string;
  tag: string;
  tagClass: string;
  repo: string;
  desc: string;
  stars: string;
  forks: string;
  lang: string;
  langColor: string;
  growth: string;
  sparkPts: string;
  time: string;
  updated: string;
  likes: number;
}

/** 首屏初始卡片数据 */
export const INITIAL_CARDS: LeaderboardCard[] = [
  {
    rank: 1, rankClass: 'gold', avatar: 'M', category: 'frontend', tag: 'Frontend', tagClass: 'tag-frontend',
    repo: 'facebook/react', desc: 'The library for web and native user interfaces. Declarative, component-based.',
    stars: '230K', forks: '48.2K', lang: 'JS', langColor: '#f1e05a',
    growth: '+12.4%', sparkPts: '0,12 8,10 16,7 24,5 32,3 40,2 48,1',
    time: 'Updated 2h ago', updated: 'day', likes: 1842,
  },
  {
    rank: 2, rankClass: 'silver', avatar: 'L', category: 'backend', tag: 'Backend', tagClass: 'tag-backend',
    repo: 'torvalds/linux', desc: 'Linux kernel source tree. The core of the Linux operating system.',
    stars: '182K', forks: '51.3K', lang: 'C', langColor: '#555555',
    growth: '+8.7%', sparkPts: '0,10 8,8 16,9 24,6 32,4 40,3 48,2',
    time: 'Updated 1h ago', updated: 'day', likes: 1654,
  },
  {
    rank: 3, rankClass: 'bronze', avatar: 'V', category: 'frontend', tag: 'Frontend', tagClass: 'tag-frontend',
    repo: 'vuejs/core', desc: 'The Progressive JavaScript Framework for building web UIs. Approachable, performant.',
    stars: '48.2K', forks: '8.7K', lang: 'TS', langColor: '#3178C6',
    growth: '+15.3%', sparkPts: '0,14 8,11 16,8 24,6 32,4 40,2 48,1',
    time: 'Updated 3h ago', updated: 'day', likes: 1203,
  },
  {
    rank: 4, rankClass: 'normal', avatar: 'R', category: 'backend', tag: 'Backend', tagClass: 'tag-backend',
    repo: 'rust-lang/rust', desc: 'Empowering everyone to build reliable and efficient software. Memory-safe systems language.',
    stars: '99.8K', forks: '13.2K', lang: 'Rust', langColor: '#dea584',
    growth: '+22.1%', sparkPts: '0,13 8,10 16,7 24,4 32,3 40,2 48,1',
    time: 'Updated 4h ago', updated: 'week', likes: 987,
  },
  {
    rank: 5, rankClass: 'normal', avatar: 'G', category: 'games', tag: 'Games', tagClass: 'tag-games',
    repo: 'godotengine/godot', desc: 'Godot Engine — Multi-platform 2D and 3D game engine. Free and open source.',
    stars: '95.3K', forks: '15.8K', lang: 'C++', langColor: '#f34b7d',
    growth: '+18.5%', sparkPts: '0,11 8,9 16,7 24,5 32,3 40,2 48,1',
    time: 'Updated 5h ago', updated: 'week', likes: 856,
  },
  {
    rank: 6, rankClass: 'normal', avatar: 'N', category: 'frontend', tag: 'Frontend', tagClass: 'tag-frontend',
    repo: 'vercel/next.js', desc: 'The React Framework for the Web. SSR, SSG, API routes, full-stack capabilities.',
    stars: '128K', forks: '27.1K', lang: 'TS', langColor: '#3178C6',
    growth: '+28.7%', sparkPts: '0,15 8,12 16,9 24,6 32,4 40,2 48,1',
    time: 'Updated 6h ago', updated: 'day', likes: 1432,
  },
  {
    rank: 7, rankClass: 'normal', avatar: 'D', category: 'devops', tag: 'DevOps', tagClass: 'tag-devops',
    repo: 'docker/engine', desc: 'Docker Engine — open source containerization technology. Build, ship, run apps anywhere.',
    stars: '69.4K', forks: '17.2K', lang: 'Go', langColor: '#00ADD8',
    growth: '+5.4%', sparkPts: '0,8 8,7 16,6 24,5 32,4 40,3 48,2',
    time: 'Updated 8h ago', updated: 'week', likes: 743,
  },
  {
    rank: 8, rankClass: 'normal', avatar: 'L', category: 'ai-ml', tag: 'AI/ML', tagClass: 'tag-ai',
    repo: 'langchain-ai/langchain', desc: 'Build context-aware reasoning applications with LLMs. Chains, agents, retrieval.',
    stars: '96.7K', forks: '15.8K', lang: 'Python', langColor: '#3572A5',
    growth: '+35.2%', sparkPts: '0,16 8,13 16,10 24,7 32,5 40,3 48,1',
    time: 'Updated 12h ago', updated: 'month', likes: 1121,
  },
  {
    rank: 9, rankClass: 'normal', avatar: 'O', category: 'ai-ml', tag: 'AI/ML', tagClass: 'tag-ai',
    repo: 'openai/whisper', desc: 'Robust Speech Recognition via Large-Scale Weak Supervision. Multilingual ASR.',
    stars: '72.8K', forks: '8.6K', lang: 'Python', langColor: '#3572A5',
    growth: '+11.6%', sparkPts: '0,12 8,10 16,8 24,6 32,4 40,3 48,2',
    time: 'Updated 1d ago', updated: 'week', likes: 678,
  },
  {
    rank: 10, rankClass: 'normal', avatar: 'D', category: 'backend', tag: 'Backend', tagClass: 'tag-backend',
    repo: 'denoland/deno', desc: 'A modern runtime for JavaScript and TypeScript. Secure by default. Built-in toolchain.',
    stars: '98.2K', forks: '5.4K', lang: 'TS', langColor: '#3178C6',
    growth: '+8.1%', sparkPts: '0,10 8,8 16,7 24,5 32,4 40,3 48,2',
    time: 'Updated 2d ago', updated: 'year', likes: 542,
  },
  {
    rank: 11, rankClass: 'normal', avatar: 'S', category: 'frontend', tag: 'Frontend', tagClass: 'tag-frontend',
    repo: 'shadcn-ui/ui', desc: 'Beautifully designed components built with Radix UI and Tailwind CSS. Copy. Paste. Ship.',
    stars: '81.4K', forks: '5.1K', lang: 'TS', langColor: '#3178C6',
    growth: '+45.3%', sparkPts: '0,18 8,14 16,11 24,8 32,5 40,3 48,1',
    time: 'Updated 3h ago', updated: 'day', likes: 1287,
  },
  {
    rank: 12, rankClass: 'normal', avatar: 'F', category: 'backend', tag: 'Backend', tagClass: 'tag-backend',
    repo: 'tiangolo/fastapi', desc: 'FastAPI framework, high performance, easy to learn, fast to code, ready for production.',
    stars: '82.1K', forks: '7.3K', lang: 'Python', langColor: '#3572A5',
    growth: '+14.2%', sparkPts: '0,13 8,10 16,8 24,6 32,4 40,3 48,2',
    time: 'Updated 6h ago', updated: 'week', likes: 834,
  },
];

/** 无限滚动数据模板 —— 用于生成更多卡片 */
const MORE_TEMPLATES = [
  { repo: 'pola-rs/polars', desc: 'Dataframes powered by a multithreaded, vectorized query engine, written in Rust.', stars: '30.2K', forks: '2.1K', lang: 'Rust', langColor: '#dea584', category: 'data', tag: 'Data Science', tagClass: 'tag-data' },
  { repo: 'astral-sh/uv', desc: 'An extremely fast Python package and project manager, written in Rust.', stars: '24.8K', forks: '678', lang: 'Rust', langColor: '#dea584', category: 'tools', tag: 'Tools', tagClass: 'tag-tools' },
  { repo: 'tabler/tabler-icons', desc: 'A set of over 5200 free MIT-licensed SVG icons for web projects.', stars: '18.4K', forks: '1.2K', lang: 'TS', langColor: '#3178C6', category: 'frontend', tag: 'Frontend', tagClass: 'tag-frontend' },
  { repo: 'surrealdb/surrealdb', desc: 'A scalable, distributed, document-graph database for the modern web.', stars: '26.8K', forks: '1.5K', lang: 'Rust', langColor: '#dea584', category: 'backend', tag: 'Backend', tagClass: 'tag-backend' },
  { repo: 'dani-garcia/vaultwarden', desc: 'Unofficial Bitwarden server. Lightweight and self-hosted password manager.', stars: '38.4K', forks: '2.1K', lang: 'Rust', langColor: '#dea584', category: 'devops', tag: 'DevOps', tagClass: 'tag-devops' },
  { repo: 'google/googletest', desc: 'Google C++ testing framework. Write better C++ tests with xUnit style.', stars: '32.4K', forks: '10.2K', lang: 'C++', langColor: '#f34b7d', category: 'tools', tag: 'Tools', tagClass: 'tag-tools' },
  { repo: 'redis/redis', desc: 'Redis is an in-memory database that persists on disk. Data structure server.', stars: '67.8K', forks: '24.1K', lang: 'C', langColor: '#555555', category: 'backend', tag: 'Backend', tagClass: 'tag-backend' },
  { repo: 'appwrite/appwrite', desc: 'Open-source backend platform for developing apps at any scale.', stars: '46.8K', forks: '4.2K', lang: 'TS', langColor: '#3178C6', category: 'backend', tag: 'Backend', tagClass: 'tag-backend' },
];

const GROWTH_OPTS = ['+1.2%', '+3.8%', '+5.4%', '+8.1%', '+11.6%', '+15.3%', '+22.1%', '+28.7%'];
const UPDATED_OPTS = ['day', 'week', 'month', 'year'];

/** 基于索引的确定性伪随机数（避免 SSR/CSR hydration 不匹配） */
function deterministicRand(seed: number, max: number): number {
  // 简单的 LCG 变体：用种子生成 0..max-1 的确定性值
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return Math.floor((x - Math.floor(x)) * max);
}

/** 生成无限滚动卡片数据（全部确定性，避免 hydration mismatch） */
export function generateMoreCards(count: number): LeaderboardCard[] {
  const cards: LeaderboardCard[] = [];
  for (let i = 0; i < count; i++) {
    const tpl = MORE_TEMPLATES[i % MORE_TEMPLATES.length];
    const rank = 13 + i;
    cards.push({
      rank,
      rankClass: 'normal',
      avatar: tpl.repo.split('/')[1][0].toUpperCase(),
      category: tpl.category,
      tag: tpl.tag,
      tagClass: tpl.tagClass,
      repo: tpl.repo,
      desc: tpl.desc,
      stars: tpl.stars,
      forks: tpl.forks,
      lang: tpl.lang,
      langColor: tpl.langColor,
      growth: GROWTH_OPTS[i % GROWTH_OPTS.length],
      sparkPts: `0,${10 + deterministicRand(i, 6)} 8,${8 + deterministicRand(i + 1, 6)} 16,${6 + deterministicRand(i + 2, 6)} 24,${4 + deterministicRand(i + 3, 6)} 32,${3 + deterministicRand(i + 4, 4)} 40,${2 + deterministicRand(i + 5, 4)} 48,${1 + deterministicRand(i + 6, 3)}`,
      time: `Updated ${deterministicRand(i, 23) + 1}h ago`,
      updated: UPDATED_OPTS[i % UPDATED_OPTS.length],
      likes: deterministicRand(i, 2000) + 50,
    });
  }
  return cards;
}

/** 统计条数据 —— 与 .design 首页保持一致 */
export const STATS_DATA = [
  { icon: '\u{2B50}', label: 'TRACKED REPOS', value: '12,847', unit: '', accent: 'gold', change: '+248 today', changeMuted: false, barWidth: '78%' },
  { icon: '\u{1F4C8}', label: 'TOTAL STARS', value: '5.2', unit: 'M', accent: 'cyan', change: '+12.4K today', changeMuted: false, barWidth: '85%' },
  { icon: '\u{1F4E2}', label: 'CATEGORIES', value: '10', unit: '', accent: 'green', change: '+2 new', changeMuted: false, barWidth: '45%' },
  { icon: '\u{1F504}', label: 'LANGUAGES', value: '47', unit: '', accent: 'orange', change: '+3 this month', changeMuted: false, barWidth: '62%' },
  { icon: '\u{1F916}', label: 'UPTIME', value: '99.8', unit: '%', accent: 'purple', change: '30-day avg', changeMuted: true, barWidth: '99%' },
];

/** 分类标签数据 —— 与 .design 首页顺序/文案保持一致 */
export interface CategoryItem {
  label: string;
  count: number;
  active?: boolean;
  /** 对应卡片数据中的 category 字段，null 表示全部 */
  categoryKey: string | null;
}

export const CATEGORIES: CategoryItem[] = [
  { label: 'ALL', count: 12847, active: true, categoryKey: null },
  { label: 'AI/ML', count: 2341, categoryKey: 'ai-ml' },
  { label: 'TOOLS', count: 1876, categoryKey: 'tools' },
  { label: 'GAMES', count: 942, categoryKey: 'games' },
  { label: 'FRONTEND', count: 2108, categoryKey: 'frontend' },
  { label: 'DEVOPS', count: 1523, categoryKey: 'devops' },
  { label: 'DATA SCIENCE', count: 1287, categoryKey: 'data' },
  { label: 'SECURITY', count: 764, categoryKey: 'security' },
  { label: 'MOBILE', count: 1105, categoryKey: 'mobile' },
  { label: 'DESIGN', count: 638, categoryKey: 'design' },
  { label: 'BACKEND', count: 1942, categoryKey: 'backend' },
];

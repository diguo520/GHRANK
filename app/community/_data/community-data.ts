/**
 * 社区页面数据 —— 类型定义 + 静态数据 + 辅助函数
 * 迁移自 community.js 的 MOCK DATA 与 PURE HELPER FUNCTIONS
 *
 * 头像处理：沿用 leaderboard-data.ts 的字母头像模式（无图片资源），
 * 用作者名首字母大写作为头像字符，避免引入额外静态资源。
 *
 * repliers 处理：原始 JS 用 Math.random 在模块加载时生成回复者头像栈，
 * 此处改为基于 thread.id 的确定性算法，保证 SSR/CSR 一致，避免 hydration mismatch。
 */

/* ═══════════════════════════════════════════════════════════
   1. 类型定义
   ═══════════════════════════════════════════════════════════ */

/** 回复者（用于帖子右侧的 GitHub 风格头像堆叠） */
export interface Replier {
  name: string;
  avatar: string; // 字母头像
}

/** 帖子线程 */
export interface Thread {
  id: number;
  title: string;
  author: string;
  avatar: string; // 作者首字母，用于圆形头像
  section: string;
  tag: string;
  replies: number;
  views: number;
  timeAgo: string;
  isHot: boolean;
  isNew: boolean;
  likes: number;
  liked: boolean;
  isOnline: boolean;
  repliers: Replier[];
}

/** 作者池条目（用于回复者头像栈与合成帖子的作者） */
export interface Author {
  name: string;
  avatar: string; // 首字母
}

/** 标签热度排名条目 */
export interface TagRanking {
  tag: string;
  rank: number;
  trend: 'up' | 'down' | 'flat';
  change: number;
}

/** 热门贴吧条目（右栏紧凑列表） */
export interface HotTieba {
  id: string;
  name: string;
  icon: string; // 六边形图标内的两字母缩写
  members: string;
  posts: string;
}

/** 贴吧目录条目（完整贴吧列表，贴吧模式用） */
export interface TiebaCatalogItem {
  id: string;
  name: string;
  icon: string;
  desc: string;
  members: number;
  posts: number;
  tags: string[];
}

/** 公告条目 */
export interface Announcement {
  tag: string;
  tagType: 'default' | 'update' | 'event';
  text: string;
}

/** 社区统计卡片 */
export interface CommunityStat {
  value: string;
  label: string;
  /** 是否需要在线人数波动动画 */
  dynamic?: boolean;
}

/** Tab 定义 */
export interface CommunityTab {
  key: string;
  label: string;
}

/* ═══════════════════════════════════════════════════════════
   2. 映射表与常量
   ═══════════════════════════════════════════════════════════ */

/** 分类名称 → 分类 key */
export const SECTION_KEY_MAP: Record<string, string> = {
  'Hot Topics': 'hot',
  'Show & Tell': 'show',
  Questions: 'questions',
  Discussions: 'discussions',
  Tutorials: 'tutorials',
  'News & Updates': 'news',
  'Off-Topic': 'offtopic',
  'Dev Logs': 'devlogs',
};

/** 分类 key → 分类名称 */
export const KEY_TO_SECTION: Record<string, string> = {
  hot: 'Hot Topics',
  show: 'Show & Tell',
  questions: 'Questions',
  discussions: 'Discussions',
  tutorials: 'Tutorials',
  news: 'News & Updates',
  offtopic: 'Off-Topic',
  devlogs: 'Dev Logs',
};

/** 侧边栏各分类的基础计数（展示用） */
export const SECTION_COUNTS: Record<string, number> = {
  hot: 1284,
  show: 642,
  questions: 1089,
  discussions: 876,
  tutorials: 234,
  news: 198,
  offtopic: 156,
  devlogs: 89,
};

/** Tab 列表定义 */
export const COMMUNITY_TABS: CommunityTab[] = [
  { key: 'All', label: 'All' },
  { key: 'New', label: 'New' },
  { key: 'Hot', label: 'Hot Topics' },
  { key: 'Latest', label: 'Latest Replies' },
  { key: 'Top', label: 'Most Replies' },
];

/** 标签 → 贴吧 ID 映射（帖子链接携带 bar 参数用） */
export const TAG_TO_BAR: Record<string, string> = {
  'AI-Agents': 'ai-agents',
  LLM: 'ai-agents',
  RAG: 'rag-builders',
  'Vector-DB': 'vector-db',
  'LLM-Finetune': 'llm-train',
  'CLI-Tools': 'cli-craft',
  'Open-Source': 'open-src',
  'Scoring-Model': 'scoring',
  'GHRANK-API': 'scoring',
  DevOps: 'devops',
  Tutorial: 'ai-agents',
};

/** 合成帖子的标题后缀（防止重复，循环使用） */
export const TITLE_SUFFIXES: string[] = [
  ' (part 2)',
  ' \u2014 follow-up',
  ' (continued)',
  ' #2',
  ' (update)',
  ' \u2014 revisited',
  ' (part 3)',
  ' #3',
  ' (round 2)',
  ' \u2014 deep dive',
  ' (part 4)',
  ' #4',
  ' (revisited)',
  ' \u2014 addendum',
  ' (part 5)',
  ' #5',
  ' (round 3)',
  ' \u2014 part 6',
  ' (part 7)',
  ' #6',
  ' (sequel)',
  ' \u2014 part 8',
  ' (part 9)',
  ' #7',
  ' (round 4)',
  ' \u2014 part 10',
  ' (part 11)',
  ' #8',
  ' (epilogue)',
  ' \u2014 part 12',
  ' (part 13)',
  ' #9',
];

/** 每页加载的帖子数 */
export const PAGE_SIZE = 6;

/* ═══════════════════════════════════════════════════════════
   3. 静态数据
   ═══════════════════════════════════════════════════════════ */

/** 作者池（回复者头像栈与合成帖子的作者来源） */
export const AUTHOR_POOL: Author[] = [
  { name: 'AlexShader', avatar: 'A' },
  { name: 'kairos', avatar: 'K' },
  { name: 'nexusdev', avatar: 'N' },
  { name: 'mlcraft', avatar: 'M' },
  { name: 'voidrunner', avatar: 'V' },
  { name: 'shellweird', avatar: 'S' },
  { name: 'newton_r', avatar: 'N' },
  { name: 'mirakade', avatar: 'M' },
  { name: 'jintao', avatar: 'J' },
  { name: 'pixelshift', avatar: 'P' },
  { name: 'dataforge', avatar: 'D' },
  { name: 'cyclonix', avatar: 'C' },
];

/** 无限滚动合成帖子的基础池 */
export const EXTRA_POOL: Array<{
  title: string;
  author: string;
  avatar: string;
  section: string;
  isHot: boolean;
  likes: number;
}> = [
  { title: 'Deep dive: GHRANK signal aggregation pipeline internals', author: 'mirakade', avatar: 'M', section: 'Dev Logs', isHot: false, likes: 14 },
  { title: 'Show & Tell: Terminal dashboard for tracking trending repos', author: 'kairos', avatar: 'K', section: 'Show & Tell', isHot: false, likes: 29 },
  { title: 'Question: How to handle auth in edge-run serverless agents?', author: 'nexusdev', avatar: 'N', section: 'Questions', isHot: false, likes: 8 },
  { title: 'Tutorial: Ship a RAG-powered CLI in under 100 lines', author: 'mlcraft', avatar: 'M', section: 'Tutorials', isHot: true, likes: 76 },
  { title: 'Discussion: Are leaderboards good for open source culture?', author: 'voidrunner', avatar: 'V', section: 'Discussions', isHot: true, likes: 142 },
  { title: 'News: GHRANK CLI v2.1 ships with streaming scoring mode', author: 'AlexShader', avatar: 'A', section: 'News & Updates', isHot: false, likes: 64 },
  { title: 'Off-Topic: Best mechanical keyboards for long coding sessions', author: 'pixelshift', avatar: 'P', section: 'Off-Topic', isHot: false, likes: 31 },
  { title: 'Question: What is the ideal refresh interval for scoring?', author: 'newton_r', avatar: 'N', section: 'Questions', isHot: false, likes: 19 },
  { title: 'Dev Log: Refactoring the time-decay module for clarity', author: 'mirakade', avatar: 'M', section: 'Dev Logs', isHot: false, likes: 7 },
  { title: 'Show & Tell: Built a GitHub Arctic Code Vault explorer', author: 'shellweird', avatar: 'S', section: 'Show & Tell', isHot: false, likes: 25 },
  { title: 'Tutorial: End-to-end observability for agent pipelines', author: 'jintao', avatar: 'J', section: 'Tutorials', isHot: false, likes: 58 },
  { title: 'Discussion: Monetizing open source without losing trust', author: 'dataforge', avatar: 'D', section: 'Discussions', isHot: true, likes: 97 },
  { title: 'Benchmarking vector stores: pgvector vs Pinecone vs Weaviate', author: 'dataforge', avatar: 'D', section: 'Discussions', isHot: false, likes: 41 },
  { title: 'How we cut CI build times by 70% with remote caching', author: 'mlcraft', avatar: 'M', section: 'Show & Tell', isHot: true, likes: 88 },
  { title: 'Question: Best practices for streaming LLM responses to the browser', author: 'nexusdev', avatar: 'N', section: 'Questions', isHot: false, likes: 12 },
  { title: 'Dev Log: Shipping the new community-weighted signal weights UI', author: 'mirakade', avatar: 'M', section: 'Dev Logs', isHot: false, likes: 23 },
  { title: 'Tutorial: Build a GitHub bot with Probot and TypeScript', author: 'jintao', avatar: 'J', section: 'Tutorials', isHot: false, likes: 35 },
  { title: 'News: GHRANK now indexes Hugging Face Spaces and models', author: 'AlexShader', avatar: 'A', section: 'News & Updates', isHot: true, likes: 112 },
  { title: 'Off-Topic: Favorite terminal emulators and font pairings', author: 'pixelshift', avatar: 'P', section: 'Off-Topic', isHot: false, likes: 44 },
  { title: 'Discussion: Should we adopt Bun for the scoring pipeline?', author: 'voidrunner', avatar: 'V', section: 'Discussions', isHot: true, likes: 67 },
  { title: 'Show & Tell: A noise-map generator for procedural game worlds', author: 'shellweird', avatar: 'S', section: 'Show & Tell', isHot: false, likes: 19 },
  { title: 'Question: How does GHRANK handle deleted or renamed repos?', author: 'newton_r', avatar: 'N', section: 'Questions', isHot: false, likes: 6 },
  { title: 'Tutorial: Deploy a multi-agent system on Cloudflare Workers', author: 'kairos', avatar: 'K', section: 'Tutorials', isHot: false, likes: 52 },
  { title: 'Dev Log: Migrating the scoring scheduler to durable objects', author: 'mirakade', avatar: 'M', section: 'Dev Logs', isHot: false, likes: 31 },
  { title: 'Discussion: Open-core vs fully-open monetization models in 2026', author: 'dataforge', avatar: 'D', section: 'Discussions', isHot: false, likes: 79 },
];

/** 标签热度排名（Top 10，趋势箭头） */
export const TAG_RANKINGS: TagRanking[] = [
  { tag: 'AI-Agents', rank: 1, trend: 'up', change: 2 },
  { tag: 'RAG', rank: 2, trend: 'up', change: 1 },
  { tag: 'LLM-Finetune', rank: 3, trend: 'down', change: 1 },
  { tag: 'Vector-DB', rank: 4, trend: 'flat', change: 0 },
  { tag: 'Open-Source', rank: 5, trend: 'up', change: 3 },
  { tag: 'CLI-Tools', rank: 6, trend: 'down', change: 2 },
  { tag: 'GHRANK-API', rank: 7, trend: 'up', change: 1 },
  { tag: 'Scoring-Model', rank: 8, trend: 'flat', change: 0 },
  { tag: 'DevOps', rank: 9, trend: 'down', change: 1 },
  { tag: 'Tutorial', rank: 10, trend: 'up', change: 4 },
];

/** 热门贴吧列表（右栏紧凑列表） */
export const HOT_TIEBAS: HotTieba[] = [
  { id: 'ai-agents', name: 'AI Agents Hub', icon: 'AI', members: '12.4K', posts: '3.2K' },
  { id: 'rag-builders', name: 'RAG Builders', icon: 'RG', members: '8.7K', posts: '2.1K' },
  { id: 'llm-train', name: 'LLM Training', icon: 'LL', members: '6.3K', posts: '1.8K' },
  { id: 'vector-db', name: 'Vector DB Labs', icon: 'VD', members: '4.9K', posts: '1.2K' },
  { id: 'cli-craft', name: 'CLI Craftsmen', icon: 'CL', members: '3.5K', posts: '890' },
];

/** 贴吧目录（贴吧模式完整列表，供后续贴吧页面复用） */
export const TIEBA_CATALOG: TiebaCatalogItem[] = [
  { id: 'ai-agents', name: 'AI Agents Hub', icon: 'AI', desc: 'Discuss autonomous AI agents, tool use, and multi-agent orchestration patterns.', members: 12400, posts: 3200, tags: ['AI-Agents', 'LLM'] },
  { id: 'rag-builders', name: 'RAG Builders', icon: 'RG', desc: 'Build retrieval-augmented generation pipelines, share embedding strategies and chunking tips.', members: 8700, posts: 2100, tags: ['RAG', 'Vector-DB'] },
  { id: 'llm-train', name: 'LLM Training', icon: 'LL', desc: 'Fine-tuning, QLoRA, LoRA, dataset prep, and training infrastructure discussions.', members: 6300, posts: 1800, tags: ['LLM-Finetune'] },
  { id: 'vector-db', name: 'Vector DB Labs', icon: 'VD', desc: 'Compare and optimize vector stores: pgvector, Pinecone, Weaviate, Qdrant and more.', members: 4900, posts: 1200, tags: ['Vector-DB'] },
  { id: 'cli-craft', name: 'CLI Craftsmen', icon: 'CL', desc: 'Share your favorite CLI tools, shell scripts, terminal workflows and dotfiles.', members: 3500, posts: 890, tags: ['CLI-Tools'] },
  { id: 'open-src', name: 'Open Source Guild', icon: 'OS', desc: 'Open source governance, licensing, monetization, and community management.', members: 5200, posts: 1450, tags: ['Open-Source'] },
  { id: 'scoring', name: 'Scoring Model Lab', icon: 'SC', desc: 'Deep dives into GHRANK scoring algorithms, signal weighting, and time-decay models.', members: 2800, posts: 670, tags: ['Scoring-Model', 'GHRANK-API'] },
  { id: 'devops', name: 'DevOps Den', icon: 'DO', desc: 'CI/CD, container orchestration, observability, and infrastructure-as-code for AI workloads.', members: 4100, posts: 980, tags: ['DevOps'] },
];

/** 社区公告（从 community.html 提取） */
export const ANNOUNCEMENTS: Announcement[] = [
  { tag: 'Event', tagType: 'default', text: 'GHRANK Hackathon 2026 kicks off this Friday — $50K in prizes for the best agent integrations.' },
  { tag: 'Update', tagType: 'update', text: 'Scoring engine v4.2 deployed — community-weighted signals now live across all repo rankings.' },
  { tag: 'Town Hall', tagType: 'event', text: 'Monthly community town hall this Sunday 18:00 UTC. Bring your feature requests and feedback.' },
];

/** 社区统计卡片（从 community.html 提取） */
export const COMMUNITY_STATS: CommunityStat[] = [
  { value: '48.3K', label: 'Members' },
  { value: '1,247', label: 'Online', dynamic: true },
  { value: '186', label: 'Posts Today' },
  { value: '1,432', label: 'Replies Today' },
];

/** Hero 打字机动画文案 */
export const HERO_TEXTS: string[] = [
  'Where Builders Connect',
  'Where Ideas Flow',
  'Where Code Lives',
];

/* ═══════════════════════════════════════════════════════════
   4. 辅助函数
   ═══════════════════════════════════════════════════════════ */

/** 数字格式化：124 -> "124"，3420 -> "3.4K" */
export function fmtNum(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

/** 带千分位的数字格式化 */
export function fmtCount(n: number): string {
  return n.toLocaleString();
}

/** 解析 timeAgo 字符串为分钟数（用于排序） */
export function parseTimeAgoToMinutes(str: string): number {
  if (!str) return Number.MAX_SAFE_INTEGER;
  const m = String(str).match(/^(\d+)\s*(m|h|d)$/i);
  if (!m) return Number.MAX_SAFE_INTEGER;
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  if (unit === 'm') return n;
  if (unit === 'h') return n * 60;
  if (unit === 'd') return n * 60 * 24;
  return Number.MAX_SAFE_INTEGER;
}

/** 根据标签获取对应贴吧 ID，未命中时回退到第一个贴吧 */
export function tagToBarId(tag: string): string {
  return TAG_TO_BAR[tag] || TIEBA_CATALOG[0].id;
}

/** 侧边栏标签列表，用于为合成帖子分配分类标签 */
const SIDEBAR_TAGS: string[] = TAG_RANKINGS.map((item) => item.tag);

/** 基于标题字符 hash 分配标签（确定性，保证 SSR/CSR 一致） */
export function tagForThread(title: string): string {
  let n = 0;
  for (let i = 0; i < title.length; i++) n += title.charCodeAt(i);
  return SIDEBAR_TAGS[n % SIDEBAR_TAGS.length];
}

/**
 * 基于种子确定性构建回复者头像栈
 * 用 thread.id 作为种子，从 AUTHOR_POOL 轮询选取，保证 SSR/CSR 一致
 */
export function buildRepliers(replyCount: number, seed: number): Replier[] {
  const n = Math.min(5, Math.max(2, Math.floor(replyCount / 8) + 1));
  const pool = AUTHOR_POOL.slice();
  const result: Replier[] = [];
  // 线性同余生成器（LCG），保证可复现的伪随机序列
  let state = seed * 2654435761 % 2147483647;
  if (state <= 0) state += 2147483646;
  const rand = () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rand() * pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
    if (pool.length === 0) pool.push(...AUTHOR_POOL);
  }
  return result;
}

/** 根据标签获取对应贴吧 ID 的 URL 查询参数串 */
export function barQueryForTag(tag: string): string {
  return `bar=${encodeURIComponent(tagToBarId(tag))}`;
}

/* ═══════════════════════════════════════════════════════════
   5. 帖子数据构建
   ═══════════════════════════════════════════════════════════ */

/** 基础帖子池原始数据（不含 repliers，运行时填充） */
const RAW_BASE_THREADS: Array<Omit<Thread, 'repliers'>> = [
  { id: 1, title: 'GHRANK scoring v4 proposal: community-weighted signals', author: 'AlexShader', avatar: 'A', section: 'Discussions', tag: 'Scoring-Model', replies: 87, views: 3420, timeAgo: '2h', isHot: true, isNew: true, likes: 124, liked: false, isOnline: true },
  { id: 2, title: 'Show & Tell: Built a real-time repo monitor with GHRANK API', author: 'kairos', avatar: 'K', section: 'Show & Tell', tag: 'GHRANK-API', replies: 34, views: 1280, timeAgo: '3h', isHot: false, isNew: true, likes: 38, liked: false, isOnline: false },
  { id: 3, title: 'Best vector database for production agent pipelines?', author: 'nexusdev', avatar: 'N', section: 'Questions', tag: 'Vector-DB', replies: 56, views: 2100, timeAgo: '4h', isHot: true, isNew: false, likes: 67, liked: false, isOnline: true },
  { id: 4, title: 'Tutorial: Fine-tune Llama 4 locally with QLoRA in 30 minutes', author: 'mlcraft', avatar: 'M', section: 'Tutorials', tag: 'LLM-Finetune', replies: 23, views: 1890, timeAgo: '5h', isHot: false, isNew: false, likes: 91, liked: false, isOnline: false },
  { id: 5, title: 'The real cost of running open-source AI in production', author: 'voidrunner', avatar: 'V', section: 'Discussions', tag: 'Open-Source', replies: 112, views: 5640, timeAgo: '6h', isHot: true, isNew: false, likes: 203, liked: false, isOnline: true },
  { id: 6, title: 'Announcing GHRANK API v3 -- breaking changes and migration guide', author: 'AlexShader', avatar: 'A', section: 'News & Updates', tag: 'GHRANK-API', replies: 41, views: 3200, timeAgo: '8h', isHot: false, isNew: false, likes: 156, liked: false, isOnline: false },
  { id: 7, title: 'How I built a CLI tool that ranks my dotfiles', author: 'shellweird', avatar: 'S', section: 'Show & Tell', tag: 'CLI-Tools', replies: 18, views: 720, timeAgo: '10h', isHot: false, isNew: false, likes: 22, liked: false, isOnline: true },
  { id: 8, title: 'Why does time-decay weighting use 180 days as the threshold?', author: 'newton_r', avatar: 'N', section: 'Questions', tag: 'Scoring-Model', replies: 29, views: 1100, timeAgo: '12h', isHot: false, isNew: false, likes: 45, liked: false, isOnline: false },
  { id: 9, title: 'Dev Log: Building a community-driven scoring model', author: 'mirakade', avatar: 'M', section: 'Dev Logs', tag: 'DevOps', replies: 15, views: 480, timeAgo: '1d', isHot: false, isNew: false, likes: 18, liked: false, isOnline: true },
  { id: 10, title: 'Off-Topic: What IDE theme are you using in 2026?', author: 'pixelshift', avatar: 'P', section: 'Off-Topic', tag: 'Tutorial', replies: 64, views: 890, timeAgo: '1d', isHot: true, isNew: false, likes: 73, liked: false, isOnline: false },
  { id: 11, title: 'How to contribute to GHRANK -- comprehensive onboarding guide', author: 'jintao', avatar: 'J', section: 'Tutorials', tag: 'Open-Source', replies: 8, views: 340, timeAgo: '2d', isHot: false, isNew: false, likes: 12, liked: false, isOnline: true },
  { id: 12, title: 'Comparing RAG frameworks: LlamaIndex vs LangChain vs Haystack', author: 'dataforge', avatar: 'D', section: 'Discussions', tag: 'RAG', replies: 73, views: 4100, timeAgo: '2d', isHot: true, isNew: false, likes: 188, liked: false, isOnline: false },
];

/** 基础帖子池（12 条，repliers 已确定性填充） */
export const BASE_THREADS: Thread[] = RAW_BASE_THREADS.map((t) => ({
  ...t,
  repliers: buildRepliers(t.replies, t.id),
}));

/**
 * 合成一个新帖子（用于无限滚动数据生成）
 * 使用 Math.random，仅在客户端调用以避免 hydration 问题
 */
let nextThreadId = 1000;
let extraCursor = 0;

function nextExtraBase() {
  const base = EXTRA_POOL[extraCursor % EXTRA_POOL.length];
  extraCursor++;
  return base;
}

export function synthesizeThread(sectionKey?: string): Thread {
  nextThreadId++;
  const base = nextExtraBase();
  const replies = Math.floor(Math.random() * 90) + 4;
  const views = Math.floor(Math.random() * 5000) + 200;
  const minsAgo = Math.floor(Math.random() * 240) + 5;
  const timeAgo = minsAgo < 60 ? `${minsAgo}m` : `${Math.floor(minsAgo / 60)}h`;

  // 循环使用标题后缀避免重复
  let suffix = '';
  const cycle = Math.floor(extraCursor / EXTRA_POOL.length);
  if (cycle > 0) {
    const sIdx = (cycle - 1) * EXTRA_POOL.length + (extraCursor % EXTRA_POOL.length) - 1;
    suffix = TITLE_SUFFIXES[sIdx % TITLE_SUFFIXES.length] || '';
  }
  const fullTitle = base.title + suffix;

  // 分类过滤：如果指定了 section，覆盖基础帖子的 section
  const effectiveSection = sectionKey && KEY_TO_SECTION[sectionKey]
    ? KEY_TO_SECTION[sectionKey]
    : base.section;
  const effectiveIsHot = sectionKey === 'hot' ? true : base.isHot;

  return {
    id: nextThreadId,
    title: fullTitle,
    author: base.author,
    avatar: base.avatar,
    section: effectiveSection,
    tag: tagForThread(fullTitle),
    replies,
    views,
    timeAgo,
    isHot: effectiveIsHot,
    isNew: true,
    likes: base.likes,
    liked: false,
    isOnline: Math.random() < 0.55,
    repliers: buildRepliers(replies, nextThreadId),
  };
}

/** 确保帖子池至少有 targetLen 条，不足则合成补充 */
export function ensurePool(pool: Thread[], targetLen: number, sectionKey?: string): Thread[] {
  while (pool.length < targetLen) {
    pool.push(synthesizeThread(sectionKey));
  }
  return pool;
}

/**
 * 生成无限滚动用的更多帖子数据
 * 仅在客户端调用（内部使用 Math.random）
 */
export function generateMoreThreads(count: number, sectionKey?: string): Thread[] {
  const pool: Thread[] = BASE_THREADS.slice();
  ensurePool(pool, BASE_THREADS.length + count, sectionKey);
  // 返回基础池之外的部分作为无限滚动数据
  return pool.slice(BASE_THREADS.length);
}

/**
 * 根据当前 Tab 和分类过滤+排序帖子列表
 * 返回处理后的有序数组
 */
export function filterAndSortThreads(
  threads: Thread[],
  tab: string,
  sectionKey: string | null,
): Thread[] {
  let list = threads.slice();
  // 分类过滤
  if (sectionKey) {
    const secName = KEY_TO_SECTION[sectionKey] || sectionKey;
    list = list.filter((t) => t.section === secName);
  }
  // Tab 过滤与排序
  switch (tab) {
    case 'New':
      list = list.filter((t) => t.isNew);
      list.sort((a, b) => parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo));
      break;
    case 'Hot':
      list = list.filter((t) => t.isHot);
      list.sort((a, b) => parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo));
      break;
    case 'Top':
      list.sort((a, b) => b.replies - a.replies);
      break;
    case 'Latest':
    case 'All':
    default:
      list.sort((a, b) => parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo));
      break;
  }
  return list;
}

/** 计算各分类的帖子计数（用于侧边栏展示） */
export function computeSectionCounts(pool: Thread[]): Record<string, number> {
  const counts: Record<string, number> = {
    hot: 0, show: 0, questions: 0, discussions: 0,
    tutorials: 0, news: 0, offtopic: 0, devlogs: 0,
  };
  for (const t of pool) {
    if (t.isHot) counts.hot++;
    const key = SECTION_KEY_MAP[t.section];
    if (key) counts[key]++;
  }
  return counts;
}

/**
 * 贴吧列表页数据 —— 类型 + 静态数据 + 帖子合成/过滤辅助
 * 迁移自 community-tiebas.js 的常量与 PURE HELPER FUNCTIONS
 *
 * 头像策略：沿用 community-data.ts 的字母头像模式（无图片资源），
 * 用作者名首字母大写作为头像字符，保持与已迁移组件一致。
 *
 * 确定性合成：初始帖子池使用基于种子的 LCG 生成，保证 SSR/CSR 一致，
 * 避免 hydration mismatch；仅无限滚动的补充数据在客户端用 Math.random。
 */

import {
  AUTHOR_POOL,
  buildRepliers,
  fmtNum,
  parseTimeAgoToMinutes,
  TIEBA_CATALOG,
  type Thread,
  type TiebaCatalogItem,
} from '../../_data/community-data';

/* ═══════════════════════════════════════════════════════════
   1. 常量
   ═══════════════════════════════════════════════════════════ */

/** 贴吧页 Tab 列表（含 Vote / Question 两个贴吧专属分类） */
export const TIEBA_TABS = [
  { key: 'All', label: 'All' },
  { key: 'Hot', label: 'Hot' },
  { key: 'Latest', label: 'Latest' },
  { key: 'Vote', label: 'Vote' },
  { key: 'Question', label: 'Question' },
] as const;

/** 每页加载的帖子数（与原始 PAGE_SIZE 一致） */
export const TIEBA_PAGE_SIZE = 6;

/** 贴吧规则（去掉原始序号前缀，渲染时用 index 自动编号） */
export const TIEBA_RULES: string[] = [
  'Be respectful to other members.',
  'Share agent-related content only.',
  'No spam or self-promotion.',
  'Use tags when starting a thread.',
];

/** 版主列表（头像改为字母，保持与已迁移代码一致） */
export const MODERATORS: { name: string; avatar: string }[] = [
  { name: 'AlexShader', avatar: 'A' },
  { name: 'nexusdev', avatar: 'N' },
  { name: 'voidrunner', avatar: 'V' },
];

/* ── 帖子标题池，按标签分类 ── */
const TAG_TITLE_POOL: Record<string, string[]> = {
  'AI-Agents': [
    'Designing agent orchestration with explicit tool boundaries',
    'Multi-agent planning: centralized vs swarm topology',
    'Tool use failure modes in production agent systems',
    'Building a state machine for long-running agent workflows',
    'Evaluating agent reasoning with deterministic replay',
  ],
  RAG: [
    'Chunking strategies for technical documentation RAG',
    'Embedding model selection for multi-lingual corpora',
    'Hybrid retrieval: dense + sparse in production',
    'RAG evaluation metrics beyond nDCG',
    'Handling stale knowledge in retrieval pipelines',
  ],
  'LLM-Finetune': [
    'QLoRA memory profiling for 70B models',
    'Dataset curation for instruction fine-tuning',
    'Learning rate schedules for LoRA adapters',
    'Evaluating catastrophic forgetting during continual pretraining',
    'Fine-tuning reward models for domain-specific RLHF',
  ],
  'Vector-DB': [
    'pgvector vs Qdrant: latency under concurrent load',
    'Index tuning for HNSW with high-dimensional embeddings',
    'Metadata filtering strategies in vector stores',
    'Multi-tenant vector isolation patterns',
    'Benchmarking recall across vector databases',
  ],
  'Open-Source': [
    'Open-core pricing without alienating contributors',
    'License compatibility across ML dependencies',
    'Maintainer burnout and sustainable governance',
    'Building a CLA-bot that actually works',
    'Community health metrics that predict project longevity',
  ],
  'CLI-Tools': [
    'Progressive enhancement in terminal UI frameworks',
    'Shell completion generation from Go structs',
    'Testing CLI apps with golden file patterns',
    'Error message design for power users',
    'Distributing binaries across package managers',
  ],
  'GHRANK-API': [
    'Rate-limiting patterns for public scoring APIs',
    'Webhook signatures and replay attack prevention',
    'Versioning strategy for breaking API changes',
    'OpenAPI generation from TypeScript controllers',
    'Caching TTL strategies for repo metadata',
  ],
  'Scoring-Model': [
    'Time-decay functions compared: exponential vs power-law',
    'Signal weighting with community feedback loops',
    'Detecting gaming attempts in repo scoring',
    'Temporal staleness in aggregate rankings',
    'A/B testing ranking changes without bias',
  ],
  DevOps: [
    'GitHub Actions matrix strategies for ML pipelines',
    'Observability for GPU training clusters',
    'Immutable infrastructure for inference endpoints',
    'Cost attribution across shared Kubernetes namespaces',
    'Disaster recovery for stateful model registries',
  ],
  LLM: [
    'Benchmarking frontier LLMs on reasoning tasks',
    'Context window utilization for long-form generation',
    'Prompt injection mitigation techniques',
    'Structured output generation with constrained decoding',
    'Model distillation trade-offs in production',
  ],
};

/** 兜底标题池（标签未命中时使用） */
const FALLBACK_TITLES: string[] = [
  'Deep dive: scaling patterns for community-driven platforms',
  'Question: best practices for caching derived signals',
  'Show & Tell: a minimal scoring dashboard',
  'Discussion: how do you measure open source impact',
  'Tutorial: shipping faster with deterministic CI',
];

/** 投票帖标题池（保证 Vote Tab 有内容） */
const VOTE_TITLES: string[] = [
  'Vote: Which agent framework should we standardize on?',
  'Vote: Best vector database for production RAG?',
  'Vote: Preferred LoRA target module?',
  'Vote: CLI vs GUI for agent tooling?',
  'Vote: Should we add a weekly ranking thread?',
];

/** 提问帖标题池（保证 Question Tab 有内容） */
const QUESTION_TITLES: string[] = [
  'Question: How do you handle agent state persistence?',
  'Question: What is the best embedding model for code search?',
  'Question: Is QLoRA enough for domain adaptation?',
  'Question: How do you version vector indexes?',
  'Question: Best practices for multi-agent error recovery?',
];

/** 帖子分区（随机分配） */
const SECTIONS: string[] = [
  'Discussions', 'Show & Tell', 'Questions', 'Tutorials',
  'News & Updates', 'Off-Topic', 'Dev Logs',
];

/** 合成帖子起始 ID（与原始 nextThreadId = 3000 对齐） */
const BASE_THREAD_ID = 3000;

/* ═══════════════════════════════════════════════════════════
   2. 辅助函数
   ═══════════════════════════════════════════════════════════ */

/** 根据 barId 查找贴吧，未命中回退到第一个贴吧 */
export function findBar(id: string): TiebaCatalogItem {
  return TIEBA_CATALOG.find((b) => b.id === id) || TIEBA_CATALOG[0];
}

/**
 * 确定性伪随机数生成器（LCG）
 * 给定种子返回 [0,1) 的可复现序列，用于 SSR/CSR 一致的帖子合成
 */
function makeRng(seed: number): () => number {
  let state = seed * 2654435761;
  state = state % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

/** 基于 barId 生成稳定数值种子 */
function barSeed(barId: string): number {
  let n = 0;
  for (let i = 0; i < barId.length; i++) n = (n * 31 + barId.charCodeAt(i)) >>> 0;
  return n || 1;
}

/** 范围随机整数（确定性版本） */
function randInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

/** 从数组中确定性取一个元素 */
function pickOne<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

/** 将分钟数转换为 timeAgo 字符串（如 "45m" / "3h" / "2d"） */
function minutesToTimeAgo(mins: number): string {
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h`;
  return `${Math.floor(mins / 1440)}d`;
}

/* ═══════════════════════════════════════════════════════════
   3. 帖子合成
   ═══════════════════════════════════════════════════════════ */

let nextThreadId = BASE_THREAD_ID;

/** 候选标题池工厂：Vote / Question 帖子按概率混入，保证对应 Tab 有内容 */
function rollThreadKind(rand: () => number, bar: TiebaCatalogItem): {
  title: string;
  tag: string;
  section: string;
} {
  const roll = rand();
  // 12% 投票帖 + 12% 提问帖（与原始合成逻辑一致）
  if (roll < 0.12) {
    return { title: pickOne(rand, VOTE_TITLES), tag: 'Vote', section: 'Questions' };
  }
  if (roll < 0.24) {
    // 提问帖：tag 仍取自贴吧 tags（与原始逻辑一致，tag 在 roll 之前已设定）
    return { title: pickOne(rand, QUESTION_TITLES), tag: pickOne(rand, bar.tags), section: 'Questions' };
  }
  // 常规帖：从贴吧 tags 中取一个，再从对应标题池取标题
  const tag = pickOne(rand, bar.tags);
  const titlePool = TAG_TITLE_POOL[tag] || FALLBACK_TITLES;
  return { title: pickOne(rand, titlePool), tag, section: pickOne(rand, SECTIONS) };
}

/**
 * 确定性合成一条属于某贴吧的帖子
 * @param bar   贴吧目录项
 * @param index 序号（用于种子偏移，保证池内各帖不同）
 */
function synthesizeBarThread(bar: TiebaCatalogItem, index: number): Thread {
  nextThreadId += 1;
  const id = nextThreadId;
  // 种子由 barId + 帖子 id 组合，保证跨渲染一致
  const rand = makeRng(barSeed(bar.id) + index * 7 + id);

  const { title, tag, section } = rollThreadKind(rand, bar);
  const author = pickOne(rand, AUTHOR_POOL);
  const replies = randInt(rand, 2, 120);
  const views = randInt(rand, 200, 6000);
  const minsAgo = randInt(rand, 5, 2880);
  const likes = randInt(rand, 0, 220);

  return {
    id,
    title,
    author: author.name,
    avatar: author.avatar,
    section,
    tag,
    replies,
    views,
    timeAgo: minutesToTimeAgo(minsAgo),
    isHot: likes > 80 || replies > 80,
    isNew: minsAgo < 60 * 24,
    likes,
    liked: false,
    isOnline: rand() < 0.55,
    repliers: buildRepliers(replies, id),
  };
}

/**
 * 构建某贴吧的初始帖子池（确定性，42 条）
 * 用于首屏骨架屏替换 + 无限滚动基础数据
 */
export function buildBarPool(bar: TiebaCatalogItem, count = 42): Thread[] {
  nextThreadId = BASE_THREAD_ID; // 每次构建重置 ID 起点，保证可复现
  const pool: Thread[] = [];
  for (let i = 0; i < count; i++) pool.push(synthesizeBarThread(bar, i));
  return pool;
}

/**
 * 客户端合成更多贴吧帖子（仅用于无限滚动补充，使用 Math.random）
 * @param bar   贴吧目录项
 * @param count 生成数量
 */
export function generateMoreBarThreads(bar: TiebaCatalogItem, count: number): Thread[] {
  const pool: Thread[] = [];
  for (let i = 0; i < count; i++) {
    nextThreadId += 1;
    const id = nextThreadId;
    const tag = bar.tags[Math.floor(Math.random() * bar.tags.length)];
    const titlePool = TAG_TITLE_POOL[tag] || FALLBACK_TITLES;
    const author = AUTHOR_POOL[Math.floor(Math.random() * AUTHOR_POOL.length)];
    // 客户端补充帖同样混入 Vote / Question
    const roll = Math.random();
    let title: string;
    let section: string;
    if (roll < 0.12) {
      title = VOTE_TITLES[Math.floor(Math.random() * VOTE_TITLES.length)];
      section = 'Questions';
    } else if (roll < 0.24) {
      title = QUESTION_TITLES[Math.floor(Math.random() * QUESTION_TITLES.length)];
      section = 'Questions';
    } else {
      title = titlePool[Math.floor(Math.random() * titlePool.length)];
      section = SECTIONS[Math.floor(Math.random() * SECTIONS.length)];
    }
    const replies = Math.floor(Math.random() * 119) + 2;
    const views = Math.floor(Math.random() * 5800) + 200;
    const minsAgo = Math.floor(Math.random() * 2875) + 5;
    const likes = Math.floor(Math.random() * 221);
    pool.push({
      id,
      title,
      author: author.name,
      avatar: author.avatar,
      section,
      tag: roll < 0.12 ? 'Vote' : tag,
      replies,
      views,
      timeAgo: minutesToTimeAgo(minsAgo),
      isHot: likes > 80 || replies > 80,
      isNew: minsAgo < 60 * 24,
      likes,
      liked: false,
      isOnline: Math.random() < 0.55,
      repliers: buildRepliers(replies, id),
    });
  }
  return pool;
}

/* ═══════════════════════════════════════════════════════════
   4. 过滤与排序
   ═══════════════════════════════════════════════════════════ */

/** 判断标题是否为投票帖 */
function isVoteThread(t: Thread): boolean {
  const lower = (t.title || '').toLowerCase();
  return lower.startsWith('vote:') || lower.includes('[vote]') || t.tag === 'Vote';
}

/** 判断标题是否为提问帖（排除投票帖） */
function isQuestionThread(t: Thread): boolean {
  const title = t.title || '';
  const lower = title.toLowerCase();
  return !isVoteThread(t) && (title.endsWith('?') || lower.startsWith('question:'));
}

/** 按时间升序排序（最新在前） */
function sortByLatest(list: Thread[]): Thread[] {
  return list.sort((a, b) => parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo));
}

/**
 * 根据当前 Tab 过滤+排序贴吧帖子列表
 * 返回处理后的有序数组（不修改原数组）
 */
export function filterTiebaThreads(threads: Thread[], tab: string): Thread[] {
  let list = threads.slice();
  switch (tab) {
    case 'Hot':
      list = sortByLatest(list.filter((t) => t.isHot));
      break;
    case 'Latest':
      list = sortByLatest(list.filter((t) => t.isNew));
      break;
    case 'Vote':
      list = sortByLatest(list.filter(isVoteThread));
      break;
    case 'Question':
      list = sortByLatest(list.filter(isQuestionThread));
      break;
    case 'All':
    default:
      list = sortByLatest(list);
      break;
  }
  return list;
}

/** 重新导出常用工具，供页面组件直接引用 */
export { fmtNum };

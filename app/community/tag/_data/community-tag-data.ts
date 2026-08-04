/**
 * 标签详情页数据 —— 标签 Tab + 帖子合成/过滤辅助
 * 迁移自 community-tag.js 的常量与 PURE HELPER FUNCTIONS
 *
 * 头像策略：沿用 community-data.ts 的字母头像模式。
 * 确定性合成：初始池用基于种子的 LCG，保证 SSR/CSR 一致；
 * 仅无限滚动补充数据在客户端用 Math.random。
 */

import {
  AUTHOR_POOL,
  buildRepliers,
  parseTimeAgoToMinutes,
  type Thread,
} from '../../_data/community-data';

/* ═══════════════════════════════════════════════════════════
   1. 常量
   ═══════════════════════════════════════════════════════════ */

/** 标签页 Tab 列表（原始：All / New / Hot Topics / Most Replies） */
export const TAG_TABS = [
  { key: 'All', label: 'All' },
  { key: 'New', label: 'New' },
  { key: 'Hot', label: 'Hot Topics' },
  { key: 'Top', label: 'Most Replies' },
] as const;

/** 每页加载的帖子数（与原始 PAGE_SIZE 一致） */
export const TAG_PAGE_SIZE = 6;

/** 合成帖子起始 ID（与原始 nextThreadId = 5000 对齐） */
const BASE_THREAD_ID = 5000;

/** 帖子标题池，按标签分类（用于生成该标签下的合成帖子） */
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
  Tutorial: [
    'Ship your first RAG CLI end-to-end',
    'Build a reproducible fine-tuning notebook',
    'From zero to vector search with pgvector',
    'Writing custom GitHub Actions for model evaluation',
    'Containerize and deploy a FastAPI inference service',
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

/** 帖子分区（随机分配） */
const SECTIONS: string[] = [
  'Discussions', 'Show & Tell', 'Questions', 'Tutorials',
  'News & Updates', 'Off-Topic', 'Dev Logs',
];

/* ═══════════════════════════════════════════════════════════
   2. 辅助函数（确定性 LCG，与 tiebas 数据文件一致）
   ═══════════════════════════════════════════════════════════ */

/** 确定性伪随机数生成器（LCG） */
function makeRng(seed: number): () => number {
  let state = seed * 2654435761;
  state = state % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

/** 基于标签名生成稳定数值种子 */
function tagSeed(tag: string): number {
  let n = 0;
  for (let i = 0; i < tag.length; i++) n = (n * 31 + tag.charCodeAt(i)) >>> 0;
  return n || 1;
}

function randInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pickOne<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function minutesToTimeAgo(mins: number): string {
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h`;
  return `${Math.floor(mins / 1440)}d`;
}

/* ═══════════════════════════════════════════════════════════
   3. 帖子合成
   ═══════════════════════════════════════════════════════════ */

let nextThreadId = BASE_THREAD_ID;

/**
 * 确定性合成一条属于某标签的帖子
 * @param tag   标签名
 * @param index 序号（种子偏移，保证池内各帖不同）
 */
function synthesizeTagThread(tag: string, index: number): Thread {
  nextThreadId += 1;
  const id = nextThreadId;
  const rand = makeRng(tagSeed(tag) + index * 7 + id);

  const titlePool = TAG_TITLE_POOL[tag] || FALLBACK_TITLES;
  const title = pickOne(rand, titlePool);
  const author = pickOne(rand, AUTHOR_POOL);
  const section = pickOne(rand, SECTIONS);
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
 * 构建某标签的初始帖子池（确定性，42 条）
 */
export function buildTagPool(tag: string, count = 42): Thread[] {
  nextThreadId = BASE_THREAD_ID; // 重置 ID 起点，保证可复现
  const pool: Thread[] = [];
  for (let i = 0; i < count; i++) pool.push(synthesizeTagThread(tag, i));
  return pool;
}

/**
 * 客户端合成更多标签帖子（仅用于无限滚动补充，使用 Math.random）
 */
export function generateMoreTagThreads(tag: string, count: number): Thread[] {
  const pool: Thread[] = [];
  const titlePool = TAG_TITLE_POOL[tag] || FALLBACK_TITLES;
  for (let i = 0; i < count; i++) {
    nextThreadId += 1;
    const id = nextThreadId;
    const author = AUTHOR_POOL[Math.floor(Math.random() * AUTHOR_POOL.length)];
    const title = titlePool[Math.floor(Math.random() * titlePool.length)];
    const section = SECTIONS[Math.floor(Math.random() * SECTIONS.length)];
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
      tag,
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

/** 按时间升序排序（最新在前） */
function sortByLatest(list: Thread[]): Thread[] {
  return list.sort((a, b) => parseTimeAgoToMinutes(a.timeAgo) - parseTimeAgoToMinutes(b.timeAgo));
}

/**
 * 根据当前 Tab 过滤+排序标签帖子列表
 * 与原始 community-tag.js 的 getFilteredThreads 逻辑一致
 */
export function filterTagThreads(threads: Thread[], tab: string): Thread[] {
  let list = threads.slice();
  switch (tab) {
    case 'New':
      list = sortByLatest(list.filter((t) => t.isNew));
      break;
    case 'Hot':
      list = sortByLatest(list.filter((t) => t.isHot));
      break;
    case 'Top':
      list = list.sort((a, b) => b.replies - a.replies);
      break;
    case 'All':
    default:
      list = sortByLatest(list);
      break;
  }
  return list;
}

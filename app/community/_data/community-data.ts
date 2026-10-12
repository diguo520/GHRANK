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
  /** 是否包含投票内容 */
  hasPoll: boolean;
  likes: number;
  liked: boolean;
  isOnline: boolean;
  repliers: Replier[];
  /** 帖子类型：normal(常规) / vote(投票帖) / question(提问帖) */
  threadType?: 'normal' | 'vote' | 'question';
  /** 提问帖的积分奖励（仅 question 类型有值） */
  questionPoints?: number;
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
  /** 贴吧横幅图片 URL（用户上传），为空时使用渐变占位 */
  banner?: string;
}

/** 用户创建的贴吧（localStorage 持久化） */
export interface UserCreatedTieba {
  id: string;            // 贴吧 slug（唯一标识）
  name: string;
  desc: string;
  icon: string;          // 名称首字母自动生成
  avatarUrl?: string;    // 裁剪上传后的头像 URL
  bannerUrl?: string;    // 裁剪上传后的横幅 URL
  createdAt: number;
  members: number;       // 初始 1（创建者）
  posts: number;         // 初始 0
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
  /** 原始数值，显示时通过 fmtCount 做全站统一格式化（≥100万时用 XXXK） */
  value: number;
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
  hasPoll: boolean;
  likes: number;
}> = [
  { title: 'Deep dive: GHRANK signal aggregation pipeline internals', author: 'mirakade', avatar: 'M', section: 'Dev Logs', isHot: false, hasPoll: false, likes: 14 },
  { title: 'Show & Tell: Terminal dashboard for tracking trending repos', author: 'kairos', avatar: 'K', section: 'Show & Tell', isHot: false, hasPoll: false, likes: 29 },
  { title: 'Question: How to handle auth in edge-run serverless agents?', author: 'nexusdev', avatar: 'N', section: 'Questions', isHot: false, hasPoll: false, likes: 8 },
  { title: 'Tutorial: Ship a RAG-powered CLI in under 100 lines', author: 'mlcraft', avatar: 'M', section: 'Tutorials', isHot: true, hasPoll: false, likes: 76 },
  { title: 'Discussion: Are leaderboards good for open source culture?', author: 'voidrunner', avatar: 'V', section: 'Discussions', isHot: true, hasPoll: true, likes: 142 },
  { title: 'News: GHRANK CLI v2.1 ships with streaming scoring mode', author: 'AlexShader', avatar: 'A', section: 'News & Updates', isHot: false, hasPoll: false, likes: 64 },
  { title: 'Off-Topic: Best mechanical keyboards for long coding sessions', author: 'pixelshift', avatar: 'P', section: 'Off-Topic', isHot: false, hasPoll: false, likes: 31 },
  { title: 'Question: What is the ideal refresh interval for scoring?', author: 'newton_r', avatar: 'N', section: 'Questions', isHot: false, hasPoll: true, likes: 19 },
  { title: 'Dev Log: Refactoring the time-decay module for clarity', author: 'mirakade', avatar: 'M', section: 'Dev Logs', isHot: false, hasPoll: false, likes: 7 },
  { title: 'Show & Tell: Built a GitHub Arctic Code Vault explorer', author: 'shellweird', avatar: 'S', section: 'Show & Tell', isHot: false, hasPoll: false, likes: 25 },
  { title: 'Tutorial: End-to-end observability for agent pipelines', author: 'jintao', avatar: 'J', section: 'Tutorials', isHot: false, hasPoll: false, likes: 58 },
  { title: 'Discussion: Monetizing open source without losing trust', author: 'dataforge', avatar: 'D', section: 'Discussions', isHot: true, hasPoll: true, likes: 97 },
  { title: 'Benchmarking vector stores: pgvector vs Pinecone vs Weaviate', author: 'dataforge', avatar: 'D', section: 'Discussions', isHot: false, hasPoll: true, likes: 41 },
  { title: 'How we cut CI build times by 70% with remote caching', author: 'mlcraft', avatar: 'M', section: 'Show & Tell', isHot: true, hasPoll: false, likes: 88 },
  { title: 'Question: Best practices for streaming LLM responses to the browser', author: 'nexusdev', avatar: 'N', section: 'Questions', isHot: false, hasPoll: false, likes: 12 },
  { title: 'Dev Log: Shipping the new community-weighted signal weights UI', author: 'mirakade', avatar: 'M', section: 'Dev Logs', isHot: false, hasPoll: false, likes: 23 },
  { title: 'Tutorial: Build a GitHub bot with Probot and TypeScript', author: 'jintao', avatar: 'J', section: 'Tutorials', isHot: false, hasPoll: false, likes: 35 },
  { title: 'News: GHRANK now indexes Hugging Face Spaces and models', author: 'AlexShader', avatar: 'A', section: 'News & Updates', isHot: true, hasPoll: false, likes: 112 },
  { title: 'Off-Topic: Favorite terminal emulators and font pairings', author: 'pixelshift', avatar: 'P', section: 'Off-Topic', isHot: false, hasPoll: false, likes: 44 },
  { title: 'Discussion: Should we adopt Bun for the scoring pipeline?', author: 'voidrunner', avatar: 'V', section: 'Discussions', isHot: true, hasPoll: true, likes: 67 },
  { title: 'Show & Tell: A noise-map generator for procedural game worlds', author: 'shellweird', avatar: 'S', section: 'Show & Tell', isHot: false, hasPoll: false, likes: 19 },
  { title: 'Question: How does GHRANK handle deleted or renamed repos?', author: 'newton_r', avatar: 'N', section: 'Questions', isHot: false, hasPoll: false, likes: 6 },
  { title: 'Tutorial: Deploy a multi-agent system on Cloudflare Workers', author: 'kairos', avatar: 'K', section: 'Tutorials', isHot: false, hasPoll: false, likes: 52 },
  { title: 'Dev Log: Migrating the scoring scheduler to durable objects', author: 'mirakade', avatar: 'M', section: 'Dev Logs', isHot: false, hasPoll: false, likes: 31 },
  { title: 'Discussion: Open-core vs fully-open monetization models in 2026', author: 'dataforge', avatar: 'D', section: 'Discussions', isHot: false, hasPoll: true, likes: 79 },
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
  { id: 'ai-agents', name: 'AI Agents Hub', icon: 'AI', desc: 'Discuss autonomous AI agents, tool use, and multi-agent orchestration patterns.', members: 12400, posts: 3200, tags: ['AI-Agents', 'LLM'], banner: 'https://picsum.photos/seed/ai-agents/1200/400' },
  { id: 'rag-builders', name: 'RAG Builders', icon: 'RG', desc: 'Build retrieval-augmented generation pipelines, share embedding strategies and chunking tips.', members: 8700, posts: 2100, tags: ['RAG', 'Vector-DB'], banner: 'https://picsum.photos/seed/rag-builders/1200/400' },
  { id: 'llm-train', name: 'LLM Training', icon: 'LL', desc: 'Fine-tuning, QLoRA, LoRA, dataset prep, and training infrastructure discussions.', members: 6300, posts: 1800, tags: ['LLM-Finetune'], banner: 'https://picsum.photos/seed/llm-train/1200/400' },
  { id: 'vector-db', name: 'Vector DB Labs', icon: 'VD', desc: 'Compare and optimize vector stores: pgvector, Pinecone, Weaviate, Qdrant and more.', members: 4900, posts: 1200, tags: ['Vector-DB'], banner: 'https://picsum.photos/seed/vector-db/1200/400' },
  { id: 'cli-craft', name: 'CLI Craftsmen', icon: 'CL', desc: 'Share your favorite CLI tools, shell scripts, terminal workflows and dotfiles.', members: 3500, posts: 890, tags: ['CLI-Tools'], banner: 'https://picsum.photos/seed/cli-craft/1200/400' },
  { id: 'open-src', name: 'Open Source Guild', icon: 'OS', desc: 'Open source governance, licensing, monetization, and community management.', members: 5200, posts: 1450, tags: ['Open-Source'], banner: 'https://picsum.photos/seed/open-src/1200/400' },
  { id: 'scoring', name: 'Scoring Model Lab', icon: 'SC', desc: 'Deep dives into GHRANK scoring algorithms, signal weighting, and time-decay models.', members: 2800, posts: 670, tags: ['Scoring-Model', 'GHRANK-API'], banner: 'https://picsum.photos/seed/scoring/1200/400' },
  { id: 'devops', name: 'DevOps Den', icon: 'DO', desc: 'CI/CD, container orchestration, observability, and infrastructure-as-code for AI workloads.', members: 4100, posts: 980, tags: ['DevOps'], banner: 'https://picsum.photos/seed/devops/1200/400' },
];

/* ═══════════════════════════════════════════════════════════
   3.1 大规模贴吧目录（加入贴吧组页面用，50+ 条，分 6 大类）
   ═══════════════════════════════════════════════════════════ */

/** 加入贴吧页面使用的贴吧分类 */
export const TIEBA_CATEGORIES = [
  { key: 'All', label: 'All' },
  { key: 'AI & ML', label: 'AI & ML' },
  { key: 'Data Infra', label: 'Data Infra' },
  { key: 'Dev Tools', label: 'Dev Tools' },
  { key: 'Frontend', label: 'Frontend' },
  { key: 'Open Source', label: 'Open Source' },
  { key: 'Career', label: 'Career' },
] as const;

export type TiebaCategoryKey = (typeof TIEBA_CATEGORIES)[number]['key'];

/** 加入贴吧页面的扩展贴吧条目 */
export interface ExpandedTieba extends TiebaCatalogItem {
  /** 所属一级分类（用于分类过滤） */
  category: Exclude<TiebaCategoryKey, 'All'>;
  /** 百度贴吧式的今日帖子热度（红/橙标签） */
  todayPosts: number;
  /** 是否为官方推荐（新用户进入页面时默认高亮） */
  featured?: boolean;
  /** 贴吧标签颜色（tag 徽标用，与六边形图标配合） */
  theme?: 'gold' | 'purple' | 'cyan' | 'green' | 'red' | 'blue';
}

/** 50+ 条贴吧：覆盖 AI/ML、数据基建、工具链、前端、开源文化、职业 6 大类 */
export const EXPANDED_TIEBA_CATALOG: ExpandedTieba[] = [
  // ─── AI & ML (10+) ─────────────────────────────────────────
  { id: 'ai-agents', name: 'AI Agents Hub', icon: 'AI', desc: 'Discuss autonomous AI agents, tool use, and multi-agent orchestration patterns.', members: 12400, posts: 3200, tags: ['AI-Agents', 'LLM'], category: 'AI & ML', todayPosts: 186, featured: true, theme: 'gold' },
  { id: 'llm-train', name: 'LLM Training', icon: 'LL', desc: 'Fine-tuning, QLoRA, LoRA, dataset prep, and training infrastructure discussions.', members: 6300, posts: 1800, tags: ['LLM-Finetune'], category: 'AI & ML', todayPosts: 94, featured: true, theme: 'purple' },
  { id: 'prompt-lab', name: 'Prompt Engineers', icon: 'PE', desc: 'Share prompt patterns, jailbreak defenses, structured output and few-shot recipes.', members: 9800, posts: 2600, tags: ['LLM'], category: 'AI & ML', todayPosts: 152, featured: true, theme: 'cyan' },
  { id: 'mm-model', name: 'Multimodal Models', icon: 'MM', desc: 'Vision-language models, video understanding, speech and audio foundation models.', members: 5400, posts: 1320, tags: ['LLM'], category: 'AI & ML', todayPosts: 68 },
  { id: 'rlhf-reward', name: 'Alignment Lab', icon: 'AL', desc: 'RLHF, DPO, PPO, reward modeling and evaluation for LLM alignment.', members: 3600, posts: 820, tags: ['LLM-Finetune'], category: 'AI & ML', todayPosts: 41 },
  { id: 'agent-sec', name: 'Agent Security', icon: 'AS', desc: 'Tool-call injection defenses, sandboxing, ACL for autonomous agents.', members: 2100, posts: 460, tags: ['AI-Agents'], category: 'AI & ML', todayPosts: 24 },
  { id: 'tts-stt', name: 'Speech & Audio AI', icon: 'SP', desc: 'TTS, STT, voice cloning, diarization and audio foundation models.', members: 1750, posts: 380, tags: ['LLM'], category: 'AI & ML', todayPosts: 19 },
  { id: 'reinforce', name: 'Reinforcement Learning', icon: 'RL', desc: 'Deep RL, offline RL, sim-to-real and policy gradients in production.', members: 2400, posts: 560, tags: ['LLM'], category: 'AI & ML', todayPosts: 28 },
  { id: 'edge-ai', name: 'Edge & On-Device AI', icon: 'ED', desc: 'Quantization, on-device inference, WASM ML, mobile and browser LLMs.', members: 3100, posts: 720, tags: ['LLM'], category: 'AI & ML', todayPosts: 37 },
  { id: 'ai-gaming', name: 'AI for Games', icon: 'AG', desc: 'NPC agents, procedural content, LLM dialogue systems in video games.', members: 1950, posts: 420, tags: ['AI-Agents'], category: 'AI & ML', todayPosts: 22 },

  // ─── Data Infra (9+) ───────────────────────────────────────
  { id: 'rag-builders', name: 'RAG Builders', icon: 'RG', desc: 'Build retrieval-augmented generation pipelines, share embedding strategies and chunking tips.', members: 8700, posts: 2100, tags: ['RAG', 'Vector-DB'], category: 'Data Infra', todayPosts: 128, featured: true, theme: 'purple' },
  { id: 'vector-db', name: 'Vector DB Labs', icon: 'VD', desc: 'Compare and optimize vector stores: pgvector, Pinecone, Weaviate, Qdrant and more.', members: 4900, posts: 1200, tags: ['Vector-DB'], category: 'Data Infra', todayPosts: 76, featured: true, theme: 'gold' },
  { id: 'embedding', name: 'Embedding Hub', icon: 'EM', desc: 'Embedding model comparisons, MTEB results, distillation and multilingual.', members: 4200, posts: 960, tags: ['RAG'], category: 'Data Infra', todayPosts: 53 },
  { id: 'data-pipes', name: 'Data Pipelines', icon: 'DP', desc: 'Airflow, Dagster, Prefect, Spark and streaming data pipelines.', members: 5600, posts: 1340, tags: ['DevOps'], category: 'Data Infra', todayPosts: 61 },
  { id: 'data-quality', name: 'Data Quality Guild', icon: 'DQ', desc: 'Monitoring, schema validation, lineage and Great Expectations-style tooling.', members: 2700, posts: 610, tags: ['DevOps'], category: 'Data Infra', todayPosts: 31 },
  { id: 'lakehouse', name: 'Lakehouse & Data Lake', icon: 'LH', desc: 'Iceberg, Delta Lake, Hudi, table formats and lakehouse architecture.', members: 3400, posts: 780, tags: ['DevOps'], category: 'Data Infra', todayPosts: 39 },
  { id: 'graph-db', name: 'Graph Databases', icon: 'GD', desc: 'Neo4j, pg_graph, Neptune and knowledge graphs for RAG retrieval.', members: 1850, posts: 420, tags: ['Vector-DB'], category: 'Data Infra', todayPosts: 21 },
  { id: 'etl-elt', name: 'ETL vs ELT', icon: 'ET', desc: 'Modern data stacks, Fivetran/dbt, reverse ETL and analytics engineering.', members: 3850, posts: 880, tags: ['DevOps'], category: 'Data Infra', todayPosts: 45 },
  { id: 'olap-db', name: 'OLAP & Analytics DB', icon: 'OA', desc: 'ClickHouse, DuckDB, Druid, Pinot and real-time analytics databases.', members: 2650, posts: 610, tags: ['DevOps'], category: 'Data Infra', todayPosts: 33 },

  // ─── Dev Tools (10+) ───────────────────────────────────────
  { id: 'cli-craft', name: 'CLI Craftsmen', icon: 'CL', desc: 'Share your favorite CLI tools, shell scripts, terminal workflows and dotfiles.', members: 3500, posts: 890, tags: ['CLI-Tools'], category: 'Dev Tools', todayPosts: 57, featured: true, theme: 'cyan' },
  { id: 'scoring', name: 'Scoring Model Lab', icon: 'SC', desc: 'Deep dives into GHRANK scoring algorithms, signal weighting, and time-decay models.', members: 2800, posts: 670, tags: ['Scoring-Model', 'GHRANK-API'], category: 'Dev Tools', todayPosts: 38, featured: true, theme: 'gold' },
  { id: 'devops', name: 'DevOps Den', icon: 'DO', desc: 'CI/CD, container orchestration, observability, and infrastructure-as-code for AI workloads.', members: 4100, posts: 980, tags: ['DevOps'], category: 'Dev Tools', todayPosts: 49, featured: true, theme: 'green' },
  { id: 'rust-lang', name: 'Rust Developers', icon: 'RS', desc: 'Systems programming, concurrency, WASM and building performant tools in Rust.', members: 6200, posts: 1640, tags: ['CLI-Tools'], category: 'Dev Tools', todayPosts: 83 },
  { id: 'go-lang', name: 'Go Developers', icon: 'GO', desc: 'Backend services, microservices, CLIs and cloud native tooling in Go.', members: 5400, posts: 1420, tags: ['CLI-Tools'], category: 'Dev Tools', todayPosts: 72 },
  { id: 'python-dev', name: 'Python Developers', icon: 'PY', desc: 'Python tooling, linting, packaging, typing and ecosystem discussions.', members: 7800, posts: 2100, tags: ['CLI-Tools'], category: 'Dev Tools', todayPosts: 111 },
  { id: 'nix-guix', name: 'Nix & Reproducible Envs', icon: 'NX', desc: 'NixOS, Guix, devenv and reproducible developer environments.', members: 1600, posts: 380, tags: ['DevOps'], category: 'Dev Tools', todayPosts: 21 },
  { id: 'k8s-cloud', name: 'Kubernetes & Cloud', icon: 'K8', desc: 'K8s, Helm, Argo, Crossplane, AWS/GCP/Azure for AI workloads.', members: 5100, posts: 1280, tags: ['DevOps'], category: 'Dev Tools', todayPosts: 64 },
  { id: 'observability', name: 'Observability Hub', icon: 'OB', desc: 'OpenTelemetry, Prometheus, Grafana, tracing and metrics in production.', members: 3300, posts: 760, tags: ['DevOps'], category: 'Dev Tools', todayPosts: 42 },
  { id: 'sec-appsec', name: 'AppSec & Secure Dev', icon: 'SE', desc: 'SAST, DAST, SBOM, supply chain security and secure coding practices.', members: 2100, posts: 490, tags: ['DevOps'], category: 'Dev Tools', todayPosts: 27 },
  { id: 'vscode-ecos', name: 'Editor & IDE Wars', icon: 'VS', desc: 'VS Code, Neovim, JetBrains, Zed and editor customization culture.', members: 3750, posts: 920, tags: ['CLI-Tools'], category: 'Dev Tools', todayPosts: 51 },

  // ─── Frontend (8+) ─────────────────────────────────────────
  { id: 'nextjs-react', name: 'Next.js & React', icon: 'NJ', desc: 'App Router, React Server Components, streaming and Next.js production patterns.', members: 8600, posts: 2280, tags: ['Tutorial'], category: 'Frontend', todayPosts: 124, featured: true, theme: 'purple' },
  { id: 'ui-component', name: 'UI Component Libraries', icon: 'UI', desc: 'shadcn/ui, Radix, Ant Design, component design systems and accessibility.', members: 5800, posts: 1460, tags: ['Tutorial'], category: 'Frontend', todayPosts: 82, featured: true, theme: 'blue' },
  { id: 'css-layout', name: 'CSS & Layout Wizards', icon: 'CS', desc: 'Modern CSS, container queries, cascade layers, CSS animations and grid.', members: 4300, posts: 1040, tags: ['Tutorial'], category: 'Frontend', todayPosts: 56 },
  { id: 'anim-motion', name: 'Animation & Motion', icon: 'AM', desc: 'GSAP, Framer Motion, Rive, Lottie and frontend motion design.', members: 2600, posts: 640, tags: ['Tutorial'], category: 'Frontend', todayPosts: 36 },
  { id: 'bundler-build', name: 'Build Tools & Bundlers', icon: 'BT', desc: 'Vite, Turbopack, Rspack, Rolldown, esbuild and large build pipelines.', members: 3100, posts: 740, tags: ['DevOps'], category: 'Frontend', todayPosts: 43 },
  { id: 'svelte-astro', name: 'Svelte, Astro & Islands', icon: 'SV', desc: 'Islands architecture, Svelte 5, Astro, Qwik and meta-framework choices.', members: 2800, posts: 680, tags: ['Tutorial'], category: 'Frontend', todayPosts: 39 },
  { id: 'a11y-web', name: 'Accessibility & A11y', icon: 'AL', desc: 'WCAG, screen readers, keyboard nav and building inclusive interfaces.', members: 1700, posts: 390, tags: ['Tutorial'], category: 'Frontend', todayPosts: 23 },
  { id: 'perf-web', name: 'Web Performance', icon: 'WP', desc: 'Core Web Vitals, INP, streaming HTML, code-splitting and speed investigations.', members: 2500, posts: 580, tags: ['Tutorial'], category: 'Frontend', todayPosts: 35 },

  // ─── Open Source (8+) ──────────────────────────────────────
  { id: 'open-src', name: 'Open Source Guild', icon: 'OS', desc: 'Open source governance, licensing, monetization, and community management.', members: 5200, posts: 1450, tags: ['Open-Source'], category: 'Open Source', todayPosts: 67, featured: true, theme: 'green' },
  { id: 'oss-funding', name: 'OSS Funding & Monetization', icon: 'OF', desc: 'Sponsors, grants, dual licensing, Open Core and sustainability models.', members: 2900, posts: 660, tags: ['Open-Source'], category: 'Open Source', todayPosts: 37 },
  { id: 'oss-maintainer', name: 'Maintainer Life', icon: 'MN', desc: 'Burnout, triage, release management and surviving as an OSS maintainer.', members: 2100, posts: 470, tags: ['Open-Source'], category: 'Open Source', todayPosts: 26 },
  { id: 'oss-license', name: 'Licensing & Compliance', icon: 'LC', desc: 'MIT/Apache/GPL, SSPL/BSL, CLA/DCO, copyleft and license compatibility.', members: 1800, posts: 410, tags: ['Open-Source'], category: 'Open Source', todayPosts: 23 },
  { id: 'inner-source', name: 'InnerSource Culture', icon: 'IS', desc: 'Open source collaboration patterns used inside large organizations.', members: 1400, posts: 320, tags: ['Open-Source'], category: 'Open Source', todayPosts: 17 },
  { id: 'docs-writing', name: 'Technical Writing', icon: 'TW', desc: 'Documentation, Diátaxis, docs-as-code and keeping docs fresh with code.', members: 2000, posts: 460, tags: ['Open-Source'], category: 'Open Source', todayPosts: 28 },
  { id: 'oss-product', name: 'Product-led OSS', icon: 'PL', desc: 'Open core product strategy, PLG motions and building community-first products.', members: 2450, posts: 570, tags: ['Open-Source'], category: 'Open Source', todayPosts: 33 },
  { id: 'ghrank-contrib', name: 'GHRANK Contributors', icon: 'GC', desc: 'Contributing to GHRANK — repo crawlers, scoring, frontend and new tiebas.', members: 1650, posts: 380, tags: ['GHRANK-API', 'Scoring-Model'], category: 'Open Source', todayPosts: 21 },

  // ─── Career (6+) ───────────────────────────────────────────
  { id: 'career-growth', name: 'Career Growth', icon: 'CG', desc: 'From junior → staff/principal, interview prep and career strategy in AI/infra.', members: 6800, posts: 1820, tags: ['Tutorial'], category: 'Career', todayPosts: 92, featured: true, theme: 'red' },
  { id: 'remote-work', name: 'Remote & Async Work', icon: 'RW', desc: 'Remote teams, async communication, work-life balance and staying productive.', members: 4900, posts: 1260, tags: ['Tutorial'], category: 'Career', todayPosts: 66 },
  { id: 'freelance-ind', name: 'Freelance & Indie Hackers', icon: 'FH', desc: 'Consulting, productized services, SaaS micro-products and being your own boss.', members: 3200, posts: 780, tags: ['Tutorial'], category: 'Career', todayPosts: 41 },
  { id: 'ai-startup', name: 'AI Startups', icon: 'ST', desc: 'Founding stories, fundraising, MVP traction and building AI-first startups.', members: 4500, posts: 1160, tags: ['AI-Agents'], category: 'Career', todayPosts: 61 },
  { id: 'salary-tc', name: 'Compensation & TC', icon: 'TC', desc: 'Compensation bands, offers negotiation, equity and RSUs for AI/ML roles.', members: 3800, posts: 940, tags: ['Tutorial'], category: 'Career', todayPosts: 52 },
  { id: 'wlb-mental', name: 'WLB & Mental Health', icon: 'WH', desc: 'Preventing burnout, deep work, focus and sustainable pace for builders.', members: 2600, posts: 620, tags: ['Tutorial'], category: 'Career', todayPosts: 38 },
];

/** 社区公告（从 community.html 提取） */
export const ANNOUNCEMENTS: Announcement[] = [
  { tag: 'Event', tagType: 'default', text: 'GHRANK Hackathon 2026 kicks off this Friday — $50K in prizes for the best agent integrations.' },
  { tag: 'Update', tagType: 'update', text: 'Scoring engine v4.2 deployed — community-weighted signals now live across all repo rankings.' },
  { tag: 'Town Hall', tagType: 'event', text: 'Monthly community town hall this Sunday 18:00 UTC. Bring your feature requests and feedback.' },
];

/** 社区统计卡片（从 community.html 提取） */
export const COMMUNITY_STATS: CommunityStat[] = [
  { value: 48300, label: 'Members' },
  { value: 1247, label: 'Online', dynamic: true },
  { value: 186, label: 'Posts Today' },
  { value: 1432, label: 'Replies Today' },
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

/**
 * 数字国际化格式化（全站统一规则：K/M/B 简写 + 1 位小数，去除尾随 .0）
 * 边界处理：≥999.5K 进一位为 1M，避免出现 "1000K"；M/B 同理
 * - <1,000:    原样数字                    567 → 567
 * - ≥1K <1M:   K 简写，1 位小数             12,847 → 12.8K    2,340 → 2.3K
 * - ≥1M <1B:   M 简写，1 位小数             1,870,000 → 1.9M   999,999 → 1M
 * - ≥1B:       B 简写，2 位小数             1.2e9 → 1.2B
 */
export function fmtNum(n: number): string {
  if (!Number.isFinite(n) || n < 0) n = 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';

  if (abs < 1000) {
    return sign + String(Math.floor(abs));
  }

  // K：保留 1 位小数，但当结果 ≥ 1000K 时进位到 M
  if (abs < 1_000_000) {
    const k = abs / 1000;
    const rounded = Math.round(k * 10) / 10;
    if (rounded >= 1000) {
      // 进位到 M
      const m = rounded / 1000;
      return sign + (m % 1 === 0 ? String(Math.round(m)) : String(+m.toFixed(1))) + 'M';
    }
    return sign + (rounded % 1 === 0 ? String(Math.round(rounded)) : String(rounded)) + 'K';
  }

  // M：保留 1 位小数，当结果 ≥ 1000M 时进位到 B
  if (abs < 1_000_000_000) {
    const m = abs / 1_000_000;
    const rounded = Math.round(m * 10) / 10;
    if (rounded >= 1000) {
      const b = rounded / 1000;
      return sign + (b % 1 === 0 ? String(Math.round(b)) : String(+b.toFixed(2))) + 'B';
    }
    return sign + (rounded % 1 === 0 ? String(Math.round(rounded)) : String(rounded)) + 'M';
  }

  // B：保留 2 位小数
  const b = abs / 1_000_000_000;
  const rounded = Math.round(b * 100) / 100;
  return sign + (rounded % 1 === 0 ? String(Math.round(rounded)) : String(rounded)) + 'B';
}

/** fmtNum 别名（语义化：用于计数类数字，与 fmtNum 等价以便未来差异化） */
export function fmtCount(n: number): string {
  return fmtNum(n);
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

/** 侧边栏标签列表 */
const SIDEBAR_TAGS: string[] = TAG_RANKINGS.map((item) => item.tag);

/** 帖子使用的标签子集（从侧边栏 10 个标签中取 5 个，便于测试筛选效果）
 *  导出供标签详情页判断该标签是否应有帖子，以验证筛选效果 */
export const POST_TAGS: string[] = SIDEBAR_TAGS.slice(0, 5);

/** 基于标题字符 hash 分配标签（确定性，保证 SSR/CSR 一致） */
export function tagForThread(title: string): string {
  let n = 0;
  for (let i = 0; i < title.length; i++) n += title.charCodeAt(i);
  return POST_TAGS[n % POST_TAGS.length];
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
  { id: 1, title: 'GHRANK scoring v4 proposal: community-weighted signals', author: 'AlexShader', avatar: 'A', section: 'Discussions', tag: 'Scoring-Model', replies: 87, views: 3420, timeAgo: '2h', isHot: true, isNew: true, hasPoll: true, likes: 124, liked: false, isOnline: true },
  { id: 2, title: 'Show & Tell: Built a real-time repo monitor with GHRANK API', author: 'kairos', avatar: 'K', section: 'Show & Tell', tag: 'GHRANK-API', replies: 34, views: 1280, timeAgo: '3h', isHot: false, isNew: true, hasPoll: false, likes: 38, liked: false, isOnline: false },
  { id: 3, title: 'Best vector database for production agent pipelines?', author: 'nexusdev', avatar: 'N', section: 'Questions', tag: 'Vector-DB', replies: 56, views: 2100, timeAgo: '4h', isHot: true, isNew: false, hasPoll: false, likes: 67, liked: false, isOnline: true },
  { id: 4, title: 'Tutorial: Fine-tune Llama 4 locally with QLoRA in 30 minutes', author: 'mlcraft', avatar: 'M', section: 'Tutorials', tag: 'LLM-Finetune', replies: 23, views: 1890, timeAgo: '5h', isHot: false, isNew: false, hasPoll: false, likes: 91, liked: false, isOnline: false },
  { id: 5, title: 'The real cost of running open-source AI in production', author: 'voidrunner', avatar: 'V', section: 'Discussions', tag: 'Open-Source', replies: 112, views: 5640, timeAgo: '6h', isHot: true, isNew: false, hasPoll: true, likes: 203, liked: false, isOnline: true },
  { id: 6, title: 'Announcing GHRANK API v3 -- breaking changes and migration guide', author: 'AlexShader', avatar: 'A', section: 'News & Updates', tag: 'GHRANK-API', replies: 41, views: 3200, timeAgo: '8h', isHot: false, isNew: false, hasPoll: false, likes: 156, liked: false, isOnline: false },
  { id: 7, title: 'How I built a CLI tool that ranks my dotfiles', author: 'shellweird', avatar: 'S', section: 'Show & Tell', tag: 'CLI-Tools', replies: 18, views: 720, timeAgo: '10h', isHot: false, isNew: false, hasPoll: false, likes: 22, liked: false, isOnline: true },
  { id: 8, title: 'Why does time-decay weighting use 180 days as the threshold?', author: 'newton_r', avatar: 'N', section: 'Questions', tag: 'Scoring-Model', replies: 29, views: 1100, timeAgo: '12h', isHot: false, isNew: false, hasPoll: false, likes: 45, liked: false, isOnline: false },
  { id: 9, title: 'Dev Log: Building a community-driven scoring model', author: 'mirakade', avatar: 'M', section: 'Dev Logs', tag: 'DevOps', replies: 15, views: 480, timeAgo: '1d', isHot: false, isNew: false, hasPoll: false, likes: 18, liked: false, isOnline: true },
  { id: 10, title: 'Off-Topic: What IDE theme are you using in 2026?', author: 'pixelshift', avatar: 'P', section: 'Off-Topic', tag: 'Tutorial', replies: 64, views: 890, timeAgo: '1d', isHot: true, isNew: false, hasPoll: true, likes: 73, liked: false, isOnline: false },
  { id: 11, title: 'How to contribute to GHRANK -- comprehensive onboarding guide', author: 'jintao', avatar: 'J', section: 'Tutorials', tag: 'Open-Source', replies: 8, views: 340, timeAgo: '2d', isHot: false, isNew: false, hasPoll: false, likes: 12, liked: false, isOnline: true },
  { id: 12, title: 'Comparing RAG frameworks: LlamaIndex vs LangChain vs Haystack', author: 'dataforge', avatar: 'D', section: 'Discussions', tag: 'RAG', replies: 73, views: 4100, timeAgo: '2d', isHot: true, isNew: false, hasPoll: false, likes: 188, liked: false, isOnline: false },
];

/** 基础帖子池（12 条，repliers 已确定性填充，tag 重映射到 POST_TAGS 子集） */
export const BASE_THREADS: Thread[] = RAW_BASE_THREADS.map((t) => ({
  ...t,
  /* 将原始 tag 重映射到 POST_TAGS 子集（确定性，保证 SSR/CSR 一致） */
  tag: tagForThread(t.title),
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
    hasPoll: base.hasPoll,
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

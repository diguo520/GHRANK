/**
 * News 页面数据 —— AI 新闻时间线
 * - DAY_GROUPS：过去 7 天的静态新闻（迁移自 news.html 硬编码数据）
 * - SOURCES + HEADLINES_POOL：实时推送用的标题池与来源域名映射（迁移自 news.js）
 */

/** 新闻分类，决定 accent bar 配色 */
export type NewsCategory =
  | 'release'
  | 'funding'
  | 'research'
  | 'product'
  | 'regulation';

/** 单条新闻 */
export interface NewsItem {
  /** 发布时间，格式 HH:MM */
  time: string;
  /** 来源显示标签，如 OPENAI / HF / X.AI */
  sourceLabel: string;
  /** 来源域名，用于加载 favicon */
  domain: string;
  /** 新闻标题 */
  title: string;
  /** 原文链接 */
  href: string;
  /** 分类，决定 accent bar 颜色 */
  category: NewsCategory;
}

/** 日期分组 */
export interface DayGroup {
  /** 日期标识，对应原始 data-day 属性 */
  day: string;
  /** 日期显示标签，如 TODAY — Jul 24 */
  label: string;
  /** 该日新闻条目 */
  items: NewsItem[];
}

/** favicon 服务前缀（迁移自原始 img src 规则） */
export const FAVICON_PREFIX = 'https://ico.la4.cn/ico.php?url=';

/** 来源 key → 域名映射（实时推送池用，迁移自 news.js SOURCES） */
export const SOURCES: Record<string, string> = {
  ANTHROPIC: 'anthropic.com',
  OPENAI: 'openai.com',
  GOOGLE: 'blog.google',
  META: 'ai.meta.com',
  MICROSOFT: 'blogs.microsoft.com',
  NVIDIA: 'nvidia.com',
  STABILITY: 'stability.ai',
  MISTRAL: 'mistral.ai',
  HUGGINGFACE: 'huggingface.co',
  FIGURE: 'figure.ai',
  APPLE: 'machinelearning.apple.com',
  XAI: 'x.ai',
  GITHUB: 'github.com',
  AMD: 'amd.com',
  TESLA: 'tesla.com',
  PERPLEXITY: 'perplexity.ai',
  SAMSUNG: 'samsung.com',
  MIDJOURNEY: 'midjourney.com',
};

/** 实时推送标题池（迁移自 news.js HEADLINES） */
export const HEADLINES_POOL: { source: string; title: string }[] = [
  { source: 'ANTHROPIC', title: 'Claude 4 Achieves 92% on HumanEval — First Model to Surpass Human Baseline in Code Generation' },
  { source: 'OPENAI', title: "GPT-5 Turbo Now Available via API — 2x Speed at Half the Cost of GPT-4" },
  { source: 'GOOGLE', title: "Google DeepMind's AlphaFold 3 Predicts Protein Interactions at Atomic Resolution" },
  { source: 'META', title: 'Meta Releases SeamlessM4T v2: Real-Time Speech-to-Speech Translation for 100+ Languages' },
  { source: 'MICROSOFT', title: 'Azure AI Launches Copilot Studio — No-Code Agent Builder for Enterprise Workflows' },
  { source: 'NVIDIA', title: 'NVIDIA NeMo 2.0: Open-Source Framework for Custom LLM Fine-Tuning at Scale' },
  { source: 'STABILITY', title: 'Stability AI Unveils Stable Diffusion 4.0 with Real-Time Video Generation' },
  { source: 'MISTRAL', title: 'Mistral AI Releases Mixtral 8x22B: Sparse MoE Model Outperforms GPT-3.5' },
  { source: 'HUGGINGFACE', title: 'HuggingFace Hub Surpasses 1 Million Models — Largest Open ML Repository' },
  { source: 'FIGURE', title: 'Figure 02 Begins Pilot Deployment at BMW Manufacturing Facility' },
  { source: 'APPLE', title: 'Apple Open-Sources MLX 4.0: Unified Framework for On-Device AI Training' },
  { source: 'XAI', title: 'xAI Grok 3 Now Open Source — Released Under Apache 2.0 License' },
  { source: 'GITHUB', title: 'GitHub Copilot Workspace Launches: AI-Powered PR Generation from Issue Descriptions' },
  { source: 'AMD', title: 'AMD Instinct MI400 Accelerator Delivers 2.5x Performance per Watt vs Competition' },
  { source: 'TESLA', title: 'Tesla Optimus Gen 3 Demonstrates Autonomous Fine Manipulation in Factory Trial' },
  { source: 'PERPLEXITY', title: 'Perplexity AI Raises $500M Series D at $8B Valuation for Enterprise Search' },
  { source: 'SAMSUNG', title: 'Samsung Gauss 2: On-Device LLM Achieves GPT-4 Parity on Mobile Benchmarks' },
  { source: 'MIDJOURNEY', title: 'Midjourney 7.0 Adds Video Generation: Text-to-Clip with Consistent Characters' },
  { source: 'ANTHROPIC', title: 'Claude API Now Supports 200K Token Context Window for Enterprise Customers' },
  { source: 'OPENAI', title: 'OpenAI Launches GPT Store Payouts: Creators Earn 70% of Subscription Revenue' },
  { source: 'GOOGLE', title: 'Google Gemini Pro 2.0 Beats GPT-4 on MMLU-Pro with 96.7% Accuracy' },
  { source: 'META', title: 'Meta AI Researchers Introduce Self-Rewarding LLMs That Improve Through Self-Play' },
  { source: 'MICROSOFT', title: 'Microsoft Phi-4 14B: Small Language Model Outperforms 70B-Class Models on Coding Tasks' },
  { source: 'NVIDIA', title: 'NVIDIA Digital Twin Platform Powers Full Autonomous Factory Simulation' },
];

/** 过去 7 天静态新闻分组（迁移自 news.html） */
export const DAY_GROUPS: DayGroup[] = [
  {
    day: 'today',
    label: 'TODAY — Jul 24',
    items: [
      { time: '12:34', sourceLabel: 'OPENAI', domain: 'openai.com', category: 'release', href: 'https://openai.com/blog/gpt-5-real-time-reasoning', title: 'OpenAI Unveils GPT-5: Real-Time Reasoning, 1M Token Context, and Native Tool Use' },
      { time: '11:50', sourceLabel: 'DEEPMIND', domain: 'deepmind.google', category: 'research', href: 'https://deepmind.google/discover/blog/gemini-ultra-2', title: 'DeepMind Gemini Ultra 2 Achieves Human-Level Performance on Graduate-Level Reasoning' },
      { time: '10:22', sourceLabel: 'META', domain: 'ai.meta.com', category: 'release', href: 'https://ai.meta.com/blog/llama-4-400b-open-source', title: 'Meta Open-Sources Llama 4 400B: Largest Open-Weight Model with Mixture-of-Experts' },
      { time: '09:15', sourceLabel: 'NVIDIA', domain: 'nvidia.com', category: 'product', href: 'https://nvidia.com/en-us/data-center/blackwell-b200-shipping', title: 'NVIDIA Blackwell B200 GPU Ships to Cloud Providers — 4x Training Throughput Over H100' },
      { time: '08:01', sourceLabel: 'HF', domain: 'huggingface.co', category: 'release', href: 'https://huggingface.co/blog/smolvlm-2-edge', title: 'HuggingFace Launches SmolVLM-2: Efficient Vision-Language Model for Edge Deployment' },
      { time: '07:30', sourceLabel: 'FIGURE', domain: 'figure.ai', category: 'product', href: 'https://figure.ai/blog/02-humanoid-94-percent', title: 'Figure 02 Humanoid Robot Achieves 94% Task Completion Rate in Unstructured Environments' },
    ],
  },
  {
    day: 'yesterday',
    label: 'YESTERDAY — Jul 23',
    items: [
      { time: '18:45', sourceLabel: 'ANTHROPIC', domain: 'anthropic.com', category: 'research', href: 'https://anthropic.com/news/claude-4-swe-bench-sota', title: 'Anthropic Claude 4 Sets New SOTA on SWE-bench and HumanEval Coding Benchmarks' },
      { time: '16:20', sourceLabel: 'MISTRAL', domain: 'mistral.ai', category: 'funding', href: 'https://mistral.ai/news/series-c-2-billion', title: 'Mistral AI Secures $2B Series C — Largest European AI Funding Round to Date' },
      { time: '14:10', sourceLabel: 'EU', domain: 'europa.eu', category: 'regulation', href: 'https://digital-strategy.ec.europa.eu/en/policies/ai-act-enforcement', title: 'EU AI Act Enforcement Begins: What Companies Need to Know About Compliance Deadlines' },
      { time: '11:30', sourceLabel: 'X.AI', domain: 'x.ai', category: 'release', href: 'https://x.ai/blog/grok-3-multimodal', title: 'xAI Grok-3 Launches with Native Multimodal Capabilities and Real-Time Search' },
      { time: '09:55', sourceLabel: 'OPENAI', domain: 'openai.com', category: 'release', href: 'https://openai.com/blog/dall-e-4-video-generation', title: 'OpenAI DALL-E 4 Introduces Photorealistic Video Generation from Text Prompts' },
    ],
  },
  {
    day: 'd-2',
    label: 'JUL 22',
    items: [
      { time: '20:15', sourceLabel: 'STABILITY', domain: 'stability.ai', category: 'release', href: 'https://stability.ai/news/stable-diffusion-4-release', title: 'Stability AI Releases Stable Diffusion 4 with Real-Time Consistency and 4K Output' },
      { time: '15:40', sourceLabel: 'GITHUB', domain: 'github.com', category: 'product', href: 'https://github.com/features/copilot/copilot-x-autonomous', title: 'GitHub Copilot X Now Supports Autonomous Multi-File Code Generation Across Repositories' },
      { time: '12:00', sourceLabel: 'ARXIV', domain: 'arxiv.org', category: 'research', href: 'https://arxiv.org/abs/2407.12345', title: 'New Attention Mechanism "FlashAttention 3" Achieves 2x Speedup on H100 GPUs' },
    ],
  },
  {
    day: 'd-3',
    label: 'JUL 21',
    items: [
      { time: '22:30', sourceLabel: 'TESLA', domain: 'tesla.com', category: 'product', href: 'https://tesla.com/optimus/gen-3-factory-pilot', title: 'Tesla Optimus Gen 3 Begins Factory Pilot Program with 50 Units at Fremont Plant' },
      { time: '17:10', sourceLabel: 'COHERE', domain: 'cohere.com', category: 'research', href: 'https://cohere.com/blog/command-r-plus-rag-benchmarks', title: 'Cohere Command R+ Surpasses GPT-4 on RAG Benchmarks — Open-Weights Available' },
      { time: '10:45', sourceLabel: 'MS', domain: 'microsoft.com', category: 'product', href: 'https://azure.microsoft.com/en-us/blog/ai-supercomputer-100k-h100', title: 'Microsoft Azure Launches AI Supercomputer with 100K H100 GPUs for Enterprise Training' },
    ],
  },
  {
    day: 'd-4',
    label: 'JUL 20',
    items: [
      { time: '19:00', sourceLabel: 'DEEPSEEK', domain: 'deepseek.com', category: 'research', href: 'https://deepseek.com/technical-report-v3-2025', title: 'DeepSeek-V3 Technical Report: 671B MoE Model Trained for $5.5M — Full Architecture Details' },
      { time: '14:20', sourceLabel: 'ANTHROPIC', domain: 'anthropic.com', category: 'regulation', href: 'https://anthropic.com/news/ai-safety-summit-2025-framework', title: 'AI Safety Summit 2025: 28 Nations Agree on Frontier Model Evaluation Framework' },
    ],
  },
  {
    day: 'd-5',
    label: 'JUL 19',
    items: [
      { time: '16:30', sourceLabel: 'GOOGLE', domain: 'google.com', category: 'funding', href: 'https://blog.google/technology/ai/tpu-v6-3x-h100', title: 'Google Invests $10B in Custom TPU v6 Chip — Claims 3x Performance Over NVIDIA H100' },
      { time: '08:15', sourceLabel: 'HF', domain: 'huggingface.co', category: 'research', href: 'https://huggingface.co/blog/llama-4-code-review-finetune', title: 'Community Fine-Tunes Llama 4 8B for Code Review — Outperforms Claude 3.5 Sonnet on HumanEval' },
    ],
  },
  {
    day: 'd-6',
    label: 'JUL 18 — 7 DAYS AGO',
    items: [
      { time: '21:00', sourceLabel: 'OPENAI', domain: 'openai.com', category: 'funding', href: 'https://openai.com/blog/openai-acquires-rockset', title: 'OpenAI Acquires Rockset for $200M to Bolster Real-Time Enterprise Data Retrieval' },
      { time: '14:30', sourceLabel: 'ARXIV', domain: 'arxiv.org', category: 'research', href: 'https://arxiv.org/abs/2407.09876', title: 'Apple MM1: New Multimodal Large Language Model Architecture for On-Device Understanding' },
    ],
  },
];

/** 格式化当前时间为 HH:MM */
export function formatNow(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * 构建实时推送条目：从来源 key 与标题生成完整 NewsItem
 * 时间取当前时刻，分类固定为 release（与原始 news.js 行为一致）
 */
export function buildFlashItem(source: string, title: string): NewsItem {
  const domain = SOURCES[source] ?? 'news.ycombinator.com';
  return {
    time: formatNow(),
    sourceLabel: source,
    domain,
    title,
    href: '#',
    category: 'release',
  };
}

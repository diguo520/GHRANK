/**
 * Prompt 列表页数据 —— 静态卡片目录 + 筛选/排序配置
 * 迁移自 prompt-list.html 的 24 张卡片与侧栏筛选项
 *
 * 注意：此处的 AI 模型分类（GPT-4/Claude/Midjourney...）与 prompt-data.ts 的
 * 模型分类（image/animation/video...）是两套不同的维度，列表页使用本文件的定义。
 * 图片路径统一使用 Next.js public 目录格式：/images/demo/prompt_N.jpg
 */

/* ═══ 类型定义 ═══ */

/** AI 模型标识（决定标签配色） */
export type AIModel =
  | 'gpt4'
  | 'claude'
  | 'midjourney'
  | 'dalle'
  | 'sd'
  | 'llama'
  | 'gemini'
  | 'custom';

/** 列表页卡片数据 */
export interface PromptListItem {
  id: number;
  /** AI 模型标识 */
  model: AIModel;
  /** 模型显示名 */
  modelLabel: string;
  /** 标题 */
  title: string;
  /** 描述 */
  snippet: string;
  /** 星级 1-5 */
  stars: number;
  /** 价格字符串，如 "$4.99" */
  price: string;
  /** 缩略图路径 */
  img: string;
  /** 渐变叠层序号 1-12 */
  grad: number;
  /** 所属分类（用于 Category 筛选） */
  category: string;
}

/** 复选框筛选项 */
export interface CheckboxFilter {
  /** 标识 */
  value: string;
  /** 显示名 */
  label: string;
  /** 数量 */
  count: number;
}

/** 排序选项 */
export interface SortOption {
  value: string;
  label: string;
}

/* ═══ 模型标签配色映射 ═══ */

/** 模型 → 标签内联样式（颜色/背景/边框） */
export const MODEL_TAG_STYLES: Record<AIModel, { color: string; bg: string; border: string }> = {
  gpt4: { color: 'var(--green)', bg: 'rgba(63, 185, 80, 0.12)', border: 'rgba(63, 185, 80, 0.5)' },
  claude: { color: 'var(--orange)', bg: 'rgba(232, 93, 4, 0.12)', border: 'rgba(232, 93, 4, 0.5)' },
  midjourney: { color: 'var(--cyan)', bg: 'rgba(57, 210, 192, 0.12)', border: 'rgba(57, 210, 192, 0.5)' },
  dalle: { color: 'var(--purple)', bg: 'rgba(163, 113, 247, 0.12)', border: 'rgba(163, 113, 247, 0.5)' },
  sd: { color: '#f778ba', bg: 'rgba(247, 120, 186, 0.12)', border: 'rgba(247, 120, 186, 0.5)' },
  llama: { color: 'var(--gold)', bg: 'rgba(245, 197, 24, 0.12)', border: 'rgba(245, 197, 24, 0.35)' },
  gemini: { color: '#58a6ff', bg: 'rgba(88, 166, 255, 0.12)', border: 'rgba(88, 166, 255, 0.5)' },
  custom: { color: 'var(--text-dim)', bg: 'var(--bg)', border: 'var(--border)' },
};

/* ═══ 筛选配置 ═══ */

/** AI 模型筛选项 */
export const AI_MODEL_FILTERS: CheckboxFilter[] = [
  { value: 'gpt4', label: 'GPT-4', count: 3241 },
  { value: 'claude', label: 'Claude', count: 1876 },
  { value: 'midjourney', label: 'Midjourney', count: 2108 },
  { value: 'dalle', label: 'DALL-E 3', count: 1523 },
  { value: 'sd', label: 'Stable Diffusion', count: 1287 },
  { value: 'llama', label: 'Llama 3', count: 942 },
  { value: 'gemini', label: 'Gemini', count: 764 },
  { value: 'custom', label: 'Custom', count: 1105 },
];

/** 分类筛选项 */
export const CATEGORY_FILTERS: CheckboxFilter[] = [
  { value: 'code-dev', label: 'Code & Dev', count: 2841 },
  { value: 'writing', label: 'Writing', count: 1976 },
  { value: 'image-gen', label: 'Image Gen', count: 3108 },
  { value: 'marketing', label: 'Marketing', count: 1523 },
  { value: 'data-analytics', label: 'Data & Analytics', count: 1287 },
  { value: 'education', label: 'Education', count: 942 },
];

/** 最低评分选项 */
export const RATING_OPTIONS: SortOption[] = [
  { value: 'all', label: 'All Ratings' },
  { value: '4', label: '4 Stars & Up' },
  { value: '3', label: '3 Stars & Up' },
  { value: '2', label: '2 Stars & Up' },
];

/** 排序选项 */
export const SORT_OPTIONS: SortOption[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rated', label: 'Highest Rated' },
];

/** 总数展示文案 */
export const TOTAL_PROMPTS = 12487;

/* ═══ 24 张卡片数据（与 prompt-list.html 一一对应） ═══ */

export const PROMPT_LIST_ITEMS: PromptListItem[] = [
  { id: 1, model: 'midjourney', modelLabel: 'Midjourney', title: 'Cinematic Portrait Generator', snippet: 'Photorealistic portraits with dramatic lighting and bokeh.', stars: 5, price: '$4.99', img: '/images/demo/prompt_1.jpg', grad: 2, category: 'image-gen' },
  { id: 2, model: 'gpt4', modelLabel: 'GPT-4', title: 'Code Review Assistant v3', snippet: 'Advanced code quality, security and performance analysis.', stars: 5, price: '$9.99', img: '/images/demo/prompt_2.jpg', grad: 5, category: 'code-dev' },
  { id: 3, model: 'claude', modelLabel: 'Claude', title: 'Marketing Copy Writer', snippet: 'High-converting copy for landing pages and campaigns.', stars: 4, price: '$6.99', img: '/images/demo/prompt_3.jpg', grad: 10, category: 'marketing' },
  { id: 4, model: 'dalle', modelLabel: 'DALL-E 3', title: 'Product Mockup Creator', snippet: 'Professional product mockups with custom backgrounds.', stars: 5, price: '$7.49', img: '/images/demo/prompt_4.jpg', grad: 1, category: 'image-gen' },
  { id: 5, model: 'sd', modelLabel: 'Stable Diffusion', title: 'Anime Character Designer', snippet: 'Detailed anime characters with vibrant color palettes.', stars: 4, price: '$3.99', img: '/images/demo/prompt_5.jpg', grad: 7, category: 'image-gen' },
  { id: 6, model: 'gpt4', modelLabel: 'GPT-4', title: 'SQL Query Architect', snippet: 'Natural language to optimized SQL with join strategies.', stars: 5, price: '$8.49', img: '/images/demo/prompt_6.jpg', grad: 3, category: 'data-analytics' },
  { id: 7, model: 'llama', modelLabel: 'Llama 3', title: 'Technical Doc Writer', snippet: 'Generate API references and architecture records.', stars: 4, price: '$5.99', img: '/images/demo/prompt_7.jpg', grad: 9, category: 'writing' },
  { id: 8, model: 'gemini', modelLabel: 'Gemini', title: 'Data Analysis Copilot', snippet: 'Analyze datasets and generate statistical reports.', stars: 5, price: '$11.99', img: '/images/demo/prompt_8.jpg', grad: 8, category: 'data-analytics' },
  { id: 9, model: 'custom', modelLabel: 'Custom', title: 'API Documentation Gen', snippet: 'Auto-generate OpenAPI specs from code comments.', stars: 5, price: '$7.99', img: '/images/demo/prompt_9.jpg', grad: 4, category: 'code-dev' },
  { id: 10, model: 'midjourney', modelLabel: 'Midjourney', title: 'Cyberpunk Cityscape', snippet: 'Neon-lit dystopian cityscapes with rain reflections.', stars: 5, price: '$2.99', img: '/images/demo/prompt_10.jpg', grad: 6, category: 'image-gen' },
  { id: 11, model: 'gpt4', modelLabel: 'GPT-4', title: 'Bug Bounty Hunter', snippet: 'AI-assisted vulnerability discovery and analysis.', stars: 4, price: '$14.99', img: '/images/demo/prompt_11.jpg', grad: 11, category: 'code-dev' },
  { id: 12, model: 'claude', modelLabel: 'Claude', title: 'Research Paper Summarizer', snippet: 'Condense academic papers into key findings.', stars: 5, price: '$5.49', img: '/images/demo/prompt_12.jpg', grad: 2, category: 'education' },
  { id: 13, model: 'dalle', modelLabel: 'DALL-E 3', title: 'Logo Concept Generator', snippet: 'Unique logo concepts with brand identity focus.', stars: 4, price: '$6.49', img: '/images/demo/prompt_13.jpg', grad: 12, category: 'marketing' },
  { id: 14, model: 'sd', modelLabel: 'Stable Diffusion', title: 'Fantasy Landscape Forge', snippet: 'Epic fantasy environments with magical atmospheres.', stars: 5, price: '$3.49', img: '/images/demo/prompt_14.jpg', grad: 5, category: 'image-gen' },
  { id: 15, model: 'llama', modelLabel: 'Llama 3', title: 'Regex Pattern Builder', snippet: 'Generate and explain complex regex patterns.', stars: 4, price: '$2.49', img: '/images/demo/prompt_15.jpg', grad: 9, category: 'code-dev' },
  { id: 16, model: 'gpt4', modelLabel: 'GPT-4', title: 'UX Research Interviewer', snippet: 'Generate user research questions and scripts.', stars: 5, price: '$8.99', img: '/images/demo/prompt_16.jpg', grad: 3, category: 'writing' },
  { id: 17, model: 'gemini', modelLabel: 'Gemini', title: 'Email Sequence Builder', snippet: 'Automated email funnels with personalization tokens.', stars: 4, price: '$4.49', img: '/images/demo/prompt_17.jpg', grad: 1, category: 'marketing' },
  { id: 18, model: 'midjourney', modelLabel: 'Midjourney', title: 'Watercolor Style Transfer', snippet: 'Transform photos into delicate watercolor paintings.', stars: 5, price: '$5.99', img: '/images/demo/prompt_18.jpg', grad: 8, category: 'image-gen' },
  { id: 19, model: 'claude', modelLabel: 'Claude', title: 'Legal Document Analyzer', snippet: 'Parse contracts and identify risk clauses efficiently.', stars: 5, price: '$12.99', img: '/images/demo/prompt_19.jpg', grad: 10, category: 'writing' },
  { id: 20, model: 'gpt4', modelLabel: 'GPT-4', title: 'Startup Pitch Deck Writer', snippet: 'Generate investor-ready pitch deck narratives.', stars: 4, price: '$9.49', img: '/images/demo/prompt_20.jpg', grad: 7, category: 'marketing' },
  { id: 21, model: 'dalle', modelLabel: 'DALL-E 3', title: 'Isometric Room Designer', snippet: 'Create isometric room illustrations with furniture.', stars: 5, price: '$6.99', img: '/images/demo/prompt_1.jpg', grad: 4, category: 'image-gen' },
  { id: 22, model: 'sd', modelLabel: 'Stable Diffusion', title: 'Negative Prompt Master', snippet: 'Comprehensive negative prompts for clean outputs.', stars: 5, price: '$1.99', img: '/images/demo/prompt_2.jpg', grad: 11, category: 'image-gen' },
  { id: 23, model: 'gpt4', modelLabel: 'GPT-4', title: 'Meeting Minutes Generator', snippet: 'Transform meeting notes into structured summaries.', stars: 4, price: '$3.99', img: '/images/demo/prompt_3.jpg', grad: 12, category: 'writing' },
  { id: 24, model: 'custom', modelLabel: 'Custom', title: 'YouTube Script Generator', snippet: 'Generate engaging video scripts with hooks and CTAs.', stars: 5, price: '$7.49', img: '/images/demo/prompt_4.jpg', grad: 6, category: 'marketing' },
];

/* ═══ 渐变叠层样式（grad-1 ~ grad-12） ═══ */

export const GRADIENT_STYLES: Record<number, string> = {
  1: 'linear-gradient(135deg, rgba(245,197,24,0.4), transparent)',
  2: 'linear-gradient(135deg, rgba(57,210,192,0.4), transparent)',
  3: 'linear-gradient(135deg, rgba(63,185,80,0.4), transparent)',
  4: 'linear-gradient(135deg, rgba(232,93,4,0.4), transparent)',
  5: 'linear-gradient(135deg, rgba(163,113,247,0.4), transparent)',
  6: 'linear-gradient(135deg, rgba(247,120,186,0.4), transparent)',
  7: 'linear-gradient(135deg, rgba(245,197,24,0.3), rgba(57,210,192,0.3))',
  8: 'linear-gradient(135deg, rgba(232,93,4,0.3), rgba(163,113,247,0.3))',
  9: 'linear-gradient(135deg, rgba(57,210,192,0.3), rgba(247,120,186,0.3))',
  10: 'linear-gradient(135deg, rgba(63,185,80,0.35), transparent)',
  11: 'linear-gradient(135deg, rgba(163,113,247,0.35), transparent)',
  12: 'linear-gradient(135deg, rgba(247,120,186,0.35), transparent)',
};

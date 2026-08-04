/**
 * skills-data.ts —— GHRANK Skills Market 数据层
 * 从 skills-data.js 迁移，保留 seeded random 数据生成逻辑
 * 提供 skill / owner / category / occupation 的本地 mock 数据
 */

/* ═══════════════════════════════════════════════════════════════
   类型定义
   ═══════════════════════════════════════════════════════════════ */

/** 排序模式 */
export type SortMode = 'allTime' | 'trending' | 'hot';

/** 技能评论 */
export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  body: string;
  date: string;
}

/** 技能 */
export interface Skill {
  id: string;
  name: string;
  owner: string;
  repo: string;
  category: string[];
  tags: string[];
  description: string;
  /** 领域（顶级分类） */
  domain: string;
  /** 子分类 */
  subcategory: string;
  /** 职业（SOC 分类） */
  occupation: string;
  installCmd: string;
  installs: number;
  installsFormatted: string;
  /** 8 周活跃度 */
  activity8w: number;
  /** 趋势排名（1-500，越小越热） */
  trendingRank: number;
  sparkline: number[];
  readme: string;
  version: string;
  rating: number;
  reviewCount: number;
  updatedAt: string;
  reviews: Review[];
}

/** 技能创作者 */
export interface Owner {
  id: string;
  name: string;
  avatar: string;
  totalInstalls: number;
  skills: string[];
}

/** 扁平分类 */
export interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

/** 分类树子节点 */
export interface CategoryChild {
  id: string;
  name: string;
  nameEn: string;
  count: number;
}

/** 分类树顶级节点 */
export interface CategoryTreeNode extends CategoryChild {
  color: string;
  icon: string;
  children: CategoryChild[];
}

/** 职业分类 */
export interface Occupation {
  id: string;
  name: string;
  nameEn: string;
  count: number;
}

/* ═══════════════════════════════════════════════════════════════
   内部类型
   ═══════════════════════════════════════════════════════════════ */

/** 技能定义（生成前的原始数据） */
interface SkillDef {
  owner: string;
  name: string;
  desc: string;
  cat: string;
  tags: string[];
  domain?: string;
  subcategory?: string;
  occupation?: string;
}

/** cat → domain / subcategory / occupation 映射 */
interface CatMapping {
  domain: string;
  subcategory: string;
  occupation: string;
}

/* ═══════════════════════════════════════════════════════════════
   静态数据
   ═══════════════════════════════════════════════════════════════ */

const CATEGORIES: Category[] = [
  { id: 'frontend', name: 'Frontend', color: 'cyan', count: 1247 },
  { id: 'backend', name: 'Backend', color: 'green', count: 982 },
  { id: 'data-viz', name: 'Data Viz', color: 'purple', count: 643 },
  { id: 'cloud', name: 'Cloud', color: 'orange', count: 756 },
  { id: 'automation', name: 'Automation', color: 'pink', count: 891 },
  { id: 'agent', name: 'Agent', color: 'gold', count: 1103 },
  { id: 'design', name: 'Design', color: 'cyan', count: 528 },
  { id: 'docs', name: 'Docs', color: 'green', count: 415 },
];

/** 职业分类（SOC 标准） */
const OCCUPATIONS: Occupation[] = [
  { id: 'computer-math', name: '计算机与数学类', nameEn: 'Computer & Math', count: 657455 },
  { id: 'business-finance', name: '商业与金融运营类', nameEn: 'Business & Finance', count: 93018 },
  { id: 'arts-design-media', name: '艺术、设计与媒体类', nameEn: 'Arts, Design & Media', count: 46595 },
  { id: 'management', name: '管理类', nameEn: 'Management', count: 10799 },
  { id: 'architecture-engineering', name: '建筑与工程类', nameEn: 'Architecture & Engineering', count: 5111 },
  { id: 'education-library', name: '教育与图书馆类', nameEn: 'Education & Library', count: 11461 },
  { id: 'legal', name: '法律类', nameEn: 'Legal', count: 5587 },
  { id: 'sales', name: '销售及相关类', nameEn: 'Sales', count: 4499 },
];

/** cat → 三维分类映射表（无显式声明时的回退） */
const CAT_MAPPING: Record<string, CatMapping> = {
  'frontend': { domain: 'development', subcategory: 'frontend', occupation: 'computer-math' },
  'backend': { domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  'data-viz': { domain: 'data-ai', subcategory: 'data-analysis', occupation: 'computer-math' },
  'cloud': { domain: 'devops', subcategory: 'cloud', occupation: 'computer-math' },
  'automation': { domain: 'tools', subcategory: 'automation-tools', occupation: 'computer-math' },
  'agent': { domain: 'data-ai', subcategory: 'llm-ai', occupation: 'computer-math' },
  'design': { domain: 'content-media', subcategory: 'design', occupation: 'arts-design-media' },
  'docs': { domain: 'documentation', subcategory: 'technical-docs', occupation: 'education-library' },
};

/** 分类树（两级结构：顶级领域 + 子分类） */
const CATEGORY_TREE: CategoryTreeNode[] = [
  {
    id: 'development', name: '开发', nameEn: 'Development',
    color: 'cyan', icon: 'DEV', count: 7448,
    children: [
      { id: 'architecture-patterns', name: '架构模式', nameEn: 'Architecture Patterns', count: 5720 },
      { id: 'cms-platforms', name: 'CMS 平台', nameEn: 'CMS Platforms', count: 4748 },
      { id: 'full-stack', name: '全栈开发', nameEn: 'Full Stack', count: 4208 },
      { id: 'mobile', name: '移动开发', nameEn: 'Mobile', count: 3738 },
      { id: 'scripting', name: '脚本编程', nameEn: 'Scripting', count: 3217 },
      { id: 'frontend', name: '前端开发', nameEn: 'Frontend', count: 3143 },
      { id: 'ecommerce-development', name: '电商开发', nameEn: 'E-commerce', count: 3049 },
      { id: 'framework-internals', name: '框架内核开发', nameEn: 'Framework Internals', count: 2769 },
      { id: 'gaming', name: '游戏开发', nameEn: 'Gaming', count: 2717 },
      { id: 'backend', name: '后端开发', nameEn: 'Backend', count: 2098 },
      { id: 'package-distribution', name: '包管理与发布', nameEn: 'Package Distribution', count: 1072 },
    ],
  },
  {
    id: 'tools', name: '工具', nameEn: 'Tools',
    color: 'green', icon: 'TOL', count: 6678,
    children: [
      { id: 'productivity-tools', name: '生产力工具', nameEn: 'Productivity Tools', count: 5562 },
      { id: 'automation-tools', name: '自动化工具', nameEn: 'Automation Tools', count: 5138 },
      { id: 'system-admin', name: '系统管理', nameEn: 'System Admin', count: 4984 },
      { id: 'debugging', name: '调试工具', nameEn: 'Debugging', count: 4702 },
      { id: 'ide-plugins', name: 'IDE 插件', nameEn: 'IDE Plugins', count: 3782 },
      { id: 'cli-tools', name: '命令行工具', nameEn: 'CLI Tools', count: 2632 },
      { id: 'domain-utilities', name: '域名与 DNS 工具', nameEn: 'Domain Utilities', count: 1414 },
    ],
  },
  {
    id: 'data-ai', name: '数据与 AI', nameEn: 'Data & AI',
    color: 'purple', icon: 'AI', count: 4333,
    children: [
      { id: 'llm-ai', name: 'LLM 与 AI', nameEn: 'LLM & AI', count: 4033 },
      { id: 'machine-learning', name: '机器学习', nameEn: 'Machine Learning', count: 2799 },
      { id: 'data-analysis', name: '数据分析', nameEn: 'Data Analysis', count: 2595 },
      { id: 'data-engineering', name: '数据工程', nameEn: 'Data Engineering', count: 2416 },
    ],
  },
  {
    id: 'business', name: '商业', nameEn: 'Business',
    color: 'orange', icon: 'BIZ', count: 3585,
    children: [
      { id: 'project-management', name: '项目管理', nameEn: 'Project Management', count: 3349 },
      { id: 'sales-marketing', name: '销售与营销', nameEn: 'Sales & Marketing', count: 3309 },
      { id: 'finance-investment', name: '金融与投资', nameEn: 'Finance & Investment', count: 2869 },
      { id: 'health-fitness', name: '健康健身', nameEn: 'Health & Fitness', count: 2829 },
      { id: 'business-apps', name: '商业应用', nameEn: 'Business Apps', count: 2239 },
      { id: 'real-estate-legal', name: '房产与法律', nameEn: 'Real Estate & Legal', count: 2005 },
      { id: 'ecommerce', name: '电子商务', nameEn: 'E-commerce', count: 659 },
      { id: 'payment', name: '支付', nameEn: 'Payment', count: 98 },
    ],
  },
  {
    id: 'devops', name: 'DevOps', nameEn: 'DevOps',
    color: 'pink', icon: 'OPS', count: 3426,
    children: [
      { id: 'cicd', name: 'CI/CD', nameEn: 'CI/CD', count: 3073 },
      { id: 'git-workflows', name: 'Git 工作流', nameEn: 'Git Workflows', count: 2635 },
      { id: 'containers', name: '容器', nameEn: 'Containers', count: 1631 },
      { id: 'cloud', name: '云平台', nameEn: 'Cloud', count: 1627 },
      { id: 'monitoring', name: '监控', nameEn: 'Monitoring', count: 1589 },
    ],
  },
  {
    id: 'testing-security', name: '测试与安全', nameEn: 'Testing & Security',
    color: 'gold', icon: 'SEC', count: 2218,
    children: [
      { id: 'testing', name: '测试', nameEn: 'Testing', count: 1602 },
      { id: 'code-quality', name: '代码质量', nameEn: 'Code Quality', count: 1348 },
      { id: 'security', name: '安全', nameEn: 'Security', count: 1032 },
    ],
  },
  {
    id: 'documentation', name: '文档', nameEn: 'Documentation',
    color: 'cyan', icon: 'DOC', count: 1758,
    children: [
      { id: 'knowledge-base', name: '知识库', nameEn: 'Knowledge Base', count: 1682 },
      { id: 'education', name: '教育', nameEn: 'Education', count: 1589 },
      { id: 'technical-docs', name: '技术文档', nameEn: 'Technical Docs', count: 1343 },
    ],
  },
  {
    id: 'content-media', name: '内容与媒体', nameEn: 'Content & Media',
    color: 'green', icon: 'MED', count: 1606,
    children: [
      { id: 'content-creation', name: '内容创作', nameEn: 'Content Creation', count: 1428 },
      { id: 'documents', name: '文档处理', nameEn: 'Documents', count: 1213 },
      { id: 'design', name: '设计', nameEn: 'Design', count: 720 },
      { id: 'media', name: '媒体处理', nameEn: 'Media', count: 416 },
    ],
  },
  {
    id: 'lifestyle', name: '生活方式', nameEn: 'Lifestyle',
    color: 'pink', icon: 'LIF', count: 1273,
    children: [
      { id: 'divination-mysticism', name: '占卜与玄学', nameEn: 'Divination & Mysticism', count: 1175 },
      { id: 'literature-writing', name: '文学与写作', nameEn: 'Literature & Writing', count: 1148 },
      { id: 'philosophy-ethics', name: '哲学与伦理', nameEn: 'Philosophy & Ethics', count: 1130 },
      { id: 'wellness-health', name: '健康养生', nameEn: 'Wellness & Health', count: 1113 },
      { id: 'culinary-arts', name: '烹饪艺术', nameEn: 'Culinary Arts', count: 1111 },
      { id: 'arts-crafts', name: '艺术与手工', nameEn: 'Arts & Crafts', count: 1100 },
    ],
  },
  {
    id: 'research', name: '研究', nameEn: 'Research',
    color: 'purple', icon: 'RES', count: 787,
    children: [
      { id: 'scientific-computing', name: '科学计算', nameEn: 'Scientific Computing', count: 671 },
      { id: 'computational-chemistry', name: '计算化学', nameEn: 'Computational Chemistry', count: 638 },
      { id: 'academic', name: '学术研究', nameEn: 'Academic', count: 612 },
      { id: 'bioinformatics', name: '生物信息学', nameEn: 'Bioinformatics', count: 592 },
      { id: 'astronomy-physics', name: '天文物理', nameEn: 'Astronomy & Physics', count: 416 },
      { id: 'lab-tools', name: '实验室工具', nameEn: 'Lab Tools', count: 315 },
    ],
  },
  {
    id: 'databases', name: '数据库', nameEn: 'Databases',
    color: 'orange', icon: 'DB', count: 486,
    children: [
      { id: 'sql-databases', name: 'SQL 数据库', nameEn: 'SQL Databases', count: 456 },
      { id: 'database-tools', name: '数据库工具', nameEn: 'Database Tools', count: 411 },
      { id: 'nosql-databases', name: 'NoSQL 数据库', nameEn: 'NoSQL Databases', count: 333 },
    ],
  },
  {
    id: 'blockchain', name: '区块链', nameEn: 'Blockchain',
    color: 'gold', icon: 'BC', count: 110,
    children: [
      { id: 'web3-tools', name: 'Web3 工具', nameEn: 'Web3 Tools', count: 102 },
      { id: 'defi', name: 'DeFi', nameEn: 'DeFi', count: 100 },
      { id: 'smart-contracts', name: '智能合约', nameEn: 'Smart Contracts', count: 100 },
    ],
  },
];

const OWNERS: Owner[] = [
  { id: 'anthropics', name: 'Anthropics', avatar: 'A', totalInstalls: 0, skills: [] },
  { id: 'vercel-labs', name: 'Vercel Labs', avatar: 'V', totalInstalls: 0, skills: [] },
  { id: 'mattpocock', name: 'Matt Pocock', avatar: 'M', totalInstalls: 0, skills: [] },
  { id: 'karpathy', name: 'Andrej Karpathy', avatar: 'K', totalInstalls: 0, skills: [] },
  { id: 'transitions-dev', name: 'Transitions.dev', avatar: 'T', totalInstalls: 0, skills: [] },
  { id: 'obra', name: 'Obra', avatar: 'O', totalInstalls: 0, skills: [] },
  { id: 'bytedance', name: 'ByteDance', avatar: 'B', totalInstalls: 0, skills: [] },
  { id: 'browser-use', name: 'Browser Use', avatar: 'BU', totalInstalls: 0, skills: [] },
  { id: 'microsoft', name: 'Microsoft', avatar: 'MS', totalInstalls: 0, skills: [] },
  { id: 'remotion-dev', name: 'Remotion', avatar: 'R', totalInstalls: 0, skills: [] },
  { id: 'runcomfy', name: 'RunComfy', avatar: 'RC', totalInstalls: 0, skills: [] },
  { id: 'lark', name: 'Lark', avatar: 'L', totalInstalls: 0, skills: [] },
  { id: 'cloudflare', name: 'Cloudflare', avatar: 'CF', totalInstalls: 0, skills: [] },
  { id: 'supabase', name: 'Supabase', avatar: 'S', totalInstalls: 0, skills: [] },
  { id: 'stripe', name: 'Stripe', avatar: 'ST', totalInstalls: 0, skills: [] },
  { id: 'zotero', name: 'Zotero', avatar: 'Z', totalInstalls: 0, skills: [] },
  { id: 'atlassian', name: 'Atlassian', avatar: 'AT', totalInstalls: 0, skills: [] },
  { id: 'snyk', name: 'Snyk', avatar: 'SN', totalInstalls: 0, skills: [] },
  { id: 'openzeppelin', name: 'OpenZeppelin', avatar: 'OZ', totalInstalls: 0, skills: [] },
];

const TAGS = ['agent', 'ui', 'video', 'docs', 'cloud', 'testing', 'automation', 'data'];

/* ═══════════════════════════════════════════════════════════════
   技能定义（SKILL_DEFS）
   每项含 owner / name / desc / cat / tags
   部分项显式声明 domain / subcategory / occupation
   ═══════════════════════════════════════════════════════════════ */

const SKILL_DEFS: SkillDef[] = [
  // ── Anthropic ──
  { owner: 'anthropics', name: 'claude-code', desc: 'Claude Code agent for pair programming and codebase navigation.', cat: 'agent', tags: ['agent', 'automation'] },
  { owner: 'anthropics', name: 'computer-use', desc: 'Control desktop applications via visual grounding.', cat: 'automation', tags: ['agent', 'automation'] },
  { owner: 'anthropics', name: 'context-engine', desc: 'Smart context window management for long conversations.', cat: 'agent', tags: ['agent', 'data'] },
  { owner: 'anthropics', name: 'prompt-evaluator', desc: 'Evaluate and score prompt quality with rubrics.', cat: 'agent', tags: ['agent', 'testing'] },
  { owner: 'anthropics', name: 'safety-linter', desc: 'Lint prompts and outputs for safety policy violations.', cat: 'backend', tags: ['testing', 'agent'] },
  { owner: 'anthropics', name: 'memory-manager', desc: 'Persistent memory layer for multi-session agents.', cat: 'agent', tags: ['agent', 'data'] },
  { owner: 'anthropics', name: 'tool-forge', desc: 'Generate custom tool definitions from OpenAPI specs.', cat: 'agent', tags: ['agent', 'automation'] },
  { owner: 'anthropics', name: 'artifact-builder', desc: 'Create interactive HTML artifacts from natural language.', cat: 'frontend', tags: ['ui', 'agent'] },

  // ── Vercel Labs ──
  { owner: 'vercel-labs', name: 'ai-sdk', desc: 'Build streaming AI chat UIs with the Vercel AI SDK.', cat: 'frontend', tags: ['ui', 'agent'] },
  { owner: 'vercel-labs', name: 'react-best-practices', desc: 'React 19 performance optimization and patterns.', cat: 'frontend', tags: ['ui', 'testing'] },
  { owner: 'vercel-labs', name: 'nextjs-app-router', desc: 'Next.js App Router data fetching and caching guide.', cat: 'frontend', tags: ['ui', 'cloud'] },
  { owner: 'vercel-labs', name: 'edge-runtime', desc: 'Deploy functions to Edge Runtime for low latency.', cat: 'cloud', tags: ['cloud', 'automation'] },
  { owner: 'vercel-labs', name: 'turborepo-guide', desc: 'Monorepo task orchestration with Turborepo.', cat: 'backend', tags: ['automation', 'cloud'] },
  { owner: 'vercel-labs', name: 'vercel-analytics', desc: 'Web Analytics and Speed Insights integration.', cat: 'data-viz', tags: ['data', 'ui'] },
  { owner: 'vercel-labs', name: 'og-image-gen', desc: 'Dynamic Open Graph image generation at the edge.', cat: 'data-viz', tags: ['ui', 'automation'] },
  { owner: 'vercel-labs', name: 'swr-cache', desc: 'Data fetching with SWR and intelligent caching.', cat: 'frontend', tags: ['data', 'ui'] },

  // ── Matt Pocock ──
  { owner: 'mattpocock', name: 'total-typescript', desc: 'TypeScript mastery from basics to advanced generics.', cat: 'backend', tags: ['testing', 'data'] },
  { owner: 'mattpocock', name: 'shoehorn', desc: 'Replace `as` assertions with type-safe shoehorn helpers.', cat: 'backend', tags: ['testing'] },
  { owner: 'mattpocock', name: 'type-wizard', desc: 'Interactive TypeScript type transformation exercises.', cat: 'backend', tags: ['testing', 'data'] },
  { owner: 'mattpocock', name: 'zod-schemas', desc: 'Runtime validation schemas with Zod for APIs.', cat: 'backend', tags: ['testing', 'data'] },
  { owner: 'mattpocock', name: 'ts-config-pro', desc: 'Optimize tsconfig for strictness and performance.', cat: 'backend', tags: ['testing'] },
  { owner: 'mattpocock', name: 'generics-explained', desc: 'Deep dive into TypeScript generics and inference.', cat: 'docs', tags: ['docs', 'data'] },
  { owner: 'mattpocock', name: 'type-narrowing', desc: 'Master discriminated unions and type guards.', cat: 'backend', tags: ['testing'] },
  { owner: 'mattpocock', name: 'runtime-checks', desc: 'Bridge compile-time types with runtime validation.', cat: 'backend', tags: ['testing', 'automation'] },

  // ── Obra ──
  { owner: 'obra', name: 'superpowers', desc: 'Agentic dev methodology: planning, TDD, debugging workflows.', cat: 'agent', tags: ['agent', 'testing'] },
  { owner: 'obra', name: 'tdd-workflow', desc: 'Test-driven development with red-green-refactor cycle.', cat: 'backend', tags: ['testing'] },
  { owner: 'obra', name: 'debug-master', desc: 'Systematic debugging methodology for complex bugs.', cat: 'backend', tags: ['testing', 'agent'] },
  { owner: 'obra', name: 'refactor-pro', desc: 'Safe refactoring with tiny commits and verification.', cat: 'backend', tags: ['testing', 'automation'] },
  { owner: 'obra', name: 'clean-architecture', desc: 'Layered architecture with dependency inversion.', cat: 'backend', tags: ['testing', 'data'] },
  { owner: 'obra', name: 'solid-principles', desc: 'SOLID design principles with practical examples.', cat: 'docs', tags: ['docs', 'testing'] },
  { owner: 'obra', name: 'design-patterns', desc: 'Common GoF patterns adapted for modern TypeScript.', cat: 'docs', tags: ['docs', 'data'] },
  { owner: 'obra', name: 'code-review-ai', desc: 'AI-powered code review with decay risk detection.', cat: 'agent', tags: ['agent', 'testing'] },

  // ── ByteDance ──
  { owner: 'bytedance', name: 'deer-flow', desc: 'Deep research workflow with multi-agent orchestration.', cat: 'agent', tags: ['agent', 'data'] },
  { owner: 'bytedance', name: 'seedance-v2', desc: 'Seedance v2 high-quality text-to-video generation.', cat: 'data-viz', tags: ['video', 'agent'] },
  { owner: 'bytedance', name: 'doubao-chat', desc: 'Doubao LLM integration for multilingual chat.', cat: 'agent', tags: ['agent', 'data'] },
  { owner: 'bytedance', name: 'ui-automator', desc: 'Mobile UI automation testing framework.', cat: 'automation', tags: ['automation', 'testing'] },
  { owner: 'bytedance', name: 'data-pipeline', desc: 'ETL pipeline builder for large-scale data processing.', cat: 'backend', tags: ['data', 'automation'] },
  { owner: 'bytedance', name: 'ml-optimizer', desc: 'Hyperparameter optimization for ML models.', cat: 'data-viz', tags: ['data', 'agent'] },
  { owner: 'bytedance', name: 'edith-agent', desc: 'Content understanding and moderation agent.', cat: 'agent', tags: ['agent', 'automation'] },
  { owner: 'bytedance', name: 'arkengine', desc: 'Real-time 3D rendering engine for web.', cat: 'data-viz', tags: ['video', 'ui'] },

  // ── Browser Use ──
  { owner: 'browser-use', name: 'browser-use', desc: 'Direct browser control via CDP for web automation.', cat: 'automation', tags: ['automation', 'agent'] },
  { owner: 'browser-use', name: 'web-automator', desc: 'Record-and-replay browser workflows with selectors.', cat: 'automation', tags: ['automation', 'testing'] },
  { owner: 'browser-use', name: 'scraper-pro', desc: 'Intelligent web scraping with anti-detection.', cat: 'automation', tags: ['automation', 'data'] },
  { owner: 'browser-use', name: 'form-filler', desc: 'Auto-fill complex forms with AI-extracted data.', cat: 'automation', tags: ['automation', 'agent'] },
  { owner: 'browser-use', name: 'captcha-solver', desc: 'Solve common CAPTCHA challenges in automation.', cat: 'automation', tags: ['automation'] },
  { owner: 'browser-use', name: 'page-monitor', desc: 'Monitor web pages for content changes and alerts.', cat: 'automation', tags: ['automation', 'data'] },
  { owner: 'browser-use', name: 'cookie-manager', desc: 'Manage browser cookies and sessions programmatically.', cat: 'automation', tags: ['automation'] },
  { owner: 'browser-use', name: 'proxy-rotator', desc: 'Rotate proxy IPs for distributed web requests.', cat: 'automation', tags: ['automation', 'cloud'] },

  // ── Microsoft ──
  { owner: 'microsoft', name: 'azure-skills', desc: 'Azure cloud deployment and resource management.', cat: 'cloud', tags: ['cloud', 'automation'] },
  { owner: 'microsoft', name: 'foundry', desc: 'Microsoft Foundry agent development framework.', cat: 'agent', tags: ['agent', 'cloud'] },
  { owner: 'microsoft', name: 'vscode-extension', desc: 'Build and publish VS Code extensions.', cat: 'frontend', tags: ['ui', 'automation'] },
  { owner: 'microsoft', name: 'powershell-pro', desc: 'Advanced PowerShell scripting and automation.', cat: 'automation', tags: ['automation', 'cloud'] },
  { owner: 'microsoft', name: 'dotnet-optimizer', desc: '.NET performance profiling and optimization.', cat: 'backend', tags: ['testing', 'data'] },
  { owner: 'microsoft', name: 'teams-bot', desc: 'Microsoft Teams bot development with Graph API.', cat: 'agent', tags: ['agent', 'automation'] },
  { owner: 'microsoft', name: 'azure-devops', desc: 'CI/CD pipeline automation with Azure DevOps.', cat: 'cloud', tags: ['cloud', 'testing'] },
  { owner: 'microsoft', name: 'ms-graph', desc: 'Microsoft Graph API integration for enterprise data.', cat: 'backend', tags: ['data', 'cloud'] },

  // ── Remotion ──
  { owner: 'remotion-dev', name: 'remotion', desc: 'Programmatic video creation with React components.', cat: 'data-viz', tags: ['video', 'ui'] },
  { owner: 'remotion-dev', name: 'video-templates', desc: 'Pre-built video templates for marketing and social.', cat: 'data-viz', tags: ['video', 'docs'] },
  { owner: 'remotion-dev', name: 'motion-graphics', desc: 'Animated motion graphics with spring physics.', cat: 'data-viz', tags: ['video', 'ui'] },
  { owner: 'remotion-dev', name: 'subtitle-gen', desc: 'Auto-generate and burn subtitles into videos.', cat: 'data-viz', tags: ['video', 'docs'] },
  { owner: 'remotion-dev', name: 'audio-react', desc: 'Audio-reactive visualizations synced to music.', cat: 'data-viz', tags: ['video', 'data'] },
  { owner: 'remotion-dev', name: 'video-merge', desc: 'Concatenate and transition between video clips.', cat: 'data-viz', tags: ['video', 'automation'] },
  { owner: 'remotion-dev', name: 'gif-maker', desc: 'Convert video sequences to optimized GIFs.', cat: 'data-viz', tags: ['video', 'ui'] },
  { owner: 'remotion-dev', name: 'stream-overlay', desc: 'Live stream overlay graphics with real-time data.', cat: 'data-viz', tags: ['video', 'data'] },

  // ── RunComfy ──
  { owner: 'runcomfy', name: 'video-edit', desc: 'RunComfy video editing and image-to-video workflows.', cat: 'data-viz', tags: ['video', 'automation'] },
  { owner: 'runcomfy', name: 'comfyui-workflows', desc: 'Pre-built ComfyUI workflow nodes for image gen.', cat: 'data-viz', tags: ['video', 'data'] },
  { owner: 'runcomfy', name: 'image-upscale', desc: 'AI-powered image upscaling and enhancement.', cat: 'data-viz', tags: ['video', 'ui'] },
  { owner: 'runcomfy', name: 'batch-process', desc: 'Batch process images and videos with queues.', cat: 'automation', tags: ['automation', 'video'] },
  { owner: 'runcomfy', name: 'model-runner', desc: 'Run diffusion models locally with GPU optimization.', cat: 'data-viz', tags: ['video', 'cloud'] },
  { owner: 'runcomfy', name: 'lora-trainer', desc: 'Fine-tune LoRA adapters for custom styles.', cat: 'data-viz', tags: ['video', 'data'] },
  { owner: 'runcomfy', name: 'controlnet-pro', desc: 'Advanced ControlNet pipelines for precise control.', cat: 'data-viz', tags: ['video', 'ui'] },
  { owner: 'runcomfy', name: 'inpaint-tool', desc: 'AI inpainting for object removal and restoration.', cat: 'data-viz', tags: ['video', 'ui'] },

  // ── Lark ──
  { owner: 'lark', name: 'lark-doc', desc: 'Feishu document reading and editing via API.', cat: 'docs', tags: ['docs', 'automation'] },
  { owner: 'lark', name: 'lark-task', desc: 'Feishu task management and todo tracking.', cat: 'automation', tags: ['automation', 'docs'] },
  { owner: 'lark', name: 'lark-approval', desc: 'Feishu approval workflow automation.', cat: 'automation', tags: ['automation', 'cloud'] },
  { owner: 'lark', name: 'lark-wiki', desc: 'Feishu wiki knowledge base management.', cat: 'docs', tags: ['docs', 'data'] },
  { owner: 'lark', name: 'lark-whiteboard', desc: 'Feishu whiteboard collaboration and export.', cat: 'design', tags: ['ui', 'docs'] },
  { owner: 'lark', name: 'lark-skill-maker', desc: 'Create custom Feishu skills from API specs.', cat: 'agent', tags: ['agent', 'automation'] },
  { owner: 'lark', name: 'lark-calendar', desc: 'Feishu calendar scheduling and room booking.', cat: 'automation', tags: ['automation', 'data'] },
  { owner: 'lark', name: 'lark-sheets', desc: 'Feishu spreadsheet data read and formula calc.', cat: 'docs', tags: ['docs', 'data'] },

  // ── Cloudflare ──
  { owner: 'cloudflare', name: 'cloudflare-workers', desc: 'Build stateful agents on Cloudflare Workers.', cat: 'cloud', tags: ['cloud', 'agent'] },
  { owner: 'cloudflare', name: 'pages-deploy', desc: 'Deploy static sites to Cloudflare Pages.', cat: 'cloud', tags: ['cloud', 'automation'] },
  { owner: 'cloudflare', name: 'kv-cache', desc: 'Key-value caching at the edge for low latency.', cat: 'cloud', tags: ['cloud', 'data'] },
  { owner: 'cloudflare', name: 'd1-query', desc: 'SQLite queries on Cloudflare D1 edge database.', cat: 'backend', tags: ['data', 'cloud'] },
  { owner: 'cloudflare', name: 'r2-storage', desc: 'Object storage with R2 for media and backups.', cat: 'cloud', tags: ['cloud', 'data'] },
  { owner: 'cloudflare', name: 'durable-objects', desc: 'Stateful coordination with Durable Objects.', cat: 'agent', tags: ['agent', 'cloud'] },
  { owner: 'cloudflare', name: 'workers-ai', desc: 'Run inference models on Workers AI platform.', cat: 'agent', tags: ['agent', 'data'] },
  { owner: 'cloudflare', name: 'wrangler-cli', desc: 'Wrangler CLI for Workers development and deploy.', cat: 'cloud', tags: ['cloud', 'automation'] },

  // ── Supabase ──
  { owner: 'supabase', name: 'supabase-postgres', desc: 'Postgres performance optimization and query tuning.', cat: 'backend', tags: ['data', 'testing'] },
  { owner: 'supabase', name: 'auth-flows', desc: 'Authentication flows with Supabase Auth and RLS.', cat: 'backend', tags: ['testing', 'cloud'] },
  { owner: 'supabase', name: 'realtime-sync', desc: 'Realtime data sync via Supabase subscriptions.', cat: 'frontend', tags: ['data', 'ui'] },
  { owner: 'supabase', name: 'storage-upload', desc: 'File upload and CDN delivery with Supabase Storage.', cat: 'cloud', tags: ['cloud', 'data'] },
  { owner: 'supabase', name: 'edge-functions', desc: 'Deno-based edge functions for serverless APIs.', cat: 'cloud', tags: ['cloud', 'automation'] },
  { owner: 'supabase', name: 'rls-policies', desc: 'Row Level Security policy generator and auditor.', cat: 'backend', tags: ['testing', 'data'] },
  { owner: 'supabase', name: 'vector-search', desc: 'pgvector similarity search for AI applications.', cat: 'data-viz', tags: ['data', 'agent'] },
  { owner: 'supabase', name: 'supabase-cli', desc: 'Local development and database migrations CLI.', cat: 'cloud', tags: ['cloud', 'automation'] },

  // ── Stripe ──
  { owner: 'stripe', name: 'stripe-integration', desc: 'Stripe Checkout and PaymentIntents integration guide.', cat: 'backend', tags: ['data', 'automation'] },
  { owner: 'stripe', name: 'payment-flows', desc: 'Build custom payment flows with Payment Element.', cat: 'frontend', tags: ['ui', 'data'] },
  { owner: 'stripe', name: 'subscription-billing', desc: 'Recurring billing and subscription lifecycle management.', cat: 'backend', tags: ['data', 'automation'] },
  { owner: 'stripe', name: 'connect-marketplace', desc: 'Multi-party payments with Stripe Connect.', cat: 'backend', tags: ['data', 'cloud'] },
  { owner: 'stripe', name: 'webhook-handler', desc: 'Reliable Stripe webhook processing and retry logic.', cat: 'backend', tags: ['automation', 'testing'] },
  { owner: 'stripe', name: 'stripe-cli', desc: 'Stripe CLI for local testing and event replay.', cat: 'backend', tags: ['testing', 'automation'] },
  { owner: 'stripe', name: 'tax-calc', desc: 'Automatic tax calculation and compliance with Stripe Tax.', cat: 'backend', tags: ['data', 'docs'] },
  { owner: 'stripe', name: 'invoicing-pro', desc: 'Generate and manage Stripe invoices programmatically.', cat: 'docs', tags: ['docs', 'automation'] },

  // ── Zotero ──
  { owner: 'zotero', name: 'zotero-citations', desc: 'Manage Zotero citations and export BibTeX.', cat: 'docs', tags: ['docs', 'data'] },
  { owner: 'zotero', name: 'bib-generator', desc: 'Generate bibliography entries in APA, MLA, Chicago.', cat: 'docs', tags: ['docs', 'data'] },
  { owner: 'zotero', name: 'research-library', desc: 'Organize and search academic paper collections.', cat: 'docs', tags: ['docs', 'data'] },
  { owner: 'zotero', name: 'pdf-annotator', desc: 'Extract and annotate PDF content for research.', cat: 'docs', tags: ['docs', 'automation'] },
  { owner: 'zotero', name: 'cite-processor', desc: 'Insert citation keys into LaTeX and Markdown.', cat: 'docs', tags: ['docs', 'automation'] },
  { owner: 'zotero', name: 'literature-review', desc: 'AI-assisted literature review and summarization.', cat: 'agent', tags: ['agent', 'docs'] },
  { owner: 'zotero', name: 'ref-manager', desc: 'Reference manager with dedup and merge.', cat: 'docs', tags: ['docs', 'data'] },
  { owner: 'zotero', name: 'academic-export', desc: 'Export research data to multiple academic formats.', cat: 'docs', tags: ['docs', 'data'] },

  // ── content-media（内容与媒体）──
  { owner: 'remotion-dev', name: 'video-editor', desc: 'Browser-based video editor with timeline and transitions.', cat: 'design', tags: ['media', 'ui'], domain: 'content-media', subcategory: 'media', occupation: 'arts-design-media' },
  { owner: 'remotion-dev', name: 'thumbnail-gen', desc: 'Auto-generate video thumbnails with AI composition.', cat: 'design', tags: ['media', 'automation'], domain: 'content-media', subcategory: 'content-creation', occupation: 'arts-design-media' },
  { owner: 'bytedance', name: 'image-processor', desc: 'Batch image processing: resize, crop, filter, watermark.', cat: 'design', tags: ['media', 'automation'], domain: 'content-media', subcategory: 'media', occupation: 'arts-design-media' },
  { owner: 'bytedance', name: 'subtitle-translator', desc: 'Translate video subtitles across 50+ languages.', cat: 'design', tags: ['docs', 'media'], domain: 'content-media', subcategory: 'documents', occupation: 'arts-design-media' },
  { owner: 'lark', name: 'doc-converter', desc: 'Convert documents between PDF, DOCX, Markdown, HTML.', cat: 'design', tags: ['docs', 'automation'], domain: 'content-media', subcategory: 'documents', occupation: 'arts-design-media' },
  { owner: 'anthropics', name: 'blog-writer', desc: 'AI blog post generator with SEO optimization.', cat: 'design', tags: ['writing', 'agent'], domain: 'content-media', subcategory: 'content-creation', occupation: 'arts-design-media' },
  { owner: 'anthropics', name: 'podcast-shownotes', desc: 'Auto-generate podcast show notes from audio transcripts.', cat: 'design', tags: ['media', 'docs'], domain: 'content-media', subcategory: 'content-creation', occupation: 'arts-design-media' },
  { owner: 'microsoft', name: 'design-system', desc: 'Design system token generator for Figma and code.', cat: 'design', tags: ['ui', 'design'], domain: 'content-media', subcategory: 'design', occupation: 'arts-design-media' },
  { owner: 'microsoft', name: 'screenshot-annotator', desc: 'Capture and annotate screenshots with markup tools.', cat: 'design', tags: ['ui', 'media'], domain: 'content-media', subcategory: 'media', occupation: 'arts-design-media' },

  // ── business（商业）──
  { owner: 'atlassian', name: 'jira-sync', desc: 'Jira sprint sync and issue tracking automation.', cat: 'business', tags: ['project-mgmt', 'automation'], domain: 'business', subcategory: 'project-management', occupation: 'business-finance' },
  { owner: 'atlassian', name: 'confluence-docs', desc: 'Confluence wiki page creation and template management.', cat: 'business', tags: ['docs', 'project-mgmt'], domain: 'business', subcategory: 'project-management', occupation: 'business-finance' },
  { owner: 'atlassian', name: 'trello-flow', desc: 'Trello board automation with rule-based card movements.', cat: 'business', tags: ['project-mgmt', 'automation'], domain: 'business', subcategory: 'project-management', occupation: 'business-finance' },
  { owner: 'stripe', name: 'invoice-gen', desc: 'Automated Stripe invoice generation and tracking.', cat: 'business', tags: ['finance', 'payment'], domain: 'business', subcategory: 'finance-investment', occupation: 'business-finance' },
  { owner: 'stripe', name: 'tax-calc-pro', desc: 'Automatic tax calculation and compliance with Stripe Tax.', cat: 'business', tags: ['finance', 'payment'], domain: 'business', subcategory: 'finance-investment', occupation: 'business-finance' },
  { owner: 'microsoft', name: 'powerbi-dash', desc: 'Power BI dashboard builder with DAX measure generation.', cat: 'business', tags: ['analytics', 'data'], domain: 'business', subcategory: 'business-apps', occupation: 'business-finance' },
  { owner: 'microsoft', name: 'dynamics-crm', desc: 'Dynamics 365 CRM integration for sales pipeline management.', cat: 'business', tags: ['crm', 'sales'], domain: 'business', subcategory: 'sales-marketing', occupation: 'sales' },
  { owner: 'lark', name: 'lark-approval-flow', desc: 'Feishu approval workflow builder with custom forms.', cat: 'business', tags: ['automation', 'project-mgmt'], domain: 'business', subcategory: 'business-apps', occupation: 'management' },
  { owner: 'supabase', name: 'inventory-track', desc: 'Real-time inventory management with low-stock alerts.', cat: 'business', tags: ['ecommerce', 'data'], domain: 'business', subcategory: 'ecommerce', occupation: 'business-finance' },
  { owner: 'bytedance', name: 'ad-campaign', desc: 'Digital ad campaign optimizer with A/B testing insights.', cat: 'business', tags: ['sales', 'marketing'], domain: 'business', subcategory: 'sales-marketing', occupation: 'sales' },

  // ── testing-security（测试与安全）──
  { owner: 'snyk', name: 'vuln-scanner', desc: 'Dependency vulnerability scanner with remediation advice.', cat: 'testing', tags: ['security', 'testing'], domain: 'testing-security', subcategory: 'security', occupation: 'computer-math' },
  { owner: 'snyk', name: 'license-check', desc: 'Open source license compliance checker for npm and pip.', cat: 'testing', tags: ['security', 'docs'], domain: 'testing-security', subcategory: 'code-quality', occupation: 'legal' },
  { owner: 'snyk', name: 'container-scan', desc: 'Container image security scanner for Docker registries.', cat: 'testing', tags: ['security', 'cloud'], domain: 'testing-security', subcategory: 'security', occupation: 'computer-math' },
  { owner: 'obra', name: 'tdd-guard', desc: 'TDD enforcement guard ensuring tests precede implementation.', cat: 'testing', tags: ['testing', 'automation'], domain: 'testing-security', subcategory: 'testing', occupation: 'computer-math' },
  { owner: 'obra', name: 'code-review-pro', desc: 'Automated code review with engineering best practice checks.', cat: 'testing', tags: ['testing', 'agent'], domain: 'testing-security', subcategory: 'code-quality', occupation: 'computer-math' },
  { owner: 'microsoft', name: 'azure-security', desc: 'Azure security baseline checker and compliance auditor.', cat: 'testing', tags: ['security', 'cloud'], domain: 'testing-security', subcategory: 'security', occupation: 'computer-math' },
  { owner: 'cloudflare', name: 'waf-rules', desc: 'WAF rule generator and tester for Cloudflare protection.', cat: 'testing', tags: ['security', 'cloud'], domain: 'testing-security', subcategory: 'security', occupation: 'computer-math' },
  { owner: 'browser-use', name: 'e2e-tester', desc: 'End-to-end browser testing with visual regression checks.', cat: 'testing', tags: ['testing', 'automation'], domain: 'testing-security', subcategory: 'testing', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'type-coverage', desc: 'TypeScript type coverage analyzer with gap reporting.', cat: 'testing', tags: ['testing', 'data'], domain: 'testing-security', subcategory: 'code-quality', occupation: 'computer-math' },
  { owner: 'bytedance', name: 'fuzz-engine', desc: 'API fuzz testing engine with smart input generation.', cat: 'testing', tags: ['testing', 'security'], domain: 'testing-security', subcategory: 'testing', occupation: 'computer-math' },

  // ── lifestyle（生活方式）──
  { owner: 'anthropics', name: 'tarot-reader', desc: 'AI-powered tarot card reading with interpretation.', cat: 'lifestyle', tags: ['divination', 'agent'], domain: 'lifestyle', subcategory: 'divination-mysticism', occupation: 'arts-design-media' },
  { owner: 'anthropics', name: 'recipe-finder', desc: 'Smart recipe search by ingredients and dietary needs.', cat: 'lifestyle', tags: ['culinary', 'data'], domain: 'lifestyle', subcategory: 'culinary-arts', occupation: 'arts-design-media' },
  { owner: 'anthropics', name: 'meditation-guide', desc: 'Guided meditation sessions with breathing exercises.', cat: 'lifestyle', tags: ['wellness', 'agent'], domain: 'lifestyle', subcategory: 'wellness-health', occupation: 'arts-design-media' },
  { owner: 'lark', name: 'journal-writer', desc: 'Daily journaling assistant with mood tracking prompts.', cat: 'lifestyle', tags: ['writing', 'docs'], domain: 'lifestyle', subcategory: 'literature-writing', occupation: 'arts-design-media' },
  { owner: 'lark', name: 'travel-planner', desc: 'Travel itinerary planning with budget optimization.', cat: 'lifestyle', tags: ['lifestyle', 'data'], domain: 'lifestyle', subcategory: 'arts-crafts', occupation: 'arts-design-media' },
  { owner: 'lark', name: 'habit-tracker', desc: 'Habit building and streak tracking with reminders.', cat: 'lifestyle', tags: ['wellness', 'automation'], domain: 'lifestyle', subcategory: 'wellness-health', occupation: 'arts-design-media' },
  { owner: 'bytedance', name: 'book-recommender', desc: 'AI book recommendation engine based on reading history.', cat: 'lifestyle', tags: ['literature', 'agent'], domain: 'lifestyle', subcategory: 'literature-writing', occupation: 'education-library' },
  { owner: 'bytedance', name: 'workout-planner', desc: 'Personalized fitness plan generator with progress tracking.', cat: 'lifestyle', tags: ['fitness', 'data'], domain: 'lifestyle', subcategory: 'wellness-health', occupation: 'arts-design-media' },
  { owner: 'remotion-dev', name: 'music-practice', desc: 'Music practice scheduler with tempo and session logging.', cat: 'lifestyle', tags: ['arts', 'automation'], domain: 'lifestyle', subcategory: 'arts-crafts', occupation: 'arts-design-media' },
  { owner: 'anthropics', name: 'garden-helper', desc: 'Gardening tips, plant identification, and care schedules.', cat: 'lifestyle', tags: ['arts', 'data'], domain: 'lifestyle', subcategory: 'arts-crafts', occupation: 'arts-design-media' },

  // ── research（研究）──
  { owner: 'zotero', name: 'latex-helper', desc: 'LaTeX document composition with bibliography integration.', cat: 'research', tags: ['academic', 'docs'], domain: 'research', subcategory: 'academic', occupation: 'education-library' },
  { owner: 'zotero', name: 'r-analysis', desc: 'R statistical analysis toolkit for data frames and models.', cat: 'research', tags: ['stats', 'data'], domain: 'research', subcategory: 'scientific-computing', occupation: 'computer-math' },
  { owner: 'zotero', name: 'citation-graph', desc: 'Citation network analysis and visualization tool.', cat: 'research', tags: ['academic', 'data'], domain: 'research', subcategory: 'academic', occupation: 'education-library' },
  { owner: 'zotero', name: 'arxiv-search', desc: 'arXiv paper search and discovery with semantic ranking.', cat: 'research', tags: ['academic', 'agent'], domain: 'research', subcategory: 'academic', occupation: 'education-library' },
  { owner: 'zotero', name: 'stats-models', desc: 'Statistical model fitting with confidence interval reporting.', cat: 'research', tags: ['stats', 'data'], domain: 'research', subcategory: 'scientific-computing', occupation: 'computer-math' },
  { owner: 'bytedance', name: 'protein-folder', desc: 'Protein structure prediction from amino acid sequences.', cat: 'research', tags: ['bioinformatics', 'data'], domain: 'research', subcategory: 'bioinformatics', occupation: 'architecture-engineering' },
  { owner: 'bytedance', name: 'genome-analyzer', desc: 'Genomic data analysis pipeline for variant calling.', cat: 'research', tags: ['bioinformatics', 'data'], domain: 'research', subcategory: 'bioinformatics', occupation: 'architecture-engineering' },
  { owner: 'microsoft', name: 'matlab-bridge', desc: 'MATLAB computation bridge for numerical and signal processing.', cat: 'research', tags: ['scientific', 'data'], domain: 'research', subcategory: 'scientific-computing', occupation: 'computer-math' },
  { owner: 'microsoft', name: 'azure-research', desc: 'Azure research cloud compute for batch HPC workloads.', cat: 'research', tags: ['scientific', 'cloud'], domain: 'research', subcategory: 'lab-tools', occupation: 'architecture-engineering' },
  { owner: 'anthropics', name: 'data-reproducibility', desc: 'Research data reproducibility checker with provenance tracking.', cat: 'research', tags: ['academic', 'testing'], domain: 'research', subcategory: 'scientific-computing', occupation: 'computer-math' },

  // ── databases（数据库）──
  { owner: 'supabase', name: 'postgres-admin', desc: 'PostgreSQL administration toolkit for indexes and vacuuming.', cat: 'database', tags: ['sql', 'data'], domain: 'databases', subcategory: 'sql-databases', occupation: 'computer-math' },
  { owner: 'supabase', name: 'db-migrator', desc: 'Database schema migration tool with rollback support.', cat: 'database', tags: ['sql', 'automation'], domain: 'databases', subcategory: 'database-tools', occupation: 'computer-math' },
  { owner: 'supabase', name: 'sql-formatter', desc: 'SQL query formatter and optimizer with explain analysis.', cat: 'database', tags: ['sql', 'data'], domain: 'databases', subcategory: 'database-tools', occupation: 'computer-math' },
  { owner: 'supabase', name: 'redis-cache', desc: 'Redis caching patterns with TTL and eviction strategies.', cat: 'database', tags: ['nosql', 'data'], domain: 'databases', subcategory: 'nosql-databases', occupation: 'computer-math' },
  { owner: 'cloudflare', name: 'd1-explorer', desc: 'Cloudflare D1 database explorer with query history.', cat: 'database', tags: ['sql', 'cloud'], domain: 'databases', subcategory: 'sql-databases', occupation: 'computer-math' },
  { owner: 'microsoft', name: 'cosmos-db', desc: 'Cosmos DB multi-model operations with partitioning strategies.', cat: 'database', tags: ['nosql', 'cloud'], domain: 'databases', subcategory: 'nosql-databases', occupation: 'computer-math' },
  { owner: 'microsoft', name: 'sql-server', desc: 'SQL Server query optimization and execution plan analysis.', cat: 'database', tags: ['sql', 'data'], domain: 'databases', subcategory: 'sql-databases', occupation: 'computer-math' },
  { owner: 'bytedance', name: 'mongo-crud', desc: 'MongoDB CRUD operations with aggregation pipeline builder.', cat: 'database', tags: ['nosql', 'data'], domain: 'databases', subcategory: 'nosql-databases', occupation: 'computer-math' },
  { owner: 'bytedance', name: 'es-sync', desc: 'Elasticsearch index synchronization and mapping manager.', cat: 'database', tags: ['nosql', 'data'], domain: 'databases', subcategory: 'database-tools', occupation: 'computer-math' },
  { owner: 'supabase', name: 'dbdiagram-gen', desc: 'Database schema diagram generator from SQL DDL.', cat: 'database', tags: ['sql', 'ui'], domain: 'databases', subcategory: 'database-tools', occupation: 'computer-math' },

  // ── blockchain（区块链）──
  { owner: 'openzeppelin', name: 'erc20-gen', desc: 'ERC20 token generator with standard security patterns.', cat: 'blockchain', tags: ['web3', 'security'], domain: 'blockchain', subcategory: 'smart-contracts', occupation: 'computer-math' },
  { owner: 'openzeppelin', name: 'nft-minter', desc: 'NFT minting smart contracts with metadata standards.', cat: 'blockchain', tags: ['web3', 'automation'], domain: 'blockchain', subcategory: 'smart-contracts', occupation: 'computer-math' },
  { owner: 'openzeppelin', name: 'dao-governance', desc: 'DAO governance voting with proposal and tally mechanics.', cat: 'blockchain', tags: ['web3', 'data'], domain: 'blockchain', subcategory: 'defi', occupation: 'computer-math' },
  { owner: 'openzeppelin', name: 'solidity-linter', desc: 'Solidity code linter with best-practice security rules.', cat: 'blockchain', tags: ['web3', 'testing'], domain: 'blockchain', subcategory: 'smart-contracts', occupation: 'computer-math' },
  { owner: 'openzeppelin', name: 'gas-optimizer', desc: 'Gas optimization analyzer for Ethereum smart contracts.', cat: 'blockchain', tags: ['web3', 'data'], domain: 'blockchain', subcategory: 'smart-contracts', occupation: 'computer-math' },
  { owner: 'cloudflare', name: 'web3-gateway', desc: 'IPFS gateway and Web3 storage pinned content manager.', cat: 'blockchain', tags: ['web3', 'cloud'], domain: 'blockchain', subcategory: 'web3-tools', occupation: 'computer-math' },
  { owner: 'microsoft', name: 'azure-blockchain', desc: 'Azure blockchain service for consortium network management.', cat: 'blockchain', tags: ['web3', 'cloud'], domain: 'blockchain', subcategory: 'web3-tools', occupation: 'computer-math' },
  { owner: 'stripe', name: 'crypto-pay', desc: 'Cryptocurrency payment processing with on-chain verification.', cat: 'blockchain', tags: ['web3', 'payment'], domain: 'blockchain', subcategory: 'defi', occupation: 'business-finance' },
  { owner: 'supabase', name: 'defi-swap', desc: 'DeFi swap protocol integration with slippage protection.', cat: 'blockchain', tags: ['web3', 'data'], domain: 'blockchain', subcategory: 'defi', occupation: 'computer-math' },
  { owner: 'openzeppelin', name: 'hardhat-deploy', desc: 'Hardhat deployment automation with network configuration.', cat: 'blockchain', tags: ['web3', 'automation'], domain: 'blockchain', subcategory: 'web3-tools', occupation: 'computer-math' },

  // ── Installed skills ──
  { owner: 'mattpocock', name: 'ask-matt', desc: '询问哪种技能或流程适合你的情况。本仓库技能的路由器。', cat: 'agent', tags: ['agent'], domain: 'agent', subcategory: 'agent-tools', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'batch-grill-me', desc: '一轮同时抛出所有前沿问题，逐轮推进的无情访谈。将决策映射为设计树，每轮只问当前可被回答的问题，并给出推荐答案，等待用户回复后再进入下一轮。', cat: 'agent', tags: ['agent'], domain: 'agent', subcategory: 'agent-tools', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'claude-handoff', desc: '将当前对话移交给一个新的后台代理,该代理立即接手工作。', cat: 'agent', tags: ['agent'], domain: 'agent', subcategory: 'agent-tools', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'code-review', desc: '审查自某个固定点(commit、分支、tag 或 merge-base)以来的变更,沿两个维度进行——标准(Standards:代码是否遵循该仓库文档化的编码标准?)和规格(Spec:代码是否匹配原始 issue/PRD 的要求?)。以并行子代理(sub-agents)运行两个审查,并并排报告结果。当用户想要审查一个分支、一个 PR、进行中的变更,或要求"自 X 以来审查(review since X)"时使用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'codebase-design', desc: '用于设计深度模块(deep modules)的共享词汇表。当用户想要设计或改进模块的接口、寻找深化(deepening)机会、决定接缝(seam)位置、使代码更易测试或更易于 AI 导航时使用，或当其他技能需要深度模块词汇表时使用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'design-an-interface', desc: '使用并行子代理为一个模块生成多种截然不同的接口设计。当用户想要设计 API、探索接口选项、比较模块形状，或提到"设计两次(design it twice)"时使用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'diagnosing-bugs', desc: '针对困难 bug 和性能回归(performance regressions)的诊断循环。当用户说"诊断(diagnose)"/"调试这个(debug this)",或报告某物损坏/抛出异常/失败/变慢时使用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'domain-modeling', desc: '构建和锐化项目的领域模型。当用户想要确定领域术语或统一语言(ubiquitous language)、记录架构决策，或当其他技能需要维护领域模型时使用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'edit-article', desc: '通过重组章节、提升清晰度、精简文字来编辑和改进文章。当用户希望编辑、修改或改进文章草稿时使用。', cat: 'docs', tags: ['agent'], domain: 'docs', subcategory: 'docs', occupation: 'education-library' },
  { owner: 'mattpocock', name: 'git-guardrails-claude-code', desc: '设置 Claude Code 钩子以在危险 git 命令（push、reset --hard、clean、branch -D 等）执行前阻止它们。当用户想要防止破坏性 git 操作、添加 git 安全钩子或在 Claude Code 中阻止 git push/reset 时使用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'grill-me', desc: '一场无休止的访谈,用于打磨计划或设计。', cat: 'agent', tags: ['agent'], domain: 'agent', subcategory: 'agent-tools', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'grill-with-docs', desc: '一场无休止的访谈,用于打磨计划或设计,同时在此过程中创建文档(ADR 和词汇表)。', cat: 'agent', tags: ['agent'], domain: 'agent', subcategory: 'agent-tools', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'grilling', desc: '毫不松懈地盘问用户关于一个计划、决策或想法。当用户想要压力测试他们的思考,或使用任何 \'grill\' 触发短语时使用。', cat: 'agent', tags: ['agent'], domain: 'agent', subcategory: 'agent-tools', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'handoff', desc: '将当前对话压缩成交接文档,供另一个代理接手。', cat: 'agent', tags: ['agent'], domain: 'agent', subcategory: 'agent-tools', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'implement', desc: '基于规格说明(spec)或一组工单(ticket)实现一项工作。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'improve-codebase-architecture', desc: '扫描代码库寻找深化(deepening)机会，以可视化 HTML 报告呈现，然后对你选择的候选项进行深入质询(grilling)。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'karpathy', name: 'karpathy-guidelines', desc: '减少常见 LLM 编程错误的行为准则。在编写、审查或重构代码时使用，以避免过度复杂化、做精准改动（surgical changes）、暴露假设，并定义可验证的成功标准。', cat: 'agent', tags: ['agent'], domain: 'agent', subcategory: 'agent-tools', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'loop-me', desc: '就我要构建的工作流的规格（specs）对我进行拷问（grilling），限定在此工作区内。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'migrate-to-shoehorn', desc: '将测试文件从 `as` 类型断言迁移到 @total-typescript/shoehorn。当用户提到 shoehorn、想要替换测试中的 `as` 或需要部分测试数据时使用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'obsidian-vault', desc: '在 Obsidian 知识库中搜索、创建和管理笔记，使用 wikilinks 和索引笔记。当用户想要在 Obsidian 中查找、创建或组织笔记时使用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'prototype', desc: '构建一次性原型(throwaway prototype)来回答一个设计问题。当用户想要验证某个状态模型或逻辑是否合理、或探索 UI 应该长什么样时使用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'qa', desc: '交互式 QA 会话，用户以对话方式报告 bug 或问题，代理提交 GitHub issue。在后台探索代码库以获取上下文和领域语言。当用户想要报告 bug、进行 QA、以对话方式提交 issue 或提到"QA session"时使用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'request-refactor-plan', desc: '通过用户访谈创建带有微小提交(tiny commits)的详细重构计划,然后作为 GitHub issue 提交。当用户想要规划重构、创建重构 RFC、或将重构拆分为安全的增量步骤时使用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'research', desc: '针对高可信度的原始来源（primary sources）调查某个问题，并将研究结果保存为仓库中的 Markdown 文件。当用户希望研究某个主题、收集文档或 API 事实，或将阅读工作委托给后台代理（background agent）时使用。', cat: 'docs', tags: ['agent'], domain: 'docs', subcategory: 'docs', occupation: 'education-library' },
  { owner: 'mattpocock', name: 'resolving-merge-conflicts', desc: '当你需要解决进行中的 git merge/rebase 冲突时使用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'scaffold-exercises', desc: '创建练习目录结构，包含章节、问题、解决方案和讲解，并通过 lint 检查。当用户想要搭建练习脚手架、创建练习桩或设置新课程章节时使用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'setup-matt-pocock-skills', desc: '为此仓库配置工程技能（engineering skills）——设置其 issue 跟踪器（issue tracker）、分类标签体系（triage label vocabulary）和领域文档（domain doc）布局。在首次使用其他工程技能之前运行一次。', cat: 'agent', tags: ['agent'], domain: 'agent', subcategory: 'agent-tools', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'setup-pre-commit', desc: '在当前仓库中设置 Husky pre-commit 钩子，配合 lint-staged（Prettier）、类型检查和测试。当用户想要添加 pre-commit 钩子、设置 Husky、配置 lint-staged 或添加提交时格式化/类型检查/测试时使用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'setup-ts-deep-modules', desc: '将 dependency-cruiser 接入 TypeScript 仓库，使每个包成为深度模块——实现在子文件夹中隐藏，只能通过入口文件访问。由用户手动调用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'tdd', desc: '测试驱动开发(Test-driven development)。当用户希望以测试优先的方式构建功能或修复 bug、提到"red-green-refactor"(红-绿-重构),或需要集成测试(integration tests)时使用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'teach', desc: '在当前工作区中教用户一项新技能或概念。', cat: 'docs', tags: ['agent'], domain: 'docs', subcategory: 'docs', occupation: 'education-library' },
  { owner: 'mattpocock', name: 'to-questionnaire', desc: '将你无法完全回答的决策转化为问卷(questionnaire)，交给其他人填写。', cat: 'agent', tags: ['agent'], domain: 'agent', subcategory: 'agent-tools', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'to-spec', desc: '将当前对话转化为规格说明(spec)并发布到项目的问题追踪器(issue tracker)——不需要访谈，只需综合已有讨论内容。', cat: 'agent', tags: ['agent'], domain: 'agent', subcategory: 'agent-tools', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'to-tickets', desc: '将计划、规格说明(spec)或当前对话拆解为一组曳光弹工单(tracer-bullet tickets)，每个工单声明其阻塞依赖(blocking edges)，发布到已配置的追踪器——依赖关系以文本形式写入本地每工单一个文件，或以原生阻塞链接形式发布到真实追踪器。', cat: 'agent', tags: ['agent'], domain: 'agent', subcategory: 'agent-tools', occupation: 'computer-math' },
  { owner: 'transitions-dev', name: 'transitions-dev', desc: '用于 Web 应用的生产级 CSS 过渡(transition)效果。适用于实现通知徽标(badge)、下拉菜单(dropdown)、模态框(modal)、面板展开(panel reveal)、页面切换(page transition)、卡片尺寸变化(card resize)、数字弹入(number pop-in)、文本切换(text swap)、图标切换(icon swap)、成功勾选(success check)、头像组悬停(avatar group hover)、错误状态抖动(error state shake)、搜索/输入清除(clear)、骨架屏(skeleton loader)、微光文本(shimmer text)、滑动标签页(sliding tabs)、工具提示(tooltip)、交错文本展示(staggered text reveal)、卡片悬停倾斜(card hover tilt)、加号变菜单形变(plus-to-menu morph)或手风琴(accordion)。触发词包括 "add a transition"、"animate the dropdown"、"make the modal open smoothly"、"swap icon"、"page slide"、"stagger animation"、"open / close transition"、"make it animate"、"fade between"、"success animation"、"form error"、"shake on invalid"、"hover lift"、"avatar stack hover"、"clear the search"、"skeleton loader"、"loading shimmer"、"shimmer text"、"sliding tabs"、"segmented control"、"tooltip"、"reveal text"、"tiltcard"、"3D hover tilt"、"cursor glare"、"plus to menu"、"FAB morph"、"accordion"、"collapsible"、"expand / collapse"、"disclosure"。还包括 "motion tokens"、"scan for ad-hoc transitions"、"replace hardcoded durations with motion tokens"、"tokenize my animations" 以及命令 transitions reveal、transitions review、transitions apply、transitions refine。', cat: 'design', tags: ['agent'], domain: 'design', subcategory: 'frontend', occupation: 'arts-design-media' },
  { owner: 'transitions-dev', name: 'transitions-polish', desc: '对照 transitions.dev 的运动令牌（motion-token）标尺——持续时间（duration）、距离（distance）、缩放（scale）、模糊（blur）和缓动（easing）——对现有动画进行打磨和精调，并包含每个令牌何时适用的规则（开/关不对称、悬停进入 vs 悬停离开（hover-in vs hover-out）、交错偏移（stagger offsets）和意图延迟（intent delays））。作为 transitions-dev 技能的附加技能，专注于调优已有动画而非添加新过渡。当用户要求"打磨我的过渡（polish my transitions）"、"精调动画（refine the motion）"、"调整时间/缓动（tune the timing / easing）"、"让动画感觉更好/更不卡顿（make the animation feel better / less janky）"、"收紧持续时间（tighten the durations）"、"修复交错（fix the stagger）"、"对齐运动令牌（align to the motion tokens）"、"审查动画（audit the motion）"、"复查我的动画（review my animations）"、"扫描临时过渡（scan for ad-hoc transitions）"、"令牌化我的动画（tokenize my animations）"，或运行 transitions review 或 transitions polish 命令时使用。也驱动 Refine 面板的小幅精修（Small refinement）功能。触发于"动画打磨（motion polish）"、"过渡打磨（transition polish）"、"精调动画（refine motion）"、"时间感觉不对（timing feels off）"、"太慢/太快（too slow / too fast）"、"交错（stagger）"、"延迟（delay）"、"开关时间（open close timing）"、"悬停进出（hover in out）"。', cat: 'design', tags: ['agent'], domain: 'design', subcategory: 'frontend', occupation: 'arts-design-media' },
  { owner: 'mattpocock', name: 'triage', desc: '将 issue 和外部 PR 通过分类角色状态机流转——分类(categorise)、验证(verify)、必要时盘问(grill)，并编写 agent 就绪的简报(briefs)。', cat: 'agent', tags: ['agent'], domain: 'agent', subcategory: 'agent-tools', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'ubiquitous-language', desc: '从当前对话中提取 DDD 风格的统一语言(ubiquitous language)术语表，标记歧义并提出规范术语。保存到 UBIQUITOUS_LANGUAGE.md。当用户想要定义领域术语、构建术语表、硬化术语、创建统一语言，或提到"领域模型(domain model)"或"DDD"时使用。', cat: 'backend', tags: ['agent'], domain: 'development', subcategory: 'backend', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'wayfinder', desc: '将一大块工作——超过单个 agent 会话能容纳的量——规划为问题追踪器上的决策工单共享地图(decision tickets)，逐一解决直到通往目的地的路径清晰。', cat: 'agent', tags: ['agent'], domain: 'agent', subcategory: 'agent-tools', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'wizard', desc: '生成一个交互式 bash 向导(wizard)，引导人类逐步完成手动操作——第三方设置、一次性迁移、A→B 状态转换——打开 URL、捕获值、确认每一步，并写入 .env 文件和 GitHub Actions 密钥(secrets)。', cat: 'agent', tags: ['agent'], domain: 'agent', subcategory: 'agent-tools', occupation: 'computer-math' },
  { owner: 'mattpocock', name: 'writing-beats', desc: '写作，利用（exploit）——将原始素材组装成一段节拍之旅，在每个节拍依赖某个术语之前先为其奠基（grounding）。', cat: 'docs', tags: ['agent'], domain: 'docs', subcategory: 'docs', occupation: 'education-library' },
  { owner: 'mattpocock', name: 'writing-fragments', desc: '写作，探索（explore）——挖掘原始片段，尚不涉及结构。', cat: 'docs', tags: ['agent'], domain: 'docs', subcategory: 'docs', occupation: 'education-library' },
  { owner: 'mattpocock', name: 'writing-great-skills', desc: '编写和编辑优秀技能的参考——让技能变得可预测（predictable）的词汇和原则。', cat: 'docs', tags: ['agent'], domain: 'docs', subcategory: 'docs', occupation: 'education-library' },
  { owner: 'mattpocock', name: 'writing-shape', desc: '写作，利用（exploit）——将原始素材逐段塑造成文章。', cat: 'docs', tags: ['agent'], domain: 'docs', subcategory: 'docs', occupation: 'education-library' },
];

/* ═══════════════════════════════════════════════════════════════
   数据生成函数（seeded random，确保与原始数据一致）
   ═══════════════════════════════════════════════════════════════ */

/** 基于种子的伪随机数生成器 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/** 数字格式化：K / M */
export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

/** 生成 sparkline 柱状图数据 */
function generateSparkline(seed: number, length: number): number[] {
  const points: number[] = [];
  let value = 30 + Math.floor(seededRandom(seed) * 40);
  for (let i = 0; i < length; i++) {
    value = Math.max(10, Math.min(95, value + Math.floor((seededRandom(seed + i * 13) - 0.5) * 30)));
    points.push(value);
  }
  return points;
}

/** 生成评论数据 */
function generateReviews(skillId: string, count: number, seed: number): Review[] {
  const reviews: Review[] = [];
  const authors = ['alice', 'bob', 'carol', 'dave', 'eve', 'frank'];
  const bodies = [
    'Saved me hours of setup. Highly recommended.',
    'Good concept, but the docs could be clearer.',
    'Works perfectly with Claude Code.',
    'A bit slow on large repos, otherwise solid.',
    'Exactly what I was looking for.',
    'Great for automation pipelines.',
  ];
  for (let i = 0; i < count; i++) {
    reviews.push({
      id: `${skillId}-review-${i}`,
      author: authors[i % authors.length],
      avatar: authors[i % authors.length][0].toUpperCase(),
      rating: Math.floor(3 + seededRandom(seed + i) * 3),
      body: bodies[i % bodies.length],
      date: `2026-07-${String(Math.floor(seededRandom(seed + i * 7) * 28 + 1)).padStart(2, '0')}`,
    });
  }
  return reviews;
}

/** 根据 SkillDef 生成结构化 README（含 Key facts / 工作流 / 安全规则 / 限制说明） */
function generateReadme(def: SkillDef, version: string, updatedAt: string): string {
  const catName = CATEGORIES.find((c) => c.id === def.cat)?.name || def.cat;
  const tagsStr = def.tags.join(', ');

  return [
    `# ${def.name}`,
    '',
    def.desc,
    '',
    '## Key facts',
    '',
    `| Repository | \`${def.owner}/${def.name}\` |`,
    '|---|---|',
    `| Version | ${version} |`,
    '| License | MIT |',
    `| Category | ${catName} |`,
    `| Tags | ${tagsStr} |`,
    '| Runtime | Node.js >= 18 |',
    `| Last Updated | ${updatedAt} |`,
    '',
    '## Install',
    '',
    '```bash',
    `npx skills add ${def.owner}/${def.name}`,
    '```',
    '',
    '## Usage workflow',
    '',
    '### 1. Install the skill',
    '',
    'Run the install command to add the skill to your project.',
    '',
    '```bash',
    `npx skills add ${def.owner}/${def.name}`,
    '```',
    '',
    '### 2. Import and configure',
    '',
    'Import the skill and configure it with your settings.',
    '',
    '```js',
    "import { useSkill } from '@skills/core';",
    '',
    `const skill = await useSkill("${def.name}", {`,
    '  apiKey: process.env.API_KEY,',
    '});',
    '```',
    '',
    '### 3. Execute',
    '',
    'Call the skill with your input data and process the result.',
    '',
    '```js',
    'const result = await skill.run({',
    '  input: "your-data-here",',
    '});',
    '',
    'console.log(result.output);',
    '```',
    '',
    '## Safety rules (non-negotiable)',
    '',
    '1. **Validate inputs** — always check arguments before passing to the skill.',
    '2. **Handle errors** — wrap skill calls in try/catch for graceful degradation.',
    '3. **Check permissions** — ensure the skill has access to required resources.',
    '4. **Review outputs** — inspect skill results before using in production.',
    '5. **Never hardcode secrets** — use environment variables for API keys and tokens.',
    '',
    '## Limitations',
    '',
    '- Requires Node.js 18 or higher.',
    '- API rate limits may apply for cloud-dependent features.',
    '- Does not include built-in authentication management.',
    '- Performance depends on input size and complexity.',
    '',
    '## License',
    '',
    'MIT',
  ].join('\n');
}

/** 从 SKILL_DEFS 生成完整技能列表 */
function generateSkills(): Skill[] {
  const skills: Skill[] = [];
  SKILL_DEFS.forEach((def, i) => {
    const seed = i + 1;
    const installs = Math.floor(1000 + seededRandom(seed * 7) * 2500000);
    // 确保 activity8w 至少为 1，避免显示 0/100
    const activity8w = Math.max(1, Math.floor(seededRandom(seed * 3) * 100));
    const trendingRank = Math.floor(seededRandom(seed * 11) * 500) + 1;
    const rating = (3.2 + seededRandom(seed * 17) * 1.8).toFixed(1);
    const version = `v${Math.floor(seededRandom(seed) * 5 + 1)}.${Math.floor(seededRandom(seed * 2) * 10)}`;
    const reviewCount = Math.floor(seededRandom(seed * 23) * 120);
    const updatedAt = `2026-07-${String(Math.floor(seededRandom(seed) * 28 + 1)).padStart(2, '0')}`;

    // 三维分类：优先使用 def 上显式声明的值，回退到 CAT_MAPPING
    const mapping = CAT_MAPPING[def.cat] || {} as CatMapping;

    skills.push({
      id: `skill-${i + 1}`,
      name: def.name,
      owner: def.owner,
      repo: `${def.owner}/${def.name}`,
      category: [def.cat],
      tags: def.tags,
      description: def.desc,
      domain: def.domain || mapping.domain || 'development',
      subcategory: def.subcategory || mapping.subcategory || 'frontend',
      occupation: def.occupation || mapping.occupation || 'computer-math',
      installCmd: `npx skills add ${def.owner}/${def.name}`,
      installs,
      installsFormatted: formatNumber(installs),
      activity8w,
      trendingRank,
      sparkline: generateSparkline(seed, 8),
      readme: generateReadme(def, version, updatedAt),
      version,
      rating: parseFloat(rating),
      reviewCount,
      updatedAt,
      reviews: [],
    });
  });
  return skills;
}

/* ═══════════════════════════════════════════════════════════════
   生成数据 & 回填关联
   ═══════════════════════════════════════════════════════════════ */

const ALL_SKILLS: Skill[] = generateSkills();

// 为每个技能生成评论
ALL_SKILLS.forEach((skill) => {
  skill.reviews = generateReviews(skill.id, skill.reviewCount, skill.id.length);
});

// 回填 OWNERS 的 totalInstalls 和 skills 列表
OWNERS.forEach((owner) => {
  const ownerSkills = ALL_SKILLS.filter((s) => s.owner === owner.id);
  owner.skills = ownerSkills.map((s) => s.name);
  owner.totalInstalls = ownerSkills.reduce((sum, s) => sum + (s.installs || 0), 0);
});

/* ═══════════════════════════════════════════════════════════════
   查询辅助函数
   ═══════════════════════════════════════════════════════════════ */

export function getOwner(id: string): Owner | null {
  return OWNERS.find((o) => o.id === id) || null;
}

export function getSkill(id: string): Skill | null {
  return ALL_SKILLS.find((s) => s.id === id) || null;
}

export function getSkillByName(name: string): Skill | null {
  return ALL_SKILLS.find((s) => s.name === name) || null;
}

export function getCategory(id: string): Category | null {
  return CATEGORIES.find((c) => c.id === id) || null;
}

/* ═══════════════════════════════════════════════════════════════
   导出数据
   ═══════════════════════════════════════════════════════════════ */

export {
  CATEGORIES as categories,
  CATEGORY_TREE as categoryTree,
  OCCUPATIONS as occupations,
  OWNERS as owners,
  ALL_SKILLS as skills,
  TAGS as tags,
};

/** 排序技能列表 */
export function sortSkills(skillsList: Skill[], mode: SortMode): Skill[] {
  const sorted = [...skillsList];
  if (mode === 'allTime') {
    sorted.sort((a, b) => b.installs - a.installs);
  } else if (mode === 'trending') {
    sorted.sort((a, b) => a.trendingRank - b.trendingRank);
  } else if (mode === 'hot') {
    sorted.sort((a, b) => b.activity8w - a.activity8w);
  }
  return sorted;
}

/** 根据已选 domain 获取可用子分类列表 */
export function getSubcategoryOptions(domain: string): CategoryChild[] {
  const domains = domain !== 'all'
    ? CATEGORY_TREE.filter((d) => d.id === domain)
    : CATEGORY_TREE;
  const result: CategoryChild[] = [];
  domains.forEach((d) => {
    (d.children || []).forEach((c) => {
      result.push({ id: c.id, name: c.name, nameEn: c.nameEn, count: c.count });
    });
  });
  return result;
}

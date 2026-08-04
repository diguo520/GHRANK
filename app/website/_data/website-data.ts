/**
 * 网站目录页数据 —— 迁移自 website.js 的 SITES + 分类映射
 * 24 条收录网站，按 7 个分类组织，支持分类筛选 / 搜索 / 排序
 */

/* ═══ 类型定义 ═══ */

/** 网站分类枚举 */
export type WebsiteCategory =
  | 'ai-tools'
  | 'developer'
  | 'design'
  | 'productivity'
  | 'learning'
  | 'news'
  | 'open-source';

/** 收录网站数据 */
export interface Site {
  category: WebsiteCategory;
  name: string;
  url: string;
  desc: string;
  visits: number;
  favicon: string;
}

/* ═══ 分类显示名映射 ═══ */
export const CATEGORY_LABELS: Record<WebsiteCategory | 'all', string> = {
  'all': 'All Sites',
  'ai-tools': 'AI Tools',
  'developer': 'Developer',
  'design': 'Design',
  'productivity': 'Productivity',
  'learning': 'Learning',
  'news': 'News & Media',
  'open-source': 'Open Source',
};

/* ═══ 分类侧边栏配置：编号 + 显示数量 ═══ */
export const CATEGORY_NAV: { category: WebsiteCategory; index: string; count: number }[] = [
  { category: 'ai-tools',     index: '01', count: 386 },
  { category: 'developer',    index: '02', count: 242 },
  { category: 'design',       index: '03', count: 198 },
  { category: 'productivity', index: '04', count: 156 },
  { category: 'learning',     index: '05', count: 134 },
  { category: 'news',         index: '06', count: 89 },
  { category: 'open-source',  index: '07', count: 76 },
];

/* ═══ 分类颜色样式（favicon + 标签共用） ═══ */
export const CATEGORY_STYLES: Record<WebsiteCategory, { color: string; bg: string; border: string }> = {
  'ai-tools':     { color: 'var(--cyan)',   bg: 'rgba(57, 210, 192, 0.1)',  border: 'rgba(57, 210, 192, 0.5)' },
  'developer':    { color: 'var(--green)',  bg: 'rgba(63, 185, 80, 0.1)',   border: 'rgba(63, 185, 80, 0.5)' },
  'design':       { color: 'var(--purple)', bg: 'rgba(163, 113, 247, 0.1)', border: 'rgba(163, 113, 247, 0.5)' },
  'productivity': { color: 'var(--orange)', bg: 'rgba(232, 93, 4, 0.1)',    border: 'rgba(232, 93, 4, 0.5)' },
  'learning':     { color: 'var(--gold)',   bg: 'rgba(245, 197, 24, 0.1)',  border: 'rgba(245, 197, 24, 0.35)' },
  'news':         { color: 'var(--pink)',   bg: 'rgba(247, 120, 186, 0.1)', border: 'rgba(247, 120, 186, 0.5)' },
  'open-source':  { color: '#58a6ff',       bg: 'rgba(88, 166, 255, 0.1)',  border: 'rgba(88, 166, 255, 0.5)' },
};

/* ═══ 分页大小：每批加载的卡片数 ═══ */
export const PAGE_SIZE = 8;

/* ═══ 排序选项 ═══ */
export const SORT_OPTIONS = [
  { value: 'popular', label: 'Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'alphabetical', label: 'Alphabetical' },
] as const;

/* ═══ 网站数据（24 条） ═══ */
export const SITES: Site[] = [
  { category: 'ai-tools',     name: 'OpenAI',                      url: 'openai.com',              desc: 'Creator of GPT models, ChatGPT, DALL-E, and the API platform powering the modern AI ecosystem.',          visits: 4800000, favicon: 'O' },
  { category: 'ai-tools',     name: 'Hugging Face',                url: 'huggingface.co',          desc: 'The platform where the ML community collaborates on models, datasets, and applications.',                  visits: 3200000, favicon: 'H' },
  { category: 'ai-tools',     name: 'Replicate',                   url: 'replicate.com',           desc: 'Run open-source models in the cloud with a simple API, or deploy your own custom models.',                 visits: 980000,  favicon: 'R' },
  { category: 'ai-tools',     name: 'Anthropic',                   url: 'anthropic.com',           desc: 'AI safety company building Claude, the assistant for reliable and interpretable AI systems.',              visits: 4100000, favicon: 'A' },
  { category: 'ai-tools',     name: 'Cohere',                      url: 'cohere.com',              desc: 'Enterprise-grade LLMs and retrieval APIs for search, summarization, and RAG workflows.',                    visits: 720000,  favicon: 'C' },
  { category: 'ai-tools',     name: 'Stability AI',                url: 'stability.ai',            desc: 'Open generative AI research lab behind Stable Diffusion and a suite of multimodal models.',                 visits: 640000,  favicon: 'S' },
  { category: 'developer',    name: 'GitHub',                      url: 'github.com',              desc: 'The complete developer platform to build, scale, and deliver secure software.',                            visits: 3200000, favicon: 'G' },
  { category: 'developer',    name: 'Stack Overflow',              url: 'stackoverflow.com',       desc: 'The largest online community for programmers to learn, share knowledge, and advance careers.',            visits: 2800000, favicon: 'S' },
  { category: 'developer',    name: 'MDN Web Docs',                url: 'developer.mozilla.org',   desc: "Mozilla's open-source documentation for web platform standards, APIs, and browser features.",              visits: 1900000, favicon: 'M' },
  { category: 'developer',    name: 'Vercel',                      url: 'vercel.com',              desc: 'The platform for frontend developers, providing the speed and reliability of serverless infrastructure.',  visits: 860000,  favicon: 'V' },
  { category: 'developer',    name: 'Cloudflare',                  url: 'cloudflare.com',          desc: 'Connect, protect, and build on the internet with a global edge network and developer platform.',           visits: 2400000, favicon: 'C' },
  { category: 'design',       name: 'Figma',                       url: 'figma.com',               desc: 'The collaborative interface design tool for teams to create, prototype, and ship products together.',       visits: 5200000, favicon: 'F' },
  { category: 'design',       name: 'Dribbble',                    url: 'dribbble.com',            desc: 'The community for designers to share work, get inspired, and find their next opportunity.',                 visits: 1400000, favicon: 'D' },
  { category: 'design',       name: 'Behance',                     url: 'behance.net',             desc: "Adobe's platform for creatives to showcase and discover leading creative portfolios worldwide.",           visits: 1800000, favicon: 'B' },
  { category: 'design',       name: 'Coolors',                     url: 'coolors.co',              desc: 'Generate, explore, and export beautiful color palettes in seconds for any design project.',                visits: 510000,  favicon: 'C' },
  { category: 'productivity', name: 'Notion',                      url: 'notion.so',               desc: 'The connected workspace for docs, wikis, and projects that helps teams move faster together.',             visits: 6100000, favicon: 'N' },
  { category: 'productivity', name: 'Linear',                      url: 'linear.app',              desc: 'The issue tracking tool built for high-performance software teams with speed and focus.',                   visits: 990000,  favicon: 'L' },
  { category: 'productivity', name: 'Obsidian',                    url: 'obsidian.md',             desc: 'A knowledge base that works on local Markdown files, giving you full control over your notes.',             visits: 470000,  favicon: 'O' },
  { category: 'learning',     name: 'freeCodeCamp',                url: 'freecodecamp.org',        desc: 'Learn to code for free with thousands of interactive challenges and full certifications.',                   visits: 1300000, favicon: 'f' },
  { category: 'learning',     name: 'Coursera',                    url: 'coursera.org',            desc: 'Online courses, certificates, and degrees from world-class universities and companies.',                    visits: 2200000, favicon: 'C' },
  { category: 'news',         name: 'Hacker News',                 url: 'news.ycombinator.com',    desc: 'A social news website focusing on computer science, startups, and the tech industry.',                      visits: 1100000, favicon: 'Y' },
  { category: 'news',         name: 'TechCrunch',                  url: 'techcrunch.com',          desc: 'Breaking technology news, startup funding rounds, and analysis of the tech industry.',                      visits: 1700000, favicon: 'T' },
  { category: 'open-source',  name: 'Linux Foundation',            url: 'linuxfoundation.org',     desc: 'The nonprofit consortium enabling the open source ecosystem for projects like Linux and Kubernetes.',       visits: 380000,  favicon: 'L' },
  { category: 'open-source',  name: 'Apache Software Foundation',  url: 'apache.org',              desc: 'A decentralized open source community developing 350+ projects including Kafka, Spark, and HTTP Server.',  visits: 290000,  favicon: 'A' },
];

/* ═══ More 区块标签（侧边栏底部链接，SVG 图标在组件中渲染） ═══ */
export const MORE_LINK_LABELS = ['Submit a Site', 'Report Broken Link', 'Subscribe'];

/**
 * 页面配置表 —— 全站统一数据源
 * 迁移自 core.js 的 PAGE_CONFIG
 */

export interface TickerItem {
  text: string;
  href: string;
}

export interface PageConfig {
  tickerLabel: string;
  tickerItems: TickerItem[];
  searchPlaceholder: string;
  footerText: string;
  footerLinks: string[];
}

export const PAGE_CONFIG: Record<string, PageConfig> = {
  index: {
    tickerLabel: 'LIVE FEED',
    tickerItems: [
      { text: 'facebook/react <span>230K&#9733;</span>', href: '/community/detail' },
      { text: 'torvalds/linux <span>182K&#9733;</span>', href: '/community/detail' },
      { text: 'langchain-ai/langchain <span>96.7K&#9733;</span>', href: '/community/detail' },
      { text: 'rust-lang/rust <span>99.8K&#9733;</span>', href: '/community/detail' },
      { text: 'godotengine/godot <span>95.3K&#9733;</span>', href: '/community/detail' },
      { text: 'nextjs/next.js <span>128K&#9733;</span>', href: '/community/detail' },
      { text: 'docker/engine <span>69.4K&#9733;</span>', href: '/community/detail' },
      { text: 'vuejs/core <span>48.2K&#9733;</span>', href: '/community/detail' },
      { text: 'openai/whisper <span>72.8K&#9733;</span>', href: '/community/detail' },
      { text: 'denoland/deno <span>98.2K&#9733;</span>', href: '/community/detail' },
      { text: 'shadcn-ui/ui <span>81.4K&#9733;</span>', href: '/community/detail' },
      { text: 'tiangolo/fastapi <span>82.1K&#9733;</span>', href: '/community/detail' },
    ],
    searchPlaceholder: 'Search repos...',
    footerText: 'Data sourced from GitHub API \u2014 Ranked by multi-factor scoring with time-decay weighting',
    footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms'],
  },
  news: {
    tickerLabel: 'NEWS FEED',
    tickerItems: [
      { text: 'GPT-5 Official Release <span>BREAKING</span>', href: '/news' },
      { text: 'Anthropic Claude 4 Launch <span>NEW</span>', href: '/news' },
      { text: 'Meta LLama 4 Open Source <span>HOT</span>', href: '/news' },
      { text: 'Google Gemini Ultra 2 <span>UPDATE</span>', href: '/news' },
      { text: 'OpenAI DevDay 2026 <span>EVENT</span>', href: '/news' },
      { text: 'Mistral Large 3 Released <span>NEW</span>', href: '/news' },
      { text: 'xAI Grok 3 Update <span>LIVE</span>', href: '/news' },
      { text: 'Stability AI SD 4.0 <span>BREAKING</span>', href: '/news' },
    ],
    searchPlaceholder: 'Search news...',
    footerText: 'GHRANK Intelligence Feed \u2014 Aggregated from 2,400+ AI sources worldwide',
    footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms'],
  },
  prompt: {
    tickerLabel: 'PROMPT FEED',
    tickerItems: [
      { text: 'Cinematic Portrait Generator <span>SOLD</span>', href: '/prompt-detail' },
      { text: 'Code Review Assistant v3 <span>+47 uses</span>', href: '/prompt-detail' },
      { text: 'Midjourney Style Transfer <span>HOT</span>', href: '/prompt-detail' },
      { text: 'SEO Blog Writer Pro <span>+128 uses</span>', href: '/prompt-detail' },
      { text: 'UI/UX Design Critic <span>NEW</span>', href: '/prompt-detail' },
      { text: 'Data Analysis Copilot <span>+89 uses</span>', href: '/prompt-detail' },
      { text: 'Stable Diffusion Negative <span>SOLD</span>', href: '/prompt-detail' },
      { text: 'API Documentation Gen <span>+34 uses</span>', href: '/prompt-detail' },
    ],
    searchPlaceholder: 'Search prompts...',
    footerText: 'Prompt Marketplace \u2014 Trade intelligence. Powered by GHRANK.',
    footerLinks: ['About Us', 'Sponsors', 'Changelog', 'Terms'],
  },
};

/** 导航链接 —— Next.js 路由格式 */
export const NAV_LINKS = [
  { href: '/', page: 'index', label: 'HOME' },
  { href: '/news', page: 'news', label: 'NEWS' },
  { href: '/skills', page: 'skills', label: 'SKILLS' },
  { href: '/prompt', page: 'prompt', label: 'PROMPT' },
  { href: '/website', page: 'website', label: 'WEBSITE' },
  { href: '#', page: 'study', label: 'STUDY' },
  { href: '/community', page: 'community', label: 'COMMUNITY' },
];

/** 搜索数据 */
export const SEARCH_DATA = [
  { name: 'facebook/react', desc: 'The library for web and native user interfaces.', tag: 'Frontend', tagClass: 'tag-frontend', stars: '230K', url: '/community/detail' },
  { name: 'torvalds/linux', desc: 'Linux kernel source tree. The core of the Linux operating system.', tag: 'Backend', tagClass: 'tag-backend', stars: '182K', url: '/community/detail' },
  { name: 'vuejs/core', desc: 'The Progressive JavaScript Framework for building web UIs.', tag: 'Frontend', tagClass: 'tag-frontend', stars: '48.2K', url: '/community/detail' },
  { name: 'openai/whisper', desc: 'Robust Speech Recognition via Large-Scale Weak Supervision.', tag: 'AI/ML', tagClass: 'tag-ai', stars: '72.8K', url: '/community/detail' },
  { name: 'docker/engine', desc: 'Docker Engine — open source containerization technology.', tag: 'DevOps', tagClass: 'tag-devops', stars: '69.4K', url: '/community/detail' },
  { name: 'godotengine/godot', desc: 'Godot Engine — Multi-platform 2D and 3D game engine.', tag: 'Games', tagClass: 'tag-games', stars: '95.3K', url: '/community/detail' },
  { name: 'tiangolo/fastapi', desc: 'FastAPI framework, high performance, easy to learn, fast to code.', tag: 'Backend', tagClass: 'tag-backend', stars: '82.1K', url: '/community/detail' },
  { name: 'langchain-ai/langchain', desc: 'Build context-aware reasoning applications with LLMs.', tag: 'AI/ML', tagClass: 'tag-ai', stars: '96.7K', url: '/community/detail' },
  { name: 'shadcn-ui/ui', desc: 'Beautifully designed components built with Radix UI and Tailwind CSS.', tag: 'Frontend', tagClass: 'tag-frontend', stars: '81.4K', url: '/community/detail' },
  { name: 'rust-lang/rust', desc: 'Empowering everyone to build reliable and efficient software.', tag: 'Backend', tagClass: 'tag-backend', stars: '99.8K', url: '/community/detail' },
  { name: 'vercel/next.js', desc: 'The React Framework for the Web. Full-stack web applications.', tag: 'Frontend', tagClass: 'tag-frontend', stars: '128K', url: '/community/detail' },
  { name: 'denoland/deno', desc: 'A modern runtime for JavaScript and TypeScript. Secure by default.', tag: 'Backend', tagClass: 'tag-backend', stars: '98.2K', url: '/community/detail' },
  { name: 'kubernetes/kubernetes', desc: 'Production-Grade Container Scheduling and Management.', tag: 'DevOps', tagClass: 'tag-devops', stars: '112K', url: '/community/detail' },
  { name: 'huggingface/transformers', desc: 'State-of-the-art ML for PyTorch, TensorFlow, and JAX.', tag: 'AI/ML', tagClass: 'tag-ai', stars: '134K', url: '/community/detail' },
  { name: 'tailwindlabs/tailwindcss', desc: 'A utility-first CSS framework for rapid UI development.', tag: 'Frontend', tagClass: 'tag-frontend', stars: '82.4K', url: '/community/detail' },
  { name: 'flutter/flutter', desc: "Google's UI toolkit for building natively compiled applications.", tag: 'Mobile', tagClass: 'tag-mobile', stars: '164K', url: '/community/detail' },
];

/** 获取页面配置 */
export function getConfig(page: string): PageConfig {
  return PAGE_CONFIG[page] || PAGE_CONFIG['index'];
}

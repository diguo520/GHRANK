/**
 * 椤甸潰閰嶇疆琛?鈥斺€?鍏ㄧ珯缁熶竴鏁版嵁婧愶紙GHRANK 绀惧尯鐙珛椤圭洰锛? * 绮剧畝锛氱Щ闄?GitHub 鎺掕姒滃鑸€佹悳绱㈡暟鎹笌 Ticker 鏁版嵁锛屼繚鐣欑ぞ鍖?鐢ㄦ埛鐩稿叧閰嶇疆
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

/* 鈺愨晲鈺?缁熶竴鍏辩敤閰嶇疆锛堢ぞ鍖?+ 鐢ㄦ埛鍏ㄥ眬涓€濂楋級 鈺愨晲鈺?*/
const COMMUNITY_TICKER: TickerItem[] = [
  { text: 'Hot: Best Answer Allocation Released <span>UPDATE</span>', href: '/community/detail?id=3036' },
  { text: 'Tieba Leaderboard Live <span>HOT</span>', href: '/community/tiebas' },
  { text: 'Weekend Hackathon - Join Now <span>EVENT</span>', href: '/community/tag?tag=hackathon' },
  { text: 'Q&A Thread: React 19 Migration <span>20+ replies</span>', href: '/community/detail?id=3040' },
  { text: 'Creators Reward Pool Live <span>$10,000</span>', href: '/wallet' },
  { text: 'New Prompt Tags Added <span>NEW</span>', href: '/community/tiebas/explore' },
];

const COMMUNITY_FOOTER_TEXT = 'GHRANK Community 鈥?Discuss, share, and earn rewards.';

export const PAGE_CONFIG: Record<string, PageConfig> = {
  index: {
    tickerLabel: 'COMMUNITY FEED',
    tickerItems: COMMUNITY_TICKER,
    searchPlaceholder: 'Search communities, posts, users...',
    footerText: COMMUNITY_FOOTER_TEXT,
    footerLinks: ['About', 'Rules', 'FAQ', 'Terms'],
  },
  community: {
    tickerLabel: 'COMMUNITY FEED',
    tickerItems: COMMUNITY_TICKER,
    searchPlaceholder: 'Search posts, tiebas, or users...',
    footerText: COMMUNITY_FOOTER_TEXT,
    footerLinks: ['About', 'Rules', 'FAQ', 'Terms'],
  },
  profile: {
    tickerLabel: 'PROFILE',
    tickerItems: COMMUNITY_TICKER,
    searchPlaceholder: 'Search community...',
    footerText: COMMUNITY_FOOTER_TEXT,
    footerLinks: ['About', 'Rules', 'FAQ', 'Terms'],
  },
  settings: {
    tickerLabel: 'SETTINGS',
    tickerItems: COMMUNITY_TICKER,
    searchPlaceholder: 'Search settings...',
    footerText: COMMUNITY_FOOTER_TEXT,
    footerLinks: ['About', 'Rules', 'FAQ', 'Terms'],
  },
  search: {
    tickerLabel: 'SEARCH',
    tickerItems: COMMUNITY_TICKER,
    searchPlaceholder: 'Search posts, users, tiebas...',
    footerText: COMMUNITY_FOOTER_TEXT,
    footerLinks: ['About', 'Rules', 'FAQ', 'Terms'],
  },
  messages: {
    tickerLabel: 'MESSAGES',
    tickerItems: COMMUNITY_TICKER,
    searchPlaceholder: 'Search conversations...',
    footerText: COMMUNITY_FOOTER_TEXT,
    footerLinks: ['About', 'Rules', 'FAQ', 'Terms'],
  },
  notifications: {
    tickerLabel: 'NOTIFICATIONS',
    tickerItems: COMMUNITY_TICKER,
    searchPlaceholder: 'Search notifications...',
    footerText: COMMUNITY_FOOTER_TEXT,
    footerLinks: ['About', 'Rules', 'FAQ', 'Terms'],
  },
  wallet: {
    tickerLabel: 'WALLET',
    tickerItems: COMMUNITY_TICKER,
    searchPlaceholder: 'Search transactions...',
    footerText: COMMUNITY_FOOTER_TEXT,
    footerLinks: ['About', 'Rules', 'FAQ', 'Terms'],
  },
  login: {
    tickerLabel: 'WELCOME',
    tickerItems: COMMUNITY_TICKER,
    searchPlaceholder: 'Search...',
    footerText: COMMUNITY_FOOTER_TEXT,
    footerLinks: ['About', 'Rules', 'FAQ', 'Terms'],
  },
  register: {
    tickerLabel: 'SIGN UP',
    tickerItems: COMMUNITY_TICKER,
    searchPlaceholder: 'Search...',
    footerText: COMMUNITY_FOOTER_TEXT,
    footerLinks: ['About', 'Rules', 'FAQ', 'Terms'],
  },
  about: {
    tickerLabel: 'ABOUT',
    tickerItems: COMMUNITY_TICKER,
    searchPlaceholder: 'Search this site...',
    footerText: COMMUNITY_FOOTER_TEXT,
    footerLinks: ['About', 'Rules', 'FAQ', 'Terms'],
  },
};

/** 瀵艰埅閾炬帴 鈥斺€?绮剧畝锛氬彧淇濈暀绀惧尯/鐢ㄦ埛鐩稿叧椤甸潰
 *  HOME 鈫?璺崇ぞ鍖?銆?COMMUNITY锛堢ぞ鍖猴級 銆?EXPLORE锛堣创鍚?鏂板笘鍏ュ彛锛夈€?SEARCH 銆?WALLET
 */
export const NAV_LINKS = [
  { href: '/', page: 'index', label: 'HOME' },
  { href: '/community', page: 'community', label: 'COMMUNITY' },
];

/** 鎼滅储鏁版嵁锛堢ぞ鍖虹増锛氭贩鍚堢ぞ鍖哄笘瀛?+ 鐢ㄦ埛 + 璐村惂锛?*/
export const SEARCH_DATA = [
  { name: 'React 19 Migration FAQ', desc: 'Comprehensive Q&A for upgrading to React 19 with known issues.', tag: 'Discussion', tagClass: 'tag-frontend', stars: '128', url: '/community/detail?id=3036' },
  { name: 'Open Source Collaboration Guide', desc: 'How to contribute to projects, write good PRs, and review code.', tag: 'Guide', tagClass: 'tag-backend', stars: '96', url: '/community/detail?id=3040' },
  { name: 'Next.js 16 Turbopack Tips', desc: 'Performance tuning for large Next.js projects with Turbopack.', tag: 'Tech', tagClass: 'tag-frontend', stars: '82', url: '/community/detail' },
  { name: 'CSS Tips: Glassmorphism Deep Dive', desc: 'Implementing glassmorphism effects with backdrop-filter safely.', tag: 'Design', tagClass: 'tag-frontend', stars: '65', url: '/community/detail' },
  { name: 'Prompt Engineering Basics', desc: 'Beginner-friendly patterns for writing reliable LLM prompts.', tag: 'AI', tagClass: 'tag-ai', stars: '210', url: '/community/detail' },
  { name: 'Frontend Tieba', desc: 'All things React, Vue, Svelte, CSS, and beyond.', tag: 'Tieba', tagClass: 'tag-frontend', stars: '3.2K', url: '/community/tiebas' },
  { name: 'Backend & DevOps Tieba', desc: 'Rust/Go/Node/Python microservices, K8s, CI/CD.', tag: 'Tieba', tagClass: 'tag-devops', stars: '1.8K', url: '/community/tiebas' },
  { name: 'AI & ML Tieba', desc: 'LLMs, agents, RAG, fine-tuning, and ML engineering.', tag: 'Tieba', tagClass: 'tag-ai', stars: '4.1K', url: '/community/tiebas' },
  { name: 'alexshader (Top Contributor)', desc: 'Expert in React, TypeScript, and performance optimization.', tag: 'User', tagClass: 'tag-backend', stars: '5.2K', url: '/profile' },
  { name: 'nova_dev (Moderator)', desc: 'Community moderator, full-stack engineer, DevOps lead.', tag: 'User', tagClass: 'tag-devops', stars: '3.8K', url: '/profile' },
];

/** 鑾峰彇椤甸潰閰嶇疆 */
export function getConfig(page: string): PageConfig {
  return PAGE_CONFIG[page] || PAGE_CONFIG['index'];
}
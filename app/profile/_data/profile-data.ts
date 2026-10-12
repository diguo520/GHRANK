/**
 * Profile 页面数据 —— 类型定义 + 静态 mock 数据
 *
 * 包含：用户基本信息、统计、Prompt 作品、活动记录、成就徽章
 *
 * 头像规范（与社区页面 / about 页面保持一致）：
 *   优先使用 1~2 个大写字母的"字母徽章"（如 'AS' → 渲染圆形金色底字母）。
 *   若后续接入真实图片，传以 "/" 开头（public 静态）或 http(s) 开头（远程）
 *   并带 .jpg / .png / .webp 后缀即可，ProfileHeader 会自动切换 Image 渲染。
 */

/* ═══════════════════════════════════════════════════
   类型定义
   ═══════════════════════════════════════════════════ */

/** 用户基本信息 */
export interface UserProfile {
  username: string;
  displayName: string;
  avatar: string;
  banner: string;
  role: string;
  bio: string;
  joinedDate: string;
  location: string;
  website: string;
  github: string;
  email: string;
  /** 数值型统计，用于 settings/messages/wallet 右侧 MiniStat（与 PROFILE_STATS 文案版区分） */
  stats: {
    prompts: number;
    followers: number;
    following: number;
    tipsEarned: number;
  };
}

/** 统计项 */
export interface ProfileStat {
  label: string;
  value: string;
  icon: 'prompt' | 'follower' | 'following' | 'tip';
}

/** Prompt 作品项 */
export interface ProfilePrompt {
  id: number;
  title: string;
  model: string;
  price: number;
  likes: number;
  views: number;
  thumbnail: string;
  category: string;
  createdAt: string;
  status: 'published' | 'draft';
}

/** 活动记录项 */
export interface ProfileActivity {
  id: number;
  type: 'publish' | 'like' | 'comment' | 'tip' | 'follow' | 'purchase';
  target: string;
  targetHref: string;
  detail?: string;
  amount?: string;
  timeAgo: string;
}

/** 成就徽章 */
export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
}

/**
 * Bookmarks 书签项 —— 混合类型（prompts / GitHub repos / Tieba 帖子 / AI 文章）
 * 为瀑布流准备不同高度：缩略图 URL、类别、收藏时间等
 */
export type BookmarkKind = 'prompt' | 'repo' | 'thread' | 'article';

export interface ProfileBookmark {
  id: number;
  kind: BookmarkKind;
  title: string;
  subtitle: string;                // 次行显示：作者 / 组织 / 分类
  href: string;                    // 点击跳转链接
  thumbnail: string;               // 封面图 URL（使用 AI 生成服务，避免本地 404）
  category: string;                // 右上角分类角标
  accent?: 'gold' | 'cyan' | 'green' | 'pink'; // 分类角标配色
  stars?: number;                  // 星星/喜欢数
  commentCount?: number;           // 评论数
  savedAt: string;                 // 收藏时间
  tags: string[];                  // 底部标签
  heightVariant: 'tall' | 'normal' | 'short' | 'wide'; // 瀑布流高度变体
}

/* ═══════════════════════════════════════════════════
   静态数据
   ═══════════════════════════════════════════════════ */

/** 当前用户信息 */
export const USER_PROFILE: UserProfile = {
  username: 'AlexShader',
  displayName: 'Alex Shader',
  // —— 字母徽章 'AS'，与社区/about 页面保持一致，避免 /images/demo/* 路径不存在的 404
  avatar: 'AS',
  banner: '',
  role: 'Top Seller',
  bio: 'AI prompt engineer & open-source enthusiast. Specializing in cinematic portrait generation and production-ready React architecture patterns.',
  joinedDate: 'Jan 2025',
  location: 'San Francisco, CA',
  website: 'alexshader.dev',
  github: 'github.com/alexshader',
  email: 'alex@ghrank.io',
  stats: {
    prompts: 142,
    followers: 2400,
    following: 89,
    tipsEarned: 1247,
  },
};

/** 统计四联 —— 与顶部卡片数值保持一致 */
export const PROFILE_STATS: ProfileStat[] = [
  { label: 'Prompts', value: '142', icon: 'prompt' },
  { label: 'Followers', value: '2.4K', icon: 'follower' },
  { label: 'Following', value: '89', icon: 'following' },
  { label: 'Tips Earned', value: '$1,247', icon: 'tip' },
];

/** 封面图辅助：用可在线渲染的 AI 占位图，避免 public/images/demo 不存在导致 next/image 404
 *  依据目的生成不同的「风格 + 主题 + 主色」组合，保证每张封面在瀑布流中错落有致。
 */
function cover(purpose: string, palette: string, aspect: 'landscape_16_9' | 'portrait_4_3' | 'square_hd' = 'landscape_16_9') {
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    purpose,
  )}%2C%20${encodeURIComponent(palette)}%20palette%2C%20minimal%20cover%20art&image_size=${aspect}`;
}

/** Prompt 作品列表 —— 扩充到 14 条（原 6 条 + 新增 8 条），
 *  缩略图全部改为在线生成封面，保持瀑布流视觉差异；数据量足够让 Masonry 四列有错落感。
 */
export const PROFILE_PROMPTS: ProfilePrompt[] = [
  // —— 原 6 条：替换 thumbnail 为在线封面 ——
  { id: 1,  title: 'Cinematic Portrait Generator',        model: 'Midjourney v6', price: 5, likes: 342, views: 12400, thumbnail: cover('dark cinematic portrait with rim lighting, moody and dramatic', 'warm golden black', 'portrait_4_3'), category: 'Portrait',   createdAt: '3 days ago',   status: 'published' },
  { id: 2,  title: 'SEO Blog Writer Pro',                  model: 'GPT-4o',        price: 3, likes: 187, views: 8900,  thumbnail: cover('editorial blog header, ink serif typography on cream paper', 'cream ink navy', 'landscape_16_9'), category: 'Writing',    createdAt: '1 week ago',   status: 'published' },
  { id: 3,  title: 'React Architecture Advisor',           model: 'Claude 3.5',    price: 0, likes: 256, views: 15200, thumbnail: cover('minimal React component tree diagram with fiber nodes', 'mint cyan navy', 'square_hd'),     category: 'Dev',        createdAt: '2 weeks ago',  status: 'published' },
  { id: 4,  title: 'Vector DB Benchmark Kit',              model: 'GPT-4o',        price: 8, likes: 98,  views: 4300,  thumbnail: cover('vector database HNSW graph visualizer, glowing edges', 'deep purple emerald', 'portrait_4_3'), category: 'Data',       createdAt: '3 weeks ago',  status: 'published' },
  { id: 5,  title: 'Film Color Grading Assistant',         model: 'Midjourney v6', price: 5, likes: 173, views: 6700,  thumbnail: cover('Kodak 2383 film grade color swatches with grain', 'teal orange magenta', 'landscape_16_9'), category: 'Art',        createdAt: '1 month ago',  status: 'published' },
  { id: 6,  title: 'CLI Tool Generator (Draft)',           model: 'Claude 3.5',    price: 0, likes: 0,   views: 0,     thumbnail: cover('terminal ASCII prompt with neon cursor and manpage', 'mono neon green', 'landscape_16_9'), category: 'Dev',        createdAt: '2 days ago',   status: 'draft' },
  // —— 新增 8 条 ——
  { id: 7,  title: 'Animation Motion Blueprint',           model: 'Runway Gen-3',  price: 6, likes: 215, views: 7800,  thumbnail: cover('storyboard frames with motion blur arrows', 'soft lavender peach', 'portrait_4_3'), category: 'Motion',     createdAt: '4 days ago',   status: 'published' },
  { id: 8,  title: 'Neon Cyberpunk City',                   model: 'Midjourney v6', price: 4, likes: 512, views: 21900, thumbnail: cover('rainy neon cyberpunk Tokyo alley with kanji signs', 'magenta electric cyan', 'landscape_16_9'), category: 'Art',        createdAt: '5 days ago',   status: 'published' },
  { id: 9,  title: 'Onboarding UX Copywriter',              model: 'GPT-4o',        price: 4, likes: 87,  views: 3400,  thumbnail: cover('mobile onboarding flow with copy annotations', 'cream soft blue', 'square_hd'),     category: 'Writing',    createdAt: '1 week ago',   status: 'published' },
  { id: 10, title: 'Postgres Query Tuner',                  model: 'Claude 3.5',    price: 9, likes: 156, views: 5200,  thumbnail: cover('EXPLAIN query plan tree diagram visualized', 'gold slate', 'portrait_4_3'),      category: 'Data',       createdAt: '10 days ago',  status: 'published' },
  { id: 11, title: 'Rust Crate Skeleton (Draft)',           model: 'Claude 3.5',    price: 0, likes: 0,   views: 0,     thumbnail: cover('ferris crab mascot with cargo toml and code editor', 'rust orange charcoal', 'square_hd'), category: 'Dev',        createdAt: '6 days ago',   status: 'draft' },
  { id: 12, title: 'Scientific Paper Illustrator',          model: 'Midjourney v6', price: 7, likes: 64,  views: 2600,  thumbnail: cover('academic paper figure, elegant geometric diagrams', 'ivory muted navy', 'landscape_16_9'), category: 'Art',        createdAt: '2 weeks ago',  status: 'published' },
  { id: 13, title: 'Shadcn UI Landing Page Kit',            model: 'Claude 3.5',    price: 5, likes: 301, views: 11500, thumbnail: cover('shadcn landing page grid, glassmorphism cards', 'stone gold violet', 'square_hd'), category: 'Dev',        createdAt: '3 days ago',   status: 'published' },
  { id: 14, title: 'Podcast Host + Show Notes',             model: 'GPT-4o',        price: 3, likes: 48,  views: 1900,  thumbnail: cover('podcast studio mic silhouette with waveform', 'warm burgundy cream', 'portrait_4_3'), category: 'Writing',    createdAt: '3 weeks ago',  status: 'published' },
];

/** Bookmarks 独立 6 条（混合 prompts / repos / tieba threads / AI articles），
 *  —— 「模拟数据看看效果」：高度变体 + 不同 accent 配色，让 Bookmarks 瀑布流错落。
 */
export const PROFILE_BOOKMARKS: ProfileBookmark[] = [
  {
    id: 101, kind: 'repo',
    title: 'facebook / react',
    subtitle: 'The library for web and native user interfaces',
    href: 'https://github.com/facebook/react',
    thumbnail: cover('React official repo hero, atomic fiber diagram with logo', 'electric blue graphite', 'landscape_16_9'),
    category: 'GitHub · ⭐ 232K', accent: 'cyan',
    stars: 232000, commentCount: 12043, savedAt: 'Saved yesterday',
    tags: ['UI', 'Library', 'Meta', 'JSX'],
    heightVariant: 'normal',
  },
  {
    id: 102, kind: 'prompt',
    title: 'Film Color Grading Assistant',
    subtitle: 'Prompt by @mirakade · Midjourney v6',
    href: '/prompt-detail?id=5',
    thumbnail: cover('Kodak 2383 film grade color swatches with grain, teal-orange split', 'teal orange magenta', 'portrait_4_3'),
    category: 'Prompt · $5', accent: 'gold',
    stars: 173, commentCount: 28, savedAt: 'Saved 3 days ago',
    tags: ['Color', 'Film', 'Midjourney'],
    heightVariant: 'tall',
  },
  {
    id: 103, kind: 'thread',
    title: 'What pitfalls have you hit with Next.js 18 Form Actions?',
    subtitle: 'Tieba · Next.js Practical Community · 47 replies',
    href: '/community/tiebas/nextjs-thread-2048',
    thumbnail: cover('chinese dev community thread, Next.js code snippet', 'deep dark blue warm yellow', 'landscape_16_9'),
    category: 'Tieba · 🔥 Hot', accent: 'pink',
    stars: 412, commentCount: 47, savedAt: 'Saved 1 week ago',
    tags: ['Next.js', 'RSC', 'Form Actions'],
    heightVariant: 'short',
  },
  {
    id: 104, kind: 'article',
    title: 'A Field Guide to Fiber: Inside React 18.3',
    subtitle: 'Article · GHRANK Blog · 18 min read',
    href: '/about#articles',
    thumbnail: cover('React fiber internals longform article header with charts', 'gold ink black', 'landscape_16_9'),
    category: 'Article · 18 min', accent: 'green',
    stars: 1280, commentCount: 92, savedAt: 'Saved 2 weeks ago',
    tags: ['React', 'Architecture', 'Deep-dive'],
    heightVariant: 'wide',
  },
  {
    id: 105, kind: 'prompt',
    title: 'Animation Motion Blueprint',
    subtitle: 'Prompt by me · Runway Gen-3',
    href: '/prompt-detail?id=7',
    thumbnail: cover('motion design storyboard panels with velocity arrows', 'lavender peach coral', 'portrait_4_3'),
    category: 'Prompt · $6', accent: 'gold',
    stars: 215, commentCount: 34, savedAt: 'Saved 4 days ago',
    tags: ['Motion', 'Storyboard', 'Runway'],
    heightVariant: 'tall',
  },
  {
    id: 106, kind: 'repo',
    title: 'qdrant / qdrant',
    subtitle: 'Qdrant - Vector Database for the next generation of AI applications',
    href: 'https://github.com/qdrant/qdrant',
    thumbnail: cover('Qdrant vector database logo with HNSW index visualization', 'emerald slate dark', 'landscape_16_9'),
    category: 'GitHub · ⭐ 20.1K', accent: 'cyan',
    stars: 20100, commentCount: 587, savedAt: 'Saved 3 weeks ago',
    tags: ['VectorDB', 'RAG', 'Rust'],
    heightVariant: 'normal',
  },
];

/** 活动记录 */
export const PROFILE_ACTIVITIES: ProfileActivity[] = [
  { id: 1, type: 'tip', target: 'Cinematic Portrait Generator', targetHref: '/prompt-detail?id=1', detail: 'Received $5 tip from @kairos', amount: '+$5.00', timeAgo: '2m ago' },
  { id: 2, type: 'like', target: 'React Architecture Advisor', targetHref: '/prompt-detail?id=3', detail: '@nova_dev liked your prompt', timeAgo: '15m ago' },
  { id: 3, type: 'comment', target: 'SEO Blog Writer Pro', targetHref: '/prompt-detail?id=2', detail: '@byteforge: "This is incredibly useful!"', timeAgo: '1h ago' },
  { id: 4, type: 'follow', target: 'new follower', targetHref: '#', detail: '@pixelwitch started following you', timeAgo: '3h ago' },
  { id: 5, type: 'publish', target: 'Vector DB Benchmark Kit', targetHref: '/prompt-detail?id=4', detail: 'Published a new prompt', timeAgo: '1d ago' },
  { id: 6, type: 'purchase', target: 'Film Color Grading Assistant', targetHref: '/prompt-detail?id=5', detail: 'Purchased prompt from @mirakade', amount: '-$5.00', timeAgo: '2d ago' },
];

/** 成就徽章 */
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-prompt', name: 'First Light', desc: 'Published your first prompt', icon: '★', unlocked: true },
  { id: 'centurion', name: 'Centurion', desc: 'Published 100+ prompts', icon: '◆', unlocked: true },
  { id: 'viral', name: 'Viral Hit', desc: 'Reached 10K+ views on a single prompt', icon: '▲', unlocked: true },
  { id: 'tip-master', name: 'Tip Master', desc: 'Earned $1,000+ in tips', icon: '◉', unlocked: true },
  { id: 'mentor', name: 'Mentor', desc: 'Helped 50+ community members', icon: '◇', unlocked: false, progress: 34 },
  { id: 'legend', name: 'Legend', desc: 'Maintain Top Seller for 6 months', icon: '✦', unlocked: false, progress: 67 },
];

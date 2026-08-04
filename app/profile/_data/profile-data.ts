/**
 * Profile 页面数据 —— 类型定义 + 静态 mock 数据
 *
 * 包含：用户基本信息、统计、Prompt 作品、活动记录、成就徽章
 * 头像/横幅路径使用 /images/demo/ 占位图，后续接入真实存储
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

/* ═══════════════════════════════════════════════════
   静态数据
   ═══════════════════════════════════════════════════ */

/** 当前用户信息 */
export const USER_PROFILE: UserProfile = {
  username: 'AlexShader',
  displayName: 'Alex Shader',
  avatar: '/images/demo/prompt_1.jpg',
  banner: '/images/demo/prompt_7.jpg',
  role: 'Top Seller',
  bio: 'AI prompt engineer & open-source enthusiast. Specializing in cinematic portrait generation and production-ready React architecture patterns.',
  joinedDate: 'Jan 2025',
  location: 'San Francisco, CA',
  website: 'alexshader.dev',
  github: 'github.com/alexshader',
  email: 'alex@ghrank.io',
};

/** 统计四联 */
export const PROFILE_STATS: ProfileStat[] = [
  { label: 'Prompts', value: '142', icon: 'prompt' },
  { label: 'Followers', value: '2.4K', icon: 'follower' },
  { label: 'Following', value: '89', icon: 'following' },
  { label: 'Tips Earned', value: '$1,247', icon: 'tip' },
];

/** Prompt 作品列表 */
export const PROFILE_PROMPTS: ProfilePrompt[] = [
  { id: 1, title: 'Cinematic Portrait Generator', model: 'Midjourney v6', price: 5, likes: 342, views: 12400, thumbnail: '/images/demo/prompt_1.jpg', category: 'Portrait', createdAt: '3 days ago', status: 'published' },
  { id: 2, title: 'SEO Blog Writer Pro', model: 'GPT-4o', price: 3, likes: 187, views: 8900, thumbnail: '/images/demo/prompt_2.jpg', category: 'Writing', createdAt: '1 week ago', status: 'published' },
  { id: 3, title: 'React Architecture Advisor', model: 'Claude 3.5', price: 0, likes: 256, views: 15200, thumbnail: '/images/demo/prompt_3.jpg', category: 'Dev', createdAt: '2 weeks ago', status: 'published' },
  { id: 4, title: 'Vector DB Benchmark Kit', model: 'GPT-4o', price: 8, likes: 98, views: 4300, thumbnail: '/images/demo/prompt_4.jpg', category: 'Data', createdAt: '3 weeks ago', status: 'published' },
  { id: 5, title: 'Film Color Grading Assistant', model: 'Midjourney v6', price: 5, likes: 173, views: 6700, thumbnail: '/images/demo/prompt_5.jpg', category: 'Art', createdAt: '1 month ago', status: 'published' },
  { id: 6, title: 'CLI Tool Generator (Draft)', model: 'Claude 3.5', price: 0, likes: 0, views: 0, thumbnail: '/images/demo/prompt_6.jpg', category: 'Dev', createdAt: '2 days ago', status: 'draft' },
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

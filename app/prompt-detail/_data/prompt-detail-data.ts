/**
 * Prompt 详情页数据 —— 类型定义 + 初始评论 + 生成评论数据
 * 迁移自 prompt-detail.html 静态内容 + prompt-detail-init.js 的数据池与生成逻辑
 * 图片路径统一使用 /images/demo/prompt_N.jpg
 * 注意：detail.js 是项目详情页（热力图/图表）逻辑，与本页无关，不参与迁移
 */

/* ═══════════════════════════════════════════════════
   类型定义
   ═══════════════════════════════════════════════════ */

/** 头像颜色配置（内联 style 用） */
export interface AvatarColor {
  bg: string;
  color: string;
}

/** 评论活动标识（打赏/点赞/收藏） */
export interface ReviewActivity {
  type: 'liked' | 'saved' | 'tipped';
  value: number;
}

/** 评论回复 */
export interface ReviewReply {
  author: string;
  /** 是否为作者（显示 Author 徽章） */
  isAuthor?: boolean;
  avatar: AvatarColor;
  avatarImg: string;
  activities: ReviewActivity[];
  date: string;
  /** @提及的用户名 */
  mention?: string;
  /** 回复正文（支持反引号包裹的行内代码） */
  text: string;
  likeCount: number;
}

/** 帖子内嵌代码块 */
export interface CodeBlock {
  lang: string;
  code: string;
}

/** 讨论帖（主帖） */
export interface ReviewThread {
  floor: number;
  author: string;
  avatar: AvatarColor;
  avatarImg: string;
  date: string;
  text: string;
  images?: string[];
  codeBlock?: CodeBlock;
  likeCount: number;
  replies?: ReviewReply[];
}

/** 过滤 chip */
export interface FilterChip {
  filter: string;
  label: string;
  count: string;
}

/** 实时统计数据 */
export interface LiveStats {
  views: number;
  commenters: number;
  comments: number;
  tips: number;
}

/* ═══════════════════════════════════════════════════
   头像颜色池
   ═══════════════════════════════════════════════════ */

export const AVATAR_COLORS: AvatarColor[] = [
  { bg: 'rgba(57,210,192,0.15)', color: '#39D2C0' },   // cyan
  { bg: 'rgba(245,197,24,0.12)', color: '#f5c518' },   // gold
  { bg: 'rgba(248,81,73,0.12)', color: '#F85149' },    // red
  { bg: 'rgba(63,185,80,0.12)', color: '#3FB950' },    // green
  { bg: 'rgba(188,140,255,0.15)', color: '#BC8CFF' },   // purple
  { bg: 'rgba(88,166,255,0.12)', color: '#58A6FF' },    // blue
  { bg: 'rgba(247,120,186,0.15)', color: '#F778BA' },   // pink
];

/* ═══════════════════════════════════════════════════
   Prompt 详情信息
   ═══════════════════════════════════════════════════ */

export const PROMPT_DETAIL = {
  title: 'Cinematic Portrait Generator',
  model: 'Midjourney',
  author: 'AlexShader',
  authorLabel: 'Top Seller · 142 prompts',
  authorAvatar: '/images/demo/prompt_1.jpg',
  tags: ['portrait', 'cinematic', 'photorealistic', 'bokeh', 'dramatic', 'editorial'],
  previewImages: [
    '/images/demo/prompt_1.jpg',
    '/images/demo/prompt_2.jpg',
    '/images/demo/prompt_3.jpg',
    '/images/demo/prompt_4.jpg',
  ],
  promptContent:
    'Cinematic 3D action-packed advertisement for #PRODUCT/BRAND, captured in an intense mid-motion moment with dramatic studio lighting, dynamic particle effects, and high-impact slow-motion energy. Ultra-hyperrealistic rendering, razor-sharp details, glossy commercial finish, atmospheric depth, and powerful contrast. Viral-ready composition with the brand logo seamlessly integrated into the scene and a sleek, modern slogan positioned cleanly beneath. High-end blockbuster commercial aesthetic',
  bookmarkCount: 312,
  likeCount: 1200,
  stats: { views: 12847, commenters: 186, comments: 248, tips: 94 } as LiveStats,
  rewardAmounts: [1, 3, 5, 10],
  defaultRewardAmount: 3,
};

/* ═══════════════════════════════════════════════════
   过滤 chips
   ═══════════════════════════════════════════════════ */

export const FILTER_CHIPS: FilterChip[] = [
  { filter: 'all', label: 'All', count: '248' },
  { filter: 'liked', label: 'Liked', count: '1.2K' },
  { filter: 'saved', label: 'Saved', count: '312' },
  { filter: 'tipped', label: 'Tipped', count: '24' },
];

/* ═══════════════════════════════════════════════════
   初始 5 条评论（静态数据，来自 HTML）
   ═══════════════════════════════════════════════════ */

export const INITIAL_THREADS: ReviewThread[] = [
  {
    floor: 1,
    author: 'MarcusVFX',
    avatar: AVATAR_COLORS[0],
    avatarImg: '/images/demo/prompt_1.jpg',
    date: 'Jan 15, 2025',
    text: "Absolutely incredible results. The lighting prompts produce stunning portraits every time. I've used this for 50+ client headshots and the consistency is remarkable. Here's a sample output:",
    images: ['/images/demo/prompt_1.jpg', '/images/demo/prompt_2.jpg'],
    likeCount: 12,
    replies: [
      {
        author: 'AlexShader', isAuthor: true,
        avatar: AVATAR_COLORS[1], avatarImg: '/images/demo/prompt_2.jpg',
        activities: [{ type: 'tipped', value: 3 }, { type: 'liked', value: 5 }],
        date: 'Jan 15, 2025', mention: 'MarcusVFX',
        text: 'Thank you! Try adjusting the --s parameter between 600-800 for different film stock looks. Glad it\'s working well for your clients. \u{1F525}',
        likeCount: 5,
      },
      {
        author: 'KevinLens',
        avatar: AVATAR_COLORS[2], avatarImg: '/images/demo/prompt_3.jpg',
        activities: [{ type: 'tipped', value: 5 }, { type: 'liked', value: 3 }, { type: 'saved', value: 2 }],
        date: 'Jan 16, 2025', mention: 'MarcusVFX',
        text: '+1 on the client headshots tip. I\'ve been using v3.1 for the same purpose and the results are consistently professional. \u2B50\u2B50\u2B50',
        likeCount: 3,
      },
      {
        author: 'DesignNinja',
        avatar: AVATAR_COLORS[3], avatarImg: '/images/demo/prompt_5.jpg',
        activities: [{ type: 'saved', value: 4 }],
        date: 'Jan 16, 2025', mention: 'MarcusVFX',
        text: 'What aspect ratio are you using for the headshots? I found 2:3 works best for vertical compositions.',
        likeCount: 4,
      },
      {
        author: 'KevinLens',
        avatar: AVATAR_COLORS[2], avatarImg: '/images/demo/prompt_3.jpg',
        activities: [{ type: 'liked', value: 2 }],
        date: 'Jan 17, 2025', mention: 'DesignNinja',
        text: 'Mostly 2:3 for portraits, but I switch to 4:5 for social media crops. The prompt handles both beautifully.',
        likeCount: 2,
      },
      {
        author: 'AlexShader', isAuthor: true,
        avatar: AVATAR_COLORS[1], avatarImg: '/images/demo/prompt_2.jpg',
        activities: [{ type: 'tipped', value: 3 }, { type: 'liked', value: 8 }, { type: 'saved', value: 6 }],
        date: 'Jan 17, 2025', mention: 'KevinLens',
        text: 'Great discussion! For 4:5 social crops, try adding `--style raw` for a cleaner look. The bokeh stays consistent across ratios. \u{1F3A8}',
        likeCount: 8,
      },
    ],
  },
  {
    floor: 2,
    author: 'SarahCreates',
    avatar: AVATAR_COLORS[4], avatarImg: '/images/demo/prompt_4.jpg',
    date: 'Jan 12, 2025',
    text: "Best portrait prompt I've purchased. The bokeh effect is so realistic, clients can't tell it's AI-generated. Worth every penny at 5x the price.",
    images: ['/images/demo/prompt_3.jpg'],
    likeCount: 8,
    replies: [
      {
        author: 'DesignNinja',
        avatar: AVATAR_COLORS[3], avatarImg: '/images/demo/prompt_5.jpg',
        activities: [{ type: 'liked', value: 2 }, { type: 'saved', value: 1 }],
        date: 'Jan 13, 2025', mention: 'SarahCreates',
        text: 'Agreed! The shallow DOF is unmatched. What aspect ratio are you using? I found 2:3 gives the most natural portrait feel. \u{1F440}',
        likeCount: 2,
      },
    ],
  },
  {
    floor: 3,
    author: 'JPhotoStudio',
    avatar: AVATAR_COLORS[1], avatarImg: '/images/demo/prompt_6.jpg',
    date: 'Jan 8, 2025',
    text: 'Great prompt with excellent film grain simulation. Only giving 4 stars because I wish there were more style variations included. The base prompt is solid though.',
    likeCount: 5,
  },
  {
    floor: 4,
    author: 'ReneDesign',
    avatar: AVATAR_COLORS[5], avatarImg: '/images/demo/prompt_7.jpg',
    date: 'Dec 28, 2024',
    text: 'The color grading parameters are perfectly tuned. I combine this with a custom style reference and the output quality rivals professional photography. Highly recommended. \u{1F3AF}',
    codeBlock: { lang: 'PROMPT', code: 'A cinematic portrait of [SUBJECT] --ar 2:3 --s 750 --q 2 --style raw' },
    likeCount: 3,
  },
  {
    floor: 5,
    author: 'LiamArt',
    avatar: AVATAR_COLORS[6], avatarImg: '/images/demo/prompt_8.jpg',
    date: 'Dec 22, 2024',
    text: 'This prompt single-handedly improved my portrait workflow. The rembrandt lighting pattern it generates is consistently beautiful. A must-have for any Midjourney user. \u26A1\u26A1\u26A1',
    images: ['/images/demo/prompt_4.jpg', '/images/demo/prompt_5.jpg', '/images/demo/prompt_6.jpg'],
    likeCount: 7,
  },
];

/* ═══════════════════════════════════════════════════
   生成评论数据池（迁移自 prompt-detail-init.js）
   ═══════════════════════════════════════════════════ */

const REVIEW_USERNAMES = [
  'PixelWizard', 'CodeNomad', 'DesignSage', 'DataVoyager', 'PromptHacker',
  'AIMaven', 'SyntaxNinja', 'VectorQueen', 'NeuralFox', 'CloudSculptor',
  'LogiCraft', 'RasterKing', 'FlowState', 'TensorPioneer', 'MetaForge',
];

const REVIEW_COMMENTS = [
  'Absolutely love this prompt! The output quality exceeded my expectations. Highly recommended for anyone working on professional projects.',
  'Been using this for a week now and the consistency is remarkable. Well worth the price.',
  'Great prompt but I wish there were more customization options. The base results are solid though.',
  'This completely transformed my workflow. The attention to detail in the prompt design is incredible.',
  'Solid prompt with good results. Would give 5 stars if the documentation was more detailed.',
  "Incredible value for money. I've generated over 100 images with this and the quality never drops.",
  'The prompt structure is brilliant. Easy to modify for different styles while maintaining core quality.',
  'Exactly what I was looking for. Saved me hours of experimentation. Top quality output.',
  'Pretty good but could use more examples in the description. The prompt itself works great.',
  'Game changer for my creative projects. The versatility is unmatched. Highly recommended!',
  'I was skeptical at first but this prompt delivers consistently professional results. 10/10.',
  'Decent prompt for the price. Works well with the latest model version. Good support too.',
  "Best investment I've made for my AI toolkit. The quality-to-price ratio is outstanding.",
  'Really impressed with the output variety. Each generation feels unique while staying on-brand.',
  'The prompt has some issues with complex scenes but works perfectly for simpler compositions.',
];

const REVIEW_HELPFUL = [12, 8, 3, 5, 7, 15, 2, 9, 4, 11, 6, 1, 10, 3, 8];
const TIP_POOL = [1, 1, 1, 2, 3, 3, 5, 5, 8, 10];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** 固定基准日期，避免 SSR/CSR 水合不匹配 */
const BASE_DATE = new Date(2025, 0, 20);

/* ═══════════════════════════════════════════════════
   工具函数
   ═══════════════════════════════════════════════════ */

/** 格式化数字（千位逗号） */
export function formatNum(n: number): string {
  return n >= 1000 ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : n.toString();
}

/** 格式化计数（K 缩写） */
export function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();
}

/** 格式化日期（确定性，避免 SSR/CSR 差异） */
function formatDate(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * 确定性生成一条评论数据
 * 使用基于索引的公式替代 Math.random()，避免 SSR/CSR 水合不匹配
 * @param index 全局索引（用于数据选择）
 * @param filter 当前过滤条件
 */
export function generateReview(index: number, filter: string = 'all'): ReviewThread {
  const username = REVIEW_USERNAMES[index % REVIEW_USERNAMES.length];
  const comment = REVIEW_COMMENTS[index % REVIEW_COMMENTS.length];

  // helpful 数量根据过滤条件调整
  let helpful: number;
  if (filter === 'liked') {
    helpful = 20 + (index * 13) % 50;
  } else if (filter === 'saved') {
    helpful = 5 + (index * 7) % 20;
  } else {
    helpful = REVIEW_HELPFUL[index % REVIEW_HELPFUL.length];
  }

  // 日期：基于索引计算 days ago
  const ago = (index % 14) + 1;
  const date = new Date(BASE_DATE);
  date.setDate(date.getDate() - ago);

  // 楼层号（确定性）
  const floor = 100 + (index * 37) % 900;

  // 头像颜色和图片（确定性分配）
  const avatar = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const avatarImg = `/images/demo/prompt_${(index % 20) + 1}.jpg`;

  // 活动标识（基于过滤条件和索引确定性决定）
  const activities: ReviewActivity[] = [];
  if (filter === 'liked' || index % 3 === 0) {
    activities.push({ type: 'liked', value: 1 + (index % 10) });
  }
  if (filter === 'saved' || index % 5 === 0) {
    activities.push({ type: 'saved', value: 1 + (index % 8) });
  }
  if (filter === 'tipped' || index % 7 === 0) {
    activities.push({ type: 'tipped', value: TIP_POOL[index % TIP_POOL.length] });
  }

  // 是否包含图片
  const includeImages = filter === 'all' ? index % 3 === 0 : false;
  const images = includeImages
    ? [`/images/demo/prompt_${(index % 17) + 1}.jpg`, `/images/demo/prompt_${((index + 1) % 17) + 1}.jpg`]
    : undefined;

  return {
    floor,
    author: username,
    avatar,
    avatarImg,
    date: formatDate(date),
    text: comment,
    images,
    likeCount: helpful,
    replies: [],
  };
}

/** 评论生成器配置常量 */
export const REVIEWS_CONFIG = {
  INITIAL_SKELETON_COUNT: 5,
  CHUNK_SIZE: 4,
  MAX_PAGES: 5,
  INITIAL_DELAY: 400,
  CHUNK_DELAY: 600,
  FILTER_DELAY: 180,
};

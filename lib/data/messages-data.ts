/**
 * Messages / 站内信模拟数据 —— 供 /messages 全页面对话页面使用
 *
 * 与 sidenav-data.ts 的 MESSAGES 预览列表保持一致：
 *   - 同样的 5 位聊天对象（alexshader / kairos / nova_dev / pixelwitch / byteforge）
 *   - monogram 字母头像规则
 *   - X DM 模式结构：Conversation → ChatBubble[]
 */

/* ═══ 类型定义 ═══ */

/** 聊天内的单条气泡 */
export interface ChatBubble {
  id: string;
  fromMe: boolean;           // true=我发的（右侧金色底气泡），false=对方发的（左侧深色底）
  text: string;
  timestamp: string;         // 用于在气泡下方显示：3:42 PM
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: ChatAttachment[];
}

/** 气泡内的附件 */
export interface ChatAttachment {
  kind: 'prompt' | 'image' | 'file';
  title: string;
  subtitle?: string;
  href?: string;
}

/** 一个完整会话 */
export interface Conversation {
  id: string;
  user: string;              // 用户名（无 @）
  avatar: string;            // 字母徽章 / 图片 URL
  displayName: string;       // 显示名
  verified?: boolean;
  bio?: string;
  preview: string;           // 列表左栏预览
  lastTime: string;          // 列表最后时间
  read: boolean;             // 列表未读圆点
  muted?: boolean;
  pinned?: boolean;
  bubbles: ChatBubble[];     // 聊天内容（按时间升序）
  shared: {
    prompts: { title: string; href: string; price: number }[];
    mediaCount: number;
    linksCount: number;
  };
}

/* ═══ 字母头像 ═══ */

function monogram(username: string): string {
  const parts = username.split(/[_.\-]+/).filter(Boolean);
  const heads = parts.length >= 2
    ? `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`
    : username.slice(0, 1);
  return heads.toUpperCase();
}

/* ═══ 模拟会话数据 ═══ */

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'alexshader',
    user: 'alexshader',
    avatar: monogram('alexshader'),
    displayName: 'Alex Shader',
    verified: true,
    bio: 'Prompt engineer · Cinematic portrait · @ Midjourney Alpha tester',
    preview: 'Hey, saw your React analysis — great breakdown of the fiber arch...',
    lastTime: '5m',
    read: false,
    pinned: true,
    bubbles: [
      { id: 'a1', fromMe: false, timestamp: '3:41 PM', text: 'Hey! Saw your React fiber analysis on GHRANK — love that you actually profiled the work loop with microbenchmarks.' },
      { id: 'a2', fromMe: true,  timestamp: '3:42 PM', text: 'Thanks! Took me a while to get the transition from 18.2 legacy → 18.3 concurrent mode right, wanted to actually show the numbers.', status: 'read' },
      { id: 'a3', fromMe: true,  timestamp: '3:42 PM', text: 'Writing another one about how Suspense boundaries interact with useOptimistic + Form Actions next.', status: 'read' },
      { id: 'a4', fromMe: false, timestamp: '3:43 PM', text: "Oh sick, I'd love to review that — I have a full-stack Next app that keeps tearing out the hair on a checkout form." },
      { id: 'a5', fromMe: true,  timestamp: '3:44 PM', text: 'Happy to take a look — drop the repo link or we can pair on it this weekend?', status: 'delivered' },
      { id: 'a6', fromMe: false, timestamp: '3:45 PM', text: 'Perfect — here\'s the prompt card I used to scaffold the initial form, worked really well for the base structure.', attachments: [
        { kind: 'prompt', title: 'Cinematic Portrait Generator', subtitle: 'Midjourney v6 · $5', href: '/prompt-detail?id=1' },
      ] },
    ],
    shared: {
      prompts: [
        { title: 'Cinematic Portrait Generator', href: '/prompt-detail?id=1', price: 5 },
        { title: 'React Architecture Advisor', href: '/prompt-detail?id=3', price: 0 },
      ],
      mediaCount: 4,
      linksCount: 9,
    },
  },
  {
    id: 'kairos',
    user: 'kairos',
    avatar: monogram('kairos'),
    displayName: 'kairos',
    bio: 'Building a semantic cache layer for agent pipelines · Rust + SQLite',
    preview: 'Want to collaborate on the vector DB benchmark project?',
    lastTime: '32m',
    read: false,
    bubbles: [
      { id: 'k1', fromMe: false, timestamp: 'Yesterday', text: "Hey! I'm running a public vector DB benchmark — pgvector / qdrant / milvus / chroma / weaviate. Want to contribute the workload generator?" },
      { id: 'k2', fromMe: true,  timestamp: 'Yesterday', text: 'Absolutely — I already have HNSW + IVF_FLAT workloads from that GHRANK post I wrote, can clean up and send you a tarball.', status: 'read' },
      { id: 'k3', fromMe: false, timestamp: '2:10 PM', text: 'Want to collaborate on the vector DB benchmark project? Gonna announce next Monday and plan to credit top contributors.' },
    ],
    shared: {
      prompts: [
        { title: 'Vector DB Benchmark Kit', href: '/prompt-detail?id=4', price: 8 },
      ],
      mediaCount: 1,
      linksCount: 3,
    },
  },
  {
    id: 'nova_dev',
    user: 'nova_dev',
    avatar: monogram('nova_dev'),
    displayName: 'Nova',
    verified: true,
    bio: 'Frontend · Motion · Animation systems for design systems',
    preview: 'The new prompt you published is fire. How did you tune the...',
    lastTime: '2h',
    read: false,
    bubbles: [
      { id: 'n1', fromMe: false, timestamp: '1:02 PM', text: 'The new prompt you published is fire — the "SEO Blog Writer Pro" one. How did you tune the persona + style instructions?' },
      { id: 'n2', fromMe: true,  timestamp: '1:06 PM', text: 'Thanks! Trick is: three persona layers + one final "editor persona" that rewrites the output. Also constrains paragraph count strictly.', status: 'read' },
      { id: 'n3', fromMe: false, timestamp: '1:08 PM', text: 'Layered personas, love that. Mind if I adapt that approach for my motion design prompt? Will credit you.' },
      { id: 'n4', fromMe: true,  timestamp: '1:12 PM', text: 'Go for it — open source everything. Would love to see the motion variant.', status: 'delivered' },
    ],
    shared: {
      prompts: [
        { title: 'SEO Blog Writer Pro', href: '/prompt-detail?id=2', price: 3 },
      ],
      mediaCount: 0,
      linksCount: 6,
    },
  },
  {
    id: 'pixelwitch',
    user: 'pixelwitch',
    avatar: monogram('pixelwitch'),
    displayName: 'Pixel Witch',
    bio: 'Art · Sprites · Retro games',
    preview: 'Thanks for the tip on SSR caching! Saved my deploy.',
    lastTime: '6h',
    read: true,
    bubbles: [
      { id: 'p1', fromMe: true,  timestamp: 'Yesterday', text: 'Tipped your Neon Cyberpunk prompt — the palette breakdown section saved me a whole evening of color tweaking.', status: 'read' },
      { id: 'p2', fromMe: false, timestamp: 'Yesterday', text: 'Wow, thank you so much ❤️  Means a lot. Here\'s a bonus palette you can freely use!', attachments: [
        { kind: 'prompt', title: 'Neon Cyberpunk City', subtitle: 'Midjourney v6 · Free', href: '/prompt-detail?id=1' },
      ] },
      { id: 'p3', fromMe: false, timestamp: '8:14 AM', text: 'Also — thanks for the tip on SSR caching! Saved my deploy. The whole stale-while-revalidate setup was off.' },
    ],
    shared: {
      prompts: [],
      mediaCount: 12,
      linksCount: 2,
    },
  },
  {
    id: 'byteforge',
    user: 'byteforge',
    avatar: monogram('byteforge'),
    displayName: 'Byteforge',
    bio: 'Devops · K8s · IaC',
    preview: 'Are you joining the community hackathon next week?',
    lastTime: '1d',
    read: true,
    muted: true,
    bubbles: [
      { id: 'b1', fromMe: false, timestamp: 'Yesterday', text: 'Are you joining the community hackathon next week? Agent integrations track has $50K in prizes.' },
      { id: 'b2', fromMe: true,  timestamp: 'Yesterday', text: 'Very tempted — already got 3 half-baked ideas for a Next + Tiptap + Claude 3.5 stack. You in a team already?', status: 'read' },
      { id: 'b3', fromMe: false, timestamp: 'Yesterday', text: 'Not yet — thinking of a 3-person team. Want to join as frontend lead?' },
    ],
    shared: {
      prompts: [],
      mediaCount: 0,
      linksCount: 1,
    },
  },
  {
    id: 'luna_design',
    user: 'luna_design',
    avatar: monogram('luna_design'),
    displayName: 'Luna Chen',
    verified: true,
    bio: 'UI/UX Designer · Design Systems · Figma Community',
    preview: 'Your design token solution is great, I\'d like to ask some details',
    lastTime: '3m',
    read: false,
    bubbles: [
      { id: 'l1', fromMe: false, timestamp: '2:30 PM', text: 'Hi! I saw your design token article on GHRANK — the semantic layer mapping is brilliant.' },
      { id: 'l2', fromMe: true,  timestamp: '2:32 PM', text: 'Thanks Luna! The trick is keeping primitive tokens clean and letting semantic tokens handle the theming.', status: 'read' },
      { id: 'l3', fromMe: false, timestamp: '2:35 PM', text: 'Would you mind sharing how you handle dark mode transitions? The Figma variables approach seems powerful but complex.' },
      { id: 'l4', fromMe: true,  timestamp: '2:38 PM', text: 'Sure! I\'ll send you a sample file — using mode-specific collections with alias tokens.', status: 'delivered' },
      { id: 'l5', fromMe: false, timestamp: '2:40 PM', text: 'That would be amazing 🙏 Also, are you attending Config this year?' },
    ],
    shared: {
      prompts: [
        { title: 'Design Token Manager', href: '/prompt-detail?id=5', price: 0 },
      ],
      mediaCount: 8,
      linksCount: 12,
    },
  },
  {
    id: 'marco.pm',
    user: 'marco_pm',
    avatar: monogram('marco_pm'),
    displayName: 'Marco Rossi',
    bio: 'Product Manager · AI Products · Growth Hacking',
    preview: 'Want to chat about user retention data analysis methods',
    lastTime: '18m',
    read: false,
    bubbles: [
      { id: 'm1', fromMe: false, timestamp: '11:20 AM', text: 'Hey! I\'m PM at an AI startup, loved your article on activation rate optimization.' },
      { id: 'm2', fromMe: true,  timestamp: '11:25 AM', text: 'Thanks Marco! Happy to chat — what\'s your current activation funnel looking like?', status: 'read' },
      { id: 'm3', fromMe: false, timestamp: '11:28 AM', text: 'We\'re at about 34% day-1 retention, targeting 50%. Thinking of adding a guided onboarding flow.' },
      { id: 'm4', fromMe: true,  timestamp: '11:32 AM', text: 'Guided onboarding is huge. I did A/B test on my side — +12% just by adding a progress indicator. Want to share our framework?' },
    ],
    shared: {
      prompts: [],
      mediaCount: 0,
      linksCount: 4,
    },
  },
  {
    id: 'sage.analyst',
    user: 'sage_analyst',
    avatar: monogram('sage_analyst'),
    displayName: 'Sage Wu',
    bio: 'Data Analyst · SQL · Python · Dashboard Design',
    preview: 'Your data visualization tutorial is really useful!',
    lastTime: '45m',
    read: false,
    bubbles: [
      { id: 's1', fromMe: false, timestamp: '9:15 AM', text: 'Just finished your data viz tutorial — the part about avoiding 3D charts is gold 👏' },
      { id: 's2', fromMe: true,  timestamp: '9:20 AM', text: 'Haha thanks! Pet peeve of mine — nothing worse than a 3D pie chart misrepresenting proportions.', status: 'read' },
      { id: 's3', fromMe: false, timestamp: '9:22 AM', text: 'I\'m building a dashboard for our ops team. Any tips on choosing the right chart type for each metric?' },
      { id: 's4', fromMe: true,  timestamp: '9:30 AM', text: 'Check out the FT\'s chart taxonomy — it\'s the best reference. I can share my copy if you want.', status: 'delivered' },
    ],
    shared: {
      prompts: [
        { title: 'SQL Query Optimizer', href: '/prompt-detail?id=6', price: 4 },
      ],
      mediaCount: 2,
      linksCount: 15,
    },
  },
  {
    id: 'backend.ryu',
    user: 'ryu_backend',
    avatar: monogram('ryu_backend'),
    displayName: 'Ryu Tanaka',
    bio: 'Backend Engineer · Go · PostgreSQL · High Concurrency',
    preview: 'About best practices for database connection pooling',
    lastTime: '3h',
    read: true,
    bubbles: [
      { id: 'r1', fromMe: false, timestamp: 'Yesterday', text: 'Saw your post on PostgreSQL connection pooling — very timely, our prod DB is hitting connection limits.' },
      { id: 'r2', fromMe: true,  timestamp: 'Yesterday', text: 'Oof, that\'s a painful place to be. Are you using pg_bouncer or built-in poolers?', status: 'read' },
      { id: 'r3', fromMe: false, timestamp: 'Yesterday', text: 'We tried pg_bouncer but the statement pooling mode caused issues with our prepared statements.' },
      { id: 'r4', fromMe: true,  timestamp: 'Yesterday', text: 'Classic — statement mode + prepared statements don\'t mix. Try transaction mode instead, it works with most ORMs.', status: 'read' },
      { id: 'r5', fromMe: false, timestamp: '10:30 AM', text: 'Switched to transaction mode — connections dropped from 800 to 45. Lifesaver!' },
    ],
    shared: {
      prompts: [],
      mediaCount: 3,
      linksCount: 8,
    },
  },
  {
    id: 'community.admin',
    user: 'community_admin',
    avatar: monogram('community_admin'),
    displayName: 'Community Admin',
    verified: true,
    bio: 'Community Manager · Forum moderation · Event organizer',
    preview: 'Community monthly event invitation',
    lastTime: '1d',
    read: true,
    muted: false,
    bubbles: [
      { id: 'c1', fromMe: false, timestamp: 'Yesterday', text: 'Hi there! We noticed your recent posts have been getting great engagement 🎉' },
      { id: 'c2', fromMe: true,  timestamp: 'Yesterday', text: 'Thanks! Really enjoying the community — the quality of discussions is top-notch.', status: 'read' },
      { id: 'c3', fromMe: false, timestamp: 'Yesterday', text: 'We\'re hosting a monthly "Creator Spotlight" event next week. Would you like to be featured?' },
      { id: 'c4', fromMe: true,  timestamp: 'Yesterday', text: 'Oh wow, that\'s a huge honor! Let me check my calendar and get back to you.', status: 'delivered' },
      { id: 'c5', fromMe: false, timestamp: '8:00 AM', text: 'Also — we\'d love to have you join our Discord mod team if you\'re interested. Your posts show great judgment.' },
    ],
    shared: {
      prompts: [],
      mediaCount: 0,
      linksCount: 2,
    },
  },
];

/* ═══ 帮助函数 ═══ */

export function findConversation(id: string): Conversation {
  return CONVERSATIONS.find((c) => c.id === id) ?? CONVERSATIONS[0];
}

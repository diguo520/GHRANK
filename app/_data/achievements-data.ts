/**
 * 成就系统数据层 —— 全站共享
 *
 * 包含三部分：
 * 1. 等级体系（Level System）—— 基于 XP 经验值的 10 级进阶
 * 2. 成就定义（Achievement Definitions）—— 按类别分组的徽章
 * 3. 用户进度（User Progress）—— 当前用户的 XP、等级、解锁状态
 *
 * 设计原则：
 * - 等级由 XP 总量决定，XP 来自发帖、获赞、被收藏、打赏等行为
 * - 成就按类别分组：发布、互动、影响力、社区贡献、里程碑
 * - 每个成就有明确的解锁条件和进度追踪
 */

/* ═══════════════════════════════════════════════════
   一、等级体系
   ═══════════════════════════════════════════════════ */

/** 等级定义 */
export interface LevelDefinition {
  level: number;
  name: string;
  /** 达到该等级所需的最低 XP */
  minXp: number;
  /** 等级徽章颜色（CSS 变量或色值） */
  color: string;
  /** 等级图标符号 */
  icon: string;
  /** 等级描述 */
  desc: string;
}

/**
 * 10 级进阶体系 —— 从「Initiate」到「Mythic」
 * XP 曲线：每级所需增量逐级递增（非线性）
 */
export const LEVELS: LevelDefinition[] = [
  { level: 1, name: 'Initiate', minXp: 0, color: 'var(--text-muted)', icon: '◇', desc: 'New to the community' },
  { level: 2, name: 'Apprentice', minXp: 100, color: 'var(--cyan)', icon: '◇', desc: 'Finding your footing' },
  { level: 3, name: 'Contributor', minXp: 300, color: 'var(--cyan)', icon: '◆', desc: 'Regular contributions' },
  { level: 4, name: 'Builder', minXp: 700, color: 'var(--green)', icon: '◆', desc: 'Established creator' },
  { level: 5, name: 'Veteran', minXp: 1500, color: 'var(--green)', icon: '★', desc: 'Trusted community member' },
  { level: 6, name: 'Expert', minXp: 3000, color: 'var(--gold)', icon: '★', desc: 'Recognized authority' },
  { level: 7, name: 'Master', minXp: 6000, color: 'var(--gold)', icon: '▲', desc: 'Top-tier contributor' },
  { level: 8, name: 'Grandmaster', minXp: 12000, color: 'var(--orange)', icon: '▲', desc: 'Elite standing' },
  { level: 9, name: 'Legend', minXp: 25000, color: 'var(--orange)', icon: '✦', desc: 'Community icon' },
  { level: 10, name: 'Mythic', minXp: 50000, color: 'var(--pink)', icon: '✦', desc: 'Mythical status' },
];

/** 根据总 XP 计算当前等级信息 */
export function getLevelInfo(totalXp: number) {
  // 找到当前所在等级
  let currentLevelIdx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (totalXp >= LEVELS[i].minXp) {
      currentLevelIdx = i;
    } else {
      break;
    }
  }

  const current = LEVELS[currentLevelIdx];
  const next = LEVELS[currentLevelIdx + 1] ?? null;

  // 计算当前等级进度
  const levelStartXp = current.minXp;
  const levelEndXp = next ? next.minXp : current.minXp;
  const progressInLevel = totalXp - levelStartXp;
  const xpNeededForNext = levelEndXp - levelStartXp;
  const progressPercent = next ? Math.min(100, (progressInLevel / xpNeededForNext) * 100) : 100;
  const xpToNext = next ? levelEndXp - totalXp : 0;

  return {
    current,
    next,
    totalXp,
    levelStartXp,
    levelEndXp,
    progressInLevel,
    xpNeededForNext,
    progressPercent,
    xpToNext,
    isMaxLevel: !next,
  };
}

/* ═══════════════════════════════════════════════════
   二、成就定义
   ═══════════════════════════════════════════════════ */

/** 成就类别 */
export type AchievementCategory = 'publish' | 'engagement' | 'impact' | 'community' | 'milestone';

/** 成就稀有度 */
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

/** 成就定义 */
export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  /** 解锁条件描述 */
  condition: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  /** 图标符号 */
  icon: string;
  /** 解锁奖励 XP */
  rewardXp: number;
  /** 解锁所需的目标数值 */
  target: number;
}

/** 类别元信息 */
export const CATEGORY_META: Record<
  AchievementCategory,
  { label: string; color: string; icon: string }
> = {
  publish: { label: 'Publishing', color: 'var(--cyan)', icon: '◆' },
  engagement: { label: 'Engagement', color: 'var(--purple)', icon: '◇' },
  impact: { label: 'Impact', color: 'var(--gold)', icon: '★' },
  community: { label: 'Community', color: 'var(--green)', icon: '▲' },
  milestone: { label: 'Milestones', color: 'var(--pink)', icon: '✦' },
};

/** 稀有度元信息 */
export const RARITY_META: Record<
  AchievementRarity,
  { label: string; color: string; glow: string }
> = {
  common: { label: 'Common', color: 'var(--text-dim)', glow: 'rgba(139,148,158,0.2)' },
  rare: { label: 'Rare', color: 'var(--cyan)', glow: 'rgba(57,210,192,0.25)' },
  epic: { label: 'Epic', color: 'var(--purple)', glow: 'rgba(163,113,247,0.25)' },
  legendary: { label: 'Legendary', color: 'var(--gold)', glow: 'rgba(245,197,24,0.3)' },
};

/**
 * 全部成就定义 —— 共 18 个，按类别分组
 */
export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  /* ── 发布类 ── */
  { id: 'first-prompt', name: 'First Light', desc: 'Published your first prompt', condition: 'Publish 1 prompt', category: 'publish', rarity: 'common', icon: '◇', rewardXp: 50, target: 1 },
  { id: 'prompt-10', name: 'Prolific', desc: 'Published 10 prompts', condition: 'Publish 10 prompts', category: 'publish', rarity: 'common', icon: '◆', rewardXp: 150, target: 10 },
  { id: 'prompt-50', name: 'Centurion', desc: 'Published 50 prompts', condition: 'Publish 50 prompts', category: 'publish', rarity: 'rare', icon: '★', rewardXp: 500, target: 50 },
  { id: 'prompt-100', name: 'Machine', desc: 'Published 100 prompts', condition: 'Publish 100 prompts', category: 'publish', rarity: 'epic', icon: '▲', rewardXp: 1200, target: 100 },

  /* ── 互动类 ── */
  { id: 'first-like', name: 'First Heart', desc: 'Received your first like', condition: 'Get 1 like', category: 'engagement', rarity: 'common', icon: '◇', rewardXp: 30, target: 1 },
  { id: 'likes-100', name: 'Crowd Pleaser', desc: 'Received 100 total likes', condition: 'Get 100 likes', category: 'engagement', rarity: 'rare', icon: '◆', rewardXp: 300, target: 100 },
  { id: 'likes-1000', name: 'Beloved', desc: 'Received 1,000 total likes', condition: 'Get 1,000 likes', category: 'engagement', rarity: 'epic', icon: '★', rewardXp: 800, target: 1000 },
  { id: 'comments-50', name: 'Conversationalist', desc: 'Got 50 comments on your posts', condition: 'Receive 50 comments', category: 'engagement', rarity: 'rare', icon: '◆', rewardXp: 250, target: 50 },

  /* ── 影响力类 ── */
  { id: 'views-1k', name: 'Rising Star', desc: 'Reached 1K total views', condition: 'Get 1,000 views', category: 'impact', rarity: 'common', icon: '◇', rewardXp: 100, target: 1000 },
  { id: 'views-10k', name: 'Viral Hit', desc: 'Reached 10K views on a single prompt', condition: '10K views on one prompt', category: 'impact', rarity: 'epic', icon: '▲', rewardXp: 600, target: 10000 },
  { id: 'views-100k', name: 'Trendsetter', desc: 'Reached 100K total views', condition: 'Get 100,000 views', category: 'impact', rarity: 'legendary', icon: '✦', rewardXp: 2000, target: 100000 },
  { id: 'tip-1k', name: 'Tip Master', desc: 'Earned $1,000+ in tips', condition: 'Earn $1,000 in tips', category: 'impact', rarity: 'epic', icon: '◉', rewardXp: 1000, target: 1000 },

  /* ── 社区贡献类 ── */
  { id: 'first-post', name: 'Hello World', desc: 'Created your first community post', condition: 'Post 1 thread', category: 'community', rarity: 'common', icon: '◇', rewardXp: 40, target: 1 },
  { id: 'posts-50', name: 'Regular', desc: 'Created 50 community posts', condition: 'Post 50 threads', category: 'community', rarity: 'rare', icon: '◆', rewardXp: 400, target: 50 },
  { id: 'mentor-50', name: 'Mentor', desc: 'Helped 50+ community members', condition: 'Reply 50 times', category: 'community', rarity: 'epic', icon: '★', rewardXp: 700, target: 50 },
  { id: 'followers-1k', name: 'Influencer', desc: 'Reached 1,000 followers', condition: 'Get 1,000 followers', category: 'community', rarity: 'epic', icon: '▲', rewardXp: 900, target: 1000 },

  /* ── 里程碑类 ── */
  { id: 'week-streak', name: 'Consistent', desc: 'Active for 7 consecutive days', condition: '7-day streak', category: 'milestone', rarity: 'rare', icon: '◆', rewardXp: 200, target: 7 },
  { id: 'top-seller', name: 'Legend', desc: 'Maintain Top Seller for 6 months', condition: '6 months as Top Seller', category: 'milestone', rarity: 'legendary', icon: '✦', rewardXp: 3000, target: 6 },
];

/* ═══════════════════════════════════════════════════
   三、用户进度
   ═══════════════════════════════════════════════════ */

/** 用户成就进度项 */
export interface UserAchievementProgress {
  defId: string;
  /** 当前进度数值 */
  current: number;
  /** 是否已解锁 */
  unlocked: boolean;
  /** 解锁时间（可选） */
  unlockedAt?: string;
}

/** 用户成就统计 */
export interface UserAchievementStats {
  total: number;
  unlocked: number;
  totalRewardXp: number;
  earnedRewardXp: number;
  byCategory: Record<AchievementCategory, { total: number; unlocked: number }>;
  byRarity: Record<AchievementRarity, { total: number; unlocked: number }>;
}

/** 用户行为统计数据（用于计算成就进度） */
export interface UserActivityStats {
  promptsPublished: number;
  totalLikes: number;
  totalViews: number;
  totalComments: number;
  tipsEarned: number;
  postsCreated: number;
  repliesMade: number;
  followers: number;
  dayStreak: number;
  topSellerMonths: number;
}

/** 当前用户的活动统计 */
export const USER_ACTIVITY_STATS: UserActivityStats = {
  promptsPublished: 142,
  totalLikes: 1056,
  totalViews: 48600,
  totalComments: 73,
  tipsEarned: 1247,
  postsCreated: 68,
  repliesMade: 42,
  followers: 2400,
  dayStreak: 5,
  topSellerMonths: 4,
};

/** 当前用户总 XP（由各行为累计） */
export const USER_TOTAL_XP = 8420;

/**
 * 成就进度映射 —— 将成就 def 的 target 对应到用户行为统计
 * 根据用户活动数据计算每个成就的进度
 */
export function computeAchievementProgress(
  stats: UserActivityStats
): UserAchievementProgress[] {
  // 成就 ID → 用户统计字段的映射
  const statMap: Record<string, number> = {
    'first-prompt': stats.promptsPublished,
    'prompt-10': stats.promptsPublished,
    'prompt-50': stats.promptsPublished,
    'prompt-100': stats.promptsPublished,
    'first-like': stats.totalLikes,
    'likes-100': stats.totalLikes,
    'likes-1000': stats.totalLikes,
    'comments-50': stats.totalComments,
    'views-1k': stats.totalViews,
    'views-10k': stats.totalViews,
    'views-100k': stats.totalViews,
    'tip-1k': stats.tipsEarned,
    'first-post': stats.postsCreated,
    'posts-50': stats.postsCreated,
    'mentor-50': stats.repliesMade,
    'followers-1k': stats.followers,
    'week-streak': stats.dayStreak,
    'top-seller': stats.topSellerMonths,
  };

  return ACHIEVEMENT_DEFS.map((def) => {
    const current = statMap[def.id] ?? 0;
    const unlocked = current >= def.target;
    return {
      defId: def.id,
      current: Math.min(current, def.target),
      unlocked,
      unlockedAt: unlocked ? 'Recently' : undefined,
    };
  });
}

/** 计算用户成就统计汇总 */
export function computeAchievementStats(
  progress: UserAchievementProgress[]
): UserAchievementStats {
  const byCategory = {} as UserAchievementStats['byCategory'];
  const byRarity = {} as UserAchievementStats['byRarity'];

  let unlocked = 0;
  let earnedRewardXp = 0;
  let totalRewardXp = 0;

  for (const def of ACHIEVEMENT_DEFS) {
    const p = progress.find((x) => x.defId === def.id);
    const isUnlocked = p?.unlocked ?? false;

    // 初始化类别计数
    if (!byCategory[def.category]) {
      byCategory[def.category] = { total: 0, unlocked: 0 };
    }
    byCategory[def.category].total++;
    if (isUnlocked) byCategory[def.category].unlocked++;

    // 初始化稀有度计数
    if (!byRarity[def.rarity]) {
      byRarity[def.rarity] = { total: 0, unlocked: 0 };
    }
    byRarity[def.rarity].total++;
    if (isUnlocked) byRarity[def.rarity].unlocked++;

    totalRewardXp += def.rewardXp;
    if (isUnlocked) {
      unlocked++;
      earnedRewardXp += def.rewardXp;
    }
  }

  return {
    total: ACHIEVEMENT_DEFS.length,
    unlocked,
    totalRewardXp,
    earnedRewardXp,
    byCategory,
    byRarity,
  };
}

/** 预计算当前用户的成就进度（模块级常量，避免重复计算） */
export const USER_ACHIEVEMENT_PROGRESS = computeAchievementProgress(USER_ACTIVITY_STATS);
export const USER_ACHIEVEMENT_STATS = computeAchievementStats(USER_ACHIEVEMENT_PROGRESS);
export const USER_LEVEL_INFO = getLevelInfo(USER_TOTAL_XP);

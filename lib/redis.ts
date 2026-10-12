/**
 * Redis 缓存封装 —— 环境变量缺失时降级到内存 LRU
 *
 * 降级策略：
 * - 有 REDIS_URL：使用 ioredis 连接 Redis
 * - 无 REDIS_URL：使用内存 Map + TTL 模拟（仅开发环境）
 *
 * 生产环境必须配置 REDIS_URL，否则多实例间缓存不共享
 */

interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
}

// 内存缓存降级实现
class MemoryCache {
  private store = new Map<string, CacheEntry>();
  private maxEntries = 500;

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    // 简单 LRU：超过容量时删除最早的
    if (this.store.size >= this.maxEntries) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async keys(pattern: string): Promise<string[]> {
    // 简单 glob 匹配（仅用于开发）
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    return Array.from(this.store.keys()).filter((k) => regex.test(k));
  }
}

let redisClient: MemoryCache | null = null;
let isRedisEnabled = false;

/**
 * 初始化 Redis 客户端
 * 在无 REDIS_URL 时降级到内存缓存
 */
async function getRedis() {
  if (redisClient) return redisClient;

  const REDIS_URL = process.env.REDIS_URL;

  if (REDIS_URL) {
    try {
      // 动态导入 ioredis，避免未安装时编译报错
      const Redis = (await import('ioredis')).default;
      const redis = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        lazyConnect: false,
      });
      redis.on('error', (err) => {
        console.error('[redis] connection error:', err.message);
      });
      redis.on('connect', () => {
        console.log('[redis] connected');
      });
      isRedisEnabled = true;
      redisClient = redis as unknown as MemoryCache;
      return redisClient;
    } catch (err) {
      console.warn(
        '[redis] ioredis not installed or connection failed, falling back to memory cache:',
        (err as Error).message
      );
    }
  }

  // 降级到内存缓存
  console.warn('[redis] REDIS_URL not configured, using memory cache (dev only)');
  redisClient = new MemoryCache();
  return redisClient;
}

/**
 * 获取缓存值
 * @param key 缓存键
 * @returns 缓存值，未命中返回 null
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = await getRedis();
  return client.get<T>(key);
}

/**
 * 设置缓存
 * @param key 缓存键
 * @param value 缓存值
 * @param ttlSeconds 过期时间（秒），默认 5 分钟
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds = 300
): Promise<void> {
  const client = await getRedis();
  await client.set(key, value, ttlSeconds);
}

/**
 * 删除缓存
 */
export async function cacheDel(key: string): Promise<void> {
  const client = await getRedis();
  await client.del(key);
}

/**
 * 按模式删除缓存
 */
export async function cacheDelPattern(pattern: string): Promise<void> {
  const client = await getRedis();
  const keys = await client.keys(pattern);
  await Promise.all(keys.map((k) => client.del(k)));
}

/**
 * 是否启用 Redis（用于日志和监控）
 */
export function isRedisConnected(): boolean {
  return isRedisEnabled;
}

// ─── 缓存键命名规范 ─────────────────────────────────────

export const CACHE_KEYS = {
  // 仓库相关
  leaderboard: (period: string) => `leaderboard:${period}`,
  repoDetail: (fullName: string) => `repo:detail:${fullName}`,
  repoTrending: (lang: string, period: string) =>
    `repo:trending:${lang}:${period}`,

  // 帖子相关
  postList: (page: number, sort: string) => `posts:list:${sort}:${page}`,
  postDetail: (slug: string) => `post:detail:${slug}`,

  // 用户相关
  userProfile: (username: string) => `user:profile:${username}`,
} as const;

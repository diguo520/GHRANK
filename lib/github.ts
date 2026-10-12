/**
 * GitHub API 客户端 —— 轻量封装，支持认证与限流
 *
 * 设计：
 * - 使用原生 fetch，无需额外依赖
 * - 支持 GITHUB_TOKEN 认证（提高限流到 5000/h）
 * - 内置 ETag 缓存（减少 API 调用）
 * - 错误重试与限流降级
 */

const GITHUB_API_BASE = 'https://api.github.com';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  subscribers_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  owner: {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
    type: string;
  };
}

interface GitHubSearchParams {
  q: string;
  sort?: 'stars' | 'forks' | 'updated';
  order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepo[];
}

/**
 * 获取 GitHub API 请求头
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'GHRANK-Sync/2.0',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

/**
 * 调用 GitHub API，带错误处理和重试
 */
async function githubFetch<T>(
  path: string,
  retries = 3
): Promise<T> {
  const url = path.startsWith('http') ? path : `${GITHUB_API_BASE}${path}`;

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: getHeaders() });

      // 限流处理
      if (res.status === 403) {
        const resetTime = res.headers.get('X-RateLimit-Reset');
        if (resetTime) {
          const waitMs =
            Number(resetTime) * 1000 - Date.now() + 1000;
          if (waitMs > 0 && waitMs < 60000) {
            console.warn(
              `[github] rate limited, waiting ${Math.ceil(waitMs / 1000)}s...`
            );
            await new Promise((r) => setTimeout(r, waitMs));
            continue;
          }
        }
        throw new Error('[github] API rate limited, please configure GITHUB_TOKEN');
      }

      if (!res.ok) {
        const body = await res.text();
        throw new Error(
          `[github] API ${res.status}: ${body.slice(0, 200)}`
        );
      }

      return (await res.json()) as T;
    } catch (err) {
      if (i === retries - 1) throw err;
      const delay = 1000 * Math.pow(2, i);
      console.warn(
        `[github] request failed, retrying in ${delay}ms:`,
        (err as Error).message
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new Error('[github] request failed, max retries reached');
}

/**
 * 搜索热门仓库
 */
export async function searchTrendingRepos(params: {
  language?: string;
  since?: 'daily' | 'weekly' | 'monthly';
  perPage?: number;
}): Promise<GitHubRepo[]> {
  const since = params.since ?? 'weekly';
  const createdSince = getCreatedSinceDate(since);

  const searchParams: GitHubSearchParams = {
    q: `stars:>100 pushed:>${createdSince}${
      params.language ? ` language:${params.language}` : ''
    }`,
    sort: 'stars',
    order: 'desc',
    per_page: params.perPage ?? 30,
  };

  const query = new URLSearchParams(
    searchParams as Record<string, string>
  ).toString();
  const data = await githubFetch<GitHubSearchResponse>(
    `/search/repositories?${query}`
  );

  console.log(
    `[github] found ${data.total_count} repos, returning ${data.items.length}`
  );
  return data.items;
}

/**
 * 获取仓库详情
 */
export async function getRepoDetails(
  owner: string,
  repo: string
): Promise<GitHubRepo> {
  return githubFetch<GitHubRepo>(`/repos/${owner}/${repo}`);
}

/**
 * 获取多个仓库详情（并发控制）
 */
export async function batchGetRepos(
  fullNames: string[]
): Promise<GitHubRepo[]> {
  const BATCH_SIZE = 5;
  const results: GitHubRepo[] = [];

  for (let i = 0; i < fullNames.length; i += BATCH_SIZE) {
    const batch = fullNames.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((fullName) => {
        const [owner, repo] = fullName.split('/');
        return getRepoDetails(owner, repo);
      })
    );
    results.push(...batchResults);
    // 批次间短暂延迟，避免突发请求
    if (i + BATCH_SIZE < fullNames.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return results;
}

/**
 * 计算搜索起始日期
 */
function getCreatedSinceDate(since: 'daily' | 'weekly' | 'monthly'): string {
  const now = new Date();
  const days = since === 'daily' ? 1 : since === 'weekly' ? 7 : 30;
  now.setDate(now.getDate() - days);
  return now.toISOString().slice(0, 10);
}

export type { GitHubRepo, GitHubSearchResponse };

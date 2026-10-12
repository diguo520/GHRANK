/**
 * 社区帖子详情页数据 —— 类型定义 + 静态数据 + 回复生成
 * 迁移自 community-detail.js 的 MOCK DATA 与 PURE HELPER FUNCTIONS
 *
 * 头像处理：沿用 community-data.ts 的字母头像模式（无图片资源），
 * 用作者名首字母大写作为头像字符。
 *
 * 回复生成：使用基于种子的确定性算法，保证 SSR/CSR 一致，避免 hydration mismatch。
 */
import { findBar, buildBarPool } from '../../tiebas/_data/community-tiebas-data';

/* ═══════════════════════════════════════════════════════════
   1. 类型定义
   ═══════════════════════════════════════════════════════════ */

/** 帖子正文内容块类型 */
export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'image'; alt: string; caption: string; captionTag: string; src?: string }
  | { type: 'video'; src: string; poster?: string; alt: string; caption: string; captionTag: string }
  | { type: 'code'; lang: string; code: string }
  | { type: 'blockquote'; text: string }
  | { type: 'list'; items: string[] }
  /** 链接卡片：独立段落中的单链接自动转换 */
  | { type: 'linkcard'; url: string; title: string; description: string; isInternal: boolean };

/** 投票用户 */
export interface PollVoter {
  name: string;
  avatar: string;
}

/** 投票选项 */
export interface PollOption {
  key: string;
  label: string;
  votes: number;
  /** 投票用户（最多显示前 5 个头像） */
  voters: PollVoter[];
}

/** 投票数据 */
export interface PollData {
  title: string;
  options: PollOption[];
}

/** 帖子详情 */
export interface PostDetail {
  id: number;
  title: string;
  author: string;
  avatar: string;
  section: string;
  /** 标签列表，最多显示 5 个 */
  tags: string[];
  postedTimeAgo: string;
  views: number;
  comments: number;
  likes: number;
  liked: boolean;
  bookmarked: boolean;
  content: ContentBlock[];
  poll: PollData;
  /** 帖子类型：normal 常规 / vote 投票 / question 提问（含积分悬赏） */
  threadType?: 'normal' | 'vote' | 'question';
  /** 提问帖专用：悬赏积分数值（仅 threadType=question 时有值） */
  questionPoints?: number;
  /** 提问帖专用：悬赏状态 */
  questionStatus?: 'open' | 'assigned' | 'settled' | 'expired';
  /** 提问帖专用：截止时间（相对时间文案，例如 "3 days left"） */
  questionDeadline?: string;
  /**
   * 提问帖专用：已采纳的最佳回复（支持多个，可分配不同积分）
   * - 多个回复平分：如 [ {replyId:2, points:66}, {replyId:5, points:67}, {replyId:6, points:67} ] 平分 200 PTS
   * - 作者主观加权：如 [ {replyId:2, points:120}, {replyId:5, points:50}, {replyId:6, points:30} ] 高质量多给分
   */
  acceptedReplies?: Array<{ replyId: number; points: number }>;
  /** @deprecated 兼容旧代码 —— 等价于 acceptedReplies?.[0]?.replyId */
  acceptedReplyId?: number;
  /** 作者是否在线 */
  isOnline: boolean;
}

/** 回复条目 */
export interface Reply {
  id: number;
  author: string;
  avatar: string;
  content: string[];
  likes: number;
  liked: boolean;
  timeAgo: string;
  isOp: boolean;
  /** 作者是否在线 */
  isOnline: boolean;
  /** 嵌套子回复（最多 5 级） */
  replies?: Reply[];
}

/** 回复排序方式 */
export type SortOrder = 'oldest' | 'newest' | 'best';

/* ═══════════════════════════════════════════════════════════
   2. 帖子正文内容块（迁移自 community-detail.html 的 .post-body）
   ═══════════════════════════════════════════════════════════ */

export const POST_CONTENT: ContentBlock[] = [
  {
    type: 'paragraph',
    text: 'After working on a few production React codebases that crossed the 200k LOC mark, I wanted to share some patterns that have genuinely helped teams scale without drowning in complexity. None of this is novel, but it is the stuff I wish someone had told me three years ago.',
  },
  { type: 'heading', level: 2, text: '1. Feature-based folders over type-based folders' },
  {
    type: 'paragraph',
    text: 'The single biggest mistake I see is organizing by file type (all components together, all hooks together, all utils together). This works at 5k LOC and becomes a navigation nightmare at 50k. Group by feature instead:',
  },
  {
    type: 'image',
    alt: 'Feature-based folder structure diagram',
    caption: 'Feature-based vs type-based folder layout',
    captionTag: 'FIG.01',
    src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' +
      encodeURIComponent('A clean technical diagram comparing two React project folder structures side by side, left side labeled "Type-based" showing flat folders like components/, hooks/, utils/ scattered, right side labeled "Feature-based" showing grouped folders like auth/, dashboard/ each containing its own components and hooks, dark background with purple and cyan accent lines, monospace font, minimalist developer documentation style') +
      '&image_size=landscape_4_3',
  },
  {
    type: 'code',
    lang: 'Text',
    code: `src/
  features/
    auth/
      components/
      hooks/
      api.ts
      index.ts
    dashboard/
      components/
      hooks/
      api.ts
      index.ts`,
  },
  {
    type: 'video',
    src: '/api/attachments/video?file=' +
      encodeURIComponent("This May Likely Be The Most 'Realistic' and 'Modern' RTS Game I Have Ever Seen... via VidBee.mp4"),
    poster:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' +
      encodeURIComponent('A cinematic dark-themed video thumbnail showing a modern realistic real-time strategy game scene with futuristic military units on a battlefield, dramatic lighting with purple and cyan accents, HUD elements in the corners, 16:9 cinematic game screenshot style') +
      '&image_size=landscape_16_9',
    alt: 'RTS game demo — most realistic and modern real-time strategy game',
    caption: 'This may likely be the most realistic and modern RTS game I have ever seen',
    captionTag: 'VID.01',
  },
  {
    type: 'paragraph',
    text: 'Each feature becomes a self-contained module with a public API via index.ts. Nothing outside the feature should reach into its internals.',
  },
  {
    type: 'image',
    alt: 'Feature-based architecture diagram showing clear module boundaries',
    caption: 'Feature-based folder structure — each module exports only its public API',
    captionTag: 'FIG.02',
    src: '/api/attachments/image?file=prompt_3.jpg',
  },
  {
    type: 'paragraph',
    text: 'Below are some additional visuals from the project — different formats and resolutions to test responsive layout behavior:',
  },
  {
    type: 'image',
    alt: 'M_COMPETE competition mode screenshot',
    caption: 'Competition mode — multi-player ranking system overview',
    captionTag: 'FIG.03',
    src: '/api/attachments/image?file=M_COMPETE_v3.png',
  },
  {
    type: 'image',
    alt: 'M_COOP cooperative mode screenshot',
    caption: 'Cooperative mode — team collaboration flow diagram',
    captionTag: 'FIG.04',
    src: '/api/attachments/image?file=M_COOP_v4.png',
  },
  {
    type: 'image',
    alt: 'Project logo and branding asset',
    caption: 'Brand identity — logo design iteration v1',
    captionTag: 'FIG.05',
    src: '/api/attachments/image?file=logo1.png',
  },
  {
    type: 'image',
    alt: 'Untitled design mockup — UI exploration',
    caption: 'UI exploration — early layout mockup and wireframe study',
    captionTag: 'FIG.06',
    src: '/api/attachments/image?file=' + encodeURIComponent('untitled-1.png'),
  },
  { type: 'heading', level: 3, text: 'Code sample: a typed feature boundary' },
  {
    type: 'paragraph',
    text: 'Here is how a typical feature barrel file looks. Notice we only export the public surface — internals stay private:',
  },
  {
    type: 'code',
    lang: 'TypeScript',
    code: `// features/auth/index.ts
import { LoginForm } from './components/LoginForm';
import { useAuth } from './hooks/useAuth';
import { login, logout } from './api';
import type { AuthUser, AuthSession } from './types';

export { LoginForm, useAuth, login, logout };
export type { AuthUser, AuthSession };

// Internal modules (api client, token store) are NOT re-exported.
// Importing them from outside this folder is a lint error.`,
  },
  { type: 'heading', level: 3, text: 'Code sample: React Query for server state' },
  {
    type: 'paragraph',
    text: 'Stop pouring server data into Redux. React Query handles caching, invalidation, and retries for free:',
  },
  {
    type: 'code',
    lang: 'TypeScript',
    code: `// features/dashboard/hooks/useRepoStats.ts
import { useQuery } from '@tanstack/react-query';

export function useRepoStats(repoId: string) {
  return useQuery({
    queryKey: ['repoStats', repoId],
    queryFn: () => fetchRepoStats(repoId),
    staleTime: 60_000,        // fresh for 1 minute
    gcTime: 5 * 60_000,       // cached for 5 minutes after unmount
    retry: (failureCount, err) => err.status !== 404 && failureCount < 3,
  });
}

// Consumer — no useEffect, no useState, no boilerplate.
const { data, isPending, error } = useRepoStats('ghrank/api');`,
  },
  { type: 'heading', level: 3, text: 'Code sample: splitting a mega-component' },
  {
    type: 'paragraph',
    text: 'Before (config-driven, 40+ props) vs after (composable, 3 small components):',
  },
  {
    type: 'code',
    lang: 'JSX',
    code: `// Before — a configuration API disguised as a component
<Button
  variant="primary"
  size="md"
  icon="arrow-right"
  iconPosition="right"
  isLoading={false}
  fullWidth={false}
  onClick={handleNext}
/>

// After — small, composable pieces
<ButtonGroup fullWidth>
  <Button variant="primary" onClick={handleNext}>Continue</Button>
  <IconButton icon="arrow-right" aria-label="Next step" />
</ButtonGroup>`,
  },
  { type: 'heading', level: 3, text: 'Code sample: a Python scoring pipeline' },
  {
    type: 'paragraph',
    text: 'For the data side, here is a minimal time-decay scorer we run nightly:',
  },
  {
    type: 'code',
    lang: 'Python',
    code: `# scoring/time_decay.py
from datetime import datetime, timedelta
from typing import Iterable

HALF_LIFE_DAYS = 180

def time_decay_weight(event_time: datetime, now: datetime | None = None) -> float:
    """Exponential decay — recent events weigh more."""
    now = now or datetime.utcnow()
    age_days = max((now - event_time).days, 0)
    return 0.5 ** (age_days / HALF_LIFE_DAYS)

def score_repo(events: Iterable[dict]) -> float:
    return sum(
        e['weight'] * time_decay_weight(e['timestamp'])
        for e in events
    )`,
  },
  { type: 'heading', level: 3, text: 'Code sample: shell one-liners we use in CI' },
  {
    type: 'code',
    lang: 'Shell',
    code: `# Compute the diff between two scoring snapshots
$ jq -S '.repos[] | {name, score}' v4.1.json > a.txt
$ jq -S '.repos[] | {name, score}' v4.2.json > b.txt
$ diff -u a.txt b.txt | delta          # pretty side-by-side

# Bust the edge cache after a deploy
$ curl -X POST "$CDN_HOST/purge" \\
    -H "Authorization: Bearer $CDN_TOKEN" \\
    -d '{"patterns": ["/api/repos/*"]}'`,
  },
  { type: 'heading', level: 3, text: 'Code sample: the full scoring scheduler (long)' },
  {
    type: 'paragraph',
    text: 'This is the complete nightly scheduler that orchestrates repo discovery, cloning, scoring, and snapshot publishing. It is intentionally long — use the Expand/Collapse button on the code block to read it in full.',
  },
  {
    type: 'code',
    lang: 'Python',
    code: `# scoring/scheduler.py — nightly orchestration entrypoint
"""
GHRANK nightly scoring scheduler.

Pipeline stages:
  1. Discover repos from the seed list + GitHub trending
  2. Clone (shallow) + extract metadata
  3. Run signal extractors (stars, forks, issues, PRs, releases, contributors)
  4. Apply time-decay weighting + community signals
  5. Normalize + rank
  6. Publish snapshot to the API + bust CDN cache
"""
import asyncio
import json
import logging
import os
import shutil
import subprocess
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

from redis import Redis
from rq import Queue

from .time_decay import score_repo, time_decay_weight
from .extractors import (
    extract_stars,
    extract_forks,
    extract_issues,
    extract_prs,
    extract_releases,
    extract_contributors,
)
from .publish import publish_snapshot, bust_cdn
from .storage import SnapshotStore, RepoRecord

logger = logging.getLogger("ghrank.scheduler")
logger.setLevel(logging.INFO)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
QUEUE_NAME = os.getenv("SCORING_QUEUE", "ghrank-scoring")
CLONE_DIR = Path(os.getenv("CLONE_DIR", "/tmp/ghrank-clones"))
SEED_LIST = Path(os.getenv("SEED_LIST", "config/seed_repos.txt"))

# Repos below this composite score are excluded from the published snapshot.
MIN_PUBLISH_SCORE = float(os.getenv("MIN_PUBLISH_SCORE", "0.42"))

# How many repos to process concurrently. Each repo does network I/O
# (clone + GitHub API), so we keep this modest to avoid rate limits.
CONCURRENCY = int(os.getenv("SCORING_CONCURRENCY", "8"))


@dataclass
class ScoringJob:
    repo_url: str
    repo_name: str
    priority: int = 0
    enqueued_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @property
    def key(self) -> str:
        return f"job:{self.repo_name.replace('/', ':')}"


async def discover_repos() -> list[str]:
    """Build the candidate list from the seed file + GitHub trending."""
    repos: list[str] = []
    if SEED_LIST.exists():
        repos.extend(
            line.strip()
            for line in SEED_LIST.read_text().splitlines()
            if line.strip() and not line.startswith("#")
        )

    # GitHub trending is scraped (off-GitHub) and pushed to Redis by a
    # separate worker. We just drain the list here.
    redis = Redis.from_url(REDIS_URL, decode_responses=True)
    while True:
        item = redis.lpop("ghrank:trending")
        if not item:
            break
        if item not in repos:
            repos.append(item)

    logger.info("discovered %d candidate repos", len(repos))
    return repos


def clone_repo(repo_url: str, dest: Path) -> bool:
    """Shallow-clone a repo. Returns True on success."""
    if dest.exists():
        shutil.rmtree(dest, ignore_errors=True)
    try:
        subprocess.run(
            ["git", "clone", "--depth", "1", "--quiet", repo_url, str(dest)],
            check=True,
            timeout=120,
            capture_output=True,
        )
        return True
    except subprocess.CalledProcessError as exc:
        logger.warning("clone failed for %s: %s", repo_url, exc.stderr.decode()[:200])
        return False
    except subprocess.TimeoutExpired:
        logger.warning("clone timeout for %s", repo_url)
        return False


async def score_one(repo_url: str) -> RepoRecord | None:
    """Full per-repo pipeline. Returns a RepoRecord or None on failure."""
    name = repo_url.rstrip("/").split(":")[-1].replace(".git", "")
    dest = CLONE_DIR / name.replace("/", "_")
    if not clone_repo(repo_url, dest):
        return None

    try:
        signals: dict[str, Any] = {}
        signals.update(extract_stars(dest))
        signals.update(extract_forks(dest))
        signals.update(extract_issues(dest))
        signals.update(extract_prs(dest))
        signals.update(extract_releases(dest))
        signals.update(extract_contributors(dest))

        events = [
            {"weight": float(s.get("weight", 1.0)), "timestamp": s["timestamp"]}
            for s in signals.values()
            if "timestamp" in s
        ]
        score = score_repo(events)
        if score < MIN_PUBLISH_SCORE:
            logger.info("skipping %s (score %.3f below threshold)", name, score)
            return None

        return RepoRecord(name=name, url=repo_url, score=score, signals=signals)
    except Exception:
        logger.exception("scoring failed for %s", name)
        return None
    finally:
        shutil.rmtree(dest, ignore_errors=True)


async def run_pipeline() -> dict[str, Any]:
    """Run the full nightly pipeline. Returns a summary dict."""
    started = datetime.now(timezone.utc)
    logger.info("pipeline started at %s", started.isoformat())

    repos = await discover_repos()
    if not repos:
        logger.warning("no repos to process; aborting")
        return {"status": "empty", "started": started.isoformat()}

    sem = asyncio.Semaphore(CONCURRENCY)

    async def bounded(repo_url: str) -> RepoRecord | None:
        async with sem:
            return await score_one(repo_url)

    records = await asyncio.gather(*[bounded(r) for r in repos])
    valid = [r for r in records if r is not None]
    valid.sort(key=lambda r: r.score, reverse=True)

    store = SnapshotStore()
    snapshot_id = await store.save_snapshot(valid)

    await publish_snapshot(snapshot_id, valid)
    await bust_cdn(["/api/repos/*"])

    finished = datetime.now(timezone.utc)
    duration = (finished - started).total_seconds()
    logger.info(
        "pipeline finished: %d/%d repos scored in %.1fs (snapshot=%s)",
        len(valid), len(repos), duration, snapshot_id,
    )
    return {
        "status": "ok",
        "started": started.isoformat(),
        "finished": finished.isoformat(),
        "duration_s": duration,
        "discovered": len(repos),
        "scored": len(valid),
        "snapshot_id": snapshot_id,
    }


def enqueue_manual(repo_url: str, priority: int = 10) -> str:
    """Manually enqueue a single repo for out-of-band scoring."""
    redis = Redis.from_url(REDIS_URL, decode_responses=True)
    queue = Queue(QUEUE_NAME, connection=redis)
    job = queue.enqueue(
        "ghrank.worker.score_one_job",
        repo_url,
        priority=priority,
        job_timeout=300,
    )
    return job.id


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    summary = asyncio.run(run_pipeline())
    print(json.dumps(summary, indent=2))
    sys.exit(0 if summary["status"] == "ok" else 1)`,
  },
  { type: 'heading', level: 2, text: '2. Treat the data layer as a first-class citizen' },
  {
    type: 'paragraph',
    text: 'Most performance problems in large React apps are actually data-fetching problems. Use a real data library (React Query, SWR, Apollo) and stop managing server state in useState.',
  },
  { type: 'image', alt: 'Data layer architecture overview', caption: 'Server-state vs client-state separation', captionTag: 'FIG.03' },
  { type: 'blockquote', text: 'Server state is not your state. It is a cache of someone else\u2019s data. Treat it accordingly.' },
  { type: 'heading', level: 2, text: '3. Three rules for state' },
  {
    type: 'list',
    items: [
      'Server state — belongs in a data library, never in Redux or context.',
      'URL state — anything that should survive a refresh goes in the URL (search params, route params).',
      'Client state — the smallest category. If you have a lot here, you are probably duplicating server state.',
    ],
  },
  { type: 'image', alt: 'State management decision tree', caption: 'Decision tree for picking the right state bucket', captionTag: 'FIG.04' },
  { type: 'heading', level: 3, text: 'A quick note on composition' },
  {
    type: 'paragraph',
    text: 'Prefer small, composable components over configurable mega-components. A <Button> with 40 props is a sign you have built a configuration API, not a component. Split it into <Button>, <IconButton>, and <ButtonGroup> and your life gets easier.',
  },
  {
    type: 'paragraph',
    text: 'Curious what others are doing — especially anyone who has migrated a large app to the App Router. Drop your structure below.',
  },

  /* ═══ 链接卡片演示区 ═══ */

  { type: 'heading', level: 2, text: '4. Useful resources & references' },

  /* 演示 1：行内链接 — 文字中夹杂 URL，不转卡片，添加外链标识 */
  {
    type: 'paragraph',
    text: 'I highly recommend reading the official React docs on data fetching at https://react.dev/learn/data-fetching — it covers the core patterns we discussed above. Also check out the Next.js App Router guide at https://nextjs.org/docs/app for more details on file-based routing.',
  },

  /* 演示 2：独立段落纯外部链接 — 自动转为站外链接卡片 */
  {
    type: 'paragraph',
    text: 'https://github.com/reactjs/react.dev',
  },

  /* 演示 3：显式 linkcard 类型 — 站外链接卡片（带标题和描述） */
  {
    type: 'linkcard',
    url: 'https://tkdodo.eu/blog/practical-react-query',
    title: 'Practical React Query',
    description: 'TkDodo — Practical guide to server state management with React Query',
    isInternal: false,
  },

  /* 演示 4：显式 linkcard 类型 — 站内链接卡片 */
  {
    type: 'linkcard',
    url: '/community',
    title: 'GHRANK Community',
    description: 'Join the discussion — share your projects and ask questions',
    isInternal: true,
  },

  /* 演示 5：独立段落纯站内路径 — 自动转为站内链接卡片 */
  {
    type: 'paragraph',
    text: '/skills',
  },

  /* 演示 6：列表中包含行内链接 */
  {
    type: 'list',
    items: [
      'React Query docs: https://tanstack.com/query/latest',
      'Next.js App Router: https://nextjs.org/docs/app',
      'Check our internal skills marketplace at /skills for tool integrations',
    ],
  },
];

/* ═══════════════════════════════════════════════════════════
   3. 帖子详情静态数据
   ═══════════════════════════════════════════════════════════ */

export const POST_DETAIL: PostDetail = {
  id: 1,
  title: 'Best practices for structuring large React applications in 2026',
  author: 'raven_vex',
  avatar: 'R',
  section: 'Hot Topics',
  tags: ['React', 'Architecture', 'Frontend', 'TypeScript', 'WebDev'],
  postedTimeAgo: '4 hours ago',
  views: 1247,
  comments: 89,
  likes: 124,
  liked: true,
  bookmarked: false,
  isOnline: true,
  content: POST_CONTENT,
  poll: {
    title: 'Which state management library do you prefer in 2026?',
    options: [
      {
        key: 'zustand',
        label: 'Zustand',
        votes: 2847,
        voters: [
          { name: 'alex_shader', avatar: 'A' },
          { name: 'kairos', avatar: 'K' },
          { name: 'nexusdev', avatar: 'N' },
          { name: 'mlcraft', avatar: 'M' },
          { name: 'voidrunner', avatar: 'V' },
          { name: 'pixelshift', avatar: 'P' },
          { name: 'dataforge', avatar: 'D' },
          { name: 'cyclonix', avatar: 'C' },
          { name: 'nova_codes', avatar: 'N' },
          { name: 'kira_dev', avatar: 'K' },
          { name: 'sam_arch', avatar: 'S' },
          { name: 'jintao', avatar: 'J' },
          { name: 'shellweird', avatar: 'S' },
          { name: 'newton_r', avatar: 'N' },
          { name: 'mirakade', avatar: 'M' },
          { name: 'byteforge', avatar: 'B' },
          { name: 'quantumdev', avatar: 'Q' },
          { name: 'helix_code', avatar: 'H' },
          { name: 'synthwave', avatar: 'S' },
          { name: 'glitchart', avatar: 'G' },
          { name: 'neurostack', avatar: 'N' },
          { name: 'cryptoboy', avatar: 'C' },
          { name: 'vectorlab', avatar: 'V' },
          { name: 'fluxion', avatar: 'F' },
          { name: 'darkmode_d', avatar: 'D' },
          { name: 'rambda_42', avatar: 'R' },
          { name: 'tonex_dev', avatar: 'T' },
          { name: 'zenpulse', avatar: 'Z' },
          { name: 'luminode', avatar: 'L' },
          { name: 'codevex', avatar: 'X' },
        ],
      },
      {
        key: 'redux',
        label: 'Redux Toolkit',
        votes: 1923,
        voters: [
          { name: 'shellweird', avatar: 'S' },
          { name: 'newton_r', avatar: 'N' },
          { name: 'mirakade', avatar: 'M' },
          { name: 'alex_shader', avatar: 'A' },
          { name: 'kairos', avatar: 'K' },
          { name: 'nexusdev', avatar: 'N' },
          { name: 'mlcraft', avatar: 'M' },
          { name: 'voidrunner', avatar: 'V' },
          { name: 'pixelshift', avatar: 'P' },
          { name: 'dataforge', avatar: 'D' },
          { name: 'cyclonix', avatar: 'C' },
          { name: 'nova_codes', avatar: 'N' },
          { name: 'kira_dev', avatar: 'K' },
          { name: 'sam_arch', avatar: 'S' },
          { name: 'jintao', avatar: 'J' },
          { name: 'byteforge', avatar: 'B' },
          { name: 'quantumdev', avatar: 'Q' },
          { name: 'helix_code', avatar: 'H' },
          { name: 'synthwave', avatar: 'S' },
          { name: 'glitchart', avatar: 'G' },
          { name: 'neurostack', avatar: 'N' },
          { name: 'cryptoboy', avatar: 'C' },
          { name: 'vectorlab', avatar: 'V' },
          { name: 'fluxion', avatar: 'F' },
          { name: 'darkmode_d', avatar: 'D' },
          { name: 'rambda_42', avatar: 'R' },
          { name: 'tonex_dev', avatar: 'T' },
          { name: 'zenpulse', avatar: 'Z' },
          { name: 'luminode', avatar: 'L' },
          { name: 'codevex', avatar: 'X' },
        ],
      },
      {
        key: 'recoil',
        label: 'Recoil',
        votes: 687,
        voters: [
          { name: 'jintao', avatar: 'J' },
          { name: 'pixelshift', avatar: 'P' },
          { name: 'dataforge', avatar: 'D' },
          { name: 'cyclonix', avatar: 'C' },
          { name: 'nexusdev', avatar: 'N' },
          { name: 'alex_shader', avatar: 'A' },
          { name: 'kairos', avatar: 'K' },
          { name: 'mlcraft', avatar: 'M' },
          { name: 'voidrunner', avatar: 'V' },
          { name: 'nova_codes', avatar: 'N' },
          { name: 'kira_dev', avatar: 'K' },
          { name: 'sam_arch', avatar: 'S' },
          { name: 'shellweird', avatar: 'S' },
          { name: 'newton_r', avatar: 'N' },
          { name: 'mirakade', avatar: 'M' },
          { name: 'byteforge', avatar: 'B' },
          { name: 'quantumdev', avatar: 'Q' },
          { name: 'helix_code', avatar: 'H' },
          { name: 'synthwave', avatar: 'S' },
          { name: 'glitchart', avatar: 'G' },
          { name: 'neurostack', avatar: 'N' },
          { name: 'cryptoboy', avatar: 'C' },
          { name: 'vectorlab', avatar: 'V' },
          { name: 'fluxion', avatar: 'F' },
          { name: 'darkmode_d', avatar: 'D' },
          { name: 'rambda_42', avatar: 'R' },
          { name: 'tonex_dev', avatar: 'T' },
          { name: 'zenpulse', avatar: 'Z' },
          { name: 'luminode', avatar: 'L' },
          { name: 'codevex', avatar: 'X' },
        ],
      },
      {
        key: 'jotai',
        label: 'Jotai',
        votes: 1456,
        voters: [
          { name: 'nova_codes', avatar: 'N' },
          { name: 'kira_dev', avatar: 'K' },
          { name: 'sam_arch', avatar: 'S' },
          { name: 'alex_shader', avatar: 'A' },
          { name: 'mlcraft', avatar: 'M' },
          { name: 'kairos', avatar: 'K' },
          { name: 'nexusdev', avatar: 'N' },
          { name: 'voidrunner', avatar: 'V' },
          { name: 'pixelshift', avatar: 'P' },
          { name: 'dataforge', avatar: 'D' },
          { name: 'cyclonix', avatar: 'C' },
          { name: 'jintao', avatar: 'J' },
          { name: 'shellweird', avatar: 'S' },
          { name: 'newton_r', avatar: 'N' },
          { name: 'mirakade', avatar: 'M' },
          { name: 'byteforge', avatar: 'B' },
          { name: 'quantumdev', avatar: 'Q' },
          { name: 'helix_code', avatar: 'H' },
          { name: 'synthwave', avatar: 'S' },
          { name: 'glitchart', avatar: 'G' },
          { name: 'neurostack', avatar: 'N' },
          { name: 'cryptoboy', avatar: 'C' },
          { name: 'vectorlab', avatar: 'V' },
          { name: 'fluxion', avatar: 'F' },
          { name: 'darkmode_d', avatar: 'D' },
          { name: 'rambda_42', avatar: 'R' },
          { name: 'tonex_dev', avatar: 'T' },
          { name: 'zenpulse', avatar: 'Z' },
          { name: 'luminode', avatar: 'L' },
          { name: 'codevex', avatar: 'X' },
        ],
      },
      {
        key: 'mobx',
        label: 'MobX',
        votes: 389,
        voters: [
          { name: 'kairos', avatar: 'K' },
          { name: 'nexusdev', avatar: 'N' },
          { name: 'shellweird', avatar: 'S' },
          { name: 'alex_shader', avatar: 'A' },
          { name: 'mlcraft', avatar: 'M' },
          { name: 'voidrunner', avatar: 'V' },
          { name: 'pixelshift', avatar: 'P' },
          { name: 'dataforge', avatar: 'D' },
          { name: 'cyclonix', avatar: 'C' },
          { name: 'nova_codes', avatar: 'N' },
          { name: 'kira_dev', avatar: 'K' },
          { name: 'sam_arch', avatar: 'S' },
          { name: 'jintao', avatar: 'J' },
          { name: 'newton_r', avatar: 'N' },
          { name: 'mirakade', avatar: 'M' },
          { name: 'byteforge', avatar: 'B' },
          { name: 'quantumdev', avatar: 'Q' },
          { name: 'helix_code', avatar: 'H' },
          { name: 'synthwave', avatar: 'S' },
          { name: 'glitchart', avatar: 'G' },
          { name: 'neurostack', avatar: 'N' },
          { name: 'cryptoboy', avatar: 'C' },
          { name: 'vectorlab', avatar: 'V' },
          { name: 'fluxion', avatar: 'F' },
          { name: 'darkmode_d', avatar: 'D' },
          { name: 'rambda_42', avatar: 'R' },
          { name: 'tonex_dev', avatar: 'T' },
          { name: 'zenpulse', avatar: 'Z' },
          { name: 'luminode', avatar: 'L' },
          { name: 'codevex', avatar: 'X' },
        ],
      },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════
   4. 回复数据生成（确定性，保证 SSR/CSR 一致）
   ═══════════════════════════════════════════════════════════ */

/** 回复作者池（复用 community-data.ts 的 AUTHOR_POOL，补充原帖作者） */
const REPLY_AUTHORS = [
  { name: 'AlexShader', avatar: 'A' },
  { name: 'kairos', avatar: 'K' },
  { name: 'nexusdev', avatar: 'N' },
  { name: 'mlcraft', avatar: 'M' },
  { name: 'voidrunner', avatar: 'V' },
  { name: 'shellweird', avatar: 'S' },
  { name: 'newton_r', avatar: 'N' },
  { name: 'mirakade', avatar: 'M' },
  { name: 'jintao', avatar: 'J' },
  { name: 'pixelshift', avatar: 'P' },
  { name: 'dataforge', avatar: 'D' },
  { name: 'cyclonix', avatar: 'C' },
  { name: 'nova_codes', avatar: 'N' },
  { name: 'kira_dev', avatar: 'K' },
  { name: 'sam_arch', avatar: 'S' },
];

/** 回复内容句子池 */
const REPLY_SENTENCES = [
  'Feature-based folders have been a game changer for our team onboarding.',
  'We still use type-based folders for shared UI primitives, but features for everything else.',
  'The public API via index.ts is the single most important rule.',
  'Has anyone tried combining feature folders with Next.js App Router colocation?',
  'React Query is great until you need optimistic updates across multiple features.',
  'Zustand plus TanStack Query covers 90% of our state needs.',
  'Server state is not your state — I keep this printed above my monitor.',
  'The biggest win was splitting our mega Button into smaller composable pieces.',
  'We enforce import boundaries with a custom ESLint rule and it saved us repeatedly.',
  'Data libraries handle caching, but you still need to think about stale-while-revalidate UX.',
  'Composition beats configuration almost every time at scale.',
  'Colocation in app/ routes fights with feature folders; we solved it with re-exports.',
  'For real-time data, a separate subscription store calling invalidateQueries works well.',
  'We migrated a 150k LOC app and the navigation anxiety disappeared immediately.',
  'Barrel files can slow down TypeScript if you over-export; keep them lean.',
  'Nested features should expose only an aggregate index.ts to the rest of the app.',
  'Test files live next to the code they test; no separate __tests__ tree.',
  'CI checks import boundaries so code review does not have to.',
  'Routing by feature helped our backend team understand the frontend structure.',
  'The hardest part was not technical — it was agreeing on feature boundaries.',
];

/* ═══════════════════════════════════════════════════════════
   3.1 提问帖（带积分悬赏）内容 + 详情 —— 用于 Community › Tiebas 列表点击 Question 帖子
   ═══════════════════════════════════════════════════════════ */

/** 提问帖正文：用户模拟提出一个技术悬赏问题（200 积分） */
export const QUESTION_POST_CONTENT: ContentBlock[] = [
  {
    type: 'paragraph',
    text: 'I have been trying to make a RAG pipeline over 30k API documentation pages (OpenAPI specs + prose guides) and the retrieval quality is really inconsistent across endpoints. The same query against different versions of the same doc returns completely different chunks, and when an endpoint has nested parameters, the retriever usually grabs just the top-level description and misses the nested fields entirely.',
  },
  { type: 'heading', level: 2, text: 'What I have tried so far' },
  {
    type: 'list',
    items: [
      'Naive recursive character splitting (1024 / 200 overlap) — terrible for nested schemas.',
      'Markdown-aware splitting with LangChain — slightly better but still truncates deeply nested params.',
      'Structured extraction via a JSON schema parser that splits on endpoint boundaries — this helps, but examples from adjacent sections leak in.',
      'Hybrid search (BM25 + text-embedding-3-large RRF) — it helps a bit on endpoint names, not on semantics.',
    ],
  },
  { type: 'heading', level: 3, text: 'Concrete example of the failure mode' },
  {
    type: 'code',
    lang: 'JSON',
    code: `// Path: POST /v1/billing/invoices/_search
// The nested "filters[].amount.range" object is NEVER retrieved by
// top-k because the summary paragraph does not mention it.

{
  "path": "POST /v1/billing/invoices/_search",
  "summary": "Search invoices with filters.",
  "filters": [
    {
      "name": "amount",
      "type": "object",
      "range": {
        "min": { "type": "number", "required": false },
        "max": { "type": "number", "required": false }
      }
    }
  ]
}`,
  },
  { type: 'heading', level: 3, text: 'What I want to know' },
  {
    type: 'paragraph',
    text: 'I am offering **200 points** for an answer that actually shows, with code or pseudocode, how to split API documentation so that deeply nested schema fields are always co-retrieved with their parent endpoint when a user asks a semantically relevant question. The approach must also keep chunk size reasonable (≤1280 tokens for embedding) so that per-chunk costs do not explode.',
  },
  { type: 'blockquote', text: 'Bonus points if the answer includes how to build a chunk-level evaluation harness that compares two splitting strategies on the same corpus — I want a reproducible benchmark, not a hunch.' },
  { type: 'heading', level: 2, text: 'Constraints & environment' },
  {
    type: 'list',
    items: [
      'Embedding model: OpenAI text-embedding-3-large (cannot switch easily — already pinned).',
      'Vector DB: pgvector on Postgres 16 (ivfflat, ~32k rows, 3072-dim).',
      'Corpus: 30k pages, mix of OpenAPI YAML/JSON, Markdown guides, MDX tutorials.',
      'Budget: happy to re-embed once; cannot pay for a custom fine-tune run.',
    ],
  },
  {
    type: 'paragraph',
    text: 'Thank you in advance — please include a minimal runnable snippet if you can, or at least a clear split() function signature with the nesting strategy explained.',
  },
];

/** 提问帖详情：200 积分悬赏 · 还剩 3 天截止 · 未采纳 */
export const QUESTION_POST_DETAIL: PostDetail = {
  id: 9101,
  title:
    'Which RAG chunking strategy works best for API documentation? Deeply nested schemas keep getting truncated.',
  author: 'luminode',
  avatar: 'L',
  section: 'Questions',
  tags: ['RAG', 'API Docs', 'Embeddings', 'pgvector', 'Chunking'],
  postedTimeAgo: '7 hours ago',
  views: 842,
  comments: 34,
  likes: 46,
  liked: false,
  bookmarked: true,
  isOnline: true,
  content: QUESTION_POST_CONTENT,
  poll: { title: '', options: [] },
  threadType: 'question',
  questionPoints: 200,
  questionStatus: 'settled',
  questionDeadline: 'Closed',
  /** 3 位回答者被采纳：作者主观加权分配 200 PTS
   *  replyId=1 提供了完整 chunk size 实验表格 → 质量最高占 60% (+120)
   *  replyId=2 给出了 PDF 特殊场景的 schema-aware 方案 → 补充价值占 25% (+50)
   *  replyId=3 补充了 benchmark 思路 → 辅助占 15% (+30)
   *  （注：replyId 用 1/2/3 顶层保证 generateReplies 能命中）
   */
  acceptedReplies: [
    { replyId: 1, points: 120 },
    { replyId: 2, points: 50 },
    { replyId: 3, points: 30 },
  ],
  acceptedReplyId: 1,
};

/**
 * 统一解析帖子详情数据（供详情页和 OG 分享卡片 API 共用，保证数据一致）
 *
 * @param postIdStr 帖子 ID
 * @param barIdStr 贴吧 ID（默认 ai-agents）
 * @returns 完整 PostDetail 对象（含 acceptedReplies 等所有字段）
 */
export function resolvePostDetail(
  postIdStr: string | number | undefined,
  barIdStr?: string,
): PostDetail {
  const postId = typeof postIdStr === 'number' ? postIdStr : parseInt(String(postIdStr ?? ''), 10);
  if (!postId || isNaN(postId)) return POST_DETAIL;

  // 1) 精确匹配 QUESTION_POST_DETAIL.id (9101) → 直接返回
  if (postId === QUESTION_POST_DETAIL.id) return QUESTION_POST_DETAIL;

  // 2) 通过帖子池查询动态帖子
  try {
    const barId = barIdStr || 'ai-agents';
    const bar = findBar(barId);
    if (!bar) return POST_DETAIL;

    const pool = buildBarPool(bar, 80);
    const target = pool.find((t) => String(t.id) === String(postId));
    if (!target) return POST_DETAIL;

    // 提问帖：根据 postId 分配不同的积分分配模式
    if (target.threadType === 'question') {
      const points = target.questionPoints ?? QUESTION_POST_DETAIL.questionPoints ?? 100;

      /* 按 postId % 3 决定分配模式，体现三种不同场景：
       *  mode 0 → 单人独占：1 人获得全部积分（100%）
       *  mode 1 → 双人平分：2 人均分积分（50% / 50%）
       *  mode 2 → 三人加权：3 人按 60% / 25% / 15% 加权分配
       */
      const allocMode = postId % 3;
      let scaledReplies: Array<{ replyId: number; points: number }>;

      if (allocMode === 0) {
        // 单人独占：replyId=1 独享全部积分
        scaledReplies = [{ replyId: 1, points }];
      } else if (allocMode === 1) {
        // 双人平分：replyId=1 和 replyId=2 各占一半
        const half = Math.round(points / 2);
        scaledReplies = [
          { replyId: 1, points: half },
          { replyId: 2, points: points - half },
        ];
      } else {
        // 三人加权：60% / 25% / 15%，最后一项用减法保证总和精确
        const p1 = Math.round(points * 0.6);
        const p2 = Math.round(points * 0.25);
        scaledReplies = [
          { replyId: 1, points: p1 },
          { replyId: 2, points: p2 },
          { replyId: 3, points: Math.max(1, points - p1 - p2) },
        ];
      }
      return {
        ...QUESTION_POST_DETAIL,
        id: postId,
        title: target.title,
        author: target.author,
        avatar: target.avatar,
        postedTimeAgo: target.timeAgo,
        views: target.views,
        likes: target.likes,
        liked: target.liked,
        questionPoints: points,
        acceptedReplies: scaledReplies,
        acceptedReplyId: scaledReplies?.[0]?.replyId,
      };
    }

    // 投票帖：继承 POST_DETAIL 的 poll 数据
    if (target.threadType === 'vote') {
      return {
        ...POST_DETAIL,
        id: postId,
        title: target.title,
        author: target.author,
        avatar: target.avatar,
        postedTimeAgo: target.timeAgo,
        views: target.views,
        likes: target.likes,
        liked: target.liked,
        threadType: 'vote',
      };
    }

    // 普通帖
    return {
      ...POST_DETAIL,
      id: postId,
      title: target.title,
      author: target.author,
      avatar: target.avatar,
      postedTimeAgo: target.timeAgo,
      views: target.views,
      likes: target.likes,
      liked: target.liked,
      threadType: 'normal',
      poll: { title: '', options: [] },
    };
  } catch {
    return POST_DETAIL;
  }
}

/** 回复总数 */
export const TOTAL_REPLIES = 24;

/** 每页加载数量 */
export const REPLY_PAGE_SIZE = 6;

/** 初始骨架屏数量 */
export const REPLY_SKELETON_COUNT = 4;

/** 初始骨架屏延迟（ms） */
export const REPLY_INITIAL_DELAY = 600;

/** 线性同余生成器（LCG），保证可复现的伪随机序列 */
function createSeededRand(seed: number): () => number {
  let state = (seed * 2654435761) % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

/**
 * 确定性生成回复池
 * 使用固定种子，保证 SSR/CSR 一致
 */
export function generateReplies(): Reply[] {
  const rand = createSeededRand(42);
  const replies: Reply[] = [];

  let nextId = 1;

  /** 生成单条回复（可递归生成嵌套） */
  const createReply = (hasReplies: boolean, depth: number): Reply => {
    const author = REPLY_AUTHORS[Math.floor(rand() * REPLY_AUTHORS.length)];
    const content = [REPLY_SENTENCES[Math.floor(rand() * REPLY_SENTENCES.length)]];
    if (rand() > 0.55) {
      content.push(REPLY_SENTENCES[Math.floor(rand() * REPLY_SENTENCES.length)]);
    }
    const likes = Math.floor(rand() * 121);
    const minsAgo = Math.floor(rand() * 2876) + 5;
    const timeAgo = minsAgo < 60
      ? `${minsAgo}m`
      : minsAgo < 1440
        ? `${Math.floor(minsAgo / 60)}h`
        : `${Math.floor(minsAgo / 1440)}d`;
    const isOp = author.name === 'raven_vex' || rand() < 0.08;
    // 随机生成在线状态（约 55% 在线）
    const isOnline = rand() < 0.55;

    const reply: Reply = {
      id: nextId++,
      author: author.name,
      avatar: author.avatar,
      content,
      likes,
      liked: false,
      timeAgo,
      isOp,
      isOnline,
    };

    // 生成嵌套回复：最多 5 级，约 30% 概率有子回复
    if (hasReplies && depth < 5 && rand() < 0.3) {
      const childCount = Math.floor(rand() * 3) + 1; // 1-3 个子回复
      reply.replies = [];
      for (let i = 0; i < childCount; i++) {
        reply.replies.push(createReply(depth < 4, depth + 1));
      }
    }

    return reply;
  };

  // 生成顶层回复
  for (let i = 0; i < TOTAL_REPLIES; i++) {
    replies.push(createReply(true, 0));
  }

  return replies;
}

/**
 * 对回复列表排序
 * @param replies 回复列表
 * @param order 排序方式
 */
export function sortReplies(replies: Reply[], order: SortOrder): Reply[] {
  const list = replies.slice();
  switch (order) {
    case 'oldest':
      return list.sort((a, b) => a.id - b.id);
    case 'best':
      return list.sort((a, b) => b.likes - a.likes);
    case 'newest':
    default:
      return list.sort((a, b) => b.id - a.id);
  }
}

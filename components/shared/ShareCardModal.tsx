/**
 * ShareCardModal —— 社交媒体风格分享卡片弹窗
 * 统一社区卡片样式：Logo + 分类标签 + 标题 + 内容 + 作者 + 二维码 + 按钮
 */
'use client';

import {
  useState, useEffect, useCallback, createContext, useContext, useMemo,
  type ReactNode,
} from 'react';
import { App, Button } from 'antd';
import { HEX_CLIP_PATH } from '@/lib/constants';
import {
  ACHIEVEMENT_DEFS, USER_ACHIEVEMENT_PROGRESS, RARITY_META,
  type AchievementDef,
} from '@/lib/data/achievements-data';
import { ShareIcon, CopyIcon, DownloadIcon, CloseIcon } from './icons';
import { isImageAvatar } from '@/lib/avatar';

/* ═══════════════════════════════════════════════════
   一、类型定义
   ═══════════════════════════════════════════════════ */

type ShareType = 'profile' | 'github' | 'prompt' | 'skill';

/** Profile 分享数据 */
export interface ProfileShareData {
  displayName: string;
  username: string;
  avatar: string;
  bio: string;
  location?: string;
  stats?: {
    prompts: number;
    followers: number;
    following: number;
    tipsEarned?: number;
  };
  heatmap?: boolean;
  achievements?: boolean;
}

/** GitHub 项目分享数据 */
export interface GitHubShareData {
  owner: string;
  repo: string;
  fullName: string;
  description: string;
  stars: string | number;
  forks?: string | number;
  language?: string;
  languageColor?: string;
  coverUrl?: string;
  heatmap?: boolean;
}

/** Prompt 分享数据 */
export interface PromptShareData {
  title: string;
  model: string;
  author: string;
  authorLabel?: string;
  authorAvatar?: string;
  price?: number;
  thumbnail?: string;
  cover?: string;
  likes?: string | number;
  views?: string | number;
  description?: string;
  tags?: string[];
}

/** Skill 分享数据 */
export interface SkillShareData {
  name: string;
  author?: string;
  owner?: string;
  ownerLabel?: string;
  authorAvatar?: string;
  ownerAvatar?: string;
  category: string;
  stars: string | number;
  installs?: string | number;
  coverUrl?: string;
  repo?: string;
  tags?: string[];
  description?: string;
}

export type ShareDataType =
  | { type: 'profile'; data: ProfileShareData }
  | { type: 'github';  data: GitHubShareData }
  | { type: 'prompt';  data: PromptShareData }
  | { type: 'skill';   data: SkillShareData };

/* ═══════════════════════════════════════════════════
   三、OG 图片 URL 构造（服务端渲染分享卡片）
   ═══════════════════════════════════════════════════ */

/** 构造 OG 图片 URL —— 将分享数据序列化为 base64 传递给服务端 */
function buildOgUrl(payload: ShareDataType, shareUrl: string, download = false): string {
  const data = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const params = new URLSearchParams({ d: data, url: shareUrl });
  if (download) params.set('download', '1');
  return `/api/og/share?${params.toString()}`;
}

/* ═══════════════════════════════════════════════════
   四、Context —— 全局弹窗控制器
   ═══════════════════════════════════════════════════ */

interface ShareModalContextValue {
  open: (payload: ShareDataType) => void;
  close: () => void;
}

const ShareModalContext = createContext<ShareModalContextValue | null>(null);

export function useShareCardModal(): ShareModalContextValue {
  const ctx = useContext(ShareModalContext);
  if (!ctx) throw new Error('useShareCardModal must be used within <ShareCardModalProvider>');
  return ctx;
}

/* ═══════════════════════════════════════════════════
   三、通用卡片组件
   ═══════════════════════════════════════════════════ */

/** 品牌 Logo + 分类标签头部 */
function CardHeader({ category }: { category: string }) {
  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 22,
            height: 22,
            background: 'var(--gold-subtle)',
            border: '1px solid var(--gold)',
            clipPath: HEX_CLIP_PATH,
            fontFamily: 'var(--font-display)',
            fontSize: '11px',
            fontWeight: 800,
            color: 'var(--gold)',
            lineHeight: 1,
          }}
        >
          G
        </div>
        <span
          className="font-display text-xs font-bold tracking-wider"
          style={{ color: 'var(--gold)' }}
        >
          GHRANK
        </span>
      </div>
      <span
        className="font-mono text-[10px] font-bold"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}
      >
        {category.toUpperCase()}
      </span>
    </div>
  );
}

/** 分隔线 */
function Divider() {
  return (
    <div
      className="w-full"
      style={{ height: 1, background: 'var(--border-subtle)' }}
    />
  );
}

/** 作者信息块（两行：头像+用户名 / meta+统计） */
function AuthorBlock({
  avatar,
  name,
  meta,
  stats,
}: {
  avatar: string;
  name: string;
  meta?: string;
  stats?: Array<{ icon: string; value: string | number }>;
}) {
  const isImg = isImageAvatar(avatar);
  return (
    <div className="w-full flex items-start gap-2.5">
      <div
        className="flex items-center justify-center rounded-full overflow-hidden flex-shrink-0"
        style={{
          width: 32,
          height: 32,
          background: isImg ? 'var(--surface-overlay)' : 'var(--gold-subtle)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {isImg ? (
          <img
            src={avatar}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <span
            className="font-display font-bold select-none"
            style={{
              color: 'var(--gold)',
              fontSize: avatar.length >= 3 ? 11 : 14,
              lineHeight: 1,
            }}
          >
            {avatar}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <span
          className="font-display text-sm font-semibold truncate"
          style={{ color: 'var(--text)' }}
        >
          {name}
        </span>
        {(meta || stats?.length) ? (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {meta && (
              <span
                className="font-mono text-[10px] truncate"
                style={{ color: 'var(--text-dim)' }}
              >
                {meta}
              </span>
            )}
            {stats && stats.length > 0 && (
              <span className="flex items-center gap-2 font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>
                {stats.map((s, i) => (
                  <span key={i} className="whitespace-nowrap">{s.icon} {String(s.value)}</span>
                ))}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** 二维码区域（SCAN TO READ + URL） */
function QRCodeSection({ seed, url }: { seed: number; url: string }) {
  return (
    <div className="w-full flex items-center gap-4">
      <QRCodePlaceholder seed={seed} size={96} />
      <div className="flex flex-col gap-1.5">
        <span
          className="font-mono text-[10px] font-bold"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}
        >
          SCAN TO READ
        </span>
        <span
          className="font-mono text-[11px] break-all max-w-[140px]"
          style={{ color: 'var(--gold)' }}
        >
          {url}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   四、辅助组件
   ═══════════════════════════════════════════════════ */

/** 提交热力图 */
type HeatmapCell = '' | 'l1' | 'l2' | 'l3' | 'l4';
function genCells(seed = 42, weeks = 20): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < weeks * 7; i++) {
    const r = rnd();
    if (r < 0.12) cells.push('');
    else if (r < 0.30) cells.push('l1');
    else if (r < 0.52) cells.push('l2');
    else if (r < 0.75) cells.push('l3');
    else cells.push('l4');
  }
  return cells;
}

const HEATMAP_COLORS: Record<HeatmapCell, string> = {
  '': 'rgba(255,255,255,0.03)',
  l1: 'rgba(63,185,80,0.15)',
  l2: 'rgba(63,185,80,0.30)',
  l3: 'rgba(63,185,80,0.55)',
  l4: 'rgba(63,185,80,0.80)',
};

function ShareHeatmap({ seed = 42, weeks = 20 }: { seed?: number; weeks?: number }) {
  const cells = useMemo(() => genCells(seed, weeks), [seed, weeks]);
  return (
    <div
      className="w-full"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${weeks}, 1fr)`,
        gridTemplateRows: 'repeat(7, 1fr)',
        gap: 2,
        padding: 8,
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 4,
      }}
    >
      {cells.map((c, i) => (
        <div
          key={i}
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            background: HEATMAP_COLORS[c],
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

/** 成就徽章网格 */
function AchievementsGrid({ count = 8 }: { count?: number }) {
  const items = useMemo(() => {
    const unlocked = ACHIEVEMENT_DEFS
      .map((def) => {
        const progress = USER_ACHIEVEMENT_PROGRESS.find((p) => p.defId === def.id);
        return { def, progress };
      })
      .filter((it) => it.progress?.unlocked)
      .slice(0, count);
    const defs = unlocked.map((u) => u.def);
    const placeholders = ACHIEVEMENT_DEFS
      .filter((d) => !defs.find((u) => u.id === d.id))
      .slice(0, count - defs.length);
    return [
      ...unlocked.map((u) => ({ def: u.def, unlocked: true })),
      ...placeholders.map((d) => ({ def: d, unlocked: false })),
    ];
  }, [count]);

  return (
    <div
      className="w-full"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(5, items.length)}, 1fr)`,
        gap: 10,
        justifyItems: 'center',
      }}
    >
      {items.map(({ def, unlocked }) => (
        <AchievementBadge key={def.id} def={def} unlocked={unlocked} />
      ))}
    </div>
  );
}

function AchievementBadge({ def, unlocked }: { def: AchievementDef; unlocked: boolean }) {
  const rarity = RARITY_META[def.rarity];
  const color = unlocked ? rarity.color : 'var(--text-muted)';
  return (
    <div
      className="flex flex-col items-center gap-1"
      style={{ width: '100%', maxWidth: 64 }}
    >
      <span
        className="flex items-center justify-center w-11 h-11 font-display text-sm font-bold select-none"
        style={{
          color,
          background: unlocked ? rarity.color.replace('var(', 'rgba(').replace(')', ', 0.12)') : 'rgba(255,255,255,0.02)',
          border: `1.5px solid ${unlocked ? color : 'rgba(255,255,255,0.08)'}`,
          clipPath: HEX_CLIP_PATH,
        }}
      >
        {def.icon}
      </span>
      {unlocked && (
        <span
          className="font-mono text-[9px] text-center leading-tight"
          style={{ color: 'var(--text-dim)' }}
        >
          {def.name}
        </span>
      )}
    </div>
  );
}

/** 模拟二维码 */
function QRCodePlaceholder({ seed = 1, size = 100 }: { seed?: number; size?: number }) {
  const cells = useMemo(() => {
    const n = 21;
    let s = seed || 1;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const grid: boolean[][] = [];
    for (let y = 0; y < n; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < n; x++) {
        const isCorner =
          (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
        if (isCorner) {
          const cx = x < 7 ? x : x - (n - 7);
          const cy = y < 7 ? y : y - (n - 7);
          const inner = (cx >= 1 && cx <= 5 && cy >= 1 && cy <= 5);
          const border = (cx === 0 || cx === 6 || cy === 0 || cy === 6);
          const center = (cx === 2 || cx === 3 || cx === 4) && (cy === 2 || cy === 3 || cy === 4);
          row.push(border || (inner && center));
        } else {
          row.push(rnd() > 0.52);
        }
      }
      grid.push(row);
    }
    return grid;
  }, [seed]);

  const cell = size / 21;
  return (
    <div
      style={{
        width: size,
        height: size,
        background: '#fff',
        padding: cell * 0.8,
        borderRadius: 4,
        display: 'grid',
        gridTemplateColumns: `repeat(21, 1fr)`,
        gridTemplateRows: `repeat(21, 1fr)`,
        flexShrink: 0,
      }}
    >
      {cells.map((row, y) =>
        row.map((v, x) => (
          <div key={`${x}-${y}`} style={{ background: v ? '#000' : '#fff' }} />
        )),
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   五、内容渲染器（按 type 分支，统一社区卡片样式）
   ═══════════════════════════════════════════════════ */

function ProfileContent({
  data, showAchievements, seed,
}: { data: ProfileShareData; showAchievements: boolean; seed: number }) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/profile/${data.username}`;
  const isImg = isImageAvatar(data.avatar);
  return (
    <div className="flex flex-col gap-5">
      <CardHeader category="Profile" />

      {/* 用户信息 */}
      <div className="flex items-start gap-4">
        <div
          className="flex items-center justify-center rounded-full overflow-hidden flex-shrink-0"
          style={{
            width: 56,
            height: 56,
            background: isImg ? 'var(--surface-overlay)' : 'var(--gold-subtle)',
            border: '2px solid var(--border)',
          }}
        >
          {isImg ? (
            // 使用原生 img 而非 next/image：分享卡片是弹窗内的即时预览，
            // 不需要图片优化，原生 img 能避免 next/image 包裹层干扰圆形裁切。
            <img
              src={data.avatar}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <span
              className="font-display font-extrabold select-none"
              style={{ color: 'var(--gold)', fontSize: data.avatar.length >= 3 ? 18 : 22, lineHeight: 1 }}
            >
              {data.avatar}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-display text-lg font-bold"
            style={{ color: 'var(--text)' }}
          >
            {data.displayName}
          </div>
          <div
            className="font-mono text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            @{data.username}
          </div>
          {/* 统计数字 */}
          {data.stats && (
            <div className="flex items-center gap-4 mt-2">
              <div>
                <span className="font-mono text-sm font-bold" style={{ color: 'var(--text)' }}>
                  {data.stats.prompts}
                </span>
                <span className="font-mono text-[10px] ml-1" style={{ color: 'var(--text-dim)' }}>Prompts</span>
              </div>
              <div>
                <span className="font-mono text-sm font-bold" style={{ color: 'var(--text)' }}>
                  {data.stats.followers}
                </span>
                <span className="font-mono text-[10px] ml-1" style={{ color: 'var(--text-dim)' }}>Followers</span>
              </div>
              <div>
                <span className="font-mono text-sm font-bold" style={{ color: 'var(--text)' }}>
                  {data.stats.following}
                </span>
                <span className="font-mono text-[10px] ml-1" style={{ color: 'var(--text-dim)' }}>Following</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      <p
        className="font-body text-sm leading-relaxed"
        style={{ color: 'var(--text-dim)' }}
      >
        {data.bio}
      </p>

      {/* 热力图 */}
      {data.heatmap !== false && <ShareHeatmap seed={seed} weeks={26} />}

      {/* 成就 */}
      {showAchievements && <AchievementsGrid count={8} />}

      <Divider />
      <QRCodeSection seed={seed} url={url} />
    </div>
  );
}

function GitHubContent({ data, seed }: { data: GitHubShareData; seed: number }) {
  const url = `https://github.com/${data.fullName}`;
  return (
    <div className="flex flex-col gap-5">
      <CardHeader category="GitHub" />

      {/* 项目信息 */}
      <div className="flex flex-col gap-2">
        <h3
          className="font-display text-xl font-bold leading-tight"
          style={{ color: 'var(--text)' }}
        >
          {data.fullName}
        </h3>
        <p
          className="font-body text-sm leading-relaxed"
          style={{ color: 'var(--text-dim)' }}
        >
          {data.description}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: data.languageColor ?? 'var(--gold)' }}
            />
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>
              {data.language ?? 'Unknown'}
            </span>
          </div>
          <span className="font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>
            ★ {String(data.stars)} stars
          </span>
          {data.forks !== undefined && (
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>
              ⑂ {String(data.forks)} forks
            </span>
          )}
        </div>
      </div>

      {/* 热力图 */}
      {data.heatmap !== false && <ShareHeatmap seed={seed + 7} weeks={26} />}

      <Divider />
      <QRCodeSection seed={seed} url={url} />
    </div>
  );
}

function PromptContent({ data, seed }: { data: PromptShareData; seed: number }) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/prompt/${data.title.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="flex flex-col gap-5">
      <CardHeader category="Prompt" />

      {/* 封面图 */}
      {(data.thumbnail ?? data.cover) && (
        <div
          className="w-full rounded-md overflow-hidden"
          style={{
            aspectRatio: '16 / 9',
            background: 'var(--surface-overlay)',
            position: 'relative',
          }}
        >
          <img
            src={data.thumbnail ?? data.cover!}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      {/* 标题 + 标签 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="font-display text-xl font-bold leading-tight"
            style={{ color: 'var(--text)' }}
          >
            {data.title}
          </h3>
          <span
            className="font-mono text-xs font-bold px-2 py-1 flex-shrink-0"
            style={{
              color: 'var(--gold)',
              background: 'var(--gold-subtle)',
              borderRadius: 3,
            }}
          >
            {data.model}
          </span>
        </div>
        {data.description && (
          <p
            className="font-body text-sm leading-relaxed"
            style={{ color: 'var(--text-dim)' }}
          >
            {data.description}
          </p>
        )}
        {/* 标签 */}
        {Array.isArray(data.tags) && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="font-mono text-[10px] px-2 py-0.5"
                style={{
                  color: 'var(--text-dim)',
                  background: 'var(--surface-overlay)',
                  borderRadius: 3,
                }}
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 作者 + 统计 */}
      <AuthorBlock
        avatar={data.authorAvatar ?? data.author[0]}
        name={`@${data.author}`}
        meta={data.authorLabel}
        stats={[
          ...(data.likes !== undefined ? [{ icon: '♥', value: String(data.likes) }] : []),
          ...(data.views !== undefined ? [{ icon: '◎', value: String(data.views) }] : []),
        ]}
      />

      <Divider />
      <QRCodeSection seed={seed} url={url} />
    </div>
  );
}

function SkillContent({ data, seed }: { data: SkillShareData; seed: number }) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/skills/${data.name.toLowerCase().replace(/\s+/g, '-')}`;
  const authorName = data.author ?? data.owner ?? 'Unknown';
  const avatarSrc = data.authorAvatar ?? data.ownerAvatar ?? authorName[0];
  return (
    <div className="flex flex-col gap-5">
      <CardHeader category="Skill" />

      {/* 名称 + 分类 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="font-display text-xl font-bold leading-tight"
            style={{ color: 'var(--text)' }}
          >
            {data.name}
          </h3>
          <span
            className="font-mono text-[10px] font-bold px-2 py-1 flex-shrink-0"
            style={{
              color: 'var(--gold)',
              background: 'var(--gold-subtle)',
              borderRadius: 3,
            }}
          >
            {data.category.toUpperCase()}
          </span>
        </div>
        {data.description && (
          <p
            className="font-body text-sm leading-relaxed"
            style={{ color: 'var(--text-dim)' }}
          >
            {data.description}
          </p>
        )}
        {/* 标签 */}
        {Array.isArray(data.tags) && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="font-mono text-[10px] px-2 py-0.5"
                style={{
                  color: 'var(--text-dim)',
                  background: 'var(--surface-overlay)',
                  borderRadius: 3,
                }}
              >
                #{t}
              </span>
            ))}
          </div>
        )}
        {/* Repo 信息 */}
        {data.repo && (
          <div
            className="font-mono text-[11px] px-3 py-2"
            style={{
              color: 'var(--text-dim)',
              background: 'var(--surface-overlay)',
              borderRadius: 4,
            }}
          >
            github.com/{data.repo}
          </div>
        )}
      </div>

      {/* 作者 + 统计 */}
      <AuthorBlock
        avatar={avatarSrc}
        name={`@${authorName}`}
        meta={data.ownerLabel}
        stats={[
          { icon: '★', value: String(data.stars) },
          ...(data.installs !== undefined ? [{ icon: '⬇', value: String(data.installs) }] : []),
        ]}
      />

      <Divider />
      <QRCodeSection seed={seed} url={url} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   六、弹窗主体
   ═══════════════════════════════════════════════════ */

interface ModalState {
  open: boolean;
  payload: ShareDataType | null;
  seed: number;
}

/** 根据 payload 内容生成稳定的数字种子（用于热力图 / 二维码） */
function hashSeed(payload: ShareDataType): number {
  const str = JSON.stringify(payload);
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) || 1;
}

/** 根据 payload 类型渲染对应的分享卡片内容（直接在弹窗内展示，不依赖 OG 图片） */
function renderShareContent(payload: ShareDataType, seed: number) {
  switch (payload.type) {
    case 'profile':
      return <ProfileContent data={payload.data} showAchievements seed={seed} />;
    case 'github':
      return <GitHubContent data={payload.data} seed={seed} />;
    case 'prompt':
      return <PromptContent data={payload.data} seed={seed} />;
    case 'skill':
      return <SkillContent data={payload.data} seed={seed} />;
  }
}

function ShareCardModalRoot({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModalState>({ open: false, payload: null, seed: 1 });
  const { message } = App.useApp();

  const open = useCallback((payload: ShareDataType) => {
    setState({ open: true, payload, seed: hashSeed(payload) });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  useEffect(() => {
    if (!state.open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.open, close]);

  const copyLink = useCallback(async () => {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
      message.success('Link copied to clipboard');
    } catch {
      message.error('Copy failed');
    }
  }, [message]);

  /** 拷贝 OG 图片到剪贴板，不支持 ClipboardItem 时降级为下载 */
  const copyImage = useCallback(async () => {
    if (!state.payload) return;
    try {
      const ogUrl = buildOgUrl(
        state.payload,
        typeof window !== 'undefined' ? window.location.href : 'https://ghrank.io',
      );
      const res = await fetch(ogUrl);
      const blob = await res.blob();
      if (navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([new (window as any).ClipboardItem({ 'image/png': blob })]);
        message.success('Image copied to clipboard');
      } else {
        // 不支持 clipboard API 时直接下载
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ghrank-${state.payload.type}-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        message.success('Image downloaded');
      }
    } catch {
      message.error('Failed to copy image');
    }
  }, [state.payload, message]);

  /** 触发 OG 图片下载（服务端通过 Content-Disposition: attachment 返回） */
  const downloadImage = useCallback(async () => {
    if (!state.payload) return;
    try {
      const ogUrl = buildOgUrl(
        state.payload,
        typeof window !== 'undefined' ? window.location.href : 'https://ghrank.io',
        true, // download=1
      );
      // 直接用 <a> 触发下载（带 Content-Disposition: attachment）
      const a = document.createElement('a');
      a.href = ogUrl;
      a.download = `ghrank-${state.payload.type}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      message.success('Poster downloaded');
    } catch {
      message.error('Failed to download image');
    }
  }, [state.payload, message]);

  return (
    <ShareModalContext.Provider value={{ open, close }}>
      {children}

      {state.open && state.payload && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div
            className="flex flex-col items-center gap-5"
            style={{ maxWidth: '92vw' }}
          >
            {/* 分享卡片：直接在弹窗内渲染内容，保证无需等待 OG 图片即可显示 */}
            <div
              className="relative"
              style={{
                width: 380,
                maxWidth: '92vw',
                padding: 20,
                borderRadius: 12,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
              }}
            >
              {renderShareContent(state.payload, state.seed)}
            </div>

            {/* 底部控制栏 */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Button size="small" icon={<CopyIcon size={13} />} onClick={copyImage}>
                  Copy image
                </Button>
                <Button size="small" icon={<DownloadIcon size={13} />} onClick={downloadImage}>
                  Download image
                </Button>
                <Button
                  size="small"
                  type="primary"
                  icon={<ShareIcon size={13} />}
                  onClick={copyLink}
                >
                  Copy link
                </Button>
                <Button size="small" onClick={close} icon={<CloseIcon size={13} />}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ShareModalContext.Provider>
  );
}

export { ShareCardModalRoot };
export default ShareCardModalRoot;

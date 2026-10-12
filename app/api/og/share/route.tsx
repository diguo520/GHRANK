/**
 * 通用分享卡片 OG 图片 API
 *
 * 路由：/api/og/share
 *   - ?d=<base64 JSON payload>  分享数据（由前端 buildOgUrl 序列化）
 *   - ?url=<shareUrl>           二维码指向的链接
 *   - ?download=1               返回 Content-Disposition: attachment（触发下载）
 *
 * 用 next/og（Satori + resvg）在服务端渲染 PNG。
 * 与 /api/og/community/[id] 保持同一套字体加载与二维码算法。
 */
import { ImageResponse } from 'next/og';
import type { ReactElement } from 'react';
import type {
  ShareDataType,
  ProfileShareData,
  GitHubShareData,
  PromptShareData,
  SkillShareData,
} from '@/components/shared/ShareCardModal';

export const runtime = 'edge';

/* ═══════════════════════════════════════════════════
   字体加载（与社区 OG 路由一致）
   ═══════════════════════════════════════════════════ */

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`;
  const cssRes = await fetch(cssUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 5.0; rv:28.0) Gecko/20100101 Firefox/28.0' },
  });
  if (!cssRes.ok) throw new Error(`Font CSS fetch failed: ${family}:${weight}`);
  const css = await cssRes.text();
  const match = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]?(?:truetype|ttf)['"]?\)/);
  const urlMatch = match ? match[1] : css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!urlMatch) throw new Error(`No TTF URL for ${family}:${weight}`);
  const fontUrl = urlMatch.replace(/['"]/g, '');
  const fontRes = await fetch(fontUrl);
  if (!fontRes.ok) throw new Error(`Font file fetch failed: ${fontUrl}`);
  return await fontRes.arrayBuffer();
}

let fontCache: {
  sansRegular?: ArrayBuffer;
  sansBold?: ArrayBuffer;
  monoRegular?: ArrayBuffer;
  monoBold?: ArrayBuffer;
} = {};

async function getFonts() {
  if (!fontCache.sansRegular) {
    const [sansRegular, sansBold, monoRegular, monoBold] = await Promise.all([
      loadGoogleFont('Inter', 400),
      loadGoogleFont('Inter', 800),
      loadGoogleFont('JetBrains Mono', 400),
      loadGoogleFont('JetBrains Mono', 700),
    ]);
    fontCache = { sansRegular, sansBold, monoRegular, monoBold };
  }
  return fontCache;
}

/* ═══════════════════════════════════════════════════
   二维码点阵（与社区 OG 路由一致的算法）
   ═══════════════════════════════════════════════════ */

function generateQrCells(seedKey: string): number[][] {
  const N = 21;
  let h = 1779033703;
  for (let i = 0; i < seedKey.length; i++) h = (h * 31 + seedKey.charCodeAt(i)) >>> 0;
  const seed = () => {
    h = (h ^ (h >>> 16)) * 0x45d9f3b;
    h = (h ^ (h >>> 16)) * 0x45d9f3b;
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 0xffffffff;
  };
  const grid: number[][] = [];
  for (let r = 0; r < N; r++) {
    grid.push([]);
    for (let c = 0; c < N; c++) grid[r].push(seed() > 0.52 ? 1 : 0);
  }
  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const on = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4) ? 1 : 0;
        grid[r0 + r][c0 + c] = on;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, N - 7);
  drawFinder(N - 7, 0);
  return grid;
}

function QrCode({ seed, size = 96 }: { seed: string; size?: number }) {
  const cells = generateQrCells(seed);
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
        gridTemplateColumns: 'repeat(21, 1fr)',
        gridTemplateRows: 'repeat(21, 1fr)',
      }}
    >
      {cells.flat().map((v, i) => (
        <div key={i} style={{ background: v ? '#000' : '#fff' }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   通用样式常量
   ═══════════════════════════════════════════════════ */

const C = {
  bg: '#0a0a0a',
  surface: '#141414',
  border: '#2a2a2a',
  text: '#e8e8e8',
  textDim: '#8a8a8a',
  textMuted: '#6a6a6a',
  gold: '#d4af37',
  goldSubtle: 'rgba(212,175,55,0.12)',
};

/* ═══════════════════════════════════════════════════
   卡片内容渲染（按 type 分支）
   ═══════════════════════════════════════════════════ */

function ProfileCard({ data, seed, shareUrl }: { data: ProfileShareData; seed: number; shareUrl: string }) {
  // 头像若是图片 URL，OG 图中不便渲染外链图，回退为姓名首字母徽章
  const isImgAvatar = /^(?:\/|https?:\/\/).*\.(?:jpg|jpeg|png|webp|gif|avif|svg)(?:\?|#|$)/i.test(data.avatar);
  const badge = isImgAvatar
    ? data.displayName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : data.avatar;
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 头部：Logo + 分类 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 22, height: 22,
              background: C.goldSubtle,
              border: `1px solid ${C.gold}`,
              clipPath: 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.gold, fontSize: 11, fontWeight: 800,
            }}
          >G</div>
          <span style={{ color: C.gold, fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>GHRANK</span>
        </div>
        <span style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>PROFILE</span>
      </div>

      {/* 用户信息 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: C.goldSubtle, border: `2px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ color: C.gold, fontSize: 22, fontWeight: 800 }}>
            {badge.length > 3 ? badge.slice(0, 2) : badge}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: C.text, fontSize: 20, fontWeight: 800 }}>{data.displayName}</div>
          <div style={{ color: C.textMuted, fontSize: 12 }}>@{data.username}</div>
          {data.stats && (
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <div>
                <span style={{ color: C.text, fontSize: 14, fontWeight: 800 }}>{data.stats.prompts}</span>
                <span style={{ color: C.textDim, fontSize: 10, marginLeft: 4 }}>Prompts</span>
              </div>
              <div>
                <span style={{ color: C.text, fontSize: 14, fontWeight: 800 }}>{data.stats.followers}</span>
                <span style={{ color: C.textDim, fontSize: 10, marginLeft: 4 }}>Followers</span>
              </div>
              <div>
                <span style={{ color: C.text, fontSize: 14, fontWeight: 800 }}>{data.stats.following}</span>
                <span style={{ color: C.textDim, fontSize: 10, marginLeft: 4 }}>Following</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{data.bio}</p>

      <div style={{ height: 1, background: C.border }} />

      {/* 二维码 + 链接 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <QrCode seed={String(seed)} size={96} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>SCAN TO READ</span>
          <span style={{ color: C.gold, fontSize: 11, maxWidth: 180, wordBreak: 'break-all' }}>{shareUrl}</span>
        </div>
      </div>
    </div>
  );
}

function GitHubCard({ data, seed, shareUrl }: { data: GitHubShareData; seed: number; shareUrl: string }) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: C.goldSubtle, border: `1px solid ${C.gold}`, clipPath: 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold, fontSize: 11, fontWeight: 800 }}>G</div>
          <span style={{ color: C.gold, fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>GHRANK</span>
        </div>
        <span style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>GITHUB</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{ color: C.text, fontSize: 22, fontWeight: 800, margin: 0 }}>{data.fullName}</h3>
        <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{data.description}</p>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ color: C.textDim, fontSize: 11 }}>★ {String(data.stars)} stars</span>
          {data.forks !== undefined && <span style={{ color: C.textDim, fontSize: 11 }}>⑂ {String(data.forks)} forks</span>}
        </div>
      </div>

      <div style={{ height: 1, background: C.border }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <QrCode seed={String(seed)} size={96} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>SCAN TO READ</span>
          <span style={{ color: C.gold, fontSize: 11, maxWidth: 180, wordBreak: 'break-all' }}>{shareUrl}</span>
        </div>
      </div>
    </div>
  );
}

function PromptCard({ data, seed, shareUrl }: { data: PromptShareData; seed: number; shareUrl: string }) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: C.goldSubtle, border: `1px solid ${C.gold}`, clipPath: 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold, fontSize: 11, fontWeight: 800 }}>G</div>
          <span style={{ color: C.gold, fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>GHRANK</span>
        </div>
        <span style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>PROMPT</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <h3 style={{ color: C.text, fontSize: 22, fontWeight: 800, margin: 0, flex: 1 }}>{data.title}</h3>
          <span style={{ color: C.gold, background: C.goldSubtle, padding: '4px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{data.model}</span>
        </div>
        {data.description && <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{data.description}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.goldSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: C.gold, fontSize: 14, fontWeight: 800 }}>{data.author[0]}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>@{data.author}</span>
          <div style={{ display: 'flex', gap: 12 }}>
            {data.likes !== undefined && <span style={{ color: C.textDim, fontSize: 10 }}>♥ {String(data.likes)}</span>}
            {data.views !== undefined && <span style={{ color: C.textDim, fontSize: 10 }}>◎ {String(data.views)}</span>}
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: C.border }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <QrCode seed={String(seed)} size={96} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>SCAN TO READ</span>
          <span style={{ color: C.gold, fontSize: 11, maxWidth: 180, wordBreak: 'break-all' }}>{shareUrl}</span>
        </div>
      </div>
    </div>
  );
}

function SkillCard({ data, seed, shareUrl }: { data: SkillShareData; seed: number; shareUrl: string }) {
  const authorName = data.author ?? data.owner ?? 'Unknown';
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: C.goldSubtle, border: `1px solid ${C.gold}`, clipPath: 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold, fontSize: 11, fontWeight: 800 }}>G</div>
          <span style={{ color: C.gold, fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>GHRANK</span>
        </div>
        <span style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>SKILL</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <h3 style={{ color: C.text, fontSize: 22, fontWeight: 800, margin: 0, flex: 1 }}>{data.name}</h3>
          <span style={{ color: C.gold, background: C.goldSubtle, padding: '4px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{data.category.toUpperCase()}</span>
        </div>
        {data.description && <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{data.description}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.goldSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: C.gold, fontSize: 14, fontWeight: 800 }}>{authorName[0]}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>@{authorName}</span>
          <span style={{ color: C.textDim, fontSize: 10 }}>★ {String(data.stars)}</span>
        </div>
      </div>

      <div style={{ height: 1, background: C.border }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <QrCode seed={String(seed)} size={96} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>SCAN TO READ</span>
          <span style={{ color: C.gold, fontSize: 11, maxWidth: 180, wordBreak: 'break-all' }}>{shareUrl}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   GET handler
   ═══════════════════════════════════════════════════ */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const d = searchParams.get('d');
  const shareUrl = searchParams.get('url') || 'https://ghrank.io';
  const isDownload = searchParams.get('download') === '1';

  if (!d) {
    return new Response('Missing payload', { status: 400 });
  }

  // 解析 base64 payload
  let payload: ShareDataType;
  try {
    const json = decodeURIComponent(escape(atob(d)));
    payload = JSON.parse(json) as ShareDataType;
  } catch {
    return new Response('Invalid payload', { status: 400 });
  }

  const fonts = await getFonts();
  const seed = Array.from(d).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 7) || 1;

  let content: ReactElement;
  switch (payload.type) {
    case 'profile':
      content = <ProfileCard data={payload.data} seed={seed} shareUrl={shareUrl} />;
      break;
    case 'github':
      content = <GitHubCard data={payload.data} seed={seed} shareUrl={shareUrl} />;
      break;
    case 'prompt':
      content = <PromptCard data={payload.data} seed={seed} shareUrl={shareUrl} />;
      break;
    case 'skill':
      content = <SkillCard data={payload.data} seed={seed} shareUrl={shareUrl} />;
      break;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: C.bg,
          padding: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 560,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 28,
            fontFamily: 'Inter',
          }}
        >
          {content}
        </div>
      </div>
    ),
    {
      width: 624,
      height: 820,
      fonts: [
        { name: 'Inter', data: fonts.sansRegular!, weight: 400, style: 'normal' },
        { name: 'Inter', data: fonts.sansBold!, weight: 800, style: 'normal' },
        { name: 'JetBrains Mono', data: fonts.monoRegular!, weight: 400, style: 'normal' },
        { name: 'JetBrains Mono', data: fonts.monoBold!, weight: 700, style: 'normal' },
      ],
      ...(isDownload
        ? { headers: { 'Content-Disposition': `attachment; filename="ghrank-share-${Date.now()}.png"` } }
        : {}),
    },
  );
}

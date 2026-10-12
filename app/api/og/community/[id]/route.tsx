/**
 * OG 图片 API —— 社区帖子分享卡片
 *
 * 用 Next.js 内置的 ImageResponse（Satori + resvg）在服务端生成 PNG。
 * 彻底解决 Canvas 手绘的字体测量、跨域图片污染、布局错乱问题。
 *
 * 路由：/api/og/community/[id]
 *   - 默认返回 image/png
 *   - ?download=1 → Content-Disposition: attachment（触发下载）
 *   - ?url=<shareUrl> → 自定义二维码链接（默认用请求 Host 拼接）
 */
import { ImageResponse } from 'next/og';
import {
  generateReplies,
  resolvePostDetail,
  type ContentBlock,
  type PostDetail,
  type Reply,
} from '@/app/community/detail/_data/community-detail-data';

export const runtime = 'edge';

/* ═══════════════════════════════════════════════════
   1. 内容提取辅助（与客户端 extractCover / extractExcerpt 保持一致）
   ═══════════════════════════════════════════════════ */

function extractCover(blocks: ContentBlock[]): { url: string; caption?: string } | null {
  const first = blocks.find((b): b is Extract<ContentBlock, { type: 'image' }> => b.type === 'image');
  if (!first?.src) return null;
  return { url: first.src, caption: first.caption };
}

function extractExcerpt(blocks: ContentBlock[]): string {
  const paras = blocks
    .filter((b): b is Extract<ContentBlock, { type: 'paragraph' }> => b.type === 'paragraph')
    .map((b) => b.text);
  const joined = paras.slice(0, 2).join('  ');
  if (joined.length <= 160) return joined;
  return joined.slice(0, 160).trimEnd() + '…';
}

/* ── 递归查找回复（含嵌套子回复）by id ── */
function findReplyById(replies: Reply[], targetId: number): Reply | null {
  for (const r of replies) {
    if (r.id === targetId) return r;
    if (r.replies?.length) {
      const found = findReplyById(r.replies, targetId);
      if (found) return found;
    }
  }
  return null;
}

/* ═══════════════════════════════════════════════════
   2. 字体加载 —— 通过 Google Fonts CSS API 获取 TTF buffer
   Satori 只支持 TTF/OTF/WOFF，不支持 woff2，
   所以用旧版 User-Agent 让 Google 返回 TTF 格式的 CSS，
   再从 CSS 里解析出 .ttf URL 下载。
   这是 Next.js OG Image 官方推荐做法。
   ═══════════════════════════════════════════════════ */

/** 从 Google Fonts CSS API 获取指定字体的 TTF buffer */
async function loadGoogleFont(family: string, weight: number, text?: string): Promise<ArrayBuffer> {
  // text 参数可缩小字体子集（仅含指定字符），加快加载；不传则取全量
  const params = new URLSearchParams({ family: `${family}:wght@${weight}` });
  if (text) params.set('text', text);
  const cssUrl = `https://fonts.googleapis.com/css2?${params}`;

  // 用旧版 UA 触发 Google 返回 TTF 而非 woff2
  const cssRes = await fetch(cssUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 5.0; rv:28.0) Gecko/20100101 Firefox/28.0' },
  });
  if (!cssRes.ok) throw new Error(`Font CSS fetch failed: ${family}:${weight} ${cssRes.status}`);
  const css = await cssRes.text();

  // 解析第一个 src: url(...) 的字体文件 URL
  const match = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]?(?:truetype|ttf)['"]?\)/);
  const urlMatch = match ? match[1] : css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!urlMatch) throw new Error(`No TTF URL in CSS for ${family}:${weight}`);
  const fontUrl = urlMatch.replace(/['"]/g, '');

  const fontRes = await fetch(fontUrl);
  if (!fontRes.ok) throw new Error(`Font file fetch failed: ${fontUrl} ${fontRes.status}`);
  return await fontRes.arrayBuffer();
}

/** 字体缓存（edge runtime 模块级缓存） */
let fontCache: {
  sansRegular?: ArrayBuffer;
  sansBold?: ArrayBuffer;
  serifBold?: ArrayBuffer;
  monoRegular?: ArrayBuffer;
  monoBold?: ArrayBuffer;
} = {};

async function getFonts() {
  if (!fontCache.sansRegular) {
    const [sansRegular, sansBold, serifBold, monoRegular, monoBold] = await Promise.all([
      loadGoogleFont('Inter', 400),
      loadGoogleFont('Inter', 700),
      loadGoogleFont('Noto Serif SC', 700),
      loadGoogleFont('JetBrains Mono', 400),
      loadGoogleFont('JetBrains Mono', 700),
    ]);
    fontCache = { sansRegular, sansBold, serifBold, monoRegular, monoBold };
  }
  return fontCache;
}

/* ═══════════════════════════════════════════════════
   3. 二维码点阵生成（与客户端 QrPreview 一致的算法）
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

/* ═══════════════════════════════════════════════════
   4. GET handler —— 生成 OG 图片
   ═══════════════════════════════════════════════════ */

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);

  // 根据 id + bar 拿帖子数据（与详情页共用 resolvePostDetail，保证数据一致）
  const postIdNum = parseInt(id, 10);
  const shareUrlRaw = searchParams.get('url') || '';
  const barIdFromUrl = shareUrlRaw
    ? new URL(shareUrlRaw).searchParams.get('bar')
    : null;
  const barId = barIdFromUrl || 'ai-agents';

  // 统一数据源：resolvePostDetail 保证详情页与分享卡片数据完全一致
  const post: PostDetail = resolvePostDetail(postIdNum, barId);

  const cover = extractCover(post.content);
  const excerpt = extractExcerpt(post.content);

  // 分享链接：优先 query param，否则用请求 Host 拼接
  const shareUrl = searchParams.get('url') || `https://ghrank.io/community/detail/${id}`;
  const isDownload = searchParams.get('download') === '1';

  // 封面图 URL —— 同域的 /api/attachments/image 需要拼绝对 URL
  const coverUrl = cover
    ? cover.url.startsWith('http')
      ? cover.url
      : `${new URL(req.url).origin}${cover.url}`
    : null;

  // ── 帖子类型检测（优先级：question > vote > normal） ──
  const isQuestion = post.threadType === 'question';
  // 投票内容仅在非提问帖、非普通帖时显示（提问优先级高于投票）
  const hasPoll = !isQuestion && post.threadType !== 'normal' && (post.poll?.options?.length ?? 0) > 0;

  // ── 提问帖最佳答案：settled 状态，支持多个（acceptedReplies 优先，否则 fallback 单个 acceptedReplyId） ──
  interface BestAnswerWithPoints extends Reply {
    /** 该回答实际分到的积分数值 */
    _awardedPoints: number;
  }
  const bestAnswers: BestAnswerWithPoints[] = [];
  if (isQuestion && post.questionStatus === 'settled') {
    try {
      const allReplies = generateReplies();
      /* 优先使用 acceptedReplies 数组（支持多个+分配积分） */
      if (post.acceptedReplies && post.acceptedReplies.length > 0) {
        for (const a of post.acceptedReplies) {
          let r = findReplyById(allReplies, a.replyId);
          /* replyId 在回复池找不到时 → 合成一条兜底伪回复（保证卡片仍能展示"多人/加权分配"效果） */
          if (!r) {
            const fallbackAuthors = [
              { name: 'ember_ai', avatar: 'E' },
              { name: 'quark_root', avatar: 'Q' },
              { name: 'signal_flux', avatar: 'S' },
              { name: 'vertex_wave', avatar: 'V' },
              { name: 'nexus_pilot', avatar: 'N' },
              { name: 'tesseract_lab', avatar: 'T' },
            ];
            const fa = fallbackAuthors[(post.id + a.replyId) % fallbackAuthors.length];
            r = {
              id: a.replyId,
              author: fa.name,
              avatar: fa.avatar,
              content: [
                'Great breakdown — I arrived at the same pattern after testing 4 different approaches.',
                'One thing to watch out for: edge cases with nested recursive schemas need special handling.',
              ],
              likes: Math.floor((post.id + a.replyId) * 13) % 90 + 10,
              liked: false,
              timeAgo: `${((post.id + a.replyId) % 18) + 1}h`,
              isOp: false,
            };
          }
          bestAnswers.push({ ...r, _awardedPoints: a.points });
        }
      } else if (post.acceptedReplyId != null) {
        /* fallback 兼容旧数据：全部积分给单个 */
        let r = findReplyById(allReplies, post.acceptedReplyId);
        if (!r) {
          r = {
            id: post.acceptedReplyId,
            author: 'ember_ai',
            avatar: 'E',
            content: [
              'Provided a reproducible solution covering both the single-tenant and multi-tenant scenarios.',
            ],
            likes: 42,
            liked: false,
            timeAgo: '2d',
            isOp: false,
          };
        }
        bestAnswers.push({ ...r, _awardedPoints: post.questionPoints ?? 0 });
      }
    } catch {
      /* 解析失败不影响卡片生成 */
    }
  }
  const hasBestAnswers = bestAnswers.length > 0;

  // ── 卡片高度动态贴合内容 ──
  // 有封面：padding(72) + 品牌条(24) + 分隔线(17) + 标题(95, 更宽松行高) + 摘要(90)
  //         + 封面图(198) + 作者行(48) + 统计行(48) + 分隔线(17) + 二维码(72) ≈ 681
  // 无封面：同上减去封面图(198) ≈ 483
  // 额外高度 = 提问帖Bounty徽章(44) + 最佳答案区块（标题行20 + 每个答案110）/ 投票区块(~180)
  const bountyH = isQuestion ? 44 : 0;
  const bestAnswerH = hasBestAnswers ? 20 + bestAnswers.length * 110 : 0;
  const pollH = hasPoll ? 180 : 0;
  const CARD_W = 640;
  /* 基础卡片高度增量：标题-正文 / 正文-投票(最佳答案) / 区块-区块 / 封面图-区块
     每段从 18px 加大到 28px，共 4 段 → 总增量 +40px；coverUrl 分支也要同步增加 */
  const spacingDelta = 40;
  const CARD_H = (coverUrl ? 681 : 483) + bountyH + bestAnswerH + pollH + spacingDelta;

  // 格式化数字（阅读量、评论数）
  const formatStat = (n: number): string => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  };

  // 加载字体
  let fonts: Awaited<ReturnType<typeof getFonts>>;
  try {
    fonts = await getFonts();
  } catch {
    // 字体加载失败时仍返回图片（用系统字体兜底）
    fonts = {} as typeof fontCache;
  }

  const fontArr: { name: string; data: ArrayBuffer; weight: 400 | 600 | 700; style: 'normal' }[] = [];
  if (fonts.sansRegular) {
    fontArr.push({ name: 'Inter', data: fonts.sansRegular, weight: 400, style: 'normal' });
    fontArr.push({ name: 'Inter', data: fonts.sansBold || fonts.sansRegular, weight: 700, style: 'normal' });
  }
  if (fonts.serifBold) {
    fontArr.push({ name: 'NotoSerifSC', data: fonts.serifBold, weight: 700, style: 'normal' });
  }
  if (fonts.monoRegular) {
    fontArr.push({ name: 'JetBrainsMono', data: fonts.monoRegular, weight: 400, style: 'normal' });
    fontArr.push({ name: 'JetBrainsMono', data: fonts.monoBold || fonts.monoRegular, weight: 700, style: 'normal' });
  }

  // 二维码点阵
  const qrCells = generateQrCells(`${post.id}-${shareUrl}`);
  const qrN = 21;
  const qrCell = 72 / qrN;

  // 构建二维码 SVG（Satori 支持 <svg> 子元素）
  const qrSvg = (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ borderRadius: '8px' }}>
      <rect x="0" y="0" width="72" height="72" rx="8" fill="#fff" />
      {qrCells.flatMap((row, r) =>
        row.map((v, c) =>
          v ? (
            <rect
              key={`${r}-${c}`}
              x={c * qrCell}
              y={r * qrCell}
              width={qrCell * 0.92}
              height={qrCell * 0.92}
              fill="#0F1012"
            />
          ) : null,
        ),
      )}
      <rect x={qrCell * 9} y={qrCell * 9} width={qrCell * 3} height={qrCell * 3} fill="#9D8CFF" />
    </svg>
  );

  const shortUrl = shareUrl.length > 42 ? shareUrl.slice(0, 39) + '…' : shareUrl;

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0A0A0B',
          border: '1px solid #1F2023',
          borderRadius: '12px',
          padding: '36px 36px',
          fontFamily: 'Inter',
          color: '#EDEEEF',
          position: 'relative',
        }}
      >
        {/* 左上金角装饰 */}
        <div
          style={{
            position: 'absolute',
            top: '-1px',
            left: '-1px',
            width: '18px',
            height: '18px',
            borderTop: '2px solid #9D8CFF',
            borderLeft: '2px solid #9D8CFF',
            borderTopLeftRadius: '12px',
          }}
        />
        {/* 右下金角装饰 */}
        <div
          style={{
            position: 'absolute',
            bottom: '-1px',
            right: '-1px',
            width: '18px',
            height: '18px',
            borderBottom: '2px solid #9D8CFF',
            borderRight: '2px solid #9D8CFF',
            borderBottomRightRadius: '12px',
          }}
        />

        {/* 顶部品牌条 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#9D8CFF', fontFamily: 'JetBrainsMono' }}>
            GHRANK
          </span>
          <span style={{ fontSize: '11px', color: '#555860' }}>·</span>
          <span style={{ fontSize: '11px', fontWeight: 500, color: '#8A8F98', textTransform: 'uppercase' }}>
            {post.section}
          </span>
        </div>

        {/* 分隔短线 */}
        <div style={{ width: '36px', height: '1px', backgroundColor: '#1F2023', marginBottom: '16px' }} />

        {/* 提问帖专属：Bounty 悬赏徽章（显示积分 + 截止状态） */}
        {post.threadType === 'question' && post.questionPoints && (() => {
          const status = post.questionStatus ?? 'open';
          const isSettled = status === 'settled';
          /* 状态徽章样式：settled 金色，其余紫色 */
          const badgeStyle = isSettled
            ? {
                bg: 'rgba(232,197,106,0.1)',
                border: '1px solid rgba(232,197,106,0.4)',
                color: '#E8C56A',
                label: 'SETTLED',
              }
            : {
                bg: 'rgba(157,140,255,0.12)',
                border: '1px solid rgba(157,140,255,0.35)',
                color: '#9D8CFF',
                label: 'QUESTION',
              };
          /* 状态文本：settled 不显示倒计时，只显示已结算 */
          const statusText = isSettled
            ? 'Reward awarded'
            : `${status === 'open' ? 'Open' : status}${post.questionDeadline ? ' · ' + post.questionDeadline : ''}`;
          const statusColor = isSettled ? '#E8C56A' : '#8A8F98';

          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: badgeStyle.bg,
                  border: badgeStyle.border,
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: badgeStyle.color, fontFamily: 'JetBrainsMono', letterSpacing: '0.08em' }}>
                  {badgeStyle.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* 硬币图标 —— 与详情页 PostBountyCard 的 CoinsIcon 保持一致 */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8C56A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
                  <path d="M7 6h1v4" />
                  <path d="m16.71 13.88.7.71-2.82 2.82" />
                </svg>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#E8C56A', fontFamily: 'JetBrainsMono' }}>
                  {post.questionPoints} PTS
                </span>
                <span style={{ fontSize: '12px', color: '#555860' }}>·</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: statusColor, fontFamily: 'JetBrainsMono' }}>
                  {statusText}
                </span>
              </div>
            </div>
          );
        })()}

        {/* 标题 */}
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            fontFamily: 'NotoSerifSC, Inter',
            lineHeight: '1.35',
            letterSpacing: '-0.01em',
            margin: '0 0 28px 0',
            color: '#EDEEEF',
          }}
        >
          {post.title}
        </h1>

        {/* 摘要 */}
        <p
          style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#BEC2C9',
            margin: '0 0 28px 0',
          }}
        >
          {excerpt}
        </p>

        {/* ═══ 提问帖最佳答案（settled 状态时显示，支持多个） ═══ */}
        {hasBestAnswers && (() => {
          /* 用 bestAnswers 积分之和做分母，保证百分比总和 100% */
          const totalPoints = bestAnswers.reduce((s, a) => s + a._awardedPoints, 0) || (post.questionPoints ?? 0);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '28px' }}>
              {/* 区块标题行：总积分 + 采纳数量 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#E8C56A" strokeWidth="2" />
                  <polyline points="8 12 11 15 16 9" stroke="#E8C56A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#E8C56A', fontFamily: 'JetBrainsMono', letterSpacing: '0.08em' }}>
                  {bestAnswers.length === 1 ? 'BEST ANSWER' : `${bestAnswers.length} ACCEPTED ANSWERS`} · {totalPoints} PTS AWARDED
                </span>
              </div>
              {bestAnswers.map((ans, idx) => {
                /* 占比百分比 */
                const pct = totalPoints > 0 ? Math.round((ans._awardedPoints / totalPoints) * 100) : 0;
                /* 按积分高低给出边框深浅：第一名最亮，后续稍暗 */
                const tier = idx === 0
                  ? { border: '1px solid rgba(232,197,106,0.55)', bg: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, transparent 100%)', star: '1' }
                  : idx === 1
                  ? { border: '1px solid rgba(232,197,106,0.3)', bg: 'linear-gradient(135deg, rgba(251,191,36,0.05) 0%, transparent 100%)', star: '2' }
                  : { border: '1px solid rgba(232,197,106,0.18)', bg: 'rgba(251,191,36,0.025)', star: '3' };
                return (
                  <div
                    key={`${ans.id}-${idx}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      borderRadius: '8px',
                      border: tier.border,
                      background: tier.bg,
                      padding: '12px 16px',
                      marginBottom: idx < bestAnswers.length - 1 ? '8px' : 0,
                    }}
                  >
                    {/* 作者 + 积分徽章 行 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            display: 'flex',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(232,197,106,0.15)',
                            border: '1px solid #E8C56A',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#E8C56A',
                            fontFamily: 'JetBrainsMono',
                          }}
                        >
                          {ans.avatar.slice(0, 1).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#EDEEEF' }}>@{ans.author}</span>
                        <span style={{ fontSize: '11px', color: '#555860' }}>·</span>
                        <span style={{ fontSize: '11px', color: '#8A8F98', fontFamily: 'JetBrainsMono' }}>{ans.timeAgo}</span>
                      </div>
                      {/* 积分徽章：第一名最大最亮 */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(232,197,106,0.1)',
                          border: '1px solid rgba(232,197,106,0.35)',
                        }}
                      >
                        {/* 硬币图标 —— 与详情页 PostBountyCard 的 CoinsIcon 保持一致 */}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8C56A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="8" cy="8" r="6" />
                          <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
                          <path d="M7 6h1v4" />
                          <path d="m16.71 13.88.7.71-2.82 2.82" />
                        </svg>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#E8C56A', fontFamily: 'JetBrainsMono' }}>
                          +{ans._awardedPoints}
                        </span>
                        {bestAnswers.length > 1 && (
                          <span style={{ fontSize: '10px', color: '#8A8F98', fontFamily: 'JetBrainsMono', marginLeft: '2px' }}>
                            ({pct}%)
                          </span>
                        )}
                      </div>
                    </div>
                    {/* 答案内容摘要 */}
                    <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#BEC2C9', margin: 0 }}>
                      {ans.content.join(' ').slice(0, 120)}
                      {ans.content.join(' ').length > 120 ? '…' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* ═══ 投票内容区块（非提问帖且有投票数据时显示） ═══ */}
        {hasPoll && post.poll && post.poll.options.length > 0 && (() => {
          const totalVotes = post.poll.options.reduce((sum, o) => sum + o.votes, 0);
          /* 取票数前 3 名选项展示 */
          const topOptions = [...post.poll.options]
            .sort((a, b) => b.votes - a.votes)
            .slice(0, 3);

          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                borderRadius: '8px',
                border: '1px solid #1F2023',
                background: '#0E0F11',
                padding: '16px 18px',
                marginBottom: '28px',
              }}
            >
              {/* 投票标题行 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#9D8CFF',
                    fontFamily: 'JetBrainsMono',
                    letterSpacing: '0.1em',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(157,140,255,0.1)',
                    border: '1px solid rgba(157,140,255,0.3)',
                  }}
                >
                  POLL
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#EDEEEF' }}>
                  {post.poll.title}
                </span>
              </div>

              {/* 投票选项（前 3 名，带进度条） */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topOptions.map((opt, idx) => {
                  const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                  const isTop = idx === 0;
                  return (
                    <div
                      key={opt.key}
                      style={{
                        display: 'flex',
                        position: 'relative',
                        width: '100%',
                        height: '36px',
                        borderRadius: '6px',
                        backgroundColor: '#151618',
                        border: `1px solid ${isTop ? 'rgba(157,140,255,0.4)' : '#1F2023'}`,
                        overflow: 'hidden',
                        alignItems: 'center',
                      }}
                    >
                      {/* 进度条背景 */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: `${pct}%`,
                          background: isTop ? 'rgba(157,140,255,0.15)' : 'rgba(157,140,255,0.06)',
                        }}
                      />
                      {/* 选项内容 */}
                      <div
                        style={{
                          display: 'flex',
                          position: 'relative',
                          width: '100%',
                          padding: '0 12px',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: isTop ? 600 : 400, color: isTop ? '#9D8CFF' : '#BEC2C9' }}>
                          {opt.label}
                        </span>
                        <span style={{ fontSize: '11px', color: '#8A8F98', fontFamily: 'JetBrainsMono' }}>
                          {formatStat(opt.votes)} · {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 总票数 */}
              <div style={{ display: 'flex', marginTop: '10px' }}>
                <span style={{ fontSize: '11px', color: '#555860', fontFamily: 'JetBrainsMono' }}>
                  {formatStat(totalVotes)} votes total
                </span>
              </div>
            </div>
          );
        })()}

        {/* 封面图（无图片时不显示，避免无意义的占位区块） */}
        {coverUrl && (
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '180px',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '28px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={cover?.caption ?? ''}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                referrerPolicy: 'no-referrer',
              }}
            />
          </div>
        )}

        {/* 作者行 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div
            style={{
              display: 'flex',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(157,140,255,0.12)',
              border: '1px solid #9D8CFF',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700,
              color: '#9D8CFF',
              fontFamily: 'JetBrainsMono',
            }}
          >
            {post.avatar.slice(0, 1).toUpperCase()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#EDEEEF' }}>@{post.author}</span>
            <span style={{ fontSize: '12px', color: '#555860' }}>·</span>
            <span style={{ fontSize: '12px', color: '#8A8F98', fontFamily: 'JetBrainsMono' }}>
              {post.postedTimeAgo}
            </span>
          </div>
        </div>

        {/* 统计数据行：浏览量、评论数、发布时间 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '16px',
            paddingTop: '12px',
            paddingBottom: '12px',
            borderTop: '1px solid #1F2023',
            borderBottom: '1px solid #1F2023',
          }}
        >
          {/* 浏览量 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                stroke="#8A8F98"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" stroke="#8A8F98" strokeWidth="1.8" />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#BEC2C9', fontFamily: 'JetBrainsMono' }}>
              {formatStat(post.views)}
            </span>
          </div>

          <span style={{ width: '1px', height: '14px', backgroundColor: '#2A2B2F' }} />

          {/* 评论数 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                stroke="#8A8F98"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#BEC2C9', fontFamily: 'JetBrainsMono' }}>
              {formatStat(post.comments)}
            </span>
          </div>

          <span style={{ width: '1px', height: '14px', backgroundColor: '#2A2B2F' }} />

          {/* 发布时间 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#8A8F98" strokeWidth="1.8" />
              <polyline points="12 6 12 12 16 14" stroke="#8A8F98" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#BEC2C9' }}>
              {post.postedTimeAgo}
            </span>
          </div>
        </div>

        {/* 分隔线（位于二维码上方） */}
        <div style={{ width: '100%', height: '1px', backgroundColor: '#1F2023', marginBottom: '16px' }} />

        {/* 二维码 + 链接 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {qrSvg}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#8A8F98', fontFamily: 'JetBrainsMono' }}>SCAN TO READ</span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#EDEEEF' }}>{shortUrl}</span>
          </div>
        </div>
      </div>
    ),
    {
      width: CARD_W,
      height: CARD_H,
      fonts: fontArr,
    },
  );

  // 下载模式：加 Content-Disposition
  if (isDownload) {
    const headers = new Headers(imageResponse.headers);
    headers.set('Content-Disposition', `attachment; filename="ghrank-post-${id}.png"`);
    return new Response(imageResponse.body, {
      status: 200,
      headers,
    });
  }

  return imageResponse;
}

/**
 * GitHubDetailClient —— GitHub 项目详情页客户端组件
 * 迁移自原始 .design/pages/detail.html + detail.css
 * 职责：项目档案展示、Star 增长曲线（7d/1y Tab）、提交热力图、语言构成、提交趋势图、右侧边栏
 */

'use client';

import { useState, useEffect, useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import { BookmarkIcon, ShareIcon, GitHubIcon } from '../../_components/icons';
import type { LeaderboardCard as CardData } from '../../_data/leaderboard-data';
import { HEX_CLIP_PATH } from '@/lib/constants';
import CornerDecor from '@/components/shared/CornerDecor';

/* ═══════════════════════════════════════════════════════════════
   静态数据 —— 图表数据（迁移自 detail.js 的 STAR_CHART_DATA）
   ═══════════════════════════════════════════════════════════════ */

interface ChartDataset {
  label: string;
  yMax: number;
  yStep: number;
  xLabels: string[];
  points: number[];
  tooltipValues: string[];
  summary: { avg: string; peak: string; peakDate: string; total: string; totalLabel: string };
}

const STAR_CHART_DATA: Record<'7d' | '1y', ChartDataset> = {
  '7d': {
    label: '7-day window',
    yMax: 231000, yStep: 300,
    xLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    points: [229200, 229500, 229800, 230100, 230250, 230350, 230412],
    tooltipValues: ['229,200', '229,500', '229,800', '230,100', '230,250', '230,350', '230,412'],
    summary: { avg: '+173', peak: '+350', peakDate: '(Wed)', total: '+1,212', totalLabel: '7-day total' },
  },
  '1y': {
    label: '1-year window',
    yMax: 240000, yStep: 15000,
    xLabels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    points: [165000, 172000, 181000, 192000, 205000, 216000, 224000, 228000, 230412],
    tooltipValues: ['165,000', '172,000', '181,000', '192,000', '205,000', '216,000', '224,000', '228,000', '230,412'],
    summary: { avg: '+179', peak: '+4,500', peakDate: '(Mar 15)', total: '+65,412', totalLabel: '1-year total' },
  },
};

/** 提交趋势季度数据（2013 Q4 ~ 2026 Q2）—— 迁移自 detail.js */
const COMMIT_TREND_DATA = [
  120, 180, 280, 420, 520, 610, 580, 650, 580, 520, 480, 510,
  490, 450, 420, 390, 370, 350, 320, 300, 280, 260, 240, 220,
  210, 200, 190, 180, 170, 165, 160, 155, 150, 155, 170, 200,
  250, 320, 400, 480, 530, 580, 620, 650, 640, 610, 580, 550,
  480, 420, 350, 280, 200, 130,
];

const COMMIT_TREND_LABELS = (() => {
  const labels: string[] = [];
  let year = 2013, q = 4;
  for (let i = 0; i < COMMIT_TREND_DATA.length; i++) {
    labels.push(`${year} Q${q}`);
    q++;
    if (q > 4) { q = 1; year++; }
  }
  return labels;
})();

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ═══════════════════════════════════════════════════════════════
   热力图生成 —— 20 周 x 7 天，伪随机提交级别
   ═══════════════════════════════════════════════════════════════ */

type HeatmapCell = '' | 'l1' | 'l2' | 'l3' | 'l4';

function generateHeatmap(): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  let seed = 42;
  const pseudoRandom = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 20 * 7; i++) {
    const r = pseudoRandom();
    if (r < 0.12) cells.push('');
    else if (r < 0.30) cells.push('l1');
    else if (r < 0.52) cells.push('l2');
    else if (r < 0.75) cells.push('l3');
    else cells.push('l4');
  }
  return cells;
}

const COMMIT_LEVELS: Record<string, string> = {
  '': 'No commits', l1: '1-4 commits', l2: '5-9 commits', l3: '10-19 commits', l4: '20+ commits',
};

const HEATMAP_COLORS: Record<HeatmapCell, string> = {
  '': 'var(--surface-overlay)',
  l1: 'rgba(63, 185, 80, 0.15)',
  l2: 'rgba(63, 185, 80, 0.3)',
  l3: 'rgba(63, 185, 80, 0.5)',
  l4: 'rgba(63, 185, 80, 0.75)',
};

/* ═══════════════════════════════════════════════════════════════
   贡献者数据类型 & Mock 数据（模拟 GitHub API /stats/contributors）
   ═══════════════════════════════════════════════════════════════ */

interface Contributor {
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  total: number;
  additions: number;
  deletions: number;
  percentage: number;
}

const MOCK_CONTRIBUTORS: Contributor[] = (() => {
  const raw = [
    { login: 'gaearon', total: 186, additions: 14820, deletions: 8340 },
    { login: 'acdlite', total: 142, additions: 11200, deletions: 6780 },
    { login: 'sebmarkbage', total: 97, additions: 8540, deletions: 4120 },
    { login: 'sophiebits', total: 78, additions: 5630, deletions: 3210 },
    { login: 'rickhanlonii', total: 64, additions: 4280, deletions: 2150 },
    { login: 'tyao1', total: 41, additions: 2960, deletions: 1480 },
    { login: 'poteto', total: 33, additions: 2140, deletions: 980 },
    { login: 'kassens', total: 28, additions: 1870, deletions: 1120 },
    { login: 'jackpope', total: 22, additions: 1540, deletions: 620 },
    { login: 'mofeiZ', total: 18, additions: 1230, deletions: 540 },
    { login: 'sammy-SC', total: 15, additions: 980, deletions: 410 },
    { login: 'yungsters', total: 12, additions: 860, deletions: 320 },
    { login: 'lunaruan', total: 9, additions: 640, deletions: 210 },
  ];
  const totalCommits = raw.reduce((s, c) => s + c.total, 0);
  return raw
    .sort((a, b) => b.total - a.total)
    .map((c) => ({
      author: {
        login: c.login,
        avatar_url: `https://github.com/${c.login}.png`,
        html_url: `https://github.com/${c.login}`,
      },
      total: c.total,
      additions: c.additions,
      deletions: c.deletions,
      percentage: (c.total / totalCommits) * 100,
    }));
})();

/* ═══════════════════════════════════════════════════════════════
   页面静态辅助数据
   ═══════════════════════════════════════════════════════════════ */

const STATIC_TAGS = ['frontend', 'ui-library', 'declarative', 'components', 'virtual-dom'];

const STATIC_TOPICS = [
  'react', 'javascript', 'frontend', 'ui', 'components',
  'virtual-dom', 'declarative', 'hooks', 'jsx', 'ssr', 'isomorphic', 'library',
];

const STATIC_RELEASES = [
  { version: 'v19.1.0', badge: 'Latest', desc: 'Stable release with improved Suspense behavior and new use() hook.', date: '2026-07-15', latest: true },
  { version: 'v19.0.0', badge: 'Major', desc: 'React 19 stable. Server Components, Actions, useOptimistic, useTransition improvements.', date: '2026-04-02', latest: false },
  { version: 'v18.3.1', badge: 'Patch', desc: 'Bugfix release. Fixed hydration mismatch edge cases and improved concurrent rendering stability.', date: '2025-11-20', latest: false },
  { version: 'v18.2.0', badge: 'Minor', desc: 'Automatic batching, transitions, and Suspense for data fetching improvements.', date: '2025-06-14', latest: false },
];

const LANGUAGES = [
  { name: 'JavaScript', color: '#f1e05a', pct: 70.0 },
  { name: 'TypeScript', color: '#3178C6', pct: 14.8 },
  { name: 'HTML', color: '#e34c26', pct: 8.0 },
  { name: 'C++', color: '#555555', pct: 7.2 },
];

/* ═══════════════════════════════════════════════════════════════
   样式常量
   ═══════════════════════════════════════════════════════════════ */

const pageWrapStyle: CSSProperties = {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '0 0 48px',
};

const breadcrumbStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 0',
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  letterSpacing: '0.06em',
  color: 'var(--text-dim)',
  flexWrap: 'wrap',
  borderBottom: '1px solid var(--border-subtle)',
};

const dossierHeaderStyle: CSSProperties = {
  display: 'flex',
  gap: '24px',
  alignItems: 'flex-start',
  padding: '28px 0 8px',
};

const avatarStyle: CSSProperties = {
  width: '96px',
  height: '96px',
  flexShrink: 0,
  background: 'var(--gold)',
  clipPath: HEX_CLIP_PATH,
  padding: '2px',
  overflow: 'hidden',
};

const avatarInnerStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--surface)',
  clipPath: HEX_CLIP_PATH,
  fontFamily: 'var(--font-display)',
  fontSize: '36px',
  fontWeight: 800,
  color: 'var(--gold)',
};

const dossierNameStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '26px',
  fontWeight: 800,
  color: 'var(--text)',
  letterSpacing: '-0.01em',
  lineHeight: 1.2,
  margin: 0,
};

const bracketStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '26px',
  fontWeight: 700,
  color: 'var(--gold)',
  opacity: 0.7,
};

const metaCellStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  color: 'var(--text-dim)',
};

const tagStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  fontWeight: 600,
  padding: '3px 10px',
  background: 'rgba(245, 197, 24, 0.06)',
  color: 'var(--gold)',
  border: '1px solid rgba(245, 197, 24, 0.35)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const iconBtnStyle: CSSProperties = {
  width: '32px',
  height: '32px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-dim)',
  cursor: 'pointer',
  transition: 'color 0.18s, border-color 0.18s, background 0.18s',
};

const miniStatsRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: '12px',
  marginTop: '24px',
};

const miniStatStyle: CSSProperties = {
  position: 'relative',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  padding: '14px 16px',
  overflow: 'hidden',
};

const detailLayoutStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 360px',
  gap: '24px',
  margin: '16px auto 48px',
  alignItems: 'start',
};

const dashboardGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '55fr 45fr',
  gridTemplateRows: 'auto auto',
  gap: '20px',
  marginBottom: '20px',
};

const hudPanelBaseStyle: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 0,
  position: 'relative',
  padding: '22px 24px',
  marginBottom: '20px',
};

const panelTitleStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '13px',
  fontWeight: 700,
  color: 'var(--text)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  margin: 0,
};

const panelTitleRightStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  fontWeight: 500,
  color: 'var(--text-dim)',
  letterSpacing: '0.06em',
};

const tabStyle = (isActive: boolean): CSSProperties => ({
  padding: '5px 12px',
  background: isActive ? 'var(--gold-subtle)' : 'transparent',
  border: 'none',
  borderRadius: '4px',
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  fontWeight: 600,
  color: isActive ? 'var(--gold)' : 'var(--text-dim)',
  cursor: 'pointer',
  transition: 'all 0.15s',
});

const topicPillStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  color: 'var(--text-dim)',
  padding: '4px 10px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '3px',
  transition: 'border-color 0.15s, color 0.15s',
};

const badgeStyle = (variant: 'Latest' | 'Major' | 'Patch' | 'Minor'): CSSProperties => ({
  fontFamily: 'var(--font-mono)',
  fontSize: '9px',
  fontWeight: 700,
  padding: '2px 6px',
  borderRadius: '3px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  background: variant === 'Latest' ? 'var(--gold)' : variant === 'Major' ? 'var(--purple)' : variant === 'Patch' ? 'var(--orange)' : 'var(--cyan)',
  color: '#0a0a0a',
});

const readmeLinkStyle: CSSProperties = {
  color: 'var(--gold)',
  textDecoration: 'none',
  borderBottom: '1px solid rgba(245, 197, 24, 0.3)',
};

/* ═══════════════════════════════════════════════════════════════
   通用组件
   ═══════════════════════════════════════════════════════════════ */

/** HUD 面板：深色背景 + 金色边角 */
function HudPanel({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ ...hudPanelBaseStyle, ...style }}>
      <CornerDecor size={12} diagonal="bl-tr" />
      {children}
    </div>
  );
}

/** 面板标题（带右侧说明） */
function PanelTitle({ title, right }: { title: string; right?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
      <h3 style={panelTitleStyle}>{title}</h3>
      {right && <span style={panelTitleRightStyle}>{right}</span>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Star 增长曲线图（SVG）
   ═══════════════════════════════════════════════════════════════ */

function StarCurveChart({ data }: { data: ChartDataset }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const W = 400, H = 160, PAD = 36;

  const xStep = (W - PAD * 2) / (data.points.length - 1);
  const coords = data.points.map((p, i) => ({
    x: PAD + i * xStep,
    y: H - PAD - ((p - 0) / (data.yMax - 0)) * (H - PAD * 2),
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x},${c.y}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x},${H - PAD} L ${coords[0].x},${H - PAD} Z`;

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
        {/* Y 轴刻度线 */}
        {Array.from({ length: 5 }, (_, i) => {
          const y = PAD + (i * (H - PAD * 2)) / 4;
          const val = data.yMax - (i * data.yMax) / 4;
          return (
            <g key={i}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="var(--border-subtle)" strokeWidth="0.5" />
              <text x={PAD - 6} y={y + 3} textAnchor="end" fill="var(--text-muted)" fontSize="8" fontFamily="var(--font-mono)">
                {val >= 1000 ? `${Math.round(val / 1000)}K` : Math.round(val)}
              </text>
            </g>
          );
        })}
        {/* X 轴标签 */}
        {data.xLabels.map((label, i) => (
          <text key={i} x={coords[i].x} y={H - PAD + 14} textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="var(--font-mono)">
            {label}
          </text>
        ))}
        {/* 区域填充 */}
        <path d={areaPath} fill="rgba(245, 197, 24, 0.08)" />
        {/* 曲线 */}
        <path d={linePath} stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* 数据点 + hover */}
        {coords.map((c, i) => (
          <g key={i}>
            <circle
              cx={c.x} cy={c.y} r={hoverIdx === i ? 4 : 2.5}
              fill="var(--gold)"
              stroke="var(--bg)" strokeWidth="1"
              style={{ cursor: 'pointer', transition: 'r 0.15s' }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            />
            {hoverIdx === i && (
              <g>
                <rect x={c.x - 30} y={c.y - 26} width="60" height="18" rx="3" fill="var(--surface-overlay)" stroke="var(--border)" />
                <text x={c.x} y={c.y - 14} textAnchor="middle" fill="var(--text)" fontSize="9" fontFamily="var(--font-mono)">
                  {data.tooltipValues[i]}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
      {/* 摘要 */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
        <span>avg <strong style={{ color: 'var(--green)' }}>{data.summary.avg}</strong></span>
        <span>peak <strong style={{ color: 'var(--gold)' }}>{data.summary.peak}</strong> {data.summary.peakDate}</span>
        <span>{data.summary.totalLabel} <strong style={{ color: 'var(--text)' }}>{data.summary.total}</strong></span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   提交趋势条形图（SVG）
   ═══════════════════════════════════════════════════════════════ */

function CommitTrendChart({ data, labels }: { data: number[]; labels: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const H = 200;
  const PAD_BOTTOM = 26;

  // 使用 ResizeObserver 动态获取容器宽度，让图表填满容器
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const max = Math.max(...data);
  const W = Math.max(width, 1);
  const barW = W / data.length;
  // 标签间隔：容器越窄，标签越稀疏，避免重叠
  const labelEvery = W < 480 ? 10 : W < 720 ? 8 : 6;

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {width > 0 && (
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} fill="none" style={{ display: 'block' }} preserveAspectRatio="none">
          {data.map((v, i) => {
            const barH = (v / max) * (H - PAD_BOTTOM - 8);
            const x = i * barW;
            const y = H - PAD_BOTTOM - barH;
            return (
              <g key={i}>
                <rect
                  x={x + barW * 0.15} y={y} width={Math.max(barW * 0.7, 1)} height={barH}
                  fill="var(--gold)" opacity={0.5 + (v / max) * 0.5}
                  rx="1"
                />
                {/* 按间隔显示标签 */}
                {i % labelEvery === 0 && (
                  <text x={x + barW / 2} y={H - PAD_BOTTOM + 14} textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">
                    {labels[i]}
                  </text>
                )}
              </g>
            );
          })}
          <line x1={0} y1={H - PAD_BOTTOM} x2={W} y2={H - PAD_BOTTOM} stroke="var(--border-subtle)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   语言构成圆环图
   ═══════════════════════════════════════════════════════════════ */

function LanguageComposition() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <svg width="68" height="68" viewBox="0 0 68 68" style={{ flexShrink: 0 }}>
        <circle cx="34" cy="34" r="28" fill="none" stroke="#f1e05a" strokeWidth="8" strokeDasharray="123 176" transform="rotate(-90 34 34)" />
        <circle cx="34" cy="34" r="28" fill="none" stroke="#3178C6" strokeWidth="8" strokeDasharray="26 176" strokeDashoffset="-123" transform="rotate(-90 34 34)" />
        <circle cx="34" cy="34" r="28" fill="none" stroke="#e34c26" strokeWidth="8" strokeDasharray="14 176" strokeDashoffset="-149" transform="rotate(-90 34 34)" />
        <circle cx="34" cy="34" r="28" fill="none" stroke="#555555" strokeWidth="8" strokeDasharray="13 176" strokeDashoffset="-163" transform="rotate(-90 34 34)" />
      </svg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {LANGUAGES.map((lang) => (
          <div key={lang.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: lang.color }} />
            <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-dim)' }}>{lang.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{lang.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   贡献者数据表
   ═══════════════════════════════════════════════════════════════ */

function ContributorTable({ contributors }: { contributors: Contributor[] }) {
  const tableWrapStyle: CSSProperties = {
    maxHeight: '300px',
    overflowY: 'auto',
    border: '1px solid var(--border-subtle)',
    marginTop: '16px',
    marginBottom: '8px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--border) var(--surface)',
  };

  const tableStyle: CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
  };

  const thStyle: CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    background: 'var(--surface-overlay)',
    fontFamily: 'var(--font-mono)',
    fontSize: '9px',
    fontWeight: 700,
    color: 'var(--gold)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '8px 12px',
    textAlign: 'left',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  };

  const tdStyle: CSSProperties = {
    padding: '7px 12px',
    borderBottom: '1px solid var(--border-subtle)',
    color: 'var(--text-dim)',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={tableWrapStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: '36px', textAlign: 'center' }}>#</th>
            <th style={thStyle}>Contributor</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Commits</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Additions</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Deletions</th>
            <th style={{ ...thStyle, minWidth: '120px' }}>Contribution %</th>
          </tr>
        </thead>
        <tbody>
          {contributors.map((c, i) => (
            <tr
              key={c.author.login}
              style={{ transition: 'background 0.12s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)', fontSize: '10px' }}>
                {i + 1}
              </td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src={c.author.avatar_url}
                    alt={c.author.login}
                    width={24}
                    height={24}
                    style={{ borderRadius: '50%', border: '1px solid var(--border-subtle)', flexShrink: 0, background: 'var(--surface-overlay)' }}
                  />
                  <a
                    href={c.author.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.15s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
                  >
                    {c.author.login}
                  </a>
                </div>
              </td>
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: 'var(--text)' }}>{c.total.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#3FB950' }}>+{c.additions.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#F85149' }}>-{c.deletions.toLocaleString()}</td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${c.percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--gold), rgba(245,197,24,0.5))',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)', minWidth: '40px', textAlign: 'right' }}>
                    {c.percentage.toFixed(1)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   右侧边栏组件
   ═══════════════════════════════════════════════════════════════ */

function RankPanel() {
  return (
    <HudPanel style={{ padding: '24px 20px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '64px', fontWeight: 800, color: 'var(--gold)', lineHeight: 1 }}>#1</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '8px' }}>
        Global Rank
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px' }}>Frontend / UI Library</div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px',
        marginTop: '18px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px',
      }}>
        {[
          { label: 'Category', value: '#1' },
          { label: 'Language', value: '#1' },
          { label: 'License', value: 'MIT' },
        ].map((item) => (
          <div key={item.label}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>{item.value}</div>
          </div>
        ))}
      </div>
    </HudPanel>
  );
}

function TopicCloudPanel() {
  return (
    <HudPanel style={{ padding: 0 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={panelTitleStyle}>Topic Cloud</h3>
      </div>
      <div style={{ padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {STATIC_TOPICS.map((topic) => (
          <Link key={topic} href={`/search?q=${encodeURIComponent(topic)}`} style={topicPillStyle}>
            {topic}
          </Link>
        ))}
      </div>
    </HudPanel>
  );
}

function ReleaseTimelinePanel() {
  return (
    <HudPanel style={{ padding: 0 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={panelTitleStyle}>Release Timeline</h3>
      </div>
      <div style={{ padding: '12px 20px' }}>
        {STATIC_RELEASES.map((release, i) => (
          <div key={release.version} style={{ display: 'flex', gap: '12px', paddingBottom: i === STATIC_RELEASES.length - 1 ? 0 : '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: release.latest ? 'var(--gold)' : 'var(--cyan)',
              }} />
              {i !== STATIC_RELEASES.length - 1 && (
                <div style={{ width: '1px', flex: 1, background: 'var(--border-subtle)', marginTop: '4px' }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a href={`https://github.com/facebook/react/releases/${release.version}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--gold)' }}>
                  {release.version}
                </a>
                <span style={badgeStyle(release.badge as 'Latest' | 'Major' | 'Patch' | 'Minor')}>{release.badge}</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '2px', lineHeight: 1.4 }}>{release.desc}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{release.date}</div>
            </div>
          </div>
        ))}
      </div>
    </HudPanel>
  );
}

/* ═══════════════════════════════════════════════════════════════
   README 内容（与 detail.html 保持一致）
   ═══════════════════════════════════════════════════════════════ */

function ReadmeContent({ name }: { name: string }) {
  return (
    <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.8 }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '28px', color: 'var(--text)', margin: '0 0 12px' }}>
        <a href="#" style={readmeLinkStyle}>{name}</a>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#fff', background: '#555', padding: '2px 8px', borderRadius: '3px' }}>MIT</span>
      </h1>
      <p style={{ margin: '0 0 12px' }}>
        <strong style={{ color: 'var(--text)' }}>{name.charAt(0).toUpperCase() + name.slice(1)}</strong> is a JavaScript library for building user interfaces.
      </p>
      <ul style={{ margin: '0 0 16px', paddingLeft: '20px' }}>
        <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--text)' }}>Declarative:</strong> React makes it painless to create interactive UIs. Design simple views for each state in your application.</li>
        <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--text)' }}>Component-Based:</strong> Build encapsulated components that manage their own state, then compose them to make complex UIs.</li>
        <li><strong style={{ color: 'var(--text)' }}>Learn Once, Write Anywhere:</strong> Develop new features in React without rewriting existing code.</li>
      </ul>
      <h2 style={{ fontSize: '20px', color: 'var(--text)', margin: '16px 0 10px' }}>Install</h2>
      <p style={{ margin: '0 0 12px' }}>React has been designed for gradual adoption from the start:</p>
      <ul style={{ margin: '0 0 16px', paddingLeft: '20px' }}>
        <li style={{ marginBottom: '6px' }}>Use <a href="#" style={readmeLinkStyle}>Quick Start</a> to get a taste of React.</li>
        <li style={{ marginBottom: '6px' }}><a href="#" style={readmeLinkStyle}>Add React to an Existing Project</a> to use as little or as much React as you need.</li>
        <li><a href="#" style={readmeLinkStyle}>Learn React</a> teaches you React from scratch with no prior web or JavaScript experience assumed.</li>
      </ul>
      <h2 style={{ fontSize: '20px', color: 'var(--text)', margin: '16px 0 10px' }}>Documentation</h2>
      <p style={{ margin: '0 0 12px' }}>You can find the React documentation <a href="#" style={readmeLinkStyle}>on the website</a>.</p>
      <p style={{ margin: '0 0 12px' }}>The documentation is divided into several sections:</p>
      <ul style={{ margin: '0 0 16px', paddingLeft: '20px' }}>
        {['Quick Start', 'Tutorial', 'Thinking in React', 'Installation', 'Describing the UI', 'Adding Interactivity', 'Managing State', 'Advanced Guides'].map((item) => (
          <li key={item} style={{ marginBottom: '4px' }}><a href="#" style={readmeLinkStyle}>{item}</a></li>
        ))}
      </ul>
      <h2 style={{ fontSize: '20px', color: 'var(--text)', margin: '16px 0 10px' }}>Examples</h2>
      <p style={{ margin: '0 0 12px' }}>We have several examples <a href="#" style={readmeLinkStyle}>on the website</a>. Here is the first one to get you started:</p>
      <pre style={{
        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px',
        padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-dim)', overflowX: 'auto',
      }}>
        <code>{`import { createRoot } from 'react-dom/client';

function HelloMessage({ name }) {
  return <div>Hello {name}</div>;
}

createRoot(document.getElementById('container'))
  .render(<HelloMessage name="Taylor" />);`}</code>
      </pre>
      <p style={{ margin: '12px 0 0' }}>This example will render &ldquo;Hello, Taylor&rdquo; into a container on the page.</p>
      <h2 style={{ fontSize: '20px', color: 'var(--text)', margin: '16px 0 10px' }}>Contributing</h2>
      <p style={{ margin: '0 0 12px' }}>
        The main purpose of this repository is to continue evolving React core, making it faster and easier to use.
        Development of React happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements.
      </p>
      <a href="#" style={{ ...readmeLinkStyle, fontWeight: 600 }}>Read Full README &rarr;</a>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   主组件
   ═══════════════════════════════════════════════════════════════ */

interface GitHubDetailClientProps {
  repo: string;
  cardData: CardData | null;
}

export default function GitHubDetailClient({ repo, cardData }: GitHubDetailClientProps) {
  const [chartTab, setChartTab] = useState<'7d' | '1y'>('7d');
  const [heatmapCells, setHeatmapCells] = useState<HeatmapCell[]>([]);
  const [hoverCell, setHoverCell] = useState<{ idx: number; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 生成热力图数据
  useEffect(() => {
    setHeatmapCells(generateHeatmap());
  }, []);

  // 统计数字计数动画
  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const animIds: number[] = [];

    statRefs.current.forEach((el) => {
      if (!el) return;
      const text = el.textContent?.trim() || '';
      const match = text.match(/^([+#]?)([\d,.]+)(.*)/);
      if (!match) return;
      const prefix = match[1], numStr = match[2], suffix = match[3];
      const target = parseFloat(numStr.replace(/,/g, ''));
      const hasComma = numStr.includes(',');

      const timer = setTimeout(() => {
        const start = performance.now();
        const duration = 1200;
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(target * eased);
          el.textContent = prefix + (hasComma ? current.toLocaleString() : current.toString()) + suffix;
          if (progress < 1) {
            animIds.push(requestAnimationFrame(tick));
          }
        };
        animIds.push(requestAnimationFrame(tick));
      }, 700);
      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
      animIds.forEach(cancelAnimationFrame);
    };
  }, []);

  // 从仓库名解析 name（owner 未使用，仅取 name 用于首字母显示）
  const [, name] = repo.split('/');
  const displayName = cardData?.repo || repo;
  const description = cardData?.desc || `Open source repository ${repo} on GitHub.`;
  const langColor = cardData?.langColor || '#5c6370';

  // 演示数据：facebook/react 与 detail.html 对齐，其它仓库使用卡片数据
  const isReact = repo === 'facebook/react';
  const displayStars = isReact ? '230,412' : (cardData?.stars || '—');
  const displayForks = isReact ? '48,200' : (cardData?.forks || '—');
  const displayLang = isReact ? 'JavaScript' : (cardData?.lang || '—');
  const createdAt = isReact ? '2013-05-24' : '—';
  const updatedAt = isReact ? '2026-07-31' : '—';
  const growth = cardData?.growth || '+0%';

  // 迷你统计面板
  const miniStats = [
    { label: 'Stars', value: displayStars, change: '+12.4% (7d)', changeColor: 'var(--green)', icon: '★' },
    { label: 'Forks', value: displayForks, change: '+3.2% (7d)', changeColor: 'var(--green)', icon: '⑂' },
    { label: 'Watchers', value: '6,700', change: '+0.8%', changeColor: 'var(--green)', icon: '◎' },
    { label: 'Issues', value: '847', change: '-15 resolved today', changeColor: 'var(--gold)', icon: '◷' },
    { label: 'PRs', value: '234', change: '+8 new', changeColor: 'var(--green)', icon: '≡' },
    { label: 'Rank', value: '#1', change: 'Frontend', changeColor: 'var(--gold)', icon: '★' },
  ];

  // 提交趋势汇总
  const commitTotal = COMMIT_TREND_DATA.reduce((sum, v) => sum + v, 0);
  const commitPeak = Math.max(...COMMIT_TREND_DATA);
  const commitAvg = Math.round(commitTotal / COMMIT_TREND_DATA.length);

  return (
    <main className="main-content" style={pageWrapStyle} ref={containerRef}>
      {/* ═══ 面包屑 ═══ */}
      <nav style={breadcrumbStyle}>
        <Link href="/" style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>&larr; Back</Link>
        <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>/</span>
        <Link href="/" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Leaderboard</Link>
        <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>/</span>
        <span style={{ color: 'var(--text)', fontWeight: 600 }}>{displayName}</span>
      </nav>

      {/* ═══ 项目头部档案 ═══ */}
      <header style={dossierHeaderStyle}>
        {/* 六边形头像 */}
        <div style={avatarStyle}>
          <div style={avatarInnerStyle}>
            {name?.[0]?.toUpperCase() || '?'}
          </div>
        </div>
        {/* 仓库信息 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={bracketStyle}>[</span>
            <h1 style={dossierNameStyle}>{displayName}</h1>
            <span style={bracketStyle}>]</span>
            <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
              <button type="button" style={iconBtnStyle} title="Bookmark" aria-label="Bookmark">
                <BookmarkIcon size={14} />
              </button>
              <button type="button" style={iconBtnStyle} title="Share" aria-label="Share">
                <ShareIcon size={14} />
              </button>
            </div>
          </div>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text-dim)',
            lineHeight: 1.6, margin: '0 0 14px', maxWidth: '720px',
          }}>
            {description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', marginBottom: '14px' }}>
            <span style={metaCellStyle}>
              <GitHubIcon size={12} />
              <strong style={{ color: 'var(--text)' }}>MIT License</strong>
            </span>
            <span style={metaCellStyle}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: langColor, display: 'inline-block' }} />
              <strong style={{ color: 'var(--text)' }}>{displayLang}</strong>
            </span>
            <span style={metaCellStyle}>Created <strong style={{ color: 'var(--text)' }}>{createdAt}</strong></span>
            <span style={metaCellStyle}>Updated <strong style={{ color: 'var(--text)' }}>{updatedAt}</strong></span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '12px',
              color: 'var(--green)', background: 'rgba(63, 185, 80, 0.1)',
              padding: '3px 8px', borderRadius: '3px',
            }}>
              {growth} growth
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {STATIC_TAGS.map((tag) => (
              <span key={tag} style={tagStyle}>{tag}</span>
            ))}
          </div>
        </div>
      </header>

      {/* ═══ 迷你统计面板 ═══ */}
      <section style={miniStatsRowStyle}>
        {miniStats.map((stat, i) => (
          <div key={stat.label} style={miniStatStyle}>
            {/* 左侧金色高亮条 */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: 'var(--gold)', opacity: 0.4 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--gold)', opacity: 0.55 }}>{stat.icon}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {stat.label}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>
              <span ref={(el) => { statRefs.current[i] = el; }}>{stat.value}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '4px', color: stat.changeColor }}>
              {stat.change}
            </div>
          </div>
        ))}
      </section>

      {/* ═══ 双栏布局：左侧图表 + 右侧边栏 ═══ */}
      <div style={detailLayoutStyle}>
        <div style={{ minWidth: 0 }}>
          {/* 并排仪表盘：Star 增长曲线 + 提交热力图 + 语言构成 */}
          <div style={dashboardGridStyle}>
            {/* Star 增长曲线（跨两行） */}
            <div style={{ gridRow: '1 / -1', alignSelf: 'stretch' }}>
              <HudPanel style={{ height: '100%', marginBottom: 0 }}>
                <PanelTitle title="Star Growth Curve" right="7D / 1Y" />
                <div style={{ display: 'inline-flex', gap: '2px', background: 'var(--bg)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '3px', marginBottom: '14px' }}>
                  {(['7d', '1y'] as const).map((tab) => (
                    <button key={tab} onClick={() => setChartTab(tab)} style={tabStyle(chartTab === tab)}>
                      {tab === '7d' ? '7D' : '1Y'}
                    </button>
                  ))}
                </div>
                <StarCurveChart data={STAR_CHART_DATA[chartTab]} />
              </HudPanel>
            </div>

            {/* 提交热力图（紧凑模式，与 detail.html 保持一致） */}
            <HudPanel style={{ padding: '10px', marginBottom: 0, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div
                style={{
                  display: 'grid',
                  // 与 detail.css 一致：7 天为行、20 周为列，按列填充，模拟 GitHub 贡献图
                  gridTemplateRows: 'repeat(7, 1fr)',
                  gridTemplateColumns: 'repeat(20, 1fr)',
                  gridAutoFlow: 'column',
                  gap: '2px',
                }}
              >
                {heatmapCells.map((cell, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '100%', aspectRatio: '1', borderRadius: '2px',
                      background: HEATMAP_COLORS[cell], cursor: 'pointer', transition: 'transform 0.1s',
                      transform: hoverCell?.idx === idx ? 'scale(1.3)' : 'scale(1)',
                      zIndex: hoverCell?.idx === idx ? 10 : 1,
                    }}
                    onMouseEnter={(e) => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setHoverCell({ idx, x: rect.left + rect.width / 2, y: rect.top });
                    }}
                    onMouseLeave={() => setHoverCell(null)}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                <span>20-week activity</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Less</span>
                  {(['', 'l1', 'l2', 'l3', 'l4'] as HeatmapCell[]).map((level) => (
                    <span key={level} style={{ width: '11px', height: '11px', borderRadius: '2px', background: HEATMAP_COLORS[level], border: '1px solid var(--border-subtle)' }} />
                  ))}
                  <span>More</span>
                </span>
              </div>
            </HudPanel>

            {/* 语言构成 */}
            <HudPanel style={{ padding: '14px 16px', marginBottom: 0 }}>
              <LanguageComposition />
            </HudPanel>
          </div>

          {/* 提交趋势图 */}
          <HudPanel>
            <PanelTitle title="Commits Over Time" right="2013 Q4 — 2026 Q2" />
            <CommitTrendChart data={COMMIT_TREND_DATA} labels={COMMIT_TREND_LABELS} />
            {/* 贡献者数据表 */}
            <ContributorTable contributors={MOCK_CONTRIBUTORS} />
            <div style={{ display: 'flex', gap: '20px', marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
              <span>Total: <strong style={{ color: 'var(--text)' }}>{commitTotal.toLocaleString()}</strong></span>
              <span>Peak: <strong style={{ color: 'var(--gold)' }}>{commitPeak}</strong></span>
              <span>Avg/Qtr: <strong style={{ color: 'var(--green)' }}>{commitAvg}</strong></span>
              <span>Period: <strong style={{ color: 'var(--gold)' }}>2013 Q4 — 2026 Q2</strong></span>
            </div>
          </HudPanel>

          {/* README 文档区 */}
          <HudPanel style={{ marginTop: '20px' }}>
            <PanelTitle title="README.md" right="Read-only" />
            <ReadmeContent name={name || repo} />
          </HudPanel>
        </div>

        {/* ═══ 右侧边栏 ═══ */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <RankPanel />
          <TopicCloudPanel />
          <ReleaseTimelinePanel />
        </aside>
      </div>

      {/* Hover tooltip */}
      {hoverCell && (
        <div style={{
          position: 'fixed',
          left: hoverCell.x,
          top: hoverCell.y - 32,
          transform: 'translateX(-50%)',
          background: 'var(--surface-overlay)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '4px 10px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text)',
          pointerEvents: 'none',
          zIndex: 1000,
          whiteSpace: 'nowrap',
        }}>
          {DAY_NAMES[hoverCell.idx % 7]}, Week {Math.floor(hoverCell.idx / 7) + 1} — {COMMIT_LEVELS[heatmapCells[hoverCell.idx]]}
        </div>
      )}
    </main>
  );
}

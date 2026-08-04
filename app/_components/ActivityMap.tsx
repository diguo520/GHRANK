/**
 * ActivityMap —— Center Flow 径向流动特效
 * 中心六边形 G Logo + 外围分类节点，连线脉冲光点从中心向外流动
 * 实现：SVG + GSAP（动态导入），尊重 prefers-reduced-motion
 */
'use client';

import { useRef, useEffect } from 'react';
import CornerDecor from '@/components/shared/CornerDecor';

/** viewBox 与容器尺寸保持一致（480 × 320） */
const VB_W = 480;
const VB_H = 320;
const CX = VB_W / 2; // 240
const CY = VB_H / 2; // 160

/** 中心六边形半径（直径约 112px） */
const HEX_R = 56;

/** 六边形顶点 —— pointy-top，与 Navbar Logo 风格一致 */
const HEX_POINTS = Array.from({ length: 6 }, (_, k) => {
  const a = (Math.PI / 180) * (60 * k - 90);
  return `${(CX + HEX_R * Math.cos(a)).toFixed(2)},${(CY + HEX_R * Math.sin(a)).toFixed(2)}`;
}).join(' ');

/** 外围节点数据 —— 标签 / 颜色 / 基准坐标 / 标签位置 */
const NODES = [
  { label: 'VUEJS',   color: '#42B883', x: 78,  y: 92,  labelDy: -26 },
  { label: 'AI',      color: '#A371F7', x: 200, y: 46,  labelDy: -26 },
  { label: 'NEXT.JS', color: '#EDEDED', x: 352, y: 58,  labelDy: -26 },
  { label: 'TOOLS',   color: '#E85D04', x: 430, y: 148, labelDy: 34 },
  { label: 'REACT',   color: '#61DAFB', x: 392, y: 260, labelDy: 34 },
  { label: 'PYTORCH', color: '#EE4C2C', x: 256, y: 294, labelDy: -26 },
  { label: 'GO',      color: '#00ADD8', x: 116, y: 274, labelDy: 34 },
  { label: 'RUST',    color: '#DE7C4A', x: 50,  y: 196, labelDy: -26 },
] as const;

export default function ActivityMap() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const ctxRef = useRef<{ revert: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    // 尊重 prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    import('gsap').then((mod) => {
      if (cancelled) return;
      const gsap = mod.gsap;
      if (!gsap || !svgRef.current) return;

      // 清理上一次上下文
      ctxRef.current?.revert();

      const ctx = gsap.context(() => {
        const svg = svgRef.current!;

        const lines = Array.from(svg.querySelectorAll<SVGLineElement>('.cf-line'));
        const nodeGroups = Array.from(svg.querySelectorAll<SVGGElement>('.cf-node'));
        const nodeDots = Array.from(svg.querySelectorAll<SVGCircleElement>('.cf-node-dot'));
        const pulses = Array.from(svg.querySelectorAll<SVGCircleElement>('.cf-pulse'));

        // ── 1. 中心辉光呼吸 ──
        const glow = svg.querySelector<SVGCircleElement>('.cf-glow');
        if (glow) {
          gsap.set(glow, { opacity: 0.25, svgOrigin: `${CX} ${CY}` });
          gsap.to(glow, {
            opacity: 0.55,
            scale: 1.12,
            duration: 2.4,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
        }

        // 中心六边形描边轻微明暗呼吸
        const hex = svg.querySelector<SVGPolygonElement>('.cf-hex');
        if (hex) {
          gsap.to(hex, {
            opacity: 0.7,
            duration: 2.4,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
        }

        // ── 2. 外围节点漂浮（x/y 随机缓慢偏移，各自不同 duration） ──
        NODES.forEach((node, i) => {
          const group = nodeGroups[i];
          const line = lines[i];
          if (!group || !line) return;

          const ampX = 8 + (i % 3) * 4;   // 8 ~ 16
          const ampY = 6 + ((i + 1) % 3) * 4; // 6 ~ 14
          const proxy = { dx: 0, dy: 0 };

          gsap.to(proxy, {
            dx: (i % 2 === 0 ? 1 : -1) * ampX,
            dy: (i % 3 === 0 ? -1 : 1) * ampY,
            duration: 3.2 + i * 0.55,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
              const nx = node.x + proxy.dx;
              const ny = node.y + proxy.dy;
              group.setAttribute('transform', `translate(${nx}, ${ny})`);
              line.setAttribute('x2', String(nx));
              line.setAttribute('y2', String(ny));
            },
          });
        });

        // ── 3. 脉冲光点：沿连线从中心向外传播 + 到达时节点闪烁 ──
        NODES.forEach((_, i) => {
          const line = lines[i];
          const pulse = pulses[i];
          const dot = nodeDots[i];
          if (!line || !pulse || !dot) return;

          const DUR = 1.5;      // 单程传播时长
          const GAP = 1.1;      // 循环间隔
          const DELAY = 0.4 + i * 0.35; // 各脉冲错开

          const proxy = { t: 0 };
          const tl = gsap.timeline({ repeat: -1, delay: DELAY, repeatDelay: GAP });

          tl.to(proxy, {
            t: 1,
            duration: DUR,
            ease: 'power1.in',
            onStart: () => gsap.set(pulse, { opacity: 0 }),
            onUpdate: () => {
              const t = proxy.t;
              // 实时读取连线端点（节点漂浮中），保证脉冲跟随
              const x2 = parseFloat(line.getAttribute('x2') || '0');
              const y2 = parseFloat(line.getAttribute('y2') || '0');
              pulse.setAttribute('cx', String(CX + (x2 - CX) * t));
              pulse.setAttribute('cy', String(CY + (y2 - CY) * t));
              // 起势淡入 / 收尾淡出
              const op = t < 0.12 ? t / 0.12 : t > 0.88 ? (1 - t) / 0.12 : 1;
              pulse.setAttribute('opacity', op.toFixed(3));
            },
            onComplete: () => gsap.set(pulse, { opacity: 0 }),
          });

          // 脉冲到达瞬间：节点短暂闪烁（放大 + 提亮）
          tl.fromTo(
            dot,
            { attr: { r: 15 }, opacity: 1 },
            { attr: { r: 19 }, opacity: 0.85, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1 },
            DUR
          );
        });
      }, wrapRef.current!);

      ctxRef.current = ctx;
    }).catch(() => {
      // GSAP 加载失败，静默降级为静态图形
    });

    return () => {
      cancelled = true;
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="star-map-wrap relative"
      style={{ width: 480, maxWidth: '100%', aspectRatio: '3 / 2', flexShrink: 0 }}
    >
      <svg
        ref={svgRef}
        className="star-map-svg w-full h-full block"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        fill="none"
      >
        <defs>
          {/* HUD 网格背景 */}
          <pattern id="hudgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(245,197,24,0.05)" strokeWidth="0.5" />
          </pattern>
          {/* 中心辉光径向渐变 */}
          <radialGradient id="cfGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,197,24,0.45)" />
            <stop offset="55%" stopColor="rgba(245,197,24,0.12)" />
            <stop offset="100%" stopColor="rgba(245,197,24,0)" />
          </radialGradient>
          {/* 脉冲光点模糊光晕 */}
          <filter id="cfBlur" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
        </defs>

        {/* HUD 网格背景（保留） */}
        <rect width={VB_W} height={VB_H} fill="url(#hudgrid)" />

        {/* 中心辉光（呼吸） */}
        <circle className="cf-glow" cx={CX} cy={CY} r={86} fill="url(#cfGlowGrad)" opacity={0.35} />

        {/* 连线：中心 → 外围节点 */}
        <g stroke="rgba(245,197,24,0.2)" strokeWidth="1">
          {NODES.map((node, i) => (
            <line
              key={i}
              className="cf-line"
              x1={CX}
              y1={CY}
              x2={node.x}
              y2={node.y}
            />
          ))}
        </g>

        {/* 脉冲光点：亮金色 + 模糊光晕（由 GSAP 驱动沿连线移动） */}
        <g>
          {NODES.map((_, i) => (
            <circle
              key={i}
              className="cf-pulse"
              cx={CX}
              cy={CY}
              r={4}
              fill="#f5c518"
              filter="url(#cfBlur)"
              opacity={0}
            />
          ))}
        </g>

        {/* 外围节点：圆点 + 外环 + 标签（由 GSAP 驱动漂浮） */}
        <g>
          {NODES.map((node, i) => (
            <g key={i} className="cf-node" transform={`translate(${node.x}, ${node.y})`}>
              {/* 外环 */}
              <circle r={19} fill="none" stroke={node.color} strokeWidth="1" opacity={0.35} />
              {/* 节点主体 */}
              <circle className="cf-node-dot" r={15} fill={node.color} opacity={1} />
              {/* 内部高光点 */}
              <circle r={5} fill="rgba(10,12,16,0.55)" />
              {/* 标签 */}
              <text
                y={node.labelDy}
                textAnchor="middle"
                fill={node.color}
                opacity={0.85}
                fontFamily="IBM Plex Mono"
                fontSize="10"
                letterSpacing="2"
              >
                {node.label}
              </text>
            </g>
          ))}
        </g>

        {/* 中心六边形 G Logo —— 与 Navbar Logo 风格一致 */}
        <g>
          <polygon
            className="cf-hex"
            points={HEX_POINTS}
            fill="rgba(245,197,24,0.06)"
            stroke="#f5c518"
            strokeWidth="1.5"
            opacity={1}
          />
          {/* 内层六边形细描边，增强 HUD 层次感 */}
          <polygon
            points={Array.from({ length: 6 }, (_, k) => {
              const a = (Math.PI / 180) * (60 * k - 90);
              return `${(CX + (HEX_R - 8) * Math.cos(a)).toFixed(2)},${(CY + (HEX_R - 8) * Math.sin(a)).toFixed(2)}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(245,197,24,0.25)"
            strokeWidth="0.75"
          />
          <text
            x={CX}
            y={CY}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#f5c518"
            fontFamily="IBM Plex Mono"
            fontSize="52"
            fontWeight={700}
          >
            G
          </text>
        </g>
      </svg>

      {/* 四角标装饰（保留） */}
      <CornerDecor opacity={0.6} />
    </div>
  );
}

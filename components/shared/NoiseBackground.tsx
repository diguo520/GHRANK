/**
 * NoiseBackground —— 通用噪点背景占位组件
 * 参考 reactbits.dev/animations/noise 实现
 * 当图片/视频加载失败或附件被删除时，使用噪点背景 + 提示文字占位
 */
'use client';

import { useEffect, useRef, type CSSProperties } from 'react';

interface NoiseBackgroundProps {
  message?: string;
  subMessage?: string;
  className?: string;
  style?: CSSProperties;
  icon?: React.ReactNode;
}

export default function NoiseBackground({
  message = 'Media Unavailable',
  subMessage = 'This attachment has been deleted or cannot be loaded',
  className = '',
  style: externalStyle,
  icon,
}: NoiseBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 降低分辨率以提升性能，同时保持噪点颗粒感
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.ceil((canvas.offsetWidth / 2) * dpr);
      canvas.height = Math.ceil((canvas.offsetHeight / 2) * dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const buffer = new Uint32Array(imageData.data.buffer);

    let rafId: number;
    let frame = 0;
    const animate = () => {
      // 每 2 帧更新一次，减少性能开销
      if (frame % 2 === 0) {
        for (let i = 0; i < buffer.length; i++) {
          // 高对比度黑白噪点
          const v = Math.random() > 0.5 ? 255 : 0;
          buffer[i] = (200 << 24) | (v << 16) | (v << 8) | v;
        }
        ctx.putImageData(imageData, 0, 0);
      }
      frame++;
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        ...externalStyle,
      }}
    >
      {/* 噪点层 —— 使用 CSS image-rendering 保持颗粒感 */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{
          opacity: 0.25,
          imageRendering: 'pixelated',
          mixBlendMode: 'overlay',
        }}
      />

      {/* SVG 滤镜噪点层 */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ opacity: 0.12, mixBlendMode: 'overlay' }}
      >
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          >
            <animate
              attributeName="baseFrequency"
              dur="0.4s"
              values="0.75;0.7;0.75"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-filter)" />
      </svg>

      {/* 暗角渐变 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* 提示内容 */}
      <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
        {/* 图标 - 默认破碎的图片图标 */}
        {icon || (
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
            <line x1="3" y1="3" x2="21" y2="21" />
          </svg>
        )}

        {/* 主提示文字 */}
        <h3
          className="font-display text-lg font-semibold tracking-wider"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          {message}
        </h3>

        {/* 副提示文字 */}
        <p
          className="max-w-xs font-mono text-xs"
          style={{ color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}
        >
          {subMessage}
        </p>
      </div>
    </div>
  );
}

import type { Config } from 'tailwindcss';

/**
 * Tailwind 主题配置 —— 精确映射现有 CSS 变量
 * 保持 EVE Online HUD 主题色彩、字体、间距完全一致
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 品牌与强调色
        gold: {
          DEFAULT: '#f5c518',
          hover: '#ffd847',
          subtle: 'rgba(245, 197, 24, 0.15)',
          star: '#E3B341',
        },
        cyan: { DEFAULT: '#39D2C0' },
        green: { DEFAULT: '#3FB950' },
        orange: { DEFAULT: '#E85D04' },
        purple: { DEFAULT: '#A371F7' },
        pink: { DEFAULT: '#F778BA' },
        danger: { DEFAULT: '#F85149' },
        // 表面与边框
        bg: '#0a0a0a',
        surface: {
          DEFAULT: '#111318',
          overlay: '#1a1d24',
        },
        border: {
          DEFAULT: '#2a2e38',
          subtle: '#1a1d24',
        },
        // 文本
        text: {
          DEFAULT: '#e8eaed',
          dim: '#8b949e',
          muted: '#5c6370',
        },
      },
      fontFamily: {
        display: ['Oxanium', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '24px',
        6: '32px',
        7: '48px',
        8: '64px',
      },
      borderRadius: {
        DEFAULT: '4px',
      },
      animation: {
        'scan-sweep': 'scan-sweep 6s linear infinite',
        'cursor-blink': 'cursor-blink 1s step-end infinite',
        shimmer: 'shimmer 1.5s infinite',
        spin: 'spin 0.8s linear infinite',
        'loading-fill': 'loading-fill 2s ease-in-out infinite',
        'card-fade-in': 'cardFadeIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'lazy-dot-pulse': 'lazy-dot-pulse 1.2s ease-in-out infinite',
        'lazy-reveal-fade': 'lazy-reveal-fade 0.4s ease-out forwards',
        'avatar-fade': 'avatar-fade 0.5s ease-out',
        'ticker-scroll': 'ticker-scroll 40s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;

/**
 * useGsapAnimations —— GSAP 动画 hook
 * 迁移自 gsap-animations.js，保留 Hero 入场动画
 */
'use client';

import { useEffect } from 'react';

type Gsap = typeof import('gsap')['gsap'];

/** 检测是否启用了减少动画偏好 */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 初始化 GSAP 动画
 * 在客户端组件中调用，传入需要动画的元素选择器
 */
export function useGsapAnimations() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    let gsap: Gsap | null = null;

    // 动态导入 gsap，避免 SSR 问题
    import('gsap')
      .then((mod) => {
        gsap = mod.gsap;
        if (!gsap) return;

        // ── Hero 入场动画 ──
        const heroSelectors = ['.hero-title', '.hero-sub', '.flank-panel.left', '.flank-panel.right', '.star-map-wrap'];
        const heroTargets = heroSelectors
          .map((s) => document.querySelector(s))
          .filter(Boolean) as HTMLElement[];

        if (heroTargets.length > 0) {
          gsap.set(heroTargets, { opacity: 0, y: 24 });
          gsap.to(heroTargets, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
            delay: 0.1,
          });
        }
      })
      .catch(() => {
        // gsap 加载失败时静默降级，不影响页面功能
      });
  }, []);
}

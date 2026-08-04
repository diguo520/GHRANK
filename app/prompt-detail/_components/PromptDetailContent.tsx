/**
 * PromptDetailContent —— Prompt 详情页主体内容组装
 * 将所有子组件组装为完整页面布局：
 * 1. 面包屑导航
 * 2. 双列布局 A：预览轮播 | 信息面板（桌面端 sticky）
 * 3. 双列布局 B：Prompt 代码展示（桌面端 sticky） | 评论区
 * 由 PromptDetailProvider 统一提供 Toast / 实时统计 / 登录状态上下文
 * 响应式：≤1024px 时两个双列布局退化为单列
 */
'use client';

import { PromptDetailProvider } from './PromptDetailProvider';
import Breadcrumb from './Breadcrumb';
import PreviewCarousel from './PreviewCarousel';
import InfoPanel from './InfoPanel';
import PromptDisplay from './PromptDisplay';
import ReviewsSection from './ReviewsSection';

/** 双列布局 A 的网格容器样式（不含 grid-template-columns，交由 Tailwind 响应式类控制） */
const layoutAStyle = {
  maxWidth: '1280px',
  margin: '16px auto 48px',
  padding: '0 32px',
  alignItems: 'stretch' as const,
};

/** 双列布局 B 的网格容器样式 */
const layoutBStyle = {
  maxWidth: '1280px',
  margin: '0 auto 48px',
  padding: '0 32px',
  alignItems: 'start' as const,
};

export default function PromptDetailContent() {
  return (
    <PromptDetailProvider>
      {/* ── 面包屑导航 ── */}
      <Breadcrumb />

      {/* ── 双列布局 A：预览轮播 | 信息面板 ──
          移动端单列，≥1024px 时左 1fr 右 380px */}
      <div
        className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8"
        style={layoutAStyle}
      >
        {/* 左侧：图片预览轮播 + 标签 + 实时统计 */}
        <div className="flex min-w-0 flex-col">
          <PreviewCarousel />
        </div>

        {/* 右侧：信息面板（桌面端 sticky 跟随滚动） */}
        <div className="lg:sticky lg:top-[88px] lg:self-stretch">
          <InfoPanel />
        </div>
      </div>

      {/* ── 双列布局 B：Prompt 代码 | 评论区 ──
          移动端单列，≥1024px 时左右各 1fr */}
      <div
        className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8"
        style={layoutBStyle}
      >
        {/* 左侧：Prompt 代码展示（桌面端 sticky + 内部可滚动） */}
        <div
          className="flex min-w-0 flex-col lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-104px)] lg:self-start"
        >
          <PromptDisplay />
        </div>

        {/* 右侧：评论区（评论输入 + 过滤 + 讨论帖 + 无限滚动 + 灯箱） */}
        <div className="min-w-0">
          <ReviewsSection />
        </div>
      </div>
    </PromptDetailProvider>
  );
}

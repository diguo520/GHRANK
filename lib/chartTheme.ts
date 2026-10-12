/**
 * chartTheme —— Ant Design Charts 主题工厂（v2.0 B6 阶段）
 *
 * 为 @ant-design/charts 提供统一的 HUD 金色暗黑主题：
 * - 暗色背景 + 金色主色
 * - 等宽字体（与项目 HUD 风格一致）
 * - 自定义 tooltip 样式
 * - 自定义图例样式
 *
 * 用法：
 *   import { Line } from '@ant-design/charts';
 *   import { chartTheme } from '@/lib/chartTheme';
 *   <Line {...chartTheme()} data={...} />
 */

import type { Config } from '@ant-design/charts';

/** HUD 金色主色调 —— 已更新为 LobeHub 紫色主题 */
const GOLD = '#9D8CFF';
const GOLD_SOFT = 'rgba(157, 140, 255, 0.3)';
const GOLD_FAINT = 'rgba(157, 140, 255, 0.08)';

/** 文本颜色（与 globals.css CSS 变量保持一致） */
const TEXT = '#E8E8E8';
const TEXT_DIM = '#A0A0A0';
const TEXT_MUTED = '#B8B8B8';
const BORDER = 'rgba(157, 140, 255, 0.28)';
const SURFACE = '#0a0c10';
const SURFACE_OVERLAY = '#10141b';

/**
 * 获取图表通用主题配置
 * 返回 Partial<Config>，可展开到任意图表组件的 props 中
 */
export function chartTheme(): Partial<Config> {
  return {
    // 通用样式（不再指定 theme.name，避免 classicDark 内置主题覆盖 axis 文字颜色）
    style: {
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    },
  };
}

/** HUD 配色色板（用于多色图表如饼图） */
export const HUD_COLORS = [
  GOLD,           // #9D8CFF
  '#A371F7',      // 紫色（AI）
  '#42B883',      // 绿色（Vue）
  '#61DAFB',      // 青色（React）
  '#EE4C2C',      // 红色（PyTorch）
  '#00ADD8',      // 蓝色（Go）
  '#E85D04',      // 橙色（Tools）
  '#DE7C4A',      // 棕色（Rust）
];

/** 主色（单色图表使用） */
export const GOLD_PRIMARY = GOLD;
export const GOLD_SOFT_FILL = GOLD_SOFT;
export const GOLD_AREA_FILL = GOLD_FAINT;

/**
 * 为数据点附加 HUD 色板
 * 用于饼图/柱状图等多色图表
 */
export function withHudColors<T extends { name: string; value: number }>(
  data: T[]
): Array<T & { color: string }> {
  return data.map((item, i) => ({
    ...item,
    color: HUD_COLORS[i % HUD_COLORS.length],
  }));
}

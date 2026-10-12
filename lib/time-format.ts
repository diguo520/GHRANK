/**
 * 时间格式化工具
 * - 核心规则：距今 24 小时之内显示「多久之前」，超过 24 小时显示「日期」
 * - 适配两种输入：
 *   1) 静态 mock 字段 timeAgo（如 "5m" / "2h" / "1d" / "2w"）→ 解析为真实时间点后再格式化
 *   2) 真实时间戳 / ISO 字符串 / Date 对象 → 直接计算
 * - 使用 dayjs + relativeTime 插件，默认英文相对时间（与全站英文 UI 风格一致）
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// 装载 relativeTime 插件；使用 dayjs 默认英文 locale（2 hours ago / 5 minutes ago / a day ago）
// 与全站 HOT / NEW / POLL / no replies 的英文 UI 风格保持一致
dayjs.extend(relativeTime);

/* ═══════════════════════════════════════════════════════════════
   1) 把 mock 里的 timeAgo 字符串（"5m" / "2h" / "1d" / "3w"）解析为真实 Date
   ═══════════════════════════════════════════════════════════════ */

const TIME_AGO_UNIT: Record<string, dayjs.ManipulateType> = {
  s: 'second',
  m: 'minute',
  h: 'hour',
  d: 'day',
  w: 'week',
  M: 'month',
  y: 'year',
};

/**
 * 解析形如 "5m" / "2h" / "1d" / "3w" 的相对时间字符串
 * 返回对应的 Date（过去的时间点）
 */
export function parseTimeAgoToDate(timeAgo: string): Date {
  const m = /^(\d+)\s*([smhdwMy]?)$/.exec(timeAgo.trim());
  if (!m) {
    // 解析失败：兜底为"刚刚"
    return new Date();
  }
  const value = Number(m[1]);
  const unit = (m[2] || 'm') as keyof typeof TIME_AGO_UNIT;
  const djType = TIME_AGO_UNIT[unit] || 'minute';
  return dayjs().subtract(value, djType).toDate();
}

/* ═══════════════════════════════════════════════════════════════
   2) 通用输入归一化：把 timeAgo / Date / 时间戳 / ISO 字符串统一转为 Date
   ═══════════════════════════════════════════════════════════════ */

export type TimeInput = Date | number | string;

export function toDate(input: TimeInput): Date {
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input);
  // string：先尝试当 ISO / 标准字符串解析；失败再按 timeAgo 简写解析
  const d = new Date(input);
  if (!Number.isNaN(d.getTime())) return d;
  return parseTimeAgoToDate(input);
}

/* ═══════════════════════════════════════════════════════════════
   3) 核心展示函数：24h 内显示「多久之前」，超过显示绝对日期
   ═══════════════════════════════════════════════════════════════ */

/**
 * 24 小时阈值（毫秒）
 * 使用 >= 比较：当时间差超过 24h 时切换为绝对日期
 */
const HOUR24_MS = 24 * 60 * 60 * 1000;

/**
 * 按需求规则格式化时间：
 * - 距离当前 < 24 小时 → 使用 dayjs 默认英文相对时间（如：5 minutes ago、2 hours ago）
 * - 距离当前 >= 24 小时 → 绝对日期（如：2026-08-05）
 *
 * @param input timeAgo 字符串 / Date / 时间戳(ms) / ISO 字符串
 */
export function formatPostTime(input: TimeInput): string {
  const date = toDate(input);
  const diff = Date.now() - date.getTime();

  if (diff >= 0 && diff < HOUR24_MS) {
    // 24 小时之内：多久之前（dayjs.from() 英文形式：X minutes ago / X hours ago）
    return dayjs(date).fromNow();
  }
  // 24 小时之后：YYYY-MM-DD
  return dayjs(date).format('YYYY-MM-DD');
}

/* ═══════════════════════════════════════════════════════════════
   4) 细粒度变体：< 1 分钟显示 "刚刚"，避免 "几秒钟前" 这种多余表述（可选）
   以上 formatPostTime 对于秒级时间会显示"几秒前"，本函数可以做更友好的兜底。
   当前实现直接沿用 formatPostTime，如需要可在此扩展。
   ═══════════════════════════════════════════════════════════════ */

/**
 * Icons —— 全站统一 SVG 图标库
 *
 * 设计约定：
 * - 所有图标统一使用 24×24 viewBox，保证视觉一致
 * - 通过 size 控制渲染尺寸，默认 16px
 * - 默认颜色为 currentColor，由父级元素控制
 * - 需要填充/描边切换的图标提供 filled 属性
 * - 不再在业务组件中直接内联 <svg>，统一从这里导入
 */

import type { CSSProperties, SVGProps } from 'react';

/* ═══════════════════════════════════════════════════════════════
   基础类型
   ═══════════════════════════════════════════════════════════════ */

interface IconBaseProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  /** 渲染尺寸（宽/高相同），默认 16 */
  size?: number;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: CSSProperties;
}

interface ToggleIconProps extends IconBaseProps {
  /** 是否填充，用于 like / bookmark 等可切换状态 */
  filled?: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   通用图标包装器
   ═══════════════════════════════════════════════════════════════ */

function IconBase({
  size = 16,
  className,
  style,
  children,
  fill = 'none',
  ...rest
}: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   交互图标
   ═══════════════════════════════════════════════════════════════ */

/** 心形 / 点赞 */
export function HeartIcon({ size = 16, filled = false, className, style }: ToggleIconProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </IconBase>
  );
}

/** 书签 / 收藏 */
export function BookmarkIcon({ size = 16, filled = false, className, style }: ToggleIconProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path
        d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </IconBase>
  );
}

/** 分享 */
export function ShareIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth={2} />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth={2} />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth={2} />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth={2} />
    </IconBase>
  );
}

/** 回复 */
export function ReplyIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <polyline points="9 17 4 12 9 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 发送 */
export function SendIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 加号 */
export function PlusIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </IconBase>
  );
}

/** 勾选 */
export function CheckIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M4 12l5 5 11-11" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 复制 */
export function CopyIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <rect x="5" y="5" width="12" height="12" rx="2" stroke="currentColor" strokeWidth={1.8} />
      <path d="M8 3h9a2 2 0 0 1 2 2v9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
    </IconBase>
  );
}

/** 搜索 */
export function SearchIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth={2} />
      <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </IconBase>
  );
}

/** 下拉箭头 */
export function ChevronDownIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 右箭头 */
export function ArrowRightIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 左箭头 */
export function ArrowLeftIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 外部链接 */
export function ExternalLinkIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 4h6v6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 4L9 15" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/* ═══════════════════════════════════════════════════════════════
   内容/信息图标
   ═══════════════════════════════════════════════════════════════ */

/** 时钟 / 时间 */
export function ClockIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} />
      <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 眼睛 / 浏览量 */
export function EyeIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
    </IconBase>
  );
}

/** 用户 / 人物 */
export function UserIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth={2} />
    </IconBase>
  );
}

/** 多用户 / 成员 */
export function UsersIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth={2} />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 文件 / 文档 */
export function FileTextIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 标签 / Tag */
export function TagIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M7 7h10l-2 7H9L7 7zM9 14v4m6-4v4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 列表 */
export function ListIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 主页 */
export function HomeIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 新闻 / 铃铛 */
export function NewsIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M5 17v-7a7 7 0 0 1 14 0v7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 17h20" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <path d="M10 17v3a2 2 0 0 0 4 0v-3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 终端 / Prompt */
export function TerminalIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth={2} />
      <path d="M7 9l3 2-3 2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 13h4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </IconBase>
  );
}

/** 趋势上升 */
export function TrendUpIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M7 17l5-5 3 3L21 9" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 9h4v4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 趋势下降 */
export function TrendDownIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M7 7l5 5 3-3L21 15" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 15h4v-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 趋势平稳 */
export function TrendFlatIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </IconBase>
  );
}

/** 信息 */
export function InfoIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} />
      <path d="M12 16v-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <path d="M12 8h.01" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </IconBase>
  );
}

/** 邮件 */
export function MailIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth={2} />
      <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 消息 / 评论 */
export function MessageIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M4 4h16v14H8l-4 3v-3H4V4z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/* ═══════════════════════════════════════════════════════════════
   品牌/特殊图标
   ═══════════════════════════════════════════════════════════════ */

/** GitHub logo */
export function GitHubIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style} fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </IconBase>
  );
}

/** 星标 */
export function StarIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style} fill="currentColor">
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.402 8.164L12 18.896l-7.336 3.86 1.402-8.164L.132 9.21l8.2-1.192L12 .587z" />
    </IconBase>
  );
}

/** 锁 */
export function LockIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth={2} />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </IconBase>
  );
}

/** 咖啡杯 / 打赏 */
export function CoffeeIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M18 8h1.5A1.5 1.5 0 0 1 21 9.5v0A1.5 1.5 0 0 1 19.5 11H18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <path d="M6 4h10v11a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V4z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 4c.4-1.2 1.6-2 2.9-2h2.2c1.3 0 2.5.8 2.9 2" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      <path d="M10 18v2m4-2v2" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
    </IconBase>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Profile 专用图标
   ═══════════════════════════════════════════════════════════════ */

/** 位置 / 定位 */
export function MapPinIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth={2} />
    </IconBase>
  );
}

/** 日历 / 日期 */
export function CalendarIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={2} />
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth={2} />
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </IconBase>
  );
}

/** 编辑 / 铅笔 */
export function EditIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 设置 / 齿轮 */
export function SettingsIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 链接 / 网址 */
export function LinkIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 奖杯 / 成就 */
export function TrophyIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 22h16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 铃铛 / 提醒 */
export function BellIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 盾牌 / 安全 */
export function ShieldIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 地球 / 网站 */
export function GlobeIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} />
      <path d="M2 12h20" stroke="currentColor" strokeWidth={2} />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth={2} />
    </IconBase>
  );
}

/** 钥匙 / PIN */
export function KeyIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <circle cx="7.5" cy="15.5" r="5.5" stroke="currentColor" strokeWidth={2} />
      <path d="M21 3l-4 4m0 0l-2 2m2-2l-2 2m2-2l-2 2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 垃圾桶 / 删除 */
export function TrashIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

/** 锁定 / 未解锁 */
export function LockClosedIcon({ size = 16, className, style }: IconBaseProps) {
  return (
    <IconBase size={size} className={className} style={style}>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth={2} />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </IconBase>
  );
}

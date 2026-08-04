/**
 * UserLevelBadge —— 用户等级徽章（紧凑型）
 * 用于社区帖子作者旁展示等级，六边形图标 + 等级编号
 *
 * getLevelByName：基于作者名的确定性等级映射（mock 数据用）
 * 保证 SSR/CSR 一致，避免 hydration mismatch
 */
import { LEVELS } from '../_data/achievements-data';
import { HEX_CLIP_PATH } from '@/lib/constants';

/* ── 基于字符串的简单哈希（确定性，无随机） ── */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // 转为 32 位整数
  }
  return Math.abs(hash);
}

/**
 * 根据用户名确定性推导等级（1-8）
 * 当前登录用户 AlexShader 固定为 Lv.6 Expert（与 achievements-data 一致）
 */
export function getLevelByName(name: string): number {
  if (name === 'AlexShader') return 6;
  // 其他用户：基于名称哈希映射到 1-8 级
  return (hashString(name) % 8) + 1;
}

interface UserLevelBadgeProps {
  /** 用户名，用于推导等级 */
  name?: string;
  /** 直接指定等级（优先于 name） */
  level?: number;
  /** 尺寸变体 */
  size?: 'sm' | 'md';
}

export default function UserLevelBadge({
  name,
  level,
  size = 'sm',
}: UserLevelBadgeProps) {
  const lvl = level ?? (name ? getLevelByName(name) : 1);
  const def = LEVELS[Math.min(lvl, LEVELS.length) - 1];

  const dimensions = size === 'sm'
    ? { box: '16px', icon: '8px', text: '8px' }
    : { box: '20px', icon: '10px', text: '10px' };

  return (
    <span
      className="inline-flex items-center gap-1 font-mono"
      title={`Lv.${def.level} ${def.name}`}
      style={{ flexShrink: 0 }}
    >
      {/* 六边形等级图标 */}
      <span
        className="flex items-center justify-center"
        style={{
          width: dimensions.box,
          height: dimensions.box,
          fontSize: dimensions.icon,
          color: def.color,
          background: `${def.color.replace('var(--', 'rgba(').replace(')', ', 0.12)')}`,
          clipPath: HEX_CLIP_PATH,
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
        }}
      >
        {def.icon}
      </span>
      {/* 等级编号 */}
      <span
        style={{
          fontSize: dimensions.text,
          color: def.color,
          fontWeight: 600,
          letterSpacing: '0.04em',
        }}
      >
        Lv{def.level}
      </span>
    </span>
  );
}

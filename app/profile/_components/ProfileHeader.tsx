/**
 * ProfileHeader —— 极简社交媒体风格用户头部
 *
 * 设计理念：
 * - 居中圆形头像，无 Banner
 * - 名称 + @用户名 + Bio
 * - 内联统计（142 Prompts · 2.4K Followers · 89 Following）
 * - 简洁元信息行
 * - 仅保留 Edit / Share 两个操作
 */
'use client';

import { useCallback } from 'react';
import { App, Button } from 'antd';
import Image from 'next/image';
import { USER_PROFILE, PROFILE_STATS } from '../_data/profile-data';
import {
  MapPinIcon, LinkIcon, CalendarIcon,
  EditIcon, ShareIcon,
} from '@/components/shared/icons';
import { useShareCardModal } from '@/components/shared/ShareCardModal';
import { isImageAvatar } from '@/lib/avatar';
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn';

export default function ProfileHeader() {
  const { message } = App.useApp();
  const { open: openShare } = useShareCardModal();
  // 头像统一走 useIsLoggedIn：从 localStorage 读取已上传的头像，
  // 与顶部导航栏 / 用户中心侧边栏保持同一数据源，确保上传后全站同步。
  const { userAvatar } = useIsLoggedIn();
  const showToast = useCallback((msg: string) => {
    message.success(msg, 2);
  }, [message]);

  // ── 打开分享弹窗 ──
  const handleShare = useCallback(() => {
    openShare({
      type: 'profile',
      data: {
        displayName: USER_PROFILE.displayName,
        username: USER_PROFILE.username,
        avatar: userAvatar,
        bio: USER_PROFILE.bio,
        location: USER_PROFILE.location,
        stats: USER_PROFILE.stats,
      },
    });
  }, [openShare, userAvatar]);

  // ── 判断 avatar 到底是字母徽章字符串，还是真实图片 URL
  //   规则：/ 开头（public 静态）或 http(s):// 开头 + 包含常见图片扩展名 → 视为图片
  //         其他 1~3 字符的字母/数字 → 视为字母徽章（与社区 / about 页保持一致）
  //   复用 lib/avatar.ts 的统一判定，包含旧 URL 识别
  const isImgAvatar = isImageAvatar(userAvatar);

  return (
    <section className="flex flex-col items-center text-center px-6 pt-10 pb-6">
      {/* ═══ 圆形头像 ═══
         说明：
         1. 外层容器统一负责"圆形裁切 + 边框 + 尺寸"，避免样式差异导致裁切/边框异常；
         2. 字母徽章走纯 CSS（金色底 + 字母），图片走 next/image + fill + sizes；
         3. 图片头像使用 unoptimized：避免 public 演示占位图在开发态 Image Optimizer 偶发失败出空白。 */}
      <div
        className="relative mb-4 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{
          width: 96,
          height: 96,
          border: '2px solid var(--border)',
          background: isImgAvatar ? 'var(--surface-overlay)' : 'var(--gold-subtle)',
        }}
      >
        {isImgAvatar ? (
          <Image
            src={userAvatar}
            alt={`${USER_PROFILE.displayName} avatar`}
            fill
            sizes="96px"
            unoptimized
            className="object-cover"
          />
        ) : (
          <span
            className="font-display font-extrabold select-none"
            style={{
              color: 'var(--gold)',
              // 1~2 个字母用 38px，3 个字母用 28px 避免溢出
              fontSize: userAvatar.length >= 3 ? 28 : 38,
              lineHeight: 1,
              letterSpacing: '0.02em',
            }}
          >
            {userAvatar}
          </span>
        )}
      </div>

      {/* ═══ 名称 + 角色 ═══ */}
      <h1
        className="font-display font-bold text-xl"
        style={{ color: 'var(--text)', lineHeight: 1.3 }}
      >
        {USER_PROFILE.displayName}
      </h1>
      <div
        className="font-mono text-[13px] mt-0.5"
        style={{ color: 'var(--text-muted)' }}
      >
        @{USER_PROFILE.username}
      </div>

      {/* ═══ Bio ═══ */}
      <p
        className="font-body text-[14px] leading-relaxed mt-3 max-w-[480px]"
        style={{ color: 'var(--text-dim)' }}
      >
        {USER_PROFILE.bio}
      </p>

      {/* ═══ 元信息行 ═══ */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3">
        <span className="flex items-center gap-1">
          <MapPinIcon size={12} style={{ color: 'var(--text-muted)' }} />
          <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {USER_PROFILE.location}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <LinkIcon size={12} style={{ color: 'var(--text-muted)' }} />
          <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {USER_PROFILE.website}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <CalendarIcon size={12} style={{ color: 'var(--text-muted)' }} />
          <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Joined {USER_PROFILE.joinedDate}
          </span>
        </span>
      </div>

      {/* ═══ 统计 ═══ */}
      <div className="flex items-center gap-5 mt-4">
        {PROFILE_STATS.map((stat) => (
          <div key={stat.label} className="flex items-baseline gap-1">
            <span className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
              {stat.value}
            </span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* ═══ 操作按钮 ═══ */}
      <div className="flex gap-2 mt-5">
        <Button
          type="primary"
          size="small"
          icon={<EditIcon size={13} />}
          onClick={() => showToast('Edit Profile — coming soon')}
        >
          Edit
        </Button>
        <Button
          size="small"
          icon={<ShareIcon size={13} />}
          onClick={handleShare}
        >
          Share
        </Button>
      </div>
    </section>
  );
}

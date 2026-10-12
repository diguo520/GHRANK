/**
 * AuthorTiebaCard —— 帖子详情页作者卡 + 贴吧信息卡
 * 从原 DetailSidebar 提取，用于嵌入右侧边栏顶部
 *
 * 包含：作者卡片（头像+名称+查看资料）+ 贴吧信息卡（图标+描述+加入/新帖按钮）
 * 加入贴吧交互：localStorage 持久化 + Toast 反馈
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from 'antd';
import { useCommunityToast } from './ToastContext';
import { PlusIcon, ArrowRightIcon } from '@/components/shared/icons';
import OnlineBadge from '@/components/shared/OnlineBadge';
import {
  TIEBA_CATALOG,
  EXPANDED_TIEBA_CATALOG,
  fmtNum,
  type TiebaCatalogItem,
} from '../../_data/community-data';
import { POST_DETAIL } from '../_data/community-detail-data';
import { HEX_CLIP_PATH } from '@/lib/constants';
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn';
import { safeStorage } from '@/lib/safeStorage';
import { isImageAvatar } from '@/lib/avatar';
import Image from 'next/image';

/** 根据 barId 查找贴吧信息，未找到时回退到第一个 */
function findBar(id: string): TiebaCatalogItem {
  return TIEBA_CATALOG.find((b) => b.id === id) || TIEBA_CATALOG[0];
}

interface AuthorTiebaCardProps {
  /** 贴吧 ID，从 URL searchParams 获取 */
  barId: string;
}

export default function AuthorTiebaCard({ barId }: AuthorTiebaCardProps) {
  const { showToast } = useCommunityToast();
  const bar = findBar(barId);
  const post = POST_DETAIL;
  const { loggedIn } = useIsLoggedIn();
  // 头像是否为真实图片：否则按字母徽章渲染
  const avatarIsImg = isImageAvatar(post.avatar);

  // 加入状态（客户端挂载后从 localStorage 读取，避免 hydration mismatch）
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    setJoined(safeStorage.get(`ghrank_joined_bar_${bar.id}`) === '1');
  }, [bar.id]);

  /** 加入贴吧：检查登录 -> 标记 localStorage -> 切换按钮状态 */
  const handleJoin = () => {
    if (!loggedIn) {
      showToast('Please log in to join this tieba');
      return;
    }
    safeStorage.set(`ghrank_joined_bar_${bar.id}`, '1');
    setJoined(true);
    showToast(`Joined ${bar.name}`);
  };

  // 已加入且已登录时显示"New Post"，否则显示"Join Tieba"
  const showNewPost = joined && loggedIn;

  return (
    <>
      {/* 作者卡片 */}
      <section className="sidebar-section">
        <div
          className="detail-author-card relative"
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            padding: '22px 24px',
          }}
        >
          {/* 左上角金色装饰角 */}
          <span
            className="absolute top-[-1px] left-[-1px] w-3 h-3 pointer-events-none"
            style={{ borderTop: '1px solid rgba(157,140,255,0.5)', borderLeft: '1px solid rgba(157,140,255,0.5)' }}
          />
          {/* 作者头部：头像 + 名称 + 角色 */}
          <div className="detail-author-header flex items-center gap-3.5 mb-4">
            <div
              className="detail-author-avatar relative flex items-center justify-center rounded-full flex-shrink-0 font-display text-xl font-bold overflow-hidden"
              style={{
                width: '52px',
                height: '52px',
                background: avatarIsImg ? 'var(--surface-overlay)' : 'var(--bg)',
                border: '1px solid rgba(157,140,255,0.35)',
                color: 'var(--gold)',
              }}
            >
              {avatarIsImg ? (
                <Image
                  src={post.avatar}
                  alt={post.author}
                  fill
                  sizes="52px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <span style={{ fontSize: post.avatar.length >= 3 ? 18 : 22, lineHeight: 1 }}>
                  {post.avatar}
                </span>
              )}
            </div>
            <div className="detail-author-info flex flex-col gap-1 min-w-0">
              <div
                className="detail-author-name font-display text-[15px] font-bold flex items-center gap-1.5"
                style={{ color: 'var(--text)' }}
              >
                @{post.author}
                {post.isOnline && <OnlineBadge size={9} inline />}
              </div>
              <span
                className="detail-author-role font-mono text-[9px] font-semibold uppercase self-start"
                style={{
                  color: 'var(--gold)',
                  background: 'rgba(157,140,255,0.1)',
                  border: '1px solid rgba(157,140,255,0.35)',
                  padding: '2px 7px',
                  letterSpacing: '0.06em',
                }}
              >
                Original Poster
              </span>
            </div>
          </div>
          {/* 查看资料按钮 */}
          <Button
            block
            size="large"
            variant="outlined"
            className="detail-author-profile-btn btn-hud-sm"
            style={{
              height: 'auto',
              padding: '9px 16px',
            }}
          >
            View Profile
          </Button>
        </div>
      </section>

      {/* 贴吧信息卡 */}
      <section className="sidebar-section">
        <div
          className="tieba-info-card relative"
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            padding: '22px 24px',
          }}
        >
          {/* 左上角金色装饰角 */}
          <span
            className="absolute top-[-1px] left-[-1px] w-3 h-3 pointer-events-none"
            style={{ borderTop: '1px solid rgba(157,140,255,0.5)', borderLeft: '1px solid rgba(157,140,255,0.5)' }}
          />
          {/* 贴吧头部：图标 + 名称 + 元信息 */}
          <div className="tieba-info-header flex items-center gap-3.5 mb-3.5">
            <span
              className="tieba-info-icon flex items-center justify-center font-display text-[18px] font-extrabold flex-shrink-0"
              style={{
                width: '48px',
                height: '48px',
                background: 'var(--gold-subtle)',
                color: 'var(--gold)',
                clipPath: HEX_CLIP_PATH,
              }}
            >
              {bar.icon}
            </span>
            <div className="min-w-0">
              <Link
                href={`/community/tiebas?bar=${encodeURIComponent(bar.id)}`}
                className="tieba-info-name font-display text-[18px] font-bold no-underline hover:underline"
                style={{ color: 'var(--text)', lineHeight: 1.2 }}
              >
                {bar.name}
              </Link>
              <div
                className="tieba-info-meta font-mono text-[10px] mt-0.5"
                style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}
              >
                {fmtNum(bar.members)} members · {fmtNum(bar.posts)} posts
              </div>
            </div>
          </div>
          {/* 贴吧描述 */}
          <div
            className="tieba-info-desc font-body text-[13px] mb-[18px]"
            style={{ color: 'var(--text-dim)', lineHeight: 1.5 }}
          >
            {bar.desc}
          </div>
          {/* 加入按钮 / 新帖按钮（互斥显示） */}
          {!showNewPost ? (
            <Button
              onClick={handleJoin}
              block
              size="large"
              type="primary"
              icon={<PlusIcon size={14} />}
              className="btn-hud-lg"
              style={{
                height: 'auto',
                padding: '11px 16px',
                background: 'var(--gold)',
                borderColor: 'var(--gold)',
                color: 'var(--bg)',
                boxShadow: '0 0 16px rgba(157,140,255,0.25)',
              }}
            >
              Join Tieba
            </Button>
          ) : (
            <Link
              href={`/community/new?tieba=${encodeURIComponent(bar.name)}`}
              className="sidebar-new-post-btn detail-new-post-btn flex items-center justify-center gap-2 w-full no-underline btn-hud-lg"
              style={{
                color: 'var(--bg)',
                background: 'var(--gold)',
                padding: '11px 16px',
                boxShadow: '0 0 16px rgba(157,140,255,0.25)',
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffe066';
                e.currentTarget.style.boxShadow = '0 0 24px rgba(157,140,255,0.25), 0 0 48px rgba(157,140,255,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--gold)';
                e.currentTarget.style.boxShadow = '0 0 16px rgba(157,140,255,0.25)';
              }}
            >
              <PlusIcon size={14} />
              New Post
            </Link>
          )}
          {/* 次级入口：浏览并加入更多贴吧组 */}
          <Link
            href="/community/tiebas/explore"
            className="flex items-center justify-between gap-2 w-full mt-2.5 no-underline px-3 py-2 btn-hud-mono-link"
            style={{
              background: 'transparent',
              border: '1px dashed var(--border-subtle)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--gold)';
              e.currentTarget.style.borderColor = 'rgba(157,140,255,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <span className="flex items-center gap-1.5">
              <PlusIcon size={10} />
              Browse {EXPANDED_TIEBA_CATALOG.length} groups
            </span>
            <ArrowRightIcon size={11} />
          </Link>
        </div>
      </section>
    </>
  );
}

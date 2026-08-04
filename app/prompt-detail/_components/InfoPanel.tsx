/**
 * InfoPanel —— 右侧信息面板
 * 迁移自 prompt-detail.html 的 .detail-info-panel + prompt-detail-init.js 关注/收藏/点赞逻辑
 * 包含：标题、作者信息、Follow 按钮、Save/Like 操作按钮、打赏区域、广告位
 */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PROMPT_DETAIL, formatCount } from '../_data/prompt-detail-data';
import { usePromptDetail } from './PromptDetailProvider';
import { PlusIcon, BookmarkIcon, HeartIcon } from '../../_components/icons';
import OnlineBadge from '../../_components/OnlineBadge';
import RewardSection from './RewardSection';
import CornerDecor from '@/components/shared/CornerDecor';

/** 广告位占位组件 */
function AdSlot() {
  return (
    <div
      className="relative mt-auto flex min-h-[90px] items-center justify-center"
      style={{ border: '1px dashed var(--border)', width: '100%' }}
      aria-label="Advertisement slot reserved"
    >
      <CornerDecor color="var(--text-muted)" size={12} />
      <div className="flex flex-col items-center gap-1">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          AD SLOT
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', opacity: 0.6, letterSpacing: '0.06em' }}>
          Reserved · 728 × 90
        </span>
      </div>
    </div>
  );
}

export default function InfoPanel() {
  const { showToast, isLoggedIn, bumpStat } = usePromptDetail();

  // ── Follow 状态 ──
  const [isFollowing, setIsFollowing] = useState(false);
  const handleFollow = () => {
    if (!isLoggedIn) { showToast('Please log in to follow'); return; }
    setIsFollowing((prev) => {
      showToast(!prev ? `Following @${PROMPT_DETAIL.author}` : `Unfollowed @${PROMPT_DETAIL.author}`);
      return !prev;
    });
  };

  // ── Save/Bookmark 状态 ──
  const [isSaved, setIsSaved] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(PROMPT_DETAIL.bookmarkCount);
  const handleSave = () => {
    if (!isLoggedIn) { showToast('Please log in to save'); return; }
    setIsSaved((prev) => {
      setBookmarkCount((c) => c + (prev ? -1 : 1));
      showToast(!prev ? 'Saved to your collection' : 'Removed from collection');
      return !prev;
    });
  };

  // ── Like 状态 ──
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(PROMPT_DETAIL.likeCount);
  const handleLike = () => {
    setIsLiked((prev) => {
      setLikeCount((c) => c + (prev ? -1 : 1));
      showToast(!prev ? 'Liked!' : 'Like removed');
      // 点赞时同步增加浏览量统计
      if (!prev) bumpStat('views', 1);
      return !prev;
    });
  };

  return (
    <div
      className="flex h-full flex-col gap-5"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: '22px 24px',
      }}
    >
      {/* 模型标签 */}
      <span
        className="inline-block w-fit"
        style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700,
          color: 'var(--gold)', background: 'rgba(245,197,24,0.08)',
          border: '1px solid rgba(245,197,24,0.35)',
          padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.1em',
        }}
      >
        {PROMPT_DETAIL.model}
      </span>

      {/* 标题 */}
      <h1
        className="font-display"
        style={{
          fontSize: '22px', fontWeight: 800, color: 'var(--gold)',
          lineHeight: 1.25, letterSpacing: '0.01em', margin: '8px 0',
        }}
      >
        {PROMPT_DETAIL.title}
      </h1>

      {/* 作者信息行 */}
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full" style={{ border: '1px solid rgba(245,197,24,0.35)' }}>
          <Image src={PROMPT_DETAIL.authorAvatar} alt="" width={40} height={40} className="h-full w-full object-cover" />
          {/* 在线状态绿点：仅登录用户可见 */}
          {isLoggedIn && <OnlineBadge size={10} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
            <span style={{ color: 'var(--text-muted)' }}>@</span>{PROMPT_DETAIL.author}
          </div>
          <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
            {PROMPT_DETAIL.authorLabel}
          </div>
        </div>
        {/* Follow 按钮 */}
        <button
          onClick={handleFollow}
          aria-pressed={isFollowing}
          className="inline-flex items-center gap-1.5 whitespace-nowrap transition-all duration-200"
          style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
            color: isFollowing ? 'var(--bg)' : 'var(--gold)',
            background: isFollowing ? 'var(--gold)' : 'transparent',
            border: '1px solid', borderColor: 'rgba(245,197,24,0.35)',
            padding: '6px 14px', cursor: 'pointer', letterSpacing: '0.06em',
          }}
        >
          <PlusIcon size={12} />
          <span>{isFollowing ? 'Following' : 'Follow'}</span>
        </button>
      </div>

      {/* Save / Like 操作行 */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          aria-pressed={isSaved}
          className="flex flex-1 items-center justify-center gap-2 transition-all duration-200"
          style={{
            fontFamily: 'var(--font-body)', fontSize: '13px',
            color: isSaved ? 'var(--gold)' : 'var(--text-dim)',
            background: isSaved ? 'rgba(245,197,24,0.08)' : 'var(--bg)',
            border: '1px solid', borderColor: isSaved ? 'rgba(245,197,24,0.35)' : 'var(--border)',
            padding: '12px 16px', cursor: 'pointer',
          }}
        >
          <BookmarkIcon size={14} filled={isSaved} />
          <span style={{ fontWeight: 500 }}>Save</span>
          <span className="font-mono" style={{ fontSize: '12px', fontWeight: 600, color: isSaved ? 'var(--gold)' : 'var(--text-dim)' }}>
            {formatCount(bookmarkCount)}
          </span>
        </button>
        <button
          onClick={handleLike}
          aria-pressed={isLiked}
          className="flex flex-1 items-center justify-center gap-2 transition-all duration-200"
          style={{
            fontFamily: 'var(--font-body)', fontSize: '13px',
            color: isLiked ? 'var(--gold)' : 'var(--text-dim)',
            background: isLiked ? 'rgba(245,197,24,0.08)' : 'var(--bg)',
            border: '1px solid', borderColor: isLiked ? 'rgba(245,197,24,0.35)' : 'var(--border)',
            padding: '12px 16px', cursor: 'pointer',
          }}
        >
          <HeartIcon size={14} filled={isLiked} />
          <span style={{ fontWeight: 500 }}>Like</span>
          <span className="font-mono" style={{ fontSize: '12px', fontWeight: 600, color: isLiked ? 'var(--gold)' : 'var(--text-dim)' }}>
            {formatCount(likeCount)}
          </span>
        </button>
      </div>

      {/* 打赏区域 */}
      <RewardSection />

      {/* 广告位 */}
      <AdSlot />
    </div>
  );
}

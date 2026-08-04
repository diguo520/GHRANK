/**
 * PostActions —— 帖子操作按钮行
 * 迁移自 community-detail.js 的 post-actions 交互逻辑
 *
 * 包含：Like（点赞计数 toggle）、Bookmark、Share、Reply
 * 所有操作通过 Toast 反馈
 */
'use client';

import { useState } from 'react';
import { useCommunityToast } from './ToastContext';
import { HeartIcon, BookmarkIcon, ShareIcon, ReplyIcon } from '../../../_components/icons';

interface PostActionsProps {
  initialLikes: number;
  initialLiked: boolean;
  initialBookmarked: boolean;
  /** Reply 按钮点击回调（聚焦回复编辑器） */
  onReply?: () => void;
}

export default function PostActions({
  initialLikes,
  initialLiked,
  initialBookmarked,
  onReply,
}: PostActionsProps) {
  const { showToast } = useCommunityToast();
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikes((n) => (next ? n + 1 : Math.max(0, n - 1)));
    showToast(next ? 'Liked this post' : 'Unliked this post');
  };

  const handleBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    showToast(next ? 'Bookmarked' : 'Removed bookmark');
  };

  const handleShare = () => {
    showToast('Link copied to clipboard');
  };

  const handleReply = () => {
    showToast('Reply editor focused');
    onReply?.();
  };

  // 通用按钮样式
  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    fontWeight: 500,
    background: 'transparent',
    border: '1px solid var(--border)',
    padding: '7px 14px',
    cursor: 'pointer',
    letterSpacing: '0.03em',
    transition: 'border-color 0.18s, color 0.18s, background 0.18s',
  };

  const activeStyle: React.CSSProperties = {
    color: 'var(--gold)',
    borderColor: 'rgba(245,197,24,0.35)',
    background: 'rgba(245,197,24,0.08)',
  };

  return (
    <div
      className="post-actions flex items-center gap-2 flex-wrap pt-[22px] mt-6"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      {/* 点赞 */}
      <button
        onClick={handleLike}
        className="post-action-btn"
        style={{ ...btnBase, ...(liked ? activeStyle : { color: 'var(--text-dim)' }) }}
        onMouseEnter={(e) => {
          if (!liked) {
            e.currentTarget.style.color = 'var(--gold)';
            e.currentTarget.style.borderColor = 'rgba(245,197,24,0.35)';
            e.currentTarget.style.background = 'rgba(245,197,24,0.04)';
          }
        }}
        onMouseLeave={(e) => {
          if (!liked) {
            e.currentTarget.style.color = 'var(--text-dim)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <HeartIcon size={14} filled={liked} />
        <span className="action-count font-semibold" style={{ color: liked ? 'var(--gold)' : 'var(--text)' }}>
          {likes}
        </span>
        Like
      </button>

      {/* 收藏 */}
      <button
        onClick={handleBookmark}
        className="post-action-btn"
        style={{ ...btnBase, ...(bookmarked ? activeStyle : { color: 'var(--text-dim)' }) }}
        onMouseEnter={(e) => {
          if (!bookmarked) {
            e.currentTarget.style.color = 'var(--gold)';
            e.currentTarget.style.borderColor = 'rgba(245,197,24,0.35)';
            e.currentTarget.style.background = 'rgba(245,197,24,0.04)';
          }
        }}
        onMouseLeave={(e) => {
          if (!bookmarked) {
            e.currentTarget.style.color = 'var(--text-dim)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <BookmarkIcon size={14} filled={bookmarked} />
        Bookmark
      </button>

      {/* 分享 */}
      <button
        onClick={handleShare}
        className="post-action-btn"
        style={{ ...btnBase, color: 'var(--text-dim)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--gold)';
          e.currentTarget.style.borderColor = 'rgba(245,197,24,0.35)';
          e.currentTarget.style.background = 'rgba(245,197,24,0.04)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-dim)';
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <ShareIcon size={14} />
        Share
      </button>

      {/* 回复（金色主按钮，靠右） */}
      <button
        onClick={handleReply}
        className="post-action-btn action-reply"
        style={{
          ...btnBase,
          marginLeft: 'auto',
          color: 'var(--bg)',
          background: 'var(--gold)',
          borderColor: 'var(--gold)',
          boxShadow: '0 0 12px rgba(245,197,24,0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#ffe066';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(245,197,24,0.35)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--gold)';
          e.currentTarget.style.boxShadow = '0 0 12px rgba(245,197,24,0.2)';
        }}
      >
        <ReplyIcon size={14} />
        Reply
      </button>
    </div>
  );
}

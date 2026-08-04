/**
 * ReplyItem —— 单条回复
 * 迁移自 community-detail.js 的 renderReply 函数
 *
 * 包含：字母头像、作者名 + 徽章（OP / Top Contributor）+ 时间、
 *       回复内容段落、点赞 + 回复按钮
 *
 * 点赞交互：内部 state 管理 liked/likes，点击 toggle
 */
'use client';

import { useState } from 'react';
import { useCommunityToast } from './ToastContext';
import { HeartIcon, ReplyIcon } from '../../../_components/icons';
import OnlineBadge from '../../../_components/OnlineBadge';
import UserLevelBadge from '../../../_components/UserLevelBadge';
import { useIsLoggedIn } from '../../../_hooks/useIsLoggedIn';
import type { Reply } from '../_data/community-detail-data';

interface ReplyItemProps {
  reply: Reply;
}

export default function ReplyItem({ reply }: ReplyItemProps) {
  const { showToast } = useCommunityToast();
  // 当前用户登录状态：决定是否显示头像在线标识
  const { loggedIn: isLoggedIn } = useIsLoggedIn();
  const [liked, setLiked] = useState(reply.liked);
  const [likes, setLikes] = useState(reply.likes);

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikes((n) => (next ? n + 1 : Math.max(0, n - 1)));
  };

  const handleReply = () => {
    showToast(`Reply to @${reply.author}`);
  };

  // 徽章：OP 作者或高赞贡献者
  const badge = reply.isOp ? 'OP' : reply.likes > 50 ? 'Top Contributor' : null;

  return (
    <div
      className="reply-item flex gap-3.5 relative"
      style={{
        padding: '18px 20px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        marginBottom: '10px',
        borderLeft: reply.isOp ? '2px solid var(--gold)' : undefined,
      }}
    >
      {/* 字母头像 */}
      <div
        className="reply-avatar relative flex items-center justify-center rounded-full flex-shrink-0 font-display text-sm font-bold"
        style={{
          width: '36px',
          height: '36px',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          color: 'var(--gold)',
        }}
      >
        {reply.avatar}
        {isLoggedIn && <OnlineBadge size={10} />}
      </div>

      {/* 回复主体 */}
      <div className="reply-body flex-1 min-w-0">
        {/* 头部：作者 + 徽章 + 时间 */}
        <div className="reply-head flex items-center gap-2.5 mb-2 flex-wrap">
          <span
            className="reply-author font-display text-[13px] font-bold"
            style={{ color: 'var(--text)' }}
          >
            @{reply.author}
          </span>
          <UserLevelBadge name={reply.author} />
          {badge && (
            <span
              className="reply-badge font-mono text-[9px] font-semibold uppercase"
              style={{
                color: 'var(--gold)',
                background: 'rgba(245,197,24,0.1)',
                border: '1px solid rgba(245,197,24,0.35)',
                padding: '2px 7px',
                letterSpacing: '0.06em',
              }}
            >
              {badge}
            </span>
          )}
          <span
            className="reply-time font-mono text-[10px] ml-auto"
            style={{ color: 'var(--text-dim)' }}
          >
            {reply.timeAgo}
          </span>
        </div>

        {/* 回复内容 */}
        <div
          className="reply-content font-body text-sm"
          style={{ lineHeight: 1.6, color: 'var(--text)' }}
        >
          {reply.content.map((para, i) => (
            <p key={i} className={i < reply.content.length - 1 ? 'mb-2' : ''}>
              {para}
            </p>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="reply-actions flex items-center gap-1.5 mt-3">
          <button
            onClick={handleLike}
            className="reply-action-btn inline-flex items-center gap-1 font-mono text-[11px]"
            style={{
              color: liked ? 'var(--pink)' : 'var(--text-dim)',
              background: 'transparent',
              border: 'none',
              padding: '4px 8px',
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { if (!liked) e.currentTarget.style.color = 'var(--gold)'; }}
            onMouseLeave={(e) => { if (!liked) e.currentTarget.style.color = 'var(--text-dim)'; }}
          >
            <HeartIcon size={12} filled={liked} style={{ opacity: liked ? 1 : 0.7, flexShrink: 0 }} />
            <span className="action-count font-semibold">{likes}</span>
          </button>
          <button
            onClick={handleReply}
            className="reply-action-btn inline-flex items-center gap-1 font-mono text-[11px]"
            style={{
              color: 'var(--text-dim)',
              background: 'transparent',
              border: 'none',
              padding: '4px 8px',
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; }}
          >
            <ReplyIcon size={12} style={{ opacity: 0.7, flexShrink: 0 }} />
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}

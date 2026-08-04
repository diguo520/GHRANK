/**
 * ThreadReply —— 单条回复渲染
 * 迁移自 prompt-detail.html 的 .thread-reply 结构
 * 包含：头像、作者/徽章/活动标识/日期、@提及 + 正文、点赞/回复操作
 */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ReviewReply, ReviewActivity } from '../_data/prompt-detail-data';
import { CoffeeIcon, HeartIcon, BookmarkIcon } from '../../_components/icons';
import OnlineBadge from '../../_components/OnlineBadge';

/** 活动标识配置：图标 + 颜色 + 标签格式 */
const ACTIVITY_CONFIG: Record<
  ReviewActivity['type'],
  { Icon: typeof CoffeeIcon; color: string; label: (v: number) => string }
> = {
  tipped: { Icon: CoffeeIcon, color: 'var(--gold)', label: (v) => `+$${v}` },
  liked: { Icon: HeartIcon, color: '#F778BA', label: (v) => `+${v}` },
  saved: { Icon: BookmarkIcon, color: 'var(--cyan)', label: (v) => `+${v}` },
};

/** 渲染含反引号行内代码的文本 */
function renderText(text: string) {
  return text.split('`').map((part, i) =>
    i % 2 === 1 ? (
      <code
        key={i}
        style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--cyan)',
          background: 'rgba(57,210,192,0.08)', border: '1px solid rgba(57,210,192,0.15)', padding: '1px 6px',
        }}
      >
        {part}
      </code>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

interface ThreadReplyProps {
  reply: ReviewReply;
  /** 点击"Reply"时回调（传入被回复者用户名） */
  onReplyToReply: (author: string) => void;
  /** 当前用户是否登录：决定是否显示在线标识 */
  isLoggedIn: boolean;
}

export default function ThreadReply({ reply, onReplyToReply, isLoggedIn }: ThreadReplyProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(reply.likeCount);

  const handleLike = () => {
    setLiked((prev) => {
      setLikeCount((c) => c + (prev ? -1 : 1));
      return !prev;
    });
  };

  return (
    <div className="flex gap-3">
      {/* 头像 */}
      <div
        className="relative mt-0.5 h-7 w-7 flex-shrink-0 overflow-hidden rounded-full"
        style={{ border: '1px solid var(--border)', background: reply.avatar.bg, color: reply.avatar.color }}
      >
        <Image src={reply.avatarImg} alt="" width={28} height={28} className="h-full w-full rounded-full object-cover" />
        {/* 在线状态：仅登录用户可见 */}
        {isLoggedIn && <OnlineBadge size={8} />}
      </div>

      {/* 正文区 */}
      <div className="min-w-0 flex-1">
        {/* Meta */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="font-mono" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.02em' }}>
            <span style={{ color: 'var(--text-muted)' }}>@</span>{reply.author}
          </span>
          {reply.isAuthor && (
            <span
              className="font-mono"
              style={{
                fontSize: '9px', fontWeight: 700, color: 'var(--gold)',
                background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.35)',
                padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.08em',
              }}
            >
              Author
            </span>
          )}
          {/* 活动标识 */}
          {reply.activities.map((act, i) => {
            const cfg = ACTIVITY_CONFIG[act.type];
            const Icon = cfg.Icon;
            return (
              <span key={i} className="inline-flex items-center gap-0.5 font-mono" style={{ fontSize: '10px', fontWeight: 600, color: cfg.color, letterSpacing: '0.02em' }}>
                <span className="inline-flex items-center"><Icon size={10} /></span>
                {cfg.label(act.value)}
              </span>
            );
          })}
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            {reply.date}
          </span>
        </div>

        {/* 正文（含 @提及） */}
        <p className="mb-3" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.65, color: 'var(--text)' }}>
          {reply.mention && (
            <span style={{ color: 'var(--gold)', fontWeight: 600 }}>@{reply.mention} </span>
          )}
          {renderText(reply.text)}
        </p>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className="inline-flex items-center gap-1 transition-colors hover:bg-white/3"
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
              color: liked ? 'var(--gold)' : 'var(--text-muted)',
              background: 'transparent', border: 'none', padding: '3px 6px', cursor: 'pointer',
            }}
          >
            <span>{'\u2B06'}</span> <span>{likeCount}</span>
          </button>
          <button
            onClick={() => onReplyToReply(reply.author)}
            className="inline-flex items-center gap-1 transition-colors hover:bg-white/3"
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
              color: 'var(--text-muted)', background: 'transparent',
              border: 'none', padding: '3px 6px', cursor: 'pointer',
            }}
          >
            {'\u21A9'} Reply
          </button>
        </div>
      </div>
    </div>
  );
}

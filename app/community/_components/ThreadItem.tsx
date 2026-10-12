/**
 * ThreadItem —— 单条帖子条目
 * 迁移自 community.js 的 renderThreads 帖子 HTML 模板
 * 包含：圆形头像、标题、HOT/NEW 徽章、点赞按钮、回复者头像堆叠
 *
 * 点赞交互：内部 state 管理 liked/likes，点击 toggle 并通过 onLike 回调触发 Toast
 * 入场动画：使用 globals.css 的 cardFadeIn keyframes
 */
'use client';

import { useState, useEffect, type MouseEvent } from 'react';
import Link from 'next/link';
import { Button } from 'antd';
import { HeartIcon, HotIcon, NewIcon, PollIcon, QuestionIcon, CoinsIcon } from '@/components/shared/icons';
import OnlineBadge from '@/components/shared/OnlineBadge';
import UserLevelBadge from '@/components/shared/UserLevelBadge';
import { formatPostTime } from '@/lib/time-format';
import { tagToBarId, type Thread } from '../_data/community-data';

/** 回复者头像堆叠（GitHub 风格） */
function ReplierStack({ thread }: { thread: Thread }) {
  if (thread.replies <= 0) {
    return (
      <span
        className="thread-repliers-empty font-mono text-[10px] italic"
        style={{ color: 'var(--text-muted)' }}
      >
        no replies
      </span>
    );
  }
  const shown = thread.repliers.slice(0, 5);
  const overflow = thread.replies - shown.length;
  return (
    <div className="thread-repliers flex items-center" title={`${thread.replies} replies`}>
      {shown.map((r, i) => (
        <span
          key={i}
          className="thread-replier rounded-full flex items-center justify-center font-mono text-[10px] font-bold"
          style={{
            width: '22px',
            height: '22px',
            background: 'var(--bg)',
            border: '2px solid var(--surface)',
            marginLeft: i === 0 ? 0 : '-8px',
            color: 'var(--text-dim)',
            flexShrink: 0,
          }}
        >
          {r.avatar}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className="thread-repliers-more font-mono text-[10px] font-semibold"
          style={{ color: 'var(--text-dim)', padding: '2px 0 2px 4px', marginLeft: '-4px' }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

interface ThreadItemProps {
  thread: Thread;
  onLike?: (author: string) => void;
  /** 帖子详情链接携带的 bar 参数；未传时按 tag 自动推导 */
  barId?: string;
  /** 点赞是否可交互；贴吧列表页设为 false 时退化为只读统计 */
  interactiveLike?: boolean;
}

export default function ThreadItem({
  thread,
  onLike,
  barId,
  interactiveLike = true,
}: ThreadItemProps) {
  // 点赞局部状态（不影响父组件数据）
  const [liked, setLiked] = useState(thread.liked);
  const [likes, setLikes] = useState(thread.likes);
  // 在线标识基于帖子作者的在线状态，而非当前登录用户


  // 同步外部 thread 变化（切换 tab 重新挂载时重置）
  useEffect(() => {
    setLiked(thread.liked);
    setLikes(thread.likes);
  }, [thread.id, thread.liked, thread.likes]);

  const handleLike = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) {
      setLiked(false);
      setLikes((n) => Math.max(0, n - 1));
    } else {
      setLiked(true);
      setLikes((n) => n + 1);
      if (onLike) onLike(thread.author);
    }
  };

  // bar 参数：显式传入优先，否则按 tag 自动推导
  const effectiveBarId = barId || tagToBarId(thread.tag);

  return (
    <Link
      href={`/community/detail?id=${thread.id}&bar=${encodeURIComponent(effectiveBarId)}`}
      className="thread-item grid no-underline text-inherit"
      style={{
        gridTemplateColumns: '44px 1fr auto',
        gap: '16px',
        padding: '18px 22px',
        background: 'transparent',
        color: 'inherit',
        transition: 'transform 0.2s, box-shadow 0.2s',
        animation: 'cardFadeIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* 头像（圆形，字母，在线标识） */}
      <div
        className="thread-avatar relative flex items-center justify-center rounded-full flex-shrink-0 font-display text-base font-bold"
        style={{
          width: '44px',
          height: '44px',
          background: 'var(--bg)',
          border: `1px solid var(--border)`,
          color: 'var(--gold)',
        }}
      >
        {thread.avatar}
      </div>

      {/* 帖子主体 */}
      <div className="thread-body min-w-0">
        {/* 元信息：作者 + 成就 + 发帖时间 + 状态徽章（位于标题上方） */}
        <div
          className="thread-meta flex items-center gap-2 flex-wrap font-mono text-[11px] mb-1.5"
          style={{ color: 'var(--text-dim)' }}
        >
          <span className="thread-author font-semibold text-text">@{thread.author}</span>
          {thread.isOnline && <OnlineBadge size={8} inline />}
          <UserLevelBadge name={thread.author} />
          <span style={{ color: 'var(--text-muted)' }}>{formatPostTime(thread.timeAgo)}</span>
          {thread.isHot && (
            <HotIcon
              title="HOT"
              size={12}
              className="thread-hot-icon flex-shrink-0"
              style={{ color: 'var(--orange)' }}
            />
          )}
          {thread.isNew && (
            <NewIcon
              title="NEW"
              size={12}
              className="thread-new-icon flex-shrink-0"
              style={{ color: 'var(--cyan)' }}
            />
          )}
          {thread.hasPoll && (
            <PollIcon
              title="Poll thread"
              size={12}
              className="thread-poll-icon flex-shrink-0"
              style={{
                color: 'var(--gold)',
                background: 'rgba(157, 140, 255, 0.1)',
                border: '1px solid rgba(157, 140, 255, 0.35)',
                borderRadius: '3px',
                padding: '1.5px',
                boxSizing: 'border-box',
              }}
            />
          )}
          {/* 提问帖：显示 Question 图标 + 积分徽章（展示该问题悬赏多少积分） */}
          {thread.threadType === 'question' && (
            <>
              <QuestionIcon
                title="Question thread"
                size={12}
                className="thread-question-icon flex-shrink-0"
                style={{
                  color: '#f59e0b',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '3px',
                  padding: '1.5px',
                  boxSizing: 'border-box',
                }}
              />
              {typeof thread.questionPoints === 'number' && (
                <span
                  className="inline-flex items-center gap-1 flex-shrink-0 font-mono text-[10px] font-semibold"
                  style={{
                    color: 'var(--bg)',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    border: '1px solid #d97706',
                    borderRadius: '10px',
                    padding: '1.5px 7px',
                    lineHeight: 1,
                    letterSpacing: '0.02em',
                    boxShadow: '0 0 8px rgba(251, 191, 36, 0.4)',
                  }}
                  title={`Bounty: ${thread.questionPoints} points`}
                >
                  <CoinsIcon size={10} style={{ color: 'var(--bg)' }} />
                  {thread.questionPoints}
                </span>
              )}
            </>
          )}
        </div>
        {/* 帖子标题 + 点赞 */}
        <div
          className="thread-title flex items-center gap-2 flex-wrap"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1.35,
            letterSpacing: '0.01em',
          }}
        >
          <span>{thread.title}</span>
          {/* 点赞按钮：interactiveLike 为 false 时退化为只读统计（贴吧列表页） */}
          {interactiveLike ? (
            <Button
              type="text"
              size="small"
              onClick={handleLike}
              title={liked ? 'Liked' : 'Like'}
              className={`thread-like ${liked ? 'is-liked' : ''}`}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: liked ? 'var(--pink)' : 'var(--text-muted)',
                padding: '0 4px',
                height: 'auto',
              }}
            >
              <HeartIcon size={12} filled={liked} style={{ opacity: liked ? 1 : 0.6 }} />
              <span className="thread-like-count font-semibold">{likes}</span>
            </Button>
          ) : (
            <span
              className="thread-like inline-flex items-center gap-1 font-mono text-[11px] ml-1"
              style={{
                color: 'var(--text-muted)',
                cursor: 'default',
                pointerEvents: 'none',
              }}
              aria-label={`${likes} likes`}
            >
              <HeartIcon size={12} filled={false} style={{ opacity: 0.6 }} />
              <span className="thread-like-count font-semibold">{likes}</span>
            </span>
          )}
        </div>
      </div>

      {/* 右侧统计：回复者头像堆叠 */}
      <div className="thread-stats flex flex-col items-end justify-center gap-1.5 flex-shrink-0">
        <ReplierStack thread={thread} />
      </div>
    </Link>
  );
}

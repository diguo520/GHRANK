/**
 * PostDetail —— 帖子详情卡片
 * 迁移自 community-detail.html 的 .post-detail article
 *
 * 组合：标题 + 元信息行（作者头像/名称/分类标签/发布时间/浏览量）
 *       + 投票组件 + 帖子正文 + 操作按钮行
 *
 * 头像采用字母头像模式（与 ThreadItem 一致），不依赖图片资源
 */
'use client';

import PostBody from './PostBody';
import PostPoll from './PostPoll';
import PostActions from './PostActions';
import { ClockIcon, EyeIcon } from '../../../_components/icons';
import OnlineBadge from '../../../_components/OnlineBadge';
import UserLevelBadge from '../../../_components/UserLevelBadge';
import { useIsLoggedIn } from '../../../_hooks/useIsLoggedIn';
import { POST_DETAIL } from '../_data/community-detail-data';

/** 数字千分位格式化 */
function formatViews(n: number): string {
  return n.toLocaleString();
}

interface PostDetailProps {
  /** Reply 按钮点击回调：聚焦页面中的回复编辑器 */
  onReplyFocus?: () => void;
}

export default function PostDetail({ onReplyFocus }: PostDetailProps) {
  const post = POST_DETAIL;
  // 当前用户登录状态：决定是否显示头像在线标识
  const { loggedIn: isLoggedIn } = useIsLoggedIn();

  // Reply 按钮回调：聚焦回复编辑器（由 CommunityDetailMain 通过 ref 连接 ReplyEditor）
  const handleReplyFocus = () => {
    onReplyFocus?.();
  };

  return (
    <article
      className="post-detail relative mb-6"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: '28px 32px',
      }}
    >
      {/* 左上角金色装饰角 */}
      <span
        className="absolute top-[-1px] left-[-1px] w-3.5 h-3.5 pointer-events-none"
        style={{ borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)' }}
      />
      {/* 右下角金色装饰角 */}
      <span
        className="absolute bottom-[-1px] right-[-1px] w-3.5 h-3.5 pointer-events-none"
        style={{ borderBottom: '2px solid var(--gold)', borderRight: '2px solid var(--gold)' }}
      />

      {/* 帖子标题 */}
      <h1
        className="post-title mb-[18px]"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 700,
          lineHeight: 1.2,
          color: 'var(--text)',
          letterSpacing: '-0.01em',
        }}
      >
        {post.title}
      </h1>

      {/* 元信息行 */}
      <div
        className="post-meta-row flex items-center gap-3.5 flex-wrap pb-[18px] mb-[22px]"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* 作者头像（字母头像） */}
        <div
          className="post-author-avatar relative flex items-center justify-center rounded-full flex-shrink-0 font-display text-base font-bold"
          style={{
            width: '40px',
            height: '40px',
            background: 'var(--bg)',
            border: '1px solid rgba(245,197,24,0.35)',
            color: 'var(--gold)',
          }}
        >
          {post.avatar}
          {isLoggedIn && <OnlineBadge size={11} />}
        </div>

        {/* 作者名称 */}
        <span
          className="post-author-name font-display text-sm font-bold"
          style={{ color: 'var(--text)' }}
        >
          @{post.author}
        </span>
        <UserLevelBadge name={post.author} />

        {/* 分类标签 */}
        <span
          className="post-section-tag font-mono text-[10px] font-semibold uppercase"
          style={{
            color: 'var(--gold)',
            background: 'rgba(245,197,24,0.06)',
            border: '1px solid rgba(245,197,24,0.35)',
            padding: '3px 10px',
            letterSpacing: '0.08em',
          }}
        >
          {post.section}
        </span>

        {/* 分隔线 */}
        <span className="post-meta-sep" style={{ width: '1px', height: '14px', background: 'var(--border)' }} />

        {/* 发布时间 */}
        <span
          className="post-meta-text font-mono text-[11px] flex items-center gap-1.5"
          style={{ color: 'var(--text-dim)' }}
        >
          <ClockIcon size={12} style={{ opacity: 0.6, flexShrink: 0 }} />
          Posted {post.postedTimeAgo}
        </span>

        {/* 分隔线 */}
        <span className="post-meta-sep" style={{ width: '1px', height: '14px', background: 'var(--border)' }} />

        {/* 浏览量 */}
        <span
          className="post-meta-text font-mono text-[11px] flex items-center gap-1.5"
          style={{ color: 'var(--text-dim)' }}
        >
          <EyeIcon size={12} style={{ opacity: 0.6, flexShrink: 0 }} />
          {formatViews(post.views)} views
        </span>
      </div>

      {/* 投票组件 */}
      <PostPoll poll={post.poll} />

      {/* 帖子正文 */}
      <PostBody blocks={post.content} />

      {/* 操作按钮行 */}
      <PostActions
        initialLikes={post.likes}
        initialLiked={post.liked}
        initialBookmarked={post.bookmarked}
        onReply={handleReplyFocus}
      />
    </article>
  );
}

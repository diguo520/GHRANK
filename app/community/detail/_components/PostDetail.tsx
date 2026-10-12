/**
 * PostDetail —— 帖子详情卡片
 * 迁移自 community-detail.html 的 .post-detail article
 *
 * 组合：标题 + 元信息行（分类标签+Tags+发布时间+浏览量）
 *       + 投票组件 + 帖子正文 + 操作按钮行
 */
'use client';

import { useState } from 'react';
import PostBody from './PostBody';
import PostPoll from './PostPoll';
import PostActions from './PostActions';
import EditableTags from './EditableTags';
import ShareCardModal from './ShareCardModal';
import PostBountyCard from './PostBountyCard';
import EditPostModal from './EditPostModal';
import ConfirmModal from './ConfirmModal';
import { ClockIcon, EyeIcon, QuestionIcon, CoinsIcon, EditIcon, TrashIcon } from '@/components/shared/icons';
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn';
import { type PostDetail as PostDetailData } from '../_data/community-detail-data';

/** 数字千分位格式化 */
function formatViews(n: number): string {
  return n.toLocaleString();
}

/** 把 ContentBlock 数组拼接为纯文本（用于编辑器初值） */
function blocksToText(blocks: PostDetailData['content']): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'paragraph':
        case 'heading':
        case 'blockquote':
          return b.text;
        case 'list':
          return b.items.join('\n');
        case 'code':
          return b.code;
        case 'image':
        case 'video':
          return b.caption;
        case 'linkcard':
          return b.title;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

interface PostDetailProps {
  /** 帖子详情数据（由服务端组件加密附件 URL 后传入） */
  post: PostDetailData;
}

export default function PostDetail({ post }: PostDetailProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { loggedIn, userName } = useIsLoggedIn();
  // 作者本人且已登录才能看到编辑/删除按钮
  const isAuthor = loggedIn && userName === post.author;

  // 编辑提交：刷新前 mock，仅给用户反馈
  const handleEditSubmit = (title: string, _content: string) => {
    // 实际项目中此处发起 API 请求；这里直接替换标题
    post.title = title;
    setEditOpen(false);
  };

  // 删除确认：刷新前 mock
  const handleDeleteConfirm = () => {
    setDeleteOpen(false);
    // 实际项目中此处发起删除请求并跳转回列表
    if (typeof window !== 'undefined') {
      window.location.href = '/community';
    }
  };

  return (
    <>
    <article
      className="post-detail relative mb-6"
      style={{
        background: 'transparent',
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

      {/* 帖子标题 + 作者操作按钮 */}
      <div className="flex items-start gap-4 mb-[18px]">
        <h1
          className="post-title flex-1"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 700,
            lineHeight: 1.2,
            color: 'var(--text)',
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          {post.title}
        </h1>
        {isAuthor && (
          <div className="flex items-center gap-1.5 flex-shrink-0" style={{ marginTop: 4 }}>
            <button
              onClick={() => setEditOpen(true)}
              aria-label="Edit this post"
              className="font-mono text-[11px] flex items-center gap-1.5"
              style={{
                padding: '5px 10px',
                color: 'var(--text-dim)',
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--gold)';
                e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-dim)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <EditIcon size={11} />
              Edit
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              aria-label="Delete this post"
              className="font-mono text-[11px] flex items-center gap-1.5"
              style={{
                padding: '5px 10px',
                color: 'var(--text-dim)',
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--red)';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-dim)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <TrashIcon size={11} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* 元信息行 */}
      <div
        className="post-meta-row flex items-center gap-3.5 flex-wrap pb-[18px] mb-[22px]"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* 分类标签 */}
        <span
          className="post-section-tag font-mono text-[10px] font-semibold uppercase"
          style={{
            color: 'var(--gold)',
            background: 'rgba(157,140,255,0.06)',
            border: '1px solid rgba(157,140,255,0.35)',
            padding: '3px 10px',
            letterSpacing: '0.08em',
          }}
        >
          {post.section}
        </span>

        {/* 提问帖专属元信息标签：Question 图标 + 积分悬赏徽章（放在分类旁边） */}
        {post.threadType === 'question' && typeof post.questionPoints === 'number' && (
          <>
            <span
              className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold"
              style={{
                color: '#b45309',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                padding: '3px 8px',
                borderRadius: '4px',
                letterSpacing: '0.04em',
              }}
              title="Bounty question thread"
            >
              <QuestionIcon size={11} />
              QUESTION
            </span>
            <span
              className="inline-flex items-center gap-1 font-mono text-[10px] font-bold"
              style={{
                color: 'var(--bg)',
                background: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)',
                border: '1px solid #92400e',
                padding: '3px 9px',
                borderRadius: '999px',
                letterSpacing: '0.04em',
              }}
              title={`Bounty: ${post.questionPoints} points`}
            >
              <CoinsIcon size={11} />
              {post.questionPoints}
            </span>
          </>
        )}

        {/* Tags —— antd Tag motion 动效，支持前端添加/删除/修改 */}
        <EditableTags initialTags={post.tags} maxTags={5} />

        {/* 分隔线 */}
        <span className="post-meta-sep" style={{ width: '1px', height: '14px', background: 'var(--border)' }} />

        {/* 发布时间（只保留时间，去掉 Posted 文字） */}
        <span
          className="post-meta-text font-mono text-[11px] flex items-center gap-1.5"
          style={{ color: 'var(--text-dim)' }}
        >
          <ClockIcon size={12} style={{ opacity: 0.6, flexShrink: 0 }} />
          {post.postedTimeAgo}
        </span>

        {/* 分隔线 */}
        <span className="post-meta-sep" style={{ width: '1px', height: '14px', background: 'var(--border)' }} />

        {/* 浏览量（只保留数字，去掉 views 文字） */}
        <span
          className="post-meta-text font-mono text-[11px] flex items-center gap-1.5"
          style={{ color: 'var(--text-dim)' }}
        >
          <EyeIcon size={12} style={{ opacity: 0.6, flexShrink: 0 }} />
          {formatViews(post.views)}
        </span>
      </div>

      {/* 提问帖：上方先显示悬赏积分卡（Coins + 状态 + 倒计时） */}
      {post.threadType === 'question' && <PostBountyCard post={post} />}

      {/* 投票组件：投票帖才显示，提问帖/普通帖 poll.title 为空时隐藏 */}
      {post.threadType !== 'question' && post.poll && post.poll.title && <PostPoll poll={post.poll} />}

      {/* 帖子正文 */}
      <PostBody blocks={post.content} />

      {/* 操作按钮行 */}
      <PostActions
        initialLikes={post.likes}
        initialLiked={post.liked}
        initialBookmarked={post.bookmarked}
        postTitle={post.title}
        onShare={() => setShareOpen(true)}
      />
    </article>

    {/* 社交媒体海报分享弹窗 —— 点击 Share 按钮时显示，底栏：复制图 / 下载图 / 复制链接 / 关闭 */}
    <ShareCardModal
      open={shareOpen}
      onClose={() => setShareOpen(false)}
      post={post}
    />

    {/* 作者编辑弹窗 */}
    <EditPostModal
      open={editOpen}
      onClose={() => setEditOpen(false)}
      initialTitle={post.title}
      initialContent={blocksToText(post.content)}
      onSubmit={handleEditSubmit}
    />

    {/* 作者删除确认弹窗 */}
    <ConfirmModal
      open={deleteOpen}
      title="Delete this post?"
      description="This action cannot be undone. All replies and bookmarks on this thread will be removed."
      confirmText="Delete"
      danger
      onConfirm={handleDeleteConfirm}
      onCancel={() => setDeleteOpen(false)}
    />
    </>
  );
}

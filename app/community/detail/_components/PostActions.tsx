/**
 * PostActions —— 帖子操作按钮行
 * 迁移自 community-detail.js 的 post-actions 交互逻辑
 *
 * 包含：Like（点赞计数 toggle）、Bookmark、Share、Reply
 * 所有操作通过 Toast 反馈
 */
'use client';

import { useState } from 'react';
import { Button } from 'antd';
import { useCommunityToast } from './ToastContext';
import { HeartIcon, BookmarkIcon, ShareIcon, ReplyIcon, ReportIcon } from '@/components/shared/icons';
import ReportModal from './ReportModal';
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn';

interface PostActionsProps {
  initialLikes: number;
  initialLiked: boolean;
  initialBookmarked: boolean;
  /** 帖子标题（用于举报抽屉的摘要展示） */
  postTitle?: string;
  /** Reply 按钮点击回调（聚焦回复编辑器） */
  onReply?: () => void;
  /** Share 按钮点击回调（打开分享海报弹窗） */
  onShare?: () => void;
}

export default function PostActions({
  initialLikes,
  initialLiked,
  initialBookmarked,
  postTitle,
  onReply,
  onShare,
}: PostActionsProps) {
  const { showToast } = useCommunityToast();
  const { loggedIn: isLoggedIn } = useIsLoggedIn();
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [reportOpen, setReportOpen] = useState(false);

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
    // 旧：showToast('Link copied to clipboard');
    // 新：若父层传入 onShare（打开海报弹窗），交给父层处理；否则兜底 toast（兼容调用方未接线）
    if (onShare) {
      onShare();
    } else {
      showToast('Link copied to clipboard');
    }
  };

  const handleReply = () => {
    showToast('Reply editor focused');
    onReply?.();
  };

  // 举报：未登录提示登录，已登录打开举报抽屉
  const handleReport = () => {
    if (!isLoggedIn) {
      showToast('Please sign in to report');
      return;
    }
    setReportOpen(true);
  };

  // 提交举报：刷新前 mock，仅给用户反馈
  const handleReportSubmit = (_reason: string, _detail: string) => {
    showToast('Report submitted · thanks for keeping the community safe');
  };

  // 金色色值（保持原设计风格）
  const GOLD = '#9D8CFF';

  // 数字格式化：与社区统计一致，>=1000 用 K，>=100万 用 M
  const fmtCount = (n: number): string => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'K';
    return String(n);
  };

  return (
    <div
      className="post-actions flex items-center gap-2 flex-wrap pt-[22px] mt-6"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      {/* 点赞：图标 + K/M 格式化数字 */}
      <Button
        onClick={handleLike}
        size="small"
        variant={liked ? 'filled' : 'outlined'}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.03em',
          padding: '7px 12px',
          color: liked ? GOLD : undefined,
          borderColor: liked ? GOLD : undefined,
          ...(liked && { background: 'rgba(157,140,255,0.08)' }),
        }}
        icon={<HeartIcon size={14} filled={liked} />}
      >
        <span style={{ color: liked ? GOLD : undefined, fontWeight: 600, marginLeft: 4 }}>
          {fmtCount(likes)}
        </span>
      </Button>

      {/* 收藏：仅图标 */}
      <Button
        onClick={handleBookmark}
        size="small"
        variant={bookmarked ? 'filled' : 'outlined'}
        aria-label="Bookmark"
        style={{
          padding: '7px 10px',
          color: bookmarked ? GOLD : undefined,
          borderColor: bookmarked ? GOLD : undefined,
          ...(bookmarked && { background: 'rgba(157,140,255,0.08)' }),
        }}
        icon={<BookmarkIcon size={14} filled={bookmarked} />}
      />

      {/* 分享：仅图标 */}
      <Button
        onClick={handleShare}
        size="small"
        variant="outlined"
        aria-label="Share"
        style={{ padding: '7px 10px' }}
        icon={<ShareIcon size={14} />}
      />

      {/* 举报：仅图标，靠右 */}
      <Button
        onClick={handleReport}
        size="small"
        variant="outlined"
        aria-label="Report this post"
        style={{
          marginLeft: 'auto',
          padding: '7px 10px',
          color: 'var(--text-dim)',
        }}
        icon={<ReportIcon size={14} />}
      />

      {/* 回复：仅图标，靠右 */}
      <Button
        onClick={handleReply}
        size="small"
        type="primary"
        aria-label="Reply"
        style={{
          padding: '7px 10px',
          background: GOLD,
          borderColor: GOLD,
          color: 'var(--bg)',
          boxShadow: '0 0 12px rgba(157,140,255,0.2)',
        }}
        icon={<ReplyIcon size={14} />}
      />

      {/* 举报弹窗 */}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="post"
        targetSummary={postTitle ?? 'This post'}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}

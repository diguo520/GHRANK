/**
 * ReplyItem —— 单条回复（支持最多 5 级嵌套）
 * 迁移自 community-detail.js 的 renderReply 函数
 *
 * 包含：字母头像、作者名 + 徽章（OP / Top Contributor）+ 时间、
 *       回复内容段落、点赞 + 回复按钮、嵌套子回复
 *
 * 点赞交互：内部 state 管理 liked/likes，点击 toggle
 * 嵌套深度：通过 depth 参数控制，最大 5 级
 */
'use client';

import { useState } from 'react';
import { Button } from 'antd';
import Image from 'next/image';
import { useCommunityToast } from './ToastContext';
import { HeartIcon, ReplyIcon, ReportIcon } from '@/components/shared/icons';
import OnlineBadge from '@/components/shared/OnlineBadge';
import UserLevelBadge from '@/components/shared/UserLevelBadge';
import ReportModal from './ReportModal';
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn';
import { formatPostTime } from '@/lib/time-format';
import { isImageAvatar } from '@/lib/avatar';
import type { Reply } from '../_data/community-detail-data';

interface ReplyItemProps {
  reply: Reply;
  /** 当前嵌套深度（0 = 顶层） */
  depth?: number;
  /** 最大允许嵌套深度 */
  maxDepth?: number;
}

export default function ReplyItem({
  reply,
  depth = 0,
  maxDepth = 5,
}: ReplyItemProps) {
  const { showToast } = useCommunityToast();
  const { loggedIn: isLoggedIn } = useIsLoggedIn();
  const [liked, setLiked] = useState(reply.liked);
  const [likes, setLikes] = useState(reply.likes);
  const [reportOpen, setReportOpen] = useState(false);

  // 数字格式化：与社区统计一致，>=1000 用 K，>=100万 用 M
  const fmtCount = (n: number): string => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'K';
    return String(n);
  };

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikes((n) => (next ? n + 1 : Math.max(0, n - 1)));
  };

  const handleReply = () => {
    showToast(`Reply to @${reply.author}`);
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

  // 举报抽屉展示的回复摘要（前 80 字）
  const reportSummary = reply.content.join(' ').slice(0, 80);

  const badge = reply.isOp ? 'OP' : reply.likes > 50 ? 'Top Contributor' : null;

  const hasReplies = reply.replies && reply.replies.length > 0 && depth < maxDepth;

  return (
    <div className="reply-item relative" style={{ marginBottom: '2px' }}>
      {/* 紧凑型布局 */}
      <div className="flex gap-3">
        {/* 字母头像 / 图片头像 */}
        {(() => {
          const isImg = isImageAvatar(reply.avatar);
          return (
            <div
              className="reply-avatar relative flex items-center justify-center rounded-full flex-shrink-0 font-display text-sm font-bold overflow-hidden"
              style={{
                width: '32px',
                height: '32px',
                background: isImg ? 'var(--surface-overlay)' : 'var(--bg)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--gold)',
              }}
            >
              {isImg ? (
                <Image
                  src={reply.avatar}
                  alt={reply.author}
                  fill
                  sizes="32px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <span style={{ fontSize: reply.avatar.length >= 3 ? 11 : 13, lineHeight: 1 }}>
                  {reply.avatar}
                </span>
              )}
            </div>
          );
        })()}

        {/* 回复主体 */}
        <div className="reply-body flex-1 min-w-0">
          {/* 头部：作者 + 徽章 + 时间 */}
          <div className="reply-head flex items-center gap-1.5 flex-wrap" style={{ marginBottom: '2px' }}>
            <span
              className="reply-author font-display text-[12px] font-semibold"
              style={{ color: 'var(--text)' }}
            >
              @{reply.author}
            </span>
            {reply.isOnline && <OnlineBadge size={7} inline />}
            <UserLevelBadge name={reply.author} />
            {badge && (
              <span
                className="reply-badge font-mono text-[8px] font-semibold uppercase"
                style={{
                  color: 'var(--gold)',
                  background: 'rgba(157,140,255,0.1)',
                  border: '1px solid rgba(157,140,255,0.35)',
                  padding: '1px 5px',
                  letterSpacing: '0.06em',
                  borderRadius: '2px',
                }}
              >
                {badge}
              </span>
            )}
            <span
              className="reply-time font-mono text-[10px]"
              style={{ color: 'var(--text-muted)' }}
            >
              {formatPostTime(reply.timeAgo)}
            </span>
          </div>

          {/* 回复内容 */}
          <div
            className="reply-content font-body text-[13px]"
            style={{ lineHeight: 1.5, color: 'var(--text)' }}
          >
            {reply.content.map((para, i) => (
              <p key={i} style={{ marginBottom: i < reply.content.length - 1 ? '2px' : 0 }}>
                {para}
              </p>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="reply-actions flex items-center gap-0.5" style={{ marginTop: '2px' }}>
            <Button
              type="text"
              size="small"
              onClick={handleLike}
              className="reply-action-btn"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: liked ? 'var(--pink)' : 'var(--text-dim)',
                padding: '2px 6px',
                height: 'auto',
                minHeight: 'unset',
              }}
            >
              <HeartIcon size={10} filled={liked} style={{ opacity: liked ? 1 : 0.7 }} />
              <span className="action-count font-semibold" style={{ marginLeft: '2px' }}>{fmtCount(likes)}</span>
            </Button>
            <Button
              type="text"
              size="small"
              onClick={handleReply}
              className="reply-action-btn"
              aria-label="Reply"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-dim)',
                padding: '2px 6px',
                height: 'auto',
                minHeight: 'unset',
              }}
            >
              <ReplyIcon size={10} style={{ opacity: 0.7 }} />
            </Button>
            <Button
              type="text"
              size="small"
              onClick={handleReport}
              className="reply-action-btn"
              aria-label="Report this reply"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                padding: '2px 6px',
                height: 'auto',
                minHeight: 'unset',
              }}
            >
              <ReportIcon size={10} style={{ opacity: 0.7 }} />
            </Button>
          </div>

          {/* 嵌套子回复 */}
          {hasReplies && (
            <div
              className="reply-children"
              style={{
                marginTop: '4px',
                paddingLeft: '8px',
                borderLeft: '1px solid var(--border-subtle)',
              }}
            >
              {reply.replies!.map((child) => (
                <ReplyItem
                  key={child.id}
                  reply={child}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 举报弹窗：每条回复独立 */}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="reply"
        targetSummary={`@${reply.author}: ${reportSummary}`}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}

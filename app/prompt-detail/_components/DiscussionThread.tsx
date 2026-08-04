/**
 * DiscussionThread —— 讨论帖（主帖 + 回复列表 + 回复表单）
 * 迁移自 prompt-detail.html 的 .thread 结构 + prompt-detail-init.js 的点赞/回复/折叠/分享逻辑
 * 交互：点赞、回复切换、折叠/展开、分享复制链接、回复提交
 */
'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import type { ReviewThread, ReviewReply } from '../_data/prompt-detail-data';
import { usePromptDetail } from './PromptDetailProvider';
import OnlineBadge from '../../_components/OnlineBadge';
import ThreadReply from './ThreadReply';
import CodeBlock from '@/components/shared/CodeBlock';

/** 渲染含反引号行内代码的文本 */
function renderText(text: string): ReactNode {
  return text.split('`').map((part, i) =>
    i % 2 === 1 ? (
      <code key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--cyan)', background: 'rgba(57,210,192,0.08)', border: '1px solid rgba(57,210,192,0.15)', padding: '1px 6px' }}>
        {part}
      </code>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

interface DiscussionThreadProps {
  thread: ReviewThread;
  /** 线程序号（第一条金色圆点） */
  isFirst: boolean;
  /** 点击图片时回调 */
  onImageClick: (images: string[], index: number) => void;
}

export default function DiscussionThread({ thread, isFirst, onImageClick }: DiscussionThreadProps) {
  const { showToast, isLoggedIn, bumpStat } = usePromptDetail();

  // ── 本地状态 ──
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(thread.likeCount);
  const [collapsed, setCollapsed] = useState(false);
  const [replyFormOpen, setReplyFormOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(thread.author);
  const [replyText, setReplyText] = useState('');
  // 本地追加的回复（用户提交后新增）
  const [extraReplies, setExtraReplies] = useState<ReviewReply[]>([]);

  /** 点赞 */
  const handleLike = () => {
    setLiked((prev) => {
      setLikeCount((c) => c + (prev ? -1 : 1));
      return !prev;
    });
  };

  /** 切换回复表单（OP 级别） */
  const toggleReplyForm = () => {
    if (!isLoggedIn) { showToast('Please log in to reply'); return; }
    setReplyFormOpen((prev) => {
      if (!prev) setReplyTo(thread.author);
      else setReplyText('');
      return !prev;
    });
  };

  /** 回复的回复：打开表单并更新回复对象 */
  const handleReplyToReply = (author: string) => {
    if (!isLoggedIn) { showToast('Please log in to reply'); return; }
    setReplyTo(author);
    setReplyFormOpen(true);
  };

  /** 提交回复 */
  const handleSubmitReply = () => {
    const text = replyText.trim();
    if (!text) return;
    const newReply: ReviewReply = {
      author: 'You',
      avatar: { bg: 'rgba(88,166,255,0.12)', color: '#58A6FF' },
      avatarImg: '/images/demo/prompt_1.jpg',
      activities: [{ type: 'liked', value: 1 }],
      date: 'Just now',
      mention: replyTo,
      text,
      likeCount: 0,
    };
    setExtraReplies((prev) => [...prev, newReply]);
    bumpStat('comments', 1);
    showToast(`Reply posted to @${replyTo}`);
    setReplyText('');
    setReplyFormOpen(false);
  };

  /** 分享链接 */
  const handleShare = async () => {
    const url = `${window.location.href.split('#')[0]}#review-${thread.floor}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!');
    } catch {
      showToast('Link copied!');
    }
  };

  const allReplies = [...(thread.replies || []), ...extraReplies];

  return (
    <div className="relative" style={{ paddingLeft: collapsed ? '24px' : '24px' }}>
      {/* 时间线 */}
      <span
        className="absolute z-[1] rounded-full"
        style={{
          left: 0, top: collapsed ? '18px' : '18px',
          width: '11px', height: '11px', borderRadius: '50%',
          background: isFirst ? 'var(--gold)' : 'var(--text-muted)',
          border: '1px solid',
          borderColor: isFirst ? 'rgba(245,197,24,0.35)' : 'var(--border)',
          boxShadow: isFirst ? '0 0 8px rgba(245,197,24,0.25)' : 'none',
        }}
      />
      {/* 时间线竖线 */}
      {!collapsed && (
        <span className="absolute" style={{ left: '5px', top: '18px', bottom: 0, width: '1px', background: 'var(--border)' }} />
      )}

      {/* 主帖 */}
      <div className="flex gap-3">
        {/* 头像 */}
        <div
          className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full"
          style={{ border: '1px solid var(--border)', background: thread.avatar.bg, color: thread.avatar.color }}
        >
          <Image src={thread.avatarImg} alt="" width={36} height={36} className="h-full w-full rounded-full object-cover" />
          {/* 在线状态：仅登录用户可见 */}
          {isLoggedIn && <OnlineBadge size={9} />}
        </div>

        {/* 正文区 */}
        <div className="min-w-0 flex-1">
          {/* Meta */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="font-mono" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.02em' }}>
              <span style={{ color: 'var(--text-muted)' }}>@</span>{thread.author}
            </span>
            <span className="font-mono" style={{ fontSize: '9px', fontWeight: 700, color: 'var(--green)', background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.5)', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Purchased
            </span>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{thread.date}</span>
            <span className="font-mono ml-auto" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>#{thread.floor}</span>
          </div>

          {/* 正文 */}
          {!collapsed && (
            <>
              <p className="mb-3" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.65, color: 'var(--text)' }}>
                {renderText(thread.text)}
              </p>

              {/* 图片 */}
              {thread.images && thread.images.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {thread.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => onImageClick(thread.images!, i)}
                      className="overflow-hidden transition-all duration-200 hover:scale-105"
                      style={{ width: '96px', height: '72px', borderRadius: '4px', border: '1px solid var(--border)', cursor: 'pointer', overflow: 'hidden' }}
                    >
                      <Image src={img} alt="" width={96} height={72} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* 代码块 */}
              {thread.codeBlock && (
                <div className="mb-3">
                  <CodeBlock code={thread.codeBlock.code} lang={thread.codeBlock.lang} />
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={handleLike} className="inline-flex items-center gap-1 transition-colors hover:bg-white/3" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500, color: liked ? 'var(--gold)' : 'var(--text-muted)', background: 'transparent', border: 'none', padding: '4px 8px', cursor: 'pointer' }}>
                  <span>{'\u2B06'}</span> Helpful <span>{likeCount}</span>
                </button>
                <button onClick={toggleReplyForm} className="inline-flex items-center gap-1 transition-colors hover:bg-white/3" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', background: 'transparent', border: 'none', padding: '4px 8px', cursor: 'pointer' }}>
                  {'\u21A9'} Reply {allReplies.length > 0 && `(${allReplies.length})`}
                </button>
                <button onClick={() => setCollapsed(true)} className="inline-flex items-center gap-1 transition-colors hover:bg-white/3" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', background: 'transparent', border: 'none', padding: '4px 8px', cursor: 'pointer' }}>
                  {'\u25B2'} Collapse
                </button>
                <button onClick={handleShare} className="inline-flex items-center gap-1 transition-colors hover:bg-white/3" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', background: 'transparent', border: 'none', padding: '4px 8px', cursor: 'pointer' }}>
                  {'\u1F517'} Share
                </button>
              </div>

              {/* 回复表单 */}
              {replyFormOpen && (
                <div className="mt-3" style={{ background: 'var(--bg)', border: '1px solid var(--border-subtle)', padding: '12px' }}>
                  <div className="mb-3 flex items-center justify-between font-mono" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    <span>Replying to <strong style={{ color: 'var(--text)' }}>@{replyTo}</strong></span>
                    <button onClick={() => { setReplyFormOpen(false); setReplyText(''); }} style={{ fontSize: '16px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 4px' }}>{'\u00D7'}</button>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Write a reply..."
                    className="w-full resize-y transition-colors focus:outline-hidden"
                    style={{ minHeight: '60px', padding: '12px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)', lineHeight: 1.55, background: 'var(--surface)', border: '1px solid var(--border)' }}
                  />
                  <div className="mt-2 flex justify-end">
                    <button onClick={handleSubmitReply} className="font-mono transition-all duration-200" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--bg)', background: 'var(--gold)', border: 'none', padding: '6px 14px', cursor: 'pointer', letterSpacing: '0.06em' }}>Reply</button>
                  </div>
                </div>
              )}

              {/* 回复列表 */}
              {allReplies.length > 0 && (
                <div className="mt-3 flex flex-col gap-3" style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  {allReplies.map((reply, i) => (
                    <ThreadReply key={i} reply={reply} onReplyToReply={handleReplyToReply} isLoggedIn={isLoggedIn} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* 折叠状态：显示展开按钮 */}
          {collapsed && (
            <button onClick={() => setCollapsed(false)} className="font-mono transition-colors" style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', background: 'transparent', border: 'none', padding: '4px 8px', cursor: 'pointer' }}>
              {'\u25BC'} Expand
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

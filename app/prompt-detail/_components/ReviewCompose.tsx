/**
 * ReviewCompose —— 评论输入框
 * 迁移自 prompt-detail.html 的 .review-compose + prompt-detail-init.js 字符计数/提交逻辑
 * 未登录时隐藏输入框
 */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PROMPT_DETAIL } from '../_data/prompt-detail-data';
import { usePromptDetail } from './PromptDetailProvider';

const MAX_CHARS = 500;

export default function ReviewCompose() {
  const { showToast, isLoggedIn, bumpStat } = usePromptDetail();
  const [text, setText] = useState('');

  // 未登录时隐藏评论输入框
  if (!isLoggedIn) return null;

  /** 提交评论 */
  const handleSubmit = () => {
    if (!text.trim()) return;
    showToast('Review submitted successfully!');
    // 同步统计：评论数 +1，评论者 +1
    bumpStat('comments', 1);
    bumpStat('commenters', 1);
    setText('');
  };

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex flex-col">
        {/* 顶栏：标签 + 头像 */}
        <div
          className="flex items-center justify-between"
          style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-overlay)' }}
        >
          <span className="font-mono uppercase" style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            Write a review
          </span>
          <div className="h-7 w-7 overflow-hidden rounded-full" style={{ border: '1px solid var(--border)' }}>
            <Image src={PROMPT_DETAIL.authorAvatar} alt="" width={28} height={28} className="h-full w-full object-cover" />
          </div>
        </div>

        {/* 文本输入 */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={MAX_CHARS}
          placeholder="Write a review..."
          className="w-full resize-y transition-colors focus:outline-hidden"
          style={{
            minHeight: '100px', padding: '16px',
            fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text)', lineHeight: 1.6,
            background: 'var(--bg)', border: '1px solid var(--border-subtle)', borderLeft: 'none', borderRight: 'none',
          }}
        />

        {/* 底部操作栏 */}
        <div
          className="flex items-center justify-between"
          style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-overlay)' }}
        >
          <span className="font-mono" style={{ fontSize: '10px', color: isOverLimit ? 'var(--orange)' : 'var(--text-muted)', letterSpacing: '0.06em' }}>
            {charCount}/{MAX_CHARS}
          </span>
          <button
            onClick={handleSubmit}
            className="font-display transition-all duration-200"
            style={{
              fontSize: '11px', fontWeight: 700, color: 'var(--bg)', background: 'var(--gold)',
              border: 'none', padding: '8px 18px', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
            }}
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}

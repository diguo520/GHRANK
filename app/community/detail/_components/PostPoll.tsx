/**
 * PostPoll —— 帖子投票组件
 * 迁移自 community-detail.js 的投票交互逻辑
 *
 * 交互：点击选项后锁定投票，更新百分比与票数，通过 Toast 反馈
 */
'use client';

import { useState } from 'react';
import { useCommunityToast } from './ToastContext';
import type { PollData } from '../_data/community-detail-data';

interface PostPollProps {
  poll: PollData;
}

export default function PostPoll({ poll }: PostPollProps) {
  const { showToast } = useCommunityToast();
  const [voted, setVoted] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  // 可变票数：投票后对应选项 +1
  const [votes, setVotes] = useState<Record<string, number>>(() =>
    Object.fromEntries(poll.options.map((o) => [o.key, o.votes])),
  );

  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);

  const handleVote = (key: string) => {
    if (voted) return;
    setVoted(true);
    setSelectedKey(key);
    setVotes((prev) => ({ ...prev, [key]: prev[key] + 1 }));
    const label = poll.options.find((o) => o.key === key)?.label || key;
    showToast(`Vote recorded · ${label}`);
  };

  return (
    <div
      className="post-poll mb-[22px]"
      style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '18px 20px' }}
    >
      {/* 投票标题 */}
      <div
        className="flex items-center gap-2.5 mb-3.5"
        style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}
      >
        <span
          className="font-mono text-[9px] font-bold px-2 py-0.5 uppercase flex-shrink-0"
          style={{
            color: 'var(--gold)',
            background: 'rgba(245,197,24,0.1)',
            border: '1px solid rgba(245,197,24,0.35)',
            letterSpacing: '0.08em',
          }}
        >
          Poll
        </span>
        {poll.title}
      </div>

      {/* 投票选项 */}
      <div className="flex flex-col gap-2.5 mb-3">
        {poll.options.map((option) => {
          const pct = totalVotes > 0 ? Math.round((votes[option.key] / totalVotes) * 100) : 0;
          const isSelected = selectedKey === option.key;
          return (
            <button
              key={option.key}
              onClick={() => handleVote(option.key)}
              disabled={voted}
              className="post-poll-option relative flex items-center gap-2.5 w-full text-left overflow-hidden"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: isSelected ? 'var(--gold)' : 'var(--text)',
                background: 'var(--surface)',
                border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--border-subtle)'}`,
                padding: '12px 14px',
                cursor: voted ? 'default' : 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
              }}
            >
              {/* 百分比背景条 */}
              <span
                className="poll-bar absolute top-0 left-0 h-full"
                style={{
                  width: voted ? `${pct}%` : '0%',
                  background: isSelected ? 'rgba(245,197,24,0.22)' : 'rgba(245,197,24,0.12)',
                  transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  zIndex: 0,
                }}
              />
              <span className="poll-label relative z-10 flex-1">{option.label}</span>
              <span
                className="poll-count relative z-10 font-mono text-[11px]"
                style={{ color: isSelected ? 'var(--gold)' : 'var(--text-dim)' }}
              >
                {voted ? `${votes[option.key]} votes (${pct}%)` : `${votes[option.key]} votes`}
              </span>
            </button>
          );
        })}
      </div>

      {/* 总票数 */}
      <div className="font-mono text-[11px]" style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
        {totalVotes} votes total
      </div>

      {/* 投票后提示 */}
      {voted && (
        <div
          className="font-mono text-[10px] mt-2.5 pt-2.5"
          style={{
            color: 'var(--green)',
            letterSpacing: '0.04em',
            borderTop: '1px solid var(--border)',
          }}
        >
          You voted · results updated
        </div>
      )}
    </div>
  );
}

/**
 * PostPoll —— 帖子投票组件（v3.1 重新设计）
 *
 * 设计要点：
 * 1. 未登录/未投票用户也能看到投票结果（进度条 + 百分比）
 * 2. 每个选项底部显示投票用户头像（GitHub 风格堆叠）
 * 3. 支持任意数量选项（当前 5 个）
 * 4. 投票后锁定，选中选项高亮金色
 * 5. 大规模投票优化：缩略数字 + 头像堆叠
 */
'use client';

import { useState } from 'react';
import { useCommunityToast } from './ToastContext';
import type { PollData, PollOption, PollVoter } from '../_data/community-detail-data';

interface PostPollProps {
  poll: PollData;
}

/** 当前登录用户（模拟，实际应从 auth context 获取） */
const CURRENT_USER: PollVoter = {
  name: 'you',
  avatar: 'Y',
};

/** 缩略数字格式化：2345 → 2.3k, 1234567 → 1.2m */
function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

/** 投票用户头像 —— GitHub 风格堆叠，支持大规模投票 */
function VoterStack({ voters, totalVotes }: { voters: PollOption['voters']; totalVotes: number }) {
  if ((!voters || !voters.length) && totalVotes === 0) return null;

  // 大规模投票（>10000）：只显示前 15 个头像 + 缩写计数
  // 中等/小规模（≤10000）：显示前 30 个头像 + 精确计数
  const isLarge = totalVotes > 10000;
  const maxAvatars = isLarge ? 15 : 30;

  const displayVoters = (voters || []).slice(0, maxAvatars);
  const extra = totalVotes - displayVoters.length;

  // 如果有很多投票人但我们只存了部分数据，extra 应该反映真实差距
  const displayExtra = Math.max(extra, 0);

  return (
    <div className="flex items-center gap-0.5">
      {displayVoters.map((voter, i) => {
        // 当前用户的头像用金色边框高亮
        const isMe = voter.name === CURRENT_USER.name;
        return (
          <div
            key={voter.name}
            title={isMe ? `${voter.name} (you)` : voter.name}
            className="flex items-center justify-center rounded-full font-display font-bold"
            style={{
              width: '18px',
              height: '18px',
              fontSize: '9px',
              background: 'var(--bg)',
              border: `1px solid ${isMe ? 'var(--gold)' : 'var(--border)'}`,
              color: isMe ? 'var(--gold)' : 'var(--text-muted)',
              marginLeft: i === 0 ? 0 : '-5px',
              zIndex: displayVoters.length - i,
            }}
          >
            {voter.avatar}
          </div>
        );
      })}
      {/* 额外投票人数：缩略格式 */}
      {displayExtra > 0 && (
        <span
          className="font-mono text-[9px] flex items-center justify-center rounded-full"
          title={`${totalVotes.toLocaleString()} people voted`}
          style={{
            height: '18px',
            minWidth: '18px',
            padding: '0 3px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            marginLeft: '-5px',
            zIndex: 0,
            whiteSpace: 'nowrap',
          }}
        >
          +{isLarge ? formatCompact(displayExtra) : displayExtra}
        </span>
      )}
    </div>
  );
}

export default function PostPoll({ poll }: PostPollProps) {
  const { showToast } = useCommunityToast();
  const [voted, setVoted] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // 可变票数：投票后对应选项 +1
  const [votes, setVotes] = useState<Record<string, number>>(() =>
    Object.fromEntries(poll.options.map((o) => [o.key, o.votes])),
  );

  // 可变投票用户列表：投票后将当前用户插入选中选项的头部
  const [votersMap, setVotersMap] = useState<Record<string, PollVoter[]>>(() =>
    Object.fromEntries(poll.options.map((o) => [o.key, o.voters])),
  );

  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);

  const handleVote = (key: string) => {
    if (voted) return;
    setVoted(true);
    setSelectedKey(key);
    setVotes((prev) => ({ ...prev, [key]: prev[key] + 1 }));
    // 将当前用户头像插入到选中选项的 voters 列表头部
    setVotersMap((prev) => ({
      ...prev,
      [key]: [CURRENT_USER, ...(prev[key] || [])],
    }));
    const label = poll.options.find((o) => o.key === key)?.label || key;
    showToast(`Vote recorded · ${label}`);
  };

  return (
    <div
      className="post-poll mb-[22px] relative"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        padding: '20px 22px',
      }}
    >
      {/* 左上角金色装饰角 */}
      <span
        className="absolute top-[-1px] left-[-1px] w-3 h-3 pointer-events-none"
        style={{ borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)' }}
      />

      {/* 投票标题 */}
      <div className="flex items-center gap-2.5 mb-4">
        <span
          className="font-mono text-[9px] font-bold px-2.5 py-1 uppercase flex-shrink-0"
          style={{
            color: 'var(--gold)',
            background: 'rgba(157,140,255,0.08)',
            border: '1px solid rgba(157,140,255,0.3)',
            letterSpacing: '0.1em',
          }}
        >
          Poll
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--text)',
          }}
        >
          {poll.title}
        </span>
      </div>

      {/* 投票选项 —— 始终显示结果 */}
      <div className="flex flex-col gap-2">
        {poll.options.map((option) => {
          const count = votes[option.key];
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isSelected = selectedKey === option.key;

          return (
            <div
              key={option.key}
              onClick={() => handleVote(option.key)}
              style={{
                position: 'relative',
                background: 'var(--surface)',
                border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--border-subtle)'}`,
                cursor: voted ? 'default' : 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!voted) e.currentTarget.style.borderColor = 'rgba(157,140,255,0.5)';
              }}
              onMouseLeave={(e) => {
                if (!voted) e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              {/* 背景进度条 —— 始终可见 */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${pct}%`,
                  background: isSelected
                    ? 'rgba(157,140,255,0.18)'
                    : 'rgba(157,140,255,0.08)',
                  transition: 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1), background 0.2s',
                  zIndex: 0,
                }}
              />

              {/* 内容层 */}
              <div style={{ position: 'relative', zIndex: 1, padding: '10px 14px' }}>
                {/* 第一行：标签 + 票数 */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span
                    className="font-body"
                    style={{
                      fontSize: '13.5px',
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? 'var(--gold)' : 'var(--text)',
                    }}
                  >
                    {option.label}
                  </span>
                  <span
                    className="font-mono text-[11px] flex-shrink-0"
                    style={{ color: isSelected ? 'var(--gold)' : 'var(--text-dim)' }}
                  >
                    {count.toLocaleString()} votes · {pct}%
                  </span>
                </div>

                {/* 第二行：投票用户头像 + 你的投票标签 */}
                <div className="flex items-center justify-between gap-2">
                  <VoterStack voters={votersMap[option.key]} totalVotes={count} />
                  {isSelected && voted && (
                    <span
                      className="font-mono text-[10px] uppercase"
                      style={{ color: 'var(--gold)', letterSpacing: '0.06em' }}
                    >
                      Your vote
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部统计 + 投票后提示 */}
      <div className="flex items-center justify-between mt-3.5">
        <span
          className="font-mono text-[11px]"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}
        >
          {totalVotes.toLocaleString()} votes total
        </span>
        {voted && (
          <span
            className="font-mono text-[10px] uppercase"
            style={{
              color: 'var(--green)',
              letterSpacing: '0.06em',
              padding: '2px 8px',
              border: '1px solid rgba(82,196,26,0.3)',
              background: 'rgba(82,196,26,0.06)',
            }}
          >
            Vote recorded
          </span>
        )}
      </div>
    </div>
  );
}

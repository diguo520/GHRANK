/**
 * PostBountyCard —— 提问帖专用「悬赏积分卡」
 * 用于帖子详情页正文上方，展示当前悬赏金额、状态、剩余时间，
 * 采用琥珀金主题色，与列表中的 Coins 积分徽章呼应但视觉层级更高。
 *
 * 状态显示规则：
 *  - open     → 绿色 "悬赏中"，显示剩余时间
 *  - assigned → 蓝色 "已分配"，显示处理中
 *  - settled  → 金色 "已发放"，隐藏倒计时
 *  - expired  → 灰色 "已过期"
 */
'use client';

import { CoinsIcon, ClockIcon, CheckCircleIcon, AlertIcon, TrophyIcon } from '@/components/shared/icons';
import type { PostDetail } from '../_data/community-detail-data';

interface PostBountyCardProps {
  /** 提问帖详情数据 */
  post: Pick<PostDetail, 'questionPoints' | 'questionStatus' | 'questionDeadline' | 'acceptedReplyId' | 'acceptedReplies'>;
}

/** 积分奖励 → 文案等级（让积分金额更有可读性） */
function pointsTier(points: number): string {
  if (points >= 250) return 'Elite Bounty';
  if (points >= 150) return 'High Bounty';
  if (points >= 80) return 'Medium Bounty';
  return 'Bounty';
}

/** 状态枚举 → 徽章视觉配置 */
const STATUS_STYLES: Record<
  NonNullable<PostDetail['questionStatus']>,
  { label: string; color: string; bg: string; border: string; Icon: typeof CoinsIcon }
> = {
  open: {
    label: 'Open',
    color: '#059669',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.4)',
    Icon: AlertIcon,
  },
  assigned: {
    label: 'Assigned',
    color: '#2563eb',
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.4)',
    Icon: CheckCircleIcon,
  },
  settled: {
    label: 'Awarded',
    color: '#b45309',
    bg: 'rgba(251, 191, 36, 0.15)',
    border: 'rgba(251, 191, 36, 0.55)',
    Icon: TrophyIcon,
  },
  expired: {
    label: 'Expired',
    color: '#6b7280',
    bg: 'rgba(107, 114, 128, 0.12)',
    border: 'rgba(156, 163, 175, 0.4)',
    Icon: AlertIcon,
  },
};

export default function PostBountyCard({ post }: PostBountyCardProps) {
  const {
    questionPoints: points,
    questionStatus: status = 'open',
    questionDeadline: deadline,
    acceptedReplyId,
    acceptedReplies,
  } = post;

  if (typeof points !== 'number') return null;

  const style = STATUS_STYLES[status];
  const StatusIcon = style.Icon;
  const tier = pointsTier(points);

  return (
    <aside
      aria-label="Question bounty"
      className="post-bounty-card relative mb-[22px] overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: '18px',
        alignItems: 'center',
        background:
          'linear-gradient(135deg, rgba(251, 191, 36, 0.09) 0%, rgba(245, 158, 11, 0.04) 45%, transparent 100%)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '8px',
        padding: '18px 20px',
      }}
    >
      {/* 背景装饰：右上角几何光晕 */}
      <span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: '-30px',
          right: '-20px',
          width: '160px',
          height: '160px',
          background:
            'radial-gradient(circle at center, rgba(251, 191, 36, 0.22) 0%, transparent 70%)',
          filter: 'blur(1px)',
        }}
      />

      {/* 左侧：积分数字 + 悬赏等级 */}
      <div className="min-w-0 flex items-center gap-4">
        <span
          className="inline-flex items-center justify-center flex-shrink-0"
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background:
              'linear-gradient(140deg, #fcd34d 0%, #f59e0b 52%, #b45309 100%)',
            boxShadow:
              '0 6px 20px rgba(217, 119, 6, 0.35), inset 0 1px 0 rgba(255,255,255,0.35)',
            color: 'var(--bg)',
          }}
          title={`Bounty: ${points} points`}
        >
          <CoinsIcon size={26} />
        </span>

        <div className="min-w-0">
          <div
            className="font-mono text-[10px] uppercase tracking-widest mb-1"
            style={{ color: '#b45309', letterSpacing: '0.14em' }}
          >
            // {tier}
          </div>
          <div
            className="font-display font-extrabold leading-none"
            style={{
              fontSize: '32px',
              color: 'var(--text)',
              letterSpacing: '-0.02em',
            }}
          >
            {points.toLocaleString()}
            <span
              className="font-body font-semibold ml-1 align-middle"
              style={{ fontSize: '13px', color: '#92400e' }}
            >
              Points bounty
            </span>
          </div>
          {/* 结算奖励分配（优先 acceptedReplies 数组，回退单个 acceptedReplyId） */}
          {acceptedReplies && acceptedReplies.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              {(() => {
                /* 用 acceptedReplies 积分之和做分母，保证百分比总和 100% */
                const totalAwarded = acceptedReplies.reduce((s, a) => s + a.points, 0);
                return acceptedReplies.map((a, idx) => {
                  const pct = totalAwarded > 0 ? Math.round((a.points / totalAwarded) * 100) : 0;
                  return (
                    <div
                      key={`${a.replyId}-${idx}`}
                      className="font-mono text-[11px] inline-flex items-center gap-1"
                      style={{ color: '#92400e' }}
                    >
                      <span>#{a.replyId}</span>
                      <span className="opacity-60">→</span>
                      <span className="font-semibold">+{a.points}</span>
                      {acceptedReplies.length > 1 && (
                        <span className="opacity-60">({pct}%)</span>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          ) : typeof acceptedReplyId === 'number' ? (
            <div
              className="font-mono text-[11px] mt-2"
              style={{ color: '#92400e' }}
            >
              Reward awarded to reply · #{acceptedReplyId}
            </div>
          ) : null}
        </div>
      </div>

      {/* 右侧：状态徽章 + 倒计时 */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span
          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold"
          style={{
            color: style.color,
            background: style.bg,
            border: `1px solid ${style.border}`,
            borderRadius: '999px',
            padding: '4px 10px',
            letterSpacing: '0.02em',
          }}
        >
          <StatusIcon size={12} />
          {style.label}
        </span>

        {status !== 'settled' && deadline && (
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[11px]"
            style={{
              color: status === 'expired' ? 'var(--text-muted)' : '#78350f',
              opacity: status === 'expired' ? 0.75 : 1,
            }}
          >
            <ClockIcon size={12} />
            {deadline}
          </span>
        )}
      </div>
    </aside>
  );
}

/**
 * RewardSection —— 打赏/支持区域
 * 迁移自 prompt-detail.html 的 .detail-reward-section + prompt-detail-init.js 打赏逻辑
 * 金额选择 + 留言输入 + 支持按钮（点击后显示 Thank you 反馈）
 */
'use client';

import { useState } from 'react';
import { PROMPT_DETAIL } from '../_data/prompt-detail-data';
import { usePromptDetail } from './PromptDetailProvider';
import { CoffeeIcon } from '../../_components/icons';

export default function RewardSection() {
  const { showToast, isLoggedIn, bumpStat } = usePromptDetail();
  const amounts = PROMPT_DETAIL.rewardAmounts;

  const [selectedAmount, setSelectedAmount] = useState(PROMPT_DETAIL.defaultRewardAmount);
  const [message, setMessage] = useState('');
  const [supporting, setSupporting] = useState(false);

  /** 点击支持按钮 */
  const handleSupport = () => {
    if (!isLoggedIn) {
      showToast('Please log in to send a tip');
      return;
    }
    setSupporting(true);
    bumpStat('tips', 1);
    showToast('Thank you for your support!');
    // 1.5s 后恢复按钮状态
    setTimeout(() => setSupporting(false), 1500);
  };

  return (
    <div
      className="relative flex flex-col gap-3"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        padding: '16px 20px',
      }}
    >
      {/* 标题行 */}
      <div className="flex items-center gap-2">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.02em' }}>
          Reward {PROMPT_DETAIL.author}
        </span>
        <span
          className="group relative flex h-[18px] w-[18px] items-center justify-center rounded-full transition-colors hover:text-[color:var(--gold)]"
          style={{ fontSize: '14px', color: 'var(--text-muted)', cursor: 'help' }}
        >
          {'\u2139'}
          {/* Tooltip */}
          <span
            className="pointer-events-none absolute bottom-full left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap group-hover:block"
            style={{
              fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text)',
              background: 'var(--surface-overlay)', border: '1px solid var(--border)',
              padding: '12px 16px', marginBottom: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            1 coffee = $1 tip — send as many as you like to show your appreciation!
          </span>
        </span>
      </div>

      <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-dim)' }}>
        Show appreciation — each coffee costs $1
      </div>

      {/* 金额选择行 */}
      <div className="flex items-center gap-3">
        <span className="flex flex-shrink-0 items-center">
          <CoffeeIcon size={34} />
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-dim)' }}>
          {'\u00D7'}
        </span>
        <div className="flex gap-2">
          {amounts.map((amt) => (
            <button
              key={amt}
              onClick={() => setSelectedAmount(amt)}
              className="flex h-9 w-9 items-center justify-center transition-all duration-200"
              style={{
                fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700,
                color: amt === selectedAmount ? 'var(--bg)' : 'var(--text-dim)',
                background: amt === selectedAmount ? 'var(--gold)' : 'var(--surface)',
                border: '1px solid',
                borderColor: amt === selectedAmount ? 'var(--gold)' : 'var(--border)',
                boxShadow: amt === selectedAmount ? '0 0 12px rgba(245,197,24,0.25)' : 'none',
                cursor: 'pointer',
              }}
            >
              {amt}
            </button>
          ))}
        </div>
      </div>

      {/* 留言输入 */}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Say something nice..."
        maxLength={100}
        className="w-full transition-colors focus:outline-hidden"
        style={{
          fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          padding: '12px 16px',
        }}
      />

      {/* 支持按钮 */}
      <button
        onClick={handleSupport}
        disabled={supporting}
        className="w-full transition-all duration-200"
        style={{
          fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700,
          color: 'var(--bg)', background: 'var(--gold)', border: 'none',
          padding: '12px 20px', letterSpacing: '0.04em', cursor: supporting ? 'default' : 'pointer',
          opacity: supporting ? 0.6 : 1, pointerEvents: supporting ? 'none' : 'auto',
        }}
      >
        {supporting ? 'Thank you!' : (
          <>
            Support{' '}
            <span style={{ fontWeight: 800 }}>${selectedAmount.toFixed(2)}</span>{' '}
            <span style={{ fontSize: '16px' }}>{'\u203A'}</span>
          </>
        )}
      </button>
    </div>
  );
}

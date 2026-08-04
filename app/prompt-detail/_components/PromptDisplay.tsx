/**
 * PromptDisplay —— Prompt 代码展示区 + 登录遮罩
 * 迁移自 prompt-detail.html 的 .prompt-display-section + prompt-detail-init.js 的 copy/loginGate 逻辑
 * 未登录时显示登录遮罩，登录后可复制 Prompt 内容
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PROMPT_DETAIL } from '../_data/prompt-detail-data';
import { usePromptDetail } from './PromptDetailProvider';
import { LockIcon } from '../../_components/icons';

export default function PromptDisplay() {
  const { isLoggedIn, showToast, bumpStat } = usePromptDetail();
  const [copied, setCopied] = useState(false);

  /** 复制 Prompt 内容到剪贴板 */
  const handleCopy = async () => {
    if (!isLoggedIn) return;
    try {
      await navigator.clipboard.writeText(PROMPT_DETAIL.promptContent);
      showToast('Prompt copied!');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast('Copy failed');
    }
  };

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px' }}
    >
      {/* 标题行 */}
      <div
        className="sticky top-0 z-[2] flex items-center justify-between"
        style={{ background: 'var(--surface)', paddingBottom: '12px', marginBottom: '16px' }}
      >
        <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
          Prompt Content
        </h2>
        <span
          style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700,
            color: 'var(--gold)', background: 'rgba(245,197,24,0.08)',
            border: '1px solid rgba(245,197,24,0.35)',
            padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.1em',
          }}
        >
          Premium
        </span>
      </div>

      {/* 代码块容器 */}
      <div
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
      >
        {/* 代码头部 */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--surface-overlay)',
          }}
        >
          <span className="font-mono uppercase" style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
            PROMPT
          </span>
          <button
            onClick={handleCopy}
            className="font-mono transition-colors duration-200"
            style={{
              fontSize: '10px', fontWeight: 600,
              color: copied ? 'var(--green)' : 'var(--text-dim)',
              background: 'transparent',
              border: '1px solid', borderColor: copied ? 'var(--green)' : 'var(--border)',
              padding: '4px 12px', cursor: 'pointer', letterSpacing: '0.06em',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Prompt 代码内容 */}
        <code
          className="block overflow-y-auto"
          style={{
            fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.7,
            color: 'var(--cyan)', padding: '20px',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            userSelect: 'all', flex: '1 1 auto', minHeight: 0,
          }}
        >
          {PROMPT_DETAIL.promptContent}
        </code>

        {/* 登录遮罩层（未登录时显示） */}
        {!isLoggedIn && (
          <div
            className="absolute inset-0 z-[5] flex items-center justify-center backdrop-blur-xs"
            style={{ background: 'rgba(10,10,10,0.85)' }}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <span style={{ color: 'var(--gold)', marginBottom: '4px', display: 'inline-flex' }}>
                <LockIcon size={28} />
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dim)' }}>
                Sign in to view full prompt
              </span>
              <Link
                href="/login"
                className="font-display transition-all duration-200"
                style={{
                  fontSize: '12px', fontWeight: 700, color: 'var(--bg)',
                  background: 'var(--gold)', border: 'none',
                  padding: '12px 32px', textDecoration: 'none',
                  textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                }}
              >
                LOG IN
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

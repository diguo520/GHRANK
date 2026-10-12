/**
 * ReportModal —— 普通用户举报弹窗（居中模态，XenForo 风格）
 * 含：被举报对象摘要、举报理由（单选列表）、详情说明、提交/取消
 */
'use client';

import { useState, useEffect } from 'react';
import { modalOverlayStyle, modalPanelStyle, modalCloseBtnStyle, modalBtnStyle } from '@/lib/modal-styles';

/** 举报理由选项 */
const REPORT_REASONS = [
  'Spam / advertising',
  'Harassment / hate speech',
  'Political sensitivity',
  'Pornographic / vulgar',
  'Fraud / scam',
  'Copyright infringement',
  'Other',
] as const;

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  /** 举报目标类型 */
  targetType: 'post' | 'reply' | 'user';
  /** 目标摘要（用于展示） */
  targetSummary: string;
  /** 提交回调 */
  onSubmit: (reason: string, detail: string) => void;
}

export default function ReportModal({
  open, onClose, targetType, targetSummary, onSubmit,
}: ReportModalProps) {
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [detail, setDetail] = useState('');

  // 关闭时重置
  useEffect(() => {
    if (!open) {
      setReason(REPORT_REASONS[0]);
      setDetail('');
    }
  }, [open]);

  // Esc 关闭
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function handleSubmit() {
    onSubmit(reason, detail.trim());
    onClose();
  }

  if (!open) return null;

  const targetLabel = targetType === 'post' ? 'Post' : targetType === 'reply' ? 'Reply' : 'User';

  return (
    <div
      onClick={onClose}
      style={modalOverlayStyle}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...modalPanelStyle,
          width: 520, maxWidth: '100%',
          maxHeight: '85vh',
        }}
      >
        {/* 标题栏 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div>
            <div className="meta-hud-mono" style={{
              fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--text-muted)', marginBottom: 2,
            }}>
              Report {targetLabel}
            </div>
            <h3 className="font-display" style={{
              margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)',
            }}>
              Submit a report
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={modalCloseBtnStyle}
          >
            ✕
          </button>
        </div>

        {/* 内容区 */}
        <div style={{ padding: '16px 20px 20px', overflowY: 'auto' }}>
          {/* 被举报对象摘要 */}
          <div style={{ marginBottom: 18 }}>
            <div className="meta-hud-mono" style={{
              fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--text-muted)', marginBottom: 6,
            }}>
              {targetLabel}
            </div>
            <div style={{
              padding: '10px 12px', borderRadius: 8,
              background: 'var(--surface)', border: '1px solid var(--border-subtle)',
              fontSize: 13, color: 'var(--text-dim)',
              maxHeight: 80, overflow: 'hidden',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            }}>
              {targetSummary}
            </div>
          </div>

          {/* 理由选择（XenForo 风格：单选列表） */}
          <div style={{ marginBottom: 18 }}>
            <label className="meta-hud-mono" style={{
              display: 'block', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--text-muted)', marginBottom: 8,
            }}>
              Reason
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {REPORT_REASONS.map((r) => {
                const active = reason === r;
                return (
                  <label
                    key={r}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 6,
                      cursor: 'pointer',
                      background: active ? 'rgba(212,175,55,0.08)' : 'transparent',
                      border: `1px solid ${active ? 'rgba(212,175,55,0.3)' : 'var(--border-subtle)'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      checked={active}
                      onChange={() => setReason(r)}
                      style={{ accentColor: 'var(--gold)', cursor: 'pointer' }}
                    />
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: 13,
                      color: active ? 'var(--gold)' : 'var(--text)',
                    }}>
                      {r}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 详细说明 */}
          <div style={{ marginBottom: 8 }}>
            <label className="meta-hud-mono" style={{
              display: 'block', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--text-muted)', marginBottom: 8,
            }}>
              Detail (optional)
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Add context to help moderators review..."
              rows={3}
              style={{
                width: '100%', padding: '10px 12px',
                fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)',
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                resize: 'vertical', outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            />
          </div>
        </div>

        {/* 操作栏 */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'flex-end',
          padding: '12px 20px 16px',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <button
            onClick={onClose}
            style={modalBtnStyle('secondary')}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={modalBtnStyle('primary')}
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

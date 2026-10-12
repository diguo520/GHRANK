/**
 * ConfirmModal —— 危险操作二次确认弹窗（居中模态）
 * 用于作者删除自己的帖子等场景
 */
'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { modalOverlayStyle, modalPanelStyle, modalBtnStyle } from '@/lib/modal-styles';

interface ConfirmModalProps {
  open: boolean;
  /** 标题 */
  title: string;
  /** 描述 */
  description: ReactNode;
  /** 确认按钮文案 */
  confirmText?: string;
  /** 取消按钮文案 */
  cancelText?: string;
  /** 是否为危险操作（红色确认按钮） */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Esc 键关闭
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={modalOverlayStyle}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...modalPanelStyle,
          width: 420, maxWidth: '100%',
        }}
      >
        {/* 标题区 */}
        <div style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <h3 className="font-display" style={{
            margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)',
          }}>
            {title}
          </h3>
        </div>
        {/* 描述区 */}
        <div style={{
          padding: '14px 20px 18px',
          fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6,
        }}>
          {description}
        </div>
        {/* 操作区 */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'flex-end',
          padding: '12px 20px 16px',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <button onClick={onCancel} style={modalBtnStyle('secondary')}>
            {cancelText}
          </button>
          <button onClick={onConfirm} style={modalBtnStyle(danger ? 'danger' : 'primary')}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

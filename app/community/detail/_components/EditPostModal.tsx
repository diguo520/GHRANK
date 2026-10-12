/**
 * EditPostModal —— 作者编辑自己帖子的弹窗（居中模态）
 * 含标题输入 + 内容 textarea
 */
'use client';

import { useState, useEffect } from 'react';
import { modalOverlayStyle, modalPanelStyle, modalCloseBtnStyle, modalBtnStyle } from '@/lib/modal-styles';

interface EditPostModalProps {
  open: boolean;
  onClose: () => void;
  /** 原标题 */
  initialTitle: string;
  /** 原内容（拼接的段落文本） */
  initialContent: string;
  onSubmit: (title: string, content: string) => void;
}

export default function EditPostModal({
  open, onClose, initialTitle, initialContent, onSubmit,
}: EditPostModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  // 打开时同步初始值
  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setContent(initialContent);
    }
  }, [open, initialTitle, initialContent]);

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
    if (title.trim().length < 2) return;
    onSubmit(title.trim(), content.trim());
    onClose();
  }

  if (!open) return null;

  const canSubmit = title.trim().length >= 2;

  return (
    <div
      onClick={onClose}
      style={modalOverlayStyle}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...modalPanelStyle,
          width: 600, maxWidth: '100%',
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
              Author privilege
            </div>
            <h3 className="font-display" style={{
              margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)',
            }}>
              Edit your post
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
          {/* 标题 */}
          <div style={{ marginBottom: 18 }}>
            <label className="meta-hud-mono" style={{
              display: 'block', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--text-muted)', marginBottom: 8,
            }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              style={{
                width: '100%', padding: '10px 12px',
                fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text)',
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8, outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            />
          </div>

          {/* 内容 */}
          <div style={{ marginBottom: 4 }}>
            <label className="meta-hud-mono" style={{
              display: 'block', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--text-muted)', marginBottom: 8,
            }}>
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content..."
              rows={12}
              style={{
                width: '100%', padding: '10px 12px',
                fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)',
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                resize: 'vertical', outline: 'none',
                transition: 'border-color 0.2s ease',
                lineHeight: 1.6,
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
            disabled={!canSubmit}
            style={modalBtnStyle('primary', !canSubmit)}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

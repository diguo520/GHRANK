/**
 * ReplyEditor —— 回复编辑器（tiptap 富文本）
 * 迁移自 community-detail.html 的 .post-reply-editor 与 .compose-body
 *
 * 交互：字符计数（纯文本长度）、提交后通过 Toast 反馈并清空编辑器
 * 通过 ref 暴露 focus() 供 PostDetail 的 Reply 按钮调用（替代旧的 window.__focusReplyEditor hack）
 */
'use client';

import { useImperativeHandle, useRef, useState, type Ref } from 'react';
import { useCommunityToast } from './ToastContext';
import TiptapEditor, { type TiptapEditorHandle } from '@/components/shared/TiptapEditor';

const MAX_CHARS = 500;

/** 对外句柄：聚焦编辑器并滚动到可视区域 */
export interface ReplyEditorHandle {
  focus: () => void;
}

interface ReplyEditorProps {
  ref?: Ref<ReplyEditorHandle>;
}

export default function ReplyEditor({ ref }: ReplyEditorProps) {
  const { showToast } = useCommunityToast();
  const [text, setText] = useState('');
  const tiptapRef = useRef<TiptapEditorHandle>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useImperativeHandle(ref, () => ({
    /** 外部调用：聚焦到编辑器 */
    focus: () => {
      tiptapRef.current?.focus();
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  }));

  const handleSubmit = () => {
    if (!text.trim()) {
      showToast('Reply cannot be empty');
      return;
    }
    showToast('Reply posted successfully');
    tiptapRef.current?.clearContent();
    setText('');
  };

  return (
    <section
      ref={sectionRef}
      className="post-reply-editor relative mb-6"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px 28px' }}
    >
      {/* 左上角青色装饰角 */}
      <span
        className="absolute top-[-1px] left-[-1px] w-3.5 h-3.5 pointer-events-none"
        style={{ borderTop: '2px solid var(--cyan)', borderLeft: '2px solid var(--cyan)' }}
      />
      <h3
        className="reply-editor-title mb-4"
        style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}
      >
        Write a Reply
      </h3>

      <div className="compose-body relative">
        {/* 顶栏：标签 + 当前用户头像 */}
        <div
          className="compose-topbar flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
        >
          <span
            className="compose-topbar-label font-mono text-[11px] font-medium uppercase"
            style={{ color: 'var(--text-dim)', letterSpacing: '0.04em' }}
          >
            Write a reply
          </span>
          <div
            className="compose-avatar flex items-center justify-center w-7 h-7 rounded-full overflow-hidden flex-shrink-0"
            style={{ background: 'var(--surface)', border: '1px solid rgba(245,197,24,0.35)' }}
          >
            <span className="font-display text-xs font-bold" style={{ color: 'var(--gold)' }}>U</span>
          </div>
        </div>

        {/* 富文本输入区（minimal 工具栏） */}
        <TiptapEditor
          ref={tiptapRef}
          toolbar="minimal"
          maxChars={MAX_CHARS}
          minHeight={120}
          placeholder="Write a reply..."
          onChange={(_html, plainText) => setText(plainText)}
        />

        {/* 底栏：字符计数 + 提交按钮 */}
        <div className="compose-bottom flex items-center justify-between mt-2.5 flex-wrap gap-2.5">
          <span className="compose-char-counter font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>
            {text.length}/{MAX_CHARS}
          </span>
          <button
            onClick={handleSubmit}
            className="compose-submit"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--bg)',
              background: 'var(--gold)',
              border: 'none',
              padding: '8px 24px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(245,197,24,0.2)',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffe066';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(245,197,24,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--gold)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(245,197,24,0.2)';
            }}
          >
            Post Reply
          </button>
        </div>
      </div>
    </section>
  );
}

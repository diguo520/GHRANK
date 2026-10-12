/**
 * NewPostForm —— 发帖表单（客户端交互组件）
 * 迁移自 community-new.html 的 .community-new-form 主体
 *
 * 交互：
 *  - 标题输入（maxLength 120，Notion-like 大字无边框风格，placeholder "Untitled"）
 *  - 标签芯片输入（Enter/逗号 添加，× 删除，最多 5 个）
 *  - 正文编辑器（maxLength 5000，实时字符计数，Notion-like variant + / 斜杠命令）
 *  - 全屏编辑：同实例切换 fixed overlay，Esc/按钮退出，内容无缝保留
 *  - 发布校验（标题+正文必填）+ Toast 反馈
 *  - 取消跳回社区列表
 *  - 若 URL 携带 ?tieba= 参数，顶部只读展示“发帖到 XX 贴吧”
 *
 * 复用 community-detail 的 ToastProvider 提供统一 Toast 反馈
 */
'use client';

import { Suspense, useRef, useState } from 'react';
import { Button, Input } from 'antd';
import { useSearchParams } from 'next/navigation';
import { ToastProvider, useCommunityToast } from '../../detail/_components/ToastContext';
import { SendIcon } from '@/components/shared/icons';

/* ── 常量配置 ── */
const TITLE_MAX = 120;
const BODY_MAX = 5000;
const TAGS_MAX = 5;
const TAG_TEXT_MAX = 24;

/** 表单主体：消费 Toast 上下文 */
function FormBody() {
  const { showToast } = useCommunityToast();
  const searchParams = useSearchParams();
  // 来源贴吧（可选）：从贴吧页"发帖"入口携带 ?tieba=XX
  const tiebaName = searchParams.get('tieba');

  // 受控表单状态
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [body, setBody] = useState('');
  const [tagsFocused, setTagsFocused] = useState(false);
  const bodyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  /** 添加标签：去空白/去重/限制数量与长度 */
  function commitTag(raw: string) {
    const value = raw.trim().replace(/,+$/, '').slice(0, TAG_TEXT_MAX);
    if (!value) return;
    if (tags.length >= TAGS_MAX) {
      showToast(`Up to ${TAGS_MAX} tags allowed`);
      return;
    }
    if (tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
      showToast('Tag already exists');
      return;
    }
    setTags((prev) => [...prev, value]);
    setTagInput('');
  }

  function removeTag(index: number) {
    setTags((prev) => prev.filter((_, i) => i !== index));
  }

  /** 发布：校验必填项后通过 Toast 反馈 */
  function handlePublish() {
    if (!title.trim()) {
      showToast('Title is required');
      return;
    }
    if (!body.trim()) {
      showToast('Post body cannot be empty');
      return;
    }
    showToast('Post published successfully');
    // 提交成功后清空表单
    setTitle('');
    setTags([]);
    setTagInput('');
    if (bodyTextareaRef.current) bodyTextareaRef.current.value = '';
    setBody('');
  }

  const tagsAtLimit = tags.length >= TAGS_MAX;

  return (
    <div className="min-w-0">
      {/* 标题块 */}
      <header
        className="relative mb-6 pb-5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        {/* 底部金色强调线（60px） */}
        <span
          className="pointer-events-none absolute bottom-[-1px] left-0"
          style={{ width: '60px', height: '1px', background: 'var(--gold)', boxShadow: '0 0 8px rgba(157, 140, 255, 0.25)' }}
        />
        <div
          className="mb-2 font-mono text-[10px] uppercase"
          style={{ color: 'var(--gold)', letterSpacing: '0.18em' }}
        >
          // CREATE POST
        </div>
        <h1
          className="mb-2 font-display font-extrabold"
          style={{ fontSize: '32px', color: 'var(--text)', lineHeight: 1.1, letterSpacing: '0.02em' }}
        >
          Start a New Discussion
        </h1>
        <p
          className="font-body"
          style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.5, maxWidth: '560px' }}
        >
          Share a question, a build, a benchmark, or an idea with the community. Be specific and respectful.
        </p>

        {/* 来源贴吧提示（只读）：由贴吧页入口携带 ?tieba= 参数时显示 */}
        {tiebaName ? (
          <div
            className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase"
            style={{
              color: 'var(--gold)',
              border: '1px solid rgba(157, 140, 255, 0.35)',
              background: 'rgba(157, 140, 255, 0.05)',
              padding: '6px 12px',
              letterSpacing: '0.08em',
            }}
          >
            <span
              className="inline-block"
              style={{ width: '6px', height: '6px', background: 'var(--gold)', boxShadow: '0 0 6px rgba(157, 140, 255, 0.4)' }}
            />
            Posting to {tiebaName} tieba
          </div>
        ) : null}
      </header>

      {/* 标题输入已并入下方编辑器卡片（Notion-like 大字无边框） */}

      {/* 标签输入 */}
      <div className="mb-5">
        <label
          className="mb-2 flex items-center justify-between font-mono text-[10px] font-semibold uppercase"
          style={{ color: 'var(--text-dim)', letterSpacing: '0.1em' }}
        >
          <span>Tags</span>
          <span style={{ color: tagsAtLimit ? 'var(--gold)' : 'var(--text-muted)', letterSpacing: '0.06em' }}>
            {tags.length}/{TAGS_MAX}
          </span>
        </label>

        {/* 已添加的标签 */}
        {tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {tags.map((tag, index) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-sm font-mono text-[11px]"
                style={{
                  color: 'var(--text)',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  padding: '3px 8px',
                  letterSpacing: '0.03em',
                }}
              >
                {tag}
                <span
                  role="button"
                  aria-label={`Remove tag ${tag}`}
                  onClick={() => removeTag(index)}
                  className="cursor-pointer font-mono text-[12px] leading-none hover:opacity-70"
                  style={{ color: 'var(--text-muted)', marginLeft: '4px' }}
                >
                  ×
                </span>
              </span>
            ))}
          </div>
        )}

        {/* 输入框：达到上限后禁用 */}
        <Input
          value={tagInput}
          autoComplete="off"
          allowClear={!tagsAtLimit}
          disabled={tagsAtLimit}
          placeholder={tagsAtLimit ? `Max ${TAGS_MAX} tags` : 'Type a tag, press Enter or comma to add'}
          onChange={(e) => setTagInput(e.target.value.slice(0, TAG_TEXT_MAX))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
              e.preventDefault();
              commitTag(tagInput);
            } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
              e.preventDefault();
              removeTag(tags.length - 1);
            }
          }}
          onFocus={() => setTagsFocused(true)}
          onBlur={() => {
            setTagsFocused(false);
            if (tagInput.trim()) commitTag(tagInput);
          }}
          maxLength={TAG_TEXT_MAX}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
          }}
        />
      </div>

      {/* 正文编辑器卡片：Notion-like（大字标题 + 无边框正文）
          全屏功能已移除：现在通过编辑器工具栏自带的独立全屏按钮进入官方 Simple template 风格全屏 */}
      <div
        className="post-editor-card relative mb-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '14px 20px 16px' }}
      >
        {/* 左上 + 右下金色装饰角 */}
        <>
          <span
            className="pointer-events-none absolute top-[-1px] left-[-1px] w-3.5 h-3.5"
            style={{ borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)' }}
          />
          <span
            className="pointer-events-none absolute bottom-[-1px] right-[-1px] w-3.5 h-3.5"
            style={{ borderBottom: '2px solid var(--gold)', borderRight: '2px solid var(--gold)' }}
          />
        </>

        {/* 顶栏：仅保留 Write your post + 用户头像（删除头像旁旧全屏按钮） */}
        <div
          className="flex items-center justify-between px-3.5 py-2"
          style={{
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg)',
            margin: '-14px -20px 12px',
          }}
        >
          <span
            className="font-mono text-[11px] font-medium uppercase"
            style={{ color: 'var(--text-dim)', letterSpacing: '0.04em' }}
          >
            Write your post
          </span>
          <div className="flex items-center gap-2.5">
            <div
              className="flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
              style={{ width: '24px', height: '24px', background: 'var(--surface)', border: '1px solid rgba(157,140,255,0.35)' }}
            >
              <span className="font-display font-bold" style={{ color: 'var(--gold)', fontSize: '12px' }}>U</span>
            </div>
          </div>
        </div>

        <div className="relative">
          {/* 标题：大字无边框，与正文视觉连成一体 */}
          <Input
            id="postTitleInput"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            maxLength={TITLE_MAX}
            autoComplete="off"
            placeholder="Untitled"
            aria-label="Post title"
            variant="borderless"
            className="post-title-input w-full"
          />

          {/* 正文输入区（纯文本 textarea：替代原 tiptap 富文本） */}
          <textarea
            ref={bodyTextareaRef}
            value={body}
            maxLength={BODY_MAX}
            placeholder="Write your post content..."
            onChange={(e) => setBody(e.target.value.slice(0, BODY_MAX))}
            className="w-full resize-y post-body-textarea"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              lineHeight: 1.65,
              color: 'var(--text)',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              minHeight: '180px',
              padding: '8px 4px',
            }}
          />

          {/* 底栏：字符计数（始终显示在编辑器右下角） */}
          <div className="mt-2.5 flex items-center justify-end">
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>
              {body.length}/{BODY_MAX}
            </span>
          </div>
        </div>
      </div>

      {/* 操作行：取消 + 发布 —— antd Button */}
      <div
        className="flex flex-wrap items-center justify-end gap-3 pt-5"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <Button
          href="/community"
          size="large"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            height: 'auto',
            padding: '9px 20px',
          }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handlePublish}
          size="large"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-display)',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            height: 'auto',
            padding: '9px 26px',
          }}
        >
          <SendIcon size={12} />
          Publish Post
        </Button>
      </div>
    </div>
  );
}

export default function NewPostForm() {
  // ToastProvider 包裹表单，提供统一的提交反馈
  // Suspense 包裹 useSearchParams，避免静态预渲染报错
  return (
    <ToastProvider>
      <Suspense fallback={null}>
        <FormBody />
      </Suspense>
    </ToastProvider>
  );
}

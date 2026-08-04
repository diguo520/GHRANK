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

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ToastProvider, useCommunityToast } from '../../detail/_components/ToastContext';
import { SendIcon } from '../../../_components/icons';
import TiptapEditor, { type TiptapEditorHandle } from '@/components/shared/TiptapEditor';
import { IMAGE_ERROR_EVENT } from './editor/imageUtils';

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
  const [tagsFocused, setTagsFocused] = useState(false);
  const [body, setBody] = useState('');
  const bodyEditorRef = useRef<TiptapEditorHandle>(null);
  const [fullscreen, setFullscreen] = useState(false);
  // 斜杠命令菜单开关状态（由编辑器扩展上报），用于 Esc 优先级判断
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);

  /**
   * 全屏模式：锁定 body 滚动 + Esc 退出
   * 监听器使用捕获阶段（早于 ProseMirror 的冒泡处理），
   * 避免 suggestion 插件在 active 时提前 preventDefault 导致 defaultPrevented 误判。
   * 优先级：斜杠菜单打开 → Esc 仅关菜单（由插件处理）；菜单关闭 → Esc 退出全屏
   */
  useEffect(() => {
    if (!fullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (slashMenuOpen) return; // 菜单打开：优先关菜单，不退全屏
      setFullscreen(false);
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey, true);
    };
  }, [fullscreen, slashMenuOpen]);

  /** 斜杠菜单 Image 命令的图片错误事件 → Toast */
  useEffect(() => {
    const onImageError = (e: Event) => {
      const message = (e as CustomEvent<string>).detail;
      if (message) showToast(message);
    };
    window.addEventListener(IMAGE_ERROR_EVENT, onImageError);
    return () => window.removeEventListener(IMAGE_ERROR_EVENT, onImageError);
  }, [showToast]);

  /** 添加标签：去空白/去重/限制数量与长度 */
  function commitTag(raw: string) {
    const value = raw.trim().replace(/,+$/, '').slice(0, TAG_TEXT_MAX);
    if (!value) return;
    if (tags.length >= TAGS_MAX) {
      showToast(`Up to ${TAGS_MAX} tags allowed`);
      return;
    }
    if (tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
      showToast('Tag already added');
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
    bodyEditorRef.current?.clearContent();
    setBody('');
    setFullscreen(false);
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
          style={{ width: '60px', height: '1px', background: 'var(--gold)', boxShadow: '0 0 8px rgba(245,197,24,0.25)' }}
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
              border: '1px solid rgba(245,197,24,0.35)',
              background: 'rgba(245,197,24,0.05)',
              padding: '6px 12px',
              letterSpacing: '0.08em',
            }}
          >
            <span
              className="inline-block"
              style={{ width: '6px', height: '6px', background: 'var(--gold)', boxShadow: '0 0 6px rgba(245,197,24,0.4)' }}
            />
            Posting to {tiebaName} 贴吧
          </div>
        ) : null}
      </header>

      {/* 标题输入已并入下方编辑器卡片（Notion-like 大字无边框） */}

      {/* 标签芯片输入 */}
      <div className="mb-5">
        <label
          htmlFor="postTagsInput"
          className="mb-2 flex items-center justify-between font-mono text-[10px] font-semibold uppercase"
          style={{ color: 'var(--text-dim)', letterSpacing: '0.1em' }}
        >
          <span>Tags</span>
          <span style={{ color: tagsAtLimit ? 'var(--gold)' : 'var(--text-muted)', letterSpacing: '0.06em' }}>
            {tags.length}/{TAGS_MAX}
          </span>
        </label>
        <div
          onClick={() => document.getElementById('postTagsInput')?.focus()}
          className="flex min-h-[46px] w-full cursor-text flex-wrap items-center gap-1.5"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: '8px 12px',
            transition: 'border-color 0.18s, box-shadow 0.18s',
            borderColor: tagsFocused ? 'var(--gold)' : 'var(--border)',
            boxShadow: tagsFocused ? '0 0 0 1px rgba(245,197,24,0.12)' : 'none',
          }}
        >
          {/* 已添加的标签芯片 */}
          {tags.map((tag, index) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 font-mono text-[11px]"
              style={{
                color: 'var(--text)',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                padding: '3px 6px 3px 9px',
                letterSpacing: '0.03em',
              }}
            >
              {tag}
              <button
                type="button"
                aria-label={`Remove tag ${tag}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="tag-chip-remove inline-flex items-center justify-center font-mono text-[12px] leading-none"
                style={{
                  color: 'var(--text-muted)',
                  background: 'transparent',
                  border: 'none',
                  padding: '1px 3px',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#e5534b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                ×
              </button>
            </span>
          ))}

          {/* 输入区：达到上限后禁用 */}
          {tagsAtLimit ? (
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              Max {TAGS_MAX} tags reached — remove one to add more
            </span>
          ) : (
            <input
              id="postTagsInput"
              type="text"
              value={tagInput}
              autoComplete="off"
              placeholder={tags.length === 0 ? 'Add tags, press Enter or comma' : 'Add another...'}
              onChange={(e) => setTagInput(e.target.value.slice(0, TAG_TEXT_MAX))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
                  e.preventDefault();
                  commitTag(tagInput);
                } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
                  // 输入为空时 Backspace 删除最后一个标签
                  e.preventDefault();
                  removeTag(tags.length - 1);
                }
              }}
              onFocus={() => setTagsFocused(true)}
              onBlur={() => {
                setTagsFocused(false);
                // 失焦时提交未完成的输入
                if (tagInput.trim()) commitTag(tagInput);
              }}
              className="min-w-[120px] flex-1 outline-hidden"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--text)',
                background: 'transparent',
                border: 'none',
                padding: '4px 2px',
              }}
            />
          )}
        </div>
      </div>

      {/* 正文编辑器卡片：Notion-like（大字标题 + 无边框正文），支持全屏；
          全屏仅切换容器样式，同一 editor 实例不重建，内容无缝保留 */}
      <div
        className={fullscreen ? 'post-editor-fullscreen' : 'post-editor-card relative mb-5'}
        style={
          fullscreen
            ? undefined
            : { background: 'var(--surface)', border: '1px solid var(--border)', padding: '14px 20px 16px' }
        }
      >
        {/* 左上 + 右下金色装饰角（仅普通模式） */}
        {!fullscreen && (
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
        )}

        {/* 顶栏：全屏模式与普通的模式两套 */}
        {fullscreen ? (
          <div className="post-editor-fullscreen-topbar">
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="post-editor-fullscreen-exit"
              title="Exit fullscreen (Esc)"
            >
              ⛶ <span>Exit Fullscreen</span>
            </button>
            <span className="post-editor-fullscreen-count font-mono">
              {body.length}/{BODY_MAX}
            </span>
            <button
              type="button"
              onClick={handlePublish}
              className="post-editor-fullscreen-publish font-display"
            >
              <SendIcon size={11} />
              Publish
            </button>
          </div>
        ) : (
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
              {/* 全屏切换按钮 */}
              <button
                type="button"
                onClick={() => setFullscreen(true)}
                className="post-editor-fullscreen-btn"
                title="Enter fullscreen"
                aria-label="Enter fullscreen"
              >
                ⛶
              </button>
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
                style={{ background: 'var(--surface)', border: '1px solid rgba(245,197,24,0.35)' }}
              >
                <span className="font-display text-xs font-bold" style={{ color: 'var(--gold)' }}>U</span>
              </div>
            </div>
          </div>
        )}

        <div className={fullscreen ? 'post-editor-fullscreen-inner' : 'relative'}>
          {/* 标题：大字无边框，与正文视觉连成一体 */}
          <input
            id="postTitleInput"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            maxLength={TITLE_MAX}
            autoComplete="off"
            placeholder="Untitled"
            aria-label="Post title"
            className="post-title-input w-full outline-hidden"
          />

          {/* 正文输入区（tiptap 富文本，Notion-like 变体：无工具栏 + / 斜杠命令） */}
          <TiptapEditor
            ref={bodyEditorRef}
            toolbar="full"
            variant="notion"
            maxChars={BODY_MAX}
            minHeight={180}
            onSlashMenuOpenChange={setSlashMenuOpen}
            onImageError={showToast}
            onChange={(_html, plainText) => setBody(plainText)}
          />

          {/* 底栏：字符计数（仅普通模式；全屏模式计数在顶栏） */}
          {!fullscreen && (
            <div className="mt-2.5 flex items-center justify-end">
              <span className="font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>
                {body.length}/{BODY_MAX}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 操作行：取消 + 发布 */}
      <div
        className="flex flex-wrap items-center justify-end gap-3 pt-5"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <Link
          href="/community"
          className="inline-flex items-center font-mono text-[11px] font-medium uppercase"
          style={{
            color: 'var(--text-dim)',
            background: 'transparent',
            border: '1px solid var(--border)',
            padding: '9px 20px',
            letterSpacing: '0.08em',
            textDecoration: 'none',
            transition: 'color 0.18s, border-color 0.18s, background 0.18s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text)';
            e.currentTarget.style.borderColor = 'rgba(245,197,24,0.5)';
            e.currentTarget.style.background = 'rgba(245,197,24,0.03)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-dim)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Cancel
        </Link>
        <button
          onClick={handlePublish}
          type="button"
          className="inline-flex items-center gap-1.5 font-display text-[11px] font-bold uppercase"
          style={{
            color: 'var(--bg)',
            background: 'var(--gold)',
            border: 'none',
            padding: '9px 26px',
            letterSpacing: '0.08em',
            cursor: 'pointer',
            boxShadow: '0 0 16px rgba(245,197,24,0.25)',
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ffe066';
            e.currentTarget.style.boxShadow = '0 0 24px rgba(245,197,24,0.25), 0 0 48px rgba(245,197,24,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--gold)';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(245,197,24,0.25)';
          }}
        >
          <SendIcon size={12} />
          Publish Post
        </button>
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

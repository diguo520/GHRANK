/**
 * TiptapEditor —— 项目统一富文本编辑器（基于 tiptap v3）
 *
 * 特性：
 *  - StarterKit（加粗/斜体/下划线/删除线/列表/引用/代码块/标题等）
 *  - Placeholder 占位提示 + CharacterCount 字数上限
 *  - immediatelyRender: false —— 规避 React 19 SSR hydration mismatch（错误 418）
 *  - 工具栏沿用项目 HUD mono 文字符号风格（B / I / U / `<>` / • / 1. / "）
 *  - 通过 ref 暴露 focus() / clearContent()
 *
 * 工具栏模式：
 *  - minimal（回复框）：加粗、斜体、行内代码、无序列表、有序列表
 *  - full（发帖页）  ：上述 + 下划线、删除线、引用块、代码块、H2/H3、撤销/重做
 *
 * 变体（variant）：
 *  - default：经典边框外壳 + 工具栏（ReplyEditor / SettingsForm 等既有场景不受影响）
 *  - notion ：Notion-like 简洁模式——隐藏工具栏、去边框，启用：
 *      · / 斜杠命令菜单 · 表格 TableKit（可拖拽列宽） · 图片 base64 上传（按钮/拖拽/粘贴/斜杠）
 *      · 选区气泡菜单 BubbleMenu · 内容区 min/max 高度内部滚动（.post-editor-scroll）
 */
'use client';

import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { TableKit } from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import FileHandler from '@tiptap/extension-file-handler';
import SlashMenuExtension from '@/app/community/new/_components/editor/SlashMenuExtension';
import TocRail from '@/app/community/new/_components/editor/TocRail';
import {
  IMAGE_MIME_TYPES,
  readImageAsBase64,
  validateImageFile,
} from '@/app/community/new/_components/editor/imageUtils';

/* ── 对外句柄：供父组件聚焦 / 清空 ── */
export interface TiptapEditorHandle {
  focus: () => void;
  clearContent: () => void;
}

export interface TiptapEditorProps {
  /** 初始内容（HTML 字符串），仅作为初始值，非受控 */
  value?: string;
  /** 内容变更回调：同时输出 HTML 与纯文本 */
  onChange?: (html: string, text: string) => void;
  /** 占位提示文字 */
  placeholder?: string;
  /** 最大字符数（按纯文本统计），不传则不限制 */
  maxChars?: number;
  /** 编辑区最小高度（px） */
  minHeight?: number;
  /** 工具栏模式 */
  toolbar?: 'full' | 'minimal';
  /**
   * 编辑器变体：
   *  - default（默认）：边框外壳 + 工具栏，既有行为完全不变
   *  - notion：Notion-like 无边框简洁模式，隐藏工具栏，启用 / 斜杠命令菜单
   */
  variant?: 'default' | 'notion';
  /** 斜杠命令菜单开/关回调（仅 notion 变体生效，供外层感知菜单状态） */
  onSlashMenuOpenChange?: (open: boolean) => void;
  /** 图片上传错误回调（仅 notion 变体：超限 / 类型不支持 / 读取失败），供外层 Toast */
  onImageError?: (message: string) => void;
}

/* ── 工具栏按钮定义（HUD mono 文字符号风格） ── */
interface ToolbarButton {
  key: string;
  label: string;
  title: string;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
  /** 仅在 full 模式显示 */
  fullOnly?: boolean;
}

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  {
    key: 'bold', label: 'B', title: 'Bold',
    isActive: (e) => e.isActive('bold'),
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    key: 'italic', label: 'I', title: 'Italic',
    isActive: (e) => e.isActive('italic'),
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    key: 'underline', label: 'U', title: 'Underline', fullOnly: true,
    isActive: (e) => e.isActive('underline'),
    run: (e) => e.chain().focus().toggleUnderline().run(),
  },
  {
    key: 'strike', label: 'S~', title: 'Strikethrough', fullOnly: true,
    isActive: (e) => e.isActive('strike'),
    run: (e) => e.chain().focus().toggleStrike().run(),
  },
  {
    key: 'code', label: '<>', title: 'Inline code',
    isActive: (e) => e.isActive('code'),
    run: (e) => e.chain().focus().toggleCode().run(),
  },
  {
    key: 'bulletList', label: '•', title: 'Bullet list',
    isActive: (e) => e.isActive('bulletList'),
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    key: 'orderedList', label: '1.', title: 'Ordered list',
    isActive: (e) => e.isActive('orderedList'),
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    key: 'blockquote', label: '"', title: 'Blockquote', fullOnly: true,
    isActive: (e) => e.isActive('blockquote'),
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    key: 'codeBlock', label: '{ }', title: 'Code block', fullOnly: true,
    isActive: (e) => e.isActive('codeBlock'),
    run: (e) => e.chain().focus().toggleCodeBlock().run(),
  },
  {
    key: 'heading2', label: 'H2', title: 'Heading 2', fullOnly: true,
    isActive: (e) => e.isActive('heading', { level: 2 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    key: 'heading3', label: 'H3', title: 'Heading 3', fullOnly: true,
    isActive: (e) => e.isActive('heading', { level: 3 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    key: 'undo', label: '↶', title: 'Undo', fullOnly: true,
    isDisabled: (e) => !e.can().undo(),
    run: (e) => e.chain().focus().undo().run(),
  },
  {
    key: 'redo', label: '↷', title: 'Redo', fullOnly: true,
    isDisabled: (e) => !e.can().redo(),
    run: (e) => e.chain().focus().redo().run(),
  },
];

/** 选区气泡菜单按钮（复用工具栏定义与激活判定） */
const BUBBLE_MENU_KEYS = ['bold', 'italic', 'underline', 'strike', 'code'];

const TiptapEditor = forwardRef<TiptapEditorHandle, TiptapEditorProps>(function TiptapEditor(
  {
    value = '',
    onChange,
    placeholder,
    maxChars,
    minHeight = 120,
    toolbar = 'minimal',
    variant = 'default',
    onSlashMenuOpenChange,
    onImageError,
  },
  ref,
) {
  const isNotion = variant === 'notion';
  const resolvedPlaceholder =
    placeholder ?? (isNotion ? "Type '/' for commands, or start writing..." : 'Write something...');

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ref 包装错误回调：extensions 仅在首次渲染创建，避免闭包捕获陈旧的 prop
  const imageErrorRef = useRef(onImageError);
  imageErrorRef.current = onImageError;

  /** 校验 + 读取 base64 + 插入图片节点（上传按钮 / 拖拽 / 粘贴共用） */
  function insertImageFiles(ed: Editor, files: File[], pos?: number) {
    files.forEach((file) => {
      const error = validateImageFile(file);
      if (error) {
        imageErrorRef.current?.(error);
        return;
      }
      readImageAsBase64(file)
        .then((src) => {
          if (pos != null) {
            ed.chain().focus().insertContentAt(pos, { type: 'image', attrs: { src } }).run();
          } else {
            ed.chain().focus().setImage({ src }).run();
          }
        })
        .catch(() => imageErrorRef.current?.('Failed to read image file'));
    });
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: resolvedPlaceholder }),
      CharacterCount.configure({ limit: maxChars ?? null }),
      // notion 变体专属扩展（default/minimal/full 路径零影响）
      ...(isNotion
        ? [
            // 斜杠命令菜单（透传开/关回调）
            SlashMenuExtension.configure({ onOpenChange: onSlashMenuOpenChange }),
            // 表格四件套（table/row/header/cell），列宽可拖拽
            TableKit.configure({ table: { resizable: true } }),
            // 图片（允许 base64 dataURL）
            Image.configure({ allowBase64: true }),
            // 拖拽 / 粘贴图片文件 → base64 插入
            FileHandler.configure({
              allowedMimeTypes: IMAGE_MIME_TYPES,
              onDrop: (ed, files, pos) => insertImageFiles(ed, files, pos),
              onPaste: (ed, files) => insertImageFiles(ed, files),
            }),
          ]
        : []),
    ],
    // notion 变体：为 ProseMirror 根节点附加无边框排版类
    ...(isNotion
      ? { editorProps: { attributes: { class: 'tiptap--notion' } } }
      : {}),
    content: value,
    // React 19 SSR：避免 hydration mismatch（错误 418），客户端挂载后再渲染编辑器内容
    immediatelyRender: false,
    // 每个 transaction 后重渲染：纯格式化操作（加粗/斜体等）不改变纯文本，
    // 外层 onChange 的 setState 会被同值跳过，必须靠此选项刷新 isActive / 工具栏状态
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML(), e.getText());
    },
  });

  useImperativeHandle(ref, () => ({
    focus: () => editor?.chain().focus().run(),
    clearContent: () => editor?.commands.clearContent(true),
  }));

  const buttons = TOOLBAR_BUTTONS.filter((b) => !b.fullOnly || toolbar === 'full');
  const bubbleButtons = TOOLBAR_BUTTONS.filter((b) => BUBBLE_MENU_KEYS.includes(b.key));
  // 稳定化 BubbleMenu 的 options 引用：BubbleMenu 内部 effect 依赖 options，
  // 若每次渲染都产生新对象，会触发 updateOptions transaction，
  // 配合 shouldRerenderOnTransaction: true 将引发无限渲染循环，导致按钮激活高亮无法刷新
  const bubbleMenuOptions = useMemo(() => ({ placement: 'top' as const }), []);

  return (
    <div className={`tiptap-shell${isNotion ? ' tiptap-shell--notion' : ''}`}>
      {/* 工具栏（notion 变体隐藏） */}
      {editor && !isNotion && (
        <div className="tiptap-toolbar" role="toolbar" aria-label="Text formatting">
          {buttons.map((btn) => {
            const active = btn.isActive?.(editor) ?? false;
            const disabled = btn.isDisabled?.(editor) ?? false;
            return (
              <button
                key={btn.key}
                type="button"
                title={btn.title}
                aria-pressed={active}
                disabled={disabled}
                className={`tiptap-toolbar-btn${active ? ' is-active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => btn.run(editor)}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      )}

      {/* notion 变体：轻量工具条（图片上传）+ TOC 竖条 + 选区气泡菜单 */}
      {isNotion && (
        <div className="tiptap-notion-tools">
          <button
            type="button"
            className="tiptap-notion-tool-btn"
            title="Upload image (PNG / JPEG / GIF / WebP, ≤2MB)"
            aria-label="Upload image"
            onClick={() => fileInputRef.current?.click()}
          >
            ⊞
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (editor && file) insertImageFiles(editor, [file]);
              e.target.value = '';
            }}
          />
        </div>
      )}
      {editor && isNotion && <TocRail editor={editor} scrollRef={scrollRef} />}
      {editor && isNotion && (
        <BubbleMenu editor={editor} options={bubbleMenuOptions} className="bubble-menu">
          {bubbleButtons.map((btn) => {
            const active = btn.isActive?.(editor) ?? false;
            return (
              <button
                key={btn.key}
                type="button"
                title={btn.title}
                aria-pressed={active}
                className={`bubble-menu-btn${active ? ' is-active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => btn.run(editor)}
              >
                {btn.label}
              </button>
            );
          })}
        </BubbleMenu>
      )}

      {/* 编辑区：notion 变体包一层滚动容器（min/max 高度 + 内部滚动 + TOC 监听目标） */}
      <div
        ref={isNotion ? scrollRef : undefined}
        className={`tiptap-editor-content${isNotion ? ' post-editor-scroll' : ''}`}
        style={isNotion ? undefined : { minHeight }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

export default TiptapEditor;

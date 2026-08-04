/**
 * SlashMenuExtension —— Notion-like 斜杠命令菜单（基于 @tiptap/suggestion）
 *
 * 特性：
 *  - 输入 `/` 触发，按后续 query 实时过滤命令列表（支持名称 / 关键词 / 中文）
 *  - 弹层自写 `position: fixed` 定位：取 props.clientRect() 坐标，
 *    菜单超出视口底部时自动翻转到光标上方（不依赖 tippy / floating-ui）
 *  - 菜单组件通过 ReactRenderer 挂载，键盘交互（↑↓ / Enter / Esc）由列表组件处理
 *  - 适配 @tiptap/suggestion v3 异步机制：onStart 收到的 items 恒为空（loading: true），
 *    因此 onStart 无条件创建组件（空/加载态），异步解析完成后由 onUpdate 送达真实 items
 *  - 每个命令先 deleteRange 删除 `/xxx` 触发文本，再执行对应节点切换
 */
import { Extension, type Editor, type Range } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import { Suggestion, type SuggestionOptions } from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import SlashMenuList, { type SlashMenuListHandle, type SlashMenuListProps } from './SlashMenuList';
import { pickImageFile } from './imageUtils';

/* ── 命令项定义 ── */
export interface SlashCommandItem {
  key: string;
  title: string;
  description: string;
  /** HUD mono 图标字符 */
  icon: string;
  /** 过滤用关键词（名称之外的别名） */
  keywords: string[];
  command: (ctx: { editor: Editor; range: Range }) => void;
}

/** 斜杠菜单命令列表（Text / H1-H3 / Quote / Code Block / Lists / Divider） */
export const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    key: 'text', title: 'Text', description: 'Just start writing with plain text.',
    icon: 'T', keywords: ['paragraph', 'plain', '段落', '文本'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('paragraph').run();
    },
  },
  {
    key: 'heading1', title: 'Heading 1', description: 'Big section heading.',
    icon: 'H1', keywords: ['h1', 'title', '标题', '大字'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
    },
  },
  {
    key: 'heading2', title: 'Heading 2', description: 'Medium section heading.',
    icon: 'H2', keywords: ['h2', 'subtitle', '标题'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
    },
  },
  {
    key: 'heading3', title: 'Heading 3', description: 'Small section heading.',
    icon: 'H3', keywords: ['h3', '标题'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
    },
  },
  {
    key: 'quote', title: 'Quote', description: 'Capture a quote.',
    icon: '"', keywords: ['blockquote', '引用'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    key: 'codeBlock', title: 'Code Block', description: 'Capture a code snippet.',
    icon: '{ }', keywords: ['code', 'pre', '代码块'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    key: 'bulletList', title: 'Bullet List', description: 'Create a simple bulleted list.',
    icon: '•', keywords: ['ul', 'unordered', '列表'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    key: 'orderedList', title: 'Numbered List', description: 'Create a list with numbering.',
    icon: '1.', keywords: ['ol', 'ordered', '列表', '编号'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    key: 'divider', title: 'Divider', description: 'Visually divide blocks.',
    icon: '—', keywords: ['hr', 'horizontal rule', '分割线', '分隔'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    key: 'table', title: 'Table', description: 'Insert a 3×3 table with header row.',
    icon: '⊞', keywords: ['grid', '表格'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
  {
    key: 'image', title: 'Image', description: 'Upload an image from your device (≤2MB).',
    icon: '▣', keywords: ['picture', 'photo', 'img', '图片'],
    command: ({ editor, range }) => {
      // 触发隐藏 file input；选中后读取 base64 插入图片节点
      // 校验失败经 IMAGE_ERROR_EVENT 由外层 Toast；取消选择保留 /image 触发文本
      pickImageFile((src) => {
        editor.chain().focus().deleteRange(range).setImage({ src }).run();
      });
    },
  },
];

/** 按 query 过滤命令：匹配标题 / 关键词（不区分大小写） */
function filterCommands(query: string): SlashCommandItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return SLASH_COMMANDS;
  return SLASH_COMMANDS.filter((item) => {
    if (item.title.toLowerCase().includes(q)) return true;
    if (item.key.toLowerCase().includes(q)) return true;
    return item.keywords.some((kw) => kw.toLowerCase().includes(q) || q.includes(kw.toLowerCase()));
  });
}

/* ── 独立 pluginKey，避免与其他 suggestion 插件冲突 ── */
export const SlashMenuPluginKey = new PluginKey('slashMenu');

/** 弹层与光标间距（px） */
const MENU_GAP = 6;
const VIEWPORT_PADDING = 8;

/** 根据光标 clientRect 计算 fixed 定位；空间不足时翻转到上方 */
function positionMenu(el: HTMLElement, clientRect: (() => DOMRect | null) | null | undefined) {
  const rect = clientRect?.();
  if (!rect) return;
  // 隐藏状态下先显示以便测量尺寸
  el.style.visibility = 'hidden';
  el.style.position = 'fixed';
  el.style.display = 'block';

  const menuWidth = el.offsetWidth || 280;
  const menuHeight = el.offsetHeight || 320;

  let top = rect.bottom + MENU_GAP;
  if (top + menuHeight > window.innerHeight - VIEWPORT_PADDING) {
    // 翻转到光标上方；仍放不下时贴近视口顶部
    top = Math.max(VIEWPORT_PADDING, rect.top - menuHeight - MENU_GAP);
  }
  let left = rect.left;
  if (left + menuWidth > window.innerWidth - VIEWPORT_PADDING) {
    left = Math.max(VIEWPORT_PADDING, window.innerWidth - menuWidth - VIEWPORT_PADDING);
  }

  el.style.top = `${top}px`;
  el.style.left = `${left}px`;
  el.style.visibility = 'visible';
}

/* ── Extension ── */
export interface SlashMenuOptions {
  suggestion: Partial<SuggestionOptions>;
  /** 菜单开/关回调（供外层感知，如全屏 Esc 退出判断） */
  onOpenChange?: (open: boolean) => void;
}

/** 创建 suggestion render：管理 ReactRenderer 生命周期与 fixed 定位 */
function createRender(onOpenChange?: (open: boolean) => void) {
  return () => {
    let component: ReactRenderer<SlashMenuListHandle, SlashMenuListProps> | null = null;

    const rendererProps = (props: any): SlashMenuListProps => ({
      items: props.items ?? [],
      command: props.command,
      loading: props.loading ?? false,
    });

    const mount = (props: any) => {
      component = new ReactRenderer<SlashMenuListHandle, SlashMenuListProps>(SlashMenuList, {
        editor: props.editor,
        props: rendererProps(props),
      });
      const el = component.element as HTMLElement;
      el.classList.add('slash-menu');
      document.body.appendChild(el);
      positionMenu(el, props.clientRect);
      onOpenChange?.(true);
    };

    const unmount = () => {
      if (component) {
        component.destroy();
        (component.element as HTMLElement)?.remove?.();
        component = null;
      }
      onOpenChange?.(false);
    };

    return {
      /** v3 异步机制：此时 items 恒为 []、loading: true，必须先创建组件，
       *  真实 items 由异步解析完成后经 onUpdate 送达 */
      onStart: (props: any) => {
        mount(props);
      },

      onUpdate: (props: any) => {
        if (!component) {
          // 防御：onStart 未执行时补建
          mount(props);
          return;
        }
        component.updateProps(rendererProps(props));
        positionMenu(component.element as HTMLElement, props.clientRect);
      },

      onKeyDown: (props: any) => {
        // Esc：suggestion 插件在 active 时会自行 dispatchExit 关闭，
        // 这里仅返回 true 表示已消费，避免重复退出
        if (props.event.key === 'Escape') return true;
        if (!component) return false;
        return component.ref?.onKeyDown?.(props) ?? false;
      },

      onExit: () => {
        unmount();
      },
    };
  };
}

export const SlashMenuExtension = Extension.create<SlashMenuOptions>({
  name: 'slashMenu',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        allowSpaces: false,
        pluginKey: SlashMenuPluginKey,

        items: ({ query }) => filterCommands(query),

        command: ({ editor, range, props }) => {
          (props as SlashCommandItem).command({ editor, range });
        },
      },
      onOpenChange: undefined,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        // render 在此注入：可访问 this.options.onOpenChange（不在 addOptions 默认值中引用 this.options）
        render: createRender(this.options.onOpenChange),
      }),
    ];
  },
});

export default SlashMenuExtension;

/**
 * SlashMenuList —— 斜杠命令菜单 UI（HUD 风格深色卡片）
 *
 * 交互：
 *  - ↑/↓ 切换选中项（金色高亮），Enter 执行命令（Esc 由 suggestion 插件统一处理）
 *  - 选中项变化时自动 scrollIntoView
 *  - 通过 forwardRef 暴露 onKeyDown 供 @tiptap/suggestion 的 render 转发按键
 *  - v3 异步机制：初始 items 为空 + loading，解析完成后才填充
 */
'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { SuggestionKeyDownProps } from '@tiptap/suggestion';
import type { SlashCommandItem } from './SlashMenuExtension';

export interface SlashMenuListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  /** items 异步解析中（v3 suggestion 机制） */
  loading?: boolean;
}

export interface SlashMenuListHandle {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

const SlashMenuList = forwardRef<SlashMenuListHandle, SlashMenuListProps>(
  function SlashMenuList({ items, command, loading = false }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // items 变化（query 过滤）时重置选中项
    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    /** 选中项滚动进可视区域 */
    useEffect(() => {
      const el = containerRef.current?.querySelector(
        '[data-slash-index="' + selectedIndex + '"]',
      ) as HTMLElement | null;
      el?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    function selectItem(index: number) {
      const item = items[index];
      if (item) command(item);
    }

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: SuggestionKeyDownProps) => {
        switch (event.key) {
          case 'ArrowUp':
            setSelectedIndex((prev) => (prev + items.length - 1) % Math.max(items.length, 1));
            return true;
          case 'ArrowDown':
            setSelectedIndex((prev) => (prev + 1) % Math.max(items.length, 1));
            return true;
          case 'Enter':
            selectItem(selectedIndex);
            return true;
          default:
            return false;
        }
      },
    }));

    if (items.length === 0) {
      return (
        <div className="slash-menu-empty font-mono">
          {loading ? (
            'Loading…'
          ) : (
            <>
              No results — press <span className="slash-menu-kbd">Esc</span> to close
            </>
          )}
        </div>
      );
    }

    return (
      <div ref={containerRef} className="slash-menu-body" role="listbox" aria-label="Slash commands">
        {/* 菜单头：HUD mono 标签 */}
        <div className="slash-menu-header">
          <span className="slash-menu-header-dot" />
          COMMANDS
          <span className="slash-menu-header-hint">↑↓ · ↵ · ESC</span>
        </div>

        <div className="slash-menu-list">
          {items.map((item, index) => {
            const active = index === selectedIndex;
            return (
              <button
                key={item.key}
                type="button"
                data-slash-index={index}
                role="option"
                aria-selected={active}
                className={`slash-menu-item${active ? ' is-active' : ''}`}
                onClick={() => selectItem(index)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="slash-menu-item-icon">{item.icon}</span>
                <span className="slash-menu-item-text">
                  <span className="slash-menu-item-title">{item.title}</span>
                  <span className="slash-menu-item-desc">{item.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);

export default SlashMenuList;

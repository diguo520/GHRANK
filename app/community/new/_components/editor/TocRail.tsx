/**
 * TocRail —— Notion 官方同款右侧 TOC 进度竖条
 *
 * 行为：
 *  - 从 editor.state.doc.descendants() 收集 heading（text/level），editor update 时刷新
 *  - 竖条：每个标题一条 2px 短横线（H1=16px / H2=12px / H3=10px 带左缩进），
 *    滚动位置驱动 active 高亮（对比 heading DOM 的 getBoundingClientRect）
 *  - 悬停竖条向左滑出 ~250px TOC 弹层（HUD 深色卡片，active 金色）
 *  - 点击标题 → scrollIntoView 平滑滚动到对应 heading
 *  - 无标题时不渲染
 *
 * 定位：依赖最近的 positioned 祖先 —— 普通模式为编辑器卡片（relative），
 * 全屏模式为 .post-editor-fullscreen（fixed），两种模式下均贴右缘
 */
'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';
import type { Editor } from '@tiptap/react';

interface TocHeading {
  text: string;
  level: number;
}

export interface TocRailProps {
  editor: Editor;
  /** 编辑器滚动容器（.post-editor-scroll） */
  scrollRef: RefObject<HTMLDivElement | null>;
}

/** 滚动判定阈值：heading 顶部越过容器顶部 24px 即视为当前章节 */
const ACTIVE_OFFSET = 24;

export default function TocRail({ editor, scrollRef }: TocRailProps) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  /** 从文档收集标题节点 */
  const collect = useCallback(() => {
    const list: TocHeading[] = [];
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'heading') {
        list.push({ text: node.textContent, level: node.attrs.level });
      }
    });
    setHeadings(list);
  }, [editor]);

  useEffect(() => {
    collect();
    editor.on('update', collect);
    return () => {
      editor.off('update', collect);
    };
  }, [editor, collect]);

  /** DOM 中的 heading 元素（与文档顺序一致） */
  const getHeadingEls = useCallback((): HTMLElement[] => {
    return Array.from(scrollRef.current?.querySelectorAll('h1, h2, h3') ?? []);
  }, [scrollRef]);

  /** 滚动位置驱动 active 判定 */
  const updateActive = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const els = getHeadingEls();
    if (!els.length) return;
    const top = scroller.getBoundingClientRect().top;
    let idx = 0;
    els.forEach((el, i) => {
      if (el.getBoundingClientRect().top - top <= ACTIVE_OFFSET) idx = i;
    });
    setActiveIndex(idx);
  }, [scrollRef, getHeadingEls]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    scroller.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
    return () => scroller.removeEventListener('scroll', updateActive);
  }, [scrollRef, updateActive, headings]);

  function scrollToHeading(index: number) {
    const el = getHeadingEls()[index];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveIndex(index);
  }

  if (headings.length === 0) return null;

  return (
    <nav className="toc-rail" aria-label="Table of contents">
      {/* 进度竖条：每个标题一条短横线 */}
      <div className="toc-rail-ticks">
        {headings.map((h, i) => (
          <button
            key={i}
            type="button"
            title={h.text || 'Untitled'}
            aria-label={`Scroll to: ${h.text || 'Untitled'}`}
            className={`toc-rail-tick lvl-${Math.min(h.level, 3)}${i === activeIndex ? ' is-active' : ''}`}
            onClick={() => scrollToHeading(i)}
          />
        ))}
      </div>

      {/* 悬停展开的 TOC 弹层 */}
      <div className="toc-rail-popup">
        <div className="toc-rail-popup-header">
          <span className="toc-rail-popup-dot" />
          ON THIS PAGE
        </div>
        <div className="toc-rail-popup-list">
          {headings.map((h, i) => (
            <button
              key={i}
              type="button"
              className={`toc-rail-link lvl-${Math.min(h.level, 3)}${i === activeIndex ? ' is-active' : ''}`}
              onClick={() => scrollToHeading(i)}
            >
              {h.text || 'Untitled'}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

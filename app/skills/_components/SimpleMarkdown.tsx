/**
 * SimpleMarkdown —— 轻量 Markdown 渲染器
 * 迁移自 skills.js 的 simpleMarkdown 函数
 * 支持：YAML frontmatter 移除、代码块、标题、列表、段落、行内代码/加粗/斜体/链接
 * 不使用 dangerouslySetInnerHTML，直接输出 React 元素
 */

import { type ReactNode, type CSSProperties } from 'react';
import CodeBlock from '@/components/shared/CodeBlock';

/* ═══════════════════════════════════════════════════════════════
   Markdown 块类型定义
   ═══════════════════════════════════════════════════════════════ */

type BlockType = 'code' | 'h1' | 'h2' | 'h3' | 'h4' | 'ul' | 'ol' | 'p';

interface MarkdownBlock {
  type: BlockType;
  lang?: string;
  text?: string;
  items?: string[];
}

/* ═══════════════════════════════════════════════════════════════
   解析器
   ═══════════════════════════════════════════════════════════════ */

/** 移除 YAML frontmatter（文档开头的 ---...--- 块） */
function stripFrontmatter(md: string): string {
  return md.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
}

/** 解析文本段为块（标题、列表、段落），结果追加到 blocks 数组 */
function parseTextSegment(text: string, blocks: MarkdownBlock[]): void {
  const lines = text.split('\n');
  let currentPara: string[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

  /** 将累积的段落文本 flush 为一个 p 块 */
  function flushPara() {
    if (currentPara.length > 0) {
      blocks.push({ type: 'p', text: currentPara.join('\n') });
      currentPara = [];
    }
  }

  /** 将累积的列表项 flush 为一个 ul/ol 块 */
  function flushList() {
    if (currentList) {
      blocks.push({ type: currentList.type, items: currentList.items });
      currentList = null;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // 空行 —— 分隔段落和列表
    if (!trimmed) {
      flushPara();
      flushList();
      continue;
    }

    // 标题检测（# ~ ####）
    const headerMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      flushPara();
      flushList();
      const level = headerMatch[1].length;
      blocks.push({ type: `h${level}` as BlockType, text: headerMatch[2] });
      continue;
    }

    // 无序列表项（- 或 * 开头）
    const ulMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      flushPara();
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // 有序列表项（数字. 开头）
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      flushPara();
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[1]);
      continue;
    }

    // 普通文本行 —— 累积到当前段落
    flushList();
    currentPara.push(trimmed);
  }

  flushPara();
  flushList();
}

/** 将完整 Markdown 解析为块数组（先提取代码块，再解析文本段） */
function parseBlocks(md: string): MarkdownBlock[] {
  const stripped = stripFrontmatter(md);
  const blocks: MarkdownBlock[] = [];
  const codeRe = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = codeRe.exec(stripped)) !== null) {
    // 代码块之前的文本
    if (match.index > lastIdx) {
      parseTextSegment(stripped.slice(lastIdx, match.index), blocks);
    }
    blocks.push({
      type: 'code',
      lang: match[1] || '',
      text: match[2].replace(/^\n|\n$/g, ''),
    });
    lastIdx = match.index + match[0].length;
  }

  // 剩余文本
  if (lastIdx < stripped.length) {
    parseTextSegment(stripped.slice(lastIdx), blocks);
  }

  return blocks;
}

/* ═══════════════════════════════════════════════════════════════
   行内元素解析
   ═══════════════════════════════════════════════════════════════ */

/** 解析行内元素：行内代码、加粗、斜体、链接，返回 React 节点数组 */
function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  // 组合正则：依次匹配行内代码 / 加粗 / 斜体 / 链接
  const combined = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/;

  while (remaining.length > 0) {
    const match = combined.exec(remaining);
    if (!match) {
      nodes.push(remaining);
      break;
    }

    // 匹配前的纯文本
    if (match.index > 0) {
      nodes.push(remaining.slice(0, match.index));
    }

    if (match[1] !== undefined) {
      // 行内代码
      nodes.push(
        <code key={key++} style={inlineCodeStyle}>
          {match[1]}
        </code>,
      );
    } else if (match[2] !== undefined) {
      // 加粗
      nodes.push(<strong key={key++} style={{ color: 'var(--text)' }}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      // 斜体
      nodes.push(<em key={key++}>{match[3]}</em>);
    } else if (match[4] !== undefined) {
      // 链接
      nodes.push(
        <a key={key++} href={match[5]} style={linkStyle}>
          {match[4]}
        </a>,
      );
    }

    remaining = remaining.slice(match.index + match[0].length);
  }

  return nodes;
}

/* ═══════════════════════════════════════════════════════════════
   样式常量（匹配 skills.css 的 .skills-detail-readme 样式）
   ═══════════════════════════════════════════════════════════════ */

const inlineCodeStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  color: 'var(--gold)',
  fontSize: '12px',
};

const linkStyle: CSSProperties = {
  color: 'var(--gold)',
  textDecoration: 'none',
};

const headerBaseStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  color: 'var(--text)',
  margin: '24px 0 12px',
};

const paraStyle: CSSProperties = {
  color: 'var(--text-dim)',
  lineHeight: 1.7,
  margin: '0 0 12px',
};

const listStyle: CSSProperties = {
  color: 'var(--text-dim)',
  paddingLeft: '24px',
  marginBottom: '12px',
  lineHeight: 1.8,
  margin: '0 0 12px',
};

/* ═══════════════════════════════════════════════════════════════
   块渲染
   ═══════════════════════════════════════════════════════════════ */

/** 渲染单个 Markdown 块为 React 元素 */
function renderBlock(block: MarkdownBlock, index: number, totalBlocks: number): ReactNode {
  const isFirst = index === 0;
  const isHeader = block.type === 'h1' || block.type === 'h2' || block.type === 'h3' || block.type === 'h4';
  // 首个标题去除上边距（匹配 CSS :first-child 规则）
  const headerMarginTop = isFirst && isHeader ? { marginTop: 0 } : {};

  switch (block.type) {
    case 'code':
      return (
        <CodeBlock key={index} code={block.text ?? ''} lang={block.lang || 'text'} />
      );
    case 'h1':
      return (
        <h1 key={index} style={{ ...headerBaseStyle, fontSize: '26px', ...headerMarginTop }}>
          {parseInline(block.text!)}
        </h1>
      );
    case 'h2':
      return (
        <h2 key={index} style={{ ...headerBaseStyle, fontSize: '20px', ...headerMarginTop }}>
          {parseInline(block.text!)}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={index} style={{ ...headerBaseStyle, fontSize: '16px', ...headerMarginTop }}>
          {parseInline(block.text!)}
        </h3>
      );
    case 'h4':
      return (
        <h4 key={index} style={{ ...headerBaseStyle, fontSize: '14px', ...headerMarginTop }}>
          {parseInline(block.text!)}
        </h4>
      );
    case 'ul':
      return (
        <ul key={index} style={listStyle}>
          {block.items!.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
        </ul>
      );
    case 'ol':
      return (
        <ol key={index} style={listStyle}>
          {block.items!.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
        </ol>
      );
    case 'p':
      return <p key={index} style={paraStyle}>{parseInline(block.text!)}</p>;
    default:
      return null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   主组件
   ═══════════════════════════════════════════════════════════════ */

interface SimpleMarkdownProps {
  /** Markdown 原始文本 */
  content: string;
}

export default function SimpleMarkdown({ content }: SimpleMarkdownProps) {
  const blocks = parseBlocks(content);
  return (
    <>
      {blocks.map((block, index) => renderBlock(block, index, blocks.length))}
    </>
  );
}

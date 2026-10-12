/**
 * CodeBlock —— 统一代码框组件
 * 功能：基于正则的轻量语法高亮（无外部依赖）+ Copy 按钮 + 超长折叠
 * 支持语言：TypeScript/JavaScript/JSX、Python、Shell、HTML、CSS，其余走 fallback
 */
'use client';

import { useMemo, useState } from 'react';
import { App, Button } from 'antd';
import { Check as LucideCheck, Copy as LucideCopy, ChevronUp as LucideChevronUp, ChevronDown as LucideChevronDown } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Props
   ═══════════════════════════════════════════════════════════════ */

interface CodeBlockProps {
  code: string;
  lang?: string;
  /** 折叠阈值，默认 15 行 */
  collapseThreshold?: number;
}

/* ═══════════════════════════════════════════════════════════════
   语法高亮：token 颜色 + 各语言规则集
   ═══════════════════════════════════════════════════════════════ */

const TOKEN_COLORS: Record<string, string> = {
  keyword: '#A371F7', // 关键字 —— 紫色
  string: '#3FB950', // 字符串 —— 绿色
  number: '#E85D04', // 数字 —— 橙色
  comment: '#6e7681', // 注释 —— 灰色
  func: '#58A6FF', // 函数/方法 —— 蓝色
  tag: '#7EE787', // 标签/属性 —— 浅绿
};

interface Rule {
  re: RegExp;
  cls: keyof typeof TOKEN_COLORS;
}

/** TypeScript / JavaScript 规则 */
const TS_RULES: Rule[] = [
  { re: /\/\/.*|\/\*[\s\S]*?\*\//g, cls: 'comment' },
  { re: /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g, cls: 'string' },
  {
    re: /\b(?:const|let|var|function|return|import|export|from|default|class|interface|type|extends|implements|new|if|else|for|while|switch|case|break|continue|async|await|try|catch|finally|throw|this|null|undefined|true|false|typeof|instanceof|in|of|as|enum|readonly|static|void)\b/g,
    cls: 'keyword',
  },
  { re: /\b\d[\d_]*(?:\.\d+)?\b/g, cls: 'number' },
  { re: /\b[A-Za-z_$][\w$]*(?=\s*\()/g, cls: 'func' },
];

/** JSX 规则（标签 + JS 语法） */
const JSX_RULES: Rule[] = [
  { re: /\/\/.*|\/\*[\s\S]*?\*\//g, cls: 'comment' },
  { re: /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g, cls: 'string' },
  { re: /<\/?[A-Za-z][\w.-]*|\/?>/g, cls: 'tag' },
  {
    re: /\b(?:const|let|var|function|return|import|export|from|default|class|interface|type|if|else|for|while|async|await|null|undefined|true|false)\b/g,
    cls: 'keyword',
  },
  { re: /\b\d[\d_]*(?:\.\d+)?\b/g, cls: 'number' },
  { re: /\b[A-Za-z_$][\w$]*(?=\s*\()/g, cls: 'func' },
];

/** Python 规则 */
const PYTHON_RULES: Rule[] = [
  { re: /#.*/g, cls: 'comment' },
  { re: /"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|f"(?:[^"\\\n]|\\.)*"/g, cls: 'string' },
  {
    re: /\b(?:def|return|import|from|class|if|elif|else|for|while|in|not|and|or|is|None|True|False|lambda|with|as|try|except|finally|raise|pass|yield|async|await|global|self)\b/g,
    cls: 'keyword',
  },
  { re: /\b\d[\d_]*(?:\.\d+)?\b/g, cls: 'number' },
  { re: /\b[A-Za-z_]\w*(?=\s*\()/g, cls: 'func' },
];

/** Shell / Bash 规则 */
const SHELL_RULES: Rule[] = [
  { re: /#.*/g, cls: 'comment' },
  { re: /"(?:[^"\\\n]|\\.)*"|'[^'\n]*'/g, cls: 'string' },
  {
    re: /\b(?:sudo|cd|ls|npm|npx|pnpm|yarn|git|pip|pip3|python|python3|node|curl|wget|mkdir|rm|cp|mv|echo|cat|export|source|chmod|chown|docker|brew|apt|apt-get|grep|sed|awk|touch|kill|tar|unzip|ssh)\b/g,
    cls: 'keyword',
  },
  { re: /\s--?[\w-]+/g, cls: 'func' },
  { re: /\$\{?\w+\}?/g, cls: 'tag' },
];

/** HTML / XML 规则 */
const HTML_RULES: Rule[] = [
  { re: /<!--[\s\S]*?-->/g, cls: 'comment' },
  { re: /"(?:[^"\\\n]|\\.)*"|'[^'\n]*'/g, cls: 'string' },
  { re: /<\/?[A-Za-z][\w.-]*|\/?>/g, cls: 'tag' },
  { re: /\b[\w-]+(?==)/g, cls: 'func' },
];

/** CSS 规则 */
const CSS_RULES: Rule[] = [
  { re: /\/\*[\s\S]*?\*\//g, cls: 'comment' },
  { re: /"(?:[^"\\\n]|\\.)*"|'[^'\n]*'/g, cls: 'string' },
  { re: /@[\w-]+/g, cls: 'keyword' },
  { re: /#[0-9a-fA-F]{3,8}\b/g, cls: 'number' },
  { re: /\b[a-zA-Z-]+(?=\s*:)/g, cls: 'func' },
  { re: /\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms|fr|deg)?\b/g, cls: 'number' },
  { re: /[.#][\w-]+/g, cls: 'tag' },
];

/** 默认 fallback：字符串 + 注释 */
const FALLBACK_RULES: Rule[] = [
  { re: /\/\/.*|\/\*[\s\S]*?\*\/|#.*/g, cls: 'comment' },
  { re: /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g, cls: 'string' },
];

/** 语言别名 → 规则集 */
function getRules(lang?: string): Rule[] {
  const l = (lang || '').trim().toLowerCase();
  if (l === 'tsx' || l === 'typescript' || l === 'ts') return TS_RULES;
  if (l === 'jsx') return JSX_RULES;
  if (l === 'js' || l === 'javascript' || l === 'node') return TS_RULES;
  if (l === 'py' || l === 'python') return PYTHON_RULES;
  if (l === 'sh' || l === 'bash' || l === 'shell' || l === 'zsh' || l === 'terminal' || l === 'console') return SHELL_RULES;
  if (l === 'html' || l === 'xml' || l === 'svg') return HTML_RULES;
  if (l === 'css' || l === 'scss' || l === 'less') return CSS_RULES;
  return FALLBACK_RULES;
}

interface Token {
  text: string;
  cls: string | null;
}

/** 按规则集对单行代码做 token 切分（取最靠前的匹配，依次推进） */
function tokenizeLine(line: string, rules: Rule[]): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  while (pos < line.length) {
    let bestIdx = -1;
    let bestLen = 0;
    let bestCls: keyof typeof TOKEN_COLORS = 'keyword';
    for (const rule of rules) {
      rule.re.lastIndex = pos;
      const m = rule.re.exec(line);
      if (m && (bestIdx === -1 || m.index < bestIdx)) {
        bestIdx = m.index;
        bestLen = Math.max(m[0].length, 1);
        bestCls = rule.cls;
        if (m.index === pos) break; // 已是最靠前
      }
    }
    if (bestIdx === -1) {
      tokens.push({ text: line.slice(pos), cls: null });
      break;
    }
    if (bestIdx > pos) tokens.push({ text: line.slice(pos, bestIdx), cls: null });
    tokens.push({ text: line.slice(bestIdx, bestIdx + bestLen), cls: bestCls });
    pos = bestIdx + bestLen;
  }
  return tokens;
}

/* ═══════════════════════════════════════════════════════════════
   组件
   ═══════════════════════════════════════════════════════════════ */

const LINE_HEIGHT = 13 * 1.6; // fontSize 13px × line-height 1.6
const CODE_PADDING = 16;

export default function CodeBlock({ code, lang = 'text', collapseThreshold = 15 }: CodeBlockProps) {
  const lines = useMemo(() => code.replace(/\n$/, '').split('\n'), [code]);
  const tokenized = useMemo(() => {
    const rules = getRules(lang);
    return lines.map((line) => tokenizeLine(line, rules));
  }, [lines, lang]);

  // 全站统一 Toast：antd App.useApp().message（需在 <App> 组件内使用，layout.tsx 已配置）
  const { message } = App.useApp();

  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const collapsible = lines.length > collapseThreshold;
  const collapsed = collapsible && !expanded;
  const maxHeight = collapsed ? collapseThreshold * LINE_HEIGHT + CODE_PADDING * 2 : undefined;

  /** 复制到剪贴板：按钮只留勾，提示走全站统一 antd message */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // clipboard API 不可用时的兜底
      const ta = document.createElement('textarea');
      ta.value = code;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    message.success('Copied to clipboard', 2.2);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="code-block group relative my-4"
      style={{ background: '#0d1117', border: '1px solid var(--border-subtle, #21262d)' }}
    >
      {/* ── 顶部栏：语言名 + 行数 + Copy 按钮 ── */}
      <div
        className="relative flex items-center justify-between px-4 py-2"
        style={{ background: '#161b22', borderBottom: '1px solid #21262d' }}
      >
        <span
          className="font-mono text-[10px] font-semibold uppercase"
          style={{ color: '#8b949e', letterSpacing: '0.08em' }}
        >
          {lang}
        </span>
        {/* 行数文字 —— ml-auto 推到右侧区域，与左侧语言标签拉开距离，
            与 Copy 按钮之间保留 10px 间距 */}
        <span
          className="ml-auto shrink-0 font-mono text-[9px]"
          style={{ color: '#8b949e', letterSpacing: '0.04em', marginRight: '10px' }}
        >
          {lines.length} lines
        </span>
        {/* Copy 按钮 —— 紧贴行数文字右侧（行数已 ml-auto 占据剩余空间），
            避免 absolute 定位与 .tooltip-trigger 的 position:relative 冲突 */}
        <Button
          type="text"
          onClick={handleCopy}
          data-tooltip="Copy code"
          className="tooltip-trigger flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 focus-visible:opacity-100 group-hover:opacity-100"
          style={{
            padding: '4px 6px',
            height: 'auto',
            background: copied ? 'rgba(63,185,80,0.1)' : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px',
            opacity: copied ? 1 : undefined,
            color: copied ? '#3FB950' : '#8b949e',
          }}
        >
          {copied ? (
            // 复制成功只保留勾图标，不再显示 Copied 文字；
            // 文字提示统一走 antd message.toast
            <LucideCheck size={12} strokeWidth={2} />
          ) : (
            <LucideCopy size={12} strokeWidth={1.5} />
          )}
        </Button>
      </div>

      {/* ── 代码区域（可折叠）
           注意：代码截断渐隐 和 折叠箭头 是两个独立视觉单元，
           避免把箭头条带盖在代码上方造成"双重渐隐 + 分界线"
           ┌──────────────────────┐
           │ 代码内容（maxHeight 截断）│
           │ ── 柔化截断线的渐隐层 ── │  ← 只在代码高度内柔化，不超界
           └──────────────────────┘
           [ 箭头条带（独立行，自带渐变+blur，与底部无缝衔接）] ← 不盖代码
      */}
      <div className="relative">
        <div
          className="overflow-hidden transition-[max-height] duration-300"
          style={{ maxHeight, overflowY: collapsed ? 'hidden' : 'auto', overflowX: 'auto' }}
        >
          <pre
            className="m-0 border-0 bg-transparent"
            style={{
              padding: `${CODE_PADDING}px`,
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              lineHeight: 1.6,
              color: '#e6edf3',
            }}
          >
            <code>
              {tokenized.map((lineTokens, i) => (
                <span key={i}>
                  {lineTokens.map((t, j) =>
                    t.cls ? (
                      <span key={j} style={{ color: TOKEN_COLORS[t.cls] }}>
                        {t.text}
                      </span>
                    ) : (
                      <span key={j}>{t.text}</span>
                    ),
                  )}
                  {'\n'}
                </span>
              ))}
            </code>
          </pre>
        </div>

        {/* 截断线柔化遮罩：只放在代码容器高度内，
           高度 60px，纯 alpha 渐变，不使用 backdrop-filter，
           作用：柔化 maxHeight 截断产生的硬切边 */}
        {collapsible && !expanded && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{
              height: '60px',
              background:
                'linear-gradient(to bottom, rgba(13,17,23,0) 0%, rgba(13,17,23,0.55) 60%, rgba(13,17,23,0.78) 100%)',
            }}
          />
        )}
      </div>

      {/* ── 折叠/展开按钮区（代码容器外部，独立一行，不再盖代码）
           —— 折叠态（未展开）：自带半透明渐变背景 + backdrop-filter，
              让箭头行与上方代码柔化遮罩之间做无缝融合，不再有"两层"感
           —— 展开态：透明背景，仅显示收起箭头 */}
      {collapsible && !expanded ? (
        <div
          className="relative flex items-end justify-center"
          style={{
            /* 箭头行自己的高度，独立于代码区域，不再额外盖在代码上 */
            height: '32px',
            paddingBottom: '6px',
            background:
              'linear-gradient(to bottom, rgba(13,17,23,0.78) 0%, rgba(13,17,23,0.92) 50%, rgba(13,17,23,1) 100%)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        >
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            data-tooltip={`Show more (${lines.length} lines)`}
            className="tooltip-trigger group/toggle flex items-center justify-center text-[#8b949e] transition-colors duration-150 hover:text-[var(--gold,#9D8CFF)]"
            style={{
              width: '20px',
              height: '16px',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              borderRadius: 0,
              background: 'transparent',
            }}
          >
            <LucideChevronDown size={14} strokeWidth={2.5} />
          </button>
        </div>
      ) : null}

      {collapsible && expanded ? (
        <div
          className="relative flex justify-center"
          style={{ padding: '6px 0' }}
        >
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            data-tooltip="Show less"
            className="tooltip-trigger group/toggle flex items-center justify-center text-[#8b949e] transition-colors duration-150 hover:text-[var(--gold,#9D8CFF)]"
            style={{
              width: '20px',
              height: '16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <LucideChevronUp size={14} strokeWidth={2.5} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

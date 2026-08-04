/**
 * SkillDetailClient —— 技能详情页客户端组件
 * 迁移自 skills.js 的 initDetailPage
 * 职责：技能元信息展示、安装命令切换/复制、README 渲染、文件浏览器、相关技能
 */

'use client';

import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import {
  skills as ALL_SKILLS,
  occupations as ALL_OCCUPATIONS,
  getSkill,
  getSkillByName,
  getOwner,
  getCategory,
  formatNumber,
  type Skill,
} from '../_data/skills-data';
import SimpleMarkdown from './SimpleMarkdown';
import { GitHubIcon, StarIcon, ClockIcon, CopyIcon, CheckIcon } from '../../_components/icons';

/* ═══════════════════════════════════════════════════════════════
   辅助函数
   ═══════════════════════════════════════════════════════════════ */

/** 技能文件（文件浏览器条目） */
interface SkillFile {
  name: string;
  path: string;
  isMain: boolean;
}

/** 从 README 中提取引用的 .md 文件列表 */
function extractFileList(readme: string): SkillFile[] {
  const files: SkillFile[] = [{ name: 'SKILL.md', path: 'SKILL.md', isMain: true }];
  const re = /\((?:\.\/|reference\/)?([^)\s]+\.md)\)/g;
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = re.exec(readme || '')) !== null) {
    const fileName = match[1].split('/').pop();
    if (fileName && fileName.toLowerCase() !== 'skill.md' && !seen.has(fileName)) {
      seen.add(fileName);
      files.push({ name: fileName, path: fileName, isMain: false });
    }
  }
  return files;
}

/** 摘要：引导文本 + 要点列表 */
interface Summary {
  lead: string;
  bullets: string[];
}

/** 从 README 和技能描述中提取摘要 */
function extractSummary(readme: string, skill: Skill): Summary {
  const body = (readme || '').replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
  let lead = skill.description || '';

  // 描述过长时，改用 README 正文首段作为引导
  if (lead.length > 200) {
    const bodyWithoutTitle = body.replace(/^#\s+.*\n+/, '');
    const paras = bodyWithoutTitle.split(/\n\n+/);
    for (const para of paras) {
      const p = para.trim();
      if (p && !/^#{1,6}\s/.test(p)) {
        lead = p.replace(/\n/g, ' ').trim();
        break;
      }
    }
  }

  let bullets: string[] = [];
  // 匹配 Markdown 表格行
  const tableMatch = body.match(/\|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|\s*\n\|[-:\s|]+\|\s*\n([\s\S]*?)(?=\n\n|\n##|$)/);
  if (tableMatch) {
    const rows = tableMatch[4].trim().split('\n').slice(0, 5);
    bullets = rows
      .map((row) => {
        const cols = row.split('|').map((c) => c.trim()).filter(Boolean);
        return cols[0] ? cols[0].replace(/\*\*/g, '') : '';
      })
      .filter(Boolean);
  }

  // 无表格时，用 tags 生成摘要要点
  if (bullets.length === 0 && skill.tags) {
    bullets = skill.tags.slice(0, 4).map((t) => `适用于 ${t} 场景`);
  }

  return { lead, bullets };
}

/** 查找职业名称（优先英文） */
function findOccupationName(occId: string): string {
  const occ = ALL_OCCUPATIONS.find((o) => o.id === occId);
  if (!occ) return 'N/A';
  return occ.nameEn || occ.name || occId;
}

/* ── 结构化内容解析（受 clawhub.ai 参考页启发） ── */

/** Key Fact 条目（标签 + 值） */
interface KeyFact {
  label: string;
  value: string;
}

/** 从 README 的 "## Key facts" 表格中提取键值对 */
function extractKeyFacts(readme: string): KeyFact[] {
  const body = (readme || '').replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
  const sectionMatch = body.match(/## Key facts\s*\n([\s\S]*?)(?=\n##\s|$)/);
  if (!sectionMatch) return [];

  const tableContent = sectionMatch[1];
  const rowRe = /^\|([^|\n]+)\|([^|\n]+)\|$/gm;
  const facts: KeyFact[] = [];
  let match: RegExpExecArray | null;
  while ((match = rowRe.exec(tableContent)) !== null) {
    const label = match[1].trim();
    const value = match[2].trim();
    // 跳过 Markdown 表格分隔行
    if (/^[-:\s|]+$/.test(label) || /^[-:\s|]+$/.test(value)) continue;
    if (label && value) facts.push({ label, value });
  }
  return facts;
}

/** 工作流步骤（标题 + 描述 + 代码块列表） */
interface WorkflowStep {
  title: string;
  description: string;
  codeBlocks: { lang: string; code: string }[];
}

/** 从 README 的 "## Usage workflow" 章节中按 ### 子标题拆分步骤 */
function extractWorkflowSteps(readme: string): WorkflowStep[] {
  const body = (readme || '').replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
  const sectionMatch = body.match(/## Usage workflow\s*\n([\s\S]*?)(?=\n##\s|$)/);
  if (!sectionMatch) return [];

  const content = sectionMatch[1];
  const steps: WorkflowStep[] = [];
  // 按 "### 1. xxx" 格式的子标题分割
  const stepRe = /### \d+\.\s+(.+?)\n([\s\S]*?)(?=\n### \d+\.|$)/g;
  let match: RegExpExecArray | null;
  while ((match = stepRe.exec(content)) !== null) {
    const title = match[1].trim();
    const stepBody = match[2].trim();

    // 描述 = 第一个代码块之前的文本
    const firstCodeIdx = stepBody.search(/```/);
    const description = firstCodeIdx >= 0 ? stepBody.slice(0, firstCodeIdx).trim() : stepBody;

    // 提取所有代码块
    const codeBlocks: { lang: string; code: string }[] = [];
    const codeRe = /```(\w*)\n?([\s\S]*?)```/g;
    let codeMatch: RegExpExecArray | null;
    while ((codeMatch = codeRe.exec(stepBody)) !== null) {
      codeBlocks.push({
        lang: codeMatch[1] || 'bash',
        code: codeMatch[2].replace(/^\n|\n$/g, ''),
      });
    }

    steps.push({ title, description, codeBlocks });
  }
  return steps;
}

/** 从 README 的 "## Safety rules" 章节中提取编号规则列表 */
function extractSafetyRules(readme: string): string[] {
  const body = (readme || '').replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
  const sectionMatch = body.match(/## Safety rules[^\n]*\n([\s\S]*?)(?=\n##\s|$)/);
  if (!sectionMatch) return [];

  const rules: string[] = [];
  const ruleRe = /^\d+\.\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = ruleRe.exec(sectionMatch[1])) !== null) {
    rules.push(match[1].trim());
  }
  return rules;
}

/** 从 README 的 "## Limitations" 章节中提取限制列表 */
function extractLimitations(readme: string): string[] {
  const body = (readme || '').replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
  const sectionMatch = body.match(/## Limitations\s*\n([\s\S]*?)(?=\n##\s|$)/);
  if (!sectionMatch) return [];

  const items: string[] = [];
  const itemRe = /^[-*]\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(sectionMatch[1])) !== null) {
    items.push(match[1].trim());
  }
  return items;
}

/** 查找相关技能（同 domain 或共享 category，按安装量降序） */
function findRelatedSkills(skill: Skill, limit = 4): Skill[] {
  return ALL_SKILLS
    .filter(
      (s) =>
        s.id !== skill.id &&
        (s.domain === skill.domain || s.category.some((c) => skill.category.includes(c))),
    )
    .sort((a, b) => b.installs - a.installs)
    .slice(0, limit);
}

/** 根据趋势排名计算升降箭头 */
function getTrend(trendingRank: number): { cls: string; arrow: string; value: string } {
  if (trendingRank <= 200) return { cls: 'up', arrow: '\u25B2', value: String(trendingRank) };
  if (trendingRank >= 300) return { cls: 'down', arrow: '\u25BC', value: String(500 - trendingRank) };
  return { cls: 'flat', arrow: '\u2014', value: '' };
}

/* ═══════════════════════════════════════════════════════════════
   样式常量
   ═══════════════════════════════════════════════════════════════ */

const breadcrumbStyle: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px 24px 0',
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  color: 'var(--text-muted)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textTransform: 'lowercase',
};

const sepStyle: CSSProperties = { color: 'var(--border)' };
const currentCrumbStyle: CSSProperties = { color: 'var(--text)' };

const heroStyle: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px 24px 0',
};

const titleWrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
  marginBottom: '10px',
};

const titleStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '42px',
  fontWeight: 800,
  color: 'var(--text)',
  letterSpacing: '-0.01em',
  lineHeight: 1.1,
  margin: 0,
};

const categoryBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '5px 12px',
  background: 'rgba(245, 197, 24, 0.08)',
  border: '1px solid rgba(245, 197, 24, 0.25)',
  color: 'var(--gold)',
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  borderRadius: '4px',
};

const githubLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '34px',
  height: '34px',
  marginLeft: '4px',
  color: 'var(--text-dim)',
  background: 'var(--surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '6px',
  transition: 'color 0.2s, border-color 0.2s, transform 0.2s',
};

const metaStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '16px',
};

const metaItemStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  color: 'var(--text-dim)',
};

const bodyStyle: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '28px 24px 48px',
  display: 'grid',
  gridTemplateColumns: '1fr 300px',
  gap: '32px',
  alignItems: 'start',
};

const mainColStyle: CSSProperties = {
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '28px',
};

const sectionHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '12px',
};

const sectionTitleStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  margin: 0,
};

const curatedHeadStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '14px',
};

const eyebrowStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--gold)',
  letterSpacing: '0.08em',
};

const toggleStyle: CSSProperties = {
  display: 'inline-flex',
  gap: '2px',
  background: 'var(--surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '6px',
  padding: '3px',
};

const toggleBtnBase: CSSProperties = {
  padding: '5px 12px',
  background: 'transparent',
  border: 'none',
  borderRadius: '4px',
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s',
};

const installBoxStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  overflow: 'hidden',
  minHeight: '40px',
};

const installCodeStyle: CSSProperties = {
  flex: 1,
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  color: 'var(--cyan)',
  padding: '9px 10px 9px 14px',
  lineHeight: 1.4,
  wordBreak: 'break-all',
  display: 'flex',
  alignItems: 'center',
};

const summaryLeadStyle: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '15px',
  color: 'var(--text-dim)',
  lineHeight: 1.7,
  margin: '0 0 14px',
};

const summaryListStyle: CSSProperties = {
  margin: 0,
  paddingLeft: '18px',
  color: 'var(--text-dim)',
  lineHeight: 1.8,
};

const editorStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '240px 1fr',
  gap: 0,
  alignItems: 'start',
  borderRadius: '4px',
  overflow: 'hidden',
};

/* 文件浏览器：透明背景，仅用右侧分割线与内容区分隔 */
const fileExplorerStyle: CSSProperties = {
  borderRight: '1px solid var(--border-subtle)',
  padding: '0 16px 0 0',
  minHeight: '420px',
  maxHeight: '620px',
  overflowY: 'auto',
};

const fileExplorerHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const sectionLabelStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
};

const fileCountStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  color: 'var(--text-muted)',
};

const fileListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

/* 内容查看器：透明背景，无边框，直接承接 tab 栏（与 file explorer 用竖线分隔） */
const contentStyle: CSSProperties = {
  padding: '0 0 0 16px',
  minWidth: 0,
  minHeight: '420px',
  maxHeight: '620px',
  overflowY: 'auto',
};

const contentHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 18px',
  borderBottom: '1px solid var(--border)',
};

const contentFilenameStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text)',
};

const readonlyTagStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  padding: '2px 8px',
  border: '1px solid var(--border)',
  borderRadius: '2px',
};

const readmeStyle: CSSProperties = {
  padding: '24px 28px',
};

const sidebarStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  position: 'sticky',
  top: '100px',
};

/* 侧边栏统计项：无背景框，用底部分割线分隔（最后一项无线） */
const statCardStyle: CSSProperties = {
  padding: '16px 0',
  borderBottom: '1px solid var(--border-subtle)',
  position: 'relative',
};

/* 侧边栏最后一项：移除底部分割线 */
const statCardLastStyle: CSSProperties = {
  padding: '16px 0',
  borderBottom: 'none',
  position: 'relative',
};

const statLabelStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  marginBottom: '8px',
};

const statValueStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '28px',
  fontWeight: 700,
  color: 'var(--text)',
  lineHeight: 1.1,
  marginBottom: '8px',
};

const sparklineStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: '2px',
  height: '28px',
};

const sourceOwnerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '10px',
};

const avatarStyle: CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'var(--gold)',
  color: 'var(--bg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  textDecoration: 'none',
  flexShrink: 0,
};

const ownerNameStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--text)',
  textDecoration: 'none',
  transition: 'color 0.2s',
};

const ownerStatsStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  color: 'var(--text-muted)',
  marginTop: '2px',
};

const statLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  color: 'var(--gold)',
  textDecoration: 'none',
  transition: 'color 0.2s',
};

const occupationNameStyle: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--text)',
  lineHeight: 1.5,
};

const relatedStyle: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '32px 24px 64px',
  borderTop: '1px solid var(--border)',
};

const relatedHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '4px',
};

const relatedSubStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 18px',
};

const relatedMoreStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  color: 'var(--gold)',
  textDecoration: 'none',
  transition: 'color 0.2s',
};

const relatedListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
};

const relatedItemStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  alignItems: 'center',
  gap: '16px',
  padding: '14px 0',
  borderBottom: '1px solid var(--border-subtle)',
  textDecoration: 'none',
  transition: 'background 0.15s',
};

const relatedNameStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '15px',
  fontWeight: 700,
  color: 'var(--text)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const relatedDescStyle: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--text-dim)',
  marginTop: '2px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const relatedRepoStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  color: 'var(--text-muted)',
  whiteSpace: 'nowrap',
};

/* ═══════════════════════════════════════════════════════════════
   Key Facts 表格单元格样式（在 tab 内容面板内透明渲染）
   ═══════════════════════════════════════════════════════════════ */

const keyFactLabelStyle: CSSProperties = {
  padding: '11px 18px',
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  whiteSpace: 'nowrap',
  width: '180px',
  verticalAlign: 'middle',
  borderRight: '1px solid var(--border-subtle)',
};

const keyFactValueStyle: CSSProperties = {
  padding: '11px 18px',
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'middle',
};

/* ── 工作流步骤 ── */
const workflowContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
};

const workflowStepStyle: CSSProperties = {
  display: 'flex',
  gap: '16px',
  padding: '18px 0',
  borderBottom: '1px solid var(--border-subtle)',
};

const stepNumberStyle: CSSProperties = {
  flexShrink: 0,
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(245, 197, 24, 0.08)',
  border: '1px solid rgba(245, 197, 24, 0.25)',
  color: 'var(--gold)',
  fontFamily: 'var(--font-display)',
  fontSize: '14px',
  fontWeight: 700,
  borderRadius: '4px',
};

const stepContentStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const stepTitleStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '15px',
  fontWeight: 700,
  color: 'var(--text)',
  marginBottom: '6px',
};

const stepDescStyle: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--text-dim)',
  lineHeight: 1.6,
  marginBottom: '10px',
};

const stepCodeBlockStyle: CSSProperties = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  padding: '12px 14px',
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  color: 'var(--cyan)',
  overflowX: 'auto',
  whiteSpace: 'pre',
  lineHeight: 1.6,
};

const codeLangTagStyle: CSSProperties = {
  display: 'inline-block',
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '6px',
};

/* ── 安全规则 ── */
const safetyContainerStyle: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border-subtle)',
  borderLeft: '3px solid var(--danger)',
  borderRadius: '4px',
  overflow: 'hidden',
};

const safetyRuleItemStyle: CSSProperties = {
  display: 'flex',
  gap: '12px',
  padding: '12px 16px',
  borderBottom: '1px solid var(--border-subtle)',
};

const safetyRuleNumberStyle: CSSProperties = {
  flexShrink: 0,
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--danger)',
  width: '24px',
};

const safetyRuleTextStyle: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--text-dim)',
  lineHeight: 1.6,
};

/* ── 限制说明 ── */
const limitationItemStyle: CSSProperties = {
  display: 'flex',
  gap: '10px',
  padding: '8px 0',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--text-dim)',
  lineHeight: 1.6,
};

const limitationDotStyle: CSSProperties = {
  color: 'var(--text-muted)',
  flexShrink: 0,
};

/* ── 章节容器（统一面板样式） ── */
const sectionPanelStyle: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '4px',
  padding: '0',
  overflow: 'hidden',
};

/* ═══════════════════════════════════════════════════════════════
   选项卡导航样式（参考 clawhub.ai 的 tab 设计）
   简洁文字 + 下划线激活态，无背景框
   ═══════════════════════════════════════════════════════════════ */

/* 选项卡栏：透明背景 + 极淡底部分隔线，tab 间 gap（对齐 clawhub.ai 的 .tab-header） */
const tabBarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '24px',
  borderBottom: '1px solid var(--border-subtle)',
  marginBottom: '0',
};

/* 选项卡按钮：sans-serif 字体 + 2px 底边框作为激活态指示器 */
const tabBtnBaseStyle: CSSProperties = {
  padding: '10px 0',
  background: 'transparent',
  border: 'none',
  borderBottom: '2px solid transparent',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--text-dim)',
  cursor: 'pointer',
  transition: 'color 0.15s, border-color 0.15s',
  position: 'relative',
};

/* tab 内容区：完全透明，无背景框/边框/圆角（对齐 clawhub.ai 的 [role=tabpanel]），内容直接承接 tab 栏 */
const tabContentPanelStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  borderRadius: 0,
  padding: '24px 0 0',
  minHeight: 'auto',
};

/* ── Key Facts 无框表格 ── */
const keyFactsBareTableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

/* ═══════════════════════════════════════════════════════════════
   行内 Markdown 渲染（加粗 + 行内代码），用于安全规则和限制说明
   ═══════════════════════════════════════════════════════════════ */

/** 解析行内 `**加粗**` 和 `` `代码` `` 标记，返回 React 节点数组 */
function renderInlineText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let key = 0;
  const combined = /\*\*([^*]+)\*\*|`([^`]+)`/;

  while (remaining.length > 0) {
    const match = combined.exec(remaining);
    if (!match) {
      nodes.push(remaining);
      break;
    }
    if (match.index > 0) {
      nodes.push(remaining.slice(0, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={key++} style={{ color: 'var(--text)', fontWeight: 600 }}>
          {match[1]}
        </strong>,
      );
    } else if (match[2] !== undefined) {
      nodes.push(
        <code key={key++} style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)', fontSize: '12px' }}>
          {match[2]}
        </code>,
      );
    }
    remaining = remaining.slice(match.index + match[0].length);
  }
  return nodes;
}

/* ═══════════════════════════════════════════════════════════════
   骨架屏组件
   ═══════════════════════════════════════════════════════════════ */

const shimmerBg: CSSProperties = {
  background:
    'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s infinite',
  borderRadius: '3px',
  display: 'block',
};

function SkillDetailSkeleton() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px 64px' }}>
      {/* 面包屑占位 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ ...shimmerBg, width: '240px', height: '14px' }} />
      </div>
      {/* 标题占位 */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ ...shimmerBg, width: '45%', height: '48px' }} />
      </div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
        <div style={{ ...shimmerBg, width: '80px', height: '14px' }} />
        <div style={{ ...shimmerBg, width: '80px', height: '14px' }} />
      </div>
      {/* 主体占位 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <div style={{ ...shimmerBg, width: '90px', height: '12px', marginBottom: '12px' }} />
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', padding: '0 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
              <div style={{ ...shimmerBg, width: '70%', height: '14px' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>//</span>
              <div style={{ ...shimmerBg, width: '80px', height: '12px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ ...shimmerBg, width: '95%', height: '14px' }} />
              <div style={{ ...shimmerBg, width: '88%', height: '14px' }} />
              <div style={{ ...shimmerBg, width: '92%', height: '14px' }} />
              <div style={{ ...shimmerBg, width: '60%', height: '14px' }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ ...shimmerBg, width: '50px', height: '10px' }} />
            <div style={{ ...shimmerBg, width: '80px', height: '32px' }} />
            <div style={{ ...shimmerBg, width: '100%', height: '14px' }} />
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ ...shimmerBg, width: '90px', height: '10px' }} />
            <div style={{ ...shimmerBg, width: '100%', height: '14px' }} />
            <div style={{ ...shimmerBg, width: '95%', height: '14px' }} />
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ ...shimmerBg, width: '90px', height: '10px' }} />
            <div style={{ ...shimmerBg, width: '100%', height: '14px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   主组件
   ═══════════════════════════════════════════════════════════════ */

interface SkillDetailClientProps {
  /** URL ?id= 参数 */
  skillId?: string;
  /** URL ?name= 参数 */
  skillName?: string;
}

export default function SkillDetailClient({ skillId, skillName }: SkillDetailClientProps) {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [installMode, setInstallMode] = useState<'command' | 'prompt'>('command');
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState('SKILL.md');
  const [activeTab, setActiveTab] = useState<'skillmd' | 'keyfacts' | 'files'>('skillmd');

  // 查找技能：优先 id，回退 name
  const skill = skillId ? getSkill(skillId) : skillName ? getSkillByName(skillName) : null;

  // 模拟数据加载延迟后隐藏骨架屏
  useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // 复制成功反馈：1.2s 后恢复
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(timer);
  }, [copied]);

  // 骨架屏状态
  if (showSkeleton) {
    return (
      <main className="main-content">
        <SkillDetailSkeleton />
      </main>
    );
  }

  // 未找到技能
  if (!skill) {
    return (
      <main className="main-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>
          Skill Not Found
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--text-dim)' }}>
          Please check the URL or return to{' '}
          <Link href="/skills" style={{ color: 'var(--gold)' }}>Skills Market</Link>.
        </p>
      </main>
    );
  }

  // ── 关联数据 ──
  const owner = getOwner(skill.owner) ?? {
    id: skill.owner,
    name: skill.owner,
    avatar: skill.owner[0].toUpperCase(),
    totalInstalls: 0,
    skills: [] as string[],
  };
  const cat = getCategory(skill.category[0]);
  const files = extractFileList(skill.readme);
  const related = findRelatedSkills(skill, 4);
  const ownerHref = `/skills/owner?owner=${encodeURIComponent(skill.owner)}`;

  // 结构化内容（Key Facts 从 README 表格提取，其余由 SimpleMarkdown 直接渲染）
  const keyFacts = extractKeyFacts(skill.readme);

  // 安装命令与 Prompt 文本
  const installCmd = skill.installCmd;
  const promptText = `Use the ${skill.name} skill to ${(skill.description || '').toLowerCase().replace(/\.$/, '')}.`;
  const currentInstallText = installMode === 'command' ? installCmd : promptText;

  // GitHub Stars（模拟值）
  const stars = formatNumber(Math.floor(skill.installs * 0.012));
  const activeFileObj = files.find((f) => f.path === activeFile);

  /** 复制安装命令到剪贴板 */
  function handleCopy() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentInstallText).then(() => setCopied(true)).catch(() => setCopied(true));
    } else {
      setCopied(true);
    }
  }

  /** 切换文件浏览器中的活动文件 */
  function handleFileClick(file: SkillFile) {
    setActiveFile(file.path);
  }

  return (
    <main className="main-content">
      {/* ── 面包屑 ── */}
      <nav style={breadcrumbStyle}>
        <Link href="/skills" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Skills</Link>
        <span style={sepStyle}>/</span>
        <Link href={ownerHref} style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>{owner.name}</Link>
        <span style={sepStyle}>/</span>
        <span style={currentCrumbStyle}>{skill.name}</span>
      </nav>

      {/* ── 标题区 ── */}
      <header style={heroStyle}>
        <div style={titleWrapStyle}>
          <h1 style={titleStyle}>{skill.name}</h1>
          <div style={categoryBadgeStyle}>{(cat?.name || skill.category[0]).toUpperCase()}</div>
          <a
            href={`https://github.com/${skill.repo}`}
            target="_blank"
            rel="noopener noreferrer"
            style={githubLinkStyle}
            title="View on GitHub"
          >
            <GitHubIcon size={18} />
          </a>
        </div>
        <div style={metaStyle}>
          <span style={metaItemStyle} title="GitHub Stars">
            <StarIcon size={14} />
            <span>{stars}</span>
          </span>
          <span style={metaItemStyle} title="First Seen">
            <ClockIcon size={14} />
            <span>2026-01-15</span>
          </span>
        </div>
      </header>

      {/* ── 主体：主区域 + 右侧边栏 ── */}
      <div style={bodyStyle}>
        {/* 左侧主区域 */}
        <div style={mainColStyle}>
          {/* 安装区 */}
          <section>
            <div style={sectionHeaderStyle}>
              <h2 style={sectionTitleStyle}>Installation</h2>
              <div style={toggleStyle}>
                <button
                  type="button"
                  onClick={() => setInstallMode('command')}
                  style={{
                    ...toggleBtnBase,
                    background: installMode === 'command' ? 'var(--bg)' : 'transparent',
                    color: installMode === 'command' ? 'var(--gold)' : 'var(--text-dim)',
                    boxShadow: installMode === 'command' ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
                  }}
                >
                  Command
                </button>
                <button
                  type="button"
                  onClick={() => setInstallMode('prompt')}
                  style={{
                    ...toggleBtnBase,
                    background: installMode === 'prompt' ? 'var(--bg)' : 'transparent',
                    color: installMode === 'prompt' ? 'var(--gold)' : 'var(--text-dim)',
                    boxShadow: installMode === 'prompt' ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
                  }}
                >
                  Prompt
                </button>
              </div>
            </div>
            <div style={installBoxStyle}>
              <code style={installCodeStyle}>{currentInstallText}</code>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy"
                aria-label="Copy"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  marginRight: '4px',
                  padding: 0,
                  background: copied ? 'rgba(63, 185, 80, 0.1)' : 'transparent',
                  border: `1px solid ${copied ? 'rgba(63, 185, 80, 0.3)' : 'transparent'}`,
                  borderRadius: '4px',
                  color: copied ? 'var(--green)' : 'var(--text-dim)',
                  cursor: 'pointer',
                  transition: 'color 0.15s, background 0.15s, border-color 0.15s',
                }}
              >
                {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
              </button>
            </div>
          </section>

          {/* 选项卡导航 —— 参考 clawhub.ai：sans-serif + 底边框激活态 */}
          <nav style={tabBarStyle}>
            <button
              type="button"
              onClick={() => setActiveTab('skillmd')}
              style={{
                ...tabBtnBaseStyle,
                color: activeTab === 'skillmd' ? 'var(--text)' : 'var(--text-dim)',
                borderBottomColor: activeTab === 'skillmd' ? 'var(--gold)' : 'transparent',
              }}
            >
              SKILL.md
            </button>
            {keyFacts.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('keyfacts')}
                style={{
                  ...tabBtnBaseStyle,
                  color: activeTab === 'keyfacts' ? 'var(--text)' : 'var(--text-dim)',
                  borderBottomColor: activeTab === 'keyfacts' ? 'var(--gold)' : 'transparent',
                }}
              >
                Key Facts
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('files')}
              style={{
                ...tabBtnBaseStyle,
                color: activeTab === 'files' ? 'var(--text)' : 'var(--text-dim)',
                borderBottomColor: activeTab === 'files' ? 'var(--gold)' : 'transparent',
              }}
            >
              Files
            </button>
          </nav>

          {/* tab 内容面板：统一容器，内部无独立背景框（参考 clawhub.ai） */}
          <div style={tabContentPanelStyle}>
            {/* SKILL.md 选项卡：流式渲染 README */}
            {activeTab === 'skillmd' && (
              <SimpleMarkdown content={skill.readme} />
            )}

            {/* Key Facts 选项卡：无框表格 */}
            {activeTab === 'keyfacts' && keyFacts.length > 0 && (
              <table style={keyFactsBareTableStyle}>
                <tbody>
                  {keyFacts.map((fact, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{
                        ...keyFactLabelStyle,
                        background: 'transparent',
                        borderRight: '1px solid var(--border-subtle)',
                      }}>
                        {fact.label}
                      </td>
                      <td style={{ ...keyFactValueStyle, background: 'transparent' }}>
                        {renderInlineText(fact.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Files 选项卡：文件浏览器 + 内容查看器（透明，由面板提供容器） */}
            {activeTab === 'files' && (
              <div style={editorStyle}>
                {/* 文件浏览器 */}
                <div style={fileExplorerStyle}>
                  <div style={fileExplorerHeaderStyle}>
                    <span style={sectionLabelStyle}>FILE EXPLORER</span>
                    <span style={fileCountStyle}>{files.length} {files.length === 1 ? 'file' : 'files'}</span>
                  </div>
                  <div style={fileListStyle}>
                    {files.map((file) => {
                      const isActive = activeFile === file.path;
                      return (
                        <div
                          key={file.path}
                          onClick={() => handleFileClick(file)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '7px 10px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            color: isActive ? 'var(--gold)' : 'var(--text-dim)',
                            cursor: 'pointer',
                            transition: 'background 0.15s, color 0.15s',
                            borderLeft: `2px solid ${isActive ? 'var(--gold)' : 'transparent'}`,
                            borderRadius: '3px',
                            background: isActive ? 'rgba(245, 197, 24, 0.08)' : 'transparent',
                          }}
                        >
                          <span style={{ fontSize: '13px', flexShrink: 0 }}>{'\u{1F4C4}'}</span>
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {file.name}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>
                            {file.isMain ? '2.0' : '1.0'} KB
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 内容查看器 */}
                <article style={contentStyle}>
                  <div style={contentHeaderStyle}>
                    <span style={contentFilenameStyle}>{activeFile}</span>
                    <span style={readonlyTagStyle}>readonly</span>
                  </div>
                  <div style={readmeStyle}>
                    {activeFileObj?.isMain ? (
                      <SimpleMarkdown content={skill.readme} />
                    ) : (
                      <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
                        Content not available in demo mode.
                      </p>
                    )}
                  </div>
                </article>
              </div>
            )}
          </div>
        </div>

        {/* 右侧边栏 */}
        <aside style={sidebarStyle}>
          {/* 安装量 */}
          <section style={statCardStyle}>
            <div style={statLabelStyle}>Installs</div>
            <div style={statValueStyle}>{skill.installsFormatted}</div>
            <div style={sparklineStyle}>
              {(skill.sparkline || [30, 40, 35, 50, 45, 60, 55, 70]).map((p, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${p}%`,
                    background: 'var(--gold)',
                    opacity: 0.6,
                    borderRadius: '1px 1px 0 0',
                  }}
                />
              ))}
            </div>
          </section>

          {/* 来源/创作者 */}
          <section style={statCardStyle}>
            <div style={statLabelStyle}>Source</div>
            <div style={sourceOwnerStyle}>
              <Link href={ownerHref} style={avatarStyle}>{owner.avatar || owner.name[0]}</Link>
              <div>
                <Link href={ownerHref} style={ownerNameStyle}>{owner.name}</Link>
                <div style={ownerStatsStyle}>
                  {formatNumber(owner.totalInstalls)} installs · {owner.skills.length} skills
                </div>
              </div>
            </div>
            <Link href={ownerHref} style={statLinkStyle}>View creator {'\u2192'}</Link>
          </section>

          {/* 相关职业 SOC —— 最后一项，无底部分割线 */}
          <section style={statCardLastStyle}>
            <div style={statLabelStyle}>Related Occupation</div>
            <div>
              <span style={occupationNameStyle}>{findOccupationName(skill.occupation)}</span>
            </div>
          </section>
        </aside>
      </div>

      {/* ── 相关技能 ── */}
      <section style={relatedStyle}>
        <div style={relatedHeaderStyle}>
          <h2 style={sectionTitleStyle}>Related Skills</h2>
          <Link href="/skills" style={relatedMoreStyle}>View all {'\u2192'}</Link>
        </div>
        <p style={relatedSubStyle}>
          More in <span style={{ color: 'var(--gold)' }}>{cat?.name || skill.category[0]}</span>
        </p>
        <div style={relatedListStyle}>
          {related.length === 0 ? (
            <p style={relatedSubStyle}>No related skills found.</p>
          ) : (
            related.map((s) => {
              const trend = getTrend(s.trendingRank);
              return (
                <Link key={s.id} href={`/skills/detail?id=${encodeURIComponent(s.id)}`} style={relatedItemStyle}>
                  <div style={{ minWidth: 0 }}>
                    <div style={relatedNameStyle}>{s.name}</div>
                    <div style={relatedDescStyle}>{s.description || ''}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={relatedRepoStyle}>{s.repo}</span>
                    <span
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: trend.cls === 'up'
                          ? 'var(--green)'
                          : trend.cls === 'down'
                            ? '#f85149'
                            : 'var(--text-muted)',
                      }}
                    >
                      <span style={{ fontSize: '14px', lineHeight: 1 }}>{trend.arrow}</span>
                      {trend.value && <span>{trend.value}</span>}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

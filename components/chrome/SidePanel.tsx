/**
 * SidePanel —— 通用侧边弹出面板
 * 封装 header（标题 + 关闭按钮）+ body 结构
 * 用于 SideNav 中的通知/消息/钱包/发帖等面板
 */
import { ReactNode } from 'react';

interface SidePanelProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** 面板 data-panel 属性，用于 CSS 选择器 */
  'data-panel'?: string;
  /** 面板 aria-label */
  ariaLabel?: string;
}

const closeIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export function SidePanel({ isOpen, title, onClose, children, 'data-panel': dataPanel, ariaLabel }: SidePanelProps) {
  return (
    <div
      className={`gh-side-panel${isOpen ? ' is-open' : ''}`}
      data-panel={dataPanel}
      role="dialog"
      aria-label={ariaLabel}
    >
      <div className="gh-side-panel-header">
        <span className="gh-side-panel-title">{title}</span>
        <button
          type="button"
          className="gh-side-panel-close"
          aria-label="Close"
          onClick={onClose}
        >
          {closeIcon}
        </button>
      </div>
      <div className="gh-side-panel-body">
        {children}
      </div>
    </div>
  );
}

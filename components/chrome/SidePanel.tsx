/**
 * SidePanel —— 通用侧边弹出面板（v2.0 antd 迁移）
 *
 * 迁移内容：
 * - 自定义 CSS 开合 → antd Drawer（自带动画、遮罩、ESC 关闭）
 * - 自定义 close SVG → antd Drawer 内置 CloseIcon
 *
 * 保持兼容：
 * - props 签名完全不变（isOpen/title/onClose/children/data-panel/ariaLabel）
 * - 调用方（SideNav）无需修改
 *
 * 注意：data-panel 属性转移到 Drawer 的 rootClassName 以便 CSS 定位
 */
import { Drawer } from 'antd';
import type { ReactNode } from 'react';

interface SidePanelProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** 面板标识，转为 className 用于样式定位 */
  'data-panel'?: string;
  /** 面板 aria-label */
  ariaLabel?: string;
}

export function SidePanel({
  isOpen,
  title,
  onClose,
  children,
  'data-panel': dataPanel,
  ariaLabel,
}: SidePanelProps) {
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={title}
      placement="right"
      size={360}
      rootClassName={dataPanel ? `gh-side-panel gh-side-panel-${dataPanel}` : 'gh-side-panel'}
      aria-label={ariaLabel}
      styles={{
        header: {
          borderBottom: '1px solid var(--border)',
          padding: '16px 20px',
          background: '#111318',
        },
        body: {
          padding: '12px 16px',
          background: 'var(--surface)',
        },
        section: {
          background: '#111318',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        },
      }}
    >
      {children}
    </Drawer>
  );
}

/**
 * 模态框共享样式
 * —— 统一所有居中弹窗的容器背景与按钮风格，避免各弹窗各写一套导致不一致
 */

/** 模态框内容容器（panel）样式：不透明背景 + 圆角 + 阴影 */
export const modalPanelStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 12,
  boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

/** 遮罩层样式 */
export const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1100,
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(3px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
};

/** 关闭按钮样式（右上角 ✕） */
export const modalCloseBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 6,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-dim)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

/** 统一按钮样式
 * @param variant  'secondary' 次要（取消） | 'primary' 主要（确认） | 'danger' 危险确认
 * @param disabled 是否禁用
 */
export function modalBtnStyle(
  variant: 'secondary' | 'primary' | 'danger' = 'secondary',
  disabled = false,
): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: '8px 18px',
    borderRadius: 8,
    fontFamily: 'var(--font-display)',
    fontSize: 13,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
  };

  if (disabled) {
    return {
      ...base,
      background: 'var(--surface)',
      color: 'var(--text-muted)',
      border: '1px solid var(--border-subtle)',
      opacity: 0.6,
    };
  }

  switch (variant) {
    case 'primary':
      return {
        ...base,
        background: 'linear-gradient(180deg, rgba(157,140,255,0.22), rgba(157,140,255,0.10))',
        color: 'var(--gold)',
        border: '1px solid rgba(157,140,255,0.32)',
      };
    case 'danger':
      return {
        ...base,
        background: 'rgba(255,107,107,0.15)',
        color: 'var(--danger)',
        border: '1px solid rgba(255,107,107,0.4)',
      };
    default: // secondary
      return {
        ...base,
        background: 'transparent',
        color: 'var(--text-dim)',
        border: '1px solid var(--border-subtle)',
      };
  }
}

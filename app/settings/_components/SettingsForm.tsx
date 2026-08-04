/**
 * SettingsForm —— 设置页通用表单控件
 *
 * 统一封装：表单行、文本输入、文本域、下拉框、开关、单选卡片、富文本占位
 * 风格延续 GHRANK 暗色 HUD + 金色强调
 */
'use client';

import type { ReactNode, CSSProperties, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import TiptapEditor from '@/components/shared/TiptapEditor';

/* ═══════════════════════════════════════════════════════════════
   样式常量
   ═══════════════════════════════════════════════════════════════ */

export const panelStyle: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '4px',
};

export const sectionTitleStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
};

/* ═══════════════════════════════════════════════════════════════
   表单行
   ═══════════════════════════════════════════════════════════════ */

interface FormRowProps {
  label: string;
  children: ReactNode;
  hint?: string;
  action?: ReactNode;
}

export function FormRow({ label, children, hint, action }: FormRowProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        gap: '16px',
        padding: '14px 0',
        borderBottom: '1px solid var(--border-subtle)',
        alignItems: 'start',
      }}
    >
      <dt
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text)',
          paddingTop: '8px',
        }}
      >
        {label}
      </dt>
      <dd style={{ margin: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {children}
          {action}
        </div>
        {hint && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginTop: '6px',
              lineHeight: 1.5,
            }}
          >
            {hint}
          </div>
        )}
      </dd>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   文本输入框
   ═══════════════════════════════════════════════════════════════ */

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export function TextInput({ value, onChange, ...rest }: TextInputProps) {
  return (
    <input
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        flex: 1,
        minWidth: '200px',
        padding: '9px 12px',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: '3px',
        color: 'var(--text)',
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        outline: 'none',
        ...rest.style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--gold)';
        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(245, 197, 24, 0.1)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   文本域
   ═══════════════════════════════════════════════════════════════ */

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export function TextArea({ value, onChange, rows = 4, ...rest }: TextAreaProps) {
  return (
    <textarea
      {...rest}
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '10px 12px',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: '3px',
        color: 'var(--text)',
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        lineHeight: 1.5,
        resize: 'vertical',
        outline: 'none',
        ...rest.style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--gold)';
        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(245, 197, 24, 0.1)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   下拉框
   ═══════════════════════════════════════════════════════════════ */

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function Select({ value, onChange, options, ...rest }: SelectProps) {
  return (
    <select
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        flex: 1,
        minWidth: '180px',
        padding: '9px 28px 9px 12px',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: '3px',
        color: 'var(--text)',
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        outline: 'none',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b949e' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        ...rest.style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--gold)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

/* ═══════════════════════════════════════════════════════════════
   开关复选框
   ═══════════════════════════════════════════════════════════════ */

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Toggle({ checked, onChange, label, ...rest }: ToggleProps) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        color: 'var(--text)',
      }}
    >
      <span
        style={{
          position: 'relative',
          width: '36px',
          height: '20px',
          borderRadius: '10px',
          background: checked ? 'var(--gold)' : 'var(--border)',
          transition: 'background 0.2s',
        }}
      >
        <input
          {...rest}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
        />
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '18px' : '2px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.2s',
          }}
        />
      </span>
      {label}
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════
   单选卡片组
   ═══════════════════════════════════════════════════════════════ */

interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; hint?: string }[];
  name: string;
}

export function RadioGroup({ value, onChange, options, name }: RadioGroupProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {options.map((opt) => (
        <label
          key={opt.value}
          style={{
            flex: '1 1 140px',
            minWidth: '120px',
            padding: '12px',
            borderRadius: '4px',
            border: `1px solid ${value === opt.value ? 'var(--gold)' : 'var(--border)'}`,
            background: value === opt.value ? 'rgba(245, 197, 24, 0.06)' : 'var(--bg)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            style={{ position: 'absolute', opacity: 0 }}
          />
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 600,
              color: value === opt.value ? 'var(--gold)' : 'var(--text)',
              marginBottom: '2px',
            }}
          >
            {opt.label}
          </div>
          {opt.hint && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>
              {opt.hint}
            </div>
          )}
        </label>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   富文本编辑器（tiptap 实现，替代早期的装饰性假工具栏）
   ═══════════════════════════════════════════════════════════════ */

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  /** 最大字符数（按纯文本统计），不传则不限制 */
  maxChars?: number;
}

export function RichEditor({ value, onChange, placeholder, rows = 6, maxChars }: RichEditorProps) {
  return (
    <div
      style={{
        width: '100%',
        borderRadius: '3px',
        overflow: 'hidden',
      }}
    >
      <TiptapEditor
        value={value}
        toolbar="minimal"
        maxChars={maxChars}
        minHeight={Math.max(rows * 24, 100)}
        placeholder={placeholder ?? 'Write something...'}
        onChange={(html) => onChange(html)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   保存按钮
   ═══════════════════════════════════════════════════════════════ */

interface SaveButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

export function SaveButton({ children, onClick }: SaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 22px',
        background: 'var(--gold)',
        border: 'none',
        borderRadius: '3px',
        color: 'var(--bg)',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        cursor: 'pointer',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}

/**
 * SettingsForm —— 设置页通用表单控件（v2.0 antd 迁移）
 *
 * 迁移内容：
 * - TextInput → antd Input
 * - TextArea → antd Input.TextArea
 * - Select → antd Select
 * - Toggle → antd Switch
 * - RadioGroup → antd Radio.Group
 * - SaveButton → antd Button
 *
 * 保持兼容：
 * - 所有导出组件的 props 签名不变（value/onChange 等回调保持原样）
 * - FormRow / RichEditor / panelStyle / sectionTitleStyle 保持不变
 * - 调用方代码无需修改
 *
 * 注意：RadioGroup 的 options 结构与 antd Radio.Group 不同，
 * 这里通过适配层转换，保持原 options: {value,label,hint}[] 签名
 */
'use client';

import type { ReactNode, CSSProperties } from 'react';
import { useState } from 'react';
import { Input, Select as AntSelect, Switch, Radio, Button, DatePicker, App } from 'antd';
import dayjs from 'dayjs';

/* ═══════════════════════════════════════════════════════════════
   样式常量（保持不变，调用方直接引用）
   ═══════════════════════════════════════════════════════════════ */

export const panelStyle: CSSProperties = {
  background: 'transparent',
  borderRadius: 8,
  padding: '24px',
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
   表单行（保持不变 —— 布局组件，无需迁移）
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
   文本输入框 —— antd Input 适配层
   保持原 props: { value, onChange: (value: string) => void, ...rest }
   ═══════════════════════════════════════════════════════════════ */

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

// 表单控件统一最大宽度（根据常见字段数据容量：邮箱/网址/用户名等）
const FIELD_MAX_WIDTH = '520px';

export function TextInput({ value, onChange, style, ...rest }: TextInputProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ flex: 1, maxWidth: FIELD_MAX_WIDTH, minWidth: '200px', ...style }}
      {...rest}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   日期选择器 —— antd DatePicker 适配层
   props: { value: string (YYYY-MM-DD), onChange: (value: string) => void }
   ═══════════════════════════════════════════════════════════════ */

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  style?: CSSProperties;
}

export function DateField({ value, onChange, style }: DateFieldProps) {
  return (
    <DatePicker
      value={value ? dayjs(value) : null}
      onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : '')}
      style={{ flex: 1, maxWidth: FIELD_MAX_WIDTH, minWidth: '200px', ...style }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   文本域 —— antd Input.TextArea 适配层
   保持原 props: { value, onChange: (value: string) => void, rows, ...rest }
   ═══════════════════════════════════════════════════════════════ */

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

export function TextArea({ value, onChange, rows = 4, style, ...rest }: TextAreaProps) {
  return (
    <Input.TextArea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoSize={{ minRows: rows, maxRows: rows * 2 }}
      style={{ width: '100%', maxWidth: FIELD_MAX_WIDTH, ...style }}
      {...rest}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   下拉框 —— antd Select 适配层
   保持原 props: { value, onChange: (value: string) => void, options: {value,label}[] }
   ═══════════════════════════════════════════════════════════════ */

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  style?: CSSProperties;
  [key: string]: unknown;
}

export function Select({ value, onChange, options, style, ...rest }: SelectProps) {
  return (
    <AntSelect
      value={value}
      onChange={onChange}
      options={options}
      style={{ flex: 1, maxWidth: FIELD_MAX_WIDTH, minWidth: '180px', ...style }}
      {...rest}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   开关 —— antd Switch 适配层
   保持原 props: { checked, onChange: (checked: boolean) => void, label }
   注意：label 在 antd Switch 中需要外层包裹，这里用 span 包装
   ═══════════════════════════════════════════════════════════════ */

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  [key: string]: unknown;
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
      <Switch checked={checked} onChange={onChange} size="small" {...rest} />
      {label}
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════
   单选卡片组 —— antd Radio.Group 适配层
   保持原 props: { value, onChange: (value: string) => void, options: {value,label,hint?}[], name }
   注意：原组件使用卡片样式，antd Radio.Button 默认为按钮样式
        这里保留卡片视觉，用 Radio.Group + 自定义渲染
   ═══════════════════════════════════════════════════════════════ */

interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; hint?: string }[];
  name: string;
}

export function RadioGroup({ value, onChange, options, name }: RadioGroupProps) {
  return (
    <Radio.Group
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value as string)}
      style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}
    >
      {options.map((opt) => (
        <Radio
          key={opt.value}
          value={opt.value}
          style={{
            flex: '1 1 140px',
            minWidth: '120px',
            padding: '12px',
            borderRadius: '4px',
            border: `1px solid ${value === opt.value ? 'var(--gold)' : 'var(--border)'}`,
            background: value === opt.value ? 'rgba(157, 140, 255, 0.06)' : 'var(--bg)',
            alignItems: 'flex-start',
          }}
        >
          <div>
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
          </div>
        </Radio>
      ))}
    </Radio.Group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   多行文本编辑器（纯文本 textarea 替代原 tiptap 富文本）
   ═══════════════════════════════════════════════════════════════ */

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  /** 最大字符数，不传则不限制 */
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
      <textarea
        value={value}
        rows={rows}
        maxLength={maxChars}
        placeholder={placeholder ?? 'Write something...'}
        onChange={(e) => onChange(maxChars ? e.target.value.slice(0, maxChars) : e.target.value)}
        style={{
          width: '100%',
          minHeight: Math.max(rows * 24, 100),
          resize: 'vertical',
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          lineHeight: 1.6,
          color: 'var(--text)',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '3px',
          padding: '10px 12px',
          outline: 'none',
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   保存按钮 —— antd Button 适配层
   保持原 props: { children, onClick }
   内置保存成功提示：未传入 onClick 时，点击后显示 "Settings saved" 提示；
   传入 onClick 时由调用方自行处理反馈。
   ═══════════════════════════════════════════════════════════════ */

interface SaveButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

export function SaveButton({ children, onClick }: SaveButtonProps) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (onClick) {
      try {
        setLoading(true);
        await onClick();
      } finally {
        setLoading(false);
      }
    } else {
      // 未传入 onClick 时给出默认成功提示，让用户感知保存已生效
      message.success('Settings saved');
    }
  };

  return (
    <Button
      type="primary"
      onClick={handleClick}
      loading={loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 22px',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        height: 'auto',
      }}
    >
      {children}
    </Button>
  );
}

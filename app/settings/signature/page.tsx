/**
 * Signature Settings —— rich text signature editor
 */
'use client';

import { useState } from 'react';
import SettingsShell from '../_components/SettingsShell';
import { FormRow, RichEditor, SaveButton, panelStyle } from '../_components/SettingsForm';
import { EditIcon, EyeIcon } from '@/app/_components/icons';

export default function SignaturePage() {
  const [signature, setSignature] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  return (
    <SettingsShell
      title="Signature Settings"
      subtitle="Create a signature that appears beneath your posts across the community."
    >
      <div>
        <section style={{ ...panelStyle, padding: '8px 24px 18px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              padding: '16px 0 8px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <EditIcon size={14} />
              Edit Signature
            </span>
          </h2>

          <FormRow label="Signature:" hint="Maximum 500 characters. Keep it concise and relevant.">
            <RichEditor
              value={signature}
              onChange={setSignature}
              placeholder="Add links, quotes, or a short tagline..."
              rows={8}
              maxChars={500}
            />
          </FormRow>

          <div style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--text-dim)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={showPreview}
                onChange={(e) => setShowPreview(e.target.checked)}
                style={{ accentColor: 'var(--gold)' }}
              />
              Show preview
            </label>
          </div>

          {showPreview && (
            <div
              style={{
                marginTop: '12px',
                padding: '16px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '3px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '10px',
                }}
              >
                <EyeIcon size={12} style={{ display: 'inline-flex', marginRight: '6px' }} />
                Preview
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--text-dim)',
                  lineHeight: 1.6,
                  minHeight: '40px',
                }}
              >
                {/* 预览：渲染编辑器输出的 HTML（仅展示本地输入内容） */}
                {signature ? (
                  <div className="tiptap" dangerouslySetInnerHTML={{ __html: signature }} />
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Your signature will appear here.
                  </span>
                )}
              </div>
            </div>
          )}

          <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <SaveButton>
              <EditIcon size={16} />
              Save Signature
            </SaveButton>
          </div>
        </section>
      </div>
    </SettingsShell>
  );
}

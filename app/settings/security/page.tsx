/**
 * Password & Security —— 5318-style password change + 2FA + sessions
 */
'use client';

import { useState } from 'react';
import { Checkbox } from 'antd';
import SettingsShell from '../_components/SettingsShell';
import { FormRow, TextInput, SaveButton, panelStyle, Toggle } from '../_components/SettingsForm';
import { KeyIcon, ShieldIcon, GlobeIcon, TrashIcon, LockClosedIcon } from '@/components/shared/icons';

const panelSectionStyle = {
  ...panelStyle,
  padding: '8px 24px 18px',
  marginBottom: '20px',
};

const sectionHeadingStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.12em',
  padding: '16px 0 8px',
  borderBottom: '1px solid var(--border-subtle)',
};

const sessions = [
  { ip: '113.206.15.131', location: 'Chongqing, China', count: 5, first: 'Tue 01:45', last: '52m ago', current: true },
  { ip: '45.76.54.232', location: 'Oi, Saitama - Japan', count: 2, first: 'Jul 25, 00:20', last: '7d ago', current: false },
  { ip: '45.76.215.234', location: 'Oi, Saitama - Japan', count: 1, first: 'Jul 20, 14:10', last: '12d ago', current: false },
];

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);

  return (
    <SettingsShell
      title="Password & Security"
      subtitle="Update your password, manage two-factor authentication, and review active sessions."
    >
      <div>
        {/* Password key / PIN */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <KeyIcon size={14} />
              Password Key
            </span>
          </h2>

          <FormRow label="PIN Protection:" hint="Require a PIN in addition to your password when logging in from a new device.">
            <Toggle checked={pinEnabled} onChange={setPinEnabled} label={pinEnabled ? 'Enabled' : 'Disabled'} />
          </FormRow>

          {pinEnabled && (
            <FormRow label="Set PIN:">
              <TextInput value="" onChange={() => {}} type="password" placeholder="4-6 digits" maxLength={6} />
            </FormRow>
          )}
        </section>

        {/* Two-step verification */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <ShieldIcon size={14} />
              Two-Step Verification
            </span>
          </h2>

          <FormRow label="Authenticator App:" hint="Use an app like Google Authenticator or Authy to generate login codes.">
            <Toggle checked={twoFactor} onChange={setTwoFactor} label={twoFactor ? 'Enabled' : 'Disabled'} />
          </FormRow>

          {twoFactor && (
            <div
              style={{
                padding: '14px',
                background: 'rgba(157, 140, 255, 0.04)',
                border: '1px dashed rgba(157, 140, 255, 0.3)',
                borderRadius: '3px',
                margin: '12px 0',
              }}
            >
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)', marginBottom: '8px' }}>
                Scan this QR code with your authenticator app, then enter the 6-digit code below.
              </div>
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  background: '#fff',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  textAlign: 'center',
                  padding: '8px',
                }}
              >
                [QR PLACEHOLDER]
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                <TextInput value="" onChange={() => {}} placeholder="6-digit code" maxLength={6} style={{ maxWidth: '140px' }} />
                <SaveButton>Verify</SaveButton>
              </div>
            </div>
          )}
        </section>

        {/* Change password */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <LockClosedIcon size={14} />
              Change Password
            </span>
          </h2>

          <FormRow label="Current Password:">
            <TextInput
              value={currentPassword}
              onChange={setCurrentPassword}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter current password"
            />
          </FormRow>

          <FormRow label="New Password:">
            <TextInput
              value={newPassword}
              onChange={setNewPassword}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
            />
          </FormRow>

          <FormRow label="Confirm Password:">
            <TextInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter new password"
            />
          </FormRow>

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '10px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-dim)',
              cursor: 'pointer',
            }}
          >
            <Checkbox
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show passwords
          </label>

          <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <SaveButton>
              <ShieldIcon size={16} />
              Save Password
            </SaveButton>
          </div>
        </section>

        {/* IP & Sessions */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <GlobeIcon size={14} />
              Your IP Addresses & Sessions
            </span>
          </h2>

          <div style={{ padding: '12px 0' }}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginBottom: '14px',
                lineHeight: 1.5,
              }}
            >
              If you see account activity from an IP address you do not recognize, change your password immediately.
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '13px' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>IP Address</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>Location</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>Hits</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>First Seen</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>Last Active</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.ip} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text)' }}>
                      <td style={{ padding: '12px 8px' }}>
                        {s.ip}
                        {s.current && (
                          <span
                            style={{
                              marginLeft: '8px',
                              fontSize: '9px',
                              color: 'var(--green)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                            }}
                          >
                            current
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-dim)' }}>{s.location}</td>
                      <td style={{ padding: '12px 8px' }}>{s.count}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-dim)' }}>{s.first}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-dim)' }}>{s.last}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        {!s.current && (
                          <button
                            type="button"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              background: 'transparent',
                              border: '1px solid var(--border)',
                              borderRadius: '3px',
                              color: 'var(--text-dim)',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '10px',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--red, #f85149)';
                              e.currentTarget.style.color = 'var(--red, #f85149)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border)';
                              e.currentTarget.style.color = 'var(--text-dim)';
                            }}
                          >
                            <TrashIcon size={12} />
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Deactivate account */}
        <section style={{ ...panelSectionStyle, borderColor: 'rgba(248, 81, 73, 0.25)' }}>
          <h2 style={{ ...sectionHeadingStyle, color: 'var(--red, #f85149)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <TrashIcon size={14} />
              Danger Zone
            </span>
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '16px 0',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                Deactivate Account
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                This will disable your account and hide your profile. You can reactivate by logging in again.
              </div>
            </div>
            <button
              type="button"
              style={{
                padding: '9px 18px',
                background: 'transparent',
                border: '1px solid var(--red, #f85149)',
                borderRadius: '3px',
                color: 'var(--red, #f85149)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Deactivate
            </button>
          </div>
        </section>
      </div>
    </SettingsShell>
  );
}

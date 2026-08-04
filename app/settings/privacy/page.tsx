/**
 * Privacy Settings —— visibility toggles + permission controls
 */
'use client';

import { useState } from 'react';
import SettingsShell from '../_components/SettingsShell';
import { FormRow, Select, Toggle, SaveButton, panelStyle } from '../_components/SettingsForm';
import { ShieldIcon, EyeIcon, UserIcon, UsersIcon } from '@/app/_components/icons';

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

const visibilityOptions = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'members', label: 'Members Only' },
  { value: 'following', label: 'People I Follow' },
  { value: 'nobody', label: 'Nobody' },
];

export default function PrivacyPage() {
  const [profileVisible, setProfileVisible] = useState('everyone');
  const [activityVisible, setActivityVisible] = useState('members');
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [searchIndexing, setSearchIndexing] = useState(false);
  const [allowTags, setAllowTags] = useState(true);
  const [showEmail, setShowEmail] = useState(false);

  return (
    <SettingsShell
      title="Privacy Settings"
      subtitle="Control who can see your profile, activity, and how others can interact with you."
    >
      <div>
        {/* Profile visibility */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <UserIcon size={14} />
              Profile Visibility
            </span>
          </h2>

          <FormRow label="Profile:" hint="Who can view your full profile page and details.">
            <Select value={profileVisible} onChange={setProfileVisible} options={visibilityOptions} />
          </FormRow>

          <FormRow label="Activity Stream:" hint="Who can see your recent posts, likes, and follows.">
            <Select value={activityVisible} onChange={setActivityVisible} options={visibilityOptions} />
          </FormRow>

          <FormRow label="Show Email:" hint="Display your email address on your public profile.">
            <Toggle checked={showEmail} onChange={setShowEmail} label={showEmail ? 'Visible' : 'Hidden'} />
          </FormRow>
        </section>

        {/* Online & status */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <EyeIcon size={14} />
              Status & Presence
            </span>
          </h2>

          <FormRow label="Online Status:" hint="Show when you are active or recently active.">
            <Toggle checked={onlineStatus} onChange={setOnlineStatus} label={onlineStatus ? 'Visible' : 'Hidden'} />
          </FormRow>

          <FormRow label="Read Receipts:" hint="Let others know when you have read their messages.">
            <Toggle checked={readReceipts} onChange={setReadReceipts} label={readReceipts ? 'Enabled' : 'Disabled'} />
          </FormRow>
        </section>

        {/* Interaction permissions */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <UsersIcon size={14} />
              Interaction Permissions
            </span>
          </h2>

          <FormRow label="Allow Tags:" hint="Other members can tag you in posts and comments.">
            <Toggle checked={allowTags} onChange={setAllowTags} label={allowTags ? 'Allowed' : 'Disabled'} />
          </FormRow>

          <FormRow label="Search Indexing:" hint="Allow search engines to index your public profile.">
            <Toggle checked={searchIndexing} onChange={setSearchIndexing} label={searchIndexing ? 'Allowed' : 'Disabled'} />
          </FormRow>
        </section>

        {/* Blocked list quick link */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <ShieldIcon size={14} />
              Restricted Accounts
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
                Ignored List
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Manage members whose content you want to hide.
              </div>
            </div>
            <button
              type="button"
              style={{
                padding: '8px 16px',
                background: 'rgba(245, 197, 24, 0.08)',
                border: '1px solid rgba(245, 197, 24, 0.25)',
                borderRadius: '3px',
                color: 'var(--gold)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Manage
            </button>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <SaveButton>
            <ShieldIcon size={16} />
            Save Privacy
          </SaveButton>
        </div>
      </div>
    </SettingsShell>
  );
}

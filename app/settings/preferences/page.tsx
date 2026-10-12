/**
 * Notification Preferences —— alerts, emails, and UI settings
 */
'use client';

import { useState } from 'react';
import SettingsShell from '../_components/SettingsShell';
import { FormRow, Select, Toggle, RadioGroup, SaveButton, panelStyle } from '../_components/SettingsForm';
import { BellIcon, MailIcon, MessageIcon, TerminalIcon } from '@/components/shared/icons';

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

const frequencyOptions = [
  { value: 'immediate', label: 'Immediate', hint: 'As soon as it happens' },
  { value: 'digest', label: 'Daily Digest', hint: 'One summary email per day' },
  { value: 'weekly', label: 'Weekly', hint: 'One summary per week' },
  { value: 'never', label: 'Never', hint: 'No emails' },
];

export default function PreferencesPage() {
  const [emailFrequency, setEmailFrequency] = useState('digest');
  const [pushTips, setPushTips] = useState(true);
  const [pushLikes, setPushLikes] = useState(true);
  const [pushFollows, setPushFollows] = useState(true);
  const [pushMentions, setPushMentions] = useState(true);
  const [pushMessages, setPushMessages] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [compactMode, setCompactMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  return (
    <SettingsShell
      title="Notification Preferences"
      subtitle="Choose how and when GHRANK contacts you, and tune the interface to your liking."
    >
      <div>
        {/* Email notifications */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <MailIcon size={14} />
              Email Notifications
            </span>
          </h2>

          <FormRow label="Email Digest:">
            <RadioGroup
              name="email-frequency"
              value={emailFrequency}
              onChange={setEmailFrequency}
              options={frequencyOptions}
            />
          </FormRow>

          <FormRow label="Tips & Payments:" hint="When someone sends you a tip or payment.">
            <Toggle checked={pushTips} onChange={setPushTips} label={pushTips ? 'On' : 'Off'} />
          </FormRow>

          <FormRow label="Likes & Reactions:" hint="When someone likes your post or prompt.">
            <Toggle checked={pushLikes} onChange={setPushLikes} label={pushLikes ? 'On' : 'Off'} />
          </FormRow>

          <FormRow label="New Followers:" hint="When someone starts following you.">
            <Toggle checked={pushFollows} onChange={setPushFollows} label={pushFollows ? 'On' : 'Off'} />
          </FormRow>

          <FormRow label="Mentions & Tags:" hint="When you are mentioned or tagged.">
            <Toggle checked={pushMentions} onChange={setPushMentions} label={pushMentions ? 'On' : 'Off'} />
          </FormRow>

          <FormRow label="Direct Messages:" hint="When you receive a private message.">
            <Toggle checked={pushMessages} onChange={setPushMessages} label={pushMessages ? 'On' : 'Off'} />
          </FormRow>
        </section>

        {/* Push / browser notifications */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <BellIcon size={14} />
              Push Notifications
            </span>
          </h2>

          <FormRow label="Browser Push:" hint="Show desktop alerts even when GHRANK is not open.">
            <Toggle checked={true} onChange={() => {}} label="Enabled" />
          </FormRow>

          <FormRow label="Sound:" hint="Play a short sound for urgent notifications.">
            <Toggle checked={false} onChange={() => {}} label="Off" />
          </FormRow>
        </section>

        {/* Messages */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <MessageIcon size={14} />
              Messages
            </span>
          </h2>

          <FormRow label="Notify on Reply:" hint="Email me when someone replies to a thread I participated in.">
            <Toggle checked={true} onChange={() => {}} label="On" />
          </FormRow>

          <FormRow label="Conversation Invites:" hint="Allow anyone to start a conversation with me.">
            <Select
              value="everyone"
              onChange={() => {}}
              options={[
                { value: 'everyone', label: 'Everyone' },
                { value: 'following', label: 'People I Follow' },
                { value: 'nobody', label: 'Nobody' },
              ]}
            />
          </FormRow>
        </section>

        {/* UI preferences */}
        <section style={panelSectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <TerminalIcon size={14} />
              Interface
            </span>
          </h2>

          <FormRow label="Theme:">
            <Select
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'dark', label: 'Dark HUD' },
                { value: 'light', label: 'Light' },
                { value: 'system', label: 'Follow System' },
              ]}
            />
          </FormRow>

          <FormRow label="Compact Mode:" hint="Reduce padding and card sizes to show more content at once.">
            <Toggle checked={compactMode} onChange={setCompactMode} label={compactMode ? 'On' : 'Off'} />
          </FormRow>

          <FormRow label="Auto-play Media:" hint="Automatically play GIFs and videos in feeds.">
            <Toggle checked={autoPlay} onChange={setAutoPlay} label={autoPlay ? 'On' : 'Off'} />
          </FormRow>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <SaveButton>
            <BellIcon size={16} />
            Save Preferences
          </SaveButton>
        </div>
      </div>
    </SettingsShell>
  );
}

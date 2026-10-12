/**
 * Settings —— Account Details
 *
 * 5318-style two-column layout:
 * - Left: avatar card + account form
 * - Right: grouped settings sidebar menu
 *
 * GHRANK dark HUD theme with gold accents.
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { USER_PROFILE } from '../profile/_data/profile-data';
import SettingsShell from './_components/SettingsShell';
import { FormRow, TextInput, TextArea, RichEditor, SaveButton, panelStyle, DateField } from './_components/SettingsForm';
import { EditIcon } from '@/components/shared/icons';
import AvatarUploader from '@/components/shared/AvatarUploader';
import { useAppEvent } from '@/components/providers/AppEventContext';
import { safeStorage } from '@/lib/safeStorage';
import { STORAGE_KEYS } from '@/lib/constants';
import { isImageAvatar } from '@/lib/avatar';
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn';

/* ═══════════════════════════════════════════════════════════════
   Avatar profile card
   ═══════════════════════════════════════════════════════════════ */

function AvatarCard() {
  // 头像统一走 useIsLoggedIn：从 localStorage 读取，
  // 与顶部导航栏 / 个人中心页保持同一数据源，上传后全站同步。
  const { userAvatar: avatarUrl } = useIsLoggedIn();
  const useImg = isImageAvatar(avatarUrl);
  const { notifyAuthChange } = useAppEvent();

  /** 上传成功回调：持久化到 localStorage，并通知全站重新读取头像 */
  const handleUploaded = (url: string) => {
    safeStorage.set(STORAGE_KEYS.USER_AVATAR, url);
    // 触发 authVersion 变化，让 useIsLoggedIn 立即重新读取头像
    notifyAuthChange();
  };

  return (
    <div
      style={{
        ...panelStyle,
        padding: '28px 24px',
        textAlign: 'center',
        marginBottom: '20px',
      }}
    >
      {/* 圆形头像：外层统一管理尺寸、边框、溢出裁切，
           内部根据 avatar 类型切换 图片渲染 / 字母徽章渲染。 */}
      <div
        style={{
          position: 'relative',
          width: 96,
          height: 96,
          margin: '0 auto 14px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid var(--border)',
          background: useImg ? 'var(--surface-overlay)' : 'var(--gold-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {useImg ? (
          // 原生 img 避免 next/image 布局问题
          <img
            src={avatarUrl}
            alt={`${USER_PROFILE.displayName} avatar`}
            referrerPolicy="no-referrer"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          />
        ) : (
          <span
            className="font-display"
            style={{
              color: 'var(--gold)',
              fontWeight: 800,
              fontSize: avatarUrl.length >= 3 ? 28 : 38,
              lineHeight: 1,
              letterSpacing: '0.02em',
              userSelect: 'none',
            }}
          >
            {avatarUrl}
          </span>
        )}
      </div>
      <h2
        className="font-display"
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--text)',
          margin: '0 0 4px',
        }}
      >
        {USER_PROFILE.displayName}
      </h2>
      <div
        className="meta-hud-mono"
        style={{
          color: 'var(--text-muted)',
          marginBottom: 14,
        }}
      >
        @{USER_PROFILE.username}
      </div>
      {/* 头像上传与裁剪：替换原有的 Edit Avatar 链接 */}
      <AvatarUploader onUploaded={handleUploaded} username={USER_PROFILE.username} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main page
   ═══════════════════════════════════════════════════════════════ */

export default function SettingsPage() {
  const [email, setEmail] = useState(USER_PROFILE.email);
  const [birthDate, setBirthDate] = useState('1983-12-08');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState(USER_PROFILE.location);
  const [website, setWebsite] = useState(USER_PROFILE.website);
  const [referrer, setReferrer] = useState('');
  const [bio, setBio] = useState(USER_PROFILE.bio);
  const [skype, setSkype] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');

  return (
    <SettingsShell
      title="Account Details"
      subtitle="Manage your profile, contact info, and account preferences."
    >
      <div>
        <AvatarCard />

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
            Account Info
          </h2>

          <FormRow
            label="Email:"
            action={
              <Link
                href="#"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--gold)',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Change
              </Link>
            }
          >
            <TextInput value={email} onChange={setEmail} type="email" />
          </FormRow>

          <FormRow label="Birth Date:" hint="Once set, your birth date cannot be changed by yourself. Contact an admin if needed.">
            <DateField value={birthDate} onChange={setBirthDate} />
          </FormRow>

          <FormRow label="Custom Title:" hint="If set, this replaces the title shown beneath your name on posts.">
            <TextInput value={title} onChange={setTitle} placeholder="e.g. Senior Creator" />
          </FormRow>

          <FormRow label="Location:">
            <TextInput value={location} onChange={setLocation} placeholder="City / Country" />
          </FormRow>

          <FormRow label="Homepage:">
            <TextInput value={website} onChange={setWebsite} placeholder="https://" />
          </FormRow>

          <FormRow label="Referrer:" hint="The username of the member who referred you.">
            <TextInput value={referrer} onChange={setReferrer} placeholder="Username" />
          </FormRow>

          <FormRow label="About Me:">
            <RichEditor value={bio} onChange={setBio} placeholder="Introduce yourself..." />
          </FormRow>

          <h2
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              padding: '20px 0 8px',
              marginTop: '8px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            Other Identities
          </h2>

          <FormRow label="Skype:">
            <TextInput value={skype} onChange={setSkype} placeholder="Skype username" />
          </FormRow>

          <FormRow label="Facebook:">
            <TextInput value={facebook} onChange={setFacebook} placeholder="facebook.com/..." />
          </FormRow>

          <FormRow label="Twitter:" hint="X / Twitter username">
            <TextInput value={twitter} onChange={setTwitter} placeholder="@username" />
          </FormRow>

          <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <SaveButton>
              <EditIcon size={16} />
              Save Changes
            </SaveButton>
          </div>
        </section>
      </div>
    </SettingsShell>
  );
}

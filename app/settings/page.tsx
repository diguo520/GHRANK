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
import Image from 'next/image';
import Link from 'next/link';
import { USER_PROFILE } from '../profile/_data/profile-data';
import SettingsShell from './_components/SettingsShell';
import { FormRow, TextInput, TextArea, RichEditor, SaveButton, panelStyle } from './_components/SettingsForm';
import { EditIcon } from '@/app/_components/icons';

/* ═══════════════════════════════════════════════════════════════
   Avatar profile card
   ═══════════════════════════════════════════════════════════════ */

function AvatarCard() {
  return (
    <div
      style={{
        ...panelStyle,
        padding: '28px 24px',
        textAlign: 'center',
        marginBottom: '20px',
      }}
    >
      <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 14px' }}>
        <Image
          src={USER_PROFILE.avatar}
          alt={USER_PROFILE.displayName}
          fill
          style={{ objectFit: 'cover', borderRadius: '50%' }}
          sizes="96px"
        />
        <span
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'var(--green)',
            border: '3px solid var(--surface)',
          }}
          title="Online"
        />
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--text)',
          margin: '0 0 4px',
        }}
      >
        {USER_PROFILE.displayName}
      </h2>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginBottom: '14px',
        }}
      >
        @{USER_PROFILE.username}
      </div>
      <Link
        href="/profile"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 14px',
          background: 'rgba(245, 197, 24, 0.08)',
          border: '1px solid rgba(245, 197, 24, 0.25)',
          borderRadius: '3px',
          color: 'var(--gold)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 600,
          textDecoration: 'none',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        <EditIcon size={14} />
        Edit Avatar
      </Link>
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
            <TextInput value={birthDate} onChange={setBirthDate} type="date" />
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

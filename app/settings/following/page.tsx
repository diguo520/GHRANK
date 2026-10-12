/**
 * Following List —— users the current user follows
 */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SettingsShell from '../_components/SettingsShell';
import { TextInput, panelStyle } from '../_components/SettingsForm';
import { HeartIcon, SearchIcon } from '@/components/shared/icons';

interface FollowedUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  followedAt: string;
}

const initialFollowing: FollowedUser[] = [
  {
    id: '1',
    username: 'alexshader',
    displayName: 'Alex Shader',
    avatar: '/images/demo/prompt_1.jpg',
    bio: 'Generative artist & prompt engineer',
    followedAt: '2 weeks ago',
  },
  {
    id: '2',
    username: 'kairos',
    displayName: 'Kairos',
    avatar: '/images/demo/prompt_2.jpg',
    bio: 'Open-source intelligence researcher',
    followedAt: '1 month ago',
  },
  {
    id: '3',
    username: 'nova_dev',
    displayName: 'Nova Dev',
    avatar: '/images/demo/prompt_3.jpg',
    bio: 'Frontend architect and design systems nerd',
    followedAt: '1 month ago',
  },
  {
    id: '4',
    username: 'byteforge',
    displayName: 'Byte Forge',
    avatar: '/images/demo/prompt_5.jpg',
    bio: 'Backend engineer building distributed systems',
    followedAt: '3 months ago',
  },
  {
    id: '5',
    username: 'pixelwitch',
    displayName: 'Pixel Witch',
    avatar: '/images/demo/prompt_7.jpg',
    bio: 'UI/UX designer & motion enthusiast',
    followedAt: '3 months ago',
  },
];

function UserRow({ user, onUnfollow }: { user: FollowedUser; onUnfollow: (id: string) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 0',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <Link href={`/profile/${user.username}`} style={{ flexShrink: 0 }}>
        <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden' }}>
          <Image src={user.avatar} alt={user.displayName} fill style={{ objectFit: 'cover' }} sizes="48px" />
        </div>
      </Link>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href={`/profile/${user.username}`}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--text)',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
          >
            {user.displayName}
          </Link>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            @{user.username}
          </span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--text-dim)',
            marginTop: '3px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {user.bio}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Followed {user.followedAt}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onUnfollow(user.id)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 14px',
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: '3px',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'all 0.15s',
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
        <HeartIcon size={14} filled />
        Unfollow
      </button>
    </div>
  );
}

export default function FollowingPage() {
  const [query, setQuery] = useState('');
  const [following, setFollowing] = useState(initialFollowing);

  const filtered = following.filter(
    (u) =>
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.displayName.toLowerCase().includes(query.toLowerCase())
  );

  const handleUnfollow = (id: string) => {
    setFollowing((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <SettingsShell
      title="Following List"
      subtitle="Manage the members you follow across GHRANK."
    >
      <div>
        <section style={{ ...panelStyle, padding: '8px 24px 18px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 0',
              borderBottom: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <SearchIcon
                size={14}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <TextInput
                value={query}
                onChange={setQuery}
                placeholder="Search followed members..."
                style={{ paddingLeft: '34px', minWidth: 'unset', width: '100%' }}
              />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              {filtered.length} following
            </div>
          </div>

          {filtered.length > 0 ? (
            filtered.map((user) => <UserRow key={user.id} user={user} onUnfollow={handleUnfollow} />)
          ) : (
            <div
              style={{
                padding: '40px 0',
                textAlign: 'center',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}
            >
              {query ? 'No members match your search.' : 'You are not following anyone yet.'}
            </div>
          )}
        </section>
      </div>
    </SettingsShell>
  );
}

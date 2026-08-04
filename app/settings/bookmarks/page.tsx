/**
 * Bookmarks —— content saved via the site bookmark button
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import SettingsShell from '../_components/SettingsShell';
import { TextInput, panelStyle } from '../_components/SettingsForm';
import { BookmarkIcon, SearchIcon, ExternalLinkIcon, TrashIcon } from '@/app/_components/icons';

type BookmarkType = 'website' | 'prompt' | 'post' | 'news';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  type: BookmarkType;
  category: string;
  savedAt: string;
}

const initialBookmarks: Bookmark[] = [
  { id: '1', title: 'OpenAI', url: '/go?url=openai.com', type: 'website', category: 'AI Tools', savedAt: '2 hours ago' },
  { id: '2', title: 'Cinematic Portrait Generator', url: '/prompt/cinematic-portrait', type: 'prompt', category: 'Prompts', savedAt: '1 day ago' },
  { id: '3', title: 'React Fiber Architecture Deep Dive', url: '/community/post/react-fiber', type: 'post', category: 'Community', savedAt: '3 days ago' },
  { id: '4', title: 'Hugging Face', url: '/go?url=huggingface.co', type: 'website', category: 'AI Tools', savedAt: '1 week ago' },
  { id: '5', title: 'GPT-5.6 Sol Preview', url: '/news/gpt-5-6-sol', type: 'news', category: 'News', savedAt: '1 week ago' },
];

const typeLabel: Record<BookmarkType, string> = {
  website: 'Website',
  prompt: 'Prompt',
  post: 'Post',
  news: 'News',
};

const typeColor: Record<BookmarkType, string> = {
  website: 'var(--cyan)',
  prompt: 'var(--purple)',
  post: 'var(--green)',
  news: 'var(--pink)',
};

function BookmarkRow({ item, onDelete }: { item: Bookmark; onDelete: (id: string) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px 0',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          flexShrink: 0,
          border: '1px solid var(--border)',
          color: typeColor[item.type],
        }}
      >
        <BookmarkIcon size={18} filled />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <Link
            href={item.url}
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
            {item.title}
          </Link>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '2px 7px',
              border: `1px solid ${typeColor[item.type]}`,
              color: typeColor[item.type],
            }}
          >
            {typeLabel[item.type]}
          </span>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span>{item.category}</span>
          <span>·</span>
          <span>Saved {item.savedAt}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link
          href={item.url}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: '1px solid var(--border)',
            color: 'var(--text-dim)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--gold)';
            e.currentTarget.style.color = 'var(--gold)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-dim)';
          }}
        >
          <ExternalLinkIcon size={14} />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: '1px solid var(--border)',
            color: 'var(--text-dim)',
            background: 'transparent',
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
          <TrashIcon size={14} />
        </button>
      </div>
    </div>
  );
}

export default function BookmarksPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<BookmarkType | 'all'>('all');
  const [bookmarks, setBookmarks] = useState(initialBookmarks);

  const filtered = bookmarks.filter((b) => {
    const matchesQuery = b.title.toLowerCase().includes(query.toLowerCase()) || b.category.toLowerCase().includes(query.toLowerCase());
    const matchesType = filter === 'all' || b.type === filter;
    return matchesQuery && matchesType;
  });

  const handleDelete = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <SettingsShell
      title="Bookmarks"
      subtitle="Everything you have saved from across GHRANK."
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
                placeholder="Search bookmarks..."
                style={{ paddingLeft: '34px', minWidth: 'unset', width: '100%' }}
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as BookmarkType | 'all')}
              style={{
                padding: '9px 28px 9px 12px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b949e' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
              }}
            >
              <option value="all">All Types</option>
              <option value="website">Websites</option>
              <option value="prompt">Prompts</option>
              <option value="post">Posts</option>
              <option value="news">News</option>
            </select>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              {filtered.length} saved
            </div>
          </div>

          {filtered.length > 0 ? (
            filtered.map((item) => <BookmarkRow key={item.id} item={item} onDelete={handleDelete} />)
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
              {query || filter !== 'all' ? 'No bookmarks match your filters.' : 'You have not saved anything yet.'}
            </div>
          )}
        </section>
      </div>
    </SettingsShell>
  );
}

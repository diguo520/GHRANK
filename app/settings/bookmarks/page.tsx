/**
 * Bookmarks —— content saved via the site bookmark button
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import SettingsShell from '../_components/SettingsShell';
import { TextInput, panelStyle } from '../_components/SettingsForm';
import { BookmarkIcon, SearchIcon, ExternalLinkIcon, TrashIcon } from '@/components/shared/icons';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';

// 仅保留社区帖子类型；website/prompt/news 等频道将来作为社区插件模块出现
type BookmarkType = 'post';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  type: BookmarkType;
  category: string;
  savedAt: string;
}

const initialBookmarks: Bookmark[] = [
  { id: '3', title: 'React Fiber Architecture Deep Dive', url: '/community/post/react-fiber', type: 'post', category: 'Community', savedAt: '3 days ago' },
  { id: '5', title: 'LLM Training Best Practices', url: '/community/post/llm-training', type: 'post', category: 'Community', savedAt: '5 days ago' },
  { id: '6', title: 'RAG Pipeline Optimization', url: '/community/post/rag-pipeline', type: 'post', category: 'Community', savedAt: '1 week ago' },
];

const typeLabel: Record<BookmarkType, string> = {
  post: 'Post',
};

const typeColor: Record<BookmarkType, string> = {
  post: 'var(--green)',
};

// 书签类型过滤选项：value 驱动 selectedKeys，label 驱动展示文案
const FILTER_OPTIONS: { value: BookmarkType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'post', label: 'Posts' },
];

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

  // 构造类型过滤下拉菜单项（value → key 对齐 antd Menu 约定）
  const filterItems: MenuProps['items'] = FILTER_OPTIONS.map((opt) => ({
    key: opt.value,
    label: opt.label,
  }));
  // 当前选中类型的展示文案（防御性回退到 filter 原值）
  const selectedFilterLabel = FILTER_OPTIONS.find((opt) => opt.value === filter)?.label ?? filter;

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

            <Dropdown
              trigger={['click']}
              menu={{
                items: filterItems,
                selectable: true,
                selectedKeys: [filter],
                onClick: ({ key }) => setFilter(key as BookmarkType | 'all'),
              }}
            >
              <button
                type="button"
                style={{
                  padding: '9px 28px 9px 12px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {selectedFilterLabel} ▾
              </button>
            </Dropdown>

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

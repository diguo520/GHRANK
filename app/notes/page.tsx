/**
 * Notes —— 用户笔记系统
 *
 * 支持：
 * - 左侧分类栏（创建 / 删除 / 重命名分类）
 * - 中间笔记标题列表（按分类过滤 + 搜索）
 * - 右侧富文本编辑器实时编辑选中笔记
 */
'use client';

import { useState, useMemo } from 'react';
import {
  FileTextIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
} from '../_components/icons';

/* ═══ 类型 ═══ */

interface Note {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
}

/* ═══ 初始数据 ═══ */

const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'All Notes' },
  { id: 'research', name: 'Research' },
  { id: 'prompts', name: 'Prompts' },
  { id: 'ideas', name: 'Ideas' },
];

const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    categoryId: 'research',
    title: 'React Fiber architecture notes',
    content: '- Double buffering with current / work-in-progress trees\n- Time slicing via shouldYield()\n- Priority lanes for updates\n\nNeed to read the reconciler source next.',
    updatedAt: '2 hours ago',
  },
  {
    id: '2',
    categoryId: 'prompts',
    title: 'Cinematic portrait prompt',
    content: 'A portrait of a cyberpunk hacker, neon rim light, shallow depth of field, 85mm lens, cinematic color grading, Unreal Engine 5 render.',
    updatedAt: '1 day ago',
  },
  {
    id: '3',
    categoryId: 'ideas',
    title: 'GitHub leaderboard feature ideas',
    content: '- Add repo language filters\n- Weekly velocity metric\n- Contributor consistency score\n- Integration with GHRANK wallet for bounties',
    updatedAt: '3 days ago',
  },
];

/* ═══ 样式常量 ═══ */

const panelStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '4px',
};

const sectionTitleStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
};

/* ═══ 图标补充：文件夹与更多菜单（不存在于统一图标库时本地定义） ═══ */

function FolderIconLocal({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/* ═══ 子组件 ═══ */

/** 分类侧边栏 */
function CategorySidebar({
  categories,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
}: {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setNewName('');
  };

  const startRename = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const submitRename = () => {
    const trimmed = editName.trim();
    if (editingId && trimmed) {
      onRename(editingId, trimmed);
    }
    setEditingId(null);
  };

  return (
    <aside
      style={{
        ...panelStyle,
        width: '240px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 140px)',
        position: 'sticky',
        top: '90px',
      }}
    >
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ ...sectionTitleStyle, marginBottom: '10px' }}>Notebooks</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New notebook"
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            style={{
              flex: 1,
              padding: '7px 10px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '3px',
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={handleCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              background: 'var(--gold)',
              border: 'none',
              borderRadius: '3px',
              color: 'var(--bg)',
              cursor: 'pointer',
            }}
          >
            <PlusIcon size={16} />
          </button>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {categories.map((cat) => {
          const isActive = selectedId === cat.id;
          const isEditing = editingId === cat.id;
          const isBuiltin = cat.id === 'all';

          return (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '3px',
                background: isActive ? 'rgba(245, 197, 24, 0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                marginBottom: '4px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(245, 197, 24, 0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <button
                type="button"
                onClick={() => onSelect(cat.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? 'var(--gold)' : 'var(--text-dim)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {isBuiltin ? <FileTextIcon size={16} /> : <FolderIconLocal size={16} />}
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={submitRename}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') setEditingId(null); }}
                    autoFocus
                    style={{
                      flex: 1,
                      padding: '2px 6px',
                      background: 'var(--bg)',
                      border: '1px solid var(--gold)',
                      borderRadius: '3px',
                      color: 'var(--text)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span style={{ flex: 1 }}>{cat.name}</span>
                )}
              </button>

              {!isBuiltin && !isEditing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => startRename(cat)}
                    title="Rename"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '22px',
                      height: '22px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      borderRadius: '3px',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    <EditIcon size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(cat.id)}
                    title="Delete"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '22px',
                      height: '22px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      borderRadius: '3px',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    <TrashIcon size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

/** 笔记列表 */
function NoteList({
  notes,
  selectedId,
  onSelect,
  onDelete,
  search,
  onSearch,
}: {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  search: string;
  onSearch: (value: string) => void;
}) {
  return (
    <div
      style={{
        ...panelStyle,
        width: '280px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 140px)',
      }}
    >
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ position: 'relative' }}>
          <SearchIcon
            size={14}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search notes..."
            style={{
              width: '100%',
              padding: '7px 10px 7px 30px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '3px',
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {notes.length > 0 ? (
          notes.map((note) => {
            const isActive = selectedId === note.id;
            const preview = note.content.slice(0, 80).replace(/\n/g, ' ') + (note.content.length > 80 ? '…' : '');
            return (
              <button
                key={note.id}
                type="button"
                onClick={() => onSelect(note.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  marginBottom: '6px',
                  background: isActive ? 'rgba(245, 197, 24, 0.08)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--gold)' : 'transparent'}`,
                  borderRadius: '3px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(245, 197, 24, 0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: isActive ? 'var(--gold)' : 'var(--text)',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {note.title || 'Untitled note'}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--text-dim)',
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    marginBottom: '6px',
                  }}
                >
                  {preview || 'No additional content'}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {note.updatedAt}
                </div>
              </button>
            );
          })
        ) : (
          <div
            style={{
              padding: '32px 0',
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-muted)',
            }}
          >
            {search ? 'No notes match your search.' : 'No notes in this notebook yet.'}
          </div>
        )}
      </div>
    </div>
  );
}

/** 笔记编辑器 */
function NoteEditor({
  note,
  categories,
  onChange,
  onDelete,
}: {
  note: Note | null;
  categories: Category[];
  onChange: (patch: Partial<Note>) => void;
  onDelete: (id: string) => void;
}) {
  if (!note) {
    return (
      <div
        style={{
          ...panelStyle,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          minHeight: '400px',
        }}
      >
        <FileTextIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
          Select a note to start editing
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>
          Choose a note from the list or create a new one.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        ...panelStyle,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '400px',
      }}
    >
      {/* 编辑器工具栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          value={note.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Note title"
          style={{
            flex: 1,
            minWidth: '180px',
            padding: '8px 12px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '3px',
            color: 'var(--text)',
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: 700,
            outline: 'none',
          }}
        />
        <select
          value={note.categoryId}
          onChange={(e) => onChange({ categoryId: e.target.value })}
          style={{
            padding: '8px 28px 8px 12px',
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
          {categories
            .filter((c) => c.id !== 'all')
            .map((c) => (
              <option key={c.id} value={c.id} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                {c.name}
              </option>
            ))}
        </select>
        <button
          type="button"
          onClick={() => onDelete(note.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '3px',
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--danger)';
            e.currentTarget.style.color = 'var(--danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-dim)';
          }}
        >
          <TrashIcon size={14} />
          Delete
        </button>
      </div>

      {/* 文本域 */}
      <textarea
        value={note.content}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder="Start writing..."
        style={{
          flex: 1,
          minHeight: '400px',
          padding: '18px',
          background: 'var(--bg)',
          border: 'none',
          borderRadius: 0,
          color: 'var(--text)',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          lineHeight: 1.7,
          resize: 'none',
          outline: 'none',
        }}
      />

      {/* 底部状态栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 18px',
          borderTop: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        <span>{note.content.length} characters</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckIcon size={12} style={{ color: 'var(--green)' }} />
          Auto-saved
        </span>
      </div>
    </div>
  );
}

/* ═══ 主页面 ═══ */

export default function NotesPage() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const visibleNotes = useMemo(() => {
    let list = notes;
    if (selectedCategoryId !== 'all') {
      list = list.filter((n) => n.categoryId === selectedCategoryId);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }
    return list;
  }, [notes, selectedCategoryId, search]);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  const createNote = () => {
    const categoryId = selectedCategoryId === 'all' ? (categories.find((c) => c.id !== 'all')?.id || 'research') : selectedCategoryId;
    const newNote: Note = {
      id: Math.random().toString(36).slice(2),
      categoryId,
      title: 'New note',
      content: '',
      updatedAt: 'just now',
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  };

  const updateNote = (patch: Partial<Note>) => {
    if (!selectedNote) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedNote.id
          ? { ...n, ...patch, updatedAt: 'just now' }
          : n
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  const createCategory = (name: string) => {
    const newCat: Category = { id: Math.random().toString(36).slice(2), name };
    setCategories((prev) => [...prev, newCat]);
  };

  const renameCategory = (id: string, name: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setNotes((prev) => prev.filter((n) => n.categoryId !== id));
    if (selectedCategoryId === id) setSelectedCategoryId('all');
  };

  return (
    <main className="main-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px 64px' }}>
      <header style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '26px',
                fontWeight: 800,
                color: 'var(--text)',
                letterSpacing: '-0.01em',
                margin: '0 0 6px',
              }}
            >
              Notes
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dim)', margin: 0 }}>
              Your personal notebooks. Create categories, capture ideas, and keep everything in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={createNote}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'var(--gold)',
              border: 'none',
              borderRadius: '3px',
              color: 'var(--bg)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            <PlusIcon size={16} />
            New Note
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
        <CategorySidebar
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          onCreate={createCategory}
          onDelete={deleteCategory}
          onRename={renameCategory}
        />
        <NoteList
          notes={visibleNotes}
          selectedId={selectedNoteId}
          onSelect={setSelectedNoteId}
          onDelete={deleteNote}
          search={search}
          onSearch={setSearch}
        />
        <NoteEditor
          note={selectedNote}
          categories={categories}
          onChange={updateNote}
          onDelete={deleteNote}
        />
      </div>
    </main>
  );
}

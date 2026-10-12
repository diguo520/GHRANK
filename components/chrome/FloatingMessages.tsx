/**
 * FloatingMessages —— 全局浮动消息组件（Facebook/Twitter 风格）
 *
 * 右下角浮动气泡 + 展开面板：
 * 1. 浮动气泡：56px 圆形按钮，未读数 badge，固定右下角
 * 2. 会话列表面板：360px 宽，搜索 + 会话列表
 * 3. 聊天面板：选中会话后显示气泡流 + 输入框
 *
 * 在 /messages 页面不渲染（避免与全页面模式重复）
 */
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search as LucideSearch,
  X as LucideClose,
  Send as LucideSend,
  ChevronLeft as LucideChevLeft,
  Mail as LucideMail,
} from 'lucide-react';
import { useMockFeed, type NewItemMarker } from '@/app/_components/MockFeedContext';
import {
  CONVERSATIONS,
  type Conversation,
  type ChatBubble,
} from '@/lib/data/messages-data';
import { isImageAvatar } from '@/lib/avatar';

/* ══════════════════════════════════════════════════════
   头像组件（与 messages/page.tsx 一致）
   ══════════════════════════════════════════════════════ */

function Avatar({ src, size = 40, name }: { src: string; size?: number; name: string }) {
  const useImg = isImageAvatar(src);
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
        background: useImg ? 'var(--surface-overlay)' : 'var(--gold-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {useImg ? (
        <img src={src} alt={`${name} avatar`} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
      ) : (
        <span
          className="font-display"
          style={{
            color: 'var(--gold)',
            fontWeight: 800,
            lineHeight: 1,
            userSelect: 'none',
            fontSize: size >= 48 ? (src.length >= 3 ? 16 : 22) : (src.length >= 3 ? 12 : 15),
          }}
        >
          {src}
        </span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   气泡组件（简化版，复用 messages/page.tsx 逻辑）
   ══════════════════════════════════════════════════════ */

function Bubble({ b }: { b: ChatBubble }) {
  const mine = b.fromMe;
  return (
    <div style={{
      display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start',
      marginBottom: 6,
    }}>
      <div style={{ maxWidth: '78%' }}>
        <div
          style={{
            padding: '8px 12px',
            borderRadius: mine ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
            background: mine
              ? 'linear-gradient(180deg, rgba(212,175,55,0.95), rgba(168,140,38,0.95))'
              : 'var(--surface)',
            color: mine ? '#1a1708' : 'var(--text)',
            border: mine
              ? '1px solid rgba(212,175,55,0.5)'
              : '1px solid var(--border-subtle)',
            fontSize: 13,
            lineHeight: 1.4,
            wordBreak: 'break-word',
            fontFamily: 'var(--font-body)',
          }}
        >
          {b.text}
        </div>
        <div className="meta-hud-mono" style={{
          marginTop: 3,
          fontSize: 9,
          color: 'var(--text-muted)',
          display: 'flex',
          gap: 4,
          justifyContent: mine ? 'flex-end' : 'flex-start',
        }}>
          <span>{b.timestamp}</span>
          {mine && b.status && (
            <span>{b.status === 'read' ? '· Seen' : b.status === 'delivered' ? '· Sent' : ''}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   会话列表行
   ══════════════════════════════════════════════════════ */

function ConversationRow({
  convo, active, isNew, onSelect,
}: {
  convo: Conversation;
  active: boolean;
  isNew: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(convo.id)}
      style={{
        display: 'flex',
        width: '100%',
        textAlign: 'left',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 12px',
        background: active
          ? 'rgba(157, 140, 255, 0.06)'
          : isNew
          ? 'rgba(157, 140, 255, 0.04)'
          : 'transparent',
        border: 'none',
        borderTop: `1px solid var(--border-subtle)`,
        cursor: 'pointer',
        color: 'inherit',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--surface)'; }}
      onMouseLeave={(e) => {
        if (active) return;
        e.currentTarget.style.background = isNew ? 'rgba(157, 140, 255, 0.04)' : 'transparent';
      }}
    >
      <Avatar src={convo.avatar} size={40} name={convo.displayName} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span className="font-display truncate" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
            {convo.displayName}
          </span>
          <span className="meta-hud-mono" style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
            {convo.lastTime}
          </span>
        </div>
        <div className="font-body" style={{
          marginTop: 2,
          fontSize: 12,
          color: convo.read ? 'var(--text-dim)' : 'var(--text)',
          fontWeight: convo.read ? 400 : 600,
          lineHeight: 1.35,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {convo.preview}
        </div>
      </div>
      {!convo.read && (
        <span style={{
          width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)',
          flexShrink: 0, marginTop: 10,
          boxShadow: '0 0 5px rgba(157, 140, 255, 0.6)',
        }} aria-label="unread" />
      )}
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   主组件
   ══════════════════════════════════════════════════════ */

export default function FloatingMessages() {
  const pathname = usePathname();
  const feed = useMockFeed();

  // /messages 页面不渲染浮动气泡
  if (pathname === '/messages') return null;

  const [open, setOpen] = useState(false);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [bubbles, setBubbles] = useState<ChatBubble[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 数据源：优先 MockFeedContext 动态列表，兜底静态数据
  const conversations: Conversation[] =
    feed.conversations?.length ? feed.conversations : CONVERSATIONS;

  // 未读总数
  const unreadCount = useMemo(
    () => conversations.filter((c) => !c.read).length,
    [conversations],
  );

  // 新消息标记
  const newConvIds = useMemo(
    () => new Set(
      (feed.newMarkers || [])
        .filter((m: NewItemMarker) => m.kind === 'chat')
        .map((m: NewItemMarker) => m.id),
    ),
    [feed.newMarkers],
  );

  // 过滤会话
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) => c.user.toLowerCase().includes(q) ||
             c.displayName.toLowerCase().includes(q) ||
             c.preview.toLowerCase().includes(q),
    );
  }, [search, conversations]);

  // 当前选中会话
  const activeConvo = conversations.find((c) => c.id === activeConvoId) ?? null;

  // 选中会话时加载气泡 + 滚动到底
  useEffect(() => {
    if (!activeConvo) { setBubbles([]); return; }
    setBubbles(activeConvo.bubbles);
    setDraft('');
    requestAnimationFrame(() => {
      const r = scrollRef.current;
      if (r) r.scrollTop = r.scrollHeight;
    });
  }, [activeConvoId, activeConvo?.bubbles]);

  // 标记已读
  useEffect(() => {
    if (activeConvo && !activeConvo.read) {
      feed.markConversationRead(activeConvo.id);
    }
  }, [activeConvo?.id, activeConvo?.read]);

  // 发送消息
  function send() {
    const text = draft.trim();
    if (!text || !activeConvo) return;
    const now = new Date();
    const hh = now.getHours() % 12 || 12;
    const mm = `${now.getMinutes()}`.padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    const nextBubble: ChatBubble = {
      id: `me-${Date.now()}`,
      fromMe: true,
      text,
      timestamp: `${hh}:${mm} ${ampm}`,
      status: 'delivered',
    };
    setBubbles((prev) => [...prev, nextBubble]);
    setDraft('');
    requestAnimationFrame(() => {
      const r = scrollRef.current;
      if (r) r.scrollTop = r.scrollHeight;
    });
  }

  // 选择会话
  function selectConvo(id: string) {
    setActiveConvoId(id);
    feed.markConversationRead(id);
  }

  // 返回列表
  function backToList() {
    setActiveConvoId(null);
  }

  return (
    <>
      {/* 浮动气泡按钮 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close messages' : 'Open messages'}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: '1px solid rgba(157,140,255,0.3)',
          background: open
            ? 'var(--surface)'
            : 'linear-gradient(135deg, rgba(157,140,255,0.15), rgba(157,140,255,0.05))',
          backdropFilter: 'blur(12px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
          boxShadow: open
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(157,140,255,0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 900,
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s',
          transform: open ? 'rotate(0deg)' : 'none',
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.35), 0 0 0 1px rgba(157,140,255,0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(157,140,255,0.1)';
          }
        }}
      >
        {open ? (
          <LucideClose size={22} strokeWidth={1.8} style={{ color: 'var(--text)' }} />
        ) : (
          <LucideMail size={22} strokeWidth={1.8} style={{ color: 'var(--gold)' }} />
        )}
        {/* 未读 badge */}
        {!open && unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -2,
            right: -2,
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            background: 'var(--gold)',
            color: '#1a1708',
            fontSize: 11,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 5px',
            border: '2px solid var(--bg)',
            boxShadow: '0 2px 8px rgba(157,140,255,0.4)',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 展开面板 */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 92,
            right: 24,
            width: activeConvo ? 400 : 360,
            height: 500,
            maxHeight: 'calc(100vh - 120px)',
            borderRadius: 14,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(157,140,255,0.05)',
            zIndex: 899,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'floating-msg-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {activeConvo ? (
            /* ═══ 聊天面板 ═══ */
            <>
              {/* 标题栏 */}
              <header style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 14px',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                <button
                  type="button"
                  onClick={backToList}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 30, height: 30, background: 'transparent', border: 'none',
                    color: 'var(--text-dim)', borderRadius: '50%', cursor: 'pointer',
                  }}
                >
                  <LucideChevLeft size={18} strokeWidth={2} />
                </button>
                <Avatar src={activeConvo.avatar} size={32} name={activeConvo.displayName} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-display truncate" style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>
                    {activeConvo.displayName}
                  </div>
                  <span className="meta-hud-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    @{activeConvo.user}
                  </span>
                </div>
                <Link
                  href={`/messages?id=${encodeURIComponent(activeConvo.id)}`}
                  style={{
                    fontSize: 10,
                    color: 'var(--gold)',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.04em',
                  }}
                >
                  OPEN →
                </Link>
              </header>

              {/* 气泡流 */}
              <div
                ref={scrollRef}
                className="chat-bubble-scroll"
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {bubbles.map((b) => (
                  <Bubble key={b.id} b={b} />
                ))}
              </div>

              {/* 输入框 */}
              <footer style={{
                flexShrink: 0,
                padding: '10px 14px',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: 999,
                }}>
                  <textarea
                    rows={1}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                    }}
                    placeholder="Send a message..."
                    className="font-body"
                    style={{
                      flex: 1,
                      resize: 'none',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text)',
                      fontSize: 13,
                      lineHeight: 1.4,
                      padding: '2px 0',
                      maxHeight: 100,
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={send}
                    disabled={!draft.trim()}
                    title="Send"
                    style={{
                      width: 32, height: 32,
                      borderRadius: '50%',
                      background: draft.trim()
                        ? 'linear-gradient(180deg, rgba(212,175,55,0.95), rgba(168,140,38,0.95))'
                        : 'transparent',
                      color: draft.trim() ? '#1a1708' : 'var(--text-muted)',
                      border: `1px solid ${draft.trim() ? 'rgba(212,175,55,0.5)' : 'var(--border-subtle)'}`,
                      cursor: draft.trim() ? 'pointer' : 'not-allowed',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <LucideSend size={14} strokeWidth={1.9} />
                  </button>
                </div>
              </footer>
            </>
          ) : (
            /* ═══ 会话列表面板 ═══ */
            <>
              {/* 标题栏 */}
              <header style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px 10px',
              }}>
                <h2 className="font-display" style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                  Messages
                </h2>
                <Link
                  href="/messages"
                  style={{
                    fontSize: 11,
                    color: 'var(--gold)',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.04em',
                  }}
                >
                  Open inbox →
                </Link>
              </header>

              {/* 搜索 */}
              <div style={{ padding: '0 12px 10px', flexShrink: 0 }}>
                <label style={{ position: 'relative', display: 'block' }}>
                  <span style={{
                    position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', opacity: 0.8,
                  }}>
                    <LucideSearch size={14} strokeWidth={1.8} />
                  </span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search messages"
                    className="font-body"
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 30px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 999,
                      color: 'var(--text)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </label>
              </div>

              {/* 会话列表 */}
              <div className="chat-bubble-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {filtered.map((c) => (
                  <ConversationRow
                    key={c.id}
                    convo={c}
                    active={false}
                    isNew={newConvIds.has(c.id)}
                    onSelect={selectConvo}
                  />
                ))}
                {filtered.length === 0 && (
                  <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                    No conversations found
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* 入场动画 */}
      <style jsx global>{`
        @keyframes floating-msg-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}

/**
 * Messages / 站内信（X Twitter DM 三栏模式）
 *
 *  三栏骨架（X / Twitter Direct Messages 风格）：
 *   ┌────────── 280px ─────────┬─────────────── 1fr ───────────────┬─────── 320px ────────┐
 *   │ LEFT · 对话列表          │ MIDDLE · 气泡聊天 + 输入框        │ RIGHT · 会话详情    │
 *   │  · 搜索 / 新建           │  · 会话标题栏（对方头像/名/设置）│  · 共享 Prompts     │
 *   │  · 会话行 avatar+预览    │  · 气泡流（自己发/对方发）        │  · 共享媒体数       │
 *   │  · pinned + 未读圆点    │  · 附件卡片（prompts/media）      │  · 静音/屏蔽/举报   │
 *   └──────────────────────────┴───────────────────────────────────┴─────────────────────┘
 *
 *  响应式：
 *   - lg (≥1280px)：三栏全开
 *   - md (≥768px)：左 + 中两栏，右栏可关
 *   - < md：根据选中状态在「列表」与「对话」之间切换
 *
 *  相关链接：
 *   - SideNav Mail 图标 → /messages
 *   - SideNav Drawer Messages → 底部「Open Messages inbox →」→ /messages
 *   - 每条对话右侧的 shared.prompts 有 /prompt-detail 链接
 */
'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search as LucideSearch,
  PenSquare as LucideNew,
  Info as LucideInfo,
  Phone as LucidePhone,
  Video as LucideVideo,
  MoreHorizontal as LucideMore,
  ChevronLeft as LucideChevLeft,
  Image as LucideMedia,
  Link2 as LucideLink,
  Bookmark as LucideBookmark,
  Volume2 as LucideBellOn,
  VolumeX as LucideBellOff,
  Ban as LucideBan,
  Flag as LucideFlag,
  Send as LucideSend,
  Paperclip as LucideClip,
  Smile as LucideEmoji,
} from 'lucide-react';
import { useMockFeed, type NewItemMarker } from '@/app/_components/MockFeedContext';
import {
  CONVERSATIONS, findConversation,
  type Conversation, type ChatBubble,
} from '@/lib/data/messages-data';
import type { ReactNode } from 'react';
import { isImageAvatar } from '@/lib/avatar';

/* ══════════════════════════════════════════════════════
   小组件
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

function Icon({ children, title, size = 16, onClick, color = 'var(--text-dim)', active }:
  { children: ReactNode; title: string; size?: number; onClick?: () => void; color?: string; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        width: size + 12, height: size + 12,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'rgba(157,140,255,0.08)' : 'transparent',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        color,
      }}
    >
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   LEFT —— 对话列表
   ══════════════════════════════════════════════════════ */

function ConversationList({
  search, setSearch, activeId, onSelect,
  conversations,
  newMarkers,
}: {
  search: string; setSearch: (v: string) => void;
  activeId: string; onSelect: (id: string) => void;
  conversations: Conversation[];
  newMarkers: NewItemMarker[];
}) {
  const router = useRouter();
  const newConvIds = new Set(
    newMarkers.filter((m) => m.kind === 'chat').map((m) => m.id),
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) => c.user.toLowerCase().includes(q) ||
             c.displayName.toLowerCase().includes(q) ||
             c.preview.toLowerCase().includes(q),
    );
  }, [search, conversations]);

  // pinned + 其余按 read 分组显示
  const pinned = filtered.filter((c) => c.pinned);
  const others = filtered.filter((c) => !c.pinned);

  function Row({ c }: { c: Conversation }) {
    const active = c.id === activeId;
    const isNew = newConvIds.has(c.id);
    return (
      <button
        type="button"
        onClick={() => onSelect(c.id)}
        style={{
          display: 'flex',
          width: '100%',
          textAlign: 'left',
          alignItems: 'flex-start',
          gap: 12,
          padding: '12px 12px',
          background: active
            ? 'rgba(157, 140, 255, 0.06)'
            : isNew
            ? 'rgba(157, 140, 255, 0.05)'
            : 'transparent',
          border: 'none',
          borderTop: `1px solid ${isNew ? 'rgba(157, 140, 255, 0.3)' : 'var(--border-subtle)'}`,
          cursor: 'pointer',
          transition: 'background 0.15s, box-shadow 0.3s',
          color: 'inherit',
          boxShadow: isNew
            ? 'inset 3px 0 0 rgba(157, 140, 255, 0.65)'
            : 'none',
          animation: isNew ? 'push-in 0.38s cubic-bezier(.2,.8,.2,1)' : 'none',
        }}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--surface)'; }}
        onMouseLeave={(e) => {
          if (active) return;
          e.currentTarget.style.background = isNew ? 'rgba(157, 140, 255, 0.05)' : 'transparent';
        }}
      >
        <Avatar src={c.avatar} size={48} name={c.displayName} />
        <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <span className="font-display truncate" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                {c.displayName}
              </span>
              {c.muted && <LucideBellOff size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
              {c.pinned && <span title="Pinned" style={{ color: 'var(--gold)', fontSize: 12 }}>📌</span>}
            </div>
            <span className="meta-hud-mono" style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
              {c.lastTime}
            </span>
          </div>
          <div className="font-body" style={{
            marginTop: 2,
            fontSize: 13,
            color: c.read ? 'var(--text-dim)' : 'var(--text)',
            fontWeight: c.read ? 400 : 600,
            lineHeight: 1.35,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {c.preview}
          </div>
        </div>
        {!c.read && (
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)',
            flexShrink: 0, marginTop: 12,
            boxShadow: '0 0 6px rgba(157, 140, 255, 0.6)',
          }} aria-label="unread" />
        )}
      </button>
    );
  }

  return (
    <aside
      style={{
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid var(--border-subtle)',
        height: '100%',
        background: 'var(--surface)',
      }}
    >
      {/* 顶部：标题 + 新建 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 16px 8px',
      }}>
        <h1 className="font-display" style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--text)' }}>
          Messages
        </h1>
        <Icon title="New message" size={16} onClick={() => router.push('/messages?new=1')} color="var(--gold)">
          <LucideNew size={16} strokeWidth={1.8} />
        </Icon>
      </div>

      {/* 搜索框 */}
      <div style={{ padding: '0 12px 12px' }}>
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
            placeholder="Search direct messages"
            className="font-body"
            style={{
              width: '100%',
              padding: '9px 10px 9px 32px',
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

      {/* 列表 */}
      <div className="chat-bubble-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {pinned.map((c) => <Row key={c.id} c={c} />)}
        {others.map((c) => <Row key={c.id} c={c} />)}
        {filtered.length === 0 && (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No conversations match “{search}”.
          </div>
        )}
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════════════
   MIDDLE —— 气泡聊天窗口
   ══════════════════════════════════════════════════════ */

function Bubble({ b, isNew }: { b: ChatBubble; isNew?: boolean }) {
  const mine = b.fromMe;
  return (
    <div style={{
      display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start',
      marginBottom: 8,
      animation: !mine && isNew ? 'bubble-in 0.42s cubic-bezier(.2,.8,.2,1)' : 'none',
      transformOrigin: mine ? 'right bottom' : 'left bottom',
    }}>
      <div style={{ maxWidth: '72%' }}>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: mine ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
            background: mine
              ? 'linear-gradient(180deg, rgba(212,175,55,0.95), rgba(168,140,38,0.95))'
              : isNew
              ? 'rgba(157, 140, 255, 0.08)'
              : 'var(--surface)',
            color: mine ? '#1a1708' : 'var(--text)',
            border: mine
              ? '1px solid rgba(212,175,55,0.5)'
              : isNew
              ? '1px solid rgba(157, 140, 255, 0.45)'
              : '1px solid var(--border-subtle)',
            boxShadow:
              !mine && isNew
                ? '0 8px 24px -14px rgba(157, 140, 255, 0.7), 0 0 0 2px rgba(157, 140, 255, 0.10)'
                : 'none',
            fontSize: 14,
            lineHeight: 1.45,
            wordBreak: 'break-word',
            fontFamily: 'var(--font-body)',
          }}
        >
          {b.text}
        </div>
        {b.attachments?.map((a, idx) => (
          <Link
            key={idx}
            href={a.href ?? '#'}
            style={{
              display: 'block', marginTop: 6,
              padding: '10px 12px', borderRadius: 12,
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div className="meta-hud-mono" style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {a.kind === 'prompt' ? 'Shared Prompt' : a.kind === 'image' ? 'Shared Image' : 'Shared File'}
            </div>
            <div className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>{a.title}</div>
            {a.subtitle && <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.subtitle}</div>}
          </Link>
        ))}
        <div className="meta-hud-mono" style={{
          marginTop: 4,
          fontSize: 10,
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          justifyContent: mine ? 'flex-end' : 'flex-start',
        }}>
          <span>{b.timestamp}</span>
          {mine && b.status && (
            <span title={b.status}>
              {b.status === 'read' ? 'Seen' : b.status === 'delivered' ? 'Delivered' : b.status === 'sent' ? 'Sent' : 'Sending…'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatMiddle({
  convo, onBack, onToggleInfo, infoOpen,
  newMarkers,
}: {
  convo: Conversation; onBack: () => void; onToggleInfo: () => void; infoOpen: boolean;
  newMarkers: NewItemMarker[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');
  const [bubbles, setBubbles] = useState<ChatBubble[]>(convo.bubbles);

  // 最近 push 的气泡 id → 用于滑入动画（对来自对方的新气泡）
  const newBubbleIds = useMemo(
    () =>
      new Set(
        newMarkers
          .filter((m) => m.kind === 'chat' && m.conversationId === convo.id)
          .map((m) => m.id),
      ),
    [newMarkers, convo.id],
  );

  // 切对话时重置气泡 + 滚动到底
  useEffect(() => {
    setBubbles(convo.bubbles);
    setDraft('');
    const r = scrollRef.current;
    if (r) r.scrollTop = r.scrollHeight;
  }, [convo.id, convo.bubbles]);

  // 当有新气泡（来自 Context push）时滚动到底
  useEffect(() => {
    if (newBubbleIds.size === 0) return;
    requestAnimationFrame(() => {
      const r = scrollRef.current;
      if (r) r.scrollTo({ top: r.scrollHeight, behavior: 'smooth' });
    });
  }, [newBubbleIds, bubbles.length]);

  function send() {
    const text = draft.trim();
    if (!text) return;
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

  return (
    <section style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minWidth: 0,
      minHeight: 0, // 关键：允许子 flex:1 项收缩
      overflow: 'hidden',
    }}>
      {/* 标题栏 —— flex-shrink:0 不被压缩 */}
      <header style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface)',
      }}>
        <button type="button" onClick={onBack} title="Back" className="back-to-list"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, background: 'transparent', border: 'none',
            color: 'var(--text-dim)', borderRadius: '50%', cursor: 'pointer',
          }}>
          <LucideChevLeft size={18} strokeWidth={2} />
        </button>
        <Avatar src={convo.avatar} size={36} name={convo.displayName} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="font-display truncate" style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>
              {convo.displayName}
            </span>
            {convo.verified && (
              <span title="Verified" style={{ color: 'var(--gold)', fontSize: 14 }}>✓</span>
            )}
          </div>
          <Link
            href={`/profile?user=${encodeURIComponent(convo.user)}`}
            className="meta-hud-mono"
            style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            @{convo.user}
          </Link>
        </div>
        <Icon title="Call"><LucidePhone size={16} strokeWidth={1.8} /></Icon>
        <Icon title="Video"><LucideVideo size={16} strokeWidth={1.8} /></Icon>
        <Icon title="Info" active={infoOpen} onClick={onToggleInfo} color={infoOpen ? 'var(--gold)' : 'var(--text-dim)'}>
          <LucideInfo size={16} strokeWidth={1.8} />
        </Icon>
        <Icon title="More"><LucideMore size={16} strokeWidth={1.8} /></Icon>
      </header>

      {/* 气泡流 —— flex:1 填充剩余空间，内容多时内部滚动，滚动条隐藏 */}
      <div
        ref={scrollRef}
        className="chat-bubble-scroll"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px 20px 12px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 聊天开始分隔线 */}
        <div style={{ textAlign: 'center', margin: '8px 0 20px' }}>
          <span className="meta-hud-mono" style={{
            display: 'inline-block',
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            padding: '4px 10px',
            borderRadius: 999,
            border: '1px solid var(--border-subtle)',
            background: 'var(--surface)',
          }}>
            Conversation started · 56 messages
          </span>
        </div>
        {bubbles.map((b) => (
          <Bubble key={b.id} b={b} isNew={newBubbleIds.has(b.id)} />
        ))}
      </div>

      {/* 输入框 —— flex-shrink:0 保证永远在底部可见 */}
      <footer style={{
        flexShrink: 0,
        padding: '12px 16px 16px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--surface)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 10,
          padding: '10px 12px',
          border: '1px solid var(--border)',
          borderRadius: 999,
          background: 'var(--surface)',
        }}>
          <Icon title="Attach"><LucideClip size={16} strokeWidth={1.8} /></Icon>
          <Icon title="Emoji"><LucideEmoji size={16} strokeWidth={1.8} /></Icon>
          <textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder="Start a new message"
            className="font-body"
            style={{
              flex: 1,
              resize: 'none',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text)',
              fontSize: 14,
              lineHeight: 1.4,
              padding: '4px 0',
              maxHeight: 140,
              fontFamily: 'var(--font-body)',
            }}
          />
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim()}
            title="Send"
            style={{
              width: 38, height: 38,
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
            <LucideSend size={16} strokeWidth={1.9} />
          </button>
        </div>
      </footer>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   RIGHT —— 会话详情/共享资产
   ══════════════════════════════════════════════════════ */

function ChatInfo({ convo, onClose }: { convo: Conversation; onClose: () => void }) {
  return (
    <aside style={{
      display: 'flex', flexDirection: 'column',
      borderLeft: '1px solid var(--border-subtle)',
      height: '100%', minWidth: 0,
      background: 'var(--surface)',
    }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <h2 className="font-display" style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
          Conversation info
        </h2>
        <button type="button" onClick={onClose} title="Close" className="close-info"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, background: 'transparent', border: 'none',
            color: 'var(--text-dim)', borderRadius: '50%', cursor: 'pointer',
          }}>
          ×
        </button>
      </header>

      <div style={{ overflowY: 'auto', flex: 1, padding: '16px 16px 40px' }}>
        {/* 用户卡 */}
        <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar src={convo.avatar} size={72} name={convo.displayName} />
          </div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginTop: 10 }}>
            {convo.displayName}{convo.verified ? ' ✓' : ''}
          </div>
          <Link
            href={`/profile?user=${encodeURIComponent(convo.user)}`}
            className="meta-hud-mono"
            style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            @{convo.user}
          </Link>
          {convo.bio && (
            <p className="font-body" style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 10, lineHeight: 1.5 }}>
              {convo.bio}
            </p>
          )}
        </div>

        {/* 操作：静音 / 屏蔽 / 举报 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          padding: '14px 0',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <button type="button" style={rowBtn('var(--text-dim)')}>
            {convo.muted ? <LucideBellOff size={16} strokeWidth={1.8} /> : <LucideBellOn size={16} strokeWidth={1.8} />}
            <span>{convo.muted ? 'Unmute' : 'Mute'}</span>
          </button>
          <button type="button" style={rowBtn('#F472B6')}>
            <LucideBan size={16} strokeWidth={1.8} />
            <span>Block</span>
          </button>
          <button type="button" style={rowBtn('var(--text-dim)')}>
            <LucideFlag size={16} strokeWidth={1.8} />
            <span>Report</span>
          </button>
        </div>

        {/* 共享统计 */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
          padding: '14px 0',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <Stat glyph={<LucideBookmark size={14} strokeWidth={1.8} />} label="Prompts" value={convo.shared.prompts.length.toString()} />
          <Stat glyph={<LucideMedia size={14} strokeWidth={1.8} />}    label="Media"   value={convo.shared.mediaCount.toString()} />
          <Stat glyph={<LucideLink size={14} strokeWidth={1.8} />}    label="Links"   value={convo.shared.linksCount.toString()} />
        </div>

        {/* 共享 Prompts 列表 */}
        {convo.shared.prompts.length > 0 && (
          <div style={{ paddingTop: 14 }}>
            <div className="meta-hud-mono" style={{
              fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
              color: 'var(--text-muted)', marginBottom: 10,
            }}>
              Shared prompts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {convo.shared.prompts.map((p, i) => (
                <Link
                  key={i}
                  href={p.href}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'var(--surface)',
                    border: '1px solid var(--border-subtle)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <span className="font-body truncate" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                    {p.title}
                  </span>
                  <span
                    className="meta-hud-mono"
                    style={{
                      fontSize: 11,
                      color: p.price === 0 ? 'var(--text-muted)' : 'var(--gold)',
                      fontWeight: 700,
                      flexShrink: 0,
                      marginLeft: 6,
                    }}
                  >
                    {p.price === 0 ? 'FREE' : `$${p.price}`}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function rowBtn(color: string): React.CSSProperties {
  return {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 4, padding: '10px 6px',
    background: 'var(--surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 8,
    color,
    fontSize: 11,
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    cursor: 'pointer',
  };
}

function Stat({ glyph, label, value }: { glyph: ReactNode; label: string; value: string }) {
  return (
    <div style={{
      padding: '10px 6px',
      borderRadius: 8,
      background: 'var(--surface)',
      border: '1px solid var(--border-subtle)',
      textAlign: 'center',
    }}>
      <div style={{ display: 'inline-flex', color: 'var(--text-dim)', marginBottom: 4 }}>{glyph}</div>
      <div className="font-display" style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{value}</div>
      <div className="meta-hud-mono" style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{label.toUpperCase()}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   主页面（三栏布局 + 响应式）
   ══════════════════════════════════════════════════════ */

export default function MessagesPage() {
  const router = useRouter();
  const params = useSearchParams();
  const feed = useMockFeed();

  // 以 MockFeedContext 的动态列表为数据源（它会持续合并新消息与未读状态）
  const conversations: Conversation[] =
    feed.conversations?.length ? feed.conversations : CONVERSATIONS;

  // 当前选中会话：URL ?id= 优先，否则 conversations 里的第一条
  const initialId = params?.get('id') ?? conversations[0]?.id ?? CONVERSATIONS[0].id;
  const [activeId, setActiveId] = useState(initialId);
  const [search, setSearch] = useState('');
  const [infoOpen, setInfoOpen] = useState(true);   // X 默认打开右栏
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // 进入页面时若 auto-push 被关闭 → 默认 30s
  useEffect(() => {
    if (feed.currentAutoPushIntervalMs === 0) {
      feed.setAutoPushInterval(30_000);
    }
  }, [feed]);

  // 根据 conversations 查找；如果 URL ?id= 不存在于动态列表就兜底取第一条
  let convo: Conversation | undefined = conversations.find((c) => c.id === activeId);
  if (!convo) {
    convo = conversations[0] ?? CONVERSATIONS[0];
    useEffect(() => {
      if (convo && convo.id !== activeId) setActiveId(convo.id);
    }); // 只在渲染偏差时同步一次
  }

  // 切列表选中 → 同步 URL（可刷新保持）+ 标记该会话已读（侧栏红点同步）
  function select(id: string) {
    setActiveId(id);
    setMobileView('chat');
    router.replace(`/messages?id=${encodeURIComponent(id)}`, { scroll: false });
    feed.markConversationRead(id);
  }

  // 进入选中会话时也标记为已读（初次进入或被 push 切换而来）
  useEffect(() => {
    if (convo && !convo.read) {
      feed.markConversationRead(convo.id);
    }
  }, [convo?.id, convo?.read]);

  return (
    <main className="main-content" style={{
      height: 'calc(100vh - 80px)',
      minHeight: 560,
      padding: '12px 24px 32px',
      maxWidth: 1440,
      margin: '0 auto',
    }}>
      <div style={{
        display: 'grid',
        height: '100%',
        width: '100%',
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12,
        overflow: 'hidden',
        gridTemplateColumns: '280px 1fr',
      }} className="messages-grid">
        {/* LEFT */}
        <div
          className={`messages-col-list${mobileView === 'chat' ? ' is-hidden-mobile' : ''}`}
          style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}
        >
          <ConversationList
            search={search} setSearch={setSearch}
            activeId={convo.id} onSelect={select}
            conversations={conversations}
            newMarkers={feed.newMarkers}
          />
        </div>

        {/* MIDDLE + RIGHT —— 嵌套 grid */}
        <div style={{
          display: 'grid',
          height: '100%',
          gridTemplateColumns: infoOpen ? '1fr 320px' : '1fr',
          minWidth: 0,
          overflow: 'hidden',
        }} className="messages-cols-center">
          <div
            className={`messages-col-chat${mobileView === 'list' ? ' is-hidden-mobile' : ''}`}
            style={{
              minWidth: 0,
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <ChatMiddle
              convo={convo}
              onBack={() => setMobileView('list')}
              onToggleInfo={() => setInfoOpen((o) => !o)}
              infoOpen={infoOpen}
              newMarkers={feed.newMarkers}
            />
          </div>
          {infoOpen && (
            <div
              className="messages-col-info"
              style={{ minWidth: 0, height: '100%', overflow: 'hidden' }}
            >
              <ChatInfo convo={convo} onClose={() => setInfoOpen(false)} />
            </div>
          )}
        </div>
      </div>

      {/* X 模式响应式：< 1024 关掉右栏；< 720 左中两栏切换 */}
      <style jsx global>{`
        @media (max-width: 1023px) {
          .messages-cols-center { grid-template-columns: 1fr !important; }
          .messages-col-info { display: none !important; }
        }
        @media (max-width: 719px) {
          .messages-grid { grid-template-columns: 1fr !important; }
          .is-hidden-mobile { display: none !important; }
        }
      `}</style>
    </main>
  );
}

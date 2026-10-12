/**
 * MockFeedContext —— 通知 / 站内信的模拟「实时推送」运行时
 *
 *  功能：
 *   - 通知（AlertItem）：初始 ALERTS 为基准，在页面加载后可手动/自动追加新条目
 *   - 站内信（Conversation/ChatBubble）：初始 CONVERSATIONS 为基准，可手动/自动给某个会话
 *     追加一条对方发来的新气泡（未读）
 *   - 提供 unreadAlertCount / unreadChatCount 汇总，供 SideNav 顶栏显示红点 + 数字
 *   - 30s 自动随机触发一次推送（可通过 `autoPushEveryMs` 配置，0 关闭）
 *   - 暴露 pushRandom() / markAlertRead() / markConversationRead() / pushAlert() / pushChatBubble()
 *
 *  注意：这是纯前端 mock，无真实后端。刷新后状态重置为 ALERTS / CONVERSATIONS 初始值。
 */
'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ALERTS,
  type AlertItem,
  type AlertType,
} from '@/lib/data/sidenav-data';
import {
  CONVERSATIONS,
  type ChatBubble,
  type Conversation,
} from '@/lib/data/messages-data';

/* ═══════════════════════════════════════════════════
   1. 类型 & 工具函数
   ═══════════════════════════════════════════════════ */

function monogram(u: string): string {
  const parts = u.split(/[_.\-]+/).filter(Boolean);
  const heads =
    parts.length >= 2
      ? `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`
      : u.slice(0, 1);
  return heads.toUpperCase();
}

function nowTimeAgo(): string {
  // 模拟：推送瞬间的时间文案
  return 'now';
}

function bubbleTimestamp(): string {
  const d = new Date();
  const hh = d.getHours();
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ampm = hh >= 12 ? 'PM' : 'AM';
  return `${((hh + 11) % 12) + 1}:${mm} ${ampm}`;
}

/* ═══════════════════════════════════════════════════
   2. Mock 素材池：生成新推送用的随机文案模板
   ═══════════════════════════════════════════════════ */

const FAKE_USERS = [
  'kairos',
  'nova_dev',
  'alexshader',
  'byteforge',
  'pixelwitch',
  'zenpulse',
  'voidrunner',
  'luminode',
  'dataforge',
  'synthwave',
];

const FAKE_TIP_TARGETS = [
  'Cinematic Portrait Generator',
  'SEO Blog Writer Pro',
  'Midjourney Studio Lighting',
  'React Fiber Deep Dive',
];

const FAKE_LIKE_TARGETS = [
  'facebook/react',
  'vercel/next.js',
  'facebook/stylex',
  'Cinematic Portrait Generator',
  'midjourney-style refs',
];

const FAKE_SYSTEM_TEMPLATES = [
  'Weekly leaderboard is out — you moved up 4 positions this week.',
  'Your public prompt got featured on the Marketplace homepage.',
  'Hackathon 2026 starts in 48h — check your team draft.',
  'Security notice: a new login to your account was detected (Chrome · Mac).',
];

const FAKE_CHAT_TEMPLATES = [
  'Hey, are you around? Got a quick question about that fiber post 🙏',
  'Just tried the prompt you shared, output is incredible 🔥',
  'Wanna hop on a quick call tomorrow to brainstorm the agent project?',
  'Sent you a $25 tip for the great breakdown earlier today.',
  'Saw you posted a repo, left my 2 cents in the comments!',
  'Btw — loved the share card you added to detail page 😎',
  'Do you have any additional refs on that cinematic style? DMing you a sample.',
];

/* ═══════════════════════════════════════════════════
   3. Context 定义
   ═══════════════════════════════════════════════════ */

export interface NewItemMarker {
  /** 新推送进来的 id，用于在列表里高亮（2.4s 后自动取消高亮） */
  id: string;
  /** 'alert' | 'chat' */
  kind: 'alert' | 'chat';
  /** 若 kind==='chat'，记录属于哪个会话（供 ChatMiddle 过滤） */
  conversationId?: string;
}

interface MockFeedContextValue {
  // —— 原始数据（初始 + 推送累积）
  alerts: AlertItem[];
  conversations: Conversation[];
  // —— 未读汇总
  unreadAlertCount: number;
  unreadChatCount: number;
  // —— 短暂高亮的最新条目（用于在 UI 闪烁高亮）
  newMarkers: NewItemMarker[];
  // —— 触发动作
  pushAlert: (a: AlertItem) => void;
  pushChatBubble: (conversationId: string, bubble: ChatBubble) => void;
  markAlertRead: (idx: number) => void;
  markAllAlertsRead: () => void;
  markConversationRead: (conversationId: string) => void;
  /** 随机推送一条 通知 OR 站内信（由 flag 控制），不传则各 50% 概率 */
  pushRandom: (forceType?: 'alert' | 'chat') => { kind: 'alert' | 'chat'; summary: string };
  /** 自动推送间隔（ms），0 关闭；组件里默认 30s */
  setAutoPushInterval: (ms: number) => void;
  /** 当前自动推送间隔（ms），0 表示关闭 —— 页面可据此判断是否需要开启 */
  currentAutoPushIntervalMs: number;
}

const MockFeedContext = createContext<MockFeedContextValue | null>(null);

export const useMockFeed = (): MockFeedContextValue => {
  const ctx = useContext(MockFeedContext);
  if (!ctx) {
    // 兜底：开发期如果 Provider 没挂，返回一个空壳（不会真崩，但触发 console.warn 方便排查）
    // eslint-disable-next-line no-console
    if (typeof window !== 'undefined') console.warn('[MockFeedContext] Provider not mounted');
    return FALLBACK_VALUE;
  }
  return ctx;
};

/* ═══════════════════════════════════════════════════
   4. Provider 实现
   ═══════════════════════════════════════════════════ */

let alertSeq = 1;
let bubbleSeq = 1;
const mkAlertId = () => `al-${Date.now()}-${alertSeq++}`;
const mkBubbleId = () => `b-${Date.now()}-${bubbleSeq++}`;

export function MockFeedProvider({
  children,
  autoPushEveryMs = 30_000,
}: {
  children: React.ReactNode;
  autoPushEveryMs?: number;
}) {
  // —— 状态
  const [alerts, setAlerts] = useState<AlertItem[]>(() =>
    ALERTS.map((a) => ({ ...a })),
  );
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    CONVERSATIONS.map((c) => ({
      ...c,
      bubbles: c.bubbles.map((b) => ({ ...b })),
      shared: {
        ...c.shared,
        prompts: c.shared.prompts.map((p) => ({ ...p })),
      },
    })),
  );
  const [newMarkers, setNewMarkers] = useState<NewItemMarker[]>([]);

  // 自动推送间隔
  const [intervalMs, setIntervalMs] = useState<number>(autoPushEveryMs);
  const pushRandomRef = useRef<MockFeedContextValue['pushRandom'] | null>(null);

  const markNew = useCallback((id: string, kind: 'alert' | 'chat', conversationId?: string) => {
    setNewMarkers((prev) => [...prev, { id, kind, conversationId }]);
    window.setTimeout(() => {
      setNewMarkers((prev) => prev.filter((m) => !(m.id === id && m.kind === kind)));
    }, 2400);
  }, []);

  const pushAlert = useCallback(
    (a: AlertItem) => {
      const withId = { ...a, id: mkAlertId() } as AlertItem & { id: string };
      setAlerts((prev) => [withId, ...prev]);
      markNew(withId.id, 'alert');
    },
    [markNew],
  );

  const pushChatBubble = useCallback(
    (conversationId: string, bubble: ChatBubble) => {
      const withId: ChatBubble = { ...bubble, id: bubble.id || mkBubbleId() };
      setConversations((prev) =>
        prev
          .map((c) => {
            if (c.id !== conversationId) return c;
            return {
              ...c,
              read: false,
              preview: withId.text,
              lastTime: nowTimeAgo(),
              bubbles: [...c.bubbles, withId],
            };
          })
          // 有新消息的会话顶到左栏第一个
          .sort((a, b) => {
            if (a.id === conversationId) return -1;
            if (b.id === conversationId) return 1;
            return 0;
          }),
      );
      markNew(withId.id, 'chat', conversationId);
    },
    [markNew],
  );

  const markAlertRead = useCallback((idx: number) => {
    setAlerts((prev) => {
      if (!prev[idx]) return prev;
      const next = prev.slice();
      next[idx] = { ...next[idx], read: true };
      return next;
    });
  }, []);

  const markAllAlertsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const markConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, read: true } : c,
      ),
    );
  }, []);

  // —— 随机生成一条推送
  const pushRandom = useCallback<MockFeedContextValue['pushRandom']>(
    (forceType) => {
      const kind: 'alert' | 'chat' =
        forceType ?? (Math.random() < 0.55 ? 'alert' : 'chat');

      if (kind === 'alert') {
        const types: AlertType[] = ['tip', 'like', 'follow', 'system'];
        const type = types[Math.floor(Math.random() * types.length)];
        let user = '';
        let action = '';
        let target: string | undefined;
        let amount: string | undefined;
        if (type === 'tip') {
          user = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
          target = FAKE_TIP_TARGETS[Math.floor(Math.random() * FAKE_TIP_TARGETS.length)];
          const amt = 10 + Math.floor(Math.random() * 90);
          amount = `${amt} GHR`;
          action = 'tipped your prompt';
        } else if (type === 'like') {
          user = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
          target = FAKE_LIKE_TARGETS[Math.floor(Math.random() * FAKE_LIKE_TARGETS.length)];
          action = 'liked your post';
        } else if (type === 'follow') {
          user = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
          action = 'started following you';
        } else {
          user = 'GHRANK';
          action = FAKE_SYSTEM_TEMPLATES[Math.floor(Math.random() * FAKE_SYSTEM_TEMPLATES.length)];
        }
        const alert: AlertItem = {
          type,
          user,
          avatar: type === 'system' ? 'LOGO' : monogram(user),
          action,
          target,
          amount,
          time: nowTimeAgo(),
          read: false,
        };
        pushAlert(alert);
        const summary =
          type === 'tip'
            ? `🔔 New tip: ${user} gave you ${amount} for "${target}"`
            : type === 'like'
              ? `🔔 New like: ${user} liked "${target}"`
              : type === 'follow'
                ? `🔔 New follower: ${user}`
                : `🔔 System: ${action.slice(0, 48)}…`;
        return { kind, summary };
      } else {
        // 站内信：优先选择最近 3 条气泡数量最少的会话（避免同一会话被连续推送导致重复感）
        const convs = conversationsRef.current;
        // 找出气泡数最少的前 3 个会话，从中随机选一个
        const sorted = [...convs].sort((a, b) => a.bubbles.length - b.bubbles.length);
        const candidates = sorted.slice(0, Math.min(3, sorted.length));
        const c = candidates[Math.floor(Math.random() * candidates.length)];
        const template =
          FAKE_CHAT_TEMPLATES[Math.floor(Math.random() * FAKE_CHAT_TEMPLATES.length)];
        const bubble: ChatBubble = {
          id: mkBubbleId(),
          fromMe: false,
          text: template,
          timestamp: bubbleTimestamp(),
          status: 'delivered',
        };
        pushChatBubble(c.id, bubble);
        return {
          kind,
          summary: `💬 New DM from ${c.displayName || c.user}: ${template.slice(0, 36)}…`,
        };
      }
    },
    [pushAlert, pushChatBubble],
  );

  // —— 对话引用，供 pushRandom 读最新
  const conversationsRef = useRef(conversations);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // —— 推送函数的 ref，用于定时器回调
  pushRandomRef.current = pushRandom;

  // —— 自动推送定时器（intervalMs === 0 关闭）
  useEffect(() => {
    if (!intervalMs || intervalMs <= 0) return;
    const timer = window.setInterval(() => {
      pushRandomRef.current?.();
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  // —— 汇总
  const unreadAlertCount = useMemo(
    () => alerts.filter((a) => !a.read).length,
    [alerts],
  );
  const unreadChatCount = useMemo(
    () => conversations.filter((c) => !c.read).length,
    [conversations],
  );

  const value: MockFeedContextValue = {
    alerts,
    conversations,
    unreadAlertCount,
    unreadChatCount,
    newMarkers,
    pushAlert,
    pushChatBubble,
    markAlertRead,
    markAllAlertsRead,
    markConversationRead,
    pushRandom,
    setAutoPushInterval: setIntervalMs,
    currentAutoPushIntervalMs: intervalMs,
  };

  return (
    <MockFeedContext.Provider value={value}>{children}</MockFeedContext.Provider>
  );
}

/* ═══════════════════════════════════════════════════
   5. 兜底空壳（Provider 未挂时，避免 crash）
   ═══════════════════════════════════════════════════ */

const FALLBACK_VALUE: MockFeedContextValue = {
  alerts: ALERTS,
  conversations: CONVERSATIONS,
  unreadAlertCount: 0,
  unreadChatCount: 0,
  newMarkers: [],
  pushAlert: () => {},
  pushChatBubble: () => {},
  markAlertRead: () => {},
  markAllAlertsRead: () => {},
  markConversationRead: () => {},
  pushRandom: () => ({ kind: 'alert' as const, summary: '' }),
  setAutoPushInterval: () => {},
  currentAutoPushIntervalMs: 30_000,
};

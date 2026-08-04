/**
 * CommunityDetailMain —— 帖子详情页中栏主内容
 * 迁移自 community-detail.html 的 .community-content main 区域
 *
 * 包含：面包屑导航 + 帖子详情 + 回复列表 + 回复编辑器
 * Chrome 层（Navbar/Footer/Ticker）由 ChromeLayout 统一处理
 */
'use client';

import { useRef } from 'react';
import Link from 'next/link';
import PostDetail from './PostDetail';
import ReplyList from './ReplyList';
import ReplyEditor, { type ReplyEditorHandle } from './ReplyEditor';
import { TIEBA_CATALOG } from '../../_data/community-data';
import { POST_DETAIL } from '../_data/community-detail-data';

interface CommunityDetailMainProps {
  /** 贴吧 ID，用于面包屑导航链接 */
  barId: string;
}

export default function CommunityDetailMain({ barId }: CommunityDetailMainProps) {
  // 查找贴吧信息用于面包屑
  const bar = TIEBA_CATALOG.find((b) => b.id === barId) || TIEBA_CATALOG[0];
  // 回复编辑器句柄：供 PostDetail 的 Reply 按钮聚焦
  const replyEditorRef = useRef<ReplyEditorHandle>(null);

  return (
    <main className="community-content min-w-0">
      {/* 面包屑导航 */}
      <nav
        className="community-breadcrumb flex items-center gap-2 flex-wrap mb-5"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-dim)',
          letterSpacing: '0.04em',
        }}
      >
        <Link
          href="/community"
          className="no-underline transition-colors"
          style={{ color: 'var(--text-dim)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; }}
        >
          Community
        </Link>
        <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>/</span>
        <Link
          href={`/community/tiebas?bar=${encodeURIComponent(bar.id)}`}
          className="no-underline transition-colors"
          style={{ color: 'var(--text-dim)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; }}
        >
          {bar.name}
        </Link>
        <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>/</span>
        <span
          className="crumb-current overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ color: 'var(--text)', maxWidth: '320px' }}
        >
          {POST_DETAIL.title}
        </span>
      </nav>

      {/* 帖子详情卡片 */}
      <PostDetail onReplyFocus={() => replyEditorRef.current?.focus()} />

      {/* 回复列表（骨架屏 + IO 无限滚动 + 排序） */}
      <ReplyList />

      {/* 回复编辑器 */}
      <ReplyEditor ref={replyEditorRef} />
    </main>
  );
}

/**
 * CommunityDetailMain —— 帖子详情页中栏主内容
 * 迁移自 community-detail.html 的 .community-content main 区域
 *
 * 包含：面包屑导航 + 帖子详情 + 回复列表 + 回复编辑器
 * Chrome 层（Navbar/Footer/Ticker）由 ChromeLayout 统一处理
 */
'use client';

import Link from 'next/link';
import PostDetail from './PostDetail';
import ReplyList from './ReplyList';
import { TIEBA_CATALOG } from '../../_data/community-data';
import { type PostDetail as PostDetailData } from '../_data/community-detail-data';

interface CommunityDetailMainProps {
  /** 贴吧 ID，用于面包屑导航链接 */
  barId: string;
  /** 帖子详情数据（由服务端组件加密后传入） */
  postDetail: PostDetailData;
  /** 帖子 ID（动态路由传入；当前使用静态数据，预留用于后续按 id 取数） */
  postId?: string;
}

export default function CommunityDetailMain({ barId, postDetail }: CommunityDetailMainProps) {
  // 查找贴吧信息用于面包屑
  const bar = TIEBA_CATALOG.find((b) => b.id === barId) || TIEBA_CATALOG[0];

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
          {postDetail.title}
        </span>
      </nav>

      {/* 帖子详情卡片 */}
      <PostDetail post={postDetail} />

      {/* 回复列表（骨架屏 + IO 无限滚动 + 排序） */}
      <ReplyList />
    </main>
  );
}

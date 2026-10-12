/**
 * 社区帖子详情页 —— 动态路由版本（兼容 /community/detail/:id 形式）
 *
 * 与 /community/detail?id=xxx 静态路由共用同一套布局，
 * 帖子 ID 从路径参数 params.id 获取，避免访问动态路径时返回 404。
 *
 * 服务端组件：在此处对附件 URL 加密（AES-GCM token）。
 */
import { ToastProvider } from '../_components/ToastContext';
import CommunitySidebar from '../../_components/CommunitySidebar';
import CommunityDetailMain from '../_components/CommunityDetailMain';
import CommunityRightPanel from '../../_components/CommunityRightPanel';
import AuthorTiebaCard from '../_components/AuthorTiebaCard';
import {
  type ContentBlock,
  type PostDetail,
  resolvePostDetail,
} from '../_data/community-detail-data';
import { encryptAttachmentUrl } from '@/lib/asset-token';

export const dynamic = 'force-static';

/** 将内容块中的附件 URL 从 ?file=明文 转换为 ?token=密文 */
function encryptContentBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.map((block) => {
    if (block.type === 'video' && block.src) {
      return { ...block, src: encryptAttachmentUrl(block.src) };
    }
    if (block.type === 'image' && block.src) {
      return { ...block, src: encryptAttachmentUrl(block.src) };
    }
    return block;
  });
}

export default async function CommunityDetailSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bar?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const barId = query.bar || 'ai-agents';

  // 按 id + bar 解析帖子详情（与 OG 分享卡片共用同一数据源）
  const detail = resolvePostDetail(id, barId);

  // 服务端加密：生成带 token 的 postDetail，传给客户端组件
  const encryptedPostDetail: PostDetail = {
    ...detail,
    content: encryptContentBlocks(detail.content),
  };

  return (
    <main className="main-content">
      <ToastProvider>
        <div className="grid gap-5 lg:gap-6 py-6 pb-16 items-start grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_300px]">
          <CommunitySidebar />
          <CommunityDetailMain barId={barId} postDetail={encryptedPostDetail} postId={id} />
          <div className="hidden xl:block">
            <CommunityRightPanel
              header={<AuthorTiebaCard barId={barId} />}
              showCreateTieba={false}
              showHotTiebas={false}
            />
          </div>
        </div>
      </ToastProvider>
    </main>
  );
}

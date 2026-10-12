/**
 * 社区帖子详情页 —— Next.js App Router
 * 3 栏布局：左栏（与社区首页一致）+ 中栏（帖子详情+回复）+ 右栏（作者卡+热门贴吧）
 *
 * 服务端组件：在此处对附件 URL 加密（AES-GCM token），
 * 将加密后的 postDetail 通过 props 传递给客户端组件。
 *
 * searchParams：
 *   - bar: 贴吧 ID（决定面包屑导航），默认 ai-agents
 *   - id:  帖子 ID（预留，当前使用静态帖子数据）
 */
import { ToastProvider } from './_components/ToastContext';
import CommunitySidebar from '../_components/CommunitySidebar';
import CommunityDetailMain from './_components/CommunityDetailMain';
import CommunityRightPanel from '../_components/CommunityRightPanel';
import AuthorTiebaCard from './_components/AuthorTiebaCard';
import {
  type ContentBlock,
  type PostDetail,
  resolvePostDetail,
} from './_data/community-detail-data';
import { encryptAttachmentUrl } from '@/lib/asset-token';

export const metadata = { title: 'Community Post Detail // GHRANK' };

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

export default async function CommunityDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; bar?: string }>;
}) {
  const params = await searchParams;
  const barId = params.bar || 'ai-agents';

  // 按 id + bar 解析帖子详情（与 OG 分享卡片共用同一数据源）
  const detail = resolvePostDetail(params.id, barId);

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
          <CommunityDetailMain
            barId={barId}
            postDetail={encryptedPostDetail}
            postId={params.id}
          />
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

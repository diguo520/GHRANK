/**
 * GitHub 项目详情页 —— Next.js App Router 入口
 * 服务端组件：读取 URL 参数 repo，渲染客户端组件
 * Chrome 层（Navbar/Footer/Ticker）由 ChromeLayout 统一处理，页面只包含 main 区域
 *
 * 迁移自原始 .design/js/detail.js + detail.css
 * 职责：项目档案展示、Star 增长曲线、提交热力图、提交趋势图
 */

import type { Metadata } from 'next';
import { INITIAL_CARDS } from '../../_data/leaderboard-data';
import GitHubDetailClient from './GitHubDetailClient';

interface GitHubDetailPageProps {
  /** URL 查询参数（Next.js 16 起为 Promise，需 await） */
  searchParams: Promise<{ repo?: string }>;
}

/** 根据仓库名动态生成页面标题 */
export async function generateMetadata({ searchParams }: GitHubDetailPageProps): Promise<Metadata> {
  const { repo } = await searchParams;
  return {
    title: repo ? `${repo} // GHRANK` : 'Repo Detail // GHRANK',
  };
}

export default async function GitHubDetailPage({ searchParams }: GitHubDetailPageProps) {
  const { repo } = await searchParams;

  // 尝试从已有数据中查找仓库信息
  const cardData = INITIAL_CARDS.find((c) => c.repo === repo);

  return (
    <GitHubDetailClient
      repo={repo || 'unknown/repo'}
      cardData={cardData || null}
    />
  );
}

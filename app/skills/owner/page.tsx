/**
 * Skills Owner 创作者页 —— Next.js App Router 入口
 * 服务端组件：导出 metadata，读取 URL 参数，渲染客户端组件
 * Chrome 层（Navbar/Footer/Ticker）由 ChromeLayout 统一处理，页面只包含 main 区域
 * 迁移自 skills-owner.html + skills.js initOwnerPage()
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getOwner, skills } from '../_data/skills-data';
import SkillsOwnerClient from '../_components/SkillsOwnerClient';

interface SkillsOwnerPageProps {
  /** URL 查询参数（Next.js 16 起为 Promise，需 await） */
  searchParams: Promise<{ owner?: string }>;
}

/** 根据创作者 ID 动态生成页面标题 */
export async function generateMetadata({ searchParams }: SkillsOwnerPageProps): Promise<Metadata> {
  const { owner: ownerId } = await searchParams;
  const owner = ownerId ? getOwner(ownerId) : null;
  return {
    title: owner ? `${owner.name} // GHRANK` : 'Owner Not Found // GHRANK',
  };
}

export default async function SkillsOwnerPage({ searchParams }: SkillsOwnerPageProps) {
  const { owner: ownerId } = await searchParams;
  const owner = ownerId ? getOwner(ownerId) : null;

  // 未找到创作者 —— 显示错误提示页
  if (!owner) {
    return (
      <main className="main-content">
        <section
          className="skills-hero"
          style={{
            textAlign: 'center',
            padding: '80px 24px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <h1
            className="skills-hero-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '42px',
              fontWeight: 800,
              color: 'var(--text)',
              marginBottom: '14px',
            }}
          >
            Owner Not Found
          </h1>
          <p
            className="skills-hero-sub"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              color: 'var(--text-dim)',
            }}
          >
            <Link
              href="/skills"
              style={{
                color: 'var(--gold)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              Return to Skills Market
            </Link>
          </p>
        </section>
      </main>
    );
  }

  // 过滤该创作者发布的全部技能
  const ownerSkills = skills.filter((s) => s.owner === owner.id);

  return <SkillsOwnerClient owner={owner} ownerSkills={ownerSkills} />;
}

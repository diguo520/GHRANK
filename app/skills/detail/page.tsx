/**
 * Skills 详情页 —— Next.js App Router 入口
 * 服务端组件：导出 metadata，读取 URL 参数，渲染客户端组件
 * Chrome 层（Navbar/Footer/Ticker）由 ChromeLayout 统一处理，页面只包含 main 区域
 */

import type { Metadata } from 'next';
import { getSkill, getSkillByName } from '../_data/skills-data';
import SkillDetailClient from '../_components/SkillDetailClient';

interface SkillsDetailPageProps {
  /** URL 查询参数（Next.js 16 起为 Promise，需 await） */
  searchParams: Promise<{ id?: string; name?: string }>;
}

/** 根据技能名动态生成页面标题 */
export async function generateMetadata({ searchParams }: SkillsDetailPageProps): Promise<Metadata> {
  const { id, name } = await searchParams;
  const skill = id ? getSkill(id) : name ? getSkillByName(name) : null;
  return {
    title: skill ? `${skill.name} // GHRANK` : 'Skill Detail // GHRANK',
  };
}

export default async function SkillsDetailPage({ searchParams }: SkillsDetailPageProps) {
  const { id, name } = await searchParams;
  return (
    <SkillDetailClient skillId={id} skillName={name} />
  );
}

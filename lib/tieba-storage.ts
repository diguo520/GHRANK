/**
 * 贴吧 localStorage 持久化工具
 * —— 用户创建的贴吧增删查改 + 上限校验
 */

import { STORAGE_KEYS } from './constants';
import { safeStorage } from './safeStorage';
import type { UserCreatedTieba } from '@/app/community/_data/community-data';

/** 用户最多可创建的贴吧数量 */
export const MAX_CREATED_TIEBAS = 3;

/** 读取用户创建的所有贴吧 */
export function getCreatedTiebas(): UserCreatedTieba[] {
  const raw = safeStorage.get(STORAGE_KEYS.CREATED_TIEBAS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** 获取已创建数量 */
export function getCreatedCount(): number {
  return getCreatedTiebas().length;
}

/** 是否还可以创建 */
export function canCreateMore(): boolean {
  return getCreatedCount() < MAX_CREATED_TIEBAS;
}

/** 新增贴吧，返回是否成功（false=超限或 ID 冲突） */
export function addCreatedTieba(tieba: UserCreatedTieba): boolean {
  const list = getCreatedTiebas();
  if (list.length >= MAX_CREATED_TIEBAS) return false;

  // ID 唯一性校验：冲突时追加后缀
  let finalId = tieba.id;
  let suffix = 1;
  while (list.some((t) => t.id === finalId)) {
    finalId = `${tieba.id}-${++suffix}`;
  }
  tieba.id = finalId;

  list.push(tieba);
  safeStorage.set(STORAGE_KEYS.CREATED_TIEBAS, JSON.stringify(list));
  return true;
}

/** slugify：将贴吧名称转为 URL 友好的 slug */
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || `tieba-${Date.now()}`;
}

/** 从名称生成六边形图标（取前两个字符大写） */
export function generateIcon(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'T';
  const chars = trimmed.replace(/\s+/g, '');
  return chars.slice(0, 2).toUpperCase();
}

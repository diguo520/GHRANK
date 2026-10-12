/**
 * tRPC 客户端 —— React Hooks 绑定
 *
 * 使用方式：
 *   const utils = api.useUtils();
 *   const { data } = api.leaderboard.useQuery({ period: 'day' });
 *   await utils.leaderboard.invalidate();
 */
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/trpc';

export const trpc = createTRPCReact<AppRouter>();

export type { AppRouter } from '@/server/trpc';

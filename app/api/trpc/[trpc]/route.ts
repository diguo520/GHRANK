/**
 * tRPC Next.js API Route —— 挂载 tRPC 服务到 /api/trpc/*
 *
 * 访问示例：
 *   GET /api/trpc/leaderboard?input={"json":{"period":"day"}}
 *   GET /api/trpc/health
 */
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createContext } from '@/server/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({}),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `[tRPC] ${path ?? '<unknown>'} error:`,
              error.message
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };

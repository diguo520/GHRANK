/**
 * tRPC Provider —— 客户端组件，包裹整个应用
 *
 * 在 layout.tsx 中使用：
 *   <TrpcProvider>
 *     <App>{children}</App>
 *   </TrpcProvider>
 *
 * 注意：当前阶段为 expand 期，未强制接入。
 * 现有页面继续使用静态数据，新功能可选用 tRPC。
 */
'use client';

import { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return '';
  }
  // SSR 时使用绝对 URL
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
}

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 分钟
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

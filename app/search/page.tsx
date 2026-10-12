/**
 * 搜索结果页 —— 全局搜索引擎
 * 结构：Hero（搜索栏）+ 类型筛选 + 排序 + 结果网格 + 分页 + 相关搜索
 * SearchClient 使用 useSearchParams，需 Suspense 包裹（Next.js App Router 要求）
 * Chrome 层（Ticker/Navbar/Footer）由 ChromeLayout 统一处理，本页只含 main 区域
 */
import { Suspense } from 'react';
import SearchClient from './_components/SearchClient';
import './search.module.css';

export const metadata = { title: 'Search // GHRANK' };

export default function SearchPage() {
  return (
    <main className="main-content" style={{ maxWidth: 'none', padding: 0 }}>
      <Suspense fallback={null}>
        <SearchClient />
      </Suspense>
    </main>
  );
}

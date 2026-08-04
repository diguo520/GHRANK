/**
 * usePromptListFilters —— Prompt 列表页筛选/排序/分页逻辑
 * 将纯计算逻辑从 PromptListClient 中拆出，保持组件行数在可维护范围
 *
 * 筛选维度：AI 模型（多选）/ 分类（多选）/ 价格范围 / 最低评分
 * 排序维度：最热门 / 最新 / 价格升降序 / 评分最高
 */
'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  PROMPT_LIST_ITEMS,
  TOTAL_PROMPTS,
  type PromptListItem,
} from '../_data/prompt-list-data';

/** 每页卡片数（与原始 HTML 一致） */
const PAGE_SIZE = 24;

/** 从 "$4.99" 格式中提取数字价格 */
function parsePrice(priceStr: string): number {
  const match = priceStr.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

export interface PromptListFilterState {
  selectedModels: Set<string>;
  selectedCategories: Set<string>;
  priceMin: string;
  priceMax: string;
  rating: string;
  sort: string;
  currentPage: number;
}

export function usePromptListFilters() {
  // 筛选状态
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set(['gpt4', 'claude']));
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [rating, setRating] = useState('all');
  const [sort, setSort] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);

  /** 切换 Set 元素的工具函数 */
  function toggleSetItem(set: Set<string>, value: string): Set<string> {
    const next = new Set(set);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    return next;
  }

  const onToggleModel = useCallback((value: string) => {
    setSelectedModels((prev) => toggleSetItem(prev, value));
    setCurrentPage(1);
  }, []);

  const onToggleCategory = useCallback((value: string) => {
    setSelectedCategories((prev) => toggleSetItem(prev, value));
    setCurrentPage(1);
  }, []);

  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // 滚动到页面顶部，让用户看到新页内容
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  /** 筛选 + 排序后的结果 */
  const filteredItems = useMemo<PromptListItem[]>(() => {
    let result = PROMPT_LIST_ITEMS.slice();

    // AI 模型筛选：有选中项时才过滤（否则显示全部模型）
    if (selectedModels.size > 0) {
      result = result.filter((item) => selectedModels.has(item.model));
    }

    // 分类筛选
    if (selectedCategories.size > 0) {
      result = result.filter((item) => selectedCategories.has(item.category));
    }

    // 评分筛选
    if (rating !== 'all') {
      const minStars = parseInt(rating, 10);
      result = result.filter((item) => item.stars >= minStars);
    }

    // 价格范围筛选
    const min = priceMin ? parseFloat(priceMin) : 0;
    const max = priceMax ? parseFloat(priceMax) : Infinity;
    if (priceMin || priceMax) {
      result = result.filter((item) => {
        const price = parsePrice(item.price);
        return price >= min && price <= max;
      });
    }

    // 排序
    switch (sort) {
      case 'newest':
        result.reverse();
        break;
      case 'price-asc':
        result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        break;
      case 'rated':
        result.sort((a, b) => b.stars - a.stars);
        break;
      // 'popular' 保持默认顺序
    }

    return result;
  }, [selectedModels, selectedCategories, rating, priceMin, priceMax, sort]);

  /** 分页后的当前页数据 */
  const pagedItems = useMemo<PromptListItem[]>(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  /** 模拟总页数（基于 TOTAL_PROMPTS 而非实际数据量，保持与原始设计一致） */
  const totalPages = Math.ceil(TOTAL_PROMPTS / PAGE_SIZE);

  return {
    // 状态
    selectedModels,
    selectedCategories,
    priceMin,
    priceMax,
    rating,
    sort,
    currentPage,
    // 回调
    onToggleModel,
    onToggleCategory,
    setPriceMin,
    setPriceMax,
    setRating,
    setSort,
    onPageChange,
    // 派生数据
    filteredItems,
    pagedItems,
    totalPages,
    totalPrompts: TOTAL_PROMPTS,
  };
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { NewsItem } from '../_data/news-data';
import { DAY_GROUPS, HEADLINES_POOL, buildFlashItem } from '../_data/news-data';
import NewsItemRow from './NewsItem';

// ── 实时推送时序配置（迁移自 news.js） ──
const FIRST_PUSH_DELAY = 4500; // 首次推送延迟：等待入场动画完成
const PUSH_MIN_DELAY = 18000; // 推送间隔下限
const PUSH_RANGE = 17000; // 推送间隔随机增量上限
const TIMER_STEP = 60000; // "Updated" 计时器步进：1 分钟
const UPDATED_FLASH_MS = 2000; // 推送后"刚更新"高亮持续时长

/** 带稳定 id 的实时推送条目，便于 React key 追踪 */
interface FlashEntry {
  id: number;
  item: NewsItem;
}

export default function NewsTimeline() {
  // 实时插入条目（置于 Today 组最前）
  const [flashEntries, setFlashEntries] = useState<FlashEntry[]>([]);
  // "Updated" 计时文本
  const [updatedText, setUpdatedText] = useState('Updated just now');
  // 计时文本是否处于"刚更新"高亮态
  const [updatedFlash, setUpdatedFlash] = useState(false);

  const minuteCounterRef = useRef(0);
  const flashIdRef = useRef(0);
  const usedIndicesRef = useRef<number[]>([]);

  // ── 1. 实时 "Updated" 计时器：每分钟递增 ──
  useEffect(() => {
    const timer = setInterval(() => {
      minuteCounterRef.current += 1;
      const m = minuteCounterRef.current;
      setUpdatedText(m < 60 ? `Updated ${m} min ago` : `Updated ${Math.floor(m / 60)}h ${m % 60}m ago`);
    }, TIMER_STEP);
    return () => clearInterval(timer);
  }, []);

  // 从标题池随机取一条未用标题（用尽后循环重置）
  const fetchNextHeadline = useCallback(() => {
    if (usedIndicesRef.current.length >= HEADLINES_POOL.length) {
      usedIndicesRef.current = [];
    }
    const used = usedIndicesRef.current;
    const available: number[] = [];
    for (let i = 0; i < HEADLINES_POOL.length; i++) {
      if (!used.includes(i)) available.push(i);
    }
    const pick = available[Math.floor(Math.random() * available.length)];
    usedIndicesRef.current = [...used, pick];
    return HEADLINES_POOL[pick];
  }, []);

  // 推送一条新闻：插入 Today 组头部，重置计时并触发高亮
  const pushNews = useCallback(() => {
    const headline = fetchNextHeadline();
    const entry: FlashEntry = { id: flashIdRef.current++, item: buildFlashItem(headline.source, headline.title) };
    setFlashEntries((prev) => [entry, ...prev]);

    // 重置计时器并触发"刚更新"高亮（2s 后自动回落）
    minuteCounterRef.current = 0;
    setUpdatedText('Updated just now');
    setUpdatedFlash(true);
    setTimeout(() => setUpdatedFlash(false), UPDATED_FLASH_MS);
  }, [fetchNextHeadline]);

  // ── 2. 模拟实时数据推送：首次延迟后开始，之后随机间隔持续推送 ──
  useEffect(() => {
    let nextTimer: ReturnType<typeof setTimeout>;

    // 调度下一次推送（随机 18~35s）
    const scheduleNext = () => {
      const delay = PUSH_MIN_DELAY + Math.random() * PUSH_RANGE;
      nextTimer = setTimeout(() => {
        pushNews();
        scheduleNext();
      }, delay);
    };

    // 首次推送：等待入场动画完成
    const firstTimer = setTimeout(() => {
      pushNews();
      scheduleNext();
    }, FIRST_PUSH_DELAY);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(nextTimer);
    };
  }, [pushNews]);

  // 计算某日条目总数（Today 组需叠加实时推送条目）
  const itemCount = (group: { day: string; items: NewsItem[] }) =>
    group.day === 'today' ? flashEntries.length + group.items.length : group.items.length;

  return (
    <div className="timeline-wrapper mx-auto" style={{ maxWidth: '820px', padding: '0 32px 64px' }}>
      {/* 时间线头部 */}
      <div className="timeline-header flex items-baseline gap-3" style={{ marginBottom: 'var(--sp-4)' }}>
        <span
          className="font-mono font-bold uppercase"
          style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.12em' }}
        >
          LAST 7 DAYS
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: '11px',
            letterSpacing: '0.04em',
            color: updatedFlash ? 'var(--gold)' : 'var(--text-muted)',
            transition: 'color 0.3s',
          }}
        >
          {updatedText}
        </span>
      </div>

      {/* 日期分组 */}
      <div className="timeline">
        {DAY_GROUPS.map((group) => (
          <div key={group.day} className="tl-day-group" data-day={group.day} style={{ marginBottom: '32px' }}>
            {/* 日期分隔符：纯文字 + 底线 */}
            <div
              className="tl-day-marker flex items-baseline gap-3"
              style={{ marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}
            >
              <span
                className="tl-day-label font-mono font-bold uppercase whitespace-nowrap"
                style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.12em' }}
              >
                {group.label}
              </span>
              <span
                className="tl-day-count font-mono"
                style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}
              >
                {itemCount(group)} ITEMS
              </span>
            </div>

            {/* 条目列表：Today 组在最前拼接实时推送条目 */}
            <div className="tl-items flex flex-col">
              {group.day === 'today' &&
                flashEntries.map(({ id, item }) => (
                  <NewsItemRow key={`flash-${id}`} item={item} flash />
                ))}
              {group.items.map((item, idx) => (
                <NewsItemRow key={`static-${group.day}-${idx}`} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 7 天窗口结束标记 */}
      <div className="timeline-end flex items-center" style={{ gap: '14px', marginTop: '40px', padding: '20px 0 8px' }}>
        <span
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, var(--border) 50%, transparent 100%)' }}
        />
        <span
          className="font-mono font-bold uppercase whitespace-nowrap"
          style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.14em' }}
        >
          END OF 7-DAY WINDOW
        </span>
        <span
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, var(--border) 50%, transparent 100%)' }}
        />
      </div>
    </div>
  );
}

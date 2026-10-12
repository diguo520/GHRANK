/**
 * TiebasSidebar —— 贴吧列表页左栏
 * 迁移自 community-tiebas.html 的 .community-sidebar
 *
 * 包含：Related Tiebas（其它贴吧目录）+ Hot Tiebas + 版权信息
 * 不含当前贴吧信息（当前贴吧信息在右栏 tieba-info-card 展示）
 */
import Link from 'next/link';
import { TIEBA_CATALOG, HOT_TIEBAS, fmtNum, type TiebaCatalogItem, type HotTieba } from '../../_data/community-data';
import { HEX_CLIP_PATH } from '@/lib/constants';

/* ── 相关贴吧项（六边形图标 + 名称 + 成员/帖子数） ── */
function RelatedBarItem({ bar }: { bar: TiebaCatalogItem }) {
  return (
    <Link
      href={`/community/tiebas?bar=${encodeURIComponent(bar.id)}`}
      className="tieba-bar-item hot-bar-item flex items-center gap-3 p-2.5 no-underline"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border-subtle)',
        color: 'inherit',
      }}
    >
      <span
        className="hot-bar-icon w-9 h-9 flex items-center justify-center font-display text-[14px] font-extrabold flex-shrink-0"
        style={{
          background: 'var(--gold-subtle)',
          color: 'var(--gold)',
          clipPath: HEX_CLIP_PATH,
        }}
      >
        {bar.icon}
      </span>
      <div className="hot-bar-info flex-1 min-w-0">
        <div
          className="hot-bar-name font-display text-[13px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ color: 'var(--text)' }}
        >
          {bar.name}
        </div>
        <div
          className="hot-bar-meta font-mono text-[10px]"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}
        >
          {fmtNum(bar.members)} members · {fmtNum(bar.posts)} posts
        </div>
      </div>
    </Link>
  );
}

/* ── 热门贴吧项（紧凑列表，数据为字符串格式） ── */
function HotBarItem({ bar }: { bar: HotTieba }) {
  return (
    <Link
      href={`/community/tiebas?bar=${encodeURIComponent(bar.id)}`}
      className="tieba-bar-item hot-bar-item flex items-center gap-3 p-2.5 no-underline"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border-subtle)',
        color: 'inherit',
      }}
    >
      <span
        className="hot-bar-icon w-9 h-9 flex items-center justify-center font-display text-[14px] font-extrabold flex-shrink-0"
        style={{
          background: 'var(--gold-subtle)',
          color: 'var(--gold)',
          clipPath: HEX_CLIP_PATH,
        }}
      >
        {bar.icon}
      </span>
      <div className="hot-bar-info flex-1 min-w-0">
        <div
          className="hot-bar-name font-display text-[13px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ color: 'var(--text)' }}
        >
          {bar.name}
        </div>
        <div
          className="hot-bar-meta font-mono text-[10px]"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}
        >
          {bar.members} members · {bar.posts} posts
        </div>
      </div>
    </Link>
  );
}

interface TiebasSidebarProps {
  /** 当前贴吧 ID，用于从 Related 列表中排除自身 */
  currentBarId: string;
}

export default function TiebasSidebar({ currentBarId }: TiebasSidebarProps) {
  // 相关贴吧：目录中排除当前贴吧
  const relatedBars = TIEBA_CATALOG.filter((b) => b.id !== currentBarId);

  return (
    <aside
      className="community-sidebar flex flex-col gap-6"
      style={{
        position: 'sticky',
        top: '88px',
        maxHeight: 'calc(100vh - 104px)',
        overflowY: 'auto',
        paddingRight: '4px',
      }}
    >
      {/* 相关贴吧 */}
      <section className="sidebar-section flex flex-col gap-2.5">
        <div
          className="sidebar-section-title font-mono text-[10px] font-semibold uppercase px-1 mb-1"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
        >
          Related Tiebas
        </div>
        <div className="hot-bars-list flex flex-col gap-2">
          {relatedBars.map((bar) => (
            <RelatedBarItem key={bar.id} bar={bar} />
          ))}
        </div>
      </section>

      {/* 热门贴吧 */}
      <section className="sidebar-section flex flex-col gap-2.5">
        <div
          className="sidebar-section-title font-mono text-[10px] font-semibold uppercase px-1 mb-1"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
        >
          Hot Tiebas
        </div>
        <div className="hot-bars-list flex flex-col gap-2">
          {HOT_TIEBAS.map((bar) => (
            <HotBarItem key={bar.id} bar={bar} />
          ))}
        </div>
      </section>

      {/* 版权信息 */}
      <section className="sidebar-section flex flex-col gap-2.5">
        <div
          className="sidebar-copyright pt-2 text-center"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <div
            className="font-display text-[12px] font-bold"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}
          >
            © 2026 GHRANK
          </div>
          <div
            className="font-mono text-[9px] mt-1"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
          >
            Open Source Intelligence
          </div>
        </div>
      </section>
    </aside>
  );
}

/**
 * PostBody —— 帖子正文渲染组件
 * 将结构化 ContentBlock 数组渲染为 JSX，避免 dangerouslySetInnerHTML
 * 支持：段落、标题、图片占位、代码块、引用、列表
 *
 * 图片处理：因无静态图片资源，用渐变占位容器 + 金/青色角装饰替代
 */
import type { ContentBlock } from '../_data/community-detail-data';
import CodeBlock from '@/components/shared/CodeBlock';

/* ── 图片占位组件（渐变背景 + 角装饰 + 说明文字） ── */
function ImagePlaceholder({
  alt,
  caption,
  captionTag,
}: {
  alt: string;
  caption: string;
  captionTag: string;
}) {
  return (
    <div className="post-image my-[18px]">
      <div
        className="post-image-wrap relative block w-full overflow-hidden"
        style={{ minHeight: '160px', border: '1px solid var(--border)' }}
      >
        {/* 左上角金色装饰 */}
        <span
          className="absolute top-[-1px] left-[-1px] w-3.5 h-3.5 z-10 pointer-events-none"
          style={{ borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)' }}
        />
        {/* 右下角青色装饰 */}
        <span
          className="absolute bottom-[-1px] right-[-1px] w-3.5 h-3.5 z-10 pointer-events-none"
          style={{ borderBottom: '2px solid var(--cyan)', borderRight: '2px solid var(--cyan)' }}
        />
        {/* 渐变占位区 + alt 文字 */}
        <div
          className="flex items-center justify-center w-full"
          style={{
            minHeight: '160px',
            background:
              'linear-gradient(135deg, rgba(245,197,24,0.03) 0%, rgba(57,210,192,0.03) 100%), var(--surface)',
          }}
        >
          <span
            className="font-mono text-xs text-center px-4"
            style={{ color: 'var(--text-dim)', letterSpacing: '0.04em' }}
          >
            {alt}
          </span>
        </div>
      </div>
      {/* 图片说明 */}
      <div
        className="post-image-caption mt-1.5 pl-0.5 font-mono text-[10px] uppercase"
        style={{ color: 'var(--text-dim)', letterSpacing: '0.06em' }}
      >
        <span className="caption-tag mr-1.5" style={{ color: 'rgba(245,197,24,0.5)' }}>
          {captionTag}
        </span>
        {caption}
      </div>
    </div>
  );
}

/* ── 单个内容块渲染 ── */
function ContentBlockView({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="mb-3.5 last:mb-0" style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.7, color: 'var(--text)' }}>
          {block.text}
        </p>
      );
    case 'heading':
      if (block.level === 2) {
        return (
          <h2 className="mt-6 mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
            {block.text}
          </h2>
        );
      }
      return (
        <h3 className="mt-6 mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: 'var(--gold)', lineHeight: 1.3 }}>
          {block.text}
        </h3>
      );
    case 'image':
      return <ImagePlaceholder alt={block.alt} caption={block.caption} captionTag={block.captionTag} />;
    case 'code':
      return <CodeBlock lang={block.lang} code={block.code} />;
    case 'blockquote':
      return (
        <blockquote
          className="my-4 py-2 pl-4"
          style={{
            borderLeft: '3px solid var(--gold)',
            background: 'rgba(245,197,24,0.03)',
          }}
        >
          <p className="italic m-0" style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.7, color: 'var(--text)' }}>
            {block.text}
          </p>
        </blockquote>
      );
    case 'list':
      return (
        <ul
          className="mb-3.5 pl-6 list-disc"
          style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.7, color: 'var(--text)' }}
        >
          {block.items.map((item, i) => (
            <li key={i} className="mb-1.5" style={{ ['markerColor' as string]: 'rgba(245,197,24,0.5)' } as React.CSSProperties}>
              {item}
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

/* ── PostBody 主组件 ── */
export default function PostBody({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="post-body">
      {blocks.map((block, i) => (
        <ContentBlockView key={i} block={block} />
      ))}
    </div>
  );
}

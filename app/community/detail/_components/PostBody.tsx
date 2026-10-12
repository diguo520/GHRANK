/**
 * PostBody —— 帖子正文渲染组件
 * 将结构化 ContentBlock 数组渲染为 JSX，避免 dangerouslySetInnerHTML
 * 支持：段落（含 URL 自动检测）、标题、图片（antd Image 渐进加载 + 自定义工具栏）、代码块、引用、列表、链接卡片
 *
 * URL 检测规则：
 * - 独立段落中只有一个链接 → 自动转为链接卡片
 * - 行内夹杂链接 → 不转卡片，在链接后添加外链标识图标
 */
'use client';

import { type ReactNode, useState, useEffect, useRef, cloneElement, Children, isValidElement } from 'react';
import Link from 'next/link';
import { Image } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { ContentBlock } from '../_data/community-detail-data';
import CodeBlock from '@/components/shared/CodeBlock';
import NoiseBackground from '@/components/shared/NoiseBackground';

/* ═══════════════════════════════════════════════════════════
   URL 检测工具
   ═══════════════════════════════════════════════════════════ */

/** 匹配 http(s):// 开头或 / 开头的站内路径 */
const URL_RE = /(https?:\/\/[^\s]+|\/[a-z0-9/_-]+(?:\?[^\s]*)?)/gi;

/** 判断整段文本是否只是一个 URL（独立段落 → 卡片） */
function isPureUrl(text: string): string | null {
  const trimmed = text.trim();
  // 纯外部链接
  if (/^https?:\/\/\S+$/i.test(trimmed)) return trimmed;
  // 纯站内路径（至少包含一级路由段，排除单独的 / ）
  if (/^\/[a-z0-9]/i.test(trimmed) && !/\s/.test(trimmed)) return trimmed;
  return null;
}

/** 判断 URL 是否为站内链接 */
function isInternalUrl(url: string): boolean {
  return url.startsWith('/') || url.includes('localhost') || url.includes('ghrank');
}

/* ═══════════════════════════════════════════════════════════
   外链标识小图标
   ═══════════════════════════════════════════════════════════ */

function ExternalLinkIcon({ size = 10 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      style={{ display: 'inline-block', verticalAlign: 'baseline', marginLeft: '2px', opacity: 0.55 }}
    >
      <path
        d="M6 3H3v10h10v-3M9 3h4v4M13 3L7 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   链接卡片组件
   ═══════════════════════════════════════════════════════════ */

function LinkCard({
  url,
  title,
  description,
  isInternal,
}: {
  url: string;
  title: string;
  description: string;
  isInternal: boolean;
}) {
  /* 卡片样式：透明底 + 边框 + hover 金色高亮 */
  const cardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 18px',
    backgroundColor: 'transparent',
    backgroundImage: 'none',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
    margin: '14px 0',
    boxShadow: 'none',
  };

  /* 左侧图标区：站内用路径符号，站外用外链图标 */
  const iconArea = (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '6px',
        background: 'transparent',
        border: `1px solid ${isInternal ? 'rgba(57,210,192,0.25)' : 'rgba(157,140,255,0.25)'}`,
        color: isInternal ? 'var(--cyan)' : 'var(--gold)',
      }}
    >
      {isInternal ? (
        /* 站内链接图标 */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        /* 站外链接图标 */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );

  /* 文字区 */
  const textArea = (
    <div className="flex-1 min-w-0">
      <div
        className="font-body font-semibold"
        style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {title}
      </div>
      <div
        className="font-mono"
        style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {description || url}
      </div>
    </div>
  );

  /* 右侧标签：INTERNAL / EXTERNAL */
  const badge = (
    <span
      className="font-mono flex-shrink-0"
      style={{
        fontSize: '9px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        padding: '2px 6px',
        borderRadius: '3px',
        color: isInternal ? 'var(--cyan)' : 'var(--gold)',
        background: 'transparent',
        border: `1px solid ${isInternal ? 'rgba(57,210,192,0.25)' : 'rgba(157,140,255,0.25)'}`,
      }}
    >
      {isInternal ? 'INTERNAL' : 'EXTERNAL'}
    </span>
  );

  const handleHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.borderColor = 'rgba(157, 140, 255, 0.35)';
    e.currentTarget.style.transform = 'translateY(-1px)';
    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
  };
  const handleLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.borderColor = 'var(--border)';
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = '';
  };

  /* 站内链接用 next/link，站外用 <a> + target=_blank */
  if (isInternal) {
    return (
      <Link href={url} style={cardStyle} onMouseEnter={handleHover} onMouseLeave={handleLeave}>
        {iconArea}
        {textArea}
        {badge}
      </Link>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={cardStyle} onMouseEnter={handleHover} onMouseLeave={handleLeave}>
      {iconArea}
      {textArea}
      {badge}
    </a>
  );
}

/* ═══════════════════════════════════════════════════════════
   段落渲染：URL 自动检测
   ═══════════════════════════════════════════════════════════ */

/** 将段落文本中的 URL 拆分为文本片段和链接节点 */
function renderParagraphWithLinks(text: string): ReactNode {
  const pureUrl = isPureUrl(text);
  /* 整段就是一个链接 → 渲染为链接卡片 */
  if (pureUrl) {
    const internal = isInternalUrl(pureUrl);
    return (
      <LinkCard
        url={pureUrl}
        title={internal ? 'Internal page' : pureUrl.replace(/^https?:\/\//, '').split('/')[0]}
        description={pureUrl}
        isInternal={internal}
      />
    );
  }

  /* 行内夹杂链接 → 拆分渲染，链接后加外链标识 */
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  URL_RE.lastIndex = 0;
  while ((match = URL_RE.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = matchStart + match[0].length;
    /* 链接前的普通文本 */
    if (matchStart > lastIndex) {
      parts.push(text.slice(lastIndex, matchStart));
    }
    const url = match[0];
    const internal = isInternalUrl(url);
    if (internal) {
      parts.push(
        <Link key={`lnk-${key++}`} href={url} style={{ color: 'var(--cyan)', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
          {url}
        </Link>,
      );
    } else {
      parts.push(
        <a key={`lnk-${key++}`} href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
          {url}
        </a>,
        <ExternalLinkIcon key={`icon-${key++}`} />,
      );
    }
    lastIndex = matchEnd;
  }
  /* 尾部普通文本 */
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 1 ? parts : text;
}

/* ═══════════════════════════════════════════════════════════
   图片加载组件 —— 使用官方 progress API + 状态机模拟进度
   核心思路（与官方 demo 一致）：
   1. 加载阶段：不传 src，只传 placeholder={{ progress: { percent, render } }}
      antd 会只渲染 Progress 组件（墨水动画 + 进度条），不创建 img 元素
   2. 通过 useEffect + setTimeout 模拟 percent 从 0 递增到 100
   3. 到 100% 后切换到显示带 src 的 Image
   ═══════════════════════════════════════════════════════════ */

/**
 * 自定义预览工具栏 —— 在默认工具栏基础上增加"下载原图"按钮
 * 使用 antd v6 的 actionsRender（替代已废弃的 toolbarRender）
 */
function renderPreviewToolbar(
  originalNode: React.ReactElement,
  info: {
    icons: {
      flipYIcon: React.ReactNode;
      flipXIcon: React.ReactNode;
      rotateLeftIcon: React.ReactNode;
      rotateRightIcon: React.ReactNode;
      zoomOutIcon: React.ReactNode;
      zoomInIcon: React.ReactNode;
    };
    actions: {
      onFlipY: () => void;
      onFlipX: () => void;
      onRotateLeft: () => void;
      onRotateRight: () => void;
      onZoomOut: () => void;
      onZoomIn: () => void;
      onReset: () => void;
      onClose: () => void;
    };
    image: { url: string; alt?: string };
  },
) {
  /* 下载原图：使用 fetch + Blob 方式，确保下载真实图片
     注意：antd 内部使用 image.url 而非 image.src */
  const handleDownload = async () => {
    const src = info.image.url;
    const alt = info.image.alt || 'image';

    // 从 src URL 中提取文件名（如果存在）
    let filename = alt;
    const urlObj = new URL(src, window.location.origin);
    const fileParam = urlObj.searchParams.get('file');
    if (fileParam) {
      // API 路由：/api/attachments/image?file=xxx.png
      filename = decodeURIComponent(fileParam);
    } else {
      // 直接 URL：从路径中提取文件名
      const pathname = urlObj.pathname;
      const nameFromPath = pathname.split('/').pop();
      if (nameFromPath && nameFromPath.includes('.')) {
        filename = decodeURIComponent(nameFromPath);
      }
    }

    try {
      const response = await fetch(src, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);

      // 从 Content-Type 推断文件扩展名
      const contentType = response.headers.get('content-type') || '';
      let ext = '';
      if (contentType.includes('jpeg') || contentType.includes('jpg')) {
        ext = 'jpg';
      } else if (contentType.includes('png')) {
        ext = 'png';
      } else if (contentType.includes('gif')) {
        ext = 'gif';
      } else if (contentType.includes('webp')) {
        ext = 'webp';
      } else if (contentType.includes('svg')) {
        ext = 'svg';
      } else {
        ext = filename.includes('.') ? filename.split('.').pop() : 'png';
      }

      // 确保文件名有扩展名
      const finalFilename = filename.includes('.') ? filename : `${filename}.${ext}`;

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = finalFilename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 延迟释放 Blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch (err) {
      console.error('Download failed:', err);
      // fallback：使用原生 a 标签下载
      const link = document.createElement('a');
      link.href = src;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  /* 下载按钮：与官方 action 按钮相同的 <span> 包裹 + 相同 className，
     确保渲染在 actions flex 容器内，不掉到外面单独一行 */
  const downloadAction = (
    <span
      key="download-action"
      className="ant-image-preview-actions-action"
      onClick={handleDownload}
      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
    >
      <DownloadOutlined style={{ fontSize: 20, color: '#fff' }} />
    </span>
  );

  /* 关键：把下载按钮注入到 originalNode 的 children 里（官方 actions 容器内部，最前面），
     而不是作为容器外的兄弟节点，这样不会掉在外面单独一行 */
  if (isValidElement(originalNode)) {
    const originalChildren = Children.toArray((originalNode.props as { children?: ReactNode }).children);
    return cloneElement(
      originalNode,
      undefined,
      downloadAction,        /* 下载放在第一个，与官方顺序一致 */
      ...originalChildren,   /* 官方原有：翻转Y/翻转X/左旋/右旋/缩小/放大... */
    );
  }

  /* fallback：如果 originalNode 不可克隆，直接返回 Fragment（降级） */
  return (
    <>
      {originalNode}
      {downloadAction}
    </>
  );
}

/**
 * 生成式图片加载组件
 * 严格复刻 antd 官方 demo 的 GeneratingProgress 模式：
 * - 状态机：generating（0%→100%）→ complete（显示图片）
 * - 外层统一容器 + aspectRatio=16/9，加载态/完成态高度一致，避免底部空白
 * - 进度条在水彩墨水动画上垂直居中
 * - 图片加载失败时显示噪点背景占位
 */
function GeneratingImage({
  src,
  alt,
  previewToolbar,
}: {
  src: string;
  alt: string;
  previewToolbar: typeof renderPreviewToolbar;
}) {
  const [percent, setPercent] = useState(0);
  const [complete, setComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [inView, setInView] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [sizeReady, setSizeReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  /* IntersectionObserver：图片进入视口后才开始加载流程 */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* 模拟生成进度：仅在进入视口后启动，进度条独立于图片加载 */
  useEffect(() => {
    if (!inView) return;
    if (!complete && percent < 100) {
      timerRef.current = setTimeout(() => {
        setPercent((prev) => Math.min(prev + Math.random() * 8 + 2, 100));
      }, 200);
    } else if (!complete && percent >= 100 && !sizeReady) {
      /* 进度到 100% 后，预检测图片尺寸（仅获取尺寸，不设置 complete） */
      timerRef.current = setTimeout(() => {
        const probe = new window.Image();
        probe.onload = () => {
          setNaturalSize({ w: probe.naturalWidth, h: probe.naturalHeight });
          setSizeReady(true);
        };
        probe.onerror = () => setHasError(true);
        probe.src = src;
      }, 300);
    } else if (!complete && percent >= 100 && sizeReady) {
      /* 尺寸已就绪，延迟 400ms 再显示图片，让用户看到 100% 进度条 */
      timerRef.current = setTimeout(() => {
        setComplete(true);
      }, 400);
    }
    return () => clearTimeout(timerRef.current);
  }, [percent, complete, src, inView, sizeReady]);

  /* 加载阶段的容器样式：固定 16:9 比例，确保 placeholder 有足够空间 */
  const loadingStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  };

  /* 错误提示的容器样式：使用 minHeight 自适应内容高度 */
  const errorStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: '160px',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  };

  /* 完成态容器样式：根据图片真实比例自适应
     - 超宽图（w/h > 2）：限制 max-width 900px
     - 高图（h/w > 1.5）：max-width 限制在 600px
     - 普通图：max-width 100%
     - 小图（w < 400 且 h < 400）：保持原始尺寸 */
  const getCompleteStyle = (): React.CSSProperties => {
    if (!naturalSize) return loadingStyle;

    const { w, h } = naturalSize;
    const ratio = w / h;

    // 小图：保持原始尺寸，宽度自适应
    if (w < 400 && h < 400) {
      return {
        display: 'inline-block',
        width: 'auto',
        maxWidth: '100%',
      };
    }

    // 超宽图
    if (ratio > 2) {
      return {
        display: 'block',
        width: '100%',
        maxWidth: '900px',
      };
    }

    // 高图
    if (ratio < 1 / 1.5) {
      return {
        display: 'block',
        width: '100%',
        maxWidth: '600px',
      };
    }

    // 普通图
    return {
      display: 'block',
      width: '100%',
      maxWidth: '100%',
    };
  };

  /* 图片加载失败：显示噪点背景占位 */
  if (hasError) {
    return (
      <NoiseBackground
        message="Image Unavailable"
        subMessage="This image has been deleted or cannot be loaded"
        style={errorStyle}
      />
    );
  }

  /* 完成态：图片完整显示，由父容器 flex 居中 */
  if (complete && naturalSize) {
    const { w, h } = naturalSize;
    const isSmall = w < 400 && h < 400;

    return (
      <div style={getCompleteStyle()}>
        <Image
          src={src}
          alt={alt}
          width={isSmall ? 'auto' : '100%'}
          height="auto"
          style={{
            display: 'block',
            width: isSmall ? 'auto' : '100%',
            maxWidth: '100%',
            height: 'auto',
            objectFit: 'contain',
          }}
          preview={{
            actionsRender: previewToolbar,
            mask: { blur: true },
          }}
        />
      </div>
    );
  }

  /* 未进入视口：显示空占位容器 */
  if (!inView) {
    return <div ref={containerRef} style={loadingStyle} />;
  }

  /* 加载态：显示进度条 */
  return (
    <div ref={containerRef} style={loadingStyle}>
      <Image
        width="100%"
        height="100%"
        placeholder={{
          progress: {
            percent: Math.round(percent),
            render: (progress: React.ReactNode, p: number) => (
              <>
                {progress}
                <div style={{ marginTop: 8 }}>Generating {p}%</div>
              </>
            ),
          },
        }}
      />
    </div>
  );
}

function ImagePlaceholder({
  alt,
  caption,
  captionTag,
  src,
}: {
  alt: string;
  caption: string;
  captionTag: string;
  src?: string;
}) {
  return (
    <div className="post-image my-[18px]">
      <div
        className="post-image-wrap relative block w-full overflow-hidden flex items-center justify-center"
        style={{ minHeight: '160px', border: '1px solid var(--border)', borderRadius: 12 }}
      >
        {/* 对角装饰：定位在容器内部，配合圆角 */}
        <span
          className="absolute top-0 left-0 w-3.5 h-3.5 z-10 pointer-events-none"
          style={{ borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)', borderTopLeftRadius: 12 }}
        />
        <span
          className="absolute bottom-0 right-0 w-3.5 h-3.5 z-10 pointer-events-none"
          style={{ borderBottom: '2px solid var(--cyan)', borderRight: '2px solid var(--cyan)', borderBottomRightRadius: 12 }}
        />
        {src ? (
          /* 有 src 时使用 GeneratingImage：先显示进度条到 100%，再加载图片 */
          <GeneratingImage src={src} alt={alt} previewToolbar={renderPreviewToolbar} />
        ) : (
          /* 无 src 时保留原文字占位 */
          <div
            className="flex items-center justify-center w-full"
            style={{
              minHeight: '160px',
              background:
                'linear-gradient(135deg, rgba(157,140,255,0.03) 0%, rgba(57,210,192,0.03) 100%), var(--surface)',
            }}
          >
            <span
              className="font-mono text-xs text-center px-4"
              style={{ color: 'var(--text-dim)', letterSpacing: '0.04em' }}
            >
              {alt}
            </span>
          </div>
        )}
      </div>
      <div
        className="post-image-caption mt-1.5 pl-0.5 font-mono text-[10px] uppercase"
        style={{ color: 'var(--text-dim)', letterSpacing: '0.06em' }}
      >
        <span className="caption-tag mr-1.5" style={{ color: 'rgba(157,140,255,0.5)' }}>
          {captionTag}
        </span>
        {caption}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   视频块组件 —— 与 ImagePlaceholder 视觉风格一致
   ═══════════════════════════════════════════════════════════ */

function VideoBlock({
  src,
  poster,
  alt,
  caption,
  captionTag,
}: {
  src: string;
  poster?: string;
  alt: string;
  caption: string;
  captionTag: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hover, setHover] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);   // 播放进度 0-100
  const [duration, setDuration] = useState(0);    // 总时长（秒）
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 自动静音播放（符合浏览器自动播放策略）
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});

    const onError = () => setHasError(true);
    v.addEventListener('error', onError);
    if (v.error) setHasError(true);

    return () => v.removeEventListener('error', onError);
  }, [src]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  // 全屏切换
  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  };

  // 监听全屏变化
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // 播放状态 + 进度同步
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => {
      if (v.duration > 0) setProgress((v.currentTime / v.duration) * 100);
    };
    const onMeta = () => setDuration(v.duration || 0);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onMeta);
    };
  }, []);

  // 点击进度条跳转
  const seekByRatio = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = Math.max(0, Math.min(ratio, 1)) * v.duration;
  };

  // 格式化时间（秒 → m:ss）
  const fmtTime = (s: number): string => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // 中央播放按钮：暂停时始终显示，播放时 hover 显示
  const showCenterBtn = !playing || hover;
  // 底部控制栏：hover 或暂停时显示
  const showControls = hover || !playing;

  return (
    <div className="post-video my-[18px]">
      <div
        ref={containerRef}
        className="post-video-wrap relative block w-full overflow-hidden"
        style={
          hasError
            ? { minHeight: '160px', border: '1px solid var(--border)', borderRadius: 12 }
            : { aspectRatio: '16 / 9', border: '1px solid var(--border)', borderRadius: 12 }
        }
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* 对角装饰：定位在容器内部，配合圆角 */}
        <span
          className="absolute top-0 left-0 w-3.5 h-3.5 z-20 pointer-events-none"
          style={{ borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)', borderTopLeftRadius: 12 }}
        />
        <span
          className="absolute bottom-0 right-0 w-3.5 h-3.5 z-20 pointer-events-none"
          style={{ borderBottom: '2px solid var(--cyan)', borderRight: '2px solid var(--cyan)', borderBottomRightRadius: 12 }}
        />

        {/* 视频加载失败：噪点占位 */}
        {hasError ? (
          <NoiseBackground
            message="Video Unavailable"
            subMessage="This video has been deleted or cannot be loaded"
            style={{ width: '100%', minHeight: '160px' }}
          />
        ) : (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            preload="metadata"
            muted
            loop
            playsInline
            aria-label={alt}
            onClick={togglePlay}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              background: '#0d1117',
              cursor: 'pointer',
              borderRadius: 12,
            }}
          />
        )}

        {/* 中央播放/暂停按钮 */}
        {!hasError && showCenterBtn && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            aria-label={playing ? 'Pause' : 'Play'}
            className="absolute left-1/2 top-1/2 z-10 flex items-center justify-center"
            style={{
              width: 52, height: 52,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(12px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              opacity: playing && !hover ? 0.6 : 1,
            }}
          >
            {playing ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        )}

        {/* 底部控制栏：进度条 + 时间 + 静音 + 全屏 */}
        {!hasError && showControls && (
          <div
            className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-2"
            style={{
              padding: '8px 12px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
            }}
          >
            {/* 播放进度条 */}
            <div
              onClick={seekByRatio}
              className="flex-1 cursor-pointer"
              style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, var(--gold), rgba(157,140,255,0.8))',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>

            {/* 时间 */}
            <span className="font-mono flex-shrink-0" style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>
              {fmtTime(videoRef.current?.currentTime ?? 0)} / {fmtTime(duration)}
            </span>

            {/* 静音 */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.35)', cursor: 'pointer', padding: 0, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            >
              {muted ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>

            {/* 全屏 */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.35)', cursor: 'pointer', padding: 0, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isFullscreen ? (
                  <>
                    <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                    <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                    <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                    <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                  </>
                ) : (
                  <>
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  </>
                )}
              </svg>
            </button>
          </div>
        )}
      </div>
      {/* caption */}
      <div
        className="post-video-caption mt-1.5 pl-0.5 font-mono text-[10px] uppercase"
        style={{ color: 'var(--text-dim)', letterSpacing: '0.06em' }}
      >
        <span className="caption-tag mr-1.5" style={{ color: 'rgba(157,140,255,0.5)' }}>
          {captionTag}
        </span>
        {caption}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   单个内容块渲染
   ═══════════════════════════════════════════════════════════ */

function ContentBlockView({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'paragraph': {
      /* 段落中检测 URL：纯链接 → 卡片，行内链接 → 加外链标识 */
      const content = renderParagraphWithLinks(block.text);
      /* 如果返回的是 LinkCard，不需要外层 <p> 包裹 */
      if (content && typeof content === 'object' && 'type' in content) {
        return <>{content}</>;
      }
      return (
        <p className="mb-3.5 last:mb-0" style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.7, color: 'var(--text)' }}>
          {content}
        </p>
      );
    }
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
      return <ImagePlaceholder alt={block.alt} caption={block.caption} captionTag={block.captionTag} src={block.src} />;
    case 'video':
      return (
        <VideoBlock
          src={block.src}
          poster={block.poster}
          alt={block.alt}
          caption={block.caption}
          captionTag={block.captionTag}
        />
      );
    case 'code':
      return <CodeBlock lang={block.lang} code={block.code} />;
    case 'blockquote':
      return (
        <blockquote
          className="my-4 py-2 pl-4"
          style={{
            borderLeft: '3px solid var(--gold)',
            background: 'rgba(157,140,255,0.03)',
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
            <li key={i} className="mb-1.5" style={{ ['markerColor' as string]: 'rgba(157,140,255,0.5)' } as React.CSSProperties}>
              {renderParagraphWithLinks(item)}
            </li>
          ))}
        </ul>
      );
    case 'linkcard':
      return (
        <LinkCard
          url={block.url}
          title={block.title}
          description={block.description}
          isInternal={block.isInternal}
        />
      );
    default:
      return null;
  }
}

/* ═══════════════════════════════════════════════════════════
   PostBody 主组件
   ═══════════════════════════════════════════════════════════ */

export default function PostBody({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="post-body">
      {blocks.map((block, i) => (
        <ContentBlockView key={i} block={block} />
      ))}
    </div>
  );
}

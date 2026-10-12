/**
 * ShareCardModal —— 社交媒体海报式分享卡片（X/小红书/即刻风格）
 *
 * v3.0 改用 Next.js OG Image API（Satori）在服务端生成 PNG：
 *   - 预览：直接 <img src="/api/og/community/[id]">
 *   - 下载：fetch OG API → blob → 下载
 *   - 复制图：fetch OG API → blob → clipboard.write
 *
 * 彻底告别 Canvas 手绘的字体测量、跨域污染、布局错乱问题。
 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { App, Button } from 'antd';
import { CheckOutlined, CloseOutlined, DownloadOutlined, LinkOutlined, PictureOutlined } from '@ant-design/icons';
import type { ContentBlock } from '../_data/community-detail-data';
import { type PostDetail as PostDetailType } from '../_data/community-detail-data';

interface ShareCardModalProps {
  open: boolean;
  onClose: () => void;
  post: PostDetailType;
  /** 当前页面 URL 来源（若不提供则从浏览器 window.location 拿） */
  shareUrl?: string;
}

/* ═══════════════════════════════════════════════════
   1. 内容提取辅助：从 blocks 中拿到摘要 / 首图
   仅用于 DOM 预览，OG API 有自己独立的提取逻辑
   ═══════════════════════════════════════════════════ */

function extractExcerpt(blocks: ContentBlock[]): string {
  const paras = blocks
    .filter((b): b is Extract<ContentBlock, { type: 'paragraph' }> => b.type === 'paragraph')
    .map((b) => b.text);
  const joined = paras.slice(0, 2).join('  ');
  if (joined.length <= 160) return joined;
  return joined.slice(0, 160).trimEnd() + '…';
}

function extractCover(blocks: ContentBlock[]): { url: string; caption?: string } | null {
  const first = blocks.find((b): b is Extract<ContentBlock, { type: 'image' }> => b.type === 'image');
  if (!first?.src) return null;
  return { url: first.src, caption: first.caption };
}

/* ═══════════════════════════════════════════════════
   2. OG API URL 构建工具
   ═══════════════════════════════════════════════════ */

/** 构建 OG 图片 API 的 URL */
function buildOgUrl(postId: number, shareUrl: string, mode: 'preview' | 'download' = 'preview'): string {
  const params = new URLSearchParams();
  params.set('url', shareUrl);
  if (mode === 'download') params.set('download', '1');
  const query = params.toString();
  return `/api/og/community/${postId}?${query}`;
}

/* ═══════════════════════════════════════════════════
   3. 主组件：ShareCardModal
   ═══════════════════════════════════════════════════ */

export default function ShareCardModal({ open, onClose, post, shareUrl }: ShareCardModalProps) {
  const { message } = App.useApp();
  const [mounted, setMounted] = useState(false);
  const [copying, setCopying] = useState<'img' | 'link' | null>(null);
  const [downloading, setDownloading] = useState(false);

  // 用当前页面 URL 做默认值（客户端安全）
  const currentUrl = useMemo(() => {
    if (shareUrl) return shareUrl;
    if (typeof window !== 'undefined') return window.location.href;
    return 'https://ghrank.io';
  }, [shareUrl]);

  const cover = useMemo(() => extractCover(post.content), [post.content]);
  const excerpt = useMemo(() => extractExcerpt(post.content), [post.content]);

  // OG 图片 URL —— 带时间戳避免缓存导致预览不更新
  const ogPreviewUrl = useMemo(
    () => buildOgUrl(post.id, currentUrl, 'preview'),
    [post.id, currentUrl],
  );

  // —— mounted 同步：打开立即 true；关闭时延迟 220ms 让退出动画跑完
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), 220);
    return () => window.clearTimeout(t);
  }, [open]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /* ═══════════════════════════════════════════════════
     4. 操作：复制图 / 下载图 / 复制链接
     全部通过 fetch OG API 获取 PNG blob，不再用 Canvas
     ═══════════════════════════════════════════════════ */

  /** 从 OG API 获取 PNG blob */
  async function fetchOgBlob(mode: 'preview' | 'download' = 'preview'): Promise<Blob> {
    const url = buildOgUrl(post.id, currentUrl, mode);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OG API ${res.status}`);
    return await res.blob();
  }

  const handleCopyImage = async () => {
    setCopying('img');
    try {
      const blob = await fetchOgBlob('preview');
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        message.success('Poster copied to clipboard');
      } else {
        // 浏览器不支持剪贴板写图片：降级为下载
        triggerDownload(blob, `share-${post.id}.png`);
        message.success('Browser not supported; downloaded instead');
      }
    } catch {
      message.error('Failed to copy image');
    }
    setCopying(null);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await fetchOgBlob('download');
      triggerDownload(blob, `ghrank-post-${post.id}.png`);
      message.success('Poster downloaded');
    } catch {
      message.error('Failed to generate image');
    }
    setDownloading(false);
  };

  const handleCopyLink = async () => {
    setCopying('link');
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = currentUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      message.success('Link copied');
    } catch {
      message.error('Failed to copy link');
    }
    setCopying(null);
  };

  if (!mounted) return null;

  const visible = open;

  return (
    <div
      className={'share-modal-root ' + (visible ? 'is-open' : 'is-closing')}
      aria-modal="true"
      role="dialog"
      aria-label="Share post"
    >
      {/* 遮罩 */}
      <div className="share-modal-mask" onClick={onClose} />

      {/* 居中卡片列：海报 + 底栏按钮 */}
      <div className="share-modal-center">
        {/* —— OG 图片预览 —— 服务端 Satori 生成，所见即所得 */}
        <div className="share-card share-card-og">
          <span className="share-card-corner tl" />
          <span className="share-card-corner br" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ogPreviewUrl}
            alt="Share poster"
            className="share-card-og-img"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* —— DOM 预览版（隐藏，仅用于 SEO/无障碍 —— 实际展示用 OG 图） —— */}
        <noscript>
          <div className="share-card" data-for="poster-preview">
            <span className="share-card-corner tl" />
            <span className="share-card-corner br" />
            <div className="share-card-header">
              <span className="brand">GHRANK</span>
              <span className="sep">·</span>
              <span className="section">{post.section.toUpperCase()}</span>
            </div>
            <h2 className="share-card-title">{post.title}</h2>
            <p className="share-card-excerpt">{excerpt}</p>
            {cover ? (
              <div className="share-card-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover.url} alt={cover.caption ?? ''} referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="share-card-media placeholder">
                <div className="ph-tag">{post.section.toUpperCase()}</div>
              </div>
            )}
            <div className="share-card-author">
              <div className="avatar-badge">{post.avatar.slice(0, 1).toUpperCase()}</div>
              <div className="meta">
                <span className="handle">@{post.author}</span>
                <span className="dot">·</span>
                <span className="time">{post.postedTimeAgo}</span>
              </div>
            </div>
          </div>
        </noscript>

        {/* 底栏按钮 */}
        <div className="share-card-actions">
          <Button
            icon={<PictureOutlined />}
            onClick={handleCopyImage}
            loading={copying === 'img'}
            variant="outlined"
          >
            Copy image
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            loading={downloading}
            variant="outlined"
          >
            Download image
          </Button>
          <Button
            icon={copying === 'link' ? <CheckOutlined /> : <LinkOutlined />}
            onClick={handleCopyLink}
            type="primary"
            style={{
              background: '#9D8CFF',
              borderColor: '#9D8CFF',
              color: 'var(--bg)',
              boxShadow: '0 0 12px rgba(157,140,255,0.25)',
            }}
          >
            Copy link
          </Button>
          <Button icon={<CloseOutlined />} onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   5. 小工具
   ═══════════════════════════════════════════════════ */

/** 触发浏览器下载 blob */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 0);
}

/**
 * ImageLightbox —— 图片灯箱模态
 * 迁移自 prompt-detail.html 的 #imageLightbox + prompt-detail-init.js 灯箱逻辑
 * 支持键盘导航（Esc 关闭 / 左右切换）、点击遮罩关闭
 */
'use client';

import { useEffect } from 'react';

interface ImageLightboxProps {
  /** 是否打开 */
  open: boolean;
  /** 图片列表 */
  images: string[];
  /** 当前索引 */
  index: number;
  /** 关闭 */
  onClose: () => void;
  /** 切换上一张 */
  onPrev: () => void;
  /** 切换下一张 */
  onNext: () => void;
}

export default function ImageLightbox({ open, images, index, onClose, onPrev, onNext }: ImageLightboxProps) {
  // 键盘导航
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose, onPrev, onNext]);

  if (!open || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 backdrop-blur-xs"
        style={{ background: 'rgba(0,0,0,0.9)' }}
        onClick={onClose}
      />

      {/* 内容区 */}
      <div className="relative z-[1] flex max-h-[92vh] max-w-[96vw] flex-col items-center">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute -top-11 right-0 flex h-8 w-8 items-center justify-center transition-colors"
          style={{ fontSize: '20px', color: 'var(--text-dim)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label="Close"
        >
          {'\u00D7'}
        </button>

        {/* 图片 */}
        <div
          className="flex items-center justify-center overflow-hidden"
          style={{
            maxWidth: 'min(960px, 92vw)', maxHeight: '82vh',
            minWidth: '280px', minHeight: '180px',
            borderRadius: '4px', border: '1px solid var(--border)', background: '#000',
          }}
        >
          <img
            src={images[index]}
            alt=""
            style={{ maxWidth: 'min(960px, 92vw)', maxHeight: '82vh', objectFit: 'contain', display: 'block' }}
          />
        </div>

        {/* 导航按钮 */}
        {images.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-8">
            <button
              onClick={onPrev}
              className="flex h-9 w-9 items-center justify-center transition-colors"
              style={{ fontSize: '14px', color: 'var(--text-dim)', background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer' }}
              aria-label="Previous"
            >
              {'\u25C0'}
            </button>
            <button
              onClick={onNext}
              className="flex h-9 w-9 items-center justify-center transition-colors"
              style={{ fontSize: '14px', color: 'var(--text-dim)', background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer' }}
              aria-label="Next"
            >
              {'\u25B6'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

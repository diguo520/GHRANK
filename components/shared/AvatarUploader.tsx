'use client';

/**
 * AvatarUploader —— 头像上传与裁剪组件
 *
 * 流程：antd Upload 选择图片 → Modal 弹窗裁剪 → Canvas 生成 256×256 webp → 上传 API
 * 裁剪交互：鼠标拖动平移、滚轮缩放，裁剪框固定居中正方形。
 * 不依赖第三方裁剪库，纯原生 Canvas + 鼠标事件实现。
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { App, Modal, Upload, Button } from 'antd';
import { UploadIcon } from './icons';
import type { UploadProps } from 'antd';

interface AvatarUploaderProps {
  /** 上传成功后的回调，参数为图片 URL */
  onUploaded?: (url: string) => void;
  /** 触发按钮的内容（默认显示 UploadIcon + "Upload Avatar"） */
  children?: React.ReactNode;
  /** 按钮样式（传递给触发按钮） */
  buttonStyle?: React.CSSProperties;
  buttonClassName?: string;
  /** 当前用户名，用作头像文件名（同名覆盖，避免累积历史文件） */
  username?: string;
}

/** 输出图片尺寸（正方形） */
const OUTPUT_SIZE = 256;
/** 裁剪容器尺寸（图片显示区域）—— 放大预览，避免"手机看板"视觉错觉 */
const CONTAINER_SIZE = 340;
/** 裁剪框显示尺寸（正方形，与输出等比例） */
const CROP_VIEW_SIZE = 240;
/** 最小缩放：确保图片至少填满裁剪框 */
const MIN_SCALE = 0.1;
/** 最大缩放 */
const MAX_SCALE = 5;

export default function AvatarUploader({
  onUploaded,
  children,
  buttonStyle,
  buttonClassName,
  username,
}: AvatarUploaderProps) {
  // 从 App 组件上下文中获取 message 实例，避免静态方法触发 antd 主题警告
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // 裁剪状态：图片在容器中的偏移与缩放
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });

  // 拖动 ref（不触发重渲染，性能更好）
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  /** 初始化缩放：让图片刚好覆盖裁剪框（按显示裁剪框尺寸计算） */
  const initScale = useCallback((w: number, h: number) => {
    const fitScale = Math.max(CROP_VIEW_SIZE / w, CROP_VIEW_SIZE / h);
    setScale(fitScale);
    setOffset({ x: 0, y: 0 });
  }, []);

  /** 图片加载完成 */
  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
      initScale(img.naturalWidth, img.naturalHeight);
    },
    [initScale],
  );

  /** antd Upload beforeUpload：拦截上传，读取文件为 DataURL */
  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    // 类型与大小校验
    if (!file.type.startsWith('image/')) {
      message.error('Please select an image file');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      message.error('Image must be smaller than 10MB');
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setOpen(true);
    };
    reader.readAsDataURL(file);
    return false; // 阻止 antd 自动上传
  };

  /** 鼠标按下：开始拖动 */
  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
    e.preventDefault();
  };

  /** 鼠标移动：拖动图片 */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({
      x: dragStart.current.offsetX + dx,
      y: dragStart.current.offsetY + dy,
    });
  };

  /** 鼠标松开：停止拖动 */
  const stopDragging = () => {
    dragging.current = false;
  };

  /** 滚轮缩放（以裁剪框中心为缩放原点） */
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.002;
    const newScale = Math.min(Math.max(scale + delta * scale, MIN_SCALE), MAX_SCALE);
    setScale(newScale);
  };

  /** 用 Canvas 裁剪图片并生成 blob */
  const cropAndUpload = useCallback(async () => {
    if (!imageSrc || !imgNatural.w || !imgNatural.h) return;

    // 创建 Canvas 绘制裁剪结果
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      message.error('Canvas not supported');
      return;
    }

    // 加载原图
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageSrc;
    });

    // 计算图片在容器中的显示位置
    const displayW = imgNatural.w * scale;
    const displayH = imgNatural.h * scale;
    const imgLeft = (CONTAINER_SIZE - displayW) / 2 + offset.x;
    const imgTop = (CONTAINER_SIZE - displayH) / 2 + offset.y;

    // 裁剪框在容器中的位置（居中，按显示尺寸 CROP_VIEW_SIZE）
    const cropLeft = (CONTAINER_SIZE - CROP_VIEW_SIZE) / 2;
    const cropTop = (CONTAINER_SIZE - CROP_VIEW_SIZE) / 2;

    // 裁剪框覆盖图片的区域（在显示坐标系中）
    const srcLeft = cropLeft - imgLeft;
    const srcTop = cropTop - imgTop;

    // 转换到原图坐标系
    const sx = srcLeft / scale;
    const sy = srcTop / scale;
    const sSize = CROP_VIEW_SIZE / scale;

    // 白色背景（防止透明 PNG 裁剪后全透明）
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    // 从原图裁剪区域绘制到 Canvas
    ctx.drawImage(
      img,
      sx,
      sy,
      sSize,
      sSize, // 源区域
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE, // 目标区域
    );

    // 生成 blob
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.9),
    );
    if (!blob) {
      message.error('Failed to generate image');
      return;
    }

    // 上传到 API
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'avatar.webp');
      // 传递用户名：服务端以用户名作为文件名，同名自动覆盖历史头像
      if (username) formData.append('username', username);

      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      message.success('Avatar updated');
      onUploaded?.(data.url);
      setOpen(false);
      setImageSrc(null);
    } catch {
      message.error('Upload failed, please try again');
    } finally {
      setUploading(false);
    }
  }, [imageSrc, imgNatural, scale, offset, onUploaded, username]);

  /** 关闭弹窗时清理状态 */
  const handleClose = () => {
    if (uploading) return;
    setOpen(false);
    setImageSrc(null);
  };

  // Esc 键关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !uploading) handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, uploading]);

  /** 裁剪框遮罩区域大小（按显示裁剪框计算） */
  const maskThickness = (CONTAINER_SIZE - CROP_VIEW_SIZE) / 2;

  return (
    <>
      <Upload
        beforeUpload={beforeUpload}
        showUploadList={false}
        accept="image/png,image/jpeg,image/webp,image/gif"
      >
        {children ?? (
          <Button
            className={buttonClassName}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              background: 'rgba(157, 140, 255, 0.08)',
              border: '1px solid rgba(157, 140, 255, 0.25)',
              borderRadius: 3,
              color: 'var(--gold)',
              ...buttonStyle,
            }}
          >
            <UploadIcon size={14} />
            Upload Avatar
          </Button>
        )}
      </Upload>

      <Modal
        open={open}
        title="Crop Avatar"
        onCancel={handleClose}
        width={460}
        centered
        destroyOnHidden
        footer={[
          <Button key="cancel" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={uploading}
            onClick={cropAndUpload}
          >
            Confirm
          </Button>,
        ]}
        styles={{
          // 改为 column 垂直布局，避免容器和提示文字抢空间导致宽度被压缩
          body: { padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
        }}
      >
        {imageSrc && (
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: CONTAINER_SIZE,
              height: CONTAINER_SIZE,
              overflow: 'hidden',
              cursor: dragging.current ? 'grabbing' : 'grab',
              background: 'var(--surface)',
              borderRadius: 8,
              userSelect: 'none',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            onWheel={handleWheel}
          >
            {/* 图片：通过 transform 控制位置和缩放 */}
            <img
              src={imageSrc}
              alt="Crop preview"
              onLoad={handleImageLoad}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                maxWidth: 'none',
                maxHeight: 'none',
                pointerEvents: 'none',
              }}
            />

            {/* 裁剪框遮罩：四块半透明遮罩 + 中心透明正方形 + 边框 */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
              }}
            >
              {/* 上方遮罩 */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: maskThickness, background: 'rgba(0,0,0,0.55)' }} />
              {/* 下方遮罩 */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: maskThickness, background: 'rgba(0,0,0,0.55)' }} />
              {/* 左侧遮罩 */}
              <div style={{ position: 'absolute', top: maskThickness, bottom: maskThickness, left: 0, width: maskThickness, background: 'rgba(0,0,0,0.55)' }} />
              {/* 右侧遮罩 */}
              <div style={{ position: 'absolute', top: maskThickness, bottom: maskThickness, right: 0, width: maskThickness, background: 'rgba(0,0,0,0.55)' }} />
              {/* 裁剪框边框（正方形，输出为方形头像） */}
              <div
                style={{
                  position: 'absolute',
                  top: maskThickness,
                  left: maskThickness,
                  width: CROP_VIEW_SIZE,
                  height: CROP_VIEW_SIZE,
                  border: '2px solid var(--gold)',
                  borderRadius: 6,
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
                }}
              />
              {/* 裁剪框四角标记 —— 明确标识裁剪区域 */}
              <div style={{ position: 'absolute', top: maskThickness - 1, left: maskThickness - 1, width: 14, height: 14, borderTop: '3px solid var(--gold)', borderLeft: '3px solid var(--gold)', borderTopLeftRadius: 6 }} />
              <div style={{ position: 'absolute', top: maskThickness - 1, right: maskThickness - 1, width: 14, height: 14, borderTop: '3px solid var(--gold)', borderRight: '3px solid var(--gold)', borderTopRightRadius: 6 }} />
              <div style={{ position: 'absolute', bottom: maskThickness - 1, left: maskThickness - 1, width: 14, height: 14, borderBottom: '3px solid var(--gold)', borderLeft: '3px solid var(--gold)', borderBottomLeftRadius: 6 }} />
              <div style={{ position: 'absolute', bottom: maskThickness - 1, right: maskThickness - 1, width: 14, height: 14, borderBottom: '3px solid var(--gold)', borderRight: '3px solid var(--gold)', borderBottomRightRadius: 6 }} />
              {/* 裁剪框十字辅助线 */}
              <div style={{ position: 'absolute', top: maskThickness + CROP_VIEW_SIZE / 2 - 0.5, left: maskThickness + CROP_VIEW_SIZE * 0.35, width: CROP_VIEW_SIZE * 0.3, height: 1, background: 'rgba(255,255,255,0.25)' }} />
              <div style={{ position: 'absolute', left: maskThickness + CROP_VIEW_SIZE / 2 - 0.5, top: maskThickness + CROP_VIEW_SIZE * 0.35, height: CROP_VIEW_SIZE * 0.3, width: 1, background: 'rgba(255,255,255,0.25)' }} />
            </div>
          </div>
        )}

        {/* 操作提示 */}
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Drag to move · Scroll to zoom · 256×256 output
        </div>
      </Modal>
    </>
  );
}

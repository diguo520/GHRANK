/**
 * ImageCropUploader —— 可复用的图片上传 + 裁剪 + 预览组件
 *
 * 使用 antd Upload/Dragger + react-easy-crop 实现：
 * 1. 头像：点击六边形预览区上传/替换；未上传时显示虚线占位
 * 2. 横幅：未上传时使用 antd Dragger 拖拽区域；已上传时点击预览替换
 * 3. 裁剪子弹窗（react-easy-crop + 缩放滑块 + 确认/取消）
 * 4. 确认时 Canvas 按尺寸输出 webp → POST /api/upload/tieba-image → 回传 URL
 */
'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined, ScissorOutlined } from '@ant-design/icons';
import Cropper, { type Area } from 'react-easy-crop';
import {
  modalOverlayStyle, modalPanelStyle, modalCloseBtnStyle, modalBtnStyle,
} from '@/lib/modal-styles';
import { HEX_CLIP_PATH } from '@/lib/constants';

const { Dragger } = Upload;

export interface ImageCropUploaderProps {
  /** 裁剪宽高比：1=正方形（头像），3=3:1（横幅） */
  aspect?: number;
  /** 输出图片宽度（px） */
  outputWidth?: number;
  /** 输出图片高度（px） */
  outputHeight?: number;
  /** 预览形状：hex=六边形（头像），rect=矩形（横幅） */
  shape?: 'hex' | 'rect';
  /** 上传类型 */
  type: 'avatar' | 'banner';
  /** 贴吧 ID（用于上传命名） */
  tiebaId: string;
  /** 当前 URL（受控） */
  value?: string;
  /** 值变化回调 */
  onChange?: (url: string) => void;
}

export default function ImageCropUploader({
  aspect = 1,
  outputWidth = 256,
  outputHeight = 256,
  shape = 'hex',
  type,
  tiebaId,
  value,
  onChange,
}: ImageCropUploaderProps) {
  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [uploading, setUploading] = useState(false);
  const croppedAreaRef = useRef<Area | null>(null);

  // antd Upload beforeUpload：拦截默认上传，转为 DataURL
  const handleBeforeUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('请选择图片文件');
      return Upload.LIST_IGNORE;
    }
    if (file.size > 10 * 1024 * 1024) {
      message.error('图片不能超过 10MB');
      return Upload.LIST_IGNORE;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
    return Upload.LIST_IGNORE; // 阻止 antd 默认上传
  }, []);

  // react-easy-crop 裁剪完成回调
  const onCropComplete = useCallback((_: Area, croppedArea: Area) => {
    croppedAreaRef.current = croppedArea;
  }, []);

  // 生成裁剪后的图片 blob
  const generateCroppedImage = async (): Promise<Blob | null> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const area = croppedAreaRef.current;
    if (!area) return null;

    ctx.drawImage(
      image,
      area.x, area.y, area.width, area.height,
      0, 0, outputWidth, outputHeight,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.9);
    });
  };

  // 确认裁剪 → 上传
  const handleConfirmCrop = async () => {
    if (!croppedAreaRef.current) return;
    setUploading(true);
    try {
      const blob = await generateCroppedImage();
      if (!blob) {
        message.error('图片处理失败');
        return;
      }
      const formData = new FormData();
      formData.append('file', blob, `${tiebaId}-${type}.webp`);
      formData.append('type', type);
      formData.append('tiebaId', tiebaId);

      const res = await fetch('/api/upload/tieba-image', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      onChange?.(data.url);
      setCropOpen(false);
    } catch {
      message.error('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 取消裁剪
  const handleCancelCrop = () => {
    setCropOpen(false);
    setImageSrc('');
  };

  // 裁剪子弹窗（zIndex=1200 覆盖主弹窗）
  const cropModal = cropOpen && (
    <div
      style={{ ...modalOverlayStyle, zIndex: 1200 }}
      onClick={(e) => { if (e.target === e.currentTarget) handleCancelCrop(); }}
    >
      <div style={{ ...modalPanelStyle, width: '90%', maxWidth: 520, maxHeight: '90vh', padding: 0 }}>
        {/* 标题栏 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <span className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            Crop {type === 'avatar' ? 'Avatar' : 'Banner'}
          </span>
          <button type="button" onClick={handleCancelCrop} style={modalCloseBtnStyle}>×</button>
        </div>

        {/* 裁剪区域 */}
        <div style={{
          position: 'relative', width: '100%', height: 300,
          background: '#0d1117', overflow: 'hidden',
        }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* 缩放滑块 + 操作提示 */}
        <div style={{ padding: '12px 18px' }}>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
            Drag to move · Scroll to zoom · Output: {outputWidth}×{outputHeight}
          </div>
          <input
            type="range" min={1} max={3} step={0.1} value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--gold)' }}
          />
        </div>

        {/* 按钮 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '0 18px 16px' }}>
          <button type="button" onClick={handleCancelCrop} style={modalBtnStyle('secondary')}>Cancel</button>
          <button
            type="button" onClick={handleConfirmCrop} disabled={uploading}
            style={modalBtnStyle('primary', uploading)}
          >
            {uploading ? 'Uploading...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );

  // 头像：点击六边形区域即可上传/替换
  if (shape === 'hex') {
    return (
      <>
        <Upload showUploadList={false} beforeUpload={handleBeforeUpload} accept="image/*">
          <button
            type="button"
            aria-label={value ? 'Replace avatar' : 'Upload avatar'}
            style={{
              width: 80, height: 80, clipPath: HEX_CLIP_PATH,
              border: value ? 'none' : '1px dashed var(--border)',
              background: value ? 'var(--surface-overlay)' : 'transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => { if (!value) e.currentTarget.style.borderColor = 'rgba(157,140,255,0.6)'; }}
            onMouseLeave={(e) => { if (!value) e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                <ScissorOutlined style={{ fontSize: 18, marginBottom: 4, display: 'block' }} />
                Upload
              </span>
            )}
          </button>
        </Upload>
        {cropModal}
      </>
    );
  }

  // 横幅：整片拖拽上传区域
  return (
    <>
      {value ? (
        // 已上传：点击预览替换
        <Upload showUploadList={false} beforeUpload={handleBeforeUpload} accept="image/*">
          <button
            type="button"
            aria-label="Replace banner"
            style={{
              width: '100%', height: 120, borderRadius: 8,
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface-overlay)',
              cursor: 'pointer', padding: 0, overflow: 'hidden',
              position: 'relative', display: 'block',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(157,140,255,0.6)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <span
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--gold)', fontSize: 12, fontFamily: 'var(--font-mono)',
                background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
            >
              Click to Replace
            </span>
          </button>
        </Upload>
      ) : (
        // 未上传：Dragger 拖拽区域
        <Dragger
          beforeUpload={handleBeforeUpload}
          accept="image/*"
          showUploadList={false}
          multiple={false}
          style={{ width: '100%' }}
        >
          <div style={{ padding: '16px 12px' }}>
            <p className="ant-upload-drag-icon" style={{ marginBottom: 8 }}>
              <InboxOutlined style={{ color: 'var(--text-muted)', fontSize: 24 }} />
            </p>
            <p
              className="ant-upload-text"
              style={{ color: 'var(--text)', fontSize: 13, fontFamily: 'var(--font-display)', marginBottom: 2 }}
            >
              Click or drag file to this area to upload
            </p>
            <p
              className="ant-upload-hint"
              style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            >
              Banner · 3:1 aspect · {outputWidth}×{outputHeight}
            </p>
          </div>
        </Dragger>
      )}
      {cropModal}
    </>
  );
}

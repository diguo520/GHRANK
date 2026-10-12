/**
 * CreateTiebaModal —— 创建贴吧弹窗
 *
 * 表单字段：贴吧头像（裁剪上传）、贴吧横幅（裁剪上传）、贴吧名称、贴吧介绍
 * 提交后通过 antd notification（左下角）反馈成功/失败
 */
'use client';

import { useState, useMemo } from 'react';
import { notification } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import {
  modalOverlayStyle, modalPanelStyle, modalCloseBtnStyle, modalBtnStyle,
} from '@/lib/modal-styles';
import ImageCropUploader from './ImageCropUploader';
import {
  addCreatedTieba, canCreateMore, MAX_CREATED_TIEBAS,
  slugifyName, generateIcon,
} from '@/lib/tieba-storage';
import type { UserCreatedTieba } from '@/app/community/_data/community-data';

// 全局设置 notification 位置为左下角
notification.config({ placement: 'bottomLeft' });

interface CreateTiebaModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (tieba: UserCreatedTieba) => void;
}

export default function CreateTiebaModal({ open, onClose, onCreated }: CreateTiebaModalProps) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 实时生成 icon 和 id
  const previewIcon = useMemo(() => generateIcon(name), [name]);
  const previewId = useMemo(() => slugifyName(name), [name]);

  // 是否可达上限
  const limitReached = !canCreateMore();

  if (!open) return null;

  // 表单校验 + 提交
  function handleSubmit() {
    // 校验
    if (!name.trim() || name.trim().length < 2) {
      notification.error({
        message: 'Validation Error',
        description: '贴吧名称至少 2 个字符',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      });
      return;
    }
    if (name.trim().length > 20) {
      notification.error({
        message: 'Validation Error',
        description: '贴吧名称不能超过 20 个字符',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      });
      return;
    }
    if (!desc.trim() || desc.trim().length < 10) {
      notification.error({
        message: 'Validation Error',
        description: '贴吧介绍至少 10 个字符',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      });
      return;
    }
    if (desc.trim().length > 200) {
      notification.error({
        message: 'Validation Error',
        description: '贴吧介绍不能超过 200 个字符',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      });
      return;
    }
    if (limitReached) {
      notification.error({
        message: 'Limit Reached',
        description: `最多创建 ${MAX_CREATED_TIEBAS} 个贴吧`,
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      });
      return;
    }

    setSubmitting(true);

    // 组装贴吧数据
    const tieba: UserCreatedTieba = {
      id: previewId,
      name: name.trim(),
      desc: desc.trim(),
      icon: previewIcon,
      avatarUrl: avatarUrl || undefined,
      bannerUrl: bannerUrl || undefined,
      createdAt: Date.now(),
      members: 1,
      posts: 0,
      tags: [],
    };

    const success = addCreatedTieba(tieba);
    setSubmitting(false);

    if (success) {
      notification.success({
        message: 'Tieba Created',
        description: `"${tieba.name}" 创建成功！`,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      });
      // 重置表单
      setName('');
      setDesc('');
      setAvatarUrl('');
      setBannerUrl('');
      // 回调
      onCreated?.(tieba);
      onClose();
    } else {
      notification.error({
        message: 'Creation Failed',
        description: '创建失败，请重试',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      });
    }
  }

  // 关闭并重置
  function handleClose() {
    setName('');
    setDesc('');
    setAvatarUrl('');
    setBannerUrl('');
    onClose();
  }

  // 输入框统一样式
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    background: 'var(--surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 8,
    color: 'var(--text)',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'var(--font-body)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div
      style={modalOverlayStyle}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        style={{
          ...modalPanelStyle,
          width: '90%', maxWidth: 560, maxHeight: '90vh',
        }}
      >
        {/* 标题栏 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          <span className="font-display" style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
            Create New Tieba
          </span>
          <button type="button" onClick={handleClose} style={modalCloseBtnStyle}>×</button>
        </div>

        {/* 表单内容 */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '20px',
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          {/* 头像上传 */}
          <div>
            <label style={labelStyle}>Tieba Avatar</label>
            <ImageCropUploader
              shape="hex"
              aspect={1}
              outputWidth={256}
              outputHeight={256}
              type="avatar"
              tiebaId={previewId || 'new-tieba'}
              value={avatarUrl}
              onChange={setAvatarUrl}
            />
          </div>

          {/* 横幅上传（拖拽区域） */}
          <div>
            <label style={labelStyle}>Tieba Banner</label>
            <ImageCropUploader
              shape="rect"
              aspect={3}
              outputWidth={1200}
              outputHeight={400}
              type="banner"
              tiebaId={previewId || 'new-tieba'}
              value={bannerUrl}
              onChange={setBannerUrl}
            />
          </div>

          {/* 贴吧名称 */}
          <div>
            <label style={labelStyle}>Tieba Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter tieba name (2-20 chars)"
              maxLength={20}
              style={inputStyle}
            />
            {name && (
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                Icon: {previewIcon} · ID: {previewId}
              </div>
            )}
          </div>

          {/* 贴吧介绍 */}
          <div>
            <label style={labelStyle}>Description <span style={{ color: 'var(--danger)' }}>*</span></label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe your tieba (10-200 chars)"
              maxLength={200}
              rows={3}
              style={{
                ...inputStyle,
                resize: 'none',
                minHeight: 72,
                lineHeight: 1.5,
              }}
            />
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
              {desc.length}/200
            </div>
          </div>
        </div>

        {/* 按钮栏 */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          <button type="button" onClick={handleClose} style={modalBtnStyle('secondary')}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || limitReached}
            style={modalBtnStyle('primary', submitting || limitReached)}
          >
            {submitting ? 'Creating...' : limitReached ? 'Limit Reached' : 'Create Tieba'}
          </button>
        </div>
      </div>
    </div>
  );
}

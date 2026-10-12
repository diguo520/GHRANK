/**
 * EditableTags —— 可编辑标签组（带 motion 风格的添加/删除动画）
 *
 * 交互沿用 antd Tag 官方「动态添加标签」示例：
 * - 添加：点击 ⊕ Tag → Input → 回车/失焦确认
 * - 删除：closable + onClose，配合 CSS 动画模拟 AnimatePresence 退场
 * - 修改：双击 Tag → Input → 回车/失焦确认
 *
 * 动画实现（避免额外引入 framer-motion）：
 *  1. 入场 @keyframes gh-tag-in：从下方位移 + 缩放淡入
 *  2. 退场 @keyframes gh-tag-out：向右推出 + 压宽淡出，完成后才真正从数组移除
 *  3. 新 + 按钮 @keyframes gh-tag-plus-flip：旋转翻转进入
 *  关键：用“pending remove”状态让退出动画先跑完再 setState，保证动画完整可见。
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Tag, Input, App, Tooltip } from 'antd';
import type { InputRef } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface EditableTagsProps {
  initialTags: string[];
  maxTags?: number;
  maxTagLength?: number;
}

// —— 输入框样式（单色边框、与标签高度对齐，避免点击后垂直错位）
const tagInputStyle: React.CSSProperties = {
  width: 96,
  height: 22,
  marginInlineEnd: 8,
  verticalAlign: 'top',
};

// 标签统一样式 —— HUD 视觉：透明 + 单色细边 + 紧凑间距
const HUD_TAG_STYLE: React.CSSProperties = {
  userSelect: 'none',
  background: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--text-dim)',
  marginInlineEnd: 6,
  transition: 'border-color 180ms ease, color 180ms ease, box-shadow 180ms ease',
};

export default function EditableTags({
  initialTags,
  maxTags = 5,
  maxTagLength = 20,
}: EditableTagsProps) {
  const { message } = App.useApp();
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState('');

  // 正在执行退出动画的标签集合（动画结束后才真正从 tags 移除）
  const [leavingTags, setLeavingTags] = useState<Set<string>>(new Set());

  const inputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (inputVisible) inputRef.current?.focus();
  }, [inputVisible]);

  useEffect(() => {
    editInputRef.current?.focus();
  }, [editInputValue]);

  // 删除标签：先加入 leavingSet，动画结束后再真正剔除
  const handleClose = (removedTag: string) => {
    if (leavingTags.has(removedTag)) return; // 防止连点重复触发
    setLeavingTags((prev) => new Set(prev).add(removedTag));

    // 等待 320ms（与 gh-tag-out 时长一致），动画完整走完再 setState
    window.setTimeout(() => {
      setTags((prev) => prev.filter((t) => t !== removedTag));
      setLeavingTags((prev) => {
        const next = new Set(prev);
        next.delete(removedTag);
        return next;
      });
    }, 320);
    message.success(`Removed #${removedTag}`);
  };

  const handleInputConfirm = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setInputVisible(false);
      setInputValue('');
      return;
    }
    if (tags.includes(trimmed)) {
      message.warning(`#${trimmed} already exists`);
    } else if (tags.length >= maxTags) {
      message.warning(`Up to ${maxTags} tags`);
    } else {
      setTags([...tags, trimmed]);
      message.success(`Added #${trimmed}`);
    }
    setInputVisible(false);
    setInputValue('');
  };

  const handleEditInputConfirm = () => {
    const trimmed = editInputValue.trim();
    if (!trimmed) {
      setEditInputIndex(-1);
      setEditInputValue('');
      return;
    }
    if (trimmed === tags[editInputIndex]) {
      setEditInputIndex(-1);
      setEditInputValue('');
      return;
    }
    if (tags.includes(trimmed)) {
      message.warning(`#${trimmed} already exists`);
      setEditInputIndex(-1);
      setEditInputValue('');
      return;
    }
    const nextTags = [...tags];
    nextTags[editInputIndex] = trimmed;
    setTags(nextTags);
    setEditInputIndex(-1);
    setEditInputValue('');
    message.success('Tag updated');
  };

  return (
    <div
      className="editable-tags flex items-center gap-1.5 flex-wrap"
      // 让 flex-wrap 重排时也有过渡（tag 退场时剩余标签滑入缺口）
      style={{ rowGap: 6 }}
    >
      {tags.map((tag, index) => {
        // 编辑态：用 Input 替换原 Tag（加淡入动画，避免突兀）
        if (editInputIndex === index) {
          return (
            <Input
              ref={editInputRef}
              key={`edit-${tag}`}
              size="small"
              style={tagInputStyle}
              value={editInputValue}
              onChange={(e) => setEditInputValue(e.target.value)}
              onBlur={handleEditInputConfirm}
              onPressEnter={handleEditInputConfirm}
            />
          );
        }

        const isLeaving = leavingTags.has(tag);
        const isLongTag = tag.length > maxTagLength;

        // —— 动画包装（div → antd Tag）
        // 关键：用 key + CSS animation 双状态模拟 AnimatePresence
        const tagInner = (
          <div
            key={`wrap-${tag}`}
            className={
              'animated-tag' + (isLeaving ? ' is-leaving' : '')
            }
          >
            <Tag
              key={tag}
              closable={!isLeaving} // 退场中禁止再次点击关闭
              style={HUD_TAG_STYLE}
              onClose={() => handleClose(tag)}
            >
              <span
                onDoubleClick={(e) => {
                  setEditInputIndex(index);
                  setEditInputValue(tag);
                  e.preventDefault();
                }}
                title="Double-click to edit"
              >
                #{isLongTag ? `${tag.slice(0, maxTagLength)}...` : tag}
              </span>
            </Tag>
          </div>
        );

        return isLongTag ? (
          <Tooltip title={tag} key={`tip-${tag}`}>
            {tagInner}
          </Tooltip>
        ) : (
          tagInner
        );
      })}

      {/* 新增入口：Input ↔ + 按钮二选一闪现
          采用「+ 图标 + 实色小圆角边框」方案，去掉虚线虚框，更干净不干扰阅读 */}
      {inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          style={tagInputStyle}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : (
        tags.length < maxTags && (
          <button
            type="button"
            aria-label="Add tag"
            className="animated-tag is-plus editable-tag-add"
            onClick={() => setInputVisible(true)}
          >
            <PlusOutlined style={{ fontSize: 10 }} />
          </button>
        )
      )}
    </div>
  );
}

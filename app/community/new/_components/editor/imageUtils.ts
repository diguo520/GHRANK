/**
 * imageUtils —— 发帖编辑器图片上传公共工具（纯前端 base64 方案）
 *
 * 供三处复用：
 *  - TiptapEditor 顶栏上传按钮 / FileHandler 拖拽、粘贴
 *  - 斜杠命令菜单 "Image" 项（隐藏 file input + FileReader）
 *
 * 限制：单图 ≤ 2MB；读取为 base64 dataURL 后作为 image 节点插入
 */

/** 单图大小上限：2MB */
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;

/** 允许的图片 MIME 类型 */
export const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

/** 校验图片文件：返回错误消息，通过则返回 null */
export function validateImageFile(file: File): string | null {
  if (!IMAGE_MIME_TYPES.includes(file.type)) {
    return 'Unsupported image type (PNG / JPEG / GIF / WebP only)';
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return 'Image exceeds 2MB limit';
  }
  return null;
}

/** 读取图片文件为 base64 dataURL */
export function readImageAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** 斜杠命令图片错误事件名（NewPostForm 监听后转 Toast） */
export const IMAGE_ERROR_EVENT = 'tiptap-image-error';

/**
 * 触发隐藏 file input 选择图片（斜杠菜单 Image 命令用）
 *  - 校验失败 / 读取失败：派发 IMAGE_ERROR_EVENT 由外层 Toast
 *  - 用户取消选择：静默返回（保留编辑器中的 /image 触发文本）
 */
export function pickImageFile(onSuccess: (base64: string) => void): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';
  document.body.appendChild(input);

  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.remove();
    if (!file) return; // 用户取消
    const error = validateImageFile(file);
    if (error) {
      window.dispatchEvent(new CustomEvent(IMAGE_ERROR_EVENT, { detail: error }));
      return;
    }
    try {
      const base64 = await readImageAsBase64(file);
      onSuccess(base64);
    } catch {
      window.dispatchEvent(new CustomEvent(IMAGE_ERROR_EVENT, { detail: 'Failed to read image file' }));
    }
  });

  // 移除兜底：文件对话框被关闭但 change 未触发时清理节点
  input.addEventListener('cancel', () => input.remove());

  input.click();
}

/**
 * 头像显示工具
 *
 * 项目约定头像字段有两种形式：
 *  1. 字母徽章字符串（如 'AS' / 'A'）：未上传头像时的默认形态，
 *     渲染为圆形金色底的字母组合。
 *  2. 图片 URL 字符串（如 '/api/attachments/avatar?file=xxx.webp'）：
 *     用户上传头像后保存的真实图片地址，由 next/image 渲染。
 *
 * 所有显示头像的组件（Navbar、UserCenterSidebar、AvatarCard 等）统一通过
 * `isImageAvatar` 判断渲染分支，保证"未上传显示字母"的一致行为。
 */

/** 匹配图片 URL 的正则：/ 开头或 http(s):// 开头，并以图片扩展名结尾（可带 query/hash） */
const IMG_AVATAR_RE = /^(?:\/|https?:\/\/).*\.(?:jpg|jpeg|png|webp|gif|avif|svg)(?:\?|#|$)/i;

/**
 * 判断头像值是否为真实图片 URL。
 * 旧 URL（已删除的 public/uploads/avatars/*）视为非图片，回退到字母徽章渲染。
 */
export function isImageAvatar(src: string): boolean {
  if (!src) return false;
  // 旧 URL 对应的文件已被删除，视为字母徽章以避免 next/image 报错
  if (src.startsWith('/uploads/avatars/')) return false;
  return IMG_AVATAR_RE.test(src);
}

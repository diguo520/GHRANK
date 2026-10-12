/**
 * 附件 URL 加解密工具（服务端专用）
 *
 * 基于 AES-256-GCM 对附件文件名进行对称加密，
 * 生成 base64url token 放入 URL，替代明文 file= 参数。
 * GCM 认证标签确保 token 不可篡改、不可伪造。
 */
import crypto from 'crypto';

// 32 字节密钥，从环境变量读取（hex 编码）
const SECRET = Buffer.from(
  process.env.ASSET_TOKEN_SECRET ??
    '0000000000000000000000000000000000000000000000000000000000000000',
  'hex',
);

/** 加密附件文件名：返回 base64url 字符串，可直接放入 URL */
export function encryptAsset(file: string, ttlSec?: number): string {
  const iv = crypto.randomBytes(12); // GCM 推荐 12 字节 IV
  const cipher = crypto.createCipheriv('aes-256-gcm', SECRET, iv);

  // 明文 payload：文件名 + 可选过期时间戳
  const payload = JSON.stringify(
    ttlSec ? { file, exp: Date.now() + ttlSec * 1000 } : { file },
  );

  const enc = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag(); // GCM 认证标签，防篡改

  // 拼接 iv(12) + tag(16) + 密文，整体 base64url
  return Buffer.concat([iv, tag, enc]).toString('base64url');
}

/** 解密 token：返回原始文件名，校验失败或过期抛错 */
export function decryptAsset(token: string): string {
  const buf = Buffer.from(token, 'base64url');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', SECRET, iv);
  decipher.setAuthTag(tag);

  const json = Buffer.concat([
    decipher.update(enc),
    decipher.final(),
  ]).toString('utf8');

  const { file, exp } = JSON.parse(json) as { file: string; exp?: number };
  if (exp && Date.now() > exp) {
    throw new Error('token expired');
  }
  return file;
}

/**
 * 将附件代理 URL 从 ?file=明文 转换为 ?token=密文
 * 仅处理 /api/attachments/ 开头的站内附件 URL，外部 URL 原样返回。
 */
export function encryptAttachmentUrl(url: string): string {
  if (!url.startsWith('/api/attachments/')) return url;

  const match = url.match(/[?&]file=([^&]+)/);
  if (!match) return url;

  const fileName = decodeURIComponent(match[1]);
  // 从 URL 路径推断附件路由（video / image / prompt-image）
  const route = url.includes('/prompt-image') ? 'prompt-image'
    : url.includes('/video') ? 'video'
    : 'image';

  return `/api/attachments/${route}?token=${encryptAsset(fileName)}`;
}

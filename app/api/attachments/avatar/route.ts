import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { decryptAsset } from '@/lib/asset-token';

/**
 * 用户头像静态文件代理路由
 *
 * 从项目根目录 attachments/avatars/ 读取头像并返回。
 * 与 /api/attachments/image（posts）/prompt-image（prompts）保持一致的代理模式：
 *   - token=（AES-GCM 加密，推荐）：解密后得到文件名
 *   - file=（明文，向后兼容）：直接读取文件名
 *
 * 文件名为 {username}.webp，由上传 API 写入。
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // 优先读取加密 token，兼容旧 file 参数
  const token = searchParams.get('token');
  let fileName: string;
  try {
    fileName = token ? decryptAsset(token) : (searchParams.get('file') ?? '');
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
  }

  if (!fileName) {
    return NextResponse.json({ error: 'Missing file param' }, { status: 400 });
  }

  // 只允许文件名，防止路径穿越
  const safeName = path.basename(fileName);
  const filePath = path.join(process.cwd(), 'attachments', 'avatars', safeName);

  try {
    const data = await readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();
    const contentType =
      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
      ext === '.png' ? 'image/png' :
      ext === '.gif' ? 'image/gif' :
      ext === '.webp' ? 'image/webp' :
      ext === '.svg' ? 'image/svg+xml' :
      'application/octet-stream';

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': data.length.toString(),
        // no-cache：浏览器每次都向服务器验证，文件被覆盖或删除后立即生效
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}

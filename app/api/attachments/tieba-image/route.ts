import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { decryptAsset } from '@/lib/asset-token';

/**
 * 贴吧图片静态文件代理路由
 *
 * 从 attachments/tieba-images/ 读取图片并返回。
 * 与 /api/attachments/avatar 保持一致的代理模式：
 *   - token=（AES-GCM 加密）：解密后得到文件名
 *   - file=（明文）：直接读取文件名
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

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

  const safeName = path.basename(fileName);
  const filePath = path.join(process.cwd(), 'attachments', 'tieba-images', safeName);

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
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}

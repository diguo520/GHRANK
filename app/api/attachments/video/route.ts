import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { decryptAsset } from '@/lib/asset-token';

/**
 * 视频静态文件代理路由
 * 从项目根目录 attachments/posts/videos/ 读取视频并流式返回。
 * 支持 token=（AES-GCM 加密）和 file=（明文，向后兼容）两种参数。
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

  // 只允许文件名，不允许路径穿越
  const safeName = path.basename(fileName);
  const filePath = path.join(process.cwd(), 'attachments', 'posts', 'videos', safeName);

  try {
    const data = await readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();
    const contentType =
      ext === '.mp4' ? 'video/mp4' :
      ext === '.webm' ? 'video/webm' :
      ext === '.ogg' ? 'video/ogg' :
      'application/octet-stream';

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': data.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * 贴吧图片上传 API
 *
 * 接收裁剪后的图片文件，保存到 attachments/tieba-images/ 目录。
 * 文件名以 {tiebaId}-{type}.webp 命名（如 ai-agents-avatar.webp）。
 *
 * 表单字段：file（图片）、type（avatar|banner）、tiebaId（贴吧 ID）
 * 返回可直接使用的图片 URL（走 /api/attachments/tieba-image 代理路由）。
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file');
  const type = (formData.get('type') as string | null)?.trim();
  const tiebaId = (formData.get('tiebaId') as string | null)?.trim();

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
  }

  // 白名单清洗 tiebaId 和 type，防止路径穿越
  const safeId = (tiebaId && /^[a-zA-Z0-9_-]+$/.test(tiebaId))
    ? tiebaId.toLowerCase()
    : 'default';
  const safeType = type === 'banner' ? 'banner' : 'avatar';
  const filename = `${safeId}-${safeType}.webp`;
  const uploadDir = path.join(process.cwd(), 'attachments', 'tieba-images');
  const filepath = path.join(uploadDir, filename);

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return NextResponse.json({
    url: `/api/attachments/tieba-image?file=${filename}`,
  });
}

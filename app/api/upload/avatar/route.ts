import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * 头像上传 API
 *
 * 接收裁剪后的图片文件，保存到 attachments/avatars/ 目录。
 * 文件名以用户名作为唯一标识（如 alexshader.webp），多次上传会按用户名覆盖，
 * 避免累积历史头像文件。
 *
 * 通过表单字段 username 指定用户名；未提供时回退为 'default'。
 * 返回可直接使用的图片 URL（走 /api/attachments/avatar 代理路由）。
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file');
  const username = (formData.get('username') as string | null)?.trim();

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  // 限制文件大小 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
  }

  // 文件名以用户名为唯一标识，统一 webp 格式；多次上传自动覆盖同名文件
  // 用户名仅作为文件名前缀，做白名单清洗避免路径穿越
  const safeName = (username && /^[a-zA-Z0-9_-]+$/.test(username))
    ? username.toLowerCase()
    : 'default';
  const filename = `${safeName}.webp`;
  const uploadDir = path.join(process.cwd(), 'attachments', 'avatars');
  const filepath = path.join(uploadDir, filename);

  // 确保目录存在
  await mkdir(uploadDir, { recursive: true });

  // 写入文件（同名自动覆盖）
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return NextResponse.json({
    url: `/api/attachments/avatar?file=${filename}`,
  });
}

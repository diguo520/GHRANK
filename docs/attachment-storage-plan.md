# Next.js 用户附件存储方案

> 版本：v1.0 | 适用项目：ghrank-nextjs | 对比范围：本地存储 vs Cloudflare R2

---

## 1. 需求概览

| 附件类型 | 典型场景 | 文件大小 | 读/写频率 | 备注 |
|---|---|---|---|---|
| 用户头像 | 个人资料页、帖子列表、评论列表 | 10 KB ~ 500 KB | 写低读高 | 支持裁剪/缩略 |
| 帖子/评论图片 | 社区发帖、Prompt 评论图片 | 50 KB ~ 5 MB | 写中读高 | 多图上传 |
| 视频 | 帖子内嵌、Prompt 教程 | 1 MB ~ 100 MB | 写低读中 | 转码/多码率 |
| 文件附件 | 源码附件、PDF 文档 | 1 KB ~ 50 MB | 写低读低 | 按需下载 |

---

## 2. 目录与命名规范（两套方案通用）

### 2.1 目录结构

```
# 本地存储路径（开发/测试环境）
public/uploads/
├── avatars/          # 用户头像（所有用户共用）
├── posts/            # 社区帖子图片/视频
│   ├── images/
│   └── videos/
├── prompts/          # Prompt 详情页评论图片/视频
│   ├── images/
│   └── videos/
├── attachments/      # 通用文件附件
└── temp/             # 上传中转/待处理文件

# Cloudflare R2 存储桶（生产环境）
ghrank-attachments/
├── avatars/
├── posts/images/
├── posts/videos/
├── prompts/images/
├── prompts/videos/
├── attachments/
└── temp/
```

### 2.2 文件命名约定

```
{userId}_{timestamp}_{randomSuffix}.{ext}

# 示例
u_6a5f71339_1785483600000_a3b92f65.webp   # 用户头像
u_6a5f71339_1785483600000_b2c84e12.jpg    # 帖子图片
u_6a5f71339_1785483600000_d4e56f78.mp4    # 视频
```

| 字段 | 说明 |
|---|---|
| `u_{userId}` | 用户标识（前缀 `u_`，缩短 UUID） |
| `{timestamp}` | 上传时间戳（ms），保证时序排序 |
| `{randomSuffix}` | 8 位随机十六进制，防止并发碰撞 |
| `{ext}` | 原始扩展名或目标格式（头像强制 `.webp`） |

### 2.3 缩略图/多尺寸策略

```
# 头像：原图 + 缩略图
avatars/u_6a5f71339_1785483600000_a3b92f65.webp        # 256x256 原图
avatars/u_6a5f71339_1785483600000_a3b92f65_48.webp    # 48x48 缩略图
avatars/u_6a5f71339_1785483600000_a3b92f65_128.webp   # 128x128 中图

# 帖子图片：原图 + 预览图
posts/images/u_6a5f71339_1785483600000_b2c84e12.jpg        # 原图
posts/images/u_6a5f71339_1785483600000_b2c84e12_thumb.webp  # 400x300 预览
```

---

## 3. 方案 A：本地存储

### 3.1 架构

```
[Client] --上传--> [Next.js API Route] --> [public/uploads/] --读取--> [CDN/Nginx]
```

### 3.2 实现要点

| 项 | 方案 |
|---|---|
| 上传接口 | `app/api/upload/route.ts`（App Router API Route） |
| 文件校验 | 白名单扩展名、Magic Number 检测、大小限制 |
| 头像处理 | Sharp 裁剪为 256x256，输出 WebP，质量 85% |
| 图片处理 | 原图保留，异步生成 `thumb.webp` |
| 视频处理 | 写入 `temp/`，后台 FFmpeg 转码为 H.264 + HLS |
| 安全防护 | 目录 traversal 过滤、文件名 sanitize |
| 持久化 | 数据库记录 `file_path`、`file_size`、`mime_type`、`created_at` |

### 3.3 优点

- 零外部依赖，开发/测试环境开箱即用
- 上传延迟极低（本机磁盘）
- 不依赖网络，内网部署场景友好

### 3.4 缺点

| 问题 | 影响 |
|---|---|
| 无水平扩展 | 多实例部署时文件不共享，需 NFS/共享存储 |
| 无 CDN 分发 | 大流量场景下服务器带宽成为瓶颈 |
| 磁盘容量受限 | 需定期归档/清理，运维成本高 |
| 无内置冗余 | 磁盘损坏 = 数据丢失，需自行备份 |
| SSR 场景 | `public/` 下文件自动暴露，需注意权限隔离 |

---

## 4. 方案 B：Cloudflare R2

### 4.1 架构

```
[Client] --直传预签URL--> [Cloudflare R2]
                              |
                              v
[Next.js API] <--元数据--> [PostgreSQL/D1]
                              |
                              v
[Client] <--公开/私有URL--> [Cloudflare CDN]
```

### 4.2 上传流程（Presigned URL 直传）

```
1. Client 请求 Next.js API："我要上传头像，文件大小 234KB，类型 image/jpeg"
2. API 校验权限 -> 生成 Presigned PUT URL（有效期 5 分钟）
3. Client 直传文件到 R2（不经过 Next.js 服务器）
4. R2 返回 200 -> Client 通知 API "上传完成"
5. API 校验 R2 文件存在 -> 写入数据库记录 -> 返回永久访问 URL
```

### 4.3 实现要点

| 项 | 方案 |
|---|---|
| SDK | `@aws-sdk/client-s3`（R2 兼容 S3 API） |
| 上传模式 | Presigned URL 直传（推荐）或 服务端代理上传 |
| 头像处理 | 服务端下载 -> Sharp 处理 -> 回写 R2 -> 删除临时文件 |
| 视频处理 | R2 触发 Cloudflare Worker -> 调用 Stream API 转码 |
| 公开访问 | 绑定自定义域名 `cdn.ghrank.io`，开启 CDN 缓存 |
| 私有访问 | 附件类文件使用 Presigned GET URL（有效期 1 小时） |
| 成本 | 无出口流量费（R2 优势），仅按存储量计费 |

### 4.4 优点

| 优势 | 说明 |
|---|---|
| 零出口费 | Cloudflare R2 读出流量免费，成本远低于 S3 |
| 全球 CDN | 自动分发到 300+ 边缘节点，访问延迟低 |
| 无限扩展 | 存储量无上限，无需关心磁盘扩容 |
| 高可用 | 内置多副本冗余，SLA 99.99% |
| 与 Workers 集成 | 可触发事件（上传后自动转码、压缩、打水印） |
| 多实例友好 | 任意 Next.js 实例访问同一存储桶 |

### 4.5 缺点

| 问题 | 缓解方案 |
|---|---|
| 需 Cloudflare 账号 | 免费额度充足，小型项目零成本起步 |
| 上传需走公网 | 国内用户可选 R2 亚太节点，或搭配预上传压缩 |
| 开发环境需 Mock | 本地开发可用 MinIO 模拟 S3/R2 接口 |
| 额外学习成本 | S3 API 生态成熟，文档丰富 |

---

## 5. 选型建议

| 场景 | 推荐方案 |
|---|---|
| **本地开发 / 个人项目** | 本地存储（快速验证，无需配置） |
| **内部工具 / 低流量 SaaS** | 本地存储 + 定期备份 |
| **生产环境 / 多实例部署** | **Cloudflare R2（强烈推荐）** |
| **高流量社区 / 图片密集** | R2 + CDN + 多尺寸缩略图 |
| **视频内容平台** | R2 + Cloudflare Stream |
| **合规要求（数据不出境）** | 本地存储或国内 OSS |

### 推荐的生产架构

```
开发环境：本地存储（public/uploads/）
    |
    v
生产环境：Cloudflare R2 + 自定义域名 CDN
    |
    +-- 头像：上传时 Sharp 裁剪为 256/128/48px WebP
    +-- 图片：原图存 R2，缩略图异步 Worker 生成
    +-- 视频：R2 触发 Stream 转码，返回播放 URL
    +-- 附件：私有桶 + Presigned URL 限时访问
```

---

## 6. 数据库表设计

```sql
-- 附件元数据表
CREATE TABLE attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  file_name     TEXT NOT NULL,           -- 原始文件名
  storage_key   TEXT NOT NULL UNIQUE,    -- 存储路径（相对路径或 R2 key）
  storage_type  TEXT NOT NULL DEFAULT 'r2',  -- 'local' | 'r2'
  file_size     BIGINT NOT NULL,
  mime_type     TEXT NOT NULL,
  width         INT,                     -- 图片/视频宽度
  height        INT,                     -- 图片/视频高度
  duration      INT,                     -- 视频时长（秒）
  category      TEXT NOT NULL,           -- 'avatar' | 'post_image' | 'post_video' | 'attachment'
  status        TEXT NOT NULL DEFAULT 'active', -- 'active' | 'processing' | 'deleted'
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 缩略图关联表
CREATE TABLE attachment_variants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attachment_id UUID NOT NULL REFERENCES attachments(id) ON DELETE CASCADE,
  variant       TEXT NOT NULL,           -- 'thumb' | 'small' | 'medium'
  storage_key   TEXT NOT NULL,
  width         INT,
  height        INT,
  file_size     BIGINT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. 环境变量配置

```bash
# 本地存储
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=52428800          # 50MB
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/gif
ALLOWED_VIDEO_TYPES=video/mp4,video/webm

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=ghrank-attachments
R2_PUBLIC_DOMAIN=https://cdn.ghrank.io
R2_REGION=auto
```

---

## 8. 安全清单

- [ ] 文件扩展名白名单校验
- [ ] Magic Number 头字节校验（防止改扩展名绕过）
- [ ] 单文件大小限制（头像 2MB，图片 10MB，视频 100MB）
- [ ] 用户级上传频率限制（防滥用）
- [ ] 文件名 sanitize（去除路径遍历字符）
- [ ] 图片/视频内容安全扫描（可选集成 Cloudflare Images AI 审核）
- [ ] 私有文件使用 Presigned URL，禁止直接暴露存储桶
- [ ] 定期清理 `temp/` 目录和失效上传碎片

---

## 9. 下一步建议

1. **确认选型**：本地 vs R2，或混合（头像 R2，附件本地）
2. **确认数据库**：已有 PostgreSQL/D1 还是需新建表
3. **确认域名**：是否已有 `cdn.ghrank.io` 或类似子域名
4. **确认视频**：是否需要 Cloudflare Stream 转码，还是仅存储原始文件

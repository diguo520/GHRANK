# attachments/ 附件目录

存放用户上传的附件文件（本地存储方案，生产环境建议迁移至 Cloudflare R2）。

## 目录结构（与 docs/attachment-storage-plan.md 保持一致）

- `avatars/`：用户头像（256x256 WebP 原图 + 128/48 缩略图）
- `posts/images/`、`posts/videos/`：社区帖子图片/视频
- `prompts/images/`、`prompts/videos/`：Prompt 详情页评论图片/视频
- `attachments/`：通用文件附件（源码、PDF 等）
- `temp/`：上传中转/待处理文件，需定期清理

## 使用约定

- 文件命名：`u_{userId}_{timestamp}_{randomSuffix}.{ext}`，详见存储方案文档
- 上传文件内容不提交 git（已在根目录 `.gitignore` 中忽略），仅保留目录结构（`.gitkeep`）
- 上传前需做扩展名白名单、Magic Number、大小校验，详见方案文档安全清单

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // TypeScript 7.0 使用原生编译器，需启用 CLI 模式进行类型检查
  experimental: {
    useTypeScriptCli: true,
  },
  images: {
    /**
     * ⚠️ 本地附件 API 路由：
     *   项目不设 public/ 目录，图片/视频存放在项目根的 attachments/ 下，
     *   通过 /api/attachments/{prompt-image,image,video}?file=XXX 代理读取。
     *
     *   next/image <Image> 组件对本地路径带 query string 有强制校验：
     *   - 必须显式声明在 images.localPatterns 中
     *   - pathname / search 必须使用 **glob 语法**（* = 单层任意字符，** = 多层任意），
     *     不要写正则（不要用 .* / .+ 这类）
     *   - 省略 search 字段 = 默认允许任意 query string（也是我们的场景，file 参数是动态的）
     */
    localPatterns: [
      // Prompt 详情图 / 作者头像 / 缩略图：/api/attachments/prompt-image?file=XXX.jpg
      { pathname: '/api/attachments/prompt-image' },
      // 社区帖子/评论附件图：/api/attachments/image?file=XXX.png
      { pathname: '/api/attachments/image' },
      // 社区帖子视频（视频封面缩略图可能也会用到 next/image）：/api/attachments/video?file=XXX.mp4
      { pathname: '/api/attachments/video' },
      // 用户上传的头像：/api/attachments/avatar?file=XXX.webp
      { pathname: '/api/attachments/avatar' },
      // Profile / Notifications / Following 页面的演示占位图：/images/demo/*.{jpg,png,...}
      { pathname: '/images/demo/**' },
      // 兜底：public 目录任意位置的图片
      { pathname: '/images/**' },
    ],
    // 允许的远程头像/占位图域名
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'ico.la4.cn' },
      { protocol: 'https', hostname: 'trae-api-cn.mchost.guru' },
    ],
  },
};

export default nextConfig;

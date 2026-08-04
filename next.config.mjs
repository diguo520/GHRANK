/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // TypeScript 7.0 使用原生编译器，需启用 CLI 模式进行类型检查
  experimental: {
    useTypeScriptCli: true,
  },
  // 允许 GitHub 头像域名
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'ico.la4.cn' },
    ],
  },
};

export default nextConfig;

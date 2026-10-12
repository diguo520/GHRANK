/**
 * 根布局 —— Next.js App Router
 *
 * v2.0 整改：
 * - 移除 EVE Online HUD 字体（Oxanium/Rajdhani/IBM_Plex_Mono）
 * - 改用 Inter 无衬线字体（LobeHub 风格）
 * - 接入 antd Registry（SSR 样式注入，避免 FOUC）
 * - 接入 ConfigProvider（LobeHub 暗色主题 Token）
 * - 接入 App（message/modal/notification SSR 安全）
 */
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App, ConfigProvider } from 'antd';
import { darkTheme } from './theme';
import './globals.css';
import ChromeLayout from '@/components/chrome/ChromeLayout';
import { MockFeedProvider } from './_components/MockFeedContext';
import ShareCardModalRoot from '@/components/shared/ShareCardModal';
import NotifyBridge from '@/components/shared/NotifyBridge';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GHRANK // Open Source Intelligence',
  description:
    'Modern dashboard for tracking trending GitHub open source projects',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AntdRegistry>
          <ConfigProvider theme={darkTheme}>
            <App>
              {/* 将 App.useApp 拿到的 message/modal/notification 注入全局单例，
                  消除静态方法调用导致的主题上下文警告 */}
              <NotifyBridge />
              {/* 通知 & 站内信模拟推送 runtime（每 30s 随机推一条，可通过右上角「模拟新消息」按钮立即触发） */}
              <MockFeedProvider autoPushEveryMs={30_000}>
                <ShareCardModalRoot>
                  <ChromeLayout>{children}</ChromeLayout>
                </ShareCardModalRoot>
              </MockFeedProvider>
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

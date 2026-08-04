/**
 * 根布局 —— Next.js App Router
 * 加载全局样式 + 字体 + ChromeLayout
 */
import type { Metadata } from 'next';
import { Oxanium, Rajdhani, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import ChromeLayout from '@/components/chrome/ChromeLayout';

const oxanium = Oxanium({
  subsets: ['latin'],
  variable: '--font-oxanium',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  variable: '--font-rajdhani',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'GHRANK // Open Source Intelligence',
  description: 'EVE Online-inspired sci-fi HUD dashboard for tracking trending GitHub open source projects',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${oxanium.variable} ${rajdhani.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ChromeLayout>{children}</ChromeLayout>
      </body>
    </html>
  );
}

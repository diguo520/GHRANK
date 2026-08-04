/**
 * Profile 页面 —— 用户个人主页
 * 布局：全宽 Header（Banner+头像+统计） + 双栏（Tabs 主内容 + 侧边栏）
 * Chrome 层（Ticker/Navbar/Footer 等）由 ChromeLayout 统一处理，此处仅含 main 区域
 */
import ProfileHeader from './_components/ProfileHeader';
import ProfileTabs from './_components/ProfileTabs';
import ProfileSidebar from './_components/ProfileSidebar';

export const metadata = { title: 'Profile // GHRANK' };

export default function ProfilePage() {
  return (
    <main className="main-content">
      <div className="py-6 pb-16">
        {/* 全宽头部：Banner + 头像 + 用户信息 + 统计 */}
        <ProfileHeader />

        {/* 双栏布局：主内容 + 侧边栏（lg 以下隐藏侧边栏） */}
        <div className="grid gap-5 lg:gap-6 mt-5 items-start grid-cols-1 lg:grid-cols-[1fr_300px]">
          <ProfileTabs />
          <div className="hidden lg:block">
            <ProfileSidebar />
          </div>
        </div>
      </div>
    </main>
  );
}

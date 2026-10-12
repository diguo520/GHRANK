/**
 * Profile 页面 —— 极简社交媒体个人主页
 *
 * 设计理念：
 * - 单栏居中布局，max-width 640px
 * - 无 Banner、无侧边栏
 * - 头部信息 + 标签页内容
 */
import ProfileHeader from './_components/ProfileHeader';
import ProfileTabs from './_components/ProfileTabs';

export const metadata = { title: 'Profile // GHRANK' };

export default function ProfilePage() {
  return (
    <main className="main-content">
      <div className="mx-auto" style={{ maxWidth: '640px' }}>
        <ProfileHeader />
        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <ProfileTabs />
        </div>
      </div>
    </main>
  );
}

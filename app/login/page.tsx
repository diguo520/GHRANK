/**
 * 登录页 —— Next.js App Router
 * 保持 EVE Online HUD 主题风格
 */
import Link from 'next/link';
import LoginForm from './_components/LoginForm';

export const metadata = { title: 'Access Terminal // GHRANK' };

export default function LoginPage() {
  return (
    <main
      className="main-content flex items-center justify-center"
      style={{ maxWidth: '100%', padding: 'var(--sp-8) var(--sp-5)', minHeight: '70vh' }}
    >
      <div className="w-full">
        <LoginForm />
        {/* 注册引导 */}
        <div className="text-center mt-5">
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            No identity?{' '}
          </span>
          <Link
            href="/register"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '1px',
              color: 'var(--gold)',
              textTransform: 'uppercase',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            Create one
          </Link>
        </div>

        <div className="text-center mt-4">
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '1px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            &larr; RETURN TO LEADERBOARD
          </Link>
        </div>
      </div>
    </main>
  );
}

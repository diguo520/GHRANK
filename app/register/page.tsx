/**
 * 注册页 —— 沉浸式单步流程
 * 参考 cuiter.hailovers.com/auth/register
 */
import RegisterForm from './_components/RegisterForm';

export const metadata = { title: 'Create Account // GHRANK' };

export default function RegisterPage() {
  return (
    <main
      className="main-content flex items-center justify-center"
      style={{ maxWidth: '100%', minHeight: '80vh' }}
    >
      <RegisterForm />
    </main>
  );
}

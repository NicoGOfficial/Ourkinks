import Link from 'next/link';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import style from './signup-menu.module.less';

export function SignupMenu() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <ul className={`${style['nav-icons']} custom`}>
      <li
        key="login"
        className={
          router.pathname === '/auth/login' ? 'active' : ''
        }
      >
        <Link href="/auth/login">
          <a>{t('common:login')}</a>
        </Link>
      </li>
      <li
        key="signup"
        className={
          router.pathname === '/auth/register' ? 'active' : ''
        }
      >
        <Link href="/auth/register">
          <a>{t('common:signup')}</a>
        </Link>
      </li>
    </ul>
  );
}

export default SignupMenu;

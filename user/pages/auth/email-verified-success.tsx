import SeoMetaHead from '@components/common/seo-meta-head';
import {
  Layout
} from 'antd';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import style from './email-verified-success.module.less';

function EmailVerifiedSuccess() {
  const { t } = useTranslation();

  return (
    <Layout>
      <SeoMetaHead item={{
        title: t('common:titleEmailSuccess')
      }}
      />
      <div className={style['email-verify-succsess']}>
        <p>
          {t('common:yourEmailVerified')}
          <Link href="/auth/login">
            <a>
              {' '}
              {t('common:clickLogin')}
            </a>
          </Link>
        </p>
      </div>
    </Layout>
  );
}

export default EmailVerifiedSuccess;

import PageTitle from '@components/common/page-title';
import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';

const Notification = dynamic(() => import('@components/notification/Notification'), {
  ssr: false
});

function NotificationPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle title={t('common:titleNotification')} />
      <Notification style={{ width: 550, margin: '100px auto' }} />
    </>
  );
}

NotificationPage.authenticate = true;

NotificationPage.noredirect = false;

export default NotificationPage;

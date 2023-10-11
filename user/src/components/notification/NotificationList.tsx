import { INotification } from '@interfaces/notification';
import { fetchNotificaion } from '@redux/notification/actions';
import { notificationService } from '@services/notification.service';
import { Button } from 'antd';
import List, { ListProps } from 'antd/lib/list';
import useTranslation from 'next-translate/useTranslation';
import { CSSProperties, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import styleList from './NotificationList.module.less';
import NotificationListItem from './NotificationListItem';

interface NotificationListProps extends ListProps<INotification> {
  notificationIds: string[];
  style: CSSProperties
}

function NotificationList({ style, ...props }: NotificationListProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(fetchNotificaion());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const readAll = async () => {
    await notificationService.readAll();
    fetchData();
  };

  return (
    <>
      <Button className={styleList['btn-dismiss-all']} onClick={readAll}>{t('common:markAsRead')}</Button>
      <List {...props} style={style} header={t('common:allNotifications')}>
        <NotificationListItem />
      </List>
    </>
  );
}

export default NotificationList;

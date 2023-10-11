import { INotification } from '@interfaces/notification';
import { capitalizeFirstLetter } from '@lib/string';
import { fetchNotificaion, setReadItem } from '@redux/notification/actions';
import { notificationService } from '@services/notification.service';
import {
  Avatar, Button,
  Col, Menu, message, Row
} from 'antd';
import moment from 'moment';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { SocketContext } from 'src/socket';

import style from './NotificationHeaderMenu.module.less';

const SEND_NOTIFICATION = 'send_notification';

function NotificationHeaderMenu() {
  const { pathname } = useRouter();
  const { t } = useTranslation();

  const { getSocket, socketStatus, connected } = useContext(SocketContext);

  const notifications = useSelector(
    createSelector(
      (state: any) => state.notification.success,
      (state: any) => state.notification.error,
      (state: any) => state.notification.dataSource,
      (success, error, data) => {
        if (success && !error) return data;
        return [];
      }
    )
  ) as INotification[];

  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(fetchNotificaion());
  };

  const onReceiveNotification = (data) => {
    fetchData();
    message.success(data?.title || data?.message || t('common:msgSuccessNotification'));
  };

  const handleSocket = () => {
    const socket = getSocket();
    socket?.on(SEND_NOTIFICATION, onReceiveNotification);
  };

  const handleOffSocket = () => {
    const socket = getSocket();
    socket?.off(SEND_NOTIFICATION, onReceiveNotification);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!connected()) return handleOffSocket();
    handleSocket();
    return handleOffSocket;
  }, [socketStatus]);

  const redirect = (notification) => {
    switch (notification.type) {
      case 'video':
        return Router.push(`/video/${notification.refId}`);
      case 'public-stream':
        return Router.push({
          pathname: '/stream/[username]',
          query: {
            username: notification?.title ? notification.title.split(' ')[0] : notification.refId
          }
        }, notification?.title ? `/stream/${notification.title.split(' ')[0]}` : `/stream/${notification.refId}`);
      default: return null;
    }
  };

  const onClickItem = (notification) => {
    if (!notification.read) {
      // goi api PUT read
      notificationService.read(notification._id);
      dispatch(setReadItem(notification._id));
    }
    redirect(notification);
  };

  const markAsRead = async () => {
    await notificationService.readAll();
    fetchData();
  };

  const getMenuChildren = () => {
    if (!notifications.length) {
      return [{
        key: 'no-notification',
        label: t('common:thereAreNoNotifications')
      }];
    }
    return notifications.map((notification) => ({
      key: notification._id,
      label: (
        <Row
          gutter={24}
          className={`notification-item ${!notification.read ? 'notification-unread' : 'notification-read'}`}
          onClick={() => onClickItem(notification)}
        >
          <Col md={3}>
            <Avatar src={notification.thumbnail || '/no-image.jpg'} />
          </Col>
          <Col md={21}>
            <div className="notification-item-list">
              <div className="message">{capitalizeFirstLetter(notification.title)}</div>
              <span className="time"><small>{moment(notification.updatedAt).fromNow()}</small></span>
            </div>
          </Col>
          <span className={notification.read === false ? 'notification-docw' : ''}>{ }</span>
        </Row>
      )
    }));
  };

  return (
    <Menu
      title={t('common:titleNotification')}
      className={style['notification-menu']}
      items={[{
        type: 'group',
        label: (
          <span>
            {t('common:titleNotification')}
            <Button className={style['btn-dismiss-read-all']} onClick={markAsRead}>
              {t('common:markAsRead')}
            </Button>
            <Link href={pathname === '/notification' ? '#' : '/notification'}>
              <a style={{ marginTop: '6px' }}>See all</a>
            </Link>
          </span>
        ),
        children: getMenuChildren()
      }]}
    />
  );
}

export default NotificationHeaderMenu;

import {
  BellOutlined,
  FireOutlined
} from '@ant-design/icons';
import { ModelEarningIcon } from '@components/icons';
import { openTopupModal } from '@redux/wallet/actions';
import {
  Badge, Dropdown, Tooltip
} from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SocketContext } from 'src/socket';

// import CartBadge from './cart-badge';
import style from './logged-in-menu.module.less';
import UnreadMessageBadge from './unread-message-badge';

const NotificationHeaderMenu = dynamic(() => import('@components/notification/NotificationHeaderMenu'), { ssr: false });
const PrivateRequestDropdown = dynamic(() => import('./private-request-dropdown'), { ssr: false });
const SearchDrawer = dynamic(() => import('./search-drawer'), { ssr: false });

const mapState = (state: any) => ({
  currentUser: state.user.current,
  notificationCount: state.notification.total
});

const mapDispatch = {
  openTopupModalHandler: openTopupModal
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

const EVENT = {
  BALANCE_UPDATE: 'balance_update'
};

function LoggedInMenu({
  currentUser,
  notificationCount = 0,
  openTopupModalHandler = () => { }
}: PropsFromRedux) {
  const router = useRouter();
  const { getSocket, socketStatus, connected } = useContext(SocketContext);
  const [balance, setBalance] = useState(currentUser.balance || 0);

  const updateBalance = (data) => setBalance(data.balance);

  const handleSocket = () => {
    const socket = getSocket();
    socket?.on(EVENT.BALANCE_UPDATE, updateBalance);
  };

  const handleOffSocket = () => {
    const socket = getSocket();
    socket?.off(EVENT.BALANCE_UPDATE, updateBalance);
  };

  useEffect(() => {
    if (currentUser && currentUser.balance !== balance) {
      setBalance(currentUser.balance);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!connected()) return handleOffSocket();

    handleSocket();

    return handleOffSocket;
  }, [socketStatus]);

  if (currentUser.isPerformer) {
    return (
      <div className={style['mid-conner']} style={{ marginRight: '30px' }}>
        <ul
          className={style['nav-icons']}
        >
          <li key="notification">
            <Dropdown
              overlay={<NotificationHeaderMenu />}
              forceRender
            >
              <a href="#" aria-label="notification">
                <BellOutlined />
                <Badge
                  className="cart-total"
                  count={notificationCount}
                />
              </a>
            </Dropdown>
          </li>
          <li
            key="messenger"
            className={
              router.pathname === '/messages' ? 'active' : ''
            }
          >
            <Link href="/messages">
              <a>
                <UnreadMessageBadge />
              </a>
            </Link>
          </li>
          <li>
            <PrivateRequestDropdown />
          </li>
          <li className="custom">
            <Link
              href="/model/earning"
              as="/model/earning"
            >
              <a>
                <Tooltip title={(balance || 0).toFixed(2)}>
                  <ModelEarningIcon width={23} height={23} />
                  {' '}
                  <span className="hide">
                    {(balance || 0).toFixed(2)}
                  </span>
                </Tooltip>
              </a>
            </Link>
          </li>
          <li><SearchDrawer /></li>
        </ul>
      </div>
    );
  }

  // user menu
  return (
    <ul
      className={style['nav-icons']}
    >
      <li
        key="feeds"
        className={
          router.pathname === '/feed' ? 'active' : ''
        }
      >
        <Link href="/feed">
          <a>
            <FireOutlined />
          </a>
        </Link>
      </li>
      <li key="notification">
        <Dropdown
          overlay={<NotificationHeaderMenu />}
          forceRender
        >
          <a href="#" aria-label="notification">
            <BellOutlined />
            <Badge
              className="cart-total"
              count={notificationCount}
            />
          </a>
        </Dropdown>
      </li>
      <li
        key="messenger"
        className={
          router.pathname === '/messages' ? 'active' : ''
        }
      >
        <Link href="/messages">
          <a>
            <UnreadMessageBadge />
          </a>
        </Link>
      </li>
      {/* <li className={router.pathname === '/cart' ? 'active' : ''}>
        <Tooltip title="Shopping Cart">
          <Link href="/cart">
            <a>
              <CartBadge />
            </a>
          </Link>
        </Tooltip>
      </li> */}
      <li>
        <Tooltip title={(balance || 0).toFixed(2)}>
          <a
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => openTopupModalHandler({ open: true })}
            role="presentation"
          >
            <img
              src="/wallet-icon.png"
              alt=""
              width="23"
              height="23"
            />
            {' '}
            <span
              className="hide"
            >
              {(balance || 0).toFixed(2)}
            </span>
          </a>
        </Tooltip>
      </li>
      <li><SearchDrawer /></li>
    </ul>
  );
}

export default connector(LoggedInMenu);

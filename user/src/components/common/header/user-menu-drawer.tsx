import {
  BarChartOutlined,
  BlockOutlined,
  DollarOutlined,
  FireOutlined,
  FlagOutlined,
  HeartOutlined,
  LogoutOutlined,
  NotificationOutlined,
  PictureOutlined,
  ShoppingCartOutlined,
  // ShoppingOutlined,
  StockOutlined,
  UserOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import {
  ContactIcon, HeartIcon, MoneyTranIcon, MyFovoritesIcon, MySubIcon, PurchasedIcon, TopWalletIcon
} from '@components/icons';
import StreamIcon from '@components/streaming/live-stream-icon';
import { logout } from '@redux/auth/actions';
import { openTopupModal } from '@redux/wallet/actions';
import { authService } from '@services/auth.service';
import {
  Avatar, Divider, Drawer, Tooltip
} from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useContext, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SocketContext } from 'src/socket';

import style from './user-menu-drawer.module.less';

const mapState = (state: any) => ({
  currentUser: state.user.current
});
const mapDispatch = {
  logoutHandler: logout,
  openTopupModalHandler: openTopupModal
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

function UserMenuDrawer({
  currentUser = {},
  logoutHandler = () => { },
  openTopupModalHandler = () => { }
}: PropsFromRedux) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { getSocket } = useContext(SocketContext);

  const onLogout = () => {
    const token = authService.getToken();
    const socket = getSocket();
    if (token && socket) {
      socket.emit('auth/logout', {
        token
      });
    }
    logoutHandler();
  };

  return (
    <>
      <span
        key="menu-profile"
        aria-hidden
        onClick={() => setOpen(true)}
        className="menu-profile"
        style={{
          top: currentUser.isPerformer ? '5px' : 0
        }}
      >
        <img
          src="/information.png"
          alt=""
          width="23"
          height="23"
          className="icon-profile"
        />
        {' '}
        <span className="avatar-profile">
          <Avatar src={currentUser?.avatar || '/no-avatar.png'} />
        </span>
      </span>
      <Drawer
        title={(
          <div className="profile-user">
            <Tooltip title="Profile">
              <img
                src={currentUser?.avatar || '/no-avatar.png'}
                alt="avatar"
              />
              <a className="profile-name">
                {currentUser.name || 'N/A'}
                <span>
                  @
                  {currentUser.username || 'n/a'}
                </span>
              </a>
            </Tooltip>
          </div>
        )}
        closable
        onClose={() => setOpen(false)}
        visible={open}
        key="profile-drawer"
        className={style['profile-drawer']}
        width={280}
      >
        {currentUser.isPerformer && (
          <div className="profile-menu-item">
            <Link href="/model/live" as="/model/live">
              <div
                className={
                  router.pathname === '/model/live'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <StreamIcon />
                {' '}
                {t('common:goLive')}
              </div>
            </Link>
            <Divider />
            <Link href="/model/account" as="/model/account">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/account'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <UserOutlined />
                {' '}
                {t('common:editProfile')}
              </div>
            </Link>
            <Link
              href={{
                pathname: '/model/[username]',
                query: {
                  username: currentUser.username || currentUser._id
                }
              }}
              as={`/model/${currentUser.username || currentUser._id}`}
            >
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === `/model/${currentUser.username || currentUser._id}`
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <UserOutlined />
                {' '}
                <span className="hide">{t('common:myProfile')}</span>
              </div>
            </Link>
            <Link href={{ pathname: '/model/black-list' }}>
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/black-list'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <BlockOutlined />
                {' '}
                {t('common:blackList')}
              </div>
            </Link>
            <Link href={{ pathname: '/model/violations-reported' }}>
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/violations-reported'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <FlagOutlined />
                {' '}
                {t('common:violationsReported')}
              </div>
            </Link>
            <Divider />
            <Link href="/model/my-feed" as="/model/my-feed">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/my-feed'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <FireOutlined />
                {' '}
                {t('common:myFeed')}
              </div>
            </Link>
            <Link
              href={{ pathname: '/model/my-subscriber' }}
              as="/model/my-subscriber"
            >
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/my-subscriber'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <HeartOutlined />
                {' '}
                {t('common:titleMySubscribers')}
              </div>
            </Link>
            <Link href="/model/my-video" as="/model/my-video">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/my-video'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <VideoCameraOutlined />
                {' '}
                {t('common:titleMyVideo')}
              </div>
            </Link>
            <Link
              href="/model/my-gallery/listing"
              as="/model/my-gallery/listing"
            >
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/my-gallery/listing'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <PictureOutlined />
                {' '}
                {t('common:titleGallery')}
              </div>
            </Link>
            {/* <Link href="/model/my-store" as="/model/my-store">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/my-store'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <ShoppingOutlined />
                {' '}
                {t('common:titleMyStore')}
              </div>
            </Link> */}
            <Link
              href={{ pathname: '/model/product-orders' }}
              as="/model/product-orders"
            >
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/product-orders'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <ShoppingCartOutlined />
                {' '}
                {t('common:productOrder')}
              </div>
            </Link>
            <Divider />
            <Link
              href={{ pathname: '/model/statistical', query: { performerId: currentUser._id } }}
              as="/model/statistical"
            >
              <div
                className={
                  router.pathname === '/model/statistical'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <StockOutlined />
                {' '}
                Statistical
              </div>
            </Link>
            <Link
              href={{ pathname: '/model/monthly-trends', query: { performerId: currentUser._id } }}
              as="/model/monthly-trends"
            >
              <div
                className={
                  router.pathname === '/model/monthly-trends'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <BarChartOutlined />
                {' '}
                Monthly Trends
              </div>
            </Link>
            <Link href="/model/earning">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/earning'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <DollarOutlined />
                {' '}
                {t('common:titleEarning')}
              </div>
            </Link>
            <Link href="/model/payout-request">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/payout-request'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <NotificationOutlined />
                {' '}
                {t('common:payoutRequest')}
              </div>
            </Link>
            <Divider />
            <Link href={{ pathname: '/contact' }}>
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/contact'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <ContactIcon width={15} height={15} />
                {' '}
                {t('common:contact')}
              </div>
            </Link>
            <div
              aria-hidden
              className="menu-item"
              onClick={onLogout}
            >
              <LogoutOutlined />
              {' '}
              {t('common:signOut')}
            </div>
          </div>
        )}
        {!currentUser.isPerformer && (
          <div className="profile-menu-item">
            <Link href="/user/account" as="/user/account">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/user/account'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <UserOutlined />
                {' '}
                {t('common:editProfile')}
              </div>
            </Link>
            <a
              onClick={() => openTopupModalHandler({ open: true })}
              role="presentation"
            >
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/wallet-package'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <TopWalletIcon width={15} height={15} />
                {' '}
                {t('common:topUpWallet')}
              </div>
            </a>
            <Divider />
            <Link
              href={{ pathname: '/search/video' }}
              as="/search/video"
            >
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/search/video'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <Tooltip title={t('common:video')}>
                  <VideoCameraOutlined />
                  {' '}
                  <span className="hide">{t('common:video')}</span>
                </Tooltip>
              </div>
            </Link>
            <Link href="/user/my-favorite" as="/user/my-favorite">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/user/my-favorite'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <MyFovoritesIcon width={15} height={15} />
                {' '}
                {t('common:myFavorites')}
              </div>
            </Link>
            <Link href="/user/my-wishlist" as="/user/my-wishlist">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/user/my-wishlist'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <HeartIcon width={15} height={15} />
                {' '}
                {t('common:myWishlist')}
              </div>
            </Link>
            <Link href="/user/my-subscription" as="/user/my-subscription">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/user/my-subscription'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <MySubIcon width={15} height={15} />
                {' '}
                {t('common:mySubscriptions')}
              </div>
            </Link>
            <Divider />
            <Link href="/user/purchased-media" as="/user/purchased-media">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/user/purchased-media'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <PurchasedIcon width={15} height={15} />
                {' '}
                {t('common:purchasedMedia')}
              </div>
            </Link>
            {/* <Link href="/user/purchased-product" as="/user/purchased-product">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/user/purchased-product'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <ShoppingCartOutlined />
                {' '}
                {t('common:purchasesProduct')}
              </div>
            </Link> */}
            <Divider />
            <Link href="/user/payment-history" as="/user/payment-history">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/user/payment-history'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <MoneyTranIcon width={15} height={15} />
                {' '}
                {t('common:transactions')}
              </div>
            </Link>
            <Divider />
            <Link href={{ pathname: '/contact' }}>
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/contact'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <ContactIcon width={15} height={15} />
                {' '}
                {t('common:contactAdministrator')}
              </div>
            </Link>
            <div
              className="menu-item"
              aria-hidden
              onClick={onLogout}
            >
              <LogoutOutlined />
              {' '}
              {t('common:signOut')}
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}

export default connector(UserMenuDrawer);

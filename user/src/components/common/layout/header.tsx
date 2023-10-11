/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import './header.less';

import {
  BarChartOutlined,
  BellOutlined,
  BlockOutlined,
  DollarOutlined,
  FireOutlined,
  FlagOutlined,
  HeartOutlined,
  LogoutOutlined,
  NotificationOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  PlusSquareOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  StockOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import Sound from '@components/common/base/sound';
import {
  ContactIcon,
  HeartIcon,
  ModelEarningIcon,
  MoneyTranIcon,
  MyFovoritesIcon,
  MySubIcon,
  PurchasedIcon,
  TopWalletIcon
} from '@components/icons';
import { ITopupWalletModal } from '@components/wallet/topup-wallet-modal';
import { logout } from '@redux/auth/actions';
import { addPrivateRequest } from '@redux/streaming/actions';
import {
  Alert,
  Avatar,
  Badge,
  Card,
  Divider,
  Drawer,
  Dropdown,
  Layout,
  Menu,
  message,
  Tooltip
} from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Router, { NextRouter, withRouter } from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { MessageIcon, ModelIcon } from 'src/icons';
import {
  IUIConfig, IUser, StreamSettings
} from 'src/interfaces';
import { formatDate } from 'src/lib';
import { addCart } from 'src/redux/cart/actions';
import {
  authService,
  cartService,
  messageService,
  notificationService
} from 'src/services';
import { SocketContext } from 'src/socket';
import { ISocketContext } from 'src/socket/SocketContext';

const TopupWalletModal = dynamic<ITopupWalletModal>(() => import('@components/wallet/topup-wallet-modal'), { ssr: false });
const Popup18Plus = dynamic(() => import('src/components/common/popup-18plus-content'), { ssr: false });
const NotificationHeaderMenu = dynamic(() => import('@components/notification/NotificationHeaderMenu'), { ssr: false });
const StreamIcon = dynamic(() => import('@components/streaming/live-stream-icon'), { ssr: false });
const SearchBar = dynamic(() => import('@components/common/layout/search-bar'), { ssr: false });

const EVENT = {
  RECEIVED_PRIVATE_CHAT_REQUEST: 'private-chat-request',
  NOTIFY_READ_MESSAGE: 'nofify_read_messages_in_conversation',
  TIPPED: 'TIPPED',
  BALANCE_UPDATE: 'balance_update'
};

interface IProps {
  currentUser: IUser;
  streamSettings: StreamSettings;
  privateRequests: any;
  logout: Function;
  router: NextRouter;
  ui: IUIConfig;
  cart: any;
  addCart: Function;
  addPrivateRequest: Function;
  loggedIn: boolean;
  notificationCount: number;
}

function PrivateChatRequestMenuItem(
  privateRequests,
  streamSettings
) {
  if (!privateRequests?.length) return null;

  const renderCardTitle = (user) => {
    const { username, balance = 0 } = user;

    return (
      <span>
        {username}
        {' '}
        <span className="wallet-content">
          <img
            src="/wallett.png"
            alt=""
            width="10"
            height="10"
          />
          {' '}
          {balance.toFixed(2)}
        </span>
      </span>
    );
  };

  return privateRequests.map((request) => (
    <Menu.Item
      key={request.conversationId}
      onClick={() => {
        Router.push(
          {
            pathname: `/model/live/${streamSettings.optionForPrivate === 'webrtc' ? 'webrtc/' : ''} privatechat`,
            query: { id: request.conversationId }
          },
          `/model/live/${streamSettings.optionForPrivate === 'webrtc'
            ? 'webrtc/'
            : ''
          }privatechat/${request.conversationId}`
        );
        message.destroy();
      }}
    >
      <Card bordered={false} hoverable={false}>
        <Card.Meta
          avatar={(
            <Avatar
              src={
                request.user.avatar || '/no-avatar.png'
              }
            />
          )}
          title={renderCardTitle(request.user)}
          description={formatDate(
            request.user.createdAt
          )}
        />
      </Card>
    </Menu.Item>
  ));
}

function onScroll() {
  const div = document.getElementById('main-header');

  // TODO - check size
  const rightItemWidth = 35;
  const logoElems = document.querySelectorAll<HTMLElement>('.logo-nav');
  const logoWidth = 25; // logoElems.length ? logoElems[0].clientWidth : 50;
  const menuProfiles = document.querySelectorAll<HTMLElement>('.menu-profile');
  if (div.scrollLeft > logoWidth) {
    // logo-nav
    Array.from(logoElems).forEach((elem) => {
      // eslint-disable-next-line no-param-reassign
      elem.style.borderRight = '1px solid #fff';
    });
  } else {
    Array.from(logoElems).forEach((elem) => {
      // eslint-disable-next-line no-param-reassign
      elem.style.borderRight = 'none';
    });
  }

  if (div.scrollWidth - (div.clientWidth + div.scrollLeft) < rightItemWidth) {
    Array.from(menuProfiles).forEach((elem) => {
      // eslint-disable-next-line no-param-reassign
      elem.style.borderLeft = 'none';
    });
  } else {
    Array.from(menuProfiles).forEach((elem) => {
      // eslint-disable-next-line no-param-reassign
      elem.style.borderLeft = '1px solid #fff';
    });
  }
}

function attachScrollListener() {
  const div = document.getElementById('main-header');
  div.addEventListener('scroll', onScroll);
}

function removeScrollListener() {
  const div = document.getElementById('main-header');
  div.removeEventListener('scroll', onScroll);
}

class Header extends PureComponent<IProps> {
  state = {
    totalUnreadMessage: 0,
    openSearch: false,
    openProfile: false,
    openWalletModal: false,
    showAlert: false,
    balance: this.props.currentUser?.balance || 0
  };

  private socket: any;

  componentDidMount() {
    const {
      currentUser, loggedIn
    } = this.props;
    Router.events.on('routeChangeStart', () => this.setState({ openProfile: false }));
    if (currentUser._id) {
      this.countTotalMessage();
    }
    if (loggedIn) {
      this.initSocketEvent();
      this.handleCart();
    }

    onScroll();
    attachScrollListener();
    window.addEventListener('resize', onScroll);
  }

  componentDidUpdate(prevProps: any) {
    const {
      currentUser, loggedIn
    } = this.props;
    const { balance } = this.state;
    if (prevProps?.currentUser._id !== currentUser?._id && currentUser?._id) {
      this.countTotalMessage();
      this.handleCart();
      this.handleModelInactive();
      currentUser?.balance !== balance && this.handleUpdateBalance({ balance: currentUser?.balance });
    }

    if (loggedIn && prevProps.loggedIn !== loggedIn) {
      setTimeout(this.initSocketEvent, 1000);
    }
  }

  componentWillUnmount() {
    if (this.socket) {
      this.socket.off(EVENT.NOTIFY_READ_MESSAGE, this.handleMessage);
      this.socket.off(EVENT.BALANCE_UPDATE, this.handleUpdateBalance);
      this.socket.off(EVENT.TIPPED, this.handleTipped);
      this.socket.off(
        EVENT.RECEIVED_PRIVATE_CHAT_REQUEST,
        this.handlePrivateChat
      );
    }

    removeScrollListener();
    window.removeEventListener('resize', onScroll);
  }

  handleCart() {
    const {
      cart, addCart: addCartHandler
    } = this.props;
    if (!cart || (cart && cart.items.length <= 0)) {
      const existCart = cartService.getCartItems();
      if (existCart && existCart.length > 0) {
        addCartHandler(existCart);
      }
    }
  }

  handleMessage = (event) => {
    event && this.setState({ totalUnreadMessage: event.total });
  };

  handlePrivateChat = (data: { conversationId: string; user: IUser }) => {
    const { addPrivateRequest: dispatchAddPrivateRequest } = this.props;
    message.success(`${data.user.username} sent you a private chat request!`);
    // this.soundRef.current && this.soundRef.current.play();
    dispatchAddPrivateRequest({ ...data, createdAt: new Date() });
  };

  handleTipped = ({ senderInfo, totalPrice, _id }) => {
    if (notificationService.hasHolderId(_id)) return;
    notificationService.addHolderId(_id);
    message.success(
      `You have received $${totalPrice} from ${senderInfo.name}`
    );
    // this.soundRef.current && this.soundRef.current.play();
  };

  handleUpdateBalance = (data) => {
    this.setState({ balance: data.balance });
  };

  handleModelInactive() {
    const { currentUser } = this.props as any;
    if (
      currentUser.isPerformer
      && (currentUser.status !== 'active' || !currentUser.verifiedDocument)
    ) {
      this.setState({ showAlert: true });
    }
  }

  initSocketEvent = () => {
    this.socket = this.context;
    const { currentUser } = this.props;
    if (this.socket.connected) {
      if (currentUser.isPerformer) {
        this.socket.on(
          EVENT.RECEIVED_PRIVATE_CHAT_REQUEST,
          this.handlePrivateChat
        );
        this.socket.on(EVENT.TIPPED, this.handleTipped);
      }

      this.socket.on(EVENT.NOTIFY_READ_MESSAGE, this.handleMessage);
      this.socket.on(EVENT.BALANCE_UPDATE, this.handleUpdateBalance);
    } else {
      this.socket.on('connect', () => {
        if (currentUser.isPerformer) {
          this.socket.on(
            EVENT.RECEIVED_PRIVATE_CHAT_REQUEST,
            this.handlePrivateChat
          );
          this.socket.on(EVENT.TIPPED, this.handleTipped);
        }

        this.socket.on(EVENT.NOTIFY_READ_MESSAGE, this.handleMessage);
        this.socket.on(EVENT.BALANCE_UPDATE, this.handleUpdateBalance);
      });
    }
  };

  async beforeLogout() {
    const { logout: logoutHandler } = this.props;
    const token = authService.getToken();
    const { getSocket } = this.context as ISocketContext;
    const socket = getSocket();
    token
      && socket
      && (await socket.emit('auth/logout', {
        token
      }));
    logoutHandler();
  }

  async countTotalMessage() {
    const data = await (await messageService.countTotalNotRead()).data;
    if (data) {
      this.setState({ totalUnreadMessage: data.total });
    }
  }

  showWalletModal(e) {
    e.preventDefault();
    this.setState({ openWalletModal: true });
  }

  renderLoginSignup() {
    const { router } = this.props;
    return [
      <li
        key="login"
        className={
          router.pathname === '/auth/login' ? 'active' : ''
        }
      >
        <Link href="/auth/login">
          <a>Log in</a>
        </Link>
      </li>,
      <li
        key="signup"
        className={
          router.pathname === '/auth/register' ? 'active' : ''
        }
      >
        <Link href="/auth/register">
          <a>Sign Up</a>
        </Link>
      </li>
    ];
  }

  renderUserLoginMenu() {
    const { router } = this.props;
    return [
      <li
        key="model-page"
        className={
          router.pathname === '/model'
            ? 'custom active'
            : 'custom'
        }
      >
        <Link href={{ pathname: '/model' }} as="/model">
          <a>
            <Tooltip title="Models">
              <ModelIcon />
              {' '}
              <span className="hide">Models</span>
            </Tooltip>
          </a>
        </Link>
      </li>,
      <li
        key="search-video"
        className={
          router.pathname === '/search/video'
            ? 'custom active'
            : 'custom'
        }
      >
        <Link
          href={{ pathname: '/search/video' }}
          as="/search/video"
        >
          <a>
            <Tooltip title="Videos">
              <VideoCameraOutlined />
              {' '}
              <span className="hide">Videos</span>
            </Tooltip>
          </a>
        </Link>
      </li>,
      <li
        key="search-live"
        className={
          router.pathname === '/search/live'
            ? ' custom active'
            : ' custom'
        }
      >
        <Link
          href={{ pathname: '/search/live' }}
          as="/search/live"
        >
          <a>
            <Tooltip title="Live Models">
              <PlayCircleOutlined />
              {' '}
              <span className="hide">Live Models</span>
            </Tooltip>
          </a>
        </Link>
      </li>
    ];
  }

  renderMenuAllUserType() {
    const {
      router,
      notificationCount
    } = this.props;
    const {
      totalUnreadMessage
    } = this.state;
    return [
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
      </li>,
      <li
        key="messenger"
        className={
          router.pathname === '/messages' ? 'active' : ''
        }
      >
        <Link href="/messages">
          <a>
            <Tooltip title="Messenger">
              <MessageIcon />
              <Badge
                overflowCount={9}
                className="cart-total"
                count={totalUnreadMessage}
              />
            </Tooltip>
          </a>
        </Link>
      </li>
    ];
  }

  render() {
    const {
      privateRequests,
      streamSettings,
      currentUser,
      router,
      ui,
      cart
    } = this.props;
    const {
      openSearch,
      openProfile,
      showAlert,
      balance,
      openWalletModal
    } = this.state;

    return (
      <div className="main-header" id="main-header">
        <Sound />
        <Layout.Header className="header" id="layoutHeader">
          <div className="nav-bar">
            <div
              className="left-conner scroll"
            >
              <Link href="/">
                <a
                  title="Homepage"
                  className="logo-nav"

                >
                  {ui?.logo ? (
                    <img alt="logo" src={ui?.logo} height="64" />
                  ) : (
                    <span>{ui?.siteName}</span>
                  )}
                </a>
              </Link>
            </div>
            <div className="menu-middle">
              <ul
                className={currentUser._id ? 'nav-icons' : 'nav-icons custom'}
              >
                {currentUser._id && !currentUser.isPerformer && this.renderUserLoginMenu()}
              </ul>
            </div>
            <div className="mid-conner" style={{ marginRight: currentUser.isPerformer ? '70px' : 0 }}>
              <ul
                className={currentUser._id ? 'nav-icons' : 'nav-icons custom'}
              >
                {currentUser._id && currentUser.isPerformer && (
                  <li
                    className={
                      router.asPath
                        === `/model/${currentUser.username || currentUser._id}`
                        ? 'active custom'
                        : 'custom'
                    }
                  >
                    <Link
                      href={{
                        pathname: '/model/profile',
                        query: {
                          username: currentUser.username || currentUser._id
                        }
                      }}
                      as={`/model/${currentUser.username || currentUser._id}`}
                    >
                      <a>
                        <UserOutlined />
                        {' '}
                        <span className="hide">My Profile</span>
                      </a>
                    </Link>
                  </li>
                )}
                {currentUser._id && currentUser.isPerformer && (
                  <li
                    className={
                      router.pathname === '/model/my-post/create'
                        ? 'active'
                        : ''
                    }
                  >
                    <Link href="/model/my-post/create">
                      <Tooltip title="Compose new post">
                        <a>
                          <PlusSquareOutlined />
                        </a>
                      </Tooltip>
                    </Link>
                  </li>
                )}
                {currentUser._id && this.renderMenuAllUserType()}
                {currentUser._id && !currentUser.isPerformer && (
                  <li className={router.pathname === '/cart' ? 'active' : ''}>
                    <Tooltip title="Shopping Cart">
                      <Link href="/cart">
                        <a>
                          <Tooltip title="Shopping">
                            <ShoppingCartOutlined />
                            <Badge className="cart-total" count={cart.total} />
                          </Tooltip>
                        </a>
                      </Link>
                    </Tooltip>
                  </li>
                )}
                {currentUser && currentUser._id && currentUser.isPerformer && (
                  <li>
                    <Dropdown
                      overlay={(
                        <Menu>
                          {privateRequests.length > 0
                            ? <PrivateChatRequestMenuItem privateRequests={privateRequests} streamSettings={streamSettings} />
                            : <Menu.Item key="no-request">There is no private requests</Menu.Item>}
                        </Menu>
                      )}
                    >
                      <li
                        style={{
                          cursor: 'pointer',
                          color: '#ffffff'
                        }}
                      >
                        <UsergroupAddOutlined />
                        <Badge
                          className="cart-total"
                          count={privateRequests.length}
                        />
                      </li>
                    </Dropdown>
                  </li>
                )}
                {currentUser && currentUser._id && (
                  <li className={currentUser.isPerformer ? '' : 'custom'}>
                    {currentUser.isPerformer ? (
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
                    ) : (
                      // <Link href="/wallet-package">
                      <a
                        style={{ whiteSpace: 'nowrap' }}
                        onClick={this.showWalletModal.bind(this)}
                      >
                        <Tooltip title={(balance || 0).toFixed(2)}>
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
                        </Tooltip>
                      </a>
                      // </Link>
                    )}
                  </li>
                )}
                {!currentUser._id && this.renderLoginSignup()}
              </ul>
            </div>
            {currentUser._id && (
              <span
                key="menu-search"
                className={currentUser.isPerformer ? 'menu-search-performer' : 'menu-search'}
                aria-hidden
                onClick={() => this.setState({ openSearch: !openSearch })}
              >
                <a>
                  <Tooltip title="Search">
                    <SearchOutlined />
                  </Tooltip>
                </a>
              </span>
            )}
            {currentUser._id && (
              <span
                key="menu-profile"
                aria-hidden
                onClick={() => this.setState({ openProfile: true })}
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
            )}
            <Drawer
              title="Search"
              closable
              onClose={() => this.setState({ openSearch: false })}
              visible={openSearch}
              key="search-drawer"
              className="profile-drawer"
              width={280}

            >
              <SearchBar onEnter={() => this.setState({ openSearch: false })} />
            </Drawer>
            {!!currentUser?._id
              && (
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
                  onClose={() => this.setState({ openProfile: false })}
                  visible={openProfile}
                  key="profile-drawer"
                  className="profile-drawer"
                  width={280}
                >
                  {currentUser.isPerformer && (
                    <div className="profile-menu-item">
                      <Link href="/model/live" as="/live">
                        <div
                          className={
                            router.pathname === '/model/live'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <StreamIcon />
                          {' '}
                          Go Live
                        </div>
                      </Link>
                      <Divider />
                      <Link href="/model/account" as="/model/account">
                        <div
                          className={
                            router.pathname === '/model/account'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <UserOutlined />
                          {' '}
                          Edit Profile
                        </div>
                      </Link>
                      <Link href={{ pathname: '/model/black-list' }}>
                        <div
                          className={
                            router.pathname === '/model/black-list'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <BlockOutlined />
                          {' '}
                          Blacklist
                        </div>
                      </Link>
                      <Link href={{ pathname: '/model/violations-reported' }}>
                        <div
                          className={
                            router.pathname === '/model/violations-reported'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <FlagOutlined />
                          {' '}
                          Violations Reported
                        </div>
                      </Link>
                      <Divider />
                      <Link
                        href={{ pathname: '/model/my-subscriber' }}
                        as="/model/my-subscriber"
                      >
                        <div
                          className={
                            router.pathname === '/model/my-subscriber'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <HeartOutlined />
                          {' '}
                          My Subscribers
                        </div>
                      </Link>
                      <Link href="/model/my-post" as="/model/my-post">
                        <div className={router.pathname === '/model/my-post' ? 'menu-item active' : 'menu-item'}>
                          <FireOutlined />
                          {' '}
                          My Posts
                        </div>
                      </Link>
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
                      <Link href="/model/my-video" as="/model/my-video">
                        <div
                          className={
                            router.pathname === '/model/my-video'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <VideoCameraOutlined />
                          {' '}
                          My Videos
                        </div>
                      </Link>
                      <Link
                        href="/model/my-gallery/listing"
                        as="/model/my-gallery/listing"
                      >
                        <div
                          className={
                            router.pathname === '/model/my-gallery/listing'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <PictureOutlined />
                          {' '}
                          My Galleries
                        </div>
                      </Link>
                      <Link href="/model/my-store" as="/model/my-store">
                        <div
                          className={
                            router.pathname === '/model/my-store'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <ShoppingOutlined />
                          {' '}
                          My Store
                        </div>
                      </Link>
                      <Divider />
                      <Link
                        href={{ pathname: '/model/product-orders' }}
                        as="/model/product-orders"
                      >
                        <div
                          className={
                            router.pathname === '/model/product-orders'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <ShoppingCartOutlined />
                          {' '}
                          Product Orders
                        </div>
                      </Link>
                      <Divider />
                      <Link href="/model/earning">
                        <div
                          className={
                            router.pathname === '/model/earning'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <DollarOutlined />
                          {' '}
                          Earning Report
                        </div>
                      </Link>
                      <Link href="/model/payout-request">
                        <div
                          className={
                            router.pathname === '/model/payout-request'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <NotificationOutlined />
                          {' '}
                          Payout Request
                        </div>
                      </Link>
                      <Divider />
                      <Link href={{ pathname: '/contact' }}>
                        <div
                          className={
                            router.pathname === '/contact'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <ContactIcon width={15} height={15} />
                          {' '}
                          Contact
                        </div>
                      </Link>
                      <div
                        aria-hidden
                        className="menu-item"
                        onClick={() => this.beforeLogout()}
                      >
                        <LogoutOutlined />
                        {' '}
                        Sign Out
                      </div>
                    </div>
                  )}
                  {!currentUser.isPerformer && (
                    <div className="profile-menu-item">
                      <Link href="/user/account" as="/user/account">
                        <div
                          className={
                            router.pathname === '/user/account'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <UserOutlined />
                          {' '}
                          Edit Profile
                        </div>
                      </Link>
                      <a onClick={this.showWalletModal.bind(this)}>
                        <div
                          className={
                            router.pathname === '/wallet-package'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <TopWalletIcon width={15} height={15} />
                          {' '}
                          Top-up My Wallet
                        </div>
                      </a>
                      <Divider />
                      <Link href="/user/my-favorite" as="/user/my-favorite">
                        <div
                          className={
                            router.pathname === '/user/my-favorite'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <MyFovoritesIcon width={15} height={15} />
                          {' '}
                          My Favorites
                        </div>
                      </Link>
                      <Link href="/user/my-wishlist" as="/user/my-wishlist">
                        <div
                          className={
                            router.pathname === '/user/my-wishlist'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <HeartIcon width={15} height={15} />
                          {' '}
                          My Wishlist
                        </div>
                      </Link>
                      <Link href="/user/my-subscription" as="/user/my-subscription">
                        <div
                          className={
                            router.pathname === '/user/my-subscription'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <MySubIcon width={15} height={15} />
                          {' '}
                          My Subscriptions
                        </div>
                      </Link>
                      <Divider />
                      <Link href="/user/purchased-media" as="/user/purchased-media">
                        <div
                          className={
                            router.pathname === '/user/purchased-media'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <PurchasedIcon width={15} height={15} />
                          {' '}
                          Purchased Media
                        </div>
                      </Link>
                      <Link href="/user/purchased-product" as="/user/purchased-product">
                        <div
                          className={
                            router.pathname === '/user/purchased-product'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <ShoppingCartOutlined />
                          {' '}
                          Product Purchases
                        </div>
                      </Link>
                      <Divider />
                      <Link href="/user/payment-history" as="/user/payment-history">
                        <div
                          className={
                            router.pathname === '/user/payment-history'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <MoneyTranIcon width={15} height={15} />
                          {' '}
                          Transactions
                        </div>
                      </Link>
                      <Divider />
                      <Link href={{ pathname: '/contact' }}>
                        <div
                          className={
                            router.pathname === '/contact'
                              ? 'menu-item active'
                              : 'menu-item'
                          }
                        >
                          <ContactIcon width={15} height={15} />
                          {' '}
                          Contact
                          Administrator
                        </div>
                      </Link>
                      <div
                        className="menu-item"
                        aria-hidden
                        onClick={() => this.beforeLogout()}
                      >
                        <LogoutOutlined />
                        {' '}
                        Sign Out
                      </div>
                    </div>
                  )}
                </Drawer>
              )}
          </div>
          <Popup18Plus />
          <TopupWalletModal visible={openWalletModal} onClose={() => this.setState({ openWalletModal: false })} />
        </Layout.Header>
        {/* </div> */}
        {
          showAlert && (
            <Alert
              type="info"
              description={(
                <>
                  <p className="text-center" style={{ margin: 0 }}>
                    Feel free to look around, set up your profile, and load
                    content. Your profile will be made public once your account is
                    approved. We will notify you on email when you are in
                    business!
                  </p>
                  <a
                    href="/contact"
                    style={{ position: 'absolute', bottom: '5px', right: '5px' }}
                  >
                    Contact us
                  </a>
                </>
              )}
              message={(
                <h4 className="text-center">
                  We are in the process of approving your account.
                </h4>
              )}
              closable
            />
          )
        }
      </div>
    );
  }
}

Header.contextType = SocketContext;
const mapState = (state: any) => ({
  loggedIn: state.auth.loggedIn,
  currentUser: state.user.current,
  streamSettings: state.streaming.settings,
  ui: state.ui,
  cart: state.cart,
  ...state.streaming,
  notificationCount: state.notification.total
});
const mapDispatch = { logout, addCart, addPrivateRequest };
export default withRouter(connect(mapState, mapDispatch)(Header)) as any;

import {
  CameraOutlined,
  ContainerOutlined,
  DollarOutlined,
  FileImageOutlined,
  FireOutlined,
  FlagOutlined,
  HeartOutlined,
  MailOutlined,
  MenuOutlined,
  NotificationOutlined,
  PieChartOutlined,
  ProfileOutlined,
  // SkinOutlined,
  UserOutlined,
  VideoCameraOutlined,
  WomanOutlined
} from '@ant-design/icons';
import Loader from '@components/common/base/loader';
import Header from '@components/common/layout/header';
import Sider from '@components/common/layout/sider';
import { BackTop, Layout } from 'antd';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import { Router } from 'next/router';
import {
  useEffect, useRef, useState
} from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces/ui-config';
import { loadUIValue, updateUIValue } from 'src/redux/ui/actions';

import style from './primary-layout.module.less';

interface IPrimaryLayout {
  children: any;
  config: IUIConfig;
  updateUIHandler: Function;
  loadUIHandler: Function;
  ui: any;
}

function PrimaryLayout({
  children,
  updateUIHandler,
  loadUIHandler,
  ui
}: IPrimaryLayout) {
  const [isMobile, setIsMobile] = useState(false);
  const [routerChange, setRouterChange] = useState(false);
  const [collapsed, setCollapsed] = useState(ui.collapsed);

  const enquireHandler = useRef(null);

  const handleStateChange = () => {
    Router.events.on('routeChangeStart', async () => setRouterChange(true));
    Router.events.on('routeChangeComplete', async () => setRouterChange(false));
  };

  const onThemeChange = (theme: string) => {
    updateUIHandler({ theme });
  };

  const onCollapseChange = (c) => {
    setCollapsed(c);
    updateUIHandler({ collapsed: c });
  };

  useEffect(() => {
    loadUIHandler();
    enquireHandler.current = enquireScreen((mobile) => {
      if (isMobile !== mobile) {
        setIsMobile(mobile);

        if (mobile) {
          setCollapsed(true);
        }
      }
    });

    handleStateChange();

    return () => {
      unenquireScreen(enquireHandler.current);
    };
  }, []);

  const {
    fixedHeader, logo, siteName, theme
  } = ui;
  const headerProps = {
    collapsed,
    theme,
    onCollapseChange
  };
  const sliderMenus = [
    {
      id: 'menu',
      name: 'Menu Options',
      icon: <MenuOutlined />,
      children: [
        {
          id: 'menu-listing',
          name: 'Existing Menu Options',
          route: '/menu'
        },
        {
          name: 'New Menu',
          id: 'create-menu',
          route: '/menu/create'
        }
      ]
    },
    {
      id: 'email-template',
      name: 'Email Templates',
      icon: <MailOutlined />,
      children: [
        {
          id: 'email-templates-listing',
          name: 'Email Templates',
          route: '/email-templates'
        }
      ]
    },
    {
      id: 'blockCountry',
      name: 'Site Privacy',
      icon: <PieChartOutlined />,
      children: [
        {
          id: 'blockCountries',
          name: 'Site Privacy',
          route: '/block-country'
        }
      ]
    },
    {
      id: 'posts',
      name: 'Posts',
      icon: <ContainerOutlined />,
      children: [
        {
          id: 'post-page',
          name: 'Posts created',
          route: {
            pathname: '/posts',
            query: {
              type: 'page'
            }
          }
        },
        {
          id: 'page-create',
          name: 'New Post',
          route: {
            pathname: '/posts/create',
            query: {
              type: 'page'
            }
          }
        }
      ]
    },
    {
      id: 'coupon',
      name: 'Coupons',
      icon: <DollarOutlined />,
      children: [
        {
          id: 'coupon-listing',
          name: 'Coupons Created ',
          route: '/coupon'
        },
        {
          name: 'New Coupon',
          id: 'create-coupon',
          route: '/coupon/create'
        }
      ]
    },
    {
      id: 'banner',
      name: 'Banners',
      icon: <FileImageOutlined />,
      children: [
        {
          id: 'banner-listing',
          name: 'Existing Banners',
          route: '/banner'
        },
        {
          name: 'New Banner',
          id: 'upload-banner',
          route: '/banner/upload'
        }
      ]
    },
    {
      id: 'report',
      name: 'Violations',
      icon: <FlagOutlined />,
      children: [
        {
          id: 'report-listing',
          name: 'Violations reported',
          route: '/report'
        }
      ]
    },
    {
      id: 'accounts',
      name: 'Users',
      icon: <UserOutlined />,
      children: [
        {
          name: 'User List',
          id: 'users',
          route: '/users'
        },
        {
          name: 'New User',
          id: 'users-create',
          route: '/users/create'
        }
      ]
    },
    {
      id: 'performers',
      name: 'Models',
      icon: <WomanOutlined />,
      children: [
        {
          name: 'Current Models',
          id: 'listing',
          route: '/performer'
        },
        {
          name: 'Ranking Models',
          id: 'ranking',
          route: '/performer/ranking'
        },
        {
          name: 'New Model',
          id: 'create-performer',
          route: '/performer/create'
        }
      ]
    },
    {
      id: 'feed',
      name: 'Feed Posts',
      icon: <FireOutlined />,
      children: [
        {
          id: 'feed_posts',
          name: 'All Posts',
          route: '/feed'
        },
        {
          id: 'video_posts',
          name: 'Video Posts',
          route: '/feed?type=video'
        },
        {
          id: 'photo_posts',
          name: 'Photo Posts',
          route: '/feed?type=photo'
        },
        {
          id: 'create_post',
          name: 'Create New',
          route: '/feed/create'
        }
      ]
    },
    {
      id: 'videos',
      name: 'Videos',
      icon: <VideoCameraOutlined />,
      children: [
        {
          id: 'video-listing',
          name: 'Existing Videos',
          route: '/video'
        },
        {
          id: 'video-upload',
          name: 'New Video',
          route: '/video/upload'
        },
        {
          id: 'video-bulk-upload',
          name: 'Bulk Upload Videos',
          route: '/video/bulk-upload'
        }
      ]
    },
    {
      id: 'performers-galleries',
      name: 'Galleries',
      icon: <CameraOutlined />,
      children: [
        {
          id: 'gallery-listing',
          name: 'Existing Galleries',
          route: '/gallery'
        },
        {
          name: 'New Gallery',
          id: 'create-galleries',
          route: '/gallery/create'
        },
        {
          id: 'photo-listing',
          name: 'Photos',
          route: '/photos'
        },
        {
          name: 'Upload Photo',
          id: 'upload-photo',
          route: '/photos/upload'
        },
        {
          name: 'Bulk Upload Photos',
          id: 'bulk-upload-photo',
          route: '/photos/bulk-upload'
        }
      ]
    },
    // {
    //   id: 'performers-products',
    //   name: 'Store',
    //   icon: <SkinOutlined />,
    //   children: [
    //     {
    //       id: 'categories-listing',
    //       name: 'Categories',
    //       route: '/categories'
    //     },
    //     {
    //       id: 'create-new',
    //       name: 'New Category',
    //       route: '/categories/create'
    //     },
    //     {
    //       id: 'product-listing',
    //       name: 'Inventory',
    //       route: '/product'
    //     },
    //     {
    //       name: 'New Product',
    //       id: 'create-product',
    //       route: '/product/create'
    //     }
    //   ]
    // },
    {
      id: 'payments',
      name: 'Payment',
      icon: <DollarOutlined />,
      children: [
        {
          id: 'payment-listing',
          name: 'Payment History',
          route: '/payment'
        }
      ]
    },
    {
      id: 'payout-request',
      name: '   Payout Requests',
      icon: <NotificationOutlined />,
      route: '/payout-request'
    },
    {
      id: 'earning',
      name: 'Earnings',
      icon: <DollarOutlined />,
      children: [
        {
          id: 'earnings-listing',
          name: 'Earning History',
          route: '/earning'
        }
      ]
    },
    {
      id: 'order',
      name: 'Orders',
      icon: <ContainerOutlined />,
      children: [
        {
          id: 'order-listing',
          name: 'Product Orders History',
          route: '/order/product-order-history'
        }
      ]
    },
    {
      id: 'subscription',
      name: 'Subscriptions',
      icon: <HeartOutlined />,
      children: [
        {
          name: 'Subscription History',
          id: 'sub-listing',
          route: '/subscription'
        },
        {
          name: 'New Subscription',
          id: 'create-subscription',
          route: '/subscription/create'
        }
      ]
    },
    {
      id: 'i18n',
      name: 'Multilingual',
      icon: <ProfileOutlined />,
      children: [
        {
          name: 'List text',
          id: 'i18n-listing',
          route: '/i18n'
        },
        {
          name: 'New text',
          id: 'create-i18n',
          route: '/i18n/create'
        },
        {
          name: 'Import text',
          id: 'import-i18n',
          route: '/i18n/import'
        }
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: <PieChartOutlined />,
      children: [
        {
          id: 'system-settings',
          route: '/settings',
          as: '/settings',
          name: 'System Settings'
        },
        {
          id: 'system-settings-translate',
          route: '/settings/translation',
          name: 'Translate Settings'
        }
      ]
    }
  ];
  const siderProps = {
    collapsed,
    isMobile,
    logo,
    siteName,
    theme,
    menus: sliderMenus,
    onCollapseChange,
    onThemeChange
  };
  return (
    <Layout>
      <Sider {...siderProps} />
      <div className={style.container} style={{ paddingTop: fixedHeader ? 72 : 0 }} id="primaryLayout">
        <Header {...headerProps} />
        <Layout.Content className={style.content} style={{ position: 'relative' }}>
          {routerChange && <Loader spinning />}
          {/* <Bread routeList={newRouteList} /> */}
          {children}
        </Layout.Content>
        <BackTop className={style.backTop} target={() => document.querySelector('#primaryLayout') as any} />
      </div>
    </Layout>
  );
}

const mapStateToProps = (state: any) => ({
  ui: state.ui
});
const mapDispatchToProps = {
  updateUIHandler: updateUIValue,
  loadUIHandler: loadUIValue
};

export default connect(mapStateToProps, mapDispatchToProps)(PrimaryLayout);

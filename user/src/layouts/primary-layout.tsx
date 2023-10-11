import { requestCurrency } from '@redux/settings/actions';
import { BackTop, Layout } from 'antd';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { IUIConfig } from 'src/interfaces/ui-config';

import style from './primary-layout.module.less';

const Header = dynamic(() => import('@components/common/header/header'));
const Footer = dynamic(() => import('@components/common/layout/footer'));
const Loader = dynamic(() => import('@components/common/base/loader'));

interface IDefaultProps extends IUIConfig {
  children: any;
}

function PrimaryLayout({
  children
}: IDefaultProps) {
  const router = useRouter();
  const [routerChange, setRouterChange] = useState(false);
  const dispatch = useDispatch();

  const handleStateChange = () => {
    router.events.on('routeChangeStart', () => setRouterChange(true));
    router.events.on('routeChangeComplete', () => setRouterChange(false));
  };

  useEffect(() => {
    handleStateChange();
    dispatch(requestCurrency());

    return () => {
      router.events.off('routeChangeStart', () => {});
      router.events.off('routeChangeComplete', () => {});
    };
  }, []);

  return (
    <Layout>
      <div
        className="primary-container"
        id="primaryLayout"
      >
        <Header />
        <Layout.Content
          className="content"
          style={{ position: 'relative' }}
        >
          {routerChange && <Loader />}
          {children}
        </Layout.Content>
        <BackTop className={style.backTop} />
        <Footer />
      </div>
    </Layout>
  );
}

export default PrimaryLayout;

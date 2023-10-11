import { HomeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { clearCart } from '@redux/cart/actions';
import { Button, Layout, Result } from 'antd';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { IUser } from 'src/interfaces';

type IProps = {
  user: IUser;
  clearCartHandler: Function;
}

function PaymentSuccess({
  user,
  clearCartHandler
}: IProps) {
  const { t } = useTranslation();
  useEffect(() => {
    setTimeout(() => { clearCartHandler(); }, 1000);
    localStorage.setItem('cart', JSON.stringify([]));
  }, []);

  return (
    <Layout>
      <PageTitle title="Payment success" />
      <div className="main-container">
        <Result
          status="success"
          title="Payment Success"
          subTitle={`Hi ${user?.name || user?.username || 'there'}, ${t('common:successPayment')}`}
          extra={[
            <Button className="secondary" key="console" onClick={() => Router.push('/')}>
              <HomeOutlined />
              {t('common:backHome')}
            </Button>,
            <Button key="buy" className="primary" onClick={() => Router.push('/model')}>
              <ShoppingCartOutlined />
              {t('common:goShopping')}
            </Button>
          ]}
        />
      </div>
    </Layout>
  );
}

const mapStates = (state: any) => ({
  user: state.user.current
});

const mapDispatch = { clearCartHandler: clearCart };
export default connect(mapStates, mapDispatch)(PaymentSuccess);

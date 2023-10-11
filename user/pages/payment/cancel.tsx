import { HomeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { Button, Layout, Result } from 'antd';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { connect } from 'react-redux';
import { IUser } from 'src/interfaces';

type IProps = {
  user: IUser;
}

function PaymentCancel({
  user
}: IProps) {
  const { t } = useTranslation();
  return (
    <Layout>
      <PageTitle title="Payment fail" />
      <div className="main-container">
        <Result
          status="error"
          title="Payment Fail"
          subTitle={`Hi ${user?.name || user?.username || 'there'}, ${t('common:errPaymentCancel')}`}
          extra={[
            <Button className="secondary" key="console" onClick={() => Router.push('/')}>
              <HomeOutlined />
              {t('common:backHome')}
            </Button>,
            <Button key="buy" className="primary" onClick={() => Router.push('/contact')}>
              <ShoppingCartOutlined />
              {t('common:contactUs')}
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

export default connect(mapStates)(PaymentCancel);

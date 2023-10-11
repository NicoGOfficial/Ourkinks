/* eslint-disable no-unsafe-optional-chaining */
import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { redirect404 } from '@lib/utils';
import {
  Button, Descriptions, Layout, PageHeader,
  Tag
} from 'antd';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import useTranslation from 'next-translate/useTranslation';
import { IOrder } from 'src/interfaces';
import { orderService } from 'src/services';

const { Item } = Descriptions;

function OrderDetailPage({
  order
}: { order: IOrder }) {
  const { t } = useTranslation();

  const downloadFile = async (r) => {
    const resp = await orderService.getDownloadLinkDigital(r.productId);
    window.open(resp.data.downloadLink, '_blank');
  };

  const productType = (type: string) => {
    switch (type) {
      case 'sale_video':
        return <Tag color="green">{t('common:saleVideo')}</Tag>;
      // case 'digital':
      //   return <Tag color="red">{t('common:digitalProduct')}</Tag>;
      // case 'physical':
      //   return <Tag color="red">{t('common:physicalProduct')}</Tag>;
      case 'monthly_subscription':
        return <Tag color="blue">{t('common:monthlySubscription')}</Tag>;
      case 'yearly_subscription':
        return <Tag color="blue">{t('common:yearlySubscription')}</Tag>;
      default: return <Tag color="#FFCF00">{type}</Tag>;
    }
  };

  return (
    <Layout>
      <PageTitle title={`Order #${order?.orderNumber || ''}`} />
      {order && (
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title={`Order ID: #${order?.orderNumber}`}
          />
          <Descriptions>
            <Item key="seller" label={t('common:model')}>
              {order?.seller?.name || order?.seller?.username || t('common:na')}
            </Item>
            <Item key="name" label={t('common:product')}>
              {order?.name || t('common:na')}
            </Item>
            <Item key="description" label={t('common:labelDescription')}>
              {order?.description || t('common:na')}
            </Item>
            <Item key="productType" label={t('common:productType')}>
              {productType(order?.productType)}
            </Item>
            <Item key="unitPrice" label={t('common:unitPrice')}>
              {`$${order?.unitPrice}` || '0'}
            </Item>
            <Item key="quantiy" label="Quantity">
              {order?.quantity || '0'}
            </Item>
            <Item key="originalPrice" label={t('common:originalPrice')}>
              {`$${order?.originalPrice}` || '0'}
            </Item>
            {order.couponInfo && (
              <Item key="discount" label={t('common:discount')}>
                {`${(order?.couponInfo?.value || 0) * 100}%`}
                {' '}
                - $
                {((order?.originalPrice || 0) * order?.couponInfo.value).toFixed(2)}
              </Item>
            )}
            <Item key="totalPrice" label={t('common:totalPrice')}>
              {order?.payBy === 'money' && '$'}
              {(order?.totalPrice || 0).toFixed(2)}
              {order?.payBy === 'token' && t('common:wallet')}
            </Item>
            <Item key="gateway" label={t('common:paymentGateway')}>
              <Tag color="blue">{order?.paymentGateway}</Tag>
            </Item>
            <Item key="status" label={t('common:labelStatus')}>
              <Tag color="red">{order?.status}</Tag>
            </Item>
          </Descriptions>
          {['physical'].includes(order?.productType) ? (
            <>
              <div style={{ marginBottom: '10px' }}>
                {t('common:deliveryAddress')}
                :
                {' '}
                {order?.deliveryAddress || t('common:na')}
              </div>
              <div style={{ marginBottom: '10px' }}>
                {t('common:deliveryPostalCode')}
                :
                {' '}
                {order?.postalCode || t('common:na')}
              </div>
              <div style={{ marginBottom: '10px' }}>
                {t('common:deliveryPhoneNumber')}
                :
                {' '}
                {order?.phoneNumber || t('common:na')}
              </div>
              <div style={{ marginBottom: '10px', textTransform: 'capitalize' }}>
                {t('common:shippingCode')}
                :
                {' '}
                <Tag color="blue">{order?.shippingCode || t('common:na')}</Tag>
              </div>
              <div style={{ marginBottom: '10px', textTransform: 'capitalize' }}>
                {t('common:deliveryStatus')}
                :
                {' '}
                <Tag color="magenta">{order?.deliveryStatus || t('common:na')}</Tag>
              </div>
            </>
          ) : (
            <div style={{ marginBottom: '10px', textTransform: 'capitalize' }}>
              {t('common:deliveryStatus')}
              :
              {' '}
              <Tag color="green">{t('common:delivered')}</Tag>
            </div>
          )}
          {order?.productType === 'digital' && (
            <div style={{ marginBottom: '10px' }}>
              {t('common:downloadLink')}
              :
              {' '}
              <a href="#" onClick={downloadFile.bind(this, order)}>{t('common:clickHereDownload')}</a>
            </div>
          )}
          <div style={{ marginBottom: '10px' }}>
            <Button danger onClick={() => Router.back()}>
              {t('common:back')}
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
}

OrderDetailPage.authenticate = true;

OrderDetailPage.getInitialProps = async (ctx) => {
  try {
    const { id } = ctx.query;
    if (!id) return redirect404(ctx);
    const { token = '' } = nextCookie(ctx);
    const resp = await orderService.findById(id, {
      Authorization: token
    });
    return {
      order: resp.data
    };
  } catch (e) {
    return redirect404(ctx);
  }
};

export default OrderDetailPage;

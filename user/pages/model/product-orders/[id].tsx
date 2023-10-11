/* eslint-disable no-unsafe-optional-chaining */
import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { getResponseError } from '@lib/utils';
import {
  Alert,
  Button,
  Descriptions,
  Input,
  Layout,
  message,
  PageHeader,
  Select,
  Tag
} from 'antd';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { IOrder } from 'src/interfaces';
import { orderService } from 'src/services';

const { Item } = Descriptions;
type IProps = {
  id: string;
  i18n: any;
}

interface IStates {
  submitting: boolean;
  order: IOrder;
  shippingCode: string;
  deliveryStatus: string;
}

const productType = (type: string) => {
  const { t } = useTranslation();
  switch (type) {
    case 'physical':
      return <Tag color="geekblue">{t('common:physicalProduct')}</Tag>;
    case 'digital':
      return <Tag color="cyan">{t('common:digitalProduct')}</Tag>;
    default:
      return <Tag color="#FFCF00">{type}</Tag>;
  }
};

const paymentStatus = (status: string) => {
  const { t } = useTranslation();
  switch (status) {
    case 'success':
      return <Tag color="green">{t('common:success')}</Tag>;
    case 'cancelled':
      return <Tag color="red">{t('common:cancelled')}</Tag>;
    case 'chargeback':
      return <Tag color="gray">{t('common:chargeback')}</Tag>;
    default:
      return <Tag color="#FFCF00">{status}</Tag>;
  }
};

class OrderDetailPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  static onlyPerformer = true;

  static async getInitialProps(ctx) {
    return ctx.query;
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      submitting: false,
      order: null,
      shippingCode: '',
      deliveryStatus: ''
    };
  }

  componentDidMount() {
    this.getData();
  }

  async onUpdate() {
    const { t } = this.props.i18n;
    const { deliveryStatus, shippingCode } = this.state;
    const { id } = this.props;
    if (!shippingCode) {
      message.error(t('common:errRequireShippingCode'));
      return;
    }
    try {
      this.setState({ submitting: true });
      await orderService.update(id, { deliveryStatus, shippingCode });
      message.success(t('common:changesSaved'));
      Router.back();
    } catch (e) {
      message.error(getResponseError(e));
    } finally {
      await this.setState({ submitting: false });
    }
  }

  async getData() {
    const { t } = this.props.i18n;
    try {
      const { id } = this.props;
      const order = await orderService.findById(id);
      await this.setState({
        order: order.data,
        shippingCode: order.data.shippingCode,
        deliveryStatus: order.data.deliveryStatus
      });
    } catch (e) {
      message.error(t('common:cannotFindOrder'));
      Router.back();
    }
  }

  render() {
    const { t } = this.props.i18n;
    const { order, submitting } = this.state;
    return (
      <Layout>
        <PageTitle title={`${t('common:titleProductOrder')} #${order?.orderNumber}`} />
        <div className="main-container">
          {order && (
            <div className="main-container">
              <PageHeader
                onBack={() => Router.back()}
                backIcon={<ArrowLeftOutlined />}
                title={`${t('common:titleProductOrder')} ID: ${order?.orderNumber}`}
              />
              <Descriptions>
                <Item key="seller" label={t('common:model')}>
                  {order?.seller?.name || order?.seller?.username || 'N/A'}
                </Item>
                <Item key="name" label={t('common:product')}>
                  {order?.name || 'N/A'}
                </Item>
                <Item key="description" label={t('common:labelDescription')}>
                  {order?.description || 'N/A'}
                </Item>
                <Item key="productType" label={t('common:productType')}>
                  {productType(order.productType)}
                </Item>
                <Item key="unitPrice" label={t('common:unitPrice')}>
                  {`$${order?.unitPrice}` || '0'}
                </Item>
                <Item key="quantiy" label={t('common:quantity')}>
                  {order?.quantity || '0'}
                </Item>
                <Item key="originalPrice" label={t('common:originalPrice')}>
                  {`$${order?.originalPrice}` || '0'}
                </Item>
                {order.couponInfo && (
                  <Item key="discount" label={t('common:discount')}>
                    {order?.couponInfo?.value * (order?.originalPrice || 0)
                      || ''}
                  </Item>
                )}
                <Item key="totalPrice" label={t('common:totalPrice')}>
                  {order?.payBy === 'money' && '$'}
                  {(order?.totalPrice || 0).toFixed(2)}
                  {order?.payBy === 'token' && 'Tokens'}
                </Item>
                {order?.status && (
                  <Item key="status" label={t('common:paymentStatus')}>
                    {paymentStatus(order?.paymentStatus)}
                  </Item>
                )}

                {order.productType === 'physical' && (
                  <>
                    <Item key="phoneNumber" label={t('common:phone')}>
                      {order.phoneNumber}
                    </Item>
                    <Item key="postalCode" label={t('common:postalCode')}>
                      {order.postalCode}
                    </Item>
                  </>
                )}
              </Descriptions>
              {['physical'].includes(order?.productType) ? (
                <>
                  <div style={{ marginBottom: '10px' }}>
                    {t('common:dspPhysical')}
                    {' '}
                    {order.deliveryAddress || 'N/A'}
                  </div>
                  <Alert
                    type="warning"
                    message={t('common:msgAlertUpdateShippingCode')}
                  />
                  <div style={{ marginBottom: '10px' }}>
                    {t('common:shippingCode')}
                    <Input
                      placeholder={t('common:enterShippingCode')}
                      defaultValue={order.shippingCode}
                      onChange={(e) => this.setState({ shippingCode: e.target.value })}
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    {t('common:deliveryStatus')}
                    {' '}
                    <Select
                      onChange={(e) => {
                        if (order.productType !== 'physical') return;
                        this.setState({ deliveryStatus: e });
                      }}
                      defaultValue={order.deliveryStatus}
                      disabled={submitting}
                      style={{ minWidth: '120px' }}
                    >
                      <Select.Option key="created" value="created">
                        {t('common:created')}
                      </Select.Option>
                      <Select.Option key="processing" value="processing">
                        {t('common:processing')}
                      </Select.Option>
                      <Select.Option key="shipped" value="shipped">
                        {t('common:shipped')}
                      </Select.Option>
                      <Select.Option key="delivered" value="delivered">
                        {t('common:delivered')}
                      </Select.Option>
                      <Select.Option key="cancelled" value="cancelled">
                        {t('common:cancelled')}
                      </Select.Option>
                    </Select>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <Button
                      danger
                      onClick={this.onUpdate.bind(this)}
                      disabled={submitting}
                    >
                      {t('common:update')}
                    </Button>
                  </div>
                </>
              ) : (
                <div style={{ marginBottom: '10px' }}>
                  {t('common:deliveryStatus')}
                  {' '}
                  <Tag color="green">{t('common:delivered')}</Tag>
                </div>
              )}
            </div>
          )}
        </div>
      </Layout>
    );
  }
}

export default withTranslation(OrderDetailPage);

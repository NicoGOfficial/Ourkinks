import { BreadcrumbComponent } from '@components/common/breadcrumb';
import Page from '@components/common/layout/page';
import { getResponseError } from '@lib/utils';
import {
  Button, Input, Layout, message, Select, Tag
} from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { orderService } from 'src/services';

const { Content } = Layout;

interface IProps {
  id: string;
}

interface IStates {
  order: any;
  shippingCode: string;
  deliveryStatus: string;
}

class OrderDetailPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  static onlyPerformer = true;

  static async getInitialProps(ctx) {
    return ctx.query;
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      order: null,
      shippingCode: '',
      deliveryStatus: ''
    };
  }

  componentDidMount() {
    this.getData();
  }

  async onUpdate() {
    const { deliveryStatus, shippingCode } = this.state;
    const { id } = this.props;
    if (!shippingCode) {
      message.error('Missing shipping code');
      return;
    }
    try {
      await orderService.update(id, { deliveryStatus, shippingCode });
      message.success('Changes saved.');
    } catch (e) {
      message.error(getResponseError(await e));
    }
    Router.push('/order/product-order-history');
  }

  async getData() {
    const { id } = this.props;
    try {
      const { data: order } = await orderService.findDetailsById(id);
      await this.setState({
        order,
        shippingCode: order.shippingCode,
        deliveryStatus: order.deliveryStatus
      });
    } catch (e) {
      message.error('Can not find order!');
    }
  }

  renderPaymentGateway(paymentGateway) {
    switch (paymentGateway) {
      case 'ccbill':
        return <Tag color="default">CCBill</Tag>;
      case 'verotel':
        return <Tag color="default">Verotel</Tag>;
      case 'wallet':
        return <Tag color="default">Wallet</Tag>;
      case 'referral':
        return <Tag color="default">Referral</Tag>;
      default: return <Tag color="default">{paymentGateway}</Tag>;
    }
  }

  render() {
    const { order } = this.state;
    return (
      <Layout>
        <Head>
          <title>Order Details</title>
        </Head>
        <Content>
          <div className="main-container">
            <BreadcrumbComponent
              breadcrumbs={[
                { title: 'Orders', href: '/order' },
                {
                  title: order && order.orderNumber ? `#${order.orderNumber}` : 'Order Details'
                }
              ]}
            />
            <Page>
              {order && (
                <div className="main-container">
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Order Number</strong>
                    : #
                    {order.orderNumber}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Product Name</strong>
                    :
                    {' '}
                    {order.name}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Product Description</strong>
                    :
                    {' '}
                    {order.description}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>User Name</strong>
                    :
                    {' '}
                    {`${order.buyer?.name || order.buyer?.username || `${order.buyer?.firstName} ${order.buyer?.lastName}` || 'N/A'}`}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Model Name</strong>
                    :
                    {' '}
                    {`${order.seller?.name || order.seller?.username || 'N/A'}`}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Product type:</strong>
                    {' '}
                    <Tag color="orange">{order.productType}</Tag>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Quantity</strong>
                    :
                    {' '}
                    {order.quantity}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Price</strong>
                    : $
                    {order.totalPrice}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Payment Status</strong>
                    :
                    {' '}
                    {order.paymentStatus}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Payment Method</strong>
                    :
                    {' '}
                    {this.renderPaymentGateway(order.paymentGateway)}
                  </div>
                  {['physical'].includes(order?.productType)
                    ? (
                      <>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Delivery Phone Number</strong>
                          :
                          {' '}
                          {order.phoneNumber || 'N/A'}
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Delivery Address</strong>
                          :
                          {' '}
                          {order.deliveryAddress || 'N/A'}
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Delivery Postal Code</strong>
                          :
                          {' '}
                          {order.postalCode || 'N/A'}
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Shipping Code</strong>
                          :
                          {' '}
                          <Input placeholder="Enter shipping code here" defaultValue={order.shippingCode} onChange={(e) => this.setState({ shippingCode: e.target.value })} />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Delivery Status:</strong>
                          {' '}
                          <Select onChange={(e) => this.setState({ deliveryStatus: e })} defaultValue={order.deliveryStatus}>
                            <Select.Option key="processing" value="processing">
                              Processing
                            </Select.Option>
                            <Select.Option key="shipping" value="shipping">
                              Shipping
                            </Select.Option>
                            <Select.Option key="delivered" value="delivered">
                              Delivered
                            </Select.Option>
                            <Select.Option key="refunded" value="refunded">
                              Refunded
                            </Select.Option>
                          </Select>
                        </div>
                      </>
                    ) : (
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Delivery Status:</strong>
                        {' '}
                        <Tag color="green">Delivered</Tag>
                      </div>
                    )}
                  <div style={{ marginBottom: '10px' }}>
                    <Button danger onClick={this.onUpdate.bind(this)}>Update</Button>
                  </div>
                </div>
              )}
            </Page>
          </div>
        </Content>
      </Layout>
    );
  }
}

export default OrderDetailPage;

import {
  EyeOutlined
} from '@ant-design/icons';
import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { OrderSearchFilter } from '@components/order';
import { formatDate } from '@lib/date';
import { orderService } from '@services/index';
import {
  Layout, message, Table, Tag
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';

interface IProps {
  deliveryStatus: string
}

const renderPaymentGateway = (paymentGateway) => {
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
};

const columns = [
  {
    title: 'Order number',
    dataIndex: 'orderNumber',
    key: 'orderNumber',
    sorter: true
  },
  {
    title: 'Product Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'User Name',
    key: 'buyerId',
    render(record) {
      return (
        <span>
          {`${record.buyer?.name || record.buyer?.username || 'N/A'}`}
        </span>
      );
    }
  },
  {
    title: 'Model Name',
    key: 'sellerId',
    render(record) {
      return (
        <span>
          {`${record.seller?.name || record.seller?.username || 'N/A'}`}
        </span>
      );
    }
  },
  {
    title: 'Product type',
    dataIndex: 'productType',
    key: 'productType',
    render(productType) {
      switch (productType) {
        // case 'physical':
        //   return <Tag color="blue">Physical Product</Tag>;
        // case 'digital':
        //   return <Tag color="blue">Digital Product</Tag>;
        default: return <Tag color="blue">{productType}</Tag>;
      }
    }
  },
  {
    title: 'Price',
    dataIndex: 'totalPrice',
    render(totalPrice) {
      return (
        <span>
          $
          {totalPrice.toFixed(2)}
        </span>
      );
    }
  },
  {
    title: 'Payment Status',
    dataIndex: 'paymentStatus',
    render(status) {
      switch (status) {
        case 'paid': case 'success':
          return <Tag color="success">Success</Tag>;
        case 'pending': case 'created':
          return <Tag color="warning">Created</Tag>;
        case 'cancelled':
          return <Tag color="danger">Cancelled</Tag>;
        case 'chargeback':
          return <Tag color="danger">Chargeback</Tag>;
        default:
          return <Tag color="default">{status}</Tag>;
      }
    }
  },
  {
    title: 'Payment method',
    dataIndex: 'paymentGateway',
    render(paymentGateway) {
      return renderPaymentGateway(paymentGateway);
    }
  },
  {
    title: 'Delivery Status',
    dataIndex: 'deliveryStatus',
    render(status: string) {
      switch (status) {
        case 'processing':
          return <Tag color="default">Processing</Tag>;
        case 'shipping':
          return <Tag color="warning">Shipping</Tag>;
        case 'delivered':
          return <Tag color="success">Delivered</Tag>;
        case 'refunded':
          return <Tag color="danger">Refunded</Tag>;
        default: return <Tag>{status}</Tag>;
      }
    }
  },
  {
    title: 'Shiping Code',
    dataIndex: 'shippingCode',
    render(shippingCode) {
      return (
        <span>
          {shippingCode}
        </span>
      );
    }
  },
  {
    title: 'Order date',
    dataIndex: 'createdAt',
    sorter: true,
    render(date: Date) {
      return <span>{formatDate(date)}</span>;
    }
  },
  {
    title: 'Last update',
    dataIndex: 'updatedAt',
    sorter: true,
    render(date: Date) {
      return <span>{formatDate(date)}</span>;
    }
  },
  {
    title: '#',
    dataIndex: '_id',
    render(id: string) {
      return <Link href={{ pathname: '/order/detail', query: { id } }}><a><EyeOutlined /></a></Link>;
    }
  }
];

class ProductOdersHistory extends PureComponent<IProps> {
  static async getInitialProps(ctx) {
    return ctx.query;
  }

  state = {
    pagination: {} as any,
    searching: false,
    list: [] as any,
    limit: 10,
    filter: {} as any,
    sortBy: 'updatedAt',
    sort: 'desc'
  };

  async componentDidMount() {
    const { deliveryStatus } = this.props;
    if (deliveryStatus) {
      await this.setState({ filter: { deliveryStatus } });
    }
    this.search();
  }

  handleTableChange = async (pagination, filters, sorter) => {
    const pager = { ...pagination };
    pager.current = pagination.current;
    await this.setState({
      pagination: pager,
      sortBy: sorter.field || 'updatedAt',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order
        ? sorter.order === 'descend'
          ? 'desc'
          : 'asc'
        : 'desc'
    });
    this.search(pager.current);
  };

  async handleFilter(values) {
    const { filter } = this.state;
    await this.setState({ filter: { ...filter, ...values } });
    this.search();
  }

  async search(page = 1) {
    const {
      filter, limit, sort, sortBy, pagination
    } = this.state;
    try {
      await this.setState({ searching: true });
      const resp = await orderService.productsSearch({
        ...filter,
        limit,
        offset: (page - 1) * limit,
        sort,
        sortBy
      });
      this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total,
          pageSize: limit
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      this.setState({ searching: false });
    }
  }

  render() {
    const { list, searching, pagination } = this.state;
    return (
      <Layout>
        <Head>
          <title>Product Order History</title>
        </Head>
        <Page>
          <div className="main-container">
            <BreadcrumbComponent
              breadcrumbs={[
                { title: 'Product Order History', href: '/order/product-order-history' }
              ]}
            />
            <OrderSearchFilter
              onSubmit={this.handleFilter.bind(this)}
            />
            <Table
              dataSource={list}
              columns={columns}
              pagination={pagination}
              rowKey="_id"
              loading={searching}
              onChange={this.handleTableChange.bind(this)}
            />
          </div>

        </Page>
      </Layout>
    );
  }
}
export default ProductOdersHistory;

import { formatDate } from '@lib/date';
import {
  Table, Tag
} from 'antd';

interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
}

export function TableListPaymentTransaction({
  dataSource,
  rowKey,
  loading,
  pagination,
  onChange
}: IProps) {
  const columns = [
    {
      title: 'Transaction ID',
      key: 'orderNumber',
      render(record) {
        return (
          <span>{record.orderNumber}</span>
        );
      }
    },
    {
      title: 'Transaction Date',
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      sorter: true,
      fixed: 'right' as 'right',
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: 'User Name',
      key: 'buyer',
      render(record) {
        return (
          <span>
            {record.buyer?.name || record?.buyer?.username || 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Model Name',
      key: 'seller',
      render(record) {
        return (
          <span>
            {record?.seller?.name || record?.seller?.username || 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Transaction Type',
      dataIndex: 'productType',
      sorter: true,
      render(type: string) {
        switch (type) {
          case 'monthly_subscription':
            return <Tag color="red">Monthly Subscription</Tag>;
          case 'yearly_subscription':
            return <Tag color="red">Yearly Subscription</Tag>;
          case 'sale_video':
            return <Tag color="#FFCF00">PPV Purchase</Tag>;
          // case 'digital':
          //   return <Tag color="blue">Digital Product</Tag>;
          // case 'physical':
          //   return <Tag color="blue">Physical Product</Tag>;
          case 'stream_private':
            return <Tag color="yellow">Private Show</Tag>;
          case 'tip':
            return <Tag color="magenta">Tip</Tag>;
          case 'referral':
            return <Tag color="magenta">Referral reward</Tag>;
          case 'private_message_content':
            return <Tag color="magenta">Private message content</Tag>;
          case 'feed':
            return <Tag color="magenta">Post Feed</Tag>;
          case 'wallet':
            return <Tag color="#8A2BE2">Wallet Top-up</Tag>;
          default:
            return <Tag color="#936dc9">{type}</Tag>;
        }
      }
    },
    {
      title: 'Product Name',
      dataIndex: 'name'
    },
    {
      title: 'Price',
      dataIndex: 'totalPrice',
      render(data, record) {
        return (
          <span>
            $
            {record.totalPrice?.toFixed(2)}
          </span>
        );
      }
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentGateway',
      render(paymentGateway: string) {
        switch (paymentGateway) {
          case 'ccbill':
            return <Tag color="blue">CCBill</Tag>;
          case 'verotel':
            return <Tag color="pink">Verotel</Tag>;
          default: return <Tag color="#FFCF00">{paymentGateway || 'CCbill'}</Tag>;
        }
      }
    },
    {
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
      render(status: string) {
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
    }
  ];

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey={rowKey}
      loading={loading}
      pagination={pagination}
      onChange={onChange.bind(this)}
    />
  );
}

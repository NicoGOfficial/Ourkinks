import { EyeOutlined } from '@ant-design/icons';
import { formatDate } from '@lib/date';
import { Table, Tag } from 'antd';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { IOrder, IUser } from 'src/interfaces';

type IProps = {
  dataSource: IOrder[];
  pagination: {};
  rowKey: string;
  loading: boolean;
  onChange: Function;
  user: IUser;
}

function OrderTableList({
  dataSource,
  pagination,
  rowKey,
  loading,
  onChange,
  user
}: IProps) {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('common:orderNumber'),
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render(orderNumber) {
        return (
          <span style={{ whiteSpace: 'nowrap' }}>
            {orderNumber || t('common:na')}
          </span>
        );
      }
    },
    {
      title: t('common:labelDescription'),
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: t('common:type'),
      dataIndex: 'type',
      render(type: string) {
        switch (type) {
          case 'sale_video':
            return <Tag color="green">{t('common:saleVideo')}</Tag>;
          case 'digital':
            return <Tag color="red">{t('common:digitalProduct')}</Tag>;
          case 'physical':
            return <Tag color="red">{t('common:physicalProduct')}</Tag>;
          case 'monthly_subscription':
            return <Tag color="blue">{t('common:monthlySubscription')}</Tag>;
          case 'yearly_subscription':
            return <Tag color="blue">{t('common:yearlySubscription')}</Tag>;
          case 'feed':
            return <Tag color="pink">{t('common:postFeed')}</Tag>;
          default: return <Tag color="#FFCF00">{type}</Tag>;
        }
      }
    },
    {
      title: t('common:totalPrice'),
      dataIndex: 'totalPrice',
      render(totalPrice) {
        return (
          <span>
            $
            {(totalPrice || 0).toFixed(2)}
          </span>
        );
      }
    },
    {
      title: t('common:labelStatus'),
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'refunded':
            return <Tag color="red">{t('common:refunded')}</Tag>;
          case 'created':
            return <Tag color="gray">{t('common:created')}</Tag>;
          case 'paid':
            return <Tag color="blue">{t('common:paid')}</Tag>;
          default: return <Tag color="#FFCF00">{status}</Tag>;
        }
      }
    },
    // {
    //   title: 'Delivery Status',
    //   dataIndex: 'deliveryStatus',
    //   render(status: string) {
    //     switch (status) {
    //       case 'created':
    //         return <Tag color="gray">Created</Tag>;
    //       case 'processing':
    //         return <Tag color="#FFCF00">Processing</Tag>;
    //       case 'shipping':
    //         return <Tag color="#00dcff">Shipping</Tag>;
    //       case 'delivered':
    //         return <Tag color="#00c12c">Delivered</Tag>;
    //       case 'refunded':
    //         return <Tag color="red">Refunded</Tag>;
    //       default: return <Tag color="#FFCF00">{status}</Tag>;
    //     }
    //   }
    // },
    {
      title: t('common:updatedAt'),
      dataIndex: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: '#',
      dataIndex: '_id',
      sorter: true,
      render(id: string) {
        return (
          // eslint-disable-next-line react/prop-types
          <Link href={{ pathname: user.isPerformer ? '/model/my-order/[id]' : '/user/orders/[id]', query: { id } }}>
            <a>
              <EyeOutlined />
            </a>
          </Link>
        );
      }
    }
  ];
  return (
    <div className="table-responsive">
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        rowKey={rowKey}
        loading={loading}
        onChange={onChange.bind(this)}
      />
    </div>
  );
}

export default OrderTableList;

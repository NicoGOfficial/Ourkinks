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

function ProductTableList({
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
      sorter: true,
      render(orderNumber) {
        return (
          <span style={{ whiteSpace: 'nowrap' }}>{orderNumber || 'N/A'}</span>
        );
      }
    },
    {
      title: t('common:productName'),
      dataIndex: 'name',
      key: 'productName',
      render(name) {
        return <span style={{ whiteSpace: 'nowrap' }}>{name || 'N/A'}</span>;
      }
    },
    {
      title: user.isPerformer ? t('common:usernameProduct') : t('common:modelNameProduct'),
      key: 'modelName',
      render(record) {
        if (user.isPerformer) {
          return (
            <span style={{ whiteSpace: 'nowrap' }}>
              {record.buyer?.name || record.buyer?.username || 'N/A'}
            </span>
          );
        }
        return (
          <span style={{ whiteSpace: 'nowrap' }}>
            {record.seller?.name || record.seller?.username || 'N/A'}
          </span>
        );
      }
    },
    {
      title: t('common:productType'),
      dataIndex: 'productType',
      render(productType: string) {
        switch (productType) {
          case 'physical':
            return <Tag color="geekblue">{t('common:physicalProduct')}</Tag>;
          case 'digital':
            return <Tag color="cyan">{t('common:digitalProduct')}</Tag>;
          default:
            return <Tag color="#FFCF00">{productType}</Tag>;
        }
      }
    },
    {
      title: t('common:price'),
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
      title: t('common:paymentStatus'),
      dataIndex: 'paymentStatus',
      render(status: string) {
        switch (status) {
          case 'paid': case 'success':
            return <Tag color="success">{t('common:success')}</Tag>;
          case 'pending': case 'created':
            return <Tag color="warning">{t('common:created')}</Tag>;
          case 'cancelled':
            return <Tag color="danger">{t('common:cancelled')}</Tag>;
          case 'chargeback':
            return <Tag color="danger">{t('common:chargeback')}</Tag>;
          default:
            return <Tag color="default">{status}</Tag>;
        }
      }
    },
    {
      title: t('common:paymentMethod'),
      dataIndex: 'paymentGateway',
      render(status: string) {
        switch (status) {
          case 'ccbill':
            return <Tag color="gold">{t('common:ccbill')}</Tag>;
          case 'verotel':
            return <Tag color="orange">{t('common:verotel')}</Tag>;
          case 'wallet':
            return <Tag color="cyan">{t('common:wallet')}</Tag>;
          case 'referral':
            return <Tag color="blue" style={{ textTransform: 'capitalize' }}>{t('common:referralReward')}</Tag>;
          default:
            return <Tag color="#FFCF00">{status}</Tag>;
        }
      }
    },
    {
      title: t('common:deliveryStatus'),
      dataIndex: 'deliveryStatus',
      render(status: string) {
        switch (status) {
          case 'created':
            return <Tag color="magenta">{t('common:created')}</Tag>;
          case 'processing':
            return <Tag color="blue">{t('common:processing')}</Tag>;
          case 'cancelled':
            return <Tag color="red">{t('common:cancelled')}</Tag>;
          case 'shipped':
            return <Tag color="cyan">{t('common:shipped')}</Tag>;
          case 'delivered':
            return <Tag color="green">{t('common:delivered')}</Tag>;
          default:
            return <Tag color="#FFCF00">{status}</Tag>;
        }
      }
    },
    {
      title: t('common:shippingCode'),
      dataIndex: 'shippingCode',
      render(shippingCode: string) {
        return <span>{shippingCode || 'N/A'}</span>;
      }
    },
    {
      title: t('common:orderDate'),
      dataIndex: 'createdAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: t('common:lastUpdate'),
      dataIndex: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: t('common:actions'),
      dataIndex: '_id',
      render(id: string) {
        return (
          <Link
            href={{
              pathname: user.isPerformer
                ? '/model/product-orders/[id]'
                : '/user/purchased-product/[id]',
              query: { id }
            }}
          >
            <a>{user.isPerformer ? t('common:updateStatus') : t('common:checkStatus')}</a>
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

export default ProductTableList;

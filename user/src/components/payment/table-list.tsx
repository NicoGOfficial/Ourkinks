import { formatDate } from '@lib/date';
import { Table, Tag } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import { ITransaction } from 'src/interfaces';

type IProps = {
  dataSource: ITransaction[];
  pagination: {};
  rowKey: string;
  loading: boolean;
  onChange: Function;
}

function PaymentTableList({
  dataSource,
  pagination,
  rowKey,
  loading,
  onChange
}: IProps) {
  // const getProductType = (data) => {
  //   if (!data.details?.length) return 'Product';
  //   const { productType } = data.details[0];
  //   return productType === 'physical' ? 'Physical Product' : 'Digital Product';
  // };

  const { t } = useTranslation();

  const columns = [
    {
      title: t('common:transactionId'),
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render(orderNumber) {
        return (
          <span style={{ whiteSpace: 'nowrap' }}>
            {orderNumber}
          </span>
        );
      }
    },
    {
      title: t('common:transactionDate'),
      dataIndex: 'createdAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: t('common:model'),
      dataIndex: 'seller',
      key: 'seller',
      render(seller) {
        if (!seller) {
          return null;
        }

        const { name, username } = seller;
        return (
          <span>
            {name || username || 'N/A'}
          </span>
        );
      }
    },
    {
      title: t('common:transactionType'),
      dataIndex: 'productType',
      key: 'productType',
      render(type: string) {
        switch (type) {
          case 'free_subscription': return <Tag color="blue">{t('common:freeSubscription')}</Tag>;
          case 'monthly_subscription': return <Tag color="blue">{t('common:monthlySubscription')}</Tag>;
          case 'yearly_subscription': return <Tag color="blue">{t('common:yearlySubscription')}</Tag>;
          case 'performer_post': return <Tag color="red">{t('common:post')}</Tag>;
          case 'tip': return <Tag color="orange">{t('common:tip')}</Tag>;
          case 'physical': return <Tag color="green">{t('common:physicalProduct')}</Tag>;
          case 'digital': return <Tag color="green">{t('common:digitalProduct')}</Tag>;
          case 'performer_product': return <Tag color="green">{t('common:product')}</Tag>;
          case 'wallet': return <Tag color="magenta">{t('common:topupWallet')}</Tag>;
          case 'stream_private': return <Tag color="gold">{t('common:streamPrivate')}</Tag>;
          case 'sale_video': return <Tag color="red">{t('common:saleVideo')}</Tag>;
          case 'referral': return <Tag color="green">{t('common:referralReward')}</Tag>;
          case 'private_message_content': return <Tag color="green">{t('common:referralReward')}</Tag>;
          case 'feed': return <Tag color="green">{t('common:postFeed')}</Tag>;
          default: return <Tag>{type}</Tag>;
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
      title: t('common:paymentMethod'),
      dataIndex: 'paymentGateway',
      render(paymentGateway: string) {
        switch (paymentGateway) {
          case 'ccbill':
            return <Tag color="blue">{t('common:ccbill')}</Tag>;
          case 'verotel':
            return <Tag color="pink">{t('common:verotel')}</Tag>;
          case 'wallet':
            return <Tag color="gold">{t('common:wallet')}</Tag>;
          case 'referral':
            return <Tag color="cyan">{t('common:referralReward')}</Tag>;
          default: return <Tag color="#FFCF00">{paymentGateway || t('common:ccbill')}</Tag>;
        }
      }
    },
    {
      title: 'Payment Status',
      dataIndex: 'status',
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
export default PaymentTableList;

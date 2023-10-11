import { formatDate } from '@lib/date';
import { Table, Tag } from 'antd';
import { TableProps } from 'antd/lib/table';
import useTranslation from 'next-translate/useTranslation';
import { IEarning } from 'src/interfaces';

interface IProps extends TableProps<IEarning> {}

export function TableListEarning({
  dataSource, rowKey, pagination, onChange
}: IProps) {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('common:transactionId'),
      dataIndex: 'transactionId',
      key: 'transactionId'
    },
    {
      title: t('common:transactionDate'),
      dataIndex: 'createdAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date, 'DD/MM/YYYY HH:mm')}</span>;
      }
    },
    {
      title: t('common:userInfo'),
      render(data, record) {
        if (record.type === 'referral' && record.extraInfo?.invitedMemberRole === 'user') {
          return (
            <div>
              {record.extraInfo?.buyer?.username || ''}
              {' (invited user)'}
            </div>
          );
        }
        if (record.type === 'referral' && record.extraInfo?.invitedMemberRole === 'performer') {
          return (
            <div>
              {record.extraInfo?.seller?.username || ''}
              {' (invited model)'}
            </div>
          );
        }
        return (
          <span>
            {record.userInfo?.username || 'N/A'}
          </span>
        );
      }
    },
    {
      title: t('common:transactionType'),
      dataIndex: 'type',
      render(type: string) {
        switch (type) {
          case 'monthly_subscription':
            return <Tag color="red">{t('common:monthlySubscription')}</Tag>;
          case 'yearly_subscription':
            return <Tag color="red">{t('common:yearlySubscription')}</Tag>;
          case 'sale_video':
            return <Tag color="#FFCF00">{t('common:saleVideo')}</Tag>;
          case 'digital':
            return <Tag color="blue">{t('common:digitalProduct')}</Tag>;
          case 'physical':
            return <Tag color="blue">{t('common:physicalProduct')}</Tag>;
          case 'stream_private':
            return <Tag color="yellow">{t('common:streamPrivate')}</Tag>;
          case 'tip':
            return <Tag color="magenta">{t('common:tip')}</Tag>;
          case 'referral':
            return <Tag color="magenta">{t('common:referralReward')}</Tag>;
          default:
            return <Tag color="#936dc9">{type}</Tag>;
        }
      }
    },
    {
      title: t('common:grossPrice'),
      key: 'grossPrice',
      dataIndex: 'grossPrice',
      render: (grossPrice: number) => (grossPrice ? grossPrice.toFixed(2) : ''),
      sorter: true
    },
    {
      title: t('common:adminCommission'),
      dataIndex: 'commission',
      render(commission, record) {
        if (record.type === 'referral') {
          return <span />;
        }
        return (
          <span>
            {commission * 100}
            %
          </span>
        );
      }
    },
    {
      title: t('common:netPrice'),
      key: 'netPrice',
      dataIndex: 'netPrice',
      render: (netPrice: number) => (netPrice ? netPrice.toFixed(2) : ''),
      sorter: true
    },
    {
      title: t('common:paymentMethod'),
      dataIndex: 'paymentMethod',
      render(paymentMethod: string) {
        switch (paymentMethod) {
          case 'ccbill':
            return <Tag color="gold">{t('common:ccbill')}</Tag>;
          case 'verotel':
            return <Tag color="orange">{t('common:verotel')}</Tag>;
          case 'wallet':
            return <Tag color="cyan">{t('common:wallet')}</Tag>;
          case 'referral':
            return <Tag color="blue" style={{ textTransform: 'capitalize' }}>{t('common:referralReward')}</Tag>;
          default:
            return <Tag color="#FFCF00">{paymentMethod}</Tag>;
        }
      }
    },
    {
      title: t('common:paymentStatus'),
      dataIndex: 'paymentStatus',
      render(paymentStatus: string) {
        switch (paymentStatus) {
          case 'paid': case 'success':
            return <Tag color="success">{t('common:success')}</Tag>;
          case 'pending': case 'created':
            return <Tag color="warning">{t('common:created')}</Tag>;
          case 'cancelled':
            return <Tag color="danger">{t('common:cancelled')}</Tag>;
          case 'chargeback':
            return <Tag color="danger">{t('common:chargeback')}</Tag>;
          default:
            return <Tag color="#FFCF00">{paymentStatus}</Tag>;
        }
      }
    },
    {
      title: t('common:payoutStatus'),
      dataIndex: 'payoutStatus',
      render(payoutStatus: string) {
        switch (payoutStatus) {
          case 'done':
            return <Tag color="green" style={{ textTransform: 'capitalize' }}>{t('common:paid')}</Tag>;
          case 'pending':
            return <Tag color="orange" style={{ textTransform: 'capitalize' }}>{t('common:unPaid')}</Tag>;
          case 'rejected':
            return <Tag color="red" style={{ textTransform: 'capitalize' }}>{t('common:rejected')}</Tag>;
          default:
            return <Tag color="#FFCF00">{payoutStatus}</Tag>;
        }
      }
    }
  ];
  return (
    <div className="table-responsive">
      <Table
        // loading={loading}
        dataSource={dataSource}
        columns={columns}
        rowKey={rowKey}
        pagination={pagination}
        onChange={onChange.bind(this)}
      />
    </div>
  );
}

export default TableListEarning;

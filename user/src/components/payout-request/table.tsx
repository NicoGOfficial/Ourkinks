/* eslint-disable react/destructuring-assignment */
import { Table, Tag } from 'antd';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { PayoutRequestInterface } from 'src/interfaces';
import { formatDate } from 'src/lib';

type IProps = {
  payouts: PayoutRequestInterface[];
  searching: boolean;
  total: number;
  pageSize: number;
  onChange: Function;
}

function PayoutRequestList({
  payouts,
  searching,
  total,
  pageSize,
  onChange
}: IProps) {
  const { t } = useTranslation();
  const columns = [
    {
      title: '#',
      dataIndex: '_id',
      key: 'id',
      render: (id: string, record) => (
        <Link
          href={{
            pathname: '/model/payout-requests/update',
            query: {
              data: JSON.stringify(record),
              id: record._id
            }
          }}
          as={`/model/payout-request/update?id=${record._id}`}
        >
          <a>
            {id.slice(16, 24).toUpperCase()}
          </a>
        </Link>
      )
    },
    {
      title: t('common:requestedPrice'),
      dataIndex: 'requestedPrice',
      key: 'requestedPrice',
      render: (requestedPrice: number) => (
        <span>
          $
          {(requestedPrice || 0).toFixed(2)}
        </span>
      )
    },
    {
      title: t('common:paymentAccountType'),
      dataIndex: 'paymentAccountType',
      key: 'paymentAccountType',
      render: (paymentAccountType: string) => {
        switch (paymentAccountType) {
          case 'banking':
            return <Tag color="#656fde">{t('common:banking')}</Tag>;
          case 'paypal':
            return <Tag color="#25397c">{t('common:paypal')}</Tag>;
          default:
            break;
        }
        return <Tag color="default">{paymentAccountType}</Tag>;
      }
    },
    {
      title: t('common:labelStatus'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        switch (status) {
          case 'done':
            return <Tag color="green" style={{ textTransform: 'capitalize' }}>{t('common:done')}</Tag>;
          case 'pending':
            return <Tag color="orange" style={{ textTransform: 'capitalize' }}>{t('common:pending')}</Tag>;
          case 'rejected':
            return <Tag color="red" style={{ textTransform: 'capitalize' }}>{t('common:rejected')}</Tag>;
          default: break;
        }
        return <Tag color="blue" style={{ textTransform: 'capitalize' }}>{status}</Tag>;
      }
    },
    {
      title: t('common:lastUpdate'),
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      render: (updatedAt: Date) => <span>{formatDate(updatedAt)}</span>,
      sorter: true
    },
    {
      title: 'Actions',
      key: 'details',
      render: (request: PayoutRequestInterface) => (
        <Link
          href={{
            pathname: '/model/payout-requests/update',
            query: {
              data: JSON.stringify(request),
              id: request._id
            }
          }}
          as={`/model/payout-request/update?id=${request._id}`}
        >
          <a>{request.status === 'pending' ? 'Edit' : 'View details'}</a>
        </Link>
      )
    }
  ];
  const dataSource = payouts.map((p) => ({ ...p, key: p._id }));

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      className="table"
      pagination={{
        total,
        pageSize
      }}
      scroll={{ x: true }}
      showSorterTooltip={false}
      loading={searching}
      onChange={onChange.bind(this)}
    />
  );
}

export default PayoutRequestList;

import { formatDate } from '@lib/date';
import {
  Button,
  Table, Tag
} from 'antd';
import { ISubscription } from 'src/interfaces';

interface IProps {
  dataSource: ISubscription[];
  pagination: {};
  rowKey: string;
  onChange(): Function;
  loading: boolean;
  onCancelSubscriber: Function;
}

export function TableListSubscription({
  dataSource,
  pagination,
  rowKey,
  onChange,
  loading,
  onCancelSubscriber
}: IProps) {
  const columns = [
    {
      title: 'User',
      dataIndex: 'userInfo',
      render(data, records) {
        return (
          <span>
            {`${records?.userInfo?.name || records?.userInfo?.username || ''}`}
          </span>
        );
      }
    },
    {
      title: 'Model',
      dataIndex: 'performerInfo',
      render(data, records) {
        return (
          <span>
            {`${records?.performerInfo?.name || records?.performerInfo?.username || ''}`}
          </span>
        );
      }
    },
    {
      title: 'Type',
      dataIndex: 'subscriptionType',
      sorter: true,
      render(subscriptionType: string) {
        switch (subscriptionType) {
          case 'monthly':
            return <Tag color="orange">Monthly Subscription</Tag>;
          case 'yearly':
            return <Tag color="purple">Yearly Subscription</Tag>;
          case 'system':
            return <Tag color="red">System</Tag>;
          default: return <Tag color="orange">Monthly Subscription</Tag>;
        }
      }
    },
    {
      title: 'Start Date',
      dataIndex: 'startRecurringDate',
      sorter: true,
      render(data, records) {
        return <span>{records?.status === 'active' ? formatDate(records.createdAt, 'LL') : 'N/A'}</span>;
      }
    },
    {
      title: 'Renewal Date',
      dataIndex: 'nextRecurringDate',
      sorter: true,
      render(date, records) {
        if (date && records.status === 'active') {
          return <span>{formatDate(records.nextRecurringDate, 'LL')}</span>;
        }
        return null;
      }
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiredAt',
      sorter: true,
      render(date: Date, record) {
        if ((record.status !== 'active' || record.subscriptionType === 'system') && date) {
          return <span>{formatDate(date, 'LL')}</span>;
        }

        return null;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: true,
      render(status: string) {
        switch (status) {
          case 'active':
            return <Tag color="green">Active</Tag>;
          case 'deactivated':
            return <Tag color="red">Deactivated</Tag>;
          default: <Tag color="orange">{status}</Tag>;
        }
        return status;
      }
    },
    {
      title: 'Updated on',
      dataIndex: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: 'Action',
      dataIndex: 'status',
      render(data, records) {
        return (
          <span>
            {records.status === 'active' ? (
              <Button onClick={() => onCancelSubscriber(records)} type="link">Cancel subscription</Button>
            ) : null}
          </span>
        );
      }
    }
  ];
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
      pagination={pagination}
      onChange={onChange}
      loading={loading}
    />
  );
}

import { formatDate } from '@lib/date';
import { Avatar, Table, Tag } from 'antd';
import moment from 'moment';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import { ISubscription } from 'src/interfaces';

type IProps = {
  dataSource: ISubscription[];
  pagination: any;
  rowKey: string;
  onChange: any;
  loading: boolean;
}

export function TableListSubscription({
  dataSource,
  pagination,
  rowKey,
  onChange,
  loading
}: IProps) {
  const { t } = useTranslation();
  const columns = [
    {
      title: t('common:userInfo'),
      dataIndex: 'userInfo',
      render(data, records) {
        return (
          <span>
            <Avatar src={records?.userInfo?.avatar || '/no-avatar.png'} />
            {' '}
            {records?.userInfo?.name || records?.userInfo?.username || 'N/A'}
          </span>
        );
      }
    },
    {
      title: t('common:type'),
      dataIndex: 'subscriptionType',
      render(subscriptionType: string) {
        switch (subscriptionType) {
          case 'monthly':
            return <Tag color="#936dc9">{t('common:monthlySubscription')}</Tag>;
          case 'yearly':
            return <Tag color="#00dcff">{t('common:yearlySubscription')}</Tag>;
          case 'system':
            return <Tag color="#FFCF00">{t('common:system')}</Tag>;
          default:
            return null;
        }
      }
    },
    {
      title: t('common:startDate'),
      dataIndex: 'createdAt',
      render(data, records) {
        return <span>{records?.status === 'active' ? formatDate(records.createdAt, 'LL') : 'N/A'}</span>;
      }
    },
    {
      title: t('common:expiryDate'),
      dataIndex: 'expiredAt',
      render(date: Date, record: ISubscription) {
        return <span>{record.status !== 'active' && formatDate(date, 'LL')}</span>;
      }
    },
    {
      title: t('common:renewalDate'),
      dataIndex: 'nextRecurringDate',
      render(date: Date, record: ISubscription) {
        return <span>{record.status === 'active' && record.subscriptionId && moment().isBefore(record.expiredAt) && formatDate(date, 'LL')}</span>;
      }
    },
    {
      title: t('common:labelStatus'),
      dataIndex: 'status',
      render(status: string, record: ISubscription) {
        if (!moment().isBefore(record.expiredAt)) {
          return <Tag color="red">{t('common:suspended')}</Tag>;
        }
        switch (status) {
          case 'active':
            return <Tag color="green">{t('common:active')}</Tag>;
          case 'deactivated':
            return <Tag color="red">{t('common:inactive')}</Tag>;
          default: return <Tag color="red">{t('common:inactive')}</Tag>;
        }
      }
    },
    {
      title: t('common:lastUpdate'),
      dataIndex: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    }
  ];
  return (
    <div className="table-responsive">
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        pagination={pagination}
        onChange={onChange}
        loading={loading}
      />
    </div>
  );
}

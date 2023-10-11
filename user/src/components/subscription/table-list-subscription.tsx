import { formatDate } from '@lib/date';
import {
  Avatar,
  Button, Table, Tag
} from 'antd';
import moment from 'moment';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import { ISubscription } from 'src/interfaces';

type IProps = {
  dataSource: ISubscription[];
  pagination: any;
  rowKey: string;
  onChange(): any;
  loading: boolean;
  cancelSubscription: Function;
}

export function TableListSubscription({
  dataSource,
  pagination,
  rowKey,
  onChange,
  loading,
  cancelSubscription
}: IProps) {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('common:model'),
      dataIndex: 'performerInfo',
      render(data, records) {
        return (
          <Link
            href={{
              pathname: '/model/[username]',
              query: { username: records?.performerInfo?.username || records?.performerInfo?._id }
            }}
            as={`/model/${records?.performerInfo?.username || records?.performerInfo?._id}`}
          >
            <a>
              <Avatar src={records?.performerInfo?.avatar || '/no-avatar.png'} />
              {' '}
              {records?.performerInfo?.username || records?.performerInfo?.name || t('common:na')}
            </a>
          </Link>
        );
      }
    },
    {
      title: t('common:type'),
      dataIndex: 'subscriptionType',
      render(subscriptionType: string) {
        switch (subscriptionType) {
          case 'monthly':
            return <Tag color="orange">{t('common:monthlySubscription')}</Tag>;
          case 'yearly':
            return <Tag color="orange">{t('common:yearlySubscription')}</Tag>;
          case 'system':
            return <Tag color="orange">{t('common:system')}</Tag>;
          default:
            return <Tag color="orange">{subscriptionType}</Tag>;
        }
      }
    },
    {
      title: t('common:startDate'),
      dataIndex: 'createdAt',
      render(data, records) {
        return <span>{records?.status === 'active' ? formatDate(records.createdAt, 'LL') : t('common:na')}</span>;
      }
    },
    {
      title: t('common:renewalDate'),
      dataIndex: 'expiredAt',
      render(date: Date, record: ISubscription) {
        return <span>{record.status === 'active' && record.subscriptionId && moment().isBefore(record.expiredAt) && formatDate(date, 'LL')}</span>;
      }
    },
    {
      title: t('common:expiryDate'),
      dataIndex: 'expiredAt',
      sorter: true,
      render(date: Date, record: ISubscription) {
        return <span>{(record.status !== 'active' || record.subscriptionType === 'system') && formatDate(date, 'LL')}</span>;
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
    },
    {
      title: t('common:actions'),
      render(record) {
        return record.status === 'active' && moment().isBefore(moment(record.expiredAt)) && (
          <Button danger onClick={() => cancelSubscription(record)}>
            {t('common:cancelSubscription')}
          </Button>
        );
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

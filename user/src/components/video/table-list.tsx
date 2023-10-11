import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { formatDate } from '@lib/date';
import {
  Button, Table, Tag, Tooltip
} from 'antd';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import { ThumbnailVideo } from './thumbnail-video';

type IProps = {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  onDelete: Function;
}

export function TableListVideo({
  dataSource,
  rowKey,
  loading,
  pagination,
  onChange,
  onDelete
}: IProps) {
  const { t } = useTranslation();
  const columns = [
    {
      title: '#',
      render(record: any) {
        return (
          <Link href={{ pathname: '/video', query: { id: record.slug || record._id } }} as={`/video/${record.slug || record._id}`}><a><ThumbnailVideo video={record} /></a></Link>
        );
      }
    },
    {
      title: t('common:title'),
      dataIndex: 'title',
      render(title: string, record: any) {
        return (
          <Tooltip title={title}>
            <div style={{
              maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}
            >
              <Link href={{ pathname: '/video', query: { id: record.slug || record._id } }} as={`/video/${record.slug || record._id}`}>
                <a>{title}</a>
              </Link>
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: 'PPV',
      dataIndex: 'isSaleVideo',
      render(isSale: boolean) {
        switch (isSale) {
          case true:
            return <Tag color="green">Y</Tag>;
          case false:
            return <Tag color="red">N</Tag>;
          default: return <Tag color="orange">{isSale}</Tag>;
        }
      }
    },
    {
      title: t('common:isSchedule'),
      dataIndex: 'isSchedule',
      render(isSchedule: boolean) {
        switch (isSchedule) {
          case true:
            return <Tag color="green">Y</Tag>;
          case false:
            return <Tag color="red">N</Tag>;
          default: return <Tag color="orange">{isSchedule}</Tag>;
        }
      }
    },
    {
      title: t('common:labelStatus'),
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'active':
            return <Tag color="success">{t('common:active')}</Tag>;
          case 'inactive':
            return <Tag color="orange">{t('common:inactive')}</Tag>;
          default:
            return <Tag color="red">{status}</Tag>;
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
      dataIndex: '_id',
      render: (id: string) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          <Button className="info">
            <Link
              href={{
                pathname: '/model/my-video/update',
                query: { id }
              }}
              as={`/model/my-video/update?id=${id}`}
            >
              <a>
                <EditOutlined />
              </a>
            </Link>
          </Button>
          <Button onClick={onDelete.bind(this, id)} className="danger">
            <DeleteOutlined />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="table-responsive">
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={rowKey}
        loading={loading}
        pagination={pagination}
        onChange={onChange.bind(this)}
      />
    </div>
  );
}

export default TableListVideo;

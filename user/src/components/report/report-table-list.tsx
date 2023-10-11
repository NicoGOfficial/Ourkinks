import { formatDate } from '@lib/date';
import {
  Avatar,
  Table, Tag, Tooltip
} from 'antd';
import useTranslation from 'next-translate/useTranslation';

type IProps = {
  items: any[];
  total: number;
  pageSize: number;
  searching: boolean;
  onChange: Function;
}

const reportTableList = ({
  items,
  total,
  pageSize,
  searching,
  onChange
}: IProps) => {
  const { t } = useTranslation();
  const columns = [
    {
      title: t('common:reporter'),
      dataIndex: 'sourceInfo',
      key: 'sourceInfo',
      render: (user) => (
        <span>
          <Avatar src={user?.avatar || '/no-avatar.png'} />
          {' '}
          {user?.name || user?.username || 'N/A'}
        </span>
      )
    },
    // {
    //   title: 'Type',
    //   dataIndex: 'target',
    //   key: 'target',
    //   render: (target) => (
    //     <Tag color="blue" style={{ textTransform: 'capitalize' }}>{target}</Tag>
    //   )
    // },
    {
      title: t('common:video'),
      dataIndex: 'targetId',
      key: 'targetId',
      render: (targetId, record) => (
        <span>
          {record?.targetInfo?.title || 'N/A'}
        </span>
      )
    },
    {
      title: t('common:title'),
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: t('common:labelDescription'),
      dataIndex: 'description',
      key: 'description',
      render: (description) => (
        <Tooltip title={description}>
          <div style={{
            width: 150, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'
          }}
          >
            {description || 'N/A'}
          </div>
        </Tooltip>
      )
    },
    {
      title: t('common:labelStatus'),
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'created':
            return <Tag color="green">{t('common:created')}</Tag>;
          case 'deleted':
            return <Tag color="red">{t('common:deleted')}</Tag>;
          default: return <Tag color="default">{status}</Tag>;
        }
      }
    },
    {
      title: t('common:updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt: Date) => <span>{formatDate(updatedAt)}</span>
    }
  ];

  const dataSource = items.map((p) => ({ ...p, key: p._id }));

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      className="table"
      pagination={{
        total,
        pageSize,
        position: ['bottomCenter']
      }}
      rowKey="_id"
      loading={searching}
      onChange={onChange.bind(this)}
    />
  );
};
export default reportTableList;

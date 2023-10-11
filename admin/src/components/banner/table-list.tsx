import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { ThumbnailBanner } from '@components/banner/thumbnail-banner';
import { DropdownAction } from '@components/common/dropdown-action';
import { formatDate } from '@lib/date';
import { Table, Tag } from 'antd';

type IProps = {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  deleteBanner?: Function;
}

export function TableListBanner({
  deleteBanner = () => { }, dataSource, rowKey, loading, pagination, onChange
}: IProps) {
  const columns = [
    {
      title: '',
      dataIndex: 'thumbnail',
      render(data, record) {
        return <ThumbnailBanner banner={record} />;
      }
    },
    {
      title: 'Title',
      dataIndex: 'title'
    },
    {
      title: 'Position',
      dataIndex: 'position'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'active':
            return <Tag color="green">Active</Tag>;
          case 'inactive':
            return <Tag color="red">Inactive</Tag>;
          default: return <Tag color="default">{status}</Tag>;
        }
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
      dataIndex: '_id',
      render: (id: string) => (
        <DropdownAction
          menuOptions={[
            {
              key: 'update',
              label: 'Update',
              href: {
                pathname: '/banner/update',
                query: { id }
              },
              icon: <EditOutlined />
            },
            {
              key: 'delete',
              label: 'Delete',
              onClick: deleteBanner.bind(this, id),
              icon: <DeleteOutlined />
            }
          ]}
        />
      )
    }
  ];
  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey={rowKey}
      loading={loading}
      pagination={pagination}
      onChange={onChange.bind(this)}
    />
  );
}

export default TableListBanner;

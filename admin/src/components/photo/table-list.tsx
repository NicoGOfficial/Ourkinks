import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { DropdownAction } from '@components/common/dropdown-action';
import { ThumbnailPhoto } from '@components/photo/thumbnail-photo';
import { formatDate } from '@lib/date';
import { Table } from 'antd';

type IProps = {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  deletePhoto?: Function;
}

export function TableListPhoto({
  deletePhoto = () => { }, dataSource, rowKey, loading, pagination, onChange
}: IProps) {
  const columns = [
    {
      title: '#',
      dataIndex: 'thumbnail',
      render(data, record) {
        return <ThumbnailPhoto photo={record} />;
      }
    },
    {
      title: 'Title',
      dataIndex: 'title'
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'status',
    //   render(status: string) {
    //     switch (status) {
    //       case 'active':
    //         return <Tag color="green">Active</Tag>;
    //       case 'inactive':
    //         return <Tag color="red">Inactive</Tag>;
    //       default: return <Tag color="default">{status}</Tag>;
    //     }
    //   }
    // },
    {
      title: 'Gallery',
      dataIndex: 'gallery',
      render(data, record) {
        return <span>{record?.gallery?.name || 'N/A'}</span>;
      }
    },
    {
      title: 'Model',
      dataIndex: 'performer',
      render(data, record) {
        return <span>{record?.performer?.name || record?.performer?.username || 'N/A'}</span>;
      }
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
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
                pathname: '/photos/update',
                query: { id }
              },
              icon: <EditOutlined />
            },
            {
              key: 'delete',
              label: 'Delete',
              onClick: deletePhoto.bind(this, id),
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

export default TableListPhoto;

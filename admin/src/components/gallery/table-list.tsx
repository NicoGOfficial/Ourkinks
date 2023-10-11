import {
  DeleteOutlined, EditOutlined, EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { DropdownAction } from '@components/common/dropdown-action';
import { CoverGallery } from '@components/gallery/cover-gallery';
import { formatDate } from '@lib/date';
import { Table, Tag } from 'antd';

type IProps = {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  deleteGallery?: Function;
}

export function TableListGallery({
  deleteGallery = () => { }, dataSource, rowKey, loading, pagination, onChange
}: IProps) {
  const columns = [
    {
      title: '',
      render(data, record) {
        return <CoverGallery gallery={record} />;
      }
    },
    {
      title: 'Name',
      dataIndex: 'name'
    },
    {
      title: 'Model',
      dataIndex: 'performer',
      render(data, record) {
        return <span>{record?.performer?.name || record?.performer?.username || 'N/A'}</span>;
      }
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
      render: (data, record) => (
        <DropdownAction
          menuOptions={[
            {
              key: 'view-photos',
              label: 'View photo',
              href: {
                pathname: '/photos',
                query: {
                  galleryId: record._id,
                  performerId: record.performerId
                }
              },
              icon: <EyeOutlined />
            },
            {
              key: 'add-photos',
              label: 'Add photos',
              href: {
                pathname: '/photos/bulk-upload',
                query: {
                  galleryId: record._id,
                  performerId: record.performerId
                }
              },
              icon: <PlusOutlined />
            },
            {
              key: 'update',
              label: 'Update',
              href: {
                pathname: '/gallery/update',
                query: { id: record._id }
              },
              icon: <EditOutlined />
            },
            {
              key: 'delete',
              label: 'Delete',
              onClick: deleteGallery.bind(this, record._id),
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

export default TableListGallery;

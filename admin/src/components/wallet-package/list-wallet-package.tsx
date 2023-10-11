import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { DropdownAction } from '@components/common/dropdown-action';
import { Table, Tag } from 'antd';
import { IToken } from 'src/interfaces/wallet-package';

interface IProps {
  dataSource: IToken[];
  pagination: {};
  rowKey: string;
  onChange(): Function;
  loading: boolean;
  deleteToken: Function;
}

export function TableListToken({
  dataSource, pagination, rowKey, onChange, loading, deleteToken
}: IProps) {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render(price) {
        return (
          <span>
            $
            {price}
          </span>
        );
      }
    },
    {
      title: 'Amount added to Wallet',
      dataIndex: 'token'
    },
    {
      title: 'Ordering',
      dataIndex: 'ordering'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render(status: string) {
        if (status === 'active') {
          return <Tag color="green">Active</Tag>;
        }
        return <Tag color="red">Inactived</Tag>;
      }
    },
    {
      title: 'Actions',
      dataIndex: '_id',
      render: (id: string) => (
        <DropdownAction
          menuOptions={[
            {
              key: 'update',
              label: 'Update',
              href: {
                pathname: '/wallet-package/update',
                query: { id }
              },
              icon: <EditOutlined />
            },
            {
              key: 'delete',
              label: 'Delete',
              onClick: () => deleteToken && deleteToken(id),
              icon: <DeleteOutlined />
            }
          ]}
        />
      )
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

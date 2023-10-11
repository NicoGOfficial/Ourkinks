import { DeleteOutlined, EditOutlined, TranslationOutlined } from '@ant-design/icons';
import { DropdownAction } from '@components/common/dropdown-action';
import { formatDate } from '@lib/date';
import { Table } from 'antd';

type IProps = {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  deleteMenu?: Function;
}

export function TableListMenu({
  deleteMenu = () => { }, dataSource, rowKey, loading, pagination, onChange
}: IProps) {
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title'
    },
    {
      title: 'Path',
      dataIndex: 'path'
    },
    {
      title: 'Ordering',
      dataIndex: 'ordering',
      sorter: true
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
              key: 'update',
              label: 'Update',
              href: {
                pathname: '/menu/update',
                query: { id: record._id }
              },
              icon: <EditOutlined />
            },
            {
              key: 'delete',
              label: 'Delete',
              onClick: deleteMenu.bind(this, record._id),
              icon: <DeleteOutlined />
            },
            {
              key: 'translate',
              label: 'Translate',
              href: {
                pathname: '/menu/translation',
                query: { id: record._id }
              },
              icon: <TranslationOutlined />
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

export default TableListMenu;

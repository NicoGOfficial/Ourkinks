import { Table, Tag } from 'antd';
import { IPaymentToken } from 'src/interfaces';

interface IProps {
    dataSource: IPaymentToken[];
    pagination: {};
    rowKey: string;
    onChange(): Function;
    loading: boolean;
}

function TableListPaymentToken({
  dataSource, pagination, rowKey, onChange, loading
}: IProps) {
  const columns = [
    {
      title: 'User',
      key: 'user',
      dataIndex: 'sourceInfo',
      render: (sourceInfo) => sourceInfo && sourceInfo.name
    },
    {
      title: 'Performer',
      key: 'performer',
      dataIndex: 'targetInfo',
      render: (targetInfo) => targetInfo && targetInfo.name
    },
    {
      title: 'Tokens',
      dataIndex: 'totalPrice',
      render: (totalPrice) => totalPrice && totalPrice.toFixed(2)
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render(type: string) {
        if (type === 'stream_private') {
          return <Tag color="cyan">Private Stream</Tag>;
        }
        if (type === 'stream_group') {
          return <Tag color="lime">Group Stream</Tag>;
        }
        if (type === 'tip') {
          return <Tag color="green">Tip</Tag>;
        }
        return <Tag color="red">{type}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render(status: string) {
        if (status === 'success') {
          return <Tag color="success">Success</Tag>;
        }

        return <Tag color="warning">{status}</Tag>;
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

export default TableListPaymentToken;

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { ImageProduct } from '@components/product/image-product';
import { formatDate } from '@lib/date';
import { Button, Table, Tag } from 'antd';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

type IProps = {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  deleteProduct?: Function;
}

export function TableListProduct({
  dataSource,
  rowKey,
  loading,
  pagination,
  onChange,
  deleteProduct = () => {}
}: IProps) {
  const { t } = useTranslation();
  const columns = [
    {
      title: '',
      dataIndex: 'image',
      render(data, record) {
        return <ImageProduct product={record} />;
      }
    },
    {
      title: t('common:labelName'),
      dataIndex: 'name',
      render(name: string, record) {
        return <Link href={{ pathname: '/store/details', query: { id: record?.slug || record?._id } }} as={`/store/${record?.slug || record?._id}`}><a>{name}</a></Link>;
      }
    },
    {
      title: t('common:price'),
      dataIndex: 'price',
      render(price: number) {
        return (
          <span>
            $
            {price.toFixed(2)}
          </span>
        );
      }
    },
    {
      title: t('common:stock'),
      dataIndex: 'stock',
      render(stock: number, record) {
        return <span>{record.type === 'physical' ? stock : ''}</span>;
      }
    },
    {
      title: t('common:type'),
      dataIndex: 'type',
      render(type: string) {
        switch (type) {
          case 'physical':
            return <Tag color="blue">{t('common:physical')}</Tag>;
          case 'digital':
            return <Tag color="orange">{t('common:digital')}</Tag>;
          default:
            break;
        }
        return <Tag color="">{type}</Tag>;
      }
    },
    {
      title: t('common:labelStatus'),
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'active':
            return <Tag color="green">{t('common:active')}</Tag>;
          case 'inactive':
            return <Tag color="orange">{t('common:inactive')}</Tag>;
          default:
            break;
        }
        return <Tag color="default">{status}</Tag>;
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
        <>
          <Button className="info">
            <Link
              href={{
                pathname: '/model/my-store/update',
                query: { id }
              }}
              as={`/model/my-store/update?id=${id}`}
            >
              <a>
                <EditOutlined />
              </a>
            </Link>
          </Button>
          <Button
            className="danger"
            onClick={deleteProduct && deleteProduct.bind(this, id)}
          >
            <DeleteOutlined />
          </Button>
        </>
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

export default TableListProduct;

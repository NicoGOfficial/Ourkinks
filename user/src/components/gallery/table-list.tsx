import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { CoverGallery } from '@components/gallery/cover-gallery';
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
  deleteGallery?: Function;
}

export function TableListGallery({
  dataSource,
  rowKey,
  loading,
  pagination,
  onChange,
  deleteGallery = () => {}
}: IProps) {
  const { t } = useTranslation();
  const columns = [
    {
      title: '#',
      render(data) {
        return <CoverGallery gallery={data} />;
      }
    },
    {
      title: t('common:labelName'),
      dataIndex: 'name'
    },
    {
      title: t('common:totalPhoto'),
      dataIndex: 'numOfItems'
    },
    {
      title: t('common:labelStatus'),
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'active':
            return <Tag color="green">{t('common:active')}</Tag>;
          case 'inactive':
            return <Tag color="default">{t('common:inactive')}</Tag>;
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
      render: (data, record) => (
        <div>
          <Button className="info">
            <Link
              href={{
                pathname: '/model/my-gallery/update',
                query: { id: record._id }
              }}
            >
              <a>
                <EditOutlined />
                {' '}
                {t('common:edit')}
              </a>
            </Link>
          </Button>
          <Button
            onClick={() => deleteGallery && deleteGallery(record._id)}
            className="danger"
          >
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

export default TableListGallery;

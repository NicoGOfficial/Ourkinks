import { DeleteOutlined } from '@ant-design/icons';
import Price from '@components/price';
import { ImageProduct } from '@components/product/image-product';
import {
  Button, InputNumber, message,
  Table
} from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useRef } from 'react';
import { IProduct } from 'src/interfaces';

type IProps = {
  dataSource: IProduct[];
  rowKey: string;
  loading?: boolean;
  onChangeQuantity?: Function;
  onRemoveItemCart?: Function;
}

export function TableCart({
  dataSource,
  rowKey,
  loading = false,
  onRemoveItemCart = () => {},
  onChangeQuantity = () => {}
}: IProps) {
  const timeout = useRef(null);
  const { t } = useTranslation();

  const changeQuantity = async (item, quantity: any) => {
    if (!quantity) return;
    try {
      if (timeout.current) clearTimeout(timeout.current);
      let remainQuantity = quantity;
      timeout.current = window.setTimeout(async () => {
        if (quantity > item.stock) {
          remainQuantity = item.stock;
          message.error(t('common:errQuantityTooLarge'));
        }
        onChangeQuantity(item, remainQuantity);
      }, 300);
    } catch (error) {
      message.error(t('common:errCommon'));
    }
  };
  const columns = [
    {
      title: '#',
      render(record) {
        return (<ImageProduct product={record} />);
      }
    },
    {
      title: t('common:labelName'),
      dataIndex: 'name',
      render(name) {
        return (
          <div style={{
            textTransform: 'capitalize', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}
          >
            {name}
          </div>
        );
      }
    },
    {
      title: t('common:price'),
      dataIndex: 'price',
      render(price: number) {
        return (
          <Price amount={price} />
        );
      }
    },
    // {
    //   title: 'Type',
    //   dataIndex: 'type',
    //   render(type: string) {
    //     switch (type) {
    //       case 'digital':
    //         return <Tag color="orange">Digital</Tag>;
    //       case 'physical':
    //         return <Tag color="blue">Physical</Tag>;
    //       default:
    //         break;
    //     }
    //     return <Tag color="default">{type}</Tag>;
    //   }
    // },
    {
      title: t('common:quantity'),
      dataIndex: 'quantity',
      render(data, record) {
        return (
          <InputNumber
            disabled={record.type === 'digital'}
            value={record.quantity || 1}
            onChange={(value) => changeQuantity(record, value)}
            type="number"
            min={1}
            max={record.stock}
          />
        );
      }
    },
    {
      title: t('common:actions'),
      dataIndex: '',
      render(data, record) {
        return (
          <Button className="danger" onClick={() => onRemoveItemCart(record)}>
            <DeleteOutlined />
          </Button>
        );
      }
    }
  ];

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  return (
    <div className="table-responsive table-cart">
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={rowKey}
        loading={loading}
        pagination={false}
      />
    </div>
  );
}

export default TableCart;

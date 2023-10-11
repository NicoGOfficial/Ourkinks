import {
  Button, Col, DatePicker,
  Row, Select
} from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

type IProps = {
  onSubmit?: Function;
}

const { RangePicker } = DatePicker;

export function OrderSearchFilter({
  onSubmit = () => {}
}: IProps) {
  const [filter, setFilter] = useState({
    productType: '',
    deliveryStatus: '',
    paymentStatus: '',
    fromDate: '',
    toDate: ''
  });
  const { t } = useTranslation();

  const productTypes = [
    {
      key: '',
      text: t('common:productType')
    },
    {
      key: 'physical',
      text: t('common:physicalProduct')
    },
    {
      key: 'digital',
      text: t('common:digitalProduct')
    }
  ];
  const deliveryStatuses = [
    {
      key: '',
      text: t('common:deliveryStatus')
    },
    {
      key: 'created',
      text: t('common:created')
    },
    {
      key: 'processing',
      text: t('common:processing')
    },
    {
      key: 'cancelled',
      text: t('common:cancelled')
    },
    {
      key: 'shipped',
      text: t('common:shipped')
    },
    {
      key: 'delivered',
      text: t('common:delivered')
    }
  ];

  return (
    <Row gutter={24}>
      <Col xl={4} md={6} xs={12}>
        <Select
          onChange={(val) => setFilter({ ...filter, productType: val })}
          style={{ width: '100%' }}
          placeholder={t('common:selectProductType')}
          defaultValue=""
        >
          {productTypes.map((s) => (
            <Select.Option key={s.key} value={s.key}>
              {s.text || s.key}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col xl={4} md={6} xs={12}>
        <Select
          onChange={(val) => setFilter({ ...filter, deliveryStatus: val })}
          style={{ width: '100%' }}
          placeholder={t('common:selectDeliveryStatus')}
          defaultValue=""
        >
          {deliveryStatuses.map((s) => (
            <Select.Option key={s.key} value={s.key}>
              {s.text || s.key}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col xl={6} md={8} xs={12}>
        <RangePicker
          style={{ width: '100%' }}
          onChange={(dates: [any, any], dateStrings: [string, string]) => setFilter({
            ...filter,
            fromDate: dateStrings[0],
            toDate: dateStrings[1]
          })}
        />
      </Col>
      <Col xl={4} md={6} xs={6}>
        <Button type="primary" onClick={() => onSubmit(filter)}>
          {t('common:search')}
        </Button>
      </Col>
    </Row>
  );
}

export default OrderSearchFilter;

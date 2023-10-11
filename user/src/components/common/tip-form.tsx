import {
  Button,
  Col, Form, Input, InputNumber, Row
} from 'antd';
import useTranslation from 'next-translate/useTranslation';
import React, { useEffect } from 'react';

const { Item } = Form;
const formLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

interface IProps {
  loading?: boolean;
  submit: () => void;
  price?: number;
}

function TipForm({
  loading = false, submit, price = 0
}: IProps) {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  useEffect(() => {
    if (price) {
      form.setFieldsValue({
        amount: price
      });
    }
  }, [price]);

  return (
    <Form
      {...formLayout}
      layout="vertical"
      form={form}
      initialValues={{
        amount: price,
        description: ''
      }}
      onFinish={submit}
      className="tip-form"
    >
      <Row>
        <Col span={24}>
          <Item name="amount" label={t('common:amount')}>
            <InputNumber
              placeholder="Amount"
              min={0}
              style={{ width: '100%' }}
              disabled={!!price}
            />
          </Item>
        </Col>
        <Col span={24}>
          <Item name="description" label={t('common:message')}>
            <Input.TextArea
              placeholder="Message to creator"
              rows={5}
              style={{ width: '100%' }}
            />
          </Item>
        </Col>
        <Col span={24} style={{ textAlign: 'right' }}>
          <Button htmlType="submit" type="primary" disabled={loading}>{t('common:tip')}</Button>
        </Col>
      </Row>
    </Form>
  );
}
export default TipForm;

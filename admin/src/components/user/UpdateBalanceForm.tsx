import { Button, Form, InputNumber } from 'antd';
import React from 'react';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
};

interface Iprops {
  onFinish : Function,
  balance: number,
  updating: boolean
}

export function UpdateBalanceForm({ onFinish, balance, updating = false }: Iprops) {
  return (
    <Form
      name="nest-messages"
      onFinish={onFinish.bind(this)}
      {...layout}
      initialValues={{
        balance
      }}
    >
      <Form.Item
        name="balance"
        label="Balance"
        rules={[
          { required: true, message: 'Enter balance you want to update!' }
        ]}
      >
        <InputNumber />
      </Form.Item>
      <Form.Item className="text-center">
        <Button type="primary" htmlType="submit" loading={updating}>
          Update
        </Button>
      </Form.Item>
    </Form>
  );
}

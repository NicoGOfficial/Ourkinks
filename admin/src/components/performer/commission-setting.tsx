import {
  Button, Form, InputNumber,
  message
} from 'antd';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!'
};

const dataSource = [
  { name: 'monthlySubscriptionCommission', label: 'Monthly Subscription' },
  { name: 'yearlySubscriptionCommission', label: 'Yearly Subscription' },
  { name: 'videoSaleCommission', label: 'Video sale commission' },
  { name: 'productSaleCommission', label: 'Product sale commission' },
  { name: 'privateChatCommission', label: 'Private chat commission' },
  { name: 'tokenTipCommission', label: 'Wallet tip  commission' },
  { name: 'feedSaleCommission', label: 'Feed sale  commission' }
];

type IProps = {
  onFinish: Function;
  commissionSetting?: any;
  submiting?: boolean;
}

export function CommissionSettingForm({ commissionSetting = null, onFinish, submiting = false }: IProps) {
  return (
    <Form
      {...layout}
      layout="vertical"
      name="form-performer"
      onFinish={onFinish.bind(this)}
      onFinishFailed={() => message.error('Please complete the required fields.')}
      validateMessages={validateMessages}
      initialValues={commissionSetting}
    >
      {dataSource.map((data) => (
        <Form.Item name={data.name} label={data.label} initialValue={0.01}>
          <InputNumber min={0.01} max={0.99} style={{ width: '100%' }} step={0.01} />
        </Form.Item>
      ))}
      <Form.Item wrapperCol={{ ...layout.wrapperCol }}>
        <Button type="primary" htmlType="submit" disabled={submiting} loading={submiting}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

export default CommissionSettingForm;

import {
  Button, Col,
  Form, InputNumber, Row
} from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { IPerformer } from 'src/interfaces';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

type IProps = {
  onFinish: Function;
  user: IPerformer;
  updating?: boolean;
}

export function PerformerSubscriptionForm({
  onFinish,
  user,
  updating = false
}: IProps) {
  const { t } = useTranslation();

  const validateMessages = {
    required: t('common:errFieldRequired'),
    types: {
      email: t('common:notValidEmail'),
      number: t('common:notValidNumber')
    },
    number: {
      // eslint-disable-next-line no-template-curly-in-string
      range: 'Must be between ${min} and ${max}'
    }
  };

  return (
    <Form
      {...layout}
      name="nest-messages"
      onFinish={onFinish.bind(this)}
      validateMessages={validateMessages}
      initialValues={user}
      labelAlign="left"
      className="account-form"
    >
      <Row>
        <Col xl={12} md={12} xs={12}>
          <Form.Item
            name="monthlyPrice"
            label={t('common:monthlyPrice')}
            rules={[{ required: true, message: t('common:enterMonthlySubPrice') }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xl={12} md={12} xs={12}>
          <Form.Item
            name="yearlyPrice"
            label={t('common:yearlyPrice')}
            rules={[{ required: true, message: t('common:enterYeaerlySubPrice') }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item className="text-center">
        <Button
          className="primary"
          type="primary"
          htmlType="submit"
          loading={updating}
          disabled={updating}
        >
          {t('common:saveChanges')}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default PerformerSubscriptionForm;

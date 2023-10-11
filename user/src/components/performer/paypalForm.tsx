import {
  Button, Form, Input
} from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { IPerformer } from 'src/interfaces';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a validate email!',
    number: 'Not a validate number!'
  }
};

type IProps = {
  onFinish: Function;
  user: IPerformer;
  updating?: boolean;
}

export function PerformerPaypalForm({
  onFinish, user, updating = false
}: IProps) {
  const { t } = useTranslation();
  return (
    <Form
      {...layout}
      name="nest-messages"
      onFinish={onFinish.bind(this)}
      validateMessages={validateMessages}
      initialValues={user?.paypalSetting?.value || {
        email: '',
        phoneNumber: ''
      }}
      labelAlign="left"
      className="account-form"
    >
      <h4 className="text-center">{t('common:topTextPaypal')}</h4>
      <Form.Item
        name="email"
        label={t('common:emailPaypal')}
        validateTrigger={['onChange', 'onBlur']}
        rules={[{ required: true }, { type: 'email' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item className="text-center">
        <Button className="primary" type="primary" htmlType="submit" disabled={updating} loading={updating}>
          {t('common:saveChanges')}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default PerformerPaypalForm;

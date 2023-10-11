import {
  Button, Col,
  Form, Input, Row
} from 'antd';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

type IProps = {
  onFinish: Function;
  updating: boolean;
}

export function UpdatePaswordForm({ onFinish, updating = false }: IProps) {
  const { t } = useTranslation();
  return (
    <Form
      name="nest-messages"
      className="account-form"
      onFinish={onFinish.bind(this)}
      {...layout}
    >
      <Row>
        <Col md={12} xs={24}>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                pattern: /^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[^\w\d]).*$/g,
                message: t('common:errPassword')
              }, {
                required: true,
                message: t('common:enterYourNewPW')
              }
            ]}
          >
            <Input
              type="password"
              placeholder={t('common:enterYourNewPW')}
            />
          </Form.Item>
        </Col>
        <Col md={12} xs={24}>
          <Form.Item
            name="confirm"
            label={t('common:confirmPassword')}
            validateTrigger={['onChange', 'onBlur']}
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: t('common:errConfirmPassword')
              },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  // eslint-disable-next-line prefer-promise-reject-errors
                  return Promise.reject(t('common:errPasswordNotMatch'));
                }
              })
            ]}
          >
            <Input type="password" placeholder={t('common:reEnterPw')} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item className="text-center">
        <Button className="primary" htmlType="submit" disabled={updating} loading={updating}>
          {t('common:saveChanges')}
        </Button>
      </Form.Item>
    </Form>
  );
}

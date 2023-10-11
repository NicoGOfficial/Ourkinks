/* eslint-disable no-template-curly-in-string */
import {
  Button, Col, Form, Row, Select
} from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { ICountry } from 'src/interfaces';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

type IProps = {
  onFinish: Function;
  blockCountries: any;
  updating: boolean;
  countries: ICountry[];
}

const { Option } = Select;

export default function PerformerBlockCountriesForm({
  onFinish, blockCountries, updating, countries
}: IProps) {
  const { t } = useTranslation();

  const validateMessages = {
    required: t('common:errFieldRequired'),
    types: {
      email: t('common:notValidEmail'),
      number: t('common:notValidNumber')
    }
  };

  return (
    <Form
      {...layout}
      name="nest-messages"
      onFinish={onFinish.bind(this)}
      validateMessages={validateMessages}
      initialValues={blockCountries}
      labelAlign="left"
      className="account-form"
    >
      <Row>
        <Col span={24}>
          <Form.Item name="countryCodes" label={t('common:selectCountriesToBlock')}>
            <Select
              showSearch
              optionFilterProp="label"
              mode="multiple"
            >
              {countries
                && countries.length > 0
                && countries.map((c) => (
                  <Option value={c.code} label={c.name} key={c.code}>
                    <img alt="country_flag" src={c.flag} width="25px" />
                    {' '}
                    {c.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item className="text-center">
        <Button type="primary" htmlType="submit" className="primary" disabled={updating} loading={updating}>
          {t('common:saveChanges')}
        </Button>
      </Form.Item>
    </Form>
  );
}

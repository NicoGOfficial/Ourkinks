import {
  Button, Col, Form, Input, Row, Select
} from 'antd';
import withTranslation from 'next-translate/withTranslation';
import { createRef, PureComponent } from 'react';
import { ICountry, IPerformer } from 'src/interfaces';
import { utilsService } from 'src/services';

const { Option } = Select;
const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

type IProps = {
  onFinish: Function;
  user: IPerformer;
  updating?: boolean;
  countries?: ICountry[];
  i18n: any;
}

class PerformerBankingForm extends PureComponent<IProps> {
  state = {
    states: [],
    cities: []
  };

  formRef: any;

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    updating: false,
    countries: []
  };

  componentDidMount() {
    const { user } = this.props;
    if (user?.bankingInformation?.country) {
      this.handleGetStates(user?.bankingInformation?.country);
      if (user?.bankingInformation?.state) {
        this.handleGetCities(user?.bankingInformation?.state, user?.bankingInformation?.country);
      }
    }
  }

  handleGetStates = async (countryCode: string) => {
    const { user } = this.props;
    const resp = await utilsService.statesList(countryCode);
    await this.setState({ states: resp.data });
    const eState = resp.data.find((s) => s === user?.bankingInformation?.state);
    if (eState) {
      this.formRef.setFieldsValue({ state: eState });
    } else {
      this.formRef.setFieldsValue({ state: '', city: '' });
    }
  };

  handleGetCities = async (state: string, countryCode: string) => {
    const { user } = this.props;
    const resp = await utilsService.citiesList(countryCode, state);
    await this.setState({ cities: resp.data });
    const eCity = resp.data.find((s) => s === user?.bankingInformation?.city);
    if (eCity) {
      this.formRef.setFieldsValue({ city: eCity });
    } else {
      this.formRef.setFieldsValue({ city: '' });
    }
  };

  render() {
    const { t } = this.props.i18n;
    if (!this.formRef) this.formRef = createRef();
    const {
      onFinish, user, updating, countries
    } = this.props;
    const { states, cities } = this.state;

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
        initialValues={user.bankingInformation}
        labelAlign="left"
        className="account-form"
        ref={(ref) => { this.formRef = ref; }}
      >
        <h4 className="text-center">{t('common:topTextBanking')}</h4>
        <Row>
          <Col xl={12} md={12} xs={12}>
            <Form.Item
              label={t('common:firstName')}
              name="firstName"
              rules={[
                { required: true, message: t('common:errRequireFirstName') }
              ]}
            >
              <Input placeholder={t('common:firstName')} />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item
              name="lastName"
              label={t('common:lastName')}
              rules={[
                { required: true, message: t('common:errRequireLastName') }
              ]}
            >
              <Input placeholder={t('common:lastName')} />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item
              name="bankName"
              label={t('common:bankName')}
              rules={[
                { required: true, message: t('common:enterBankName') }
              ]}
            >
              <Input placeholder={t('common:bankName')} />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item
              name="bankAccount"
              label={t('common:bankAccount')}
              rules={[
                { required: true, message: t('common:enterBankAccount') }
              ]}
            >
              <Input placeholder={t('common:bankAccount')} />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item
              name="country"
              label={t('common:country')}
              rules={[{ required: true, message: t('common:selectCountry') }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                onChange={(val: string) => this.handleGetStates(val)}
              >
                {countries.map((c) => (
                  <Option key={c.code} value={c.code} label={c.name}>
                    <img alt="flag" src={c?.flag} width="20px" />
                    {' '}
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item name="state" label={t('common:state')}>
              <Select
                placeholder={t('common:selectState')}
                optionFilterProp="label"
                showSearch
                onChange={(val: string) => this.handleGetCities(val, this.formRef.getFieldValue('country'))}
              >
                {states.map((state) => (
                  <Option value={state} label={state} key={state}>
                    {state}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item
              name="city"
              label={t('common:city')}
            >
              <Select
                placeholder={t('common:selectCity')}
                showSearch
                optionFilterProp="label"
              >
                {cities.map((city) => (
                  <Option value={city} label={city} key={city}>
                    {city}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item name="address" label={t('common:address')}>
              <Input placeholder={t('common:address')} />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item name="bankRouting" label={t('common:bankRouting')}>
              <Input placeholder={t('common:bankRouting')} />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item name="bankSwiftCode" label={t('common:bankSwiftCode')}>
              <Input placeholder={t('common:bankSwiftCode')} />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={12}>
            <Form.Item name="SSN" label={t('common:ssn')}>
              <Input placeholder={t('common:ssn')} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item className="text-center">
          <Button
            className="primary"
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
}

export default withTranslation(PerformerBankingForm);

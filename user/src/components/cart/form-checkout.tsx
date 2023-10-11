import {
  CodeOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  TagOutlined
} from '@ant-design/icons';
import {
  Button, Col, Divider,
  Form, Input, Radio, Row, Space
} from 'antd';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  ICoupon, IProduct, ISettings, IUser
} from 'src/interfaces/index';

import style from './form-checkout.module.less';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

type IProps = {
  settings: ISettings;
  onFinish: Function;
  submiting: boolean;
  products: IProduct[];
  coupon: ICoupon;
  isApplyCoupon: boolean;
  onApplyCoupon: Function;
  user: IUser;
  i18n: any;
}

const calTotal = (items, couponValue?: number) => {
  let total = 0;
  items?.length
    && items.forEach((item) => {
      total += (item.quantity || 1) * item.price;
    });
  if (couponValue) {
    total -= total * couponValue;
  }
  return total.toFixed(2) || 0;
};

class CheckOutForm extends PureComponent<IProps> {
  state = {
    gateway: 'ccbill',
    couponCode: ''
  };

  componentDidUpdate(prevProps: Readonly<IProps>) {
    const { isApplyCoupon, coupon } = this.props;
    if (
      prevProps.isApplyCoupon
      && prevProps.coupon
      && !isApplyCoupon
      && !coupon
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ couponCode: '' });
    }
  }

  render() {
    const {
      onFinish,
      submiting,
      products,
      coupon,
      isApplyCoupon,
      onApplyCoupon,
      settings,
      user
    } = this.props;
    const { ccbillEnabled, verotelEnabled } = settings;
    const { couponCode, gateway } = this.state;
    const { t } = this.props.i18n;
    let valid = true;
    products.forEach((p) => {
      if (p.type === 'physical') valid = false;
    });
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={(values) => {
          const data = { ...values, paymentGateway: gateway };
          if (coupon && coupon._id) {
            data.couponCode = coupon.code;
          }
          onFinish(data);
        }}
        initialValues={{
          deliveryAddress: '',
          phoneNumber: '',
          postalCode: ''
        }}
        labelAlign="left"
        className="account-form"
      >
        <Row className={style['cart-form']}>
          {!valid && (
            <>
              <Col span={12}>
                <Form.Item
                  label={(
                    <>
                      <EnvironmentOutlined />
                      &nbsp;
                      {' '}
                      {t('common:deliveryAddress')}
                    </>
                  )}
                  name="deliveryAddress"
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      required: true,
                      message: t('common:errDeliveryAddressRequire')
                    }
                  ]}
                >
                  <Input placeholder={t('common:deliveryAddressPlaceholder')} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={(
                    <>
                      <PhoneOutlined />
                      &nbsp;
                      {' '}
                      {t('common:phone')}
                    </>
                  )}
                  name="phoneNumber"
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      required: true,
                      message: t('common:errRequirePhoneNumberRequire')
                    },
                    {
                      pattern: /^([+]\d{2,4})?\d{9,12}$/g,
                      message: t('common:errValidNumber')
                    }
                  ]}
                >
                  <Input placeholder={t('common:phoneNumberPlaceholder')} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={(
                    <>
                      <TagOutlined />
                      &nbsp;
                      {' '}
                      {t('common:postalCode')}
                    </>
                  )}
                  name="postalCode"
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      required: true,
                      message: t('common:errPostalCodeRequire')
                    },
                    {
                      pattern: /^\d{2,10}$/g,
                      message: t('common:errValidNumber')
                    }
                  ]}
                >
                  <Input placeholder={t('common:postalCodePlaceholder')} />
                </Form.Item>
              </Col>
            </>
          )}
          <Col span={valid ? 24 : 12}>
            <Form.Item
              name="couponCode"
              label={(
                <>
                  <CodeOutlined />
                  &nbsp;
                  {' '}
                  {t('common:coupon')}
                </>
              )}
            >
              <Input.Group style={{ display: 'flex' }}>
                <Input
                  onChange={(e) => this.setState({ couponCode: e.target.value })}
                  placeholder={t('common:couponPlaceholder')}
                  disabled={isApplyCoupon}
                  value={couponCode}
                />
                <Button
                  disabled={!couponCode || submiting}
                  className={isApplyCoupon ? 'success' : 'secondary'}
                  onClick={() => onApplyCoupon(couponCode)}
                >
                  <strong>
                    {!isApplyCoupon ? t('common:coupon') : t('common:removeCommon')}
                  </strong>
                </Button>
              </Input.Group>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Space className="initial-price">
              <strong style={{ fontSize: '20px' }}>
                {t('common:totalPrice')}
                :
              </strong>
              <span className={isApplyCoupon ? 'discount-price' : ''}>
                $
                {calTotal(products)}
              </span>
              {isApplyCoupon && coupon && (
                <span>
                  $
                  {calTotal(products, coupon.value)}
                </span>
              )}
            </Space>
          </Col>
          <Col span={24}>
            <div
              style={{ margin: '5px 0 10px' }}
              className="payment-radio__wrapper"
            >
              <div className="payment-gateway">
                <h4>{t('common:paymentGateway')}</h4>
                <Divider />
                <Radio.Group
                  onChange={(e) => this.setState({ gateway: e.target.value })}
                  value={gateway}
                >
                  {ccbillEnabled && (
                    <Radio value="ccbill">
                      <img src="/ccbill-ico.png" height="30px" alt="ccbill" />
                    </Radio>
                  )}
                  {verotelEnabled && (
                    <Radio value="verotel">
                      <img src="/verotel-ico.png" height="30px" alt="verotel" />
                    </Radio>
                  )}
                </Radio.Group>
              </div>
              <div className="payment-wallet">
                <h4>{t('common:wallet')}</h4>
                <Divider />
                <Radio.Group
                  onChange={(e) => this.setState({ gateway: e.target.value })}
                  value={gateway}
                >
                  <Radio value="wallet" className="radio-wallet">
                    <div className="radio-wallet__wrapper">
                      <img
                        src="/loading-wallet-icon.png"
                        height="25px"
                        alt="wallet"
                      />
                      <p className="text">
                        {t('common:wallet')}
                        {' '}
                        (
                        {user.balance.toFixed(2)}
                        )
                      </p>
                    </div>
                  </Radio>
                </Radio.Group>
              </div>
              {!ccbillEnabled && !verotelEnabled && (
                <p>
                  {t('common:noPaymentGateway')}
                </p>
              )}
            </div>
            <Space>
              <Button
                className="primary"
                htmlType="submit"
                disabled={submiting || (!ccbillEnabled && !verotelEnabled)}
                loading={submiting}
              >
                <strong>{t('common:checkout')}</strong>
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    );
  }
}

const mapStates = (state: any) => {
  const { commentMapping, comment } = state.comment;
  return {
    user: { ...state.user.current },
    ui: { ...state.ui },
    relatedVideos: { ...state.video.relatedVideos },
    commentMapping,
    comment
  };
};

export default connect(mapStates)(
  withTranslation(CheckOutForm)
);

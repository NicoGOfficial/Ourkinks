import SeoMetaHead from '@components/common/seo-meta-head';
import { ImageUpload } from '@components/file';
import { loginSuccess, registerPerformer } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import {
  Button, Col, Form, Input, Layout, message,
  Row, Select
} from 'antd';
import Link from 'next/link';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { ICountry } from 'src/interfaces';
import { authService, userService, utilsService } from 'src/services';

import loginStyle from './login.module.less';
import style from './model-register.module.less';

const { Option } = Select;

type IProps = {
  registerPerformerData: any;
  registerPerformerHandler: Function;
  countries: ICountry[];
  handleLoginSuccess: Function;
  handleUpdateCurrentUser: Function;
}

let idVerificationFile = null;

let documentVerificationFile = null;

function RegisterPerformer({
  registerPerformerData, registerPerformerHandler, countries = [], handleLoginSuccess, handleUpdateCurrentUser
}: IProps) {
  const { t } = useTranslation();
  const onFileReaded = (type, file: File) => {
    if (file && type === 'idFile') {
      idVerificationFile = file;
    }
    if (file && type === 'documentFile') {
      documentVerificationFile = file;
    }
  };

  const register = (values: any) => {
    const data = { ...values };
    if (!idVerificationFile || !documentVerificationFile) {
      return message.error(t('common:errRequireIDPhoto'), 5);
    }
    data.idVerificationFile = idVerificationFile;
    data.documentVerificationFile = documentVerificationFile;
    const refCode = localStorage.getItem('refCode');
    if (typeof refCode === 'string' && refCode !== '') {
      return registerPerformerHandler({ ...data, refCode });
    }
    return registerPerformerHandler(data);
  };

  const loadUser = async () => {
    const token = authService.getToken();
    if (!token || token === 'null') {
      return;
    }
    authService.setToken(token);
    try {
      const user = await userService.me({
        Authorization: token
      });
      if (!user.data._id) {
        return;
      }
      handleLoginSuccess();
      handleUpdateCurrentUser(user.data);
      if (user.data.isPerformer) {
        Router.push(`/model/${user.data.username}`);
      } else {
        Router.push('/');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(await e);
    }
  };

  useEffect(() => {
    const siteUrl = document.location.search;
    if (siteUrl.indexOf('ref=') !== -1) {
      const refCode = siteUrl.slice(siteUrl.indexOf('ref=') + 4);
      localStorage.setItem('refCode', refCode);
    }
    loadUser();
  }, []);

  return (
    <Layout>
      <SeoMetaHead item={{
        title: t('common:titelModelRegister')
      }}
      />
      <div className="main-container">
        <div className={`${loginStyle['login-box']} ${style['register-box']}`}>
          <div className="text-center">
            <span className="title">{t('common:titelModelRegister')}</span>
          </div>
          <p className="text-center"><small>{t('common:descModelSignUp')}</small></p>
          <Form
            name="member_register"
            initialValues={{
              gender: 'male',
              country: 'US'
              // dateOfBirth: moment().subtract(18, 'year').endOf('day')
            }}
            onFinish={register}
          >
            <Row>
              <Col
                xs={24}
                sm={24}
                md={14}
                lg={14}
              >
                <Row>
                  <Col span={12}>
                    <Form.Item
                      name="firstName"
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        { required: true, message: t('common:errRequireFirstName') },
                        {
                          pattern: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                          message:
                            t('common:errRequireFirstNamePattern')
                        }
                      ]}
                      hasFeedback
                    >
                      <Input placeholder={t('common:firstName')} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="lastName"
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        { required: true, message: t('common:errRequireLastName') },
                        {
                          pattern: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                          message:
                            t('common:errPatternLastName')
                        }
                      ]}
                      hasFeedback
                    >
                      <Input placeholder={t('common:lastName')} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        { required: true, message: t('common:errMissingName') },
                        {
                          pattern: /^(?=.*\S).+$/g,
                          message:
                            t('common:errNameHasWhitespace')
                        },
                        {
                          min: 3,
                          message: t('common:errLimitName')
                        }
                      ]}
                      hasFeedback
                    >
                      <Input placeholder={t('common:displayName')} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="username"
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        { required: true, message: t('common:errRequireUsername') },
                        {
                          pattern: /^[a-z0-9]+$/g,
                          message:
                            t('common:errNameHasLettersAndNumbers')
                        },
                        { min: 3, message: t('common:errMinUsername') }
                      ]}
                      hasFeedback
                    >
                      <Input placeholder={t('common:usernamePlaceholder')} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="email"
                      validateTrigger={['onChange', 'onBlur']}
                      hasFeedback
                      rules={[
                        {
                          type: 'email',
                          message: t('common:errEmailFormat')
                        },
                        {
                          required: true,
                          message: t('common:enterEmail')
                        }
                      ]}
                    >
                      <Input placeholder={t('emailPlaceholder')} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="country" rules={[{ required: true }]} hasFeedback>
                      <Select showSearch optionFilterProp="label">
                        {countries.map((c) => (
                          <Option value={c.code} key={c.code} label={c.name}>
                            <img alt="country_flag" src={c.flag} width="25px" />
                            {' '}
                            {c.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="gender"
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[{ required: true, message: t('common:errSelectGender') }]}
                    >
                      <Select>
                        <Option value="male">{t('common:male')}</Option>
                        <Option value="female">{t('common:female')}</Option>
                        <Option value="transgender">{t('common:transgender')}</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="password"
                      hasFeedback
                      rules={[
                        {
                          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^<>`~\-=\\\\|,.<>\\/;':"\\[\]{}\\#()_+?@$!%*?&])([A-Za-z\d^<>`~\-=\\\\|,.<>\\/;':"\\[\]{}\\#()_+?@$!%*?&]){8,}$/g,
                          message: t('common:errPassword')
                        },
                        { required: true, message: t('common:errRequirePw') }
                      ]}
                    >
                      <Input type="password" placeholder={t('common:inputPassword')} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="confirm"
                      dependencies={['password']}
                      hasFeedback
                      validateTrigger={['onChange', 'onBlur']}
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
                            return Promise.reject(new Error(t('common:errPasswordNotMatch')));
                          }
                        })
                      ]}
                    >
                      <Input type="password" placeholder={t('common:confirmPassword')} />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={10}
                lg={10}
              >
                <div className={`${style['register-form']}`}>
                  <Form.Item
                    name="documentVerificationId"
                    className={`${style['model-photo-verification']}`}
                    help={t('common:documentVerificationId')}
                  >
                    <div className={`${style['id-block']}`}>
                      <ImageUpload onFileReaded={(file) => onFileReaded('documentFile', file)} />
                      <img alt="identity-img" className={`${style['img-id']}`} src="/front-id.png" />
                    </div>
                  </Form.Item>
                  <Form.Item
                    name="idVerificationId"
                    className={`${style['model-photo-verification']}`}
                    help={t('common:idVerificationId')}
                  >
                    <div className={`${style['id-block']}`}>
                      <ImageUpload onFileReaded={(file) => onFileReaded('idFile', file)} />
                      <img alt="identity-img" className={`${style['img-id']}`} src="/holding-id.jpg" />
                    </div>
                  </Form.Item>
                </div>
              </Col>
            </Row>
            <Form.Item style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={registerPerformerData.requesting}
                loading={registerPerformerData.requesting}
                style={{
                  marginBottom: 15,
                  fontWeight: 600,
                  padding: '5px 25px',
                  height: '42px'
                }}
              >
                {t('common:createAccount')}
              </Button>
              <p>
                {t('common:accountAlready')}
                <Link href="/auth/login">
                  <a>
                    {' '}
                    {t('common:loginHere')}
                  </a>
                </Link>
              </p>
              <p>
                {t('common:areYouAFan')}
                <Link href="/auth/fan-register">
                  <a>
                    {' '}
                    {t('common:signUpHere')}
                  </a>
                </Link>
              </p>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Layout>
  );
}

RegisterPerformer.getInitialProps = async () => {
  const countries = await utilsService.countriesList();
  return {
    countries: countries && countries.data ? countries.data : []
  };
};
const mapStatesToProps = (state: any) => ({
  registerPerformerData: { ...state.auth.registerPerformerData }
});

const mapDispatchToProps = {
  registerPerformerHandler: registerPerformer,
  handleLoginSuccess: loginSuccess,
  handleUpdateCurrentUser: updateCurrentUser
};

export default connect(mapStatesToProps, mapDispatchToProps)(RegisterPerformer);

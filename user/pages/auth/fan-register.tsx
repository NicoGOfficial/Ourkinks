/* eslint-disable prefer-regex-literals */
import SeoMetaHead from '@components/common/seo-meta-head';
import { loginSuccess, registerFan } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import {
  Button, Col, Form, Input, Layout, Row, Select
} from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { ICountry } from 'src/interfaces';
import {
  authService, settingService, userService, utilsService
} from 'src/services';

import loginStyle from './login.module.less';
import registerStyle from './register.module.less';

const { Option } = Select;

interface IFanRegisterProps {
  registerFanHandler: Function;
  registerFanData: any;
  countries: ICountry[];
  loginPlaceholderImage: string;
  handleLoginSuccess: Function;
  handleUpdateCurrentUser: Function;
}

function FanRegister({
  registerFanHandler,
  registerFanData = { requesting: false },
  countries = [],
  loginPlaceholderImage,
  handleLoginSuccess,
  handleUpdateCurrentUser
}: IFanRegisterProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const checkRedirect = async () => {
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
        router.push(`/model/${user.data.username}`);
      } else {
        router.push('/');
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
    checkRedirect();
  }, []);

  const onHandleRegister = (data: any) => {
    const refCode = localStorage.getItem('refCode');
    if (typeof refCode === 'string' && refCode !== '') {
      registerFanHandler({ ...data, refCode });
    } else {
      registerFanHandler(data);
    }
  };

  return (
    <Layout>
      <SeoMetaHead item={{
        title: t('common:fanRegister')
      }}
      />
      <div className="main-container">
        <div className={`${loginStyle['login-box']} ${registerStyle.registerBox}`}>
          <Row>
            <Col
              xs={24}
              sm={24}
              md={0}
              lg={8}
            >
              <div className={`${loginStyle.loginContent} ${loginStyle.left}`} style={loginPlaceholderImage ? { backgroundImage: `url(${loginPlaceholderImage})` } : null} />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={16}
            >
              <div className={`${loginStyle.loginContent} ${loginStyle.right}`}>
                <div className="text-center">
                  <span className="title">{t('common:fanRegister')}</span>
                </div>
                <p className="text-center"><small>{t('common:signUpInteractWithIdols')}</small></p>
                <div className="register-form">
                  <Form
                    name="member_register"
                    initialValues={{ gender: 'male', country: 'US' }}
                    onFinish={onHandleRegister}
                  >
                    <Row>
                      <Col xs={12} sm={12} md={12}>
                        <Form.Item
                          name="firstName"
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            { required: true, message: t('common:errRequireFirstName') },
                            {
                              pattern: new RegExp(
                                /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
                              ),
                              message:
                                t('common:errRequireFirstNamePattern')
                            }
                          ]}
                          hasFeedback
                        >
                          <Input placeholder={t('common:firstName')} />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={12} md={12}>
                        <Form.Item
                          name="lastName"
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            { required: true, message: t('common:errRequireLastName') },
                            {
                              pattern: new RegExp(
                                /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
                              ),
                              message:
                              t('common:errRequireFirstNamePattern')
                            }
                          ]}
                          hasFeedback
                        >
                          <Input placeholder={t('common:lastName')} />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={12} md={12}>
                        <Form.Item
                          name="name"
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            { required: true, message: t('common:errMissingName') },
                            {
                              pattern: new RegExp(/^(?=.*\S).+$/g),
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
                      <Col xs={12} sm={12} md={12}>
                        <Form.Item
                          name="username"
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            { required: true, message: t('common:errRequireUsername') },
                            {
                              pattern: new RegExp(/^[a-z0-9]+$/g),
                              message:
                                t('common:errNameHasLettersAndNumbers')
                            },
                            { min: 3, message: t('common:errMinUsername') }
                          ]}
                          hasFeedback
                        >
                          <Input placeholder={t('common:username')} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={24}>
                        <Form.Item
                          name="email"
                          validateTrigger={['onChange', 'onBlur']}
                          hasFeedback
                          rules={[
                            {
                              type: 'email',
                              message: t('common:errEmail')
                            },
                            {
                              required: true,
                              message: t('common:errRequireEmail')
                            }
                          ]}
                        >
                          <Input placeholder={t('common:email')} />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={12} md={12}>
                        <Form.Item
                          name="gender"
                          // validateTrigger={['onChange', 'onBlur']}
                          rules={[{ required: true, message: t('common:errSelectGender') }]}
                          // hasFeedback
                        >
                          <Select>
                            <Option value="male">{t('common:male')}</Option>
                            <Option value="female">{t('common:female')}</Option>
                            <Option value="transgender">{t('common:transgender')}</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={12} md={12}>
                        <Form.Item name="country" rules={[{ required: true, message: t('common:errSelectCountry') }]} hasFeedback>
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
                      <Col xs={24} sm={12} md={12}>
                        <Form.Item
                          name="password"
                          validateTrigger={['onChange', 'onBlur']}
                          hasFeedback
                          rules={[
                            {
                              pattern: new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^<>`~\-=\\\\|,.<>\\/;':"\\[\]{}\\#()_+?@$!%*?&])([A-Za-z\d^<>`~\-=\\\\|,.<>\\/;':"\\[\]{}\\#()_+?@$!%*?&]){8,}$/g),
                              message: t('common:errPassword')
                            },
                            { required: true, message: t('common:errRequirePw') }
                          ]}
                        >
                          <Input type="password" placeholder={t('common:inputPassword')} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={12}>
                        <Form.Item
                          name="confirm"
                          validateTrigger={['onChange', 'onBlur']}
                          dependencies={['password']}
                          hasFeedback
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

                    <Form.Item style={{ textAlign: 'center' }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        disabled={registerFanData.requesting}
                        loading={registerFanData.requesting}
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
                        {t('common:areYouAModel')}
                        <Link href="/auth/model-register">
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
            </Col>
          </Row>
        </div>
      </div>
    </Layout>
  );
}

FanRegister.getInitialProps = async () => {
  const [countries, settings] = await Promise.all([
    utilsService.countriesList(),
    settingService.valueByKeys([
      'loginPlaceholderImage'
    ])
  ]);
  return {
    countries: countries?.data || [],
    loginPlaceholderImage: settings.loginPlaceholderImage
  };
};

const mapStatesToProps = (state: any) => ({
  registerFanData: { ...state.auth.registerFanData }
});

const mapDispatchToProps = { registerFanHandler: registerFan, handleLoginSuccess: loginSuccess, handleUpdateCurrentUser: updateCurrentUser };

export default connect(mapStatesToProps, mapDispatchToProps)(FanRegister);

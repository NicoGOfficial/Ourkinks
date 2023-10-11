import PageTitle from '@components/common/page-title';
import { login, loginSuccess } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { authService, settingService, userService } from '@services/index';
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Layout,
  Row
} from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { ILogin } from 'src/interfaces';

import style from './login.module.less';

interface ILoginProps {
  loginAuth: any;
  handleLogin: Function;
  loginPlaceholderImage: string;
  handleLoginSuccess: Function;
  handleUpdateCurrentUser: Function;
}

function Login({
  loginAuth,
  handleLogin,
  loginPlaceholderImage,
  handleLoginSuccess,
  handleUpdateCurrentUser
}: ILoginProps) {
  const loginHandler = (values: ILogin) => handleLogin(values);
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
    checkRedirect();
  }, []);

  return (
    <Layout>
      <PageTitle title={t('common:login')} />
      <div className="main-container">
        <div className={style['login-box']}>
          <Row>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}
            >
              <div
                className={`${style.loginContent} ${style.left} ${style.fixed}`}
                style={loginPlaceholderImage ? { backgroundImage: `url(${loginPlaceholderImage})` } : null}
              />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}
            >
              <div className={`${style.loginContent} ${style.right}`}>
                <div className="login-form">
                  <div className="title">{t('common:login')}</div>
                  <Divider>*</Divider>
                  <Form
                    name="normal_login"
                    className="login-form"
                    initialValues={{ remember: true }}
                    onFinish={loginHandler}
                  >
                    <Form.Item
                      name="username"
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        { required: true, message: t('common:emailUsernameMissing') },
                        { min: 3, message: t('common:errMinUsername') }
                      ]}
                    >
                      <Input placeholder={t('common:inputEmail/username')} />
                    </Form.Item>
                    <Form.Item
                      style={{ margin: 0 }}
                      name="password"
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        { required: true, message: t('common:errRequirePw') },
                        { min: 8, message: t('common:errMinPw') }
                      ]}
                    >
                      <Input type="password" placeholder={t('common:inputPassword')} />
                    </Form.Item>
                    <Form.Item>
                      <Row>
                        <Col span={12}>
                          <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>{t('common:rememberMe')}</Checkbox>
                          </Form.Item>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                          <Link
                            href={{
                              pathname: '/auth/forgot-password'
                            }}
                          >
                            <a className="login-form-forgot">{t('common:forgotPassword')}</a>
                          </Link>
                        </Col>
                      </Row>
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'center' }}>
                      <Button type="primary" disabled={loginAuth.requesting} loading={loginAuth.requesting} htmlType="submit" className={`${style['login-form-button']}`}>
                        {t('common:login')}
                      </Button>
                      <p>
                        {t('common:noAccount')}
                        <Link
                          href="/auth/register"
                        >
                          <a>
                            {' '}
                            {t('common:signUpHere')}
                          </a>
                        </Link>
                      </p>
                      <p>
                        {t('common:emailVerification')}
                        ,
                        <Link href="/auth/resend-verification-email">
                          <a>
                            {' '}
                            {t('common:resendHere')}
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

Login.getInitialProps = async () => {
  const settings = await settingService.valueByKeys(['loginPlaceholderImage']);
  return {
    loginPlaceholderImage: settings.loginPlaceholderImage
  };
};

const mapStatesToProps = (state: any) => ({
  loginAuth: { ...state.auth.loginAuth }
});

const mapDispatchToProps = {
  handleLogin: login, handleLoginSuccess: loginSuccess, handleUpdateCurrentUser: updateCurrentUser
};
export default connect(mapStatesToProps, mapDispatchToProps)(Login) as any;

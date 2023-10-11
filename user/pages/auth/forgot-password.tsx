import SeoMetaHead from '@components/common/seo-meta-head';
import { authService, settingService } from '@services/index';
import {
  Button, Col, Form, Input, Layout, message,
  Row
} from 'antd';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import {
  useEffect, useRef, useState
} from 'react';
import { IForgot } from 'src/interfaces';

import loginS from './login.module.less';

interface IForgotProps {
  loginPlaceholderImage: string
}

function Forgot({
  loginPlaceholderImage
}: IForgotProps) {
  const { t } = useTranslation();

  const _intervalCountdown = useRef(null);
  const [submiting, setSubmitting] = useState(false);
  const [countTime, setCountdownTime] = useState(60);

  useEffect(() => {
    if (countTime === 0) {
      if (_intervalCountdown.current) clearInterval(_intervalCountdown.current);
      setCountdownTime(60);
    }

    return () => {
      if (_intervalCountdown.current) clearInterval(_intervalCountdown.current);
    };
  }, [countTime]);

  const handleCountdown = () => {
    if (countTime === 0) {
      clearInterval(_intervalCountdown.current);
      setCountdownTime(60);
      return;
    }
    setCountdownTime(countTime - 1);
    _intervalCountdown.current = setInterval(() => {
      setCountdownTime(countTime - 1);
    }, 1000);
  };

  const handleReset = async (data: IForgot) => {
    try {
      setSubmitting(true);
      await authService.resetPassword({
        ...data
      });
      message.success(t('common:resetPwEmailSent'));
      handleCountdown();
    } catch (e) {
      const error = await e;
      message.error(error?.message || t('common:errCommon'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <SeoMetaHead item={{
        title: t('common:titleForgotPassword')
      }}
      />
      <div className="main-container">
        <div className={loginS['login-box']}>
          <Row>
            <Col
              xs={24}
              sm={24}
              md={10}
              lg={12}
            >
              <div
                className={`${loginS.loginContent} ${loginS.left} ${loginS.fixed}`}
                style={loginPlaceholderImage ? { backgroundImage: `url(${loginPlaceholderImage})` } : null}
              />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={14}
              lg={12}
            >
              <div
                className={`${loginS['login-content']} ${loginS.right}`}
                style={{ paddingTop: 80 }}
              >
                <div className="login-form">
                  <div className="title">{t('common:resetPassword')}</div>
                  <Form name="forgot-form" onFinish={handleReset}>
                    <Form.Item
                      hasFeedback
                      name="email"
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          type: 'email',
                          message: t('common:errEmailFormat')
                        },
                        {
                          required: true,
                          message: t('common:errRequireEmail')
                        }
                      ]}
                    >
                      <Input placeholder={t('common:enterEmail')} />
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'center' }}>
                      <Button
                        className="primary"
                        type="primary"
                        htmlType="submit"
                        style={{
                          width: '100%',
                          marginBottom: 15,
                          fontWeight: 600,
                          padding: '5px 25px',
                          height: '42px'
                        }}
                        disabled={submiting || countTime < 60}
                        loading={submiting || countTime < 60}
                      >
                        {countTime < 60 ? t('common:resendHereIn') : t('common:sendEmail')}
                        {' '}
                        {countTime < 60 && `${countTime}s`}
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

Forgot.getInitialProps = async () => {
  const settings = await settingService.valueByKeys(['loginPlaceholderImage']);
  return {
    loginPlaceholderImage: settings.loginPlaceholderImage
  };
};

export default Forgot;

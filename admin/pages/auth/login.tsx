import { getResponseError } from '@lib/utils';
import { login } from '@redux/auth/actions';
import {
  Alert, Button, Checkbox, Form, Input, Layout
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import style from './login.module.less';

const FormItem = Form.Item;

interface IProps {
  loginAuth: any;
  ui: any;
  login: Function;
}

class Login extends PureComponent<IProps> {
  static layout: string = 'public';

  static authenticate: boolean = false;

  handleOk = (data) => {
    if (!data.username || !data.password) return;
    const { login: handlerLogin } = this.props;
    handlerLogin(data);
  };

  render() {
    const { ui } = this.props;
    const {
      loginAuth = { requesting: false, error: null, success: false }
    } = this.props;
    return (
      <Layout>
        <Head>
          <title>Login</title>
        </Head>
        <div className={style.form}>
          <div className={style.logo}>
            {ui.logo ? <div><img alt="logo" src={ui && ui.logo} /></div> : ui.siteName}
            <h2>Admin Panel</h2>
          </div>
          {loginAuth.error && (
            <Alert
              message="Error"
              description={getResponseError(loginAuth.error)}
              type="error"
            />
          )}
          {loginAuth.success ? (
            <Alert
              message="Login success"
              type="success"
              description="Redirecting..."
            />
          ) : (
            <Form
              onFinish={this.handleOk}
              initialValues={{
                email: '',
                password: '',
                remember: true
              }}
            >
              <FormItem
                hasFeedback
                name="username"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  { required: true, message: 'Please input email or username!' }
                ]}
              >
                <Input
                  placeholder="Email address or Username"
                />
              </FormItem>
              <FormItem
                hasFeedback
                name="password"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  { required: true, message: 'Please input your password!' }
                ]}
              >
                <Input.Password
                  placeholder="Password"
                />
              </FormItem>
              <div className="sub-para">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <Link href="/auth/forgot">
                  <a>Forgot password?</a>
                </Link>
              </div>
              <Button
                type="primary"
                onClick={this.handleOk}
                loading={loginAuth.requesting}
                htmlType="submit"
              >
                Sign in
              </Button>
            </Form>
          )}
        </div>
        <div className={style.footer} style={{ padding: '15px' }}>
          Copyright
          {' '}
          {new Date().getFullYear()}
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  loginAuth: state.auth.login,
  ui: state.ui
});
const mapDispatch = { login };
export default connect(mapStates, mapDispatch)(Login);

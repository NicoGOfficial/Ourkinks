/* eslint-disable no-duplicate-case */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import Loader from '@components/common/base/loader';
import Page from '@components/common/layout/page';
import { FileUpload } from '@components/file/file-upload';
import { ImageUpload } from '@components/file/image-upload';
import { SelectPostDropdown } from '@components/post/select-post-dropdown';
import LocaleSelect from '@components/translation/locale-select';
import { getResponseError } from '@lib/utils';
import { authService } from '@services/auth.service';
import { i18nService } from '@services/i18n.service';
import { settingService } from '@services/setting.service';
import {
  Button, Checkbox, Form, Input,
  InputNumber, Menu, message, Radio,
  Switch
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { createRef, PureComponent } from 'react';
import { ISetting } from 'src/interfaces';

const CustomSunEditor = dynamic(() => import('src/components/common/base/custom-sun-editor'), {
  ssr: false
});

class SettingsTranslate extends PureComponent {
  state = {
    updating: false,
    loading: false,
    selectedTab: 'general',
    list: [],
    locale: ''
  };

  formRef: any;

  dataChange = {} as any;

  smtpInfo = {
    host: '',
    port: '',
    secure: true,
    auth: {
      user: '',
      password: ''
    }
  } as any;

  componentDidMount() {
    this.formRef = createRef();
  }

  // async handleTextEditerContentChange(key: string, content: { [html: string]: string}) {
  //   this[key] = content.html;
  //   this.setVal(key, content.html);
  //   this.dataChange[key] = content.html;
  // }

  handleTextEditerContentChange(key: string, content: string) {
    this[key] = content;
    this.setVal(key, content);
    this.dataChange[key] = content;
  }

  async onMenuChange(menu) {
    await this.setState({
      selectedTab: menu.key
    });

    await this.loadSettings();
  }

  onLocaleChange(locale) {
    this.setState({ locale }, () => this.loadSettings());
  }

  setVal(field: string, val: any) {
    this.dataChange[field] = val;
  }

  setObject(field: string, val: any) {
    if (field === 'user' || field === 'pass') {
      this.smtpInfo.auth[field] = val;
    }
    this.smtpInfo[field] = val;
    this.dataChange.smtpTransporter = this.smtpInfo;
  }

  async loadSettings() {
    const { selectedTab, locale } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = (await settingService.all(selectedTab)) as any;

      const translations = await i18nService.getSettingsTranslation(selectedTab, locale);
      const data = resp.data.reduce((result, d) => {
        const setting = {
          ...d
        };
        const t = translations.data.find((trans) => trans.key === d.key);
        if (t) {
          setting.value = t.value;
        }
        result.push(setting);
        return result;
      }, []);

      this.dataChange = {};
      if (selectedTab === 'mailer' && data.length) {
        const info = data.find((d) => d.key === 'smtpTransporter');
        if (info) this.smtpInfo = info.value;
      }
      this.setState({ list: data });
      if (selectedTab === 'general') {
        const textEditorSettings = data.filter((r) => r.type === 'text-editor');
        if (textEditorSettings && textEditorSettings.length > 0) {
          textEditorSettings.map((t) => {
            this[t.key] = t.value;
            return t;
          });
        }
      }
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(getResponseError(err) || 'An error occurred, please try again!');
    } finally {
      this.setState({ loading: false });
    }
  }

  async submit() {
    try {
      const { locale } = this.state;
      await this.setState({ updating: true });
      for (const key of Object.keys(this.dataChange)) {
        if (key.indexOf('commission') !== -1) {
          if (!this.dataChange[key]) {
            return message.error('Missing commission value!');
          }
          if (Number.isNaN(this.dataChange[key])) {
            return message.error('Commission must be a number!');
          }
          if (this.dataChange[key] <= 0 || this.dataChange[key] >= 1) {
            return message.error('Commission must be greater than 0 and smaller than 1!');
          }
        }
        await i18nService.updateSettingsTranslation(locale, key, this.dataChange[key]);
      }
      message.success('Updated setting successfully');
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(getResponseError(err));
    } finally {
      this.setState({ updating: false });
      this.loadSettings();
    }
    return true;
  }

  renderUpload(setting: ISetting, ref: any) {
    if (!setting.meta || !setting.meta.upload) {
      return null;
    }
    const uploadHeaders = {
      authorization: authService.getToken()
    };

    if (setting.meta.file) {
      return (
        <div style={{ padding: '10px 0' }} key={`upload${setting._id}`}>
          <FileUpload
            uploadUrl={settingService.getFileUploadUrl()}
            headers={uploadHeaders}
            onUploaded={(resp) => {
              const formInstance = this.formRef.current as FormInstance;
              const val = setting.meta.absolutePath ? resp.response.data.absolutePath : resp.response.data.url;
              // eslint-disable-next-line no-param-reassign
              ref.current.input.value = val;
              formInstance.setFieldsValue({
                [setting.key]: val
              });
              this.dataChange[setting.key] = val;
            }}
          />
        </div>
      );
    }

    return (
      <div style={{ padding: '10px 0' }} key={`upload${setting._id}`}>
        <ImageUpload
          image={setting.value}
          uploadUrl={settingService.getFileUploadUrl()}
          headers={uploadHeaders}
          onUploaded={(resp) => {
            const formInstance = this.formRef.current as FormInstance;
            // eslint-disable-next-line no-param-reassign
            ref.current.input.value = resp.response.data.url;
            formInstance.setFieldsValue({
              [setting.key]: resp.response.data.url
            });
            this.dataChange[setting.key] = resp.response.data.url;
          }}
        />
      </div>
    );
  }

  renderFormItem(setting: ISetting) {
    const { selectedTab } = this.state;
    const disabledTab = ['email', 'smtp', 'commission', 'ccbill', 'verotel', 'ant'];
    let { type } = setting;
    if (setting.meta && setting.meta.textarea) {
      type = 'textarea';
    }
    const ref = createRef() as any;
    switch (type) {
      case 'textarea':
        return (
          <Form.Item label={setting.name} key={setting._id} help={setting.description} extra={setting.extra}>
            <Input.TextArea defaultValue={setting.value} onChange={(val) => this.setVal(setting.key, val.target.value)} />
          </Form.Item>
        );
      case 'post':
        return (
          <Form.Item label={setting.name} key={setting._id} help={setting.description}>
            <SelectPostDropdown
              defaultValue={setting.value}
              onSelect={(val) => this.setVal(setting.key, val)}
              disabled
            />
          </Form.Item>
        );
      case 'number':
        return (
          <Form.Item label={setting.name} key={setting._id} help={setting.description} extra={setting.extra}>
            <InputNumber
              disabled
              style={{ width: '100%' }}
              defaultValue={setting.value}
              onChange={(val) => this.setVal(setting.key, val)}
              min={(setting.meta && typeof setting.meta.min === 'number') ? setting.meta.min : Number.MIN_SAFE_INTEGER}
              max={(setting.meta && typeof setting.meta.max === 'number') ? setting.meta.max : Number.MAX_SAFE_INTEGER}
              step={(setting.meta && typeof setting.meta.step === 'number') ? setting.meta.step : 1}
            />
          </Form.Item>
        );
      case 'text-editor':
        return (
          <Form.Item label={setting.name} key={setting._id} help={setting.description}>
            {/* <WYSIWYG onChange={this.handleTextEditerContentChange.bind(this, setting.key)} html={this[setting.key]} /> */}
            <CustomSunEditor autoFocus={false} onChange={this.handleTextEditerContentChange.bind(this, setting.key)} content={this[setting.key]} />
          </Form.Item>
        );
      case 'boolean':
        return (
          <Form.Item label={setting.name} key={setting._id} help={setting.description} valuePropName="checked">
            <Switch disabled defaultChecked={setting.value} onChange={(val) => this.setVal(setting.key, val)} />
          </Form.Item>
        );
      case 'mixed':
        return (
          <div className="ant-row ant-form-item ant-form-item-with-help" key={setting._id}>
            <div className="ant-col ant-col-24 ant-form-item-label">
              <label htmlFor={setting.name}>
                {setting.name}
              </label>
            </div>
            <div className="ant-col ant-col-24 ant-form-item-control">
              <div className="ant-form-item">
                <div>
                  <label>
                    Host
                  </label>
                  <Input
                    disabled
                    defaultValue={setting?.value?.host}
                    onChange={(val) => this.setObject('host', val.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="port">Port</label>
                  <Input
                    disabled
                    defaultValue={setting?.value?.port}
                    onChange={(val) => this.setObject('port', val.target.value)}
                  />
                </div>
                <div style={{ margin: '10px 0' }}>
                  <label htmlFor="secure">
                    <Checkbox disabled defaultChecked={setting?.value?.secure} onChange={(e) => this.setObject('secure', e.target.checked)} />
                    {' '}
                    Secure (true for port 465, false for other ports)
                  </label>
                </div>
                <div>
                  <label htmlFor="authuser">Auth user</label>
                  <Input
                    disabled
                    defaultValue={setting?.value?.auth?.user}
                    onChange={(val) => this.setObject('user', val.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="authpassword">Auth password</label>
                  <Input
                    disabled
                    defaultValue={setting?.value?.auth?.pass}
                    onChange={(val) => this.setObject('pass', val.target.value)}
                  />
                </div>
              </div>
              <div className="ant-form-item-explain">{setting.description}</div>

            </div>
          </div>
        );
      case 'radio':
        return (
          <Form.Item label={setting.name} key={setting._id} help={setting.description} extra={setting.extra}>
            <Radio.Group disabled onChange={(val) => this.setVal(setting.key, val.target.value)} defaultValue={setting.value}>
              {setting.meta?.value.map((v: any) => (
                <Radio disabled value={v.key} key={v.key}>
                  {v.name}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        );
      default:
        return (
          <Form.Item label={setting.name} key={setting._id} help={setting.description} extra={setting.extra}>
            <Input
              disabled={disabledTab.includes(selectedTab)}
              defaultValue={setting.value}
              ref={ref}
              key={`input${setting._id}`}
              onChange={(val) => this.setVal(setting.key, val.target.value)}
            />
            {this.renderUpload(setting, ref)}
          </Form.Item>
        );
    }
  }

  render() {
    const {
      updating, selectedTab, list, loading, locale
    } = this.state;
    const layout = {
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    };

    const initialValues = {} as any;
    list.forEach((item: ISetting) => {
      initialValues[item.key] = item.value;
    });
    return (
      <>
        <Head>
          <title>Site Settings</title>
        </Head>
        <Page>
          <div style={{ marginBottom: '20px' }}>
            <h3>Select locale to translate</h3>
            <LocaleSelect onChange={this.onLocaleChange.bind(this)} />
          </div>
          {locale && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <Menu onClick={this.onMenuChange.bind(this)} selectedKeys={[selectedTab]} mode="horizontal">
                <Menu.Item key="general">General</Menu.Item>
                <Menu.Item key="email">Emails</Menu.Item>
                <Menu.Item key="mailer">SMTP</Menu.Item>
                <Menu.Item key="custom">SEO</Menu.Item>
                <Menu.Item key="commission">Commission</Menu.Item>
                <Menu.Item key="ccbill">CCbill</Menu.Item>
                <Menu.Item key="verotel">Verotel</Menu.Item>
                <Menu.Item key="analytics">Google Analytics</Menu.Item>
                <Menu.Item key="socialAddress">Social Media</Menu.Item>
                <Menu.Item key="ant">Ant Media</Menu.Item>
              </Menu>
            </div>
            {loading ? (
              <Loader spinning />
            ) : (
              <Form
                {...layout}
                layout={selectedTab === 'commission' ? 'vertical' : 'horizontal'}
                name="setting-frm"
                onFinish={this.submit.bind(this)}
                initialValues={initialValues}
                ref={this.formRef}
              >
                {list.map((setting) => this.renderFormItem(setting))}
                <Form.Item className="text-center">
                  <Button type="primary" htmlType="submit" disabled={updating} loading={updating}>
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            )}
          </>
          )}
        </Page>
      </>
    );
  }
}

export default SettingsTranslate;

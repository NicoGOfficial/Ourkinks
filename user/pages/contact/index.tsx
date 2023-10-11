/* eslint-disable react/no-danger */
/* eslint-disable react/no-did-update-set-state */
import SeoMetaHead from '@components/common/seo-meta-head';
import {
  postService, settingService
} from '@services/index';
import {
  Button, Col, Form, Input, Layout, message, Row
} from 'antd';
import withTranslation from 'next-translate/withTranslation';
import { createRef, PureComponent } from 'react';
import { connect } from 'react-redux';
import { ISettings } from 'src/interfaces';

import style from './contact.module.less';

const { TextArea } = Input;

type IProps = {
  settings: ISettings;
  i18n: any;
}

interface IStates {
  submiting: boolean,
  countTime: number,
  contentContact: string
}
class ContactPage extends PureComponent<IProps, IStates> {
  // eslint-disable-next-line react/sort-comp
  constructor(props: IProps) {
    super(props);
    this.state = {
      submiting: false,
      countTime: 60,
      contentContact: ''
    };
  }

  static authenticate = true;

  static noredirect: boolean = true;

  _intervalCountdown: any;

  formRef: any;

  async componentDidMount() {
    const { settings } = this.props;
    if (!this.formRef) this.formRef = createRef();
    try {
      const contactcontent = await postService.findById(settings.contactContentId);
      this.setState({ contentContact: contactcontent.data.content });
      // eslint-disable-next-line no-empty
    } catch (error) {
    }
    //
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.countTime === 0) {
      this._intervalCountdown && clearInterval(this._intervalCountdown);
      this.setState({ countTime: 60 });
    }
  }

  componentWillUnmount() {
    this._intervalCountdown && clearInterval(this._intervalCountdown);
  }

  async onFinish(values) {
    const { t } = this.props.i18n;
    this.setState({ submiting: true });
    try {
      await settingService.contact(values);
      message.success(t('common:successContact'));
      this.handleCountdown();
      this.formRef.current.resetFields();
    } catch (e) {
      message.error(t('common:errCommon'));
      this.formRef.current.resetFields();
    } finally {
      this.setState({ submiting: false });
    }
  }

  handleCountdown = async () => {
    const { countTime } = this.state;
    if (countTime === 0) {
      clearInterval(this._intervalCountdown);
      this.setState({ countTime: 60 });
      return;
    }
    this.setState({ countTime: countTime - 1 });
    this._intervalCountdown = setInterval(this.coundown.bind(this), 1000);
  };

  coundown() {
    const { countTime } = this.state;
    this.setState({ countTime: countTime - 1 });
  }

  render() {
    const { t } = this.props.i18n;
    if (!this.formRef) this.formRef = createRef();
    const { contentContact } = this.state;
    const { submiting, countTime } = this.state;
    return (
      <Layout>
        <SeoMetaHead item={{
          title: t('common:contact')
        }}
        />
        <div className="main-container">
          <div className={style['contact-box']}>
            <h3 className="title">
              {t('common:contact')}
            </h3>
            <Row>
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={12}
              >
                <div
                  className="contact-content"
                >
                  <div className="sun-editor-editable" dangerouslySetInnerHTML={{ __html: contentContact }} />
                </div>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={12}
              >
                <div className={`${style.contactContent} ${style.right}`}>
                  <div className="contact-form">
                    <Form
                      layout="vertical"
                      name="contact-from"
                      ref={this.formRef}
                      onFinish={this.onFinish.bind(this)}
                    >
                      <Form.Item
                        name="name"
                        rules={[{ required: true, message: t('common:msgTellUsYourName') }]}
                      >
                        <Input placeholder={t('common:yourName')} />
                      </Form.Item>
                      <Form.Item
                        name="email"
                        rules={[
                          {
                            required: true,
                            message: t('common:msgTellUsYourEmail')
                          },
                          { type: 'email', message: t('common:errEmailFormat') }
                        ]}
                      >
                        <Input placeholder={t('common:enterEmail')} />
                      </Form.Item>
                      <Form.Item
                        name="message"
                        rules={[
                          { required: true, message: t('common:howCanWeHelp') },
                          {
                            min: 20,
                            message: t('common:errMinContactMessage')
                          }
                        ]}
                      >
                        <TextArea style={{ minHeight: 100 }} rows={3} placeholder={t('common:yourMessage')} />
                      </Form.Item>
                      <div className="text-center">
                        <Button
                          size="large"
                          className="primary"
                          type="primary"
                          htmlType="submit"
                          loading={submiting || countTime < 60}
                          disabled={submiting || countTime < 60}
                          style={{ fontWeight: 600, width: '100%' }}
                        >
                          {countTime < 60 ? t('common:resendHereIn') : t('common:sendEmail')}
                          {' '}
                          {countTime < 60 && `${countTime}s`}
                        </Button>
                      </div>
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
}
const mapStates = (state: any) => ({
  settings: state.settings
});

export default connect(mapStates)(withTranslation(ContactPage));

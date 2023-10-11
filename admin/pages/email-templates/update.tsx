import { HomeOutlined } from '@ant-design/icons';
import Loader from '@components/common/base/loader';
import Page from '@components/common/layout/page';
import { emailTemplateService } from '@services/email-template.service';
import {
  Breadcrumb, Button, Form, Input, message, Select, Switch
} from 'antd';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { PureComponent } from 'react';

const CustomSunEditor = dynamic(() => import('src/components/common/base/custom-sun-editor'), {
  ssr: false
});

class EmailTemplateUpdate extends PureComponent<any, any> {
  state = {
    submiting: false,
    fetching: true,
    template: null,
    isTextArea: true,
    content: ''
  };

  static async getInitialProps(ctx) {
    const { query } = ctx;
    return query;
  }

  async componentDidMount() {
    try {
      const { id } = this.props;
      const resp = await emailTemplateService.findById(id);
      this.setState({ content: resp.data.content });
      this.setState({ template: resp.data });
    } catch (e) {
      message.error('Email template not found!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  contentTextAreaChange = (content) => {
    this.setState({ content });
  };

  contentChange(content: string) {
    this.setState({ content });
  }

  async submit(data: any) {
    try {
      this.setState({ submiting: true });
      const { id } = this.props;
      const { content } = this.state;

      const submitData = {
        ...data,
        content
      };
      await emailTemplateService.update(id, submitData);
      message.success('Updated successfully');
      this.setState({ submiting: false });
    } catch (e) {
      // TODO - check and show error here
      message.error('Something went wrong, please try again!');
      this.setState({ submiting: false });
    }
  }

  render() {
    const {
      template, fetching, submiting, isTextArea, content
    } = this.state;
    return (
      <>
        <Head>
          <title>Update template</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/email-templates">
              <span>Email templates</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{template?.name}</Breadcrumb.Item>
            <Breadcrumb.Item>Update</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <Page>
          {!template || fetching ? (
            <Loader />
          ) : (
            <Form
              onFinish={this.submit.bind(this)}
              initialValues={template}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Form.Item name="subject" rules={[{ required: true, message: 'Please enter subject!' }]} label="Subject">
                <Input placeholder="Enter your title" />
              </Form.Item>
              <Form.Item
                label="Editor"
                help={
                  !isTextArea
                    ? 'WYSIWYG Editor will overwrite in some templates which have special coding structure. Please recheck HTML source code after change and update accordingly after used WYSIWYG Editor to update'
                    : ''
                }
              >
                <Switch
                  checkedChildren="WYSIWYG Editor"
                  unCheckedChildren="HTML textarea"
                  onChange={() => this.setState({ isTextArea: !isTextArea })}
                />
              </Form.Item>

              <Form.Item label="Content">
                {!isTextArea && (
                  <CustomSunEditor onChange={this.contentChange.bind(this)} autoFocus content={content} />
                )}
                {isTextArea && (
                  <Input.TextArea
                    style={{ width: '100%' }}
                    onChange={(e) => this.contentTextAreaChange(e.target.value)}
                    autoFocus
                    value={content}
                    rows={5}
                  />
                )}
                {template?.description && (
                  <p>
                    <i>{template?.description}</i>
                  </p>
                )}
              </Form.Item>
              <Form.Item name="layout" label="Layout">
                <Select>
                  <Select.Option value="layouts/default">Default</Select.Option>
                  <Select.Option value="blank">Blank</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 4 }}>
                <Button type="primary" htmlType="submit" disabled={submiting} loading={submiting}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          )}
        </Page>
      </>
    );
  }
}

export default EmailTemplateUpdate;

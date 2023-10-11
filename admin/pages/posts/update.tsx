import { HomeOutlined } from '@ant-design/icons';
import Loader from '@components/common/base/loader';
import Page from '@components/common/layout/page';
import { postService } from '@services/post.service';
import {
  Breadcrumb, Button, Form, Input, message
} from 'antd';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';

const CustomSunEditor = dynamic(() => import('src/components/common/base/custom-sun-editor'), {
  ssr: false
});

class PostUpdate extends PureComponent<any> {
  private _content: string = '';

  static async getInitialProps(ctx) {
    return ctx.query;
  }

  state = {
    submiting: false,
    post: null
  };

  componentDidMount() {
    this.getPost();
  }

  async getPost() {
    const { id } = this.props;
    try {
      const resp = await postService.findById(id);
      this._content = resp.data.content;
      this.setState({ post: resp.data });
    } catch (e) {
      message.error('Post not found!');
    }
  }

  async submit(data: any) {
    const { id } = this.props;
    try {
      await this.setState({ submiting: true });
      const submitData = {
        ...data,
        content: this._content
      };
      await postService.update(id, submitData);
      message.success('Updated successfully');
      Router.push('/posts');
    } catch (e) {
      message.error('Something went wrong, please try again!');
      this.setState({ submiting: false });
    }
  }

  // contentChange(content: { [html: string]: string }) {
  //   this._content = content.html;
  // }

  contentChange(content: string) {
    this._content = content;
  }

  render() {
    const { post, submiting } = this.state;
    return (
      <>
        <Head>
          <title>Update post</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/posts">
              <span>Posts</span>
            </Breadcrumb.Item>
            {post && <Breadcrumb.Item>{post.title}</Breadcrumb.Item>}
            <Breadcrumb.Item>Update</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <Page>
          {!post ? (
            <Loader />
          ) : (
            <Form
              onFinish={this.submit.bind(this)}
              initialValues={post}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Form.Item name="title" rules={[{ required: true, message: 'Please input title!' }]} label="Title">
                <Input placeholder="Enter your title" />
              </Form.Item>
              <Form.Item name="shortDescription" label="Short description">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item label="Content">
                {/* <WYSIWYG onChange={this.contentChange.bind(this)} html={this._content} /> */}
                <CustomSunEditor onChange={this.contentChange.bind(this)} content={this._content} />
              </Form.Item>
              {/* <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="page">Page</Select.Option>
                  <Select.Option value="post">Post</Select.Option>
                </Select>
              </Form.Item> */}
              {/* <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="published">Active</Select.Option>
                  <Select.Option value="draft">Inactive</Select.Option>
                </Select>
              </Form.Item> */}
              <Form.Item
                name="metaTitle"
                label="Meta title"
                help="Custom page title instead of default title"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="metaDescription"
                label="Meta description"
                help="Custom meta description for page. Should be max 160 characters"
              >
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item
                name="metaKeywords"
                label="Meta keywords"
                help="Meta keywords for this post"
              >
                <Input />
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

export default PostUpdate;

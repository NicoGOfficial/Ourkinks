import { FormUploadBanner } from '@components/banner/form-upload-banner';
import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { bannerService } from '@services/banner.service';
import { message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { createRef, PureComponent } from 'react';

interface IProps { }

class UploadBanner extends PureComponent<IProps> {
  state = {
    uploading: false,
    uploadPercentage: 0
  };

  formRef: any;

  _banner: File;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
  }

  onUploading(resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
  }

  beforeUpload(file) {
    this._banner = file;
  }

  async submit(data: any) {
    if (!this._banner) {
      message.error('Please select banner!');
      return;
    }

    await this.setState({
      uploading: true
    });
    try {
      (await bannerService.uploadBanner(this._banner, data, this.onUploading.bind(this)));
      message.success('Banner has been uploaded');
      Router.push('/banner');
    } catch (error) {
      message.error('An error occurred, please try again!');
      this.setState({
        uploading: false
      });
    }
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const { uploading, uploadPercentage } = this.state;
    return (
      <>
        <Head>
          <title>New Banner</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Banners', href: '/banner' }, { title: 'New banner' }]} />
        <Page>
          <FormUploadBanner
            submit={this.submit.bind(this)}
            beforeUpload={this.beforeUpload.bind(this)}
            uploading={uploading}
            uploadPercentage={uploadPercentage}
          />
        </Page>
      </>
    );
  }
}

export default UploadBanner;

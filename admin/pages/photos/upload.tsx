import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { FormUploadPhoto } from '@components/photo/form-upload-photo';
import { photoService } from '@services/photo.service';
import { message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { createRef, PureComponent } from 'react';

interface IResponse {
  data: { _id: string };
}

interface IProps {
}

class UploadPhoto extends PureComponent<IProps> {
  state = {
    uploading: false,
    uploadPercentage: 0
  };

  formRef: any;

  _photo: File;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
  }

  onUploading(resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
  }

  beforeUpload(file) {
    this._photo = file;
    return false;
  }

  async submit(data: any) {
    if (!this._photo) {
      message.error('Please select photo!');
      return;
    }

    await this.setState({
      uploading: true
    });
    try {
      await photoService.uploadPhoto(this._photo, data, this.onUploading.bind(this)) as IResponse;
      message.success('Photo has been uploaded');
      // TODO - process for response data?
      Router.push('/photos');
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
          <title>Upload Photo</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Photos', href: '/photos' }, { title: 'Upload photo' }]} />
        <Page>
          <FormUploadPhoto
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

export default UploadPhoto;

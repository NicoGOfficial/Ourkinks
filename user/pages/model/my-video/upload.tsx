import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import FormUploadVideo from '@components/video/form-upload';
import { getResponseError } from '@lib/utils';
import { videoService } from '@services/video.service';
import { Layout, message, PageHeader } from 'antd';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUser } from 'src/interfaces';

type IProps = {
  user: IUser;
  i18n: any;
}
interface IFiles {
  fieldname: string;
  file: File;
}

interface IResponse {
  data: { _id: string };
}

class UploadVideo extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    uploading: false,
    uploadPercentage: 0
  };

  _files: {
    thumbnail: File;
    video: File;
  } = {
      thumbnail: null,
      video: null
    };

  onUploading(resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
  }

  beforeUpload(file: File, field: string) {
    this._files[field] = file;
  }

  async submit(data: any) {
    const { t } = this.props.i18n;
    if (!this._files.video) {
      return message.error(t('common:selectVideo'));
    }

    if (
      (data.isSaleVideo && !data.price)
      || (data.isSaleVideo && data.price < 1)
    ) {
      return message.error('Invalid price');
    }
    // eslint-disable-next-line no-param-reassign
    data.tags = [...[], ...data.tags];
    // eslint-disable-next-line no-param-reassign
    data.participantIds = [...[], ...data.participantIds];
    const files = Object.keys(this._files).reduce((f, key) => {
      if (this._files[key]) {
        f.push({
          fieldname: key,
          file: this._files[key] || null
        });
      }
      return f;
    }, [] as IFiles[]) as [IFiles];

    await this.setState({
      uploading: true
    });
    try {
      (await videoService.uploadVideo(
        files,
        data,
        this.onUploading.bind(this)
      )) as IResponse;
      message.success(t('common:videoHasBeenUpload'));
      // TODO - process for response data?
      Router.push('/model/my-video');
      return this.setState({
        uploading: false
      });
    } catch (error) {
      message.error(
        getResponseError(error) || t('common:errCommon')
      );
      return this.setState({
        uploading: false
      });
    }
  }

  render() {
    const { t } = this.props.i18n;
    const { uploading, uploadPercentage } = this.state;
    const { user } = this.props;
    return (
      <Layout>
        <PageTitle title={t('common:uploadVideo')} />
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title={t('common:uploadVideo')}
          />
          <FormUploadVideo
            user={user}
            submit={this.submit.bind(this)}
            beforeUpload={this.beforeUpload.bind(this)}
            uploading={uploading}
            uploadPercentage={uploadPercentage}
          />
        </div>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  user: state.user.current
});
export default connect(mapStates)(withTranslation(UploadVideo));

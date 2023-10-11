/* eslint-disable react/require-default-props */
import { CameraOutlined, LoadingOutlined } from '@ant-design/icons';
import { getImageBase64 } from '@lib/utils';
import { message, Upload } from 'antd';
import getConfig from 'next/config';
import { PureComponent } from 'react';

function beforeUpload(file) {
  const { publicRuntimeConfig: config } = getConfig();
  const isLt5M = file.size / 1024 / 1024 < (config.MAX_SIZE_IMAGE || 5);
  if (!isLt5M) {
    message.error(`Image must be smaller than ${config.MAX_SIZE_IMAGE || 5}MB!`);
  }
  return isLt5M;
}

interface IState {
  loading: boolean;
  imageUrl: string;
}

type IProps = {
  imageUrl?: string;
  uploadUrl?: string;
  headers?: any;
  onUploaded?: Function;
  onFileReaded?: Function;
  options?: any;
  accept?: string;
}

export class ImageUpload extends PureComponent<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      imageUrl: props.imageUrl
    };
  }

  handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      const { onFileReaded, onUploaded } = this.props;
      onFileReaded && onFileReaded(info.file.originFileObj);
      // Get this url from response in real world.
      getImageBase64(info.file.originFileObj, (imageUrl) => {
        this.setState({
          imageUrl,
          loading: false
        });
        onUploaded
          && onUploaded({
            response: info.file.response,
            base64: imageUrl
          });
      });
    }
  };

  render() {
    const {
      options = {}, headers, uploadUrl, accept
    } = this.props;
    const { loading, imageUrl } = this.state;

    const uploadButton = (
      <div>
        {loading ? <LoadingOutlined /> : <CameraOutlined />}
      </div>
    );
    return (
      <Upload
        accept={accept || 'image/*'}
        name={options.fieldName || 'file'}
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action={uploadUrl}
        beforeUpload={beforeUpload}
        onChange={this.handleChange}
        headers={headers}
      >
        {imageUrl && <img src={imageUrl} alt="file" style={{ width: '100%' }} />}
        {uploadButton}
      </Upload>
    );
  }
}

/* eslint-disable jsx-a11y/label-has-associated-control */
import { CameraOutlined } from '@ant-design/icons';
import { SelectGalleryDropdown } from '@components/gallery/common/select-gallery-dropdown';
import { SelectPerformerDropdown } from '@components/performer/common/select-performer-dropdown';
import { ThumbnailPhoto } from '@components/photo/thumbnail-photo';
import {
  Button, Form, Input, message, Progress,
  Select, Upload
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import getConfig from 'next/config';
import { createRef, PureComponent } from 'react';
import { IPhotoCreate, IPhotoUpdate } from 'src/interfaces';

interface IProps {
  photo?: IPhotoUpdate;
  submit: Function;
  beforeUpload?: Function;
  uploading?: boolean;
  uploadPercentage?: number;
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!'
};

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

export class FormUploadPhoto extends PureComponent<IProps> {
  state = {
    previewImage: '',
    selectedPerformerId: ''
  };

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    photo: undefined,
    beforeUpload: () => { },
    uploading: false,
    uploadPercentage: 0
  };

  formRef: any;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    const { photo } = this.props;
    if (photo) this.setState({ selectedPerformerId: photo.performerId });
  }

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
    if (field === 'performerId') this.setState({ selectedPerformerId: val });
  }

  beforeUpload(file) {
    const { publicRuntimeConfig: config } = getConfig();
    const { beforeUpload: handleUpload } = this.props;
    const isMaxSize = file.size / 1024 / 1024 < (config.MAX_SIZE_IMAGE || 5);
    if (!isMaxSize) {
      message.error(`Image must be smaller than ${config.MAX_SIZE_IMAGE || 5}MB!`);
      return false;
    }
    getBase64(file, (imageUrl) => {
      // eslint-disable-next-line no-param-reassign
      this.setState({ previewImage: imageUrl });
    });

    handleUpload(file);
    return true;
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const {
      photo, submit, uploading, uploadPercentage
    } = this.props;
    const { previewImage, selectedPerformerId } = this.state;
    const havePhoto = !!photo;
    const { publicRuntimeConfig: config } = getConfig();

    return (
      <Form
        {...layout}
        onFinish={(data) => {
          if (!data.performerId) {
            message.error('Please select model!');
            return;
          }
          if (!data.galleryId) {
            message.error('Please select gallery!');
            return;
          }
          submit(data);
        }}
        onFinishFailed={() => message.error('Please complete the required fields')}
        name="form-upload"
        ref={this.formRef}
        validateMessages={validateMessages}
        initialValues={
          photo || ({
            title: '',
            description: '',
            status: 'active',
            performerId: '',
            galleryId: ''
          } as IPhotoCreate)
        }
      >
        <Form.Item name="performerId" label="Performer" rules={[{ required: true }]}>
          <SelectPerformerDropdown
            noEmpty
            defaultValue={selectedPerformerId || ''}
            onSelect={(val) => this.setFormVal('performerId', val)}
          />
        </Form.Item>
        <Form.Item name="galleryId" label="Gallery" rules={[{ required: true, message: 'Please select a gallery' }]}>
          <SelectGalleryDropdown
            defaultValue={photo && photo.galleryId ? photo.galleryId : ''}
            onSelect={(val) => this.setFormVal('galleryId', val)}
            performerId={selectedPerformerId}
          />
        </Form.Item>
        <Form.Item name="title" rules={[{ required: true, message: 'Please input title of photo!' }]} label="Title">
          <Input placeholder="Enter photo title" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status!' }]}>
          <Select>
            <Select.Option key="active" value="active">
              Active
            </Select.Option>
            <Select.Option key="inactive" value="inactive">
              Inactive
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item help={`Image must be smaller than ${config.MAX_SIZE_IMAGE || 5}MB!`}>
          {!havePhoto ? (
            <Upload
              listType="picture-card"
              className="avatar-uploader"
              customRequest={() => false}
              accept={'image/*'}
              multiple={false}
              showUploadList={false}
              disabled={uploading || havePhoto}
              beforeUpload={(file) => this.beforeUpload(file)}
            >
              {previewImage ? <img src={previewImage} alt="file" width="100%" /> : null}
              <CameraOutlined />
            </Upload>
          ) : (
            <ThumbnailPhoto photo={photo} style={{ width: '250px' }} />
          )}
          {uploadPercentage ? <Progress percent={uploadPercentage} /> : null}
        </Form.Item>
        <Form.Item className="text-center">
          <Button type="primary" htmlType="submit" disabled={uploading} loading={uploading}>
            {havePhoto ? 'Update' : 'Upload'}
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

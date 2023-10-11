import { CameraOutlined, FileDoneOutlined, VideoCameraAddOutlined } from '@ant-design/icons';
import { performerService } from '@services/index';
import {
  Avatar,
  Button, Col,
  DatePicker, Form, Input, InputNumber, message, Progress, Row, Select, Switch, Upload
} from 'antd';
import { debounce } from 'lodash';
import moment from 'moment';
import getConfig from 'next/config';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { IUser, IVideo } from 'src/interfaces/index';

import style from './form-upload.module.less';

type IProps = {
  user: IUser;
  video?: IVideo;
  submit: Function;
  beforeUpload?: Function;
  uploading?: boolean;
  uploadPercentage?: number;
  i18n: any;
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const { Option } = Select;

class FormUploadVideo extends PureComponent<IProps> {
  state = {
    previewThumbnail: null,
    previewTeaser: null,
    previewVideo: null,
    selectedThumbnail: null,
    selectedVideo: null,
    selectedTeaser: null,
    isSale: false,
    isSchedule: false,
    scheduledAt: moment(),
    performers: [],
    firstLoadPerformer: false
  };

  getPerformers = debounce(async (q, performerIds) => {
    const { t } = this.props.i18n;
    try {
      const resp = await (await performerService.search({ q, performerIds: performerIds || '', limit: 500 })).data;
      const performers = resp.data || [];
      this.setState({ performers, firstLoadPerformer: true });
    } catch (e) {
      const err = await e;
      message.error(err?.message || t('common:errCommon'));
      this.setState({ firstLoadPerformer: true });
    }
  }, 500);

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    video: undefined,
    beforeUpload: () => {},
    uploading: false,
    uploadPercentage: 0
  };

  componentDidMount() {
    const { video, user } = this.props;
    if (video) {
      this.setState(
        {
          previewThumbnail: video?.thumbnail?.url || '',
          previewVideo: video?.video?.url || '',
          previewTeaser: video?.teaser?.url || '',
          isSale: video.isSaleVideo,
          isSchedule: video.isSchedule,
          scheduledAt: video.scheduledAt ? moment(video.scheduledAt) : moment()
        }
      );
    }
    this.getPerformers('', video?.participantIds || [user._id]);
  }

  onSwitch(field: string, checked: boolean) {
    if (field === 'saleVideo') {
      this.setState({
        isSale: checked
      });
    }
    if (field === 'scheduling') {
      this.setState({
        isSchedule: checked
      });
    }
  }

  beforeUpload(file: File, field: string) {
    const { beforeUpload: beforeUploadHandler, i18n } = this.props;
    const { t } = i18n;
    const { publicRuntimeConfig: config } = getConfig();
    if (field === 'thumbnail') {
      const isValid = file.size / 1024 / 1024 < (config.MAX_SIZE_IMAGE || 5);
      if (!isValid) {
        message.error(t('common:errFileTooLarge', { size: config.MAX_SIZE_IMAGE || 5 }));
        return isValid;
      }
      this.setState({ selectedThumbnail: file });
    }
    if (field === 'teaser') {
      const isValid = file.size / 1024 / 1024 < (config.MAX_SIZE_TEASER || 200);
      if (!isValid) {
        message.error(t('common:errFileTooLarge', { size: config.MAX_SIZE_TEASER || 200 }));
        return isValid;
      }
      this.setState({ selectedTeaser: file });
    }
    if (field === 'video') {
      const isValid = file.size / 1024 / 1024 < (config.MAX_SIZE_VIDEO || 2000);
      if (!isValid) {
        message.error(t('common:errFileTooLarge', { size: config.MAX_SIZE_VIDEO || 200 }));
        return isValid;
      }
      this.setState({ selectedVideo: file });
    }
    return beforeUploadHandler(file, field);
  }

  render() {
    const {
      video, submit, uploading, uploadPercentage, i18n
    } = this.props;
    const {
      previewThumbnail,
      previewTeaser,
      previewVideo,
      performers,
      isSale,
      isSchedule,
      scheduledAt,
      selectedThumbnail,
      selectedTeaser,
      selectedVideo,
      firstLoadPerformer
    } = this.state;
    const { publicRuntimeConfig: config } = getConfig();
    const { t } = i18n;

    const validateMessages = {
      required: t('common:errFieldRequired')
    };

    return (
      <Form
        {...layout}
        onFinish={(values) => {
          const data = values;
          if (isSchedule) {
            data.scheduledAt = scheduledAt;
          }
          submit(data);
        }}
        onFinishFailed={() => message.error(t('common:errRequiredFields'))}
        name="form-upload"
        validateMessages={validateMessages}
        initialValues={
          video
          || ({
            title: '',
            price: 9.99,
            description: '',
            tags: [],
            isSaleVideo: false,
            participantIds: [],
            isSchedule: false,
            status: 'active'
          })
        }
        className={style['account-form']}
      >
        <Row>
          <Col md={24} xs={24}>
            <Form.Item
              label={t('common:title')}
              name="title"
              rules={[
                { required: true, message: t('common:errVideoTitleMissing') }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col md={24} xs={24}>
            <Form.Item label={t('common:tags')} name="tags">
              <Select
                mode="tags"
                style={{ width: '100%' }}
                size="middle"
                showArrow={false}
                defaultActiveFirstOption={false}
              />
            </Form.Item>
          </Col>
          <Col md={24} xs={24}>
            <Form.Item
              label={t('common:participants')}
              name="participantIds"
            >
              {firstLoadPerformer && (
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  showSearch
                  placeholder={t('common:searchPerformers')}
                  optionFilterProp="children"
                  onSearch={this.getPerformers.bind(this)}
                  loading={uploading}
                >
                  {performers
                    && performers.length > 0
                    && performers.map((p) => (
                      <Option key={p._id} value={p._id}>
                        <Avatar style={{ width: 24, height: 24 }} src={p?.avatar || '/no-avatar.png'} />
                        {' '}
                        {p?.name || p?.username || 'N/A'}
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              name="isSaleVideo"
              label="For sale?"
            >
              <Switch
                checkedChildren={t('common:payPerView')}
                unCheckedChildren={t('common:subToView')}
                checked={isSale}
                onChange={this.onSwitch.bind(this, 'saleVideo')}
              />
            </Form.Item>
          </Col>
          {isSale && (
            <Col md={12} xs={12}>
              <Form.Item name="price" label={t('common:price')}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          )}
          <Col md={12} xs={12}>
            <Form.Item
              name="isSchedule"
              label="Schedule?"
            >
              <Switch
                checkedChildren={t('common:upcoming')}
                unCheckedChildren={t('common:recent')}
                checked={isSchedule}
                onChange={this.onSwitch.bind(this, 'scheduling')}
              />
            </Form.Item>
          </Col>
          {isSchedule && (
            <Col md={12} xs={12}>
              <Form.Item label={t('common:scheduleAt')}>
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(currentDate) => currentDate && currentDate < moment().endOf('day')}
                  defaultValue={scheduledAt}
                  onChange={(val) => this.setState({ scheduledAt: val })}
                />
              </Form.Item>
            </Col>
          )}
          <Col md={24} xs={12}>
            <Form.Item
              name="status"
              label={t('common:labelStatus')}
              rules={[{ required: true, message: t('common:errStatusRequire') }]}
            >
              <Select>
                <Select.Option key="active" value="active">
                  {t('common:active')}
                </Select.Option>
                <Select.Option key="inactive" value="inactive">
                  {t('common:inactive')}
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="description"
              label={t('common:labelDescription')}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={t('common:videoFile')}
            >
              <Upload
                customRequest={() => false}
                listType="picture-card"
                className="avatar-uploader"
                accept="video/*"
                multiple={false}
                showUploadList={false}
                disabled={uploading}
                beforeUpload={(file) => this.beforeUpload(file, 'video')}
              >
                {selectedVideo ? <FileDoneOutlined /> : <VideoCameraAddOutlined />}
              </Upload>
              <div className="ant-form-item-explain" style={{ textAlign: 'left' }}>
                {(selectedVideo && <a>{selectedVideo.name}</a>)
                  || (previewVideo && (
                    <a href={previewVideo} target="_blank" rel="noreferrer">
                      {t('common:clickPreviewVideo')}
                    </a>
                  ))
                  || t('common:fileSizeDescription', { size: config.MAX_SIZE_VIDEO || 2048 })}
              </div>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={t('common:teaserFile')}
            >
              <Upload
                customRequest={() => false}
                listType="picture-card"
                className="avatar-uploader"
                accept="video/*"
                multiple={false}
                showUploadList={false}
                disabled={uploading}
                beforeUpload={(file) => this.beforeUpload(file, 'teaser')}
              >
                {selectedTeaser ? <FileDoneOutlined /> : <VideoCameraAddOutlined />}
              </Upload>
              <div className="ant-form-item-explain" style={{ textAlign: 'left' }}>
                {(selectedTeaser && <a>{selectedTeaser.name}</a>)
                  || (previewTeaser
                    && (
                      <a href={previewTeaser} target="_blank" rel="noreferrer">
                        {t('common:clickPreviewTeaser')}
                      </a>
                    )
                  )
                  || t('common:fileSizeDescription', { size: config.MAX_SIZE_TEASER || 200 })}
              </div>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={t('common:thumbnail')}
            >
              <Upload
                customRequest={() => false}
                listType="picture-card"
                className="avatar-uploader"
                accept="image/*"
                multiple={false}
                showUploadList={false}
                disabled={uploading}
                beforeUpload={(file) => this.beforeUpload(file, 'thumbnail')}
              >
                {selectedThumbnail ? <FileDoneOutlined /> : <CameraOutlined />}
              </Upload>
              <div className="ant-form-item-explain" style={{ textAlign: 'left' }}>
                {(selectedThumbnail && <a>{selectedThumbnail.name}</a>)
                  || (previewThumbnail && (
                    <a href={previewThumbnail} target="_blank" rel="noreferrer">
                      {t('common:clickPreviewThumbnail')}
                    </a>
                  ))
                  || t('common:fileSizeDescription', { size: config.MAX_SIZE_IMAGE || 5 })}
              </div>
            </Form.Item>
          </Col>
        </Row>
        {uploadPercentage ? (
          <Progress percent={Math.round(uploadPercentage)} />
        ) : null}
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button className="primary" htmlType="submit" loading={uploading} disabled={uploading}>
            {video ? t('common:update') : t('common:upload')}
          </Button>
          <Button className="secondary" onClick={() => Router.back()} disabled={uploading}>
            {t('common:back')}
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default withTranslation(FormUploadVideo);

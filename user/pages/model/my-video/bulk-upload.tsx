import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import VideoUploadList from '@components/file/video-upload-list';
import { formatDate } from '@lib/index';
import { performerService, videoService } from '@services/index';
import {
  Avatar, Button, Col, DatePicker, Form, InputNumber,
  Layout, message, PageHeader,
  Row, Select, Switch, Upload
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import { debounce, uniqBy } from 'lodash';
import moment from 'moment';
import getConfig from 'next/config';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { createRef, PureComponent } from 'react';

type IProps = {
  i18n: any;
}

const validateMessages = {
  required: 'This field is required!'
};

const { Dragger } = Upload;

class BulkUploadVideo extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  formRef: any;

  getPerformers = debounce(async (q, performerIds) => {
    const { t } = this.props.i18n;
    try {
      const resp = await (await performerService.search({ q, performerIds: performerIds || '', limit: 500 })).data;
      const performers = resp.data || [];
      this.setState({ performers });
    } catch (e) {
      const err = await e;
      message.error(err?.message || t('common:errCommon'));
    }
  }, 500);

  static async getInitialProps(ctx) {
    return ctx.query;
  }

  state = {
    isSaleVideo: false,
    isSchedule: false,
    scheduledAt: moment().add(1, 'day'),
    uploading: false,
    fileList: [],
    performers: []
  };

  componentDidMount() {
    this.getPerformers('', '');
  }

  onUploading(file, resp: any) {
    // eslint-disable-next-line no-param-reassign
    file.percent = resp.percentage;
    // eslint-disable-next-line no-param-reassign
    if (file.percent === 100) file.status = 'done';
    this.forceUpdate();
  }

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
  }

  beforeUpload(file, files) {
    const { publicRuntimeConfig: config } = getConfig();
    const isValid = file.size / 1024 / 1024 < (config.MAX_SIZE_VIDEO || 2000);
    if (!isValid) {
      message.error(`File ${file.name} is too large`);
      // eslint-disable-next-line no-param-reassign
      files = files.filter((f) => f.uid === file.uid);
    }
    const { fileList } = this.state;
    this.setState({ fileList: uniqBy([...fileList, ...files], ((f) => f.name && f.size)) });
  }

  remove(file) {
    const { fileList } = this.state;
    this.setState({ fileList: fileList.filter((f) => f.uid !== file.uid) });
  }

  async submit(formValues) {
    const { t } = this.props.i18n;
    const {
      fileList, isSaleVideo, isSchedule, scheduledAt
    } = this.state;
    if (!fileList.length) {
      message.error(t('common:selectVideo'));
      return;
    }
    const uploadFiles = fileList.filter(
      (f) => !['uploading', 'done'].includes(f.status)
    );
    if (!uploadFiles.length) {
      message.error(t('common:selectNewVideo'));
      return;
    }

    await this.setState({ uploading: true });
    // eslint-disable-next-line no-restricted-syntax
    for (const file of uploadFiles) {
      try {
        // eslint-disable-next-line no-continue
        if (['uploading', 'done'].includes(file.status)) continue;
        const payload = {
          ...formValues,
          title: file.name || `video ${formatDate(new Date(), 'DD MMM YYYY')}`,
          isSaleVideo,
          isSchedule,
          scheduledAt
        };
        if (payload.tags && payload.tags.length) {
          payload.tags = Array.isArray(payload.tags) ? payload.tags : [payload.tags];
          payload.tags = payload.tags.map((tag) => tag.replace(/\s+/g, '_').toLowerCase());
        } else delete payload.tags;
        // if (payload.categoryIds && payload.categoryIds.length) {
        //   payload.categoryIds = Array.isArray(payload.categoryIds) ? payload.categoryIds : [payload.categoryIds];
        // } else delete payload.categoryIds;
        if (payload.participantIds && payload.participantIds.length) {
          payload.participantIds = Array.isArray(payload.participantIds) ? payload.participantIds : [payload.participantIds];
        } else delete payload.participantIds;
        // eslint-disable-next-line no-await-in-loop
        await videoService.uploadVideo(
          [
            {
              fieldname: 'video',
              file
            }
          ],
          payload,
          this.onUploading.bind(this, file)
        );
      } catch (e) {
        message.error(`File ${file.name} error!`);
      }
    }
    message.success(t('common:successUpload'));
    Router.push('/model/my-video');
  }

  render() {
    const { t } = this.props.i18n;
    if (!this.formRef) this.formRef = createRef();
    const {
      uploading, fileList, isSaleVideo, isSchedule, scheduledAt, performers
    } = this.state;

    return (
      <Layout>
        <PageTitle title={t('common:titleUploadVideo')} />
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title={t('common:titleUploadVideo')}
          />
          <Form
            className="account-form"
            layout="vertical"
            onFinish={this.submit.bind(this)}
            validateMessages={validateMessages}
            ref={this.formRef}
            initialValues={{
              status: 'inactive',
              performerIds: [],
              tags: [],
              categoryIds: [],
              isSaleVideo: false,
              isSchedule: false,
              price: 9.99
            }}
          >
            <Row>
              <Col md={24} xs={24}>
                <Form.Item
                  label={t('common:participants')}
                  name="participantIds"
                >
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    showSearch
                    placeholder={t('common:searchPerformers')}
                    optionFilterProp="children"
                    onSearch={this.getPerformers.bind(this)}
                    loading={uploading}
                  >
                    {performers.map((p) => (
                      <Select.Option key={p._id} value={p._id}>
                        <Avatar style={{ width: 24, height: 24 }} src={p?.avatar || '/no-avatar.png'} />
                        {' '}
                        {p?.name || p?.username || 'N/A'}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col md={12} xs={12}>
                <Form.Item label={t('common:tags')} name="tags">
                  <Select
                    onChange={(val) => this.setFormVal('tags', val)}
                    mode="tags"
                    style={{ width: '100%' }}
                    size="middle"
                    showArrow={false}
                    defaultActiveFirstOption={false}
                    placeholder={t('common:tags')}
                  />
                </Form.Item>
              </Col>
              <Col md={12} xs={12}>
                <Form.Item name="status" label={t('common:labelStatus')} rules={[{ required: true, message: t('common:errRequireStatus') }]}>
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
              <Col md={12} xs={12}>
                <Form.Item name="isSale" label={t('common:isSale')} valuePropName="checked">
                  <Switch unCheckedChildren={t('common:subToView')} checkedChildren={t('common:payPerView')} onChange={(checked) => this.setState({ isSaleVideo: checked })} />
                </Form.Item>
              </Col>
              <Col md={12} xs={12}>
                {isSaleVideo && (
                  <Form.Item name="price" label={t('common:price')}>
                    <InputNumber style={{ width: '100%' }} min={1} />
                  </Form.Item>
                )}
              </Col>
              <Col md={12} xs={12}>
                <Form.Item name="isSchedule" label={t('common:isSchedule')} valuePropName="checked">
                  <Switch unCheckedChildren={t('common:recent')} checkedChildren={t('common:upcoming')} onChange={(checked) => this.setState({ isSchedule: checked })} />
                </Form.Item>
              </Col>
              <Col md={12} xs={12}>
                {isSchedule && (
                  <Form.Item label={t('common:upcomgingAt')}>
                    <DatePicker
                      style={{ width: '100%' }}
                      disabledDate={(currentDate) => currentDate && currentDate < moment().endOf('day')}
                      defaultValue={scheduledAt}
                      onChange={(date) => this.setState({ scheduledAt: date })}
                    />
                  </Form.Item>
                )}
              </Col>
            </Row>
            <Form.Item>
              <Dragger
                customRequest={() => false}
                accept="video/*"
                beforeUpload={this.beforeUpload.bind(this)}
                multiple
                showUploadList={false}
                disabled={uploading}
                listType="picture"
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">{t('common:uploadText')}</p>
                <p className="ant-upload-hint">{t('common:supUploadText')}</p>
              </Dragger>
              <VideoUploadList files={fileList} remove={this.remove.bind(this)} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={uploading} disabled={uploading || !fileList.length}>
                {t('common:uploadAll')}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Layout>
    );
  }
}

export default withTranslation(BulkUploadVideo);

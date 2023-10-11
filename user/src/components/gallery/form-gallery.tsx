/* eslint-disable react/require-default-props */
import { InboxOutlined } from '@ant-design/icons';
import PhotoUploadList from '@components/file/upload-list';
import {
  Button, Form, Input, Select, Upload
} from 'antd';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import { IGallery } from 'src/interfaces';

import style from './form-gallery.module.less';

type IProps = {
  gallery?: IGallery;
  onFinish: Function;
  submiting: boolean;
  filesList?: any[];
  handleBeforeUpload?: Function;
  removePhoto?: Function;
  setCover?: Function;
}

const { Dragger } = Upload;

function FormGallery({
  onFinish,
  submiting,
  filesList,
  handleBeforeUpload,
  removePhoto,
  setCover,
  gallery = null
}: IProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      name="galleryForm"
      onFinish={onFinish.bind(this)}
      initialValues={
        gallery || { name: '', status: 'active', description: '' }
      }
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      className={style['account-form']}
    >
      <Form.Item
        name="name"
        rules={[{ required: true, message: t('common:errNameGallery') }]}
        label={t('common:labelName')}
      >
        <Input placeholder={t('common:errEnterNameGallery')} />
      </Form.Item>
      <Form.Item
        name="description"
        label={t('common:labelDescription')}
      >
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item
        name="status"
        label={t('common:labelStatus')}
        rules={[{ required: true, message: t('common:errRequireStatus') }]}
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
      {gallery && (
        <Dragger
          customRequest={() => false}
          accept="image/*"
          multiple
          showUploadList={false}
          listType="picture"
          disabled={submiting}
          beforeUpload={handleBeforeUpload && handleBeforeUpload.bind(this)}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            {t('common:uploadImageHint')}
          </p>
          <p className="ant-upload-hint">
            {t('common:uploadImageDesc')}
          </p>
        </Dragger>
      )}
      {filesList && filesList.length > 0 && (
        <PhotoUploadList
          files={filesList}
          setCover={setCover && setCover.bind(this)}
          remove={removePhoto && removePhoto.bind(this)}
        />
      )}
      <Form.Item>
        <Button
          className="primary"
          htmlType="submit"
          loading={submiting}
          disabled={submiting}
          style={{ marginRight: '20px' }}
        >
          {t('common:submit')}
        </Button>
        <Button
          className="secondary"
          onClick={() => Router.back()}
        >
          {t('common:cancel')}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default FormGallery;

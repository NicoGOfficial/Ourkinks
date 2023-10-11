import {
  ArrowLeftOutlined
} from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import FormGallery from '@components/gallery/form-gallery';
import { getResponseError } from '@lib/utils';
import { Layout, message, PageHeader } from 'antd';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import { galleryService } from 'src/services';

function GalleryCreatePage() {
  const { t } = useTranslation();
  const [submiting, setSubmitting] = useState(false);

  const onFinish = async (data) => {
    try {
      setSubmitting(true);
      await galleryService.create(data);
      message.success(t('common:createdSuccessfully'));
      Router.push('/model/my-gallery/listing');
    } catch (e) {
      setSubmitting(false);
      message.error(getResponseError(await e) || t('common:errCommon'));
    }
  };

  return (
    <Layout>
      <PageTitle title={t('common:titleNewGallery')} />
      <div className="main-container">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title={t('common:titleNewGallery')}
        />
        <FormGallery
          submiting={submiting}
          onFinish={onFinish}
        />
      </div>
    </Layout>
  );
}

GalleryCreatePage.authenticate = true;
GalleryCreatePage.onlyPerformer = true;

export default GalleryCreatePage;

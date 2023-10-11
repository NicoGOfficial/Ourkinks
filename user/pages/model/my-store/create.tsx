import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import FormProduct from '@components/product/form-product';
import { getResponseError } from '@lib/utils';
import { productService } from '@services/product.service';
import { Layout, message, PageHeader } from 'antd';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';

interface IFiles {
  fieldname: string;
  file: File;
}

interface IResponse {
  data: { _id: string };
}

class CreateProduct extends PureComponent<any> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    uploading: false,
    uploadPercentage: 0
  };

  _files: {
    digitalFile: File;
  } = {
      digitalFile: null
    };

  onUploading(resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
  }

  beforeUpload(file: File) {
    this._files.digitalFile = file;
  }

  async submit(data: any) {
    const { t } = this.props.i18n;
    if (data.type === 'digital' && !this._files.digitalFile) {
      message.error(t('common:selectDigital'));
      return;
    }
    if (data.type === 'physical') {
      this._files.digitalFile = null;
    }

    const files = Object.keys(this._files).reduce((tmpFiles, key) => {
      if (this._files[key]) {
        tmpFiles.push({
          fieldname: key,
          file: this._files[key] || null
        });
      }
      return tmpFiles;
    }, [] as IFiles[]) as [IFiles];

    await this.setState({
      uploading: true
    });
    try {
      (await productService.createProduct(
        files,
        data,
        this.onUploading.bind(this)
      )) as IResponse;
      message.success(t('common:productCreated'));
      Router.push('/model/my-store');
    } catch (error) {
      message.error(getResponseError(await error) || t('common:errCommon'));
      this.setState({ uploading: false });
    }
  }

  render() {
    const { t } = this.props.i18n;
    const { uploading, uploadPercentage } = this.state;
    return (
      <Layout>
        <PageTitle title={t('common:titleNewProduct')} />
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title={t('common:titleNewProduct')}
          />
          <FormProduct
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

export default withTranslation(CreateProduct);

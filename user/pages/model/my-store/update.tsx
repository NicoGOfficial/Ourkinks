import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import FormProduct from '@components/product/form-product';
import { getResponseError } from '@lib/utils';
import { productService } from '@services/product.service';
import {
  Layout, message, PageHeader,
  Spin
} from 'antd';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { IProduct } from 'src/interfaces';

type IProps = {
  id: string;
  i18n: any;
}

interface IFiles {
  fieldname: string;
  file: File;
}

class ProductUpdate extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    submitting: false,
    fetching: true,
    product: {} as IProduct,
    uploadPercentage: 0
  };

  _files: {
    digitalFile: File;
  } = {
      digitalFile: null
    };

  static async getInitialProps(ctx) {
    return ctx.query;
  }

  async componentDidMount() {
    const { t } = this.props.i18n;
    try {
      const { id } = this.props;
      const resp = await productService.findById(id);
      this.setState({ product: resp.data });
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(getResponseError(err) || t('common:NoProduct'));
    } finally {
      this.setState({ fetching: false });
    }
  }

  onUploading(resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
  }

  beforeUpload(file: File) {
    this._files.digitalFile = file;
  }

  async submit(data: any) {
    const { t } = this.props.i18n;
    try {
      const { id } = this.props;
      const files = Object.keys(this._files).reduce((tmpFiles, key) => {
        if (this._files[key]) {
          tmpFiles.push({
            fieldname: key,
            file: this._files[key] || null
          });
        }
        return tmpFiles;
      }, [] as IFiles[]) as [IFiles];

      this.setState({ submitting: true });

      const submitData = {
        ...data
      };
      await productService.update(
        id,
        files,
        submitData,
        this.onUploading.bind(this)
      );
      message.success(t('common:updatedSuccess'));
      Router.push('/model/my-store');
    } catch (e) {
      message.error(getResponseError(await e) || t('common:errCommon'));
      this.setState({ submitting: false });
    }
  }

  render() {
    const { t } = this.props.i18n;
    const {
      product, submitting, fetching, uploadPercentage
    } = this.state;
    return (
      <Layout>
        <PageTitle title={t('common:editProduct')} />
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title={t('common:editProduct')}
          />
          {!fetching && product ? (
            <FormProduct
              product={product}
              submit={this.submit.bind(this)}
              uploading={submitting}
              beforeUpload={this.beforeUpload.bind(this)}
              uploadPercentage={uploadPercentage}
            />
          ) : <div className="text-center"><Spin /></div>}
        </div>
      </Layout>
    );
  }
}

export default withTranslation(ProductUpdate);

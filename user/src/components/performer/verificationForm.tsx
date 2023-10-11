import './performer.module.less';

import {
  Alert,
  Col, Form, Image, message, Row
} from 'antd';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { IPerformer } from 'src/interfaces';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

type IProps = {
  onFinish: Function;
  user: IPerformer;
  updating: boolean;
  i18n: any;
}

class PerformerVerificationForm extends PureComponent<IProps> {
  idVerificationFileId: string;

  documentVerificationFileId: string;

  state = {
    idImage: '',
    documentImage: ''
  };

  componentDidMount() {
    const { user } = this.props;
    if (user.documentVerification) {
      this.documentVerificationFileId = user?.documentVerification?._id;
      this.setState({ documentImage: user?.documentVerification?.url });
    }
    if (user.idVerification) {
      this.idVerificationFileId = user?.idVerification?._id;
      this.setState({ idImage: user?.idVerification?.url });
    }
  }

  render() {
    const { t } = this.props.i18n;
    const {
      onFinish
    } = this.props;
    const {
      idImage, documentImage
    } = this.state;

    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={(values) => {
          if (!this.idVerificationFileId || !this.documentVerificationFileId) {
            return message.error(t('common:requiredID'), 5);
          }
          const data = { ...values };
          data.idVerificationId = this.idVerificationFileId;
          data.documentVerificationId = this.documentVerificationFileId;
          return onFinish(data);
        }}
        labelAlign="left"
        className="account-form"
      >
        <Row>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              labelCol={{ span: 24 }}
              label={t('common:idPhoto')}
              valuePropName="fileList"
              className="model-photo-verification"
              help={t('common:documentVerificationId')}
            >
              <div className="document-upload text-center">
                {documentImage ? (
                  <Image alt="id-img" src={documentImage} style={{ height: '140px' }} />
                ) : <img src="/front-id.png" height="140px" alt="id" />}
              </div>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              labelCol={{ span: 24 }}
              label={t('common:holadingIDPhoto')}
              valuePropName="fileList"
              className="model-photo-verification"
              help={t('common:idVerificationId')}
            >
              <div className="document-upload text-center">
                {idImage ? (
                  <Image alt="id-img" src={idImage} style={{ height: '140px' }} />
                ) : <img src="/holding-id.jpg" height="140px" alt="holding-id" />}
              </div>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Alert message={(
            <div className="text-center">
              {t('common:msgUpdateId')}
              {' '}
              <a href="/contact">{t('common:theContactPage')}</a>
              !
            </div>
          )}
          />
        </Form.Item>
      </Form>
    );
  }
}

export default withTranslation(PerformerVerificationForm);

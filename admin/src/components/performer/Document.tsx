import { ImageUpload } from '@components/file/image-upload';
import { authService, performerService } from '@services/index';
import {
  Button, Col, Form, Image,
  Row
} from 'antd';
import { PureComponent } from 'react';
import { IPerformer } from 'src/interfaces';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

interface IProps {
  onUploaded: Function;
  performer: IPerformer;
  onFinish: Function;
  submiting: boolean;
}

export class PerformerDocument extends PureComponent<IProps> {
  state = {
    idVerificationUrl: '',
    documentVerificationUrl: ''
  };

  componentDidMount() {
    const { performer } = this.props;
    this.setState({
      idVerificationUrl: performer?.idVerification?.url || '',
      documentVerificationUrl: performer?.documentVerification?.url || ''
    });
  }

  render() {
    const {
      onUploaded, onFinish, submiting, performer
    } = this.props;
    const { idVerificationUrl, documentVerificationUrl } = this.state;
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    return (
      <Form {...layout} name="form-performer" onFinish={onFinish.bind(this)}>
        <Row>
          <Col xs={24} md={12}>
            <Form.Item label="ID photo">
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <ImageUpload
                  uploadUrl={`${performerService.getUploadDocumentUrl()}/${performer._id}`}
                  headers={uploadHeaders}
                  onUploaded={(resp) => {
                    this.setState({ documentVerificationUrl: resp.response.data.url });
                    onUploaded('documentVerificationId', resp);
                  }}
                />
                {documentVerificationUrl ? (
                  <Image src={documentVerificationUrl} width="150px" />
                ) : <img width="150px" src="/id-document.png" alt="holding-id" />}
              </div>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Holding ID photo">
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <ImageUpload
                  uploadUrl={`${performerService.getUploadDocumentUrl()}/${performer._id}`}
                  headers={uploadHeaders}
                  onUploaded={(resp) => {
                    this.setState({ idVerificationUrl: resp.response.data.url });
                    onUploaded('idVerificationId', resp);
                  }}
                />
                {idVerificationUrl ? (<Image src={idVerificationUrl} width="150px" />) : <img width="150px" src="/id-img.jpeg" alt="id-pt" />}
              </div>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item className="text-center">
          <Button type="primary" htmlType="submit" disabled={submiting} loading={submiting}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

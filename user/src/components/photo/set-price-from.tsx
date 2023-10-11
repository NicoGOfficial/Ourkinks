import {
  Button,
  Col, Form, InputNumber, Row, Switch
} from 'antd';
import useTranslation from 'next-translate/useTranslation';

type IProps = {
  photo: any;
  submit: Function;
  loading: boolean;
}

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 }
};

export function SetPhotoPrice({ photo, submit, loading }: IProps) {
  const { t } = useTranslation();

  return (
    <Row className="update-photo-form">
      <Col span={24} className="title">
        <h3>{photo.title}</h3>
        <img src={photo.photo.url} alt={photo.title} width={300} />
      </Col>
      <Form
        onFinish={(value) => submit(value)}
        {...formItemLayout}
        initialValues={{
          price: photo?.price,
          isSale: photo?.isSale
        }}
      >
        <Col span={24}>
          <Form.Item
            name="isSale"
            label={t('common:isSale')}
            valuePropName="checked"
          >
            <Switch
            // defaultChecked={photo.isSale}
              checkedChildren={t('common:payPerView')}
              unCheckedChildren={t('common:subToView')}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="price" label={t('common:price')}>
            <InputNumber style={{ width: '100%' }} min={0.1} step={0.1} placeholder={t('common:price')} />
          </Form.Item>
        </Col>
        <Col span={24} className="submit">
          <Button className="primary" htmlType="submit" disabled={loading}>
            {t('common:update')}
          </Button>
        </Col>
      </Form>
    </Row>
  );
}

export default SetPhotoPrice;

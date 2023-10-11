import {
  Button, Form, Input, InputNumber, Select
} from 'antd';
import { createRef, PureComponent } from 'react';
import { IToken } from 'src/interfaces/wallet-package';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
};
interface IProps {
  packageToken: IToken;
  onFinish: Function;
  submitting?: boolean;
}
export default class FormTokenPackage extends PureComponent<IProps> {
  formRef: any;

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    submitting: false
  };

  state = {
    // searching: false,
    // users: []
  };

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
  }

  // setFormVal(field: string, val: any) {
  //   const instance = this.formRef.current as FormInstance;
  //   instance.setFieldsValue({
  //     [field]: val
  //   });
  // }

  render() {
    const { submitting, onFinish, packageToken } = this.props;
    if (!this.formRef) this.formRef = createRef();

    return (
      <Form
        {...layout}
        ref={this.formRef}
        onFinish={onFinish.bind(this)}
        initialValues={
          packageToken || {
            isActive: true
          } as IToken
        }
        layout="vertical"
      >
        <Form.Item name="name" rules={[{ required: true, message: 'Please input name of wallet package!' }]} label="Name">
          <Input placeholder="Enter Wallet package name" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="price" rules={[{ required: true, message: 'Please input price of wallet package!' }]} label="Price">
          <InputNumber pattern="^\d*(\.\d{0,2})?$" min={0} />
        </Form.Item>
        <Form.Item name="token" rules={[{ required: true, message: 'Please input wallet of wallet package!' }]} label="Wallet Balance">
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item name="url" label="Link">
          <Input type="text" />
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
          {/* <Switch
            defaultChecked
            checkedChildren="Actived"
            unCheckedChildren="Deactived"
          /> */}

        </Form.Item>
        <Form.Item name="ordering" label="Ordering">
          <InputNumber />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

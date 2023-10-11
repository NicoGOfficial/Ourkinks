import { formatDate } from '@lib/index';
import {
  Button, Form, Input, Select
} from 'antd';
import { createRef, PureComponent } from 'react';
import { IPayoutRequest } from 'src/interfaces';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
};

const paymentAccountInfoProps = [
  { v: 'First Name', key: 'firstName' },
  { v: 'Last Name', key: 'lastName' },
  { v: 'SSN', key: 'SSN' },
  { v: 'Bank Name', key: 'bankName' },
  { v: 'Bank Account', key: 'bankAccount' },
  { v: 'Bank Routing', key: 'bankRouting' },
  { v: 'Bank Swift Code', key: 'bankSwiftCode' },
  { v: 'Address', key: 'address' },
  { v: 'City', key: 'city' },
  { v: 'State', key: 'state' },
  { v: 'Country', key: 'country' }
];

interface IProps {
  payoutRequest: IPayoutRequest;
  onFinish: () => Function;
  submitting?: boolean;
}
export default class FormPayoutRequest extends PureComponent<IProps> {
  formRef: any;

  state = {
    // searching: false,
    // users: []
  };

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    submitting: false
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
    const { submitting, onFinish, payoutRequest } = this.props;
    const {
      sourceInfo, paymentAccountInfo, paymentAccountType, tokenMustPay, fromDate, toDate
    } = payoutRequest;
    if (!this.formRef) this.formRef = createRef();
    return (
      <div>
        <h3>Payment Account Info</h3>
        <p>
          Name:
          {' '}
          {sourceInfo?.name}
        </p>
        {
          paymentAccountType === 'paypal' ? (
            <>
              <p>
                Email:
                {' '}
                {paymentAccountInfo?.email}
              </p>
              <p>
                Tokens requested:
                {' '}
                {tokenMustPay}
              </p>
              <p>
                Date:
                {' '}
                {`${formatDate(fromDate)} - ${formatDate(toDate)}`}
              </p>
            </>
          )
            : (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {paymentAccountInfo && paymentAccountInfoProps.map((p) => <p key={p.key}>{`${p.v}: ${paymentAccountInfo[p.key]}`}</p>)}
              </>
            )
        }
        <Form
          {...layout}
          ref={this.formRef}
          onFinish={onFinish}
          initialValues={{
            status: 'pending',
            ...payoutRequest
          }}
          layout="vertical"
        >
          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status!' }]}>
            <Select>
              <Select.Option key="pending" value="pending">
                PENDING
              </Select.Option>
              <Select.Option key="approved" value="approved">
                APPROVED
              </Select.Option>
              <Select.Option key="rejected" value="rejected">
                REJECTED
              </Select.Option>
              <Select.Option key="done" value="done">
                DONE
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="adminNote" label="Note">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

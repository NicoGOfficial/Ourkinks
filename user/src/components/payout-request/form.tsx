import { InfoCircleOutlined } from '@ant-design/icons';
import { payoutRequestService } from '@services/payout-request.service';
import {
  Alert, Button, DatePicker, Divider, Form, Input, InputNumber, message, Select, Space, Statistic, Tag, Tooltip
} from 'antd';
import moment from 'moment';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import {
  IPerformer,
  PayoutRequestInterface
} from 'src/interfaces';

interface Props {
  submit: Function;
  submiting: boolean;
  payout?: Partial<PayoutRequestInterface>;
  statsPayout: {
    totalPrice: number;
    paidPrice: number;
    unpaidPrice: number;
  };
  performer: IPerformer
}

function PayoutRequestForm({
  payout = {
    requestNote: '',
    paymentAccountType: 'banking'
  },
  submit, submiting, statsPayout, performer
}: Props) {
  const { t } = useTranslation();
  const {
    requestNote, fromDate, toDate, requestedPrice, status, paymentAccountType
  } = payout;
  const [form] = Form.useForm();
  const [price, setPrice] = useState(requestedPrice || 0);
  const [dateRange, setDateRange] = useState({ fromDate: fromDate ? moment(fromDate) : '', toDate: toDate ? moment(toDate) : '' } as any);
  const getUnpaidPriceByDate = async (range) => {
    const resp = await payoutRequestService.calculate(range);
    setPrice(resp?.data?.unpaidPrice || 0);
  };
  useEffect(() => {
    getUnpaidPriceByDate(dateRange);
  }, [dateRange]);

  const renderRequestPriceText = () => (
    <span>
      {t('common:renderRequestPriceText')}
      {' '}
      <Tooltip placement="top" title={t('common:titleRequestPriceText')}>
        <InfoCircleOutlined style={{ color: 'red' }} />
      </Tooltip>
    </span>
  );

  return (
    <Form
      form={form}
      layout="vertical"
      className="payout-request-form"
      name="payoutRequestForm"
      onFinish={(data) => {
        if (!dateRange.fromDate || !dateRange.toDate) {
          message.error(t('common:errSelectDateRange'));
          return;
        }
        if (!price) {
          message.error(t('common:errHaveBeenPaidOut'));
          return;
        }
        submit({ ...data, ...dateRange });
      }}
      initialValues={{
        requestNote,
        paymentAccountType
      }}
    >
      <div>
        <Space size="large">
          <Statistic
            title={t('common:modelEarning')}
            value={statsPayout?.totalPrice || 0}
            precision={2}
            prefix="$"
          />
          <Statistic
            title={t('common:totalUnpaidBalance')}
            value={statsPayout?.unpaidPrice || 0}
            precision={2}
            prefix="$"
          />
          <Statistic
            title={t('common:totalPaid')}
            value={statsPayout?.paidPrice || 0}
            precision={2}
            prefix="$"
          />
        </Space>
      </div>
      <Divider />
      <Form.Item label={t('common:errSelectDateRange')}>
        <DatePicker.RangePicker
          defaultValue={[dateRange.fromDate, dateRange.toDate]}
          onChange={(dates: [any, any], dateStrings: [string, string]) => setDateRange({
            fromDate: dateStrings[0],
            toDate: dateStrings[1]
          })}
          disabledDate={(current) => {
            const customDate = moment().format('YYYY-MM-DD');
            return current && current >= moment(customDate, 'YYYY-MM-DD');
          }}
        />
      </Form.Item>
      <Form.Item label={renderRequestPriceText()}>
        <InputNumber disabled value={price} min={0} />
      </Form.Item>
      <Form.Item label={t('common:requestNote')} name="requestNote">
        <Input.TextArea disabled={payout && payout.status === 'done'} placeholder={t('common:placeholderRequestNote')} rows={3} />
      </Form.Item>
      {payout?.adminNote && (
        <Form.Item label={t('common:adminNotes')}>
          <Alert type="info" message={payout?.adminNote} />
        </Form.Item>
      )}
      {payout._id && (
        <Form.Item label={t('common:labelStatus')}>
          <Tag color="orange" style={{ textTransform: 'capitalize' }}>{status}</Tag>
        </Form.Item>
      )}
      <Form.Item
        label={t('common:selectPayoutMethod')}
        name="paymentAccountType"
        rules={[
          { required: true, message: t('common:errRequirePayoutMethod') }
        ]}
      >
        <Select>
          <Select.Option value="banking" key="banking" disabled={!performer.bankingInformation}>
            <img src="/banking-ico.png" height="20px" alt="banking" />
            {' '}
            {t('common:banking')}
          </Select.Option>
          <Select.Option value="paypal" key="paypal" disabled={!performer.paypalSetting}>
            <img src="/paypal-ico.png" height="20px" alt="paypal" />
            {' '}
            {t('common:paypal')}
          </Select.Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button
          className="primary"
          loading={submiting}
          htmlType="submit"
          disabled={['done', 'approved'].includes(status) || submiting}
          style={{ margin: '0 5px' }}
        >
          {t('common:submit')}
        </Button>
        <Button
          className="secondary"
          loading={submiting}
          htmlType="button"
          disabled={submiting}
          style={{ margin: '0 5px' }}
          onClick={() => Router.back()}
        >
          {t('common:cancel')}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default PayoutRequestForm;

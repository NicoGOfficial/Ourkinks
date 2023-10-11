import { Alert, Modal } from 'antd';
import React from 'react';

import Form from './form';

interface TippingModalProps {
  visible: boolean;
  submitting: boolean;
  error: boolean;
  errorMessage: string;
  sendTip: Function;
  onCancel: any;
}

function TippingModal({
  visible, sendTip, onCancel, error, errorMessage, submitting
}: TippingModalProps) {
  const [amount, setAmount] = React.useState(0);
  const onOK = () => {
    sendTip(amount);
  };

  const onChange = (data: any) => {
    setAmount(data.amount);
  };

  return (
    <Modal
      visible={visible}
      title={<p style={{ textAlign: 'center' }}>Tip</p>}
      onOk={onOK}
      onCancel={onCancel}
      confirmLoading={submitting}
      destroyOnClose
    >
      {error && <Alert type="error" message={errorMessage} showIcon />}
      <Form onChange={onChange} />
    </Modal>
  );
}

export default TippingModal;

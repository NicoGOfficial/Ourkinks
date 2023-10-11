import { performerService } from '@services/performer.service';
import {
  Button, Col, Modal, Row
} from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRef, useState } from 'react';

import style from './commission-check-button.module.less';

export function CommissionCheckButton() {
  const { t } = useTranslation();
  const loading = useRef(false);
  const [showModal, setShowModal] = useState(false);
  const [commission, setCommission] = useState(null);

  const loadCommission = async () => {
    if (loading.current) return;

    loading.current = true;
    const resp = await performerService.getCommissions();
    const data = {
      monthlySubscriptionCommission: resp.data.monthlySubscriptionCommission * 100,
      productSaleCommission: resp.data.productSaleCommission * 100,
      feedSaleCommission: resp.data.feedSaleCommission * 100,
      videoSaleCommission: resp.data.videoSaleCommission * 100,
      yearlySubscriptionCommission: resp.data.yearlySubscriptionCommission * 100,
      tokenTipCommission: resp.data.tokenTipCommission * 100,
      privateChatCommission: resp.data.privateChatCommission * 100
    };
    setCommission(data);
    setShowModal(true);
    loading.current = false;
  };

  return (
    <div>
      <Button onClick={loadCommission}>
        {t('common:btnCheckAdminCommisstion')}
      </Button>
      <Modal
        title={t('common:adminCommission')}
        visible={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        className={style['modal-earning']}
      >
        <Row>
          <Col span={12} className="modal-earning-item">
            <div className="modal-earning-item__header">
              <h4>{t('common:monthlyCommission')}</h4>
              {' '}
              <p>
                {commission?.monthlySubscriptionCommission.toFixed(0)}
                %
              </p>
            </div>
          </Col>
          <Col span={12} className="modal-earning-item">
            <div className="modal-earning-item__header">
              <h4>{t('common:yearlyCommission')}</h4>
              {' '}
              <p>
                {commission?.yearlySubscriptionCommission.toFixed(0)}
                %
              </p>
            </div>
          </Col>
          <Col span={12} className="modal-earning-item">
            <div className="modal-earning-item__header">
              <h4>{t('common:productCommission')}</h4>
              {' '}
              <p>
                {commission?.productSaleCommission.toFixed(0)}
                %
              </p>
            </div>
          </Col>
          <Col span={12} className="modal-earning-item">
            <div className="modal-earning-item__header">
              <h4>{t('common:videoCommission')}</h4>
              {' '}
              <p>
                {commission?.videoSaleCommission.toFixed(0)}
                %
              </p>
            </div>
          </Col>
          <Col span={12} className="modal-earning-item">
            <div className="modal-earning-item__header">
              <h4>{t('common:c2cCommission')}</h4>
              {' '}
              <p>
                {commission?.privateChatCommission.toFixed(0)}
                %
              </p>
            </div>
          </Col>
          <Col span={12} className="modal-earning-item">
            <div className="modal-earning-item__header">
              <h4>{t('common:tipCommission')}</h4>
              {' '}
              <p>
                {commission?.tokenTipCommission.toFixed(0)}
                %
              </p>
            </div>
          </Col>
          <Col span={12} className="modal-earning-item">
            <div className="modal-earning-item__header">
              <h4>{t('common:feedSaleComminssion')}</h4>
              {' '}
              <p>
                {commission?.feedSaleCommission.toFixed(0)}
                %
              </p>
            </div>
          </Col>
        </Row>
      </Modal>
    </div>
  );
}

export default CommissionCheckButton;

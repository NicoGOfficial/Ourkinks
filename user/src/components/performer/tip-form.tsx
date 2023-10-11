import {
  CheckCircleOutlined
} from '@ant-design/icons';
import {
  Button,
  InputNumber
} from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import { IPerformer } from 'src/interfaces/index';

import style from './performer.module.less';

interface IProps {
  performer: IPerformer;
  onFinish(price: any): Function;
  submiting: boolean;
}

export function TipPerformerForm({ performer, onFinish, submiting }: IProps) {
  const { t } = useTranslation();
  const [price, setPrice] = useState(10);
  return (
    <div className={style['confirm-subscription-form']}>
      <div className="profile-cover" style={{ backgroundImage: 'url(\'/banner-image.jpg\')' }} />
      <div className="profile-info">
        <img
          alt="main-avt"
          src={performer?.avatar || '/no-avatar.png'}
        />
        <div className="m-user-name">
          <h4>
            {performer?.name || 'N/A'}
            &nbsp;
            {performer?.verifiedAccount && (
              <CheckCircleOutlined className="theme-color" />
            )}
          </h4>
          <h5 style={{ textTransform: 'none' }}>
            @
            {performer?.username || 'n/a'}
          </h5>
        </div>
      </div>
      <div className="info-body">
        <div style={{ margin: '0 0 20px', textAlign: 'center' }}>
          <p>
            {t('common:enterYourAmount')}
            {' '}
          </p>
          <InputNumber min={1} onChange={(value) => setPrice(value)} value={price} />
        </div>
      </div>
      <Button type="primary" disabled={submiting} loading={submiting} onClick={() => onFinish(price)}>SEND TIP</Button>
    </div>
  );
}

import { CheckSquareOutlined } from '@ant-design/icons';
import Price from '@components/price';
import {
  Button, Radio
} from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import { IPerformer, ISettings } from 'src/interfaces';

import style from './subscription-block.module.less';

type IProps = {
  performer: IPerformer;
  onSelect: Function;
  disabled: boolean;
  settings: ISettings;
  type?: string;
}

export function SubscriptionPerformerBlock({
  performer,
  onSelect,
  disabled,
  settings,
  type = ''
}: IProps) {
  const { t } = useTranslation();
  const [gateway, setGateway] = useState('ccbill');
  return (
    <div className={style['subscription-block']}>
      <h4>
        {t('common:subscribeAndGetBenefits')}
      </h4>
      <ul>
        <li>
          <CheckSquareOutlined />
          {' '}
          {t('common:subFullAccess')}
        </li>
        <li>
          <CheckSquareOutlined />
          {' '}
          {t('common:directMessage')}
        </li>
        <li>
          <CheckSquareOutlined />
          {' '}
          {t('common:cancelYourSubscription')}
        </li>
      </ul>
      <Radio.Group onChange={(e) => setGateway(e.target.value)} value={gateway}>
        {settings?.ccbillEnabled && (
          <Radio value="ccbill">
            <img src="/ccbill-ico.png" height="20px" alt="ccbill" />
          </Radio>
        )}
        {settings?.verotelEnabled && (
          <Radio value="verotel">
            <img src="/verotel-ico.png" height="20px" alt="verotel" />
          </Radio>
        )}
        {/* {ui?.enablePagseguro && (
                          <Radio value="pagseguro">
                            <img src="/pagseguro-ico.png" height="20px" alt="pagseguro" />
                          </Radio>
                          )} */}
      </Radio.Group>
      {(!settings?.ccbillEnabled && !settings?.verotelEnabled) && <p>{t('common:noPaymentGateway')}</p>}
      {!type ? (
        <>
          <Button
            className="primary"
            block
            disabled={disabled}
            onClick={() => onSelect(gateway, 'monthly')}
          >
            {t('common:monthlySubscription')}
            {' '}
            <Price amount={performer?.monthlyPrice} />
          </Button>
          <div style={{ margin: 2 }} />
          <Button
            className="secondary"
            block
            disabled={disabled}
            onClick={() => onSelect(gateway, 'yearly')}
          >
            {t('common:yearlySubscription')}
            {' '}
            <Price amount={performer?.yearlyPrice} />
          </Button>
        </>
      ) : (
        <Button
          style={{ textTransform: 'uppercase' }}
          className="primary"
          disabled={disabled}
          onClick={() => onSelect(gateway)}
        >
          {t('common:confirm')}
          {' '}
          {type}
          {' '}
          {t('common:subscriptionFor')}
          {' '}
          $
          {type === 'monthly' ? (performer?.monthlyPrice || 0).toFixed(2) : (performer?.yearlyPrice || 0).toFixed(2)}
        </Button>
      )}
    </div>
  );
}

export default SubscriptionPerformerBlock;

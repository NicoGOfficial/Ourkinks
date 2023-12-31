import useTranslation from 'next-translate/useTranslation';
import { TickIcon } from 'src/icons';
import { IPerformer, ISettings } from 'src/interfaces';

import style from './confirm-subscription.module.less';
import { SubscriptionPerformerBlock } from './subscription-block';

type IProps = {
  settings: ISettings;
  type: string;
  performer: IPerformer;
  onFinish: Function;
  submiting: boolean;
}

export function ConfirmSubscriptionPerformerForm({
  onFinish, submiting = false, performer, type, settings
}: IProps) {
  const { t } = useTranslation();
  const { ccbillEnabled, verotelEnabled } = settings;
  return (
    <div className={style['confirm-purchase-form']}>
      <div
        className="per-info"
        style={{
          backgroundImage:
            performer?.cover
              ? `url('${performer?.cover}')`
              : "url('/banner-image.jpg')"
        }}
      >
        <div className="per-avt">
          <img alt="" src={performer?.avatar || '/no-avatar.png'} />
          <span className="per-name">
            <a>
              {performer?.name || 'N/A'}
              {' '}
              {performer?.verifiedAccount && <TickIcon />}
            </a>
            <small>
              @
              {performer?.username || 'n/a'}
            </small>
          </span>
        </div>
      </div>
      <div className="info-body">
        <h3>
          {t('common:subscribeAndGetBenefits')}
        </h3>
        <SubscriptionPerformerBlock disabled={(!ccbillEnabled && !verotelEnabled) || submiting} type={type} settings={settings} performer={performer} onSelect={onFinish} />
      </div>
    </div>
  );
}

export default ConfirmSubscriptionPerformerForm;

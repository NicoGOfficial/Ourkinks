import { IUser } from '@interfaces/index';
// import { paymentWalletService } from '@services/payment-wallet.service';
import { Image } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';

import style from './Message.module.less';

type IProps = {
  data: any;
  isMine: boolean;
  startsSequence: boolean;
  endsSequence: boolean;
  showTimestamp: boolean;
  currentUser: IUser,
  recipient: IUser,
  handleBuyMessage: Function;
}

export default function Message(props: IProps) {
  const { t } = useTranslation();
  const {
    data, isMine, startsSequence, endsSequence, showTimestamp, currentUser, recipient, handleBuyMessage
  } = props;

  const friendlyTimestamp = moment(data.createdAt).format('LLLL');

  return (
    <div
      className={[
        `${style.message}`,
        `${isMine ? style.mine : ''} `,
        `${startsSequence ? 'start' : ''} `,
        `${endsSequence ? 'end' : ''} `
      ].join(' ')}
    >

      {data.text && (
        <div className={style['bubble-container']}>
          {!isMine && <img alt="" className={style.avatar} src={recipient?.avatar || '/no-avatar.png'} />}
          {!currentUser.isPerformer && data.price > 0 && !data.isbought ? (
            <div
              className={classNames(style.bubble, 'sell-message')}
              title={friendlyTimestamp}
              onClick={() => handleBuyMessage(data)}
              aria-hidden
            >
              {t('common:buyToSee')}
            </div>
          ) : (
            <>
              {!data.imageUrl && (
                <div className={style.bubble} title={friendlyTimestamp}>
                  {data.text}
                </div>
              )}
              {/* {data.imageUrl && (
                <div className={style['bubble-image']} title={friendlyTimestamp}>
                  <Image alt="" src={data.imageUrl} width="180px" />
                </div>
              )} */}
            </>
          )}

          {isMine && <img alt="" src={currentUser?.avatar || '/no-avatar.png'} className={style.avatar} />}
        </div>

      )}
      {data.imageUrl && (
        <div className={style['bubble-container']}>
          <div className={style['bubble-image']} title={friendlyTimestamp}>
            <Image alt="" src={data.imageUrl} width="180px" />
          </div>
        </div>
      )}
      {showTimestamp && <div className={style.timestamp}>{friendlyTimestamp}</div>}
    </div>
  );
}

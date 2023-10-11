import { paymentService } from '@services/index';
import {
  Button, Col, Input,
  message, Radio, Row
} from 'antd';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { IFeed, ISettings, IUser } from 'src/interfaces';

import style from './index.module.less';

interface IProps {
  feed: IFeed;
}

export function PurchaseFeedForm({ feed }: IProps) {
  const { t } = useTranslation();
  const [paymentGateway, setPaymentGateway] = useState('ccbill');
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [applyCode, setApplyCode] = useState(false);
  const [price, setPrice] = useState(feed.price);
  const user: IUser = useSelector((state: any) => state.user.current);
  const settings: ISettings = useSelector((state: any) => state.settings);
  const purchaseFeed = async () => {
    if (!user || !user._id) {
      message.error(t('common:plsLoginOrRegisterToPurchaseFeed'));
      Router.push('/auth/login');
      return;
    }
    try {
      setLoading(true);
      if (paymentGateway === 'wallet') {
        await paymentService.purchaseFeedWallet(feed._id);
        message.success(t('common:purchasedFeedSuccessfully'));
        Router.reload();
      } else {
        const resp = await (await paymentService.purchaseFeed({ feedId: feed._id, couponCode: coupon?.code || null, paymentGateway })).data;
        if (resp) {
          message.info(
            t('common:paymentRedirecting'),
            30
          );
          if (['ccbill', 'verotel'].includes(paymentGateway)) { window.location.href = resp.paymentUrl; }
        }
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || t('common:errCommon'));
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    try {
      const resp = await paymentService.applyCoupon(couponCode);
      setCoupon(resp.data);
      setApplyCode(true);
      resp.data.value && setPrice(feed.price - resp.data.value * feed.price);
      message.success('Coupon is applied');
    } catch (error) {
      const e = await error;
      message.error(
        e && e.message ? e.message : t('common:errCommon')
      );
    }
  };

  const cancelApplyCoupon = () => {
    setPrice(feed.price);
    setCoupon(null);
    setApplyCode(false);
    setCouponCode('');
  };

  return (
    <div className={style['purchase-feed-form']}>
      <div className="title">
        <h3>
          {t('common:comfirmPurchasePost', { username: feed.performer.username })}
        </h3>
        <h4>
          {feed.text.length < 100 ? feed.text : `${feed.text.slice(0, 99)}...`}
        </h4>
      </div>
      <div>
        <Radio.Group onChange={(e) => setPaymentGateway(e.target.value)} value={paymentGateway}>
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
          <Radio value="wallet" className="radio-wallet">
            <div className="radio-wallet__wrapper">
              <img
                src="/loading-wallet-icon.png"
                height="20px"
                alt="wallet"
              />
              <p className="text">
                {t('common:wallet')}
                {' '}
                (
                {user.balance.toFixed(2)}
                )
              </p>
            </div>
          </Radio>
        </Radio.Group>
      </div>
      <Row>
        <Col span={16}>
          <Input disabled={applyCode} placeholder={t('common:couponPlaceholder')} onChange={(v) => setCouponCode(v.target.value)} />
        </Col>
        <Col span={8}>
          {!applyCode ? <Button onClick={() => applyCoupon()}>{t('common:applyCode')}</Button>
            : <Button onClick={() => cancelApplyCoupon()}>{t('common:useCouponLater')}</Button>}
        </Col>
      </Row>
      <Button
        className="primary"
        type="primary"
        style={{ marginTop: '15px' }}
        htmlType="submit"
        onClick={() => purchaseFeed()}
        disabled={loading}
      >
        {t('common:confirmPurchaseFeed')}
        {price.toFixed(2)}
      </Button>
    </div>
  );
}

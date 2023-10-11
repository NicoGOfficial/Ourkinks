import { ArrowLeftOutlined } from '@ant-design/icons';
import { getResponseError } from '@lib/utils';
import {
  Divider,
  Layout,
  message,
  PageHeader
} from 'antd';
import moment from 'moment';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import {
  IPerformer,
  IUIConfig
} from 'src/interfaces';
import { performerService } from 'src/services';

const PerformerMonthlyStatsChart = dynamic(() => import('src/components/performer/charts/performer-monthly-stats-chart'), {
  ssr: false
});

interface IProps {
  ui: IUIConfig;
  performer: IPerformer;
}

interface Stats {
  totalEarning: number,
  totalNewSubscriptions: number,
  totalLostSubscriptions: number,
  totalTips: number,
  totalStreamingTime: number,
  month: number,
  year: number,
}

function getLable(stat: Stats) {
  return `${stat.month}-${stat.year}`;
}

function MonthStats({ ui, performer }: IProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<Stats[]>();
  const [loading, setLoading] = useState(true);

  const getStatsForLast12Months = async () => {
    try {
      setLoading(true);
      const resp = await performerService.getStatsForLast12Months(performer._id);

      // 12 month
      const current = moment().add(1, 'months');
      let startMonth = moment().add(-11, 'months');

      const results = [];

      while (startMonth.isBefore(current) && current) {
        // check and get in data response
        // eslint-disable-next-line no-loop-func
        const currentMonthData = resp.data.find((d: any) => d.month === (startMonth.month() + 1) && d.year === startMonth.year());
        if (currentMonthData) {
          results.push(currentMonthData);
        } else {
          results.push({
            totalEarning: 0,
            totalNewSubscriptions: 0,
            totalLostSubscriptions: 0,
            month: startMonth.month() + 1,
            year: startMonth.year()
          });
        }

        startMonth = startMonth.add(1, 'month');
      }

      setData(results);
    } catch (e) {
      message.error(getResponseError(t('common:errCommon')));
    } finally {
      setLoading(false);
    }
  };

  const earningStats = useMemo(() => (data ? data.map((stat) => ({
    label: getLable(stat),
    value: stat.totalEarning || 0,
    type: 'Total Earnings'
  })) : []), [data]);

  const tipStats = useMemo(() => (data ? data.map((stat) => ({
    label: getLable(stat),
    value: stat.totalTips || 0,
    type: 'Total Tips'
  })) : []), [data]);

  const timeStats = useMemo(() => (data ? data.map((stat) => ({
    label: getLable(stat),
    value: ((stat.totalStreamingTime / 1000) / 60) || 0,
    type: 'Total Streaming Time'
  })) : []), [data]);

  const subscriptionStats = useMemo(() => (data ? data.map((stat) => ({
    label: getLable(stat),
    value: stat.totalNewSubscriptions || 0,
    type: 'Total New Subscriptions'
  })) : []), [data]);

  const lostSubscriptionStats = useMemo(() => (data ? data.map((stat) => ({
    label: getLable(stat),
    value: stat.totalLostSubscriptions || 0,
    type: 'Total Lost Subscriptions'
  })) : []), [data]);

  useEffect(() => {
    getStatsForLast12Months();
  }, []);

  return (
    <Layout>
      <Head>
        <title>
          {' '}
          {ui && ui.siteName}
          {' '}
          |
          {' '}
          {t('common:titleMonthlyTrends')}
        </title>
      </Head>
      <div className="main-container monthly-trends-page">
        <PageHeader onBack={() => Router.back()} backIcon={<ArrowLeftOutlined />} title={t('common:titleMonthlyTrends')} />
        <Divider />
        {!loading && data && (
          <>
            <PerformerMonthlyStatsChart stats={[...subscriptionStats, ...lostSubscriptionStats]} color="#5ad8a6" />
            <Divider />

            <PerformerMonthlyStatsChart stats={[...tipStats, ...timeStats]} color="#5468ff" />
            <Divider />

            <PerformerMonthlyStatsChart stats={earningStats} color="#5ad8a6" />
            <Divider />
          </>
        )}
      </div>
    </Layout>
  );
}

const mapStates = (state: any) => ({
  ui: { ...state.ui },
  performer: { ...state.user.current }
});

MonthStats.authenticate = true;
export default connect(mapStates)(MonthStats);

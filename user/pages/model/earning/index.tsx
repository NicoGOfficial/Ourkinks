import { ArrowLeftOutlined } from '@ant-design/icons';
import SeoMetaHead from '@components/common/seo-meta-head';
import { TableListEarning } from '@components/performer/table-earning';
import { getResponseError } from '@lib/utils';
import {
  Col,
  Layout,
  message,
  PageHeader,
  Row,
  Statistic
} from 'antd';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { SearchFilter } from 'src/components/common/search-filter';
import { earningService } from 'src/services';

const CommissionCheckButton = dynamic(() => import('@components/performer/commission-check-button'), {
  ssr: false
});

function EarningPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [earning, setEarning] = useState([]);
  const limit = 10;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({} as any);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sort, setSort] = useState('desc');

  const [type, setType] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [payoutStatus, setPayoutStatus] = useState('');

  const getData = async () => {
    try {
      const resp = await earningService.performerSearch({
        limit,
        offset: (page - 1) * limit,
        sortBy: sortBy || 'createdAt',
        sort: sort || 'desc',
        type,
        fromDate: dateRange?.fromDate || '',
        toDate: dateRange?.toDate || '',
        payoutStatus
      });

      setEarning(resp.data.data);
      setTotal(resp.data.total);
    } catch (error) {
      message.error(getResponseError(error));
    } finally {
      setLoading(false);
    }
  };

  const getPerformerStats = async () => {
    const resp = await earningService.performerStarts({
      type: type || '',
      payoutStatus: payoutStatus || '',
      fromDate: dateRange?.fromDate || '',
      toDate: dateRange?.toDate || ''
    });
    setStats({ stats: resp?.data });
  };

  const handleFilter = async (data) => {
    setType(data.type || '');
    setPayoutStatus(data.payoutStatus || '');
    setDateRange({
      ...dateRange,
      fromDate: data.fromDate,
      toDate: data.toDate
    });
  };

  const handleTabChange = async (data, _filter, sorter) => {
    setPage(data.current);
    setSortBy(sorter?.field || 'createdAt');
    setSort(sorter?.order === 'ascend' ? 'asc' : 'desc');
  };

  useEffect(() => {
    getData();
  }, [sort, sortBy, type, payoutStatus, dateRange, page]);

  useEffect(() => {
    getPerformerStats();
  }, [sort, sortBy, type, payoutStatus, dateRange]);

  return (
    <Layout>
      <SeoMetaHead item={{
        title: t('common:titleEarning')
      }}
      />
      <div className="main-container">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title={t('common:titleEarning')}
        />
        <Row align="middle">
          <Col lg={16} xs={24} md={24}>
            <SearchFilter
              type={[
                { key: '', text: t('common:allTransaction') },
                { key: 'monthly_subscription', text: t('common:monthlySubscription') },
                { key: 'yearly_subscription', text: t('common:yearlySubscription') },
                { key: 'sale_video', text: t('common:saleVideo') },
                // { key: 'physical', text: t('common:physicalProduct') },
                // { key: 'digital', text: t('common:digitalProduct') },
                { key: 'stream_private', text: t('common:streamPrivate') },
                { key: 'tip', text: t('common:tip') },
                { key: 'referral', text: t('common:referralReward') }
              ]}
              onSubmit={(data) => handleFilter(data)}
              dateRange
              searchPayoutStatus
            />
          </Col>
          <Col lg={8} xs={24} md={24}>
            <CommissionCheckButton />
          </Col>
        </Row>
        <Row align="middle">
          <Col span={6}>
            <Statistic
              title={t('common:totalGrossPrice')}
              prefix="$"
              value={stats?.stats?.totalGrossPrice > 0 ? stats?.stats?.totalGrossPrice : 0}
              precision={2}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={t('common:totalAdminCommission')}
              prefix="$"
              value={stats?.stats?.totalCommission || 0}
              precision={2}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={t('common:youEarned')}
              prefix="$"
              value={stats?.stats?.totalNetPrice || 0}
              precision={2}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={t('common:totalUnpaidBalance')}
              prefix="$"
              // eslint-disable-next-line no-unsafe-optional-chaining
              value={(stats?.stats?.totalNetPrice - stats?.stats?.paidPrice) || 0}
              precision={2}
            />
          </Col>
        </Row>
        <div className="table-responsive">
          <TableListEarning
            loading={loading}
            dataSource={earning}
            rowKey="_id"
            pagination={{
              total, current: page, pageSize: limit, showSizeChanger: false
            }}
            onChange={(data, _filter, sorter) => handleTabChange(data, _filter, sorter)}
          />
        </div>
      </div>
    </Layout>
  );
}

EarningPage.authenticate = true;

EarningPage.onlyPerformer = true;

export default EarningPage;

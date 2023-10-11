import {
  ArrowLeftOutlined,
  HeartOutlined,
  LikeOutlined,
  ShoppingOutlined,
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
  VideoCameraOutlined,
  WechatOutlined
} from '@ant-design/icons';
import { TableListEarning } from '@components/performer/table-earning';
import { getResponseError } from '@lib/utils';
import {
  Col,
  Divider,
  Layout,
  message,
  PageHeader,
  Row,
  Statistic
} from 'antd';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { SearchFilter } from 'src/components/common/search-filter';
import {
  IEarning,
  IPerformer,
  IPerformerStats,
  IUIConfig
} from 'src/interfaces';
import { earningService, performerService } from 'src/services';

const CommissionCheckButton = dynamic(() => import('@components/performer/commission-check-button'), {
  ssr: false
});

interface IProps {
  performer: IPerformer;
  ui: IUIConfig;
  i18n: any;
}
interface IStates {
  loading: boolean;
  earning: IEarning[];
  pagination: {
    total: number;
    current: number;
    pageSize: number;
  };
  stats: IPerformerStats;
  sortBy: string;
  sort: string;
  type: string;
  dateRange: any;
  payoutStatus: string;
  statisticalData: any;
}

class StatisticalPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  static onlyPerformer = true;

  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: true,
      earning: [],
      pagination: { total: 0, current: 1, pageSize: 10 },
      stats: {} as any,
      sortBy: 'createdAt',
      sort: 'desc',
      type: '',
      dateRange: null,
      payoutStatus: '',
      statisticalData: {} as any
    };
  }

  componentDidMount() {
    this.getStatistical();
    this.getData();
    this.getPerformerStats();
  }

  async handleFilter(data) {
    const { dateRange } = this.state;
    await this.setState({
      type: data.type || '',
      payoutStatus: data.payoutStatus || '',
      dateRange: {
        ...dateRange,
        fromDate: data.fromDate,
        toDate: data.toDate
      }
    });
    this.getData();
    this.getPerformerStats();
  }

  async handleTabsChange(data) {
    const { pagination } = this.state;
    await this.setState({
      pagination: { ...pagination, current: data.current }
    });
    this.getData();
  }

  async getStatistical() {
    const { performer } = this.props;
    const { t } = this.props.i18n;
    try {
      const resp = await performerService.getStatistical(performer._id);
      this.setState({ statisticalData: resp.data });
    } catch (e) {
      message.error(t('common:errCommon'));
    } finally {
      this.setState({ loading: false });
    }
  }

  async getData() {
    try {
      const {
        pagination, sort, sortBy, type, dateRange, payoutStatus
      } = this.state;
      const { current, pageSize } = pagination;
      const earning = await earningService.performerSearch({
        limit: pageSize,
        offset: (current - 1) * pageSize,
        sort,
        sortBy,
        type,
        fromDate: dateRange?.fromDate || '',
        toDate: dateRange?.toDate || '',
        payoutStatus
      });

      await this.setState({
        earning: earning.data.data,
        pagination: { ...pagination, total: earning.data.total }
      });
    } catch (error) {
      message.error(getResponseError(error));
    } finally {
      this.setState({ loading: false });
    }
  }

  async getPerformerStats() {
    const { type, payoutStatus, dateRange } = this.state;
    const resp = await earningService.performerStarts({
      type: type || '',
      payoutStatus: payoutStatus || '',
      fromDate: dateRange?.fromDate || '',
      toDate: dateRange?.toDate || ''
    });
    this.setState({ stats: resp.data });
  }

  render() {
    const { t } = this.props.i18n;
    const { ui, performer } = this.props;
    const {
      loading, earning, pagination, stats, statisticalData
    } = this.state;
    const performerStarts = statisticalData.performerStats;

    return (
      <Layout>
        <Head>
          <title>
            {' '}
            {ui && ui.siteName}
            {' '}
            |
            {' '}
            {t('common:statistical')}
          </title>
        </Head>
        <div className="main-container unsubscribe-history-page">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title={t('common:statistical')}
          />
          <Row gutter={24}>
            <Col lg={4} md={4} sm={12} xs={24}>
              <Statistic
                title={t('common:totalSubscribe')}
                value={performer ? performer.stats.subscribers : 0}
                valueStyle={{ color: '#08979c' }}
                prefix={<UsergroupAddOutlined />}
              />
            </Col>
            <Col lg={4} md={4} sm={12} xs={24}>
              <Statistic
                title={t('common:totalUnsubscribe')}
                value={statisticalData ? statisticalData.totalUnsubscribe : 0}
                valueStyle={{ color: 'rgb(255, 207, 0)' }}
                prefix={<UsergroupDeleteOutlined />}
              />
            </Col>
            <Col lg={4} md={4} sm={12} xs={24}>
              <Statistic
                title={t('common:totalLikes')}
                value={performerStarts ? performerStarts.totalAllLikes : 0}
                valueStyle={{ color: '#7b5dbd' }}
                prefix={<LikeOutlined />}
              />
            </Col>
            <Col lg={4} md={4} sm={12} xs={24}>
              <Statistic
                title={t('common:totalFavorites')}
                value={performerStarts ? performerStarts.totalVideoFavourites : 0}
                valueStyle={{ color: '#cf1322' }}
                prefix={<HeartOutlined />}
              />
            </Col>
            <Col lg={4} md={4} sm={12} xs={24}>
              <Statistic
                title={t('common:totalComments')}
                value={performerStarts ? performerStarts.totalAllComments : 0}
                prefix={<WechatOutlined />}
              />
            </Col>
          </Row>
          <Divider />
          <Row>
            <Col lg={4} md={4} sm={12} xs={24}>
              <Statistic
                title={t('common:totalPPVvideo')}
                valueStyle={{ color: '#52c41a' }}
                value={statisticalData ? statisticalData.totalPPVvideo : 0}
                prefix={<VideoCameraOutlined />}
              />
            </Col>
            <Col lg={4} md={4} sm={12} xs={24}>
              <Statistic
                title={t('common:totalProductsSold')}
                value={statisticalData ? statisticalData.totalProductsSold : 0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<ShoppingOutlined />}
              />
            </Col>
            <Col lg={4} md={4} sm={12} xs={24}>
              <Statistic
                title={t('common:totalVideoSold')}
                value={statisticalData ? statisticalData.totalPPVVideoSold : 0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<ShoppingOutlined />}
              />
            </Col>
            {/* <Col lg={4} md={4} sm={12} xs={24}>
              <Statistic
                title="Total Gallery Sold"
                value={statisticalData ? statisticalData.totalPPVGallerySold : 0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<ShoppingOutlined />}
              />
            </Col> */}
            <Col lg={4} md={4} sm={12} xs={24}>
              <Statistic
                title={t('common:totalPhysicalProductsSold')}
                value={statisticalData ? statisticalData.totalPPVPhysicalSold : 0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<ShoppingOutlined />}
              />
            </Col>
            <Col lg={4} md={4} sm={12} xs={24}>
              <Statistic
                title={t('common:totalDigitalProductsSold')}
                value={statisticalData ? statisticalData.totalPPVDigitalSold : 0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<ShoppingOutlined />}
              />
            </Col>
          </Row>
          <Divider />
          <h2><strong>{t('common:earningReport')}</strong></h2>
          <Row align="middle">
            <Col lg={18} md={18} xs={24}>
              <SearchFilter
                type={[
                  { key: '', text: t('common:allTransaction') },
                  { key: 'monthly_subscription', text: t('common:monthlySubscription') },
                  { key: 'yearly_subscription', text: t('common:yearlySubscription') },
                  { key: 'sale_video', text: t('common:saleVideo') },
                  { key: 'physical', text: t('common:physicalProduct') },
                  { key: 'digital', text: t('common:digitalProduct') },
                  { key: 'stream_private', text: t('common:privateShow') },
                  { key: 'tip', text: 'Tip' },
                  { key: 'private_message_content', text: t('common:privateMessageContent') },
                  { key: 'feed', text: 'postFeed' }
                ]}
                onSubmit={this.handleFilter.bind(this)}
                dateRange
                searchPayoutStatus
              />
            </Col>
            <Col lg={6} md={6} xs={24}>
              <CommissionCheckButton />
            </Col>
          </Row>
          <Row align="middle">
            <Col span={6}>
              <Statistic
                title={t('common:totalGrossPrice')}
                prefix="$"
                value={stats.totalGrossPrice || 0}
                precision={2}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={t('common:adminEarned')}
                prefix="$"
                value={stats.totalCommission || 0}
                precision={2}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={t('common:youEarned')}
                prefix="$"
                value={stats.totalNetPrice || 0}
                precision={2}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={t('common:unpaidBalance')}
                prefix="$"
                value={stats.totalNetPrice - stats.paidPrice || 0}
                precision={2}
              />
            </Col>
          </Row>
          <TableListEarning
            loading={loading}
            dataSource={earning}
            rowKey="_id"
            pagination={{ ...pagination, showSizeChanger: false }}
            onChange={this.handleTabsChange.bind(this)}
          />
        </div>
      </Layout>
    );
  }
}

const mapStates = (state) => ({
  ui: { ...state.ui },
  performer: { ...state.user.current }
});
export default connect(mapStates)(withTranslation(StatisticalPage));

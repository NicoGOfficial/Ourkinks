import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { TableListSubscription } from '@components/subscription/table-list-subscription';
import { formatDate } from '@lib/date';
import { getResponseError } from '@lib/utils';
import { paymentService, subscriptionService } from '@services/index';
import { Layout, message, PageHeader } from 'antd';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { ISubscription } from 'src/interfaces';

interface IStates {
  subscriptionList: ISubscription[];
  loading: boolean;
  pagination: {
    pageSize: number;
    current: number;
    total: number;
  };
  sort: string;
  sortBy: string;
  filter: {};
}

type IProps = {
  i18n: any;
}

class SubscriptionPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  constructor(props) {
    super(props);
    this.state = {
      subscriptionList: [],
      loading: false,
      pagination: {
        pageSize: 10,
        current: 1,
        total: 0
      },
      sort: 'desc',
      sortBy: 'updatedAt',
      filter: {}
    };
  }

  componentDidMount() {
    this.getData();
  }

  async handleTabChange(data, _filter, sorter) {
    const { pagination } = this.state;
    const sort = sorter?.order === 'ascend' ? 'asc' : 'desc';
    const sortBy = sorter?.field || 'updatedAt';
    this.setState({
      pagination: { ...pagination, current: data.current },
      sort,
      sortBy
    }, () => this.getData());
  }

  async getData() {
    try {
      const {
        filter, sort, sortBy, pagination
      } = this.state;
      this.setState({ loading: true });
      const resp = await subscriptionService.userSearch({
        ...filter,
        sort,
        sortBy,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize
      });
      this.setState({
        subscriptionList: resp.data.data,
        pagination: { ...pagination, total: resp.data.total }
      });
    } catch (error) {
      const { t } = this.props.i18n;
      message.error(
        getResponseError(error) || t('common:errCommon')
      );
    } finally {
      this.setState({ loading: false });
    }
  }

  async cancelSubscription(subscription: ISubscription) {
    const { t } = this.props.i18n;
    if (subscription.subscriptionType === 'system' && !window.confirm(t('common:confirmCancelSubscriptionSystem', { name: subscription?.performerInfo?.name || subscription?.performerInfo?.username || 'the model' }))) {
      return;
    }
    if (subscription.subscriptionType !== 'system' && !window.confirm(t('common:confirmCancelSubscription', { date: formatDate(subscription?.expiredAt, 'll') }))) {
      return;
    }
    try {
      await paymentService.cancelSubscription(subscription._id);
      message.success(t('common:subscriptionSuspended'));
      this.getData();
    } catch (e) {
      const err = await e;
      message.error(err?.message || t('common:errCommon'));
    }
  }

  render() {
    const { subscriptionList, pagination, loading } = this.state;
    const { t } = this.props.i18n;
    return (
      <Layout>
        <PageTitle title={t('common:mySubscriptions')} />
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title={t('common:mySubscriptions')}
          />
          <div className="table-responsive">
            <TableListSubscription
              dataSource={subscriptionList}
              pagination={{ ...pagination, showSizeChanger: false }}
              loading={loading}
              onChange={this.handleTabChange.bind(this)}
              rowKey="_id"
              cancelSubscription={this.cancelSubscription.bind(this)}
            />
          </div>
        </div>
      </Layout>
    );
  }
}

export default withTranslation(SubscriptionPage);

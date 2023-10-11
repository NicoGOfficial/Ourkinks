/* eslint-disable no-param-reassign */
import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { SearchFilter } from '@components/common/search-filter';
import PaymentTableList from '@components/payment/table-list';
import { getResponseError } from '@lib/utils';
import { Layout, message, PageHeader } from 'antd';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { IOrder } from 'src/interfaces';
import { orderService } from 'src/services';

interface IStates {
  loading: boolean;
  paymentList: IOrder[];
  pagination: {
    total: number;
    pageSize: number;
    current: number;
  };
  sortBy: string;
  sort: string;
  filter: {};
}

type IProps = {
  i18n: any;
}

class PaymentHistoryPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  state = {
    loading: true,
    paymentList: [],
    pagination: {
      total: 0,
      pageSize: 10,
      current: 1
    },
    sortBy: 'createdAt',
    sort: 'desc',
    filter: {}
  };

  componentDidMount() {
    this.userSearchTransactions();
  }

  handleTableChange = async (pagination, filters, sorter) => {
    const { pagination: paginationVal } = this.state;
    await this.setState({
      pagination: { ...paginationVal, current: pagination.current },
      sortBy: sorter.field || 'createdAt',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order
        ? sorter.order === 'descend'
          ? 'desc'
          : 'asc'
        : 'desc'
    });
    this.userSearchTransactions();
  };

  async handleFilter(filter) {
    if (filter.performerId) {
      filter.sellerId = filter.performerId;
      delete filter.performerId;
    } else {
      delete filter.performerId;
      delete filter.sellerId;
    }
    filter.paymentStatus = filter.status || '';
    filter.productType = filter.type || '';
    delete filter.type;
    delete filter.status;
    this.setState({ filter }, () => this.userSearchTransactions());
  }

  async userSearchTransactions() {
    try {
      const {
        filter, sort, sortBy, pagination
      } = this.state;
      const resp = await orderService.detailsSearch({
        ...filter,
        sort,
        sortBy,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize,
        includingCreated: 1
      });
      return await this.setState({
        paymentList: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total
        }
      });
    } catch (error) {
      return message.error(getResponseError(error));
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const {
      loading, paymentList, pagination
    } = this.state;
    const { t } = this.props.i18n;
    const statuses = [
      {
        key: '',
        text: t('common:paymentStatus')
      },
      {
        key: 'created',
        text: t('common:created')
      },
      {
        key: 'success',
        text: t('common:success')
      },
      {
        key: 'cancelled',
        text: t('common:cancelled')
      },
      {
        key: 'chargeback',
        text: t('common:chargeback')
      }

    ];
    const type = [
      {
        key: '',
        text: t('common:transactionType')
      },
      {
        key: 'wallet',
        text: t('common:topupWallet')
      },
      {
        key: 'tip',
        text: t('common:tip')
      },
      {
        key: 'stream_private',
        text: t('common:streamPrivate')
      },
      {
        key: 'sale_video',
        text: t('common:saleVideo')
      },
      // {
      //   key: 'product',
      //   text: t('common:saleProduct')
      // },
      {
        key: 'monthly_subscription',
        text: t('common:monthlySubscription')
      },
      {
        key: 'yearly_subscription',
        text: t('common:yearlySubscription')
      },
      {
        key: 'referral',
        text: t('common:referralReward')
      }
    ];
    return (
      <Layout>
        <PageTitle title={t('common:paymentHistory')} />
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title={t('common:paymentHistory')}
          />
          <SearchFilter
            type={type}
            statuses={statuses}
            onSubmit={this.handleFilter.bind(this)}
            searchWithPerformer
            dateRange
            searchWithKeyword={false}
            searchPaymentGateway
          />
          <PaymentTableList
            dataSource={paymentList}
            pagination={{ ...pagination, showSizeChanger: false }}
            onChange={this.handleTableChange.bind(this)}
            rowKey="_id"
            loading={loading}
          />
        </div>
      </Layout>
    );
  }
}

export default withTranslation(PaymentHistoryPage);

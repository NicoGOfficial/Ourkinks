/* eslint-disable no-nested-ternary */
import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { TableListEarning } from '@components/earning/table-list-earning';
import { SelectPerformerDropdown } from '@components/performer/common/select-performer-dropdown';
import { SelectUserDropdown } from '@components/user/select-user-dropdown';
import { earningService } from '@services/earning.service';
import {
  Col, DatePicker,
  message, Row, Select, Statistic
} from 'antd';
import { pick } from 'lodash';
import Head from 'next/head';
import { PureComponent } from 'react';

const { RangePicker } = DatePicker;

interface IEarningStatResponse {
  totalCommission: number;
  totalGrossPrice: number;
  totalNetPrice: number;
  paidPrice: number;
}

interface IProps {

}

class Earning extends PureComponent<IProps> {
  static async getInitialProps(ctx) {
    return ctx.query;
  }

  state = {
    pagination: {} as any,
    searching: false,
    list: [] as any,
    limit: 10,
    filter: {} as any,
    sortBy: 'updatedAt',
    sort: 'desc',
    stats: {} as IEarningStatResponse
  };

  async componentDidMount() {
    this.search();
    this.stats();
  }

  handleTableChange = async (pagi, filters, sorter) => {
    const { pagination } = this.state;
    const pager = { ...pagination };
    pager.current = pagi.current;
    await this.setState({
      pagination: pager,
      sortBy: sorter.field || 'createdAt',
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : 'desc'
    });
    this.search(pager.current);
  };

  async handleFilter(values) {
    const { filter } = this.state;
    await this.setState({ filter: { ...filter, ...values } });
    this.search();
    this.stats();
  }

  async search(page = 1) {
    const {
      filter, limit, sort, sortBy, pagination
    } = this.state;
    try {
      await this.setState({ searching: true });
      const resp = await earningService.search({
        ...filter,
        limit,
        offset: (page - 1) * limit,
        sort,
        sortBy,
        isToken: false
      });
      await this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total,
          pageSize: limit
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      await this.setState({ searching: false });
    }
  }

  async stats() {
    const { filter } = this.state;
    try {
      const resp = await earningService.stats({
        ...filter
      });
      await this.setState({
        stats: resp.data
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
    }
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  async updatePaidStatus() {
    try {
      const { filter } = this.state;
      if (!filter.performerId) {
        message.error('Please filter by a performer');
        return;
      }
      if (!filter.fromDate || !filter.toDate) {
        message.error('Please filter by date range');
        return;
      }
      await earningService.updatePaidStatus(pick(filter, ['performerId', 'fromDate', 'toDate']));
      message.success('Updated successfully');
      this.search();
      this.stats();
    } catch (error) {
      message.error('An error occurred, please try again!');
    }
  }

  renderSearchFilter() {
    return (
      <Row gutter={24}>
        <Col lg={6} md={8} xs={12}>
          <Select
            placeholder="Transaction Type"
            style={{ width: '100%' }}
            onChange={(type) => this.handleFilter({ type })}
          >
            <Select.Option key="all" value="">All Transactions</Select.Option>
            <Select.Option key="monthly_subscription" value="monthly_subscription">Monthly Subscription</Select.Option>
            <Select.Option key="yearly_subscription" value="yearly_subscription">Yearly Subscription</Select.Option>
            <Select.Option key="sale_video" value="sale_video">PPV Purchase</Select.Option>
            {/* <Select.Option key="digital" value="digital">Digital Product</Select.Option>
            <Select.Option key="physical" value="physical">Physical Product</Select.Option> */}
            <Select.Option key="stream_private" value="stream_private">Private Show</Select.Option>
            <Select.Option key="tip" value="tip">Tip</Select.Option>
            <Select.Option key="referral" value="referral">Referral reward</Select.Option>
            <Select.Option key="private_message_content" value="private_message_content">Private Message Content</Select.Option>
            <Select.Option key="feed" value="feed">Feed post</Select.Option>
          </Select>
        </Col>
        <Col lg={6} md={8} xs={12}>
          <SelectUserDropdown onSelect={(userId) => this.handleFilter({ userId })} />
        </Col>
        <Col lg={6} md={8} xs={12}>
          <SelectPerformerDropdown
            onSelect={(performerId) => this.handleFilter({ performerId })}
            defaultValue=""
          />
        </Col>
        <Col lg={6} md={8} xs={12}>
          <Select
            placeholder="Payment Status"
            style={{ width: '100%' }}
            onSelect={(paymentStatus) => this.handleFilter({ paymentStatus })}
          >
            <Select.Option key="created" value="">All statuses</Select.Option>
            <Select.Option key="created" value="pending">Created</Select.Option>
            <Select.Option key="success" value="success">Success</Select.Option>
            <Select.Option key="cancelled" value="cancelled">Cancelled</Select.Option>
            <Select.Option key="chargeback" value="chargeback">Chargeback</Select.Option>
          </Select>
        </Col>
        <Col lg={6} md={8} xs={12}>
          <Select
            placeholder="Payout Status"
            style={{ width: '100%' }}
            onSelect={(payoutStatus) => this.handleFilter({ payoutStatus })}
          >
            <Select.Option key="all" value="">All statuses</Select.Option>
            <Select.Option key="done" value="done">Paid</Select.Option>
            <Select.Option key="pending" value="pending">Unpaid</Select.Option>
            <Select.Option key="rejected" value="rejected">Rejected</Select.Option>
          </Select>
        </Col>
        <Col lg={6} md={8} xs={12}>
          <RangePicker
            onChange={(dates: [any, any], dateStrings: [string, string]) => this.handleFilter({
              fromDate: dateStrings[0],
              toDate: dateStrings[1]
            })}
          />
        </Col>
      </Row>
    );
  }

  render() {
    const {
      list, searching, pagination, stats
    } = this.state;

    return (
      <>
        <Head>
          <title>Earnings</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Earnings' }]} />
        <Page>
          <Row gutter={16} style={{ marginBottom: '10px' }}>
            <Col span={6}>
              <Statistic title="Total Gross Price" prefix="$" value={stats.totalGrossPrice} precision={2} />
            </Col>
            <Col span={6}>
              <Statistic title="Admin earned" prefix="$" value={stats.totalCommission} precision={2} />
            </Col>
            <Col span={6}>
              <Statistic title="Performer earned" prefix="$" value={stats.totalNetPrice} precision={2} />
            </Col>
            <Col span={6}>
              <Statistic title="Unpaid Balance" prefix="$" value={stats.totalNetPrice - stats.paidPrice} precision={2} />
            </Col>
          </Row>
          {this.renderSearchFilter()}
          <div style={{ marginBottom: '20px' }} />
          <TableListEarning
            dataSource={list}
            rowKey="_id"
            loading={searching}
            pagination={{ ...pagination, showSizeChanger: false }}
            onChange={this.handleTableChange.bind(this)}
          />
        </Page>
      </>
    );
  }
}

export default Earning;

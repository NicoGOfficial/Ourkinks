/* eslint-disable no-nested-ternary */
/* eslint-disable lines-between-class-members */
import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { TableListToken } from '@components/wallet-package/list-wallet-package';
import { walletPackageService } from '@services/wallet-package.service';
import { message } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';

interface IProps {
  performerId: string;
}

class Tokens extends PureComponent<IProps> {
  static async getInitialProps(ctx) {
    return ctx.query;
  }
  state = {
    pagination: {} as any,
    searching: false,
    list: [] as any,
    limit: 10,
    filter: {} as any,
    sortBy: 'createdAt',
    sort: 'desc'
  };

  async componentDidMount() {
    const { performerId } = this.props;
    const { filter } = this.state;
    if (performerId) {
      await this.setState({
        filter: {
          ...filter,
          ...{ performerId }
        }
      });
    }
    this.search();
  }

  handleTableChange = (pagination, sorter) => {
    const pager = { ...pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
      sortBy: sorter.field || 'createdAt',
      sort: sorter.order
        ? sorter.order === 'descend'
          ? 'desc'
          : 'asc'
        : 'desc'
    });
    this.search(pager.current);
  };

  // async handleFilter(filter) {
  //   await this.setState({ filter });
  //   this.search();
  // }

  async search(page = 1) {
    try {
      await this.setState({ searching: true });
      const {
        filter, limit, sort, sortBy, pagination
      } = this.state;
      const resp = await walletPackageService.search({
        ...filter,
        limit,
        offset: (page - 1) * limit,
        sort,
        sortBy
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

  async deleteToken(id: string) {
    const { pagination } = this.state;
    if (!window.confirm('Are you sure you want to delete this wallet package?')) {
      return false;
    }
    try {
      await walletPackageService.delete(id);
      message.success('Deleted successfully');
      await this.search(pagination.current);
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
    return undefined;
  }

  render() {
    const { list, searching, pagination } = this.state;
    // const { performerId } = this.props;
    // const statuses = [
    //   {
    //     key: '',
    //     text: 'All'
    //   },
    //   {
    //     key: 'active',
    //     text: 'Active'
    //   },
    //   {
    //     key: 'inactive',
    //     text: 'Inactive'
    //   }
    // ];

    return (
      <>
        <Head>
          <title>Wallet Packages</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Wallet Package' }]} />
        <Page>
          {/* <SearchFilter
            statuses={statuses}
            onSubmit={this.handleFilter.bind(this)}
            searchWithPerformer
            performerId={performerId || ''}
          />
          <div style={{ marginBottom: '20px' }} /> */}
          <TableListToken
            dataSource={list}
            rowKey="_id"
            loading={searching}
            pagination={pagination}
            onChange={this.handleTableChange.bind(this)}
            deleteToken={this.deleteToken.bind(this)}
          />
        </Page>
      </>
    );
  }
}

export default Tokens;

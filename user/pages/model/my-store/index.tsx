import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { SearchFilter } from '@components/common/search-filter';
import { TableListProduct } from '@components/product/table-list-product';
import { productService } from '@services/product.service';
import {
  Button, Col, Layout, message, PageHeader,
  Row
} from 'antd';
import Link from 'next/link';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';

class Products extends PureComponent<any> {
  static authenticate = true;

  static onlyPerformer = true;

  static async getInitialProps(ctx) {
    return ctx.query;
  }

  state = {
    pagination: {} as any,
    searching: false,
    list: [] as any,
    limit: 12,
    filter: {} as any,
    sortBy: 'createdAt',
    sort: 'desc'
  };

  async componentDidMount() {
    this.search();
  }

  handleTableChange = async (pagination, filters, sorter) => {
    const { pagination: paginationVal } = this.state;
    const pager = { ...paginationVal };
    pager.current = pagination.current;
    await this.setState({
      pagination: pager,
      sortBy: sorter.field || 'createdAt',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order
        ? sorter.order === 'descend'
          ? 'desc'
          : 'asc'
        : 'desc'
    });
    this.search(pager.current);
  };

  async handleFilter(filter) {
    await this.setState({ filter });
    this.search();
  }

  async search(page = 1) {
    const { t } = this.props.i18n;
    try {
      const {
        filter, limit, sort, sortBy, pagination
      } = this.state;
      await this.setState({ searching: true });
      const resp = await productService.search({
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
      message.error(t('common:errCommon'));
      this.setState({ searching: false });
    }
  }

  async deleteProduct(id: string) {
    const { t } = this.props.i18n;
    if (!window.confirm(t('common:areYouSureRemoveProduct'))) {
      return;
    }
    try {
      const { pagination } = this.state;
      await productService.delete(id);
      message.success('Deleted successfully');
      await this.search(pagination.current);
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || t('common:errCommon'));
    }
  }

  render() {
    const { t } = this.props.i18n;
    const { list, searching, pagination } = this.state;
    const statuses = [
      {
        key: '',
        text: t('common:allStatus')
      },
      {
        key: 'active',
        text: t('common:active')
      },
      {
        key: 'inactive',
        text: t('common:inactive')
      }
    ];

    return (
      <Layout>
        <PageTitle title={t('common:titleMyStore')} />
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title={t('common:titleMyStore')}
          />
          <div>
            <Row>
              <Col xl={21} md={14} xs={24}>
                <SearchFilter
                  statuses={statuses}
                  onSubmit={this.handleFilter.bind(this)}
                  searchWithKeyword
                  searchWithCategory
                />
              </Col>
              <Col xl={3} md={10} xs={24} style={{ display: 'flex', alignItems: 'center' }}>
                <Button className="secondary">
                  <Link href="/model/my-store/create">
                    <a>{t('common:newUpload')}</a>
                  </Link>
                </Button>
              </Col>
            </Row>
          </div>
          <div style={{ marginBottom: '20px' }} />
          <div className="table-responsive">
            <TableListProduct
              dataSource={list}
              rowKey="_id"
              loading={searching}
              pagination={{ ...pagination, showSizeChanger: false }}
              onChange={this.handleTableChange.bind(this)}
              deleteProduct={this.deleteProduct.bind(this)}
            />
          </div>
        </div>
      </Layout>
    );
  }
}

export default withTranslation(Products);

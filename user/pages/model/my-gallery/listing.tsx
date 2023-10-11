import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { SearchFilter } from '@components/common/search-filter';
import { TableListGallery } from '@components/gallery/table-list';
import { galleryService } from '@services/gallery.service';
import {
  Button, Col, Layout, message, PageHeader,
  Row
} from 'antd';
import Link from 'next/link';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';

interface IStates {
  galleries: [];
  loading: boolean;
  submiting: boolean;
  filters: {};
  sortBy: string;
  sort: string;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}

interface IProps {
  i18n: any;
}

class GalleryListingPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  static onlyPerformer = true;

  constructor(props) {
    super(props);
    this.state = {
      galleries: [],
      loading: true,
      submiting: false,
      filters: {},
      sortBy: 'createdAt',
      sort: 'desc',
      pagination: { current: 1, pageSize: 12, total: 0 }
    };
  }

  async componentDidMount() {
    this.search();
  }

  async handleSorterChange(pagination, filters, sorter) {
    const { pagination: statePagination } = this.state;
    await this.setState({
      pagination: {
        ...statePagination,
        current: pagination.current
      },
      sortBy: sorter.field || 'createdAt',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order ? (sorter.order === 'ascend' ? 'asc' : 'desc') : ''
    });
    this.search();
  }

  async handleDeleteGallery(id: string) {
    const { t } = this.props.i18n;
    try {
      await this.setState({ submiting: true });
      await galleryService.delete(id);
      message.success(t('common:successDel'));
      this.search();
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || t('common:errCommon'));
    } finally {
      this.setState({ submiting: false });
    }
  }

  async handleFilter(param) {
    const { pagination } = this.state;
    await this.setState({
      filters: param,
      pagination: {
        ...pagination,
        current: 1
      }
    });
    this.search();
  }

  async search() {
    const { t } = this.props.i18n;
    try {
      const {
        filters, pagination, sort, sortBy
      } = this.state;
      const resp = await galleryService.search({
        ...filters,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize,
        sort,
        sortBy
      });
      this.setState({
        loading: false,
        galleries: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total
        }
      });
    } catch (error) {
      message.error(t('common:errCommon'));
      this.setState({ loading: false });
    }
  }

  render() {
    const { t } = this.props.i18n;
    const {
      galleries, pagination, loading, submiting
    } = this.state;
    const statuses = [{
      text: t('common:allStatus'),
      key: ''
    }, {
      text: t('common:active'),
      key: 'active'
    },
    {
      text: t('common:inactive'),
      key: 'inactive'
    }];

    return (
      <Layout>
        <PageTitle title={t('common:titleGallery')} />
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title={t('common:titleGallery')}
          />
          <div>
            <Row>
              <Col xl={21} md={14} xs={24}>
                <SearchFilter statuses={statuses} onSubmit={this.handleFilter.bind(this)} />
              </Col>
              <Col xl={3} md={10} xs={24} style={{ display: 'flex', alignItems: 'center' }}>
                <Button className="secondary">
                  <Link href="/model/my-gallery/create">
                    <a>
                      <PlusOutlined />
                      {' '}
                      {t('common:createNew')}
                    </a>
                  </Link>
                </Button>
              </Col>
            </Row>
          </div>
          <div className="table-responsive">
            <TableListGallery
              dataSource={galleries}
              rowKey="_id"
              loading={loading || submiting}
              pagination={{ ...pagination, showSizeChanger: false }}
              onChange={this.handleSorterChange.bind(this)}
              deleteGallery={this.handleDeleteGallery.bind(this)}
            />
          </div>
        </div>
      </Layout>
    );
  }
}

export default withTranslation(GalleryListingPage);

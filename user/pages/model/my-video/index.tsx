import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { SearchFilter } from '@components/common/search-filter';
import { TableListVideo } from '@components/video/table-list';
import { videoService } from '@services/video.service';
import {
  Button, Col, Layout, message, PageHeader,
  Row
} from 'antd';
import Link from 'next/link';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';

class ModelVideos extends PureComponent<any> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    pagination: {} as any,
    searching: false,
    list: [] as any,
    limit: 12,
    filter: {} as any,
    sortBy: 'createdAt',
    sort: 'desc'
  };

  componentDidMount() {
    this.search();
  }

  handleTableChange = async (pagination, filters, sorter) => {
    const { pagination: paginationVal } = this.state;
    const pager = { ...paginationVal };
    pager.current = pagination.current;
    await this.setState({
      pagination: pager,
      sortBy: sorter.field || '',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : ''
    });
    this.search(pager.current);
  };

  async handleFilter(values) {
    const { filter } = this.state;
    await this.setState({ filter: { ...filter, ...values } });
    this.search();
  }

  async search(page = 1) {
    const { t } = this.props.i18n;
    try {
      const {
        filter, limit, sort, sortBy, pagination
      } = this.state;
      await this.setState({ searching: true });
      const resp = await videoService.search({
        ...filter,
        limit,
        offset: (page - 1) * limit,
        sort,
        sortBy
      });
      this.setState({
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

  async deleteVideo(id: string) {
    const { t } = this.props.i18n;
    if (!window.confirm(t('common:areYouSureRemoveVideo'))) {
      return;
    }
    try {
      const { pagination } = this.state;
      await videoService.delete(id);
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
        <PageTitle title={t('common:titleMyVideo')} />
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title={t('common:titleMyVideo')}
          />
          <Row>
            <Col md={16} xs={24}>
              <SearchFilter
                searchWithKeyword
                statuses={statuses}
                onSubmit={this.handleFilter.bind(this)}
              />
            </Col>
            <Col md={8} xs={24} style={{ display: 'flex', alignItems: 'center' }}>
              <Button className="primary">
                <Link href="/model/my-video/upload">
                  <a>
                    {' '}
                    <UploadOutlined />
                    {' '}
                    {t('common:newUpload')}
                  </a>
                </Link>
              </Button>
              &nbsp;
              <Button className="secondary">
                <Link href="/model/my-video/bulk-upload">
                  <a>
                    <UploadOutlined />
                    {' '}
                    {t('common:bulkUpload')}
                  </a>
                </Link>
              </Button>
            </Col>
          </Row>
          <div className="table-responsive">
            <TableListVideo
              dataSource={list}
              rowKey="_id"
              loading={searching}
              pagination={{ ...pagination, showSizeChanger: false }}
              onChange={this.handleTableChange.bind(this)}
              onDelete={this.deleteVideo.bind(this)}
            />
          </div>
        </div>
      </Layout>
    );
  }
}

export default withTranslation(ModelVideos);

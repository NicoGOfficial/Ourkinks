import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { PerformerListVideo } from '@components/video/performer-list';
import {
  Layout, message, PageHeader,
  Pagination, Spin
} from 'antd';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { videoService } from 'src/services';

interface IStates {
  loading: boolean;
  favouriteVideos: any[];
  currentPage: number;
  limit: number;
  total: number;
}

type IProps = {
  i18n: any;
};

class FavouriteVideoPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      favouriteVideos: [],
      currentPage: 1,
      limit: 12,
      total: 0
    };
  }

  componentDidMount() {
    this.getFavouriteVideos();
  }

  async handlePagechange(page: number) {
    await this.setState({ currentPage: page });
    this.getFavouriteVideos();
  }

  async getFavouriteVideos() {
    try {
      const { limit, currentPage } = this.state;
      const resp = await videoService.getFavouriteVideos({
        limit,
        offset: (currentPage - 1) * limit
      });
      await this.setState({
        favouriteVideos: resp.data.data,
        total: resp.data.total
      });
    } catch (error) {
      const { t } = this.props.i18n;
      message.error(t('common:errCommon'));
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const {
      loading, favouriteVideos, limit, total
    } = this.state;
    const { t } = this.props.i18n;
    return (
      <Layout>
        <PageTitle title={t('common:favoriteVideos')} />
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title={t('common:favoriteVideos')}
          />
          {favouriteVideos && favouriteVideos.length > 0 && (
          <PerformerListVideo videos={favouriteVideos.map((v) => v?.objectInfo)} />
          )}
          {!loading && !favouriteVideos.length && (
          <div style={{ textAlign: 'center' }}>
            {t('common:noFavoriteVideos')}
          </div>
          )}
          {loading && <div className="text-center"><Spin size="large" /></div>}
          {total > limit && (
          <div className="paging">
            <Pagination
              showQuickJumper={false}
              defaultCurrent={1}
              total={total}
              pageSize={limit}
              onChange={this.handlePagechange.bind(this)}
            />
          </div>
          )}
        </div>
      </Layout>
    );
  }
}

export default withTranslation(FavouriteVideoPage);

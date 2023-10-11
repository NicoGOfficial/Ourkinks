import { ArrowLeftOutlined } from '@ant-design/icons';
import ScrollListFeed from '@components/feed/scroll-list';
import {
  Layout, message, PageHeader,
  Pagination, Spin
} from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IFeed, IUIConfig, IUser } from 'src/interfaces';
import { feedService } from 'src/services';

interface IProps {
  ui: IUIConfig;
  user: IUser;
  i18n: any;
}
interface IStates {
  loading: boolean;
  feeds: any[];
  currentPage: number;
  limit: number;
  total: number;
}

class FavouriteVideoPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: true,
      feeds: [],
      currentPage: 1,
      limit: 12,
      total: 0
    };
  }

  componentDidMount() {
    this.getBookmarkedPosts();
  }

  componentDidUpdate(_, prevState: IStates): void {
    const { currentPage } = this.state;
    if (prevState.currentPage !== currentPage) {
      this.getBookmarkedPosts();
    }
  }

  async handlePagechange(page: number) {
    await this.setState({ currentPage: page });
  }

  async onDeleteFeed(feed: IFeed) {
    const { t } = this.props.i18n;
    const { user } = this.props;
    const { feeds } = this.state;
    if (user._id !== feed.fromSourceId) {
      return message.error(t('common:permissionDenied'));
    }
    if (!window.confirm(t('common:areYouSureRemovePost'))) return undefined;
    try {
      await feedService.delete(feed._id);
      feeds.filter((f) => f._id !== feed._id);
      message.success(t('common:removedSuccessfully'));
    } catch (e) {
      const error = await e;
      message.error(error?.message || t('common:somethingWentWrong'));
    }
    return undefined;
  }

  async getBookmarkedPosts() {
    const { t } = this.props.i18n;
    const { currentPage, limit } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await feedService.getBookmark({
        limit,
        offset: (currentPage - 1) * limit
      });
      this.setState({
        feeds: resp.data.data,
        total: resp.data.total
      });
    } catch (error) {
      message.error(t('common:serverError'));
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { t } = this.props.i18n;
    const {
      loading, feeds, limit, total
    } = this.state;
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            |
            {' '}
            {t('common:titleBookmarkedFeed')}
          </title>
        </Head>
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title={t('common:titleBookmarkedFeed')}
          />
          {feeds && feeds.length > 0 && (
            <ScrollListFeed
              items={feeds.map((item) => item.objectInfo)}
              loading={loading}
              canLoadmore={feeds && feeds.length < total}
              loadMore={this.handlePagechange.bind(this, 'feeds')}
              onDelete={this.onDeleteFeed.bind(this)}
            />
          )}
          {!loading && !feeds.length && (
            <div style={{ textAlign: 'center' }}>
              {t('common:noBookmarkedFeedWasFound')}
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
const mapState = (state: any) => ({ ui: state.ui, user: state.user.current });
export default connect(mapState)(withTranslation(FavouriteVideoPage));

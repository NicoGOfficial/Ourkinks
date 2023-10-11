import { ArrowLeftOutlined, ContactsOutlined, HomeOutlined } from '@ant-design/icons';
import Page from '@components/common/layout/page';
import FeedCard from '@components/feed/feed-card';
import {
  IError,
  IFeed, IUIConfig, IUser
} from '@interfaces/index';
import { feedService } from '@services/index';
import {
  Button,
  Layout, message, Result
} from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

interface IProps {
  ui: IUIConfig;
  feed: IFeed;
  user: IUser;
  error: IError;
  i18n: any;
}

class PostDetails extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  static async getInitialProps(ctx) {
    try {
      const { token = '' } = nextCookie(ctx);
      const feed = await (await feedService.findOne(ctx.query.id, { Authorization: token })).data;
      return { feed };
    } catch (e) {
      return { error: await e };
    }
  }

  async onDelete(feed: IFeed) {
    const { t } = this.props.i18n;
    const { user } = this.props;
    if (user._id !== feed.fromSourceId) {
      return message.error(t('common:permissionDenied'));
    }
    if (!window.confirm(t('common:areYouSureRemovePost'))) return false;
    try {
      await feedService.delete(feed._id);
      message.success(t('common:deletedPostSuccessfully'));
      Router.back();
    } catch {
      message.error(t('common:somethingWentWrong'));
    }
    return undefined;
  }

  render() {
    const { t } = this.props.i18n;
    const { feed, ui, error } = this.props;
    const { performer } = feed;
    if (error) {
      return (
        <Result
          status={error?.statusCode === 404 ? '404' : 'error'}
          title={error?.statusCode === 404 ? null : error?.statusCode}
          subTitle={error?.statusCode === 404 ? t('common:errNotFound') : error?.message}
          extra={[
            <Button className="secondary" key="console" onClick={() => Router.push('/')}>
              <HomeOutlined />
              {t('common:backHome')}
            </Button>,
            <Button key="buy" className="primary" onClick={() => Router.push('/contact')}>
              <ContactsOutlined />
              {t('common:contactUs')}
            </Button>
          ]}
        />
      );
    }
    return (
      <Layout>
        <Head>
          <title>
            {`${ui?.siteName} | ${performer?.name}`}
          </title>
          <meta
            name="keywords"
            content={`${performer?.name}, ${performer?.username}, ${feed?.text}`}
          />
          <meta
            name="description"
            content={feed?.text}
          />
          {/* OG tags */}
          <meta
            property="og:title"
            content={`${performer?.name}, ${performer?.username}`}
            key="title"
          />
          <meta
            property="og:keywords"
            content={`${performer?.name}, ${performer?.username}, ${feed?.text}`}
          />
          <meta
            property="og:description"
            content={feed?.text}
          />
        </Head>
        <div className="main-container">
          <Page>
            <div className="page-heading">
              <a aria-hidden onClick={() => Router.back()}>
                <ArrowLeftOutlined />
                {' '}
                {`${performer?.name} post`}
              </a>
            </div>
            <div className="main-container custom">
              <FeedCard feed={feed} onDelete={this.onDelete.bind(this)} />
            </div>
          </Page>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state) => ({
  ui: { ...state.ui },
  user: state.user.current
});
export default connect(mapStates)(withTranslation(PostDetails));

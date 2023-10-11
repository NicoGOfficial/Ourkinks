import '../model-profile.module.less';

import {
  ArrowLeftOutlined,
  ContactsOutlined,
  HomeOutlined,
  LikeOutlined,
  PictureOutlined,
  ShareAltOutlined,
  ShoppingOutlined,
  UsergroupAddOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import { ScrollListGallery } from '@components/gallery';
import {
  ConfirmSubscriptionPerformerForm,
  PerformerInfo
} from '@components/performer';
import { ScrollListProduct } from '@components/product/scroll-list-item';
import { LiveStreamIcon } from '@components/streaming/live-stream-icon';
import { ScrollListVideo, VideoPlayer } from '@components/video';
import { shortenLargeNumber } from '@lib/number';
import { getGalleries, moreGalleries } from '@redux/gallery/actions';
import { listProducts, moreProduct } from '@redux/product/actions';
import {
  getVideos, getVods, moreVideo, moreVod
} from '@redux/video/actions';
import {
  Button, Layout, message, Modal, Result,
  Tabs, Tooltip
} from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { MessageIcon, SaleVidIcon, TickIcon } from 'src/icons';
import {
  ICountry,
  IError,
  IPerformer,
  ISettings,
  IUIConfig,
  IUser
} from 'src/interfaces';
import { paymentService, performerService } from 'src/services';

interface IProps {
  ui: IUIConfig;
  countries: ICountry[];
  error: IError;
  settings: ISettings;
  user: IUser;
  performer: IPerformer;
  query: any;
  listProducts: Function;
  getVideos: Function;
  moreVideo: Function;
  getVods: Function;
  moreProduct: Function;
  moreVod: Function;
  videoState: any;
  saleVideoState: any;
  productState: any;
  getGalleries: Function;
  moreGalleries: Function;
  galleryState: any;
  currentUser: IUser | IPerformer;
  msg: string;
}
const { TabPane } = Tabs;

class PerformerProfile extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  subscriptionType = 'monthly';

  state = {
    tab: 'video',
    itemPerPage: 24,
    videoPage: 0,
    vodPage: 0,
    productPage: 0,
    galleryPage: 0,
    openSubscriptionModal: false,
    submiting: false,
    showWelcomVideo: false
  };

  static async getInitialProps({ ctx }) {
    const { query } = ctx;
    try {
      const performer = (await (
        await performerService.findOne(query.username, {
          Authorization: ctx.token || ''
        })
      ).data) as IPerformer;

      if (!performer) {
        return Router.push('/error/404');
      }

      return {
        performer,
        msg: query.msg
      };
    } catch (e) {
      const error = await Promise.resolve(e);
      return { error };
    }
  }

  async componentDidMount() {
    const { performer, msg } = this.props;
    if (msg) message.info(msg);
    if (performer) {
      this.loadItems();
      this.checkViewWelcomeVideo();
    }
  }

  onShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      message.success('Link has been copied to clipboard!');
    } catch (e) {
      message.error('Error while coping the link, please copy link from browser directly!');
    }
  };

  checkViewWelcomeVideo = () => {
    const { performer } = this.props;
    const notShownWelcomeVideos = localStorage.getItem('notShownWelcomeVideos');
    if (!notShownWelcomeVideos || !notShownWelcomeVideos?.includes(performer._id)) {
      this.setState({ showWelcomVideo: true });
    }
  };

  loadMoreItem = async () => {
    const {
      moreVideo: moreVideoHandler,
      moreProduct: moreProductHandler,
      moreGalleries: moreGalleryHandler,
      moreVod: moreVodHandler,
      videoState: videosVal,
      productState: productsVal,
      saleVideoState: saleVideosVal,
      galleryState: galleryVal,
      performer
    } = this.props;

    const {
      videoPage, itemPerPage, vodPage, productPage, galleryPage, tab
    } = this.state;
    const query = {
      limit: itemPerPage,
      performerId: performer._id
    };
    if (tab === 'video') {
      if (videosVal.items.length >= videosVal.total) return;
      this.setState({ videoPage: videoPage + 1 });
      moreVideoHandler({
        ...query,
        offset: (videoPage + 1) * itemPerPage,
        isSaleVideo: false
      });
    }
    if (tab === 'saleVideo') {
      if (saleVideosVal.items.length >= saleVideosVal.total) return;
      this.setState({ vodPage: vodPage + 1 });
      moreVodHandler({
        ...query,
        offset: (vodPage + 1) * itemPerPage,
        isSaleVideo: true
      });
    }
    if (tab === 'gallery') {
      if (galleryVal.items.length >= galleryVal.total) return;
      this.setState({ galleryPage: galleryPage + 1 });
      moreGalleryHandler({
        ...query,
        offset: (galleryPage + 1) * itemPerPage
      });
    }
    if (tab === 'store') {
      if (productsVal.items.length >= productsVal.total) return;
      this.setState({ productPage: productPage + 1 });
      moreProductHandler({
        ...query,
        offset: (productPage + 1) * itemPerPage
      });
    }
  };

  loadItems = () => {
    const { itemPerPage, tab } = this.state;
    const {
      performer,
      getGalleries: getGalleriesHandler,
      listProducts: listProductsHandler,
      getVideos: getVideosHandler,
      getVods: getVodsHandler
    } = this.props;
    const query = {
      limit: itemPerPage,
      offset: 0,
      performerId: performer._id
    };
    switch (tab) {
      case 'video':
        this.setState({ videoPage: 0 });
        getVideosHandler({
          ...query,
          isSaleVideo: false
        });
        break;
      case 'saleVideo':
        this.setState({ vodPage: 0 });
        getVodsHandler({
          ...query,
          isSaleVideo: true
        });
        break;
      case 'gallery':
        this.setState({ galleryPage: 0 });
        getGalleriesHandler(query);
        break;
      case 'store':
        this.setState({ productPage: 0 });
        listProductsHandler(query);
        break;
      default:
        break;
    }
  };

  handleViewWelcomeVideo = () => {
    const { performer } = this.props;
    const notShownWelcomeVideos = localStorage.getItem('notShownWelcomeVideos');
    if (!notShownWelcomeVideos?.includes(performer._id)) {
      const Ids = JSON.parse(notShownWelcomeVideos || '[]');
      const values = Array.isArray(Ids)
        ? Ids.concat([performer._id])
        : [performer._id];
      localStorage.setItem('notShownWelcomeVideos', JSON.stringify(values));
    }
    this.setState({ showWelcomVideo: false });
  };

  handleClickMessage = () => {
    const { user, performer } = this.props;
    if (!user._id) {
      message.error('You can message a model just as soon as you login/register.’');
      Router.push('/auth/login');
      return;
    }
    if (!performer.isSubscribed) {
      message.error(`Please subscribe to ${performer?.name || performer?.username || 'the model'} to start chatting`);
      return;
    }
    Router.push({
      pathname: '/messages',
      query: {
        toSource: 'performer',
        toId: performer?._id
      }
    });
  };

  handleClickSubscribe = () => {
    const { user } = this.props;
    if (!user._id) {
      message.error(
        'You can subscribe to the models just as soon as you login/register.'
      );
      Router.push('/auth/login');
      return;
    }
    this.setState({ openSubscriptionModal: true });
  };

  async subscribe(paymentGateway = 'ccbill') {
    const { performer } = this.props;
    try {
      await this.setState({ submiting: true });
      const resp = await (
        await paymentService.subscribe({ type: this.subscriptionType, performerId: performer._id, paymentGateway })
      ).data;
      message.info('Redirecting to payment gateway, do not reload page at this time', 30);
      if (['ccbill', 'verotel'].includes(paymentGateway)) window.location.href = resp.paymentUrl;
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'error occured, please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  }

  render() {
    const {
      performer,
      ui,
      countries,
      settings,
      user,
      videoState: videoProps,
      productState: productProps,
      saleVideoState: saleVideoProps,
      galleryState: galleryProps,
      error,
      currentUser
    } = this.props;
    if (error) {
      return (
        <Result
          status={error?.statusCode === 404 ? '404' : 'error'}
          title={error?.statusCode === 404 ? null : error?.statusCode}
          subTitle={
            error?.statusCode === 404
              ? 'Alas! It hurts us to realize that we have let you down. We are not able to find the page you are hunting for :('
              : error?.message
          }
          extra={[
            <Button
              className="secondary"
              key="console"
              onClick={() => { user?.isPerformer ? Router.push(`/model/${user.username}`) : Router.push('/'); }}
            >
              <HomeOutlined />
              BACK HOME
            </Button>,
            <Button
              key="buy"
              className="primary"
              onClick={() => Router.push('/contact')}
            >
              <ContactsOutlined />
              CONTACT US
            </Button>
          ]}
        />
      );
    }
    const {
      items: videos = [],
      total: totalVideos,
      requesting: loadingVid
    } = videoProps;
    const {
      items: saleVideos = [],
      total: totalVods,
      requesting: loadingVod
    } = saleVideoProps;
    const {
      items: products,
      total: totalProducts,
      requesting: loadingProduct
    } = productProps;
    const {
      items: galleries,
      total: totalGalleries,
      requesting: loadingGallery
    } = galleryProps;
    const { showWelcomVideo, openSubscriptionModal, submiting } = this.state;
    return (
      <Layout>
        <Head>
          <title>
            {`${ui?.siteName} | ${
              performer?.name || performer?.username || ''
            }`}
          </title>
          <meta
            name="keywords"
            content={`${performer?.username}, ${performer?.name}`}
          />
          <meta name="description" content={performer?.bio} />
          {/* OG tags */}
          <meta
            property="og:title"
            content={`${ui?.siteName} | ${
              performer?.name || performer?.username || ''
            }`}
            key="title"
          />
          <meta
            property="og:image"
            content={performer?.avatar || '/no-avatar.png'}
          />
          <meta
            property="og:keywords"
            content={`${performer?.username}, ${performer?.name}`}
          />
          <meta property="og:description" content={performer?.bio} />
        </Head>
        <div className="main-container">
          <div
            className="top-profile"
            style={{
              backgroundImage: performer?.cover
                ? `url('${performer?.cover}')`
                : "url('/banner-image.jpg')"
            }}
          >
            <div className="bg-2nd">
              <div className="top-banner">
                <a
                  aria-hidden
                  className="arrow-back"
                  onClick={() => Router.back()}
                >
                  <ArrowLeftOutlined />
                </a>
                <div className="stats-row">
                  <div className="tab-stat">
                    <div className="tab-item">
                      <span>
                        {shortenLargeNumber(performer?.stats?.totalVideos || 0)}
                        {' '}
                        <VideoCameraOutlined />
                      </span>
                    </div>
                    <div className="tab-item">
                      <span>
                        {shortenLargeNumber(performer?.stats?.totalPhotos || 0)}
                        {' '}
                        <PictureOutlined />
                      </span>
                    </div>
                    <div className="tab-item">
                      <span>
                        {shortenLargeNumber(
                          performer?.stats?.totalProducts || 0
                        )}
                        {' '}
                        <ShoppingOutlined />
                      </span>
                    </div>
                    <div className="tab-item">
                      <span>
                        {shortenLargeNumber(performer?.stats?.likes || 0)}
                        {' '}
                        <LikeOutlined />
                      </span>
                    </div>
                    <div className="tab-item">
                      <span>
                        {shortenLargeNumber(performer?.stats?.subscribers || 0)}
                        {' '}
                        <UsergroupAddOutlined />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="main-profile">
            <div className="fl-col">
              <img alt="Avatar" src={performer?.avatar || '/no-avatar.png'} />
              <div className="m-user-name">
                <Tooltip title={performer?.name}>
                  <h4>
                    {performer?.name ? performer.name : ''}
                    &nbsp;
                    {performer?.verifiedAccount && <TickIcon />}
                  </h4>
                </Tooltip>
                <h5>
                  @
                  {performer?.username || 'n/a'}
                </h5>
              </div>
            </div>
            <div className="btn-grp">
              {user && !user.isPerformer && (
                <Button
                  className="primary"
                  onClick={() => this.handleClickMessage()}
                >
                  <MessageIcon />
                  {' '}
                  Message
                </Button>
              )}
              <Button className="secondary" onClick={this.onShare}>
                <ShareAltOutlined />
                {' '}
                Share profile
              </Button>
            </div>
            <div className={user.isPerformer ? 'mar-0 pro-desc' : 'pro-desc'}>
              <PerformerInfo countries={countries} performer={performer} />
            </div>
            {!performer?.isSubscribed && !user?.isPerformer && (
              <div className="subscription-bl">
                <Button
                  className="sub-btn"
                  disabled={
                    (submiting && this.subscriptionType === 'monthly')
                    || user?.isPerformer
                  }
                  onClick={() => {
                    this.subscriptionType = 'monthly';
                    this.handleClickSubscribe();
                  }}
                >
                  {`Monthly Subscription | $${performer?.monthlyPrice.toFixed(
                    2
                  )}`}
                </Button>
                <Button
                  className="sub-btn"
                  disabled={
                    (submiting && this.subscriptionType === 'yearly')
                    || user?.isPerformer
                  }
                  onClick={() => {
                    this.subscriptionType = 'yearly';
                    this.handleClickSubscribe();
                  }}
                >
                  {`Yearly Subscription | $${performer?.yearlyPrice.toFixed(
                    2
                  )}`}
                </Button>
              </div>
            )}
          </div>
          <div className="model-content">
            <Tabs
              defaultActiveKey="video"
              size="large"
              onTabClick={(tab) => {
                if (tab === 'livestream') {
                  if (!performer.isSubscribed) {
                    message.info(`Please subscribe to enjoy ${performer.username}'s streaming`);
                    return;
                  }

                  Router.push(
                    {
                      pathname: '/stream',
                      query: { performer: JSON.stringify(performer) }
                    },
                    `/stream/${performer.username}`
                  );
                  return;
                }
                this.setState({ tab }, () => this.loadItems());
              }}
            >
              <TabPane
                tab={(
                  <Tooltip placement="top" title="Videos">
                    <VideoCameraOutlined />
                  </Tooltip>
                )}
                key="video"
              >
                <ScrollListVideo
                  items={videos}
                  loading={loadingVid}
                  canLoadmore={videos && videos.length < totalVideos}
                  loadMore={this.loadMoreItem.bind(this)}
                />
              </TabPane>
              <TabPane
                tab={(
                  <Tooltip placement="top" title="Premium content">
                    <span>
                      <SaleVidIcon />
                    </span>
                  </Tooltip>
                )}
                key="saleVideo"
              >
                <ScrollListVideo
                  items={saleVideos}
                  loading={loadingVod}
                  canLoadmore={saleVideos && saleVideos.length < totalVods}
                  loadMore={this.loadMoreItem.bind(this)}
                />
              </TabPane>
              <TabPane
                tab={(
                  <Tooltip placement="top" title="Galleries">
                    <PictureOutlined />
                  </Tooltip>
                )}
                key="gallery"
              >
                <ScrollListGallery
                  items={galleries}
                  loading={loadingGallery}
                  canLoadmore={galleries && galleries.length < totalGalleries}
                  loadMore={this.loadMoreItem.bind(this)}
                />
              </TabPane>

              <TabPane
                tab={(
                  <Tooltip placement="top" title="Merchandise">
                    <ShoppingOutlined />
                  </Tooltip>
                )}
                key="store"
              >
                <ScrollListProduct
                  items={products}
                  loading={loadingProduct}
                  canLoadmore={products && products.length < totalProducts}
                  loadMore={this.loadMoreItem.bind(this)}
                />
              </TabPane>
              {!currentUser?.isPerformer && (
              <TabPane
                key="livestream"
                tab={<LiveStreamIcon performerId={performer?._id} />}
              />
              )}
            </Tabs>
          </div>
        </div>
        {performer
          && performer?.welcomeVideoPath
          && performer?.activateWelcomeVideo && (
            <Modal
              key="welcome-video"
              destroyOnClose
              width={767}
              visible={showWelcomVideo}
              title={null}
              onCancel={() => this.setState({ showWelcomVideo: false })}
              footer={[
                <Button
                  key="close"
                  className="secondary"
                  onClick={() => this.setState({ showWelcomVideo: false })}
                >
                  Close
                </Button>,
                <Button
                  style={{ marginLeft: 0 }}
                  key="close-show"
                  className="primary"
                  onClick={this.handleViewWelcomeVideo.bind(this)}
                >
                  Don&apos;t show me again
                </Button>
              ]}
            >
              <VideoPlayer
                {...{
                  key: performer?._id,
                  autoplay: true,
                  controls: true,
                  playsinline: true,
                  fluid: true,
                  sources: [
                    {
                      src: performer?.welcomeVideoPath,
                      type: 'video/mp4'
                    }
                  ]
                }}
              />
            </Modal>
        )}
        <Modal
          key="subscribe_performer"
          centered
          width={600}
          title={null}
          visible={openSubscriptionModal}
          confirmLoading={submiting}
          footer={null}
          onCancel={() => this.setState({ openSubscriptionModal: false })}
        >
          <ConfirmSubscriptionPerformerForm
            settings={settings}
            type={this.subscriptionType || 'monthly'}
            performer={performer}
            submiting={submiting}
            onFinish={this.subscribe.bind(this)}
          />
        </Modal>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui,
  videoState: { ...state.video.videos },
  saleVideoState: { ...state.video.saleVideos },
  productState: { ...state.product.products },
  galleryState: { ...state.gallery.galleries },
  currentUser: { ...state.user.current },
  settings: { ...state.settings },
  user: { ...state.user.current }
});

const mapDispatch = {
  getVideos,
  moreVideo,
  getVods,
  listProducts,
  moreProduct,
  getGalleries,
  moreGalleries,
  moreVod
};
export default connect(mapStates, mapDispatch)(PerformerProfile);

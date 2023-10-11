import {
  ArrowLeftOutlined,
  DollarCircleOutlined,
  FireOutlined,
  LikeOutlined,
  PictureOutlined,
  ShareAltOutlined,
  // ShoppingOutlined,
  UsergroupAddOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import SeoMetaHead from '@components/common/seo-meta-head';
import TipForm from '@components/common/tip-form';
import ResultError from '@components/error/result-error';
import ScrollListFeed from '@components/feed/scroll-list';
import { ScrollListGallery } from '@components/gallery';
import {
  ConfirmSubscriptionPerformerForm,
  PerformerInfo
} from '@components/performer';
import Price from '@components/price';
// import { ScrollListProduct } from '@components/product/scroll-list-item';
import { LiveStreamIcon } from '@components/streaming/live-stream-icon';
import { ScrollListVideo, VideoPlayer } from '@components/video';
import { shortenLargeNumber } from '@lib/number';
import { redirect404 } from '@lib/utils';
import {
  getFeeds, moreFeeds, removeFeedSuccess
} from '@redux/feed/actions';
import { getGalleries, moreGalleries } from '@redux/gallery/actions';
// import { listProducts, moreProduct } from '@redux/product/actions';
import {
  getVideos, getVods, moreVideo, moreVod
} from '@redux/video/actions';
import {
  Button, Layout, message, Modal, Tabs, Tooltip
} from 'antd';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { MessageIcon, SaleVidIcon, TickIcon } from 'src/icons';
import {
  IError, IFeed, IPerformer, ISettings, IUser
} from 'src/interfaces';
import {
  feedService, paymentService, paymentWalletService, performerService
} from 'src/services';

import style from './model-profile.module.less';

interface IPerformerProfileProps {
  error: IError;
  settings: ISettings;
  user: IUser;
  performer: IPerformer;
  query: any;
  // listProductsHandler: Function;
  getVideosHandler: Function;
  moreVideoHandler: Function;
  getVodsHandler: Function;
  // moreProductHandler: Function;
  moreVodHandler: Function;
  videoState: any;
  saleVideoState: any;
  // productState: any;
  getGalleriesHandler: Function;
  moreGalleryHandler: Function;
  galleryState: any;
  currentUser: IUser | IPerformer;
  msg: string;
  feedState: any;
  getFeedsHandler: Function;
  moreFeedsHandler: Function;
  removeFeedSuccessHandler: Function;
}
const { TabPane } = Tabs;

function PerformerProfile({
  error,
  settings,
  user,
  performer,
  // listProductsHandler,
  getVideosHandler,
  moreVideoHandler,
  getVodsHandler,
  // moreProductHandler,
  moreVodHandler,
  videoState,
  saleVideoState,
  // productState,
  getGalleriesHandler,
  moreGalleryHandler,
  galleryState,
  currentUser,
  msg = null,
  feedState,
  getFeedsHandler,
  moreFeedsHandler,
  removeFeedSuccessHandler
}: IPerformerProfileProps) {
  const { t } = useTranslation();
  const itemPerPage = 24;
  const [subscriptionType, setSubscriptionType] = useState('monthly');
  const [tab, setTab] = useState('feed');
  const [videoPage, setVideoPage] = useState(0);
  const [vodPage, setVodPage] = useState(0);
  // const [productPage, setProductPage] = useState(0);
  const [galleryPage, setGalleryPage] = useState(0);
  const [feedPage, setFeedPage] = useState(0);
  const [openSubscriptionModal, setOpenSubscriptionModal] = useState(false);
  const [submiting, setSubmitting] = useState(false);
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(false);
  const [openTipModal, setOpenTipModal] = useState(false);

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      message.success(t('common:successOnShare'));
    } catch (e) {
      message.error(t('common:errOnShare'));
    }
  };

  const checkViewWelcomeVideo = () => {
    const notShownWelcomeVideos = localStorage.getItem('notShownWelcomeVideos');
    if (
      !notShownWelcomeVideos
      || !notShownWelcomeVideos?.includes(performer._id)
    ) {
      setShowWelcomeVideo(true);
    }
  };

  const loadMoreItem = async () => {
    const query = {
      limit: itemPerPage,
      performerId: performer._id
    };
    if (tab === 'feed') {
      if (feedState.items.length >= feedState.total) {
        return;
      }
      setFeedPage(feedPage + 1);
      moreFeedsHandler({
        limit: itemPerPage,
        offset: (feedPage + 1) * itemPerPage,
        performerId: performer._id
      });
    }
    if (tab === 'video') {
      if (videoState.items.length >= videoState.total) return;
      setVideoPage(videoPage + 1);
      moreVideoHandler({
        ...query,
        offset: (videoPage + 1) * itemPerPage,
        isSaleVideo: false
      });
    }
    if (tab === 'saleVideo') {
      if (saleVideoState.items.length >= saleVideoState.total) return;
      setVodPage(vodPage);
      moreVodHandler({
        ...query,
        offset: (vodPage + 1) * itemPerPage,
        isSaleVideo: true
      });
    }
    if (tab === 'gallery') {
      if (galleryState.items.length >= galleryState.total) return;
      setGalleryPage(galleryPage);
      moreGalleryHandler({
        ...query,
        offset: (galleryPage + 1) * itemPerPage
      });
    }
    // if (tab === 'store') {
    //   if (productState.items.length >= productState.total) return;
    //   setProductPage(productPage);
    //   moreProductHandler({
    //     ...query,
    //     offset: (productPage + 1) * itemPerPage
    //   });
    // }
  };

  const loadItems = (selectedTab = 'feed') => {
    const query = {
      limit: itemPerPage,
      offset: 0,
      performerId: performer._id
    };
    switch (selectedTab) {
      case 'feed':
        setFeedPage(0);
        getFeedsHandler({
          limit: itemPerPage,
          offset: 0,
          performerId: performer._id
        });
        break;
      case 'video':
        setVideoPage(0);
        getVideosHandler({
          ...query,
          isSaleVideo: false
        });
        break;
      case 'saleVideo':
        setVodPage(0);
        getVodsHandler({
          ...query,
          isSaleVideo: true
        });
        break;
      case 'gallery':
        setGalleryPage(0);
        getGalleriesHandler(query);
        break;
      // case 'store':
      //   setProductPage(0);
      //   listProductsHandler(query);
      //   break;
      default:
        break;
    }
  };

  const handleViewWelcomeVideo = () => {
    const notShownWelcomeVideos = localStorage.getItem('notShownWelcomeVideos');
    if (!notShownWelcomeVideos?.includes(performer._id)) {
      const Ids = JSON.parse(notShownWelcomeVideos || '[]');
      const values = Array.isArray(Ids)
        ? Ids.concat([performer._id])
        : [performer._id];
      localStorage.setItem('notShownWelcomeVideos', JSON.stringify(values));
    }
    setShowWelcomeVideo(false);
  };

  const handleDeleteFeed = async (feed: IFeed) => {
    if (currentUser._id !== feed.fromSourceId) {
      message.error(t('common:permissionDenied'));
      return;
    }
    if (!window.confirm(t('common:areYouSureRemovePost'))) return;
    try {
      await feedService.delete(feed._id);
      message.success(t('common:deletedPostSuccessfully'));
      removeFeedSuccessHandler({ feed });
    } catch {
      message.error(t('common:somethingWentWrong'));
    }
  };

  const handleClickMessage = () => {
    if (!user._id) {
      message.error(t('common:errClickSendMesg'));
      Router.push('/auth/login');
      return;
    }
    if (!performer.isSubscribed) {
      message.error(`${t('common:errRequireSubscribeToChat', { username: performer.username })}`);
      return;
    }
    Router.push({
      pathname: '/messages',
      query: {
        toSource: 'performer',
        toId: performer._id
      }
    });
  };

  const handleClickSubscribe = (type = 'monthly') => {
    if (!user._id) {
      message.error(
        t('common:errCheckLoginSubModel')
      );
      Router.push('/auth/login');
      return;
    }
    setSubscriptionType(type);
    setOpenSubscriptionModal(true);
  };

  const subscribe = async (paymentGateway = 'ccbill') => {
    try {
      setSubmitting(true);
      const resp = await (
        await paymentService.subscribe({
          type: subscriptionType,
          performerId: performer._id,
          paymentGateway
        })
      ).data;
      message.info(t('common:paymentRedirecting'), 30);
      if (['ccbill', 'verotel'].includes(paymentGateway)) window.location.href = resp.paymentUrl;
    } catch (e) {
      const err = await e;
      message.error(err?.message || t('common:errCommon'));
    } finally {
      setSubmitting(false);
    }
  };

  const onTabClick = (l) => {
    if (l === 'livestream') {
      if (!performer.isSubscribed) {
        message.info(`${t('common:errRequireSubscribeToStream', performer)}`);
        return;
      }

      Router.push(
        {
          pathname: '/stream/[username]',
          query: { performer: JSON.stringify(performer) }
        },
        `/stream/${performer.username}`
      );
      return;
    }
    setTab(l);
    loadItems(l);
  };

  const sendTip = async (data) => {
    if (!user || !user._id) {
      message.error(t('common:errRequireLogin'));
      return;
    }
    if (!data.amount || data.amount <= 0) {
      message.error(t('common:errInvalidToken'));
      return;
    }
    if (user.balance < data.amount) {
      message.error(t('common:errOutOfWallet'));
      return;
    }
    try {
      setSubmitting(true);
      await paymentWalletService.sendTip(performer._id, { ...data, tipWithMessage: true });
      message.success(t('common:thankForTheTip'));
      setOpenTipModal(false);
    } catch (e) {
      message.error(t('common:errCommon'));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (msg) message.info(msg);
    loadItems(tab);
    checkViewWelcomeVideo();
  }, []);

  // render error if have
  if (error) {
    return <ResultError error={error} />;
  }

  const {
    items: videos = [],
    total: totalVideos,
    requesting: loadingVid
  } = videoState;
  const {
    items: saleVideos = [],
    total: totalVods,
    requesting: loadingVod
  } = saleVideoState;
  // const {
  //   items: products,
  //   total: totalProducts,
  //   requesting: loadingProduct
  // } = productState;
  const {
    items: galleries,
    total: totalGalleries,
    requesting: loadingGallery
  } = galleryState;
  const {
    items: feeds = [],
    total: totalFeeds,
    requesting: loadingFeed
  } = feedState;
  return (
    <Layout>
      <SeoMetaHead
        item={performer}
        keywords={performer.name}
        imageUrl={performer.avatar || '/no-avatar.png'}
      />
      <div className="main-container">
        <div
          className={style['top-profile']}
          style={{
            backgroundImage: `url('${performer.cover || '/banner-image.jpg'}')`
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
                      {shortenLargeNumber(performer?.stats?.totalFeeds || 0)}
                      {' '}
                      <FireOutlined />
                    </span>
                  </div>
                  <div className="tab-item">
                    <span>
                      {shortenLargeNumber(performer.stats?.totalVideos || 0)}
                      {' '}
                      <VideoCameraOutlined />
                    </span>
                  </div>
                  <div className="tab-item">
                    <span>
                      {shortenLargeNumber(performer.stats?.totalPhotos || 0)}
                      {' '}
                      <PictureOutlined />
                    </span>
                  </div>
                  {/* <div className="tab-item">
                    <span>
                      {shortenLargeNumber(performer.stats?.totalProducts || 0)}
                      {' '}
                      <ShoppingOutlined />
                    </span>
                  </div> */}
                  <div className="tab-item">
                    <span>
                      {shortenLargeNumber(performer.stats?.likes || 0)}
                      {' '}
                      <LikeOutlined />
                    </span>
                  </div>
                  <div className="tab-item">
                    <span>
                      {shortenLargeNumber(performer.stats?.subscribers || 0)}
                      {' '}
                      <UsergroupAddOutlined />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={style['main-profile']}>
          <div className="fl-col">
            <img alt="Avatar" src={performer.avatar || '/no-avatar.png'} />
            <div className="m-user-name">
              <Tooltip title={performer.name}>
                <h4>
                  {performer.name ? performer.name : ''}
                  &nbsp;
                  {performer.verifiedAccount && <TickIcon />}
                </h4>
              </Tooltip>
              <h5>
                @
                {performer.username || 'n/a'}
              </h5>
            </div>
          </div>
          <div className="btn-grp">
            {user && !user.isPerformer && (
              <Tooltip title={t('common:sendTip')}>
                <Button
                  className="primary"
                  onClick={() => setOpenTipModal(true)}
                >
                  <DollarCircleOutlined />
                  <span className="hide-mobile">{t('common:sendTip')}</span>
                </Button>
              </Tooltip>
            )}
            {user && !user.isPerformer && (
              <Tooltip title={t('common:sendMsg')}>
                <Button
                  className="primary"
                  onClick={() => handleClickMessage()}
                >
                  <MessageIcon />
                  <span className="hide-mobile">
                    {' '}
                    {t('common:message')}
                  </span>
                </Button>
              </Tooltip>
            )}
            <Tooltip title={t('common:shareProfile')}>
              <Button className="secondary" onClick={onShare}>
                <ShareAltOutlined />
                <span className="hide-mobile">
                  {' '}
                  {t('common:shareProfile')}
                </span>
              </Button>
            </Tooltip>
          </div>
          <div className={user.isPerformer ? 'mar-0 pro-desc' : 'pro-desc'}>
            <PerformerInfo performer={performer} />
          </div>
          {!performer.isSubscribed && !user?.isPerformer && (
            <div className="subscription-bl">
              <Button
                className="sub-btn"
                disabled={
                  (submiting && subscriptionType === 'monthly')
                  || user?.isPerformer
                }
                onClick={() => handleClickSubscribe('monthly')}
              >
                <span>
                  {t('common:monthlySubscription')}
                  {' '}
                  |
                  {' '}
                  <Price amount={performer.monthlyPrice} />
                </span>
              </Button>
              <Button
                className="sub-btn"
                disabled={
                  (submiting && subscriptionType === 'yearly')
                  || user?.isPerformer
                }
                onClick={() => handleClickSubscribe('yearly')}
              >
                <span>
                  {t('common:yearlySubscription')}
                  {' '}
                  |
                  {' '}
                  <Price amount={performer.yearlyPrice} />
                </span>
              </Button>
            </div>
          )}
        </div>
        <div className={style['model-content']}>
          <Tabs defaultActiveKey="feed" size="large" onTabClick={onTabClick}>
            <TabPane
              tab={(
                <Tooltip title={t('common:tabFeed')}>
                  <FireOutlined />
                </Tooltip>
              )}
              key="feed"
            >
              <div className="main-container custom">
                <ScrollListFeed
                  items={feeds}
                  loading={loadingFeed}
                  canLoadmore={feeds && feeds.length < totalFeeds}
                  loadMore={loadMoreItem.bind(this)}
                  isGrid={false}
                  onDelete={handleDeleteFeed.bind(this)}
                />
              </div>
            </TabPane>
            <TabPane
              tab={(
                <Tooltip placement="top" title={t('common:video')}>
                  <VideoCameraOutlined />
                </Tooltip>
              )}
              key="video"
            >
              <ScrollListVideo
                items={videos}
                loading={loadingVid}
                canLoadmore={videos && videos.length < totalVideos}
                loadMore={loadMoreItem.bind(this)}
              />
            </TabPane>
            <TabPane
              tab={(
                <Tooltip placement="top" title={t('common:premiumContent')}>
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
                loadMore={loadMoreItem.bind(this)}
              />
            </TabPane>
            <TabPane
              tab={(
                <Tooltip placement="top" title={t('common:gallery')}>
                  <PictureOutlined />
                </Tooltip>
              )}
              key="gallery"
            >
              <ScrollListGallery
                items={galleries}
                loading={loadingGallery}
                canLoadmore={galleries && galleries.length < totalGalleries}
                loadMore={loadMoreItem.bind(this)}
              />
            </TabPane>

            {/* <TabPane
              tab={(
                <Tooltip placement="top" title={t('common:store')}>
                  <ShoppingOutlined />
                </Tooltip>
              )}
              key="store"
            >
              <ScrollListProduct
                items={products}
                loading={loadingProduct}
                canLoadmore={products && products.length < totalProducts}
                loadMore={loadMoreItem.bind(this)}
              />
            </TabPane> */}
            {!currentUser?.isPerformer && (
              <TabPane
                key="livestream"
                tab={<LiveStreamIcon performerId={performer._id} />}
              />
            )}
          </Tabs>
        </div>
      </div>
      {performer.welcomeVideoPath
        && performer.activateWelcomeVideo && (
          <Modal
            key="welcome-video"
            destroyOnClose
            width={767}
            visible={showWelcomeVideo}
            title={null}
            onCancel={() => setShowWelcomeVideo(false)}
            footer={[
              <Button
                key="close"
                className="secondary"
                onClick={() => setShowWelcomeVideo(false)}
              >
                {t('common:close')}
              </Button>,
              <Button
                style={{ marginLeft: 0 }}
                key="close-show"
                className="primary"
                onClick={handleViewWelcomeVideo}
              >
                {t('common:closeShow')}
              </Button>
            ]}
          >
            <VideoPlayer
              {...{
                key: performer._id,
                autoplay: true,
                controls: true,
                playsinline: true,
                fluid: true,
                sources: [
                  {
                    src: performer.welcomeVideoPath,
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
        onCancel={() => setOpenSubscriptionModal(false)}
      >
        <ConfirmSubscriptionPerformerForm
          settings={settings}
          type={subscriptionType}
          performer={performer}
          submiting={submiting}
          onFinish={subscribe.bind(this)}
        />
      </Modal>
      <Modal
        key="tip_performer"
        className="tip-profile-performer"
        centered
        width={600}
        title={(
          <h3 style={{ width: '100%', textAlign: 'center' }}>
            Send
            {' '}
            {performer.name || performer.name}
            {' '}
            a tip
          </h3>
        )}
        visible={openTipModal}
        confirmLoading={submiting}
        footer={null}
        onCancel={() => setOpenTipModal(false)}
      >
        <TipForm
          loading={submiting}
          submit={sendTip.bind(this)}
        />
      </Modal>
    </Layout>
  );
}

PerformerProfile.getInitialProps = async (ctx) => {
  try {
    const { query } = ctx;
    const { token = '' } = nextCookie(ctx);
    const performer = (await (
      await performerService.findOne(query.username, {
        Authorization: token
      })
    ).data) as IPerformer;

    if (!performer) {
      return redirect404(ctx);
    }

    return {
      performer,
      msg: query.msg
    };
  } catch (e) {
    return redirect404(ctx);
  }
};

PerformerProfile.authenticate = true;
PerformerProfile.noredirect = true;

const mapStates = (state: any) => ({
  videoState: { ...state.video.videos },
  saleVideoState: { ...state.video.saleVideos },
  // productState: { ...state.product.products },
  galleryState: { ...state.gallery.galleries },
  feedState: { ...state.feed.feeds },
  currentUser: { ...state.user.current },
  settings: { ...state.settings },
  user: { ...state.user.current }
});

const mapDispatch = {
  getVideosHandler: getVideos,
  moreVideoHandler: moreVideo,
  getVodsHandler: getVods,
  // listProductsHandler: listProducts,
  // moreProductHandler: moreProduct,
  getGalleriesHandler: getGalleries,
  moreGalleryHandler: moreGalleries,
  moreVodHandler: moreVod,
  getFeedsHandler: getFeeds,
  moreFeedsHandler: moreFeeds,
  removeFeedSuccessHandler: removeFeedSuccess
};
export default connect(mapStates, mapDispatch)(PerformerProfile);

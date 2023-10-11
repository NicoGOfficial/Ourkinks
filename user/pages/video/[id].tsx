/* eslint-disable no-prototype-builtins */
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FlagOutlined,
  HeartOutlined,
  HourglassOutlined,
  LikeOutlined
} from '@ant-design/icons';
import { CommentForm, ListComments } from '@components/comment';
import SeoMetaHead from '@components/common/seo-meta-head';
import { SubscriptionPerformerBlock } from '@components/performer';
import ReportForm from '@components/report/report-form';
import { RelatedListVideo, VideoPlayer } from '@components/video';
import { formatDate, shortenLargeNumber, videoDuration } from '@lib/index';
import { redirect404 } from '@lib/utils';
import {
  createComment,
  deleteComment,
  getComments,
  moreComment
} from '@redux/comment/actions';
import {
  paymentService,
  reactionService,
  reportService,
  videoService
} from '@services/index';
import type { RadioChangeEvent } from 'antd';
import {
  Avatar,
  Button,
  Divider,
  Input,
  Layout,
  message,
  Modal,
  PageHeader,
  Radio,
  Spin,
  Tabs,
  Tag,
  Tooltip
} from 'antd';
import Link from 'next/link';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { TickIcon } from 'src/icons';
import {
  ICoupon,
  IError,
  IPerformer,
  ISettings,
  IUIConfig,
  IUser,
  IVideo
} from 'src/interfaces';
import { getRelated } from 'src/redux/video/actions';

import style from './video.module.less';

const { TabPane } = Tabs;

interface IVideoViewPageProps {
  user: IUser;
  relatedVideos: any;
  getRelatedHandler: Function;
  getCommentsHandler: Function;
  handleLoadMoreComments: Function;
  handleCreateComment: Function;
  handleDeleteComment: Function;
  commentMapping: any;
  comment: any;
  ui: IUIConfig;
  settings: ISettings;
  video: IVideo;
  error: IError;
}

function VideoViewPage({
  user,
  relatedVideos,
  getRelatedHandler,
  getCommentsHandler,
  handleLoadMoreComments,
  handleCreateComment,
  handleDeleteComment,
  commentMapping,
  comment,
  settings,
  video
}: IVideoViewPageProps) {
  const { t } = useTranslation();
  const itemPerPage = 24;

  const [videoStats, setVideoStats] = useState({
    likes: 0,
    favourites: 0,
    wishlists: 0,
    comments: 0,
    views: 0
  });
  const [commentPage, setCommentPage] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyCoupon, setApplyCoupon] = useState(false);
  const [coupon, setCoupon] = useState<ICoupon>(null);
  const [submitting, setSubmitting] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavourited, setIsFavourited] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [gateway, setGateway] = useState('ccbill');
  const [openReportModal, setOpenReportModal] = useState(false);

  const handleReport = async (payload: any) => {
    try {
      if (!payload.title) return;

      setRequesting(true);
      await reportService.create({
        ...payload,
        target: 'video',
        targetId: video._id,
        performerId: video.performerId
      });
      message.success(t('common:reportVideoSuccess'));
    } catch (e) {
      const err = await e;
      message.error(err.message || t('common:errCommon'));
    } finally {
      setRequesting(false);
      setOpenReportModal(false);
    }
  };

  const onChangeTab = (tab: string) => setActiveTab(tab);

  const onReaction = async (action: string) => {
    if (!user?._id) {
      message.error(t('common:errRequireLogin'));
      return;
    }

    try {
      const postData = {
        objectId: video._id,
        action,
        objectType: 'video'
      };
      switch (action) {
        case 'like':
          isLiked
            ? await reactionService.delete(postData)
            : await reactionService.create(postData);
          break;
        case 'favourite':
          isFavourited
            ? await reactionService.delete(postData)
            : await reactionService.create(postData);
          break;
        case 'watch_later':
          isWishlist
            ? await reactionService.delete(postData)
            : await reactionService.create(postData);
          break;
        default:
          break;
      }
      if (action === 'like') {
        setIsLiked(!isLiked);
        setVideoStats({
          ...videoStats,
          likes: videoStats.likes + (!isLiked ? 1 : -1)
        });
      }
      if (action === 'favourite') {
        setIsFavourited(!isFavourited);
        setVideoStats({
          ...videoStats,
          favourites: videoStats.favourites + (!isFavourited ? 1 : -1)
        });
        message.success(isFavourited ? t('common:removeFromFavorite') : t('common:addedToFavorite'));
      }
      if (action === 'watch_later') {
        setIsWishlist(!isWishlist);
        setVideoStats({
          ...videoStats,
          wishlists: videoStats.wishlists + (!isWishlist ? 1 : -1)
        });
        message.success(isWishlist ? t('common:removeFromWishlist') : t('common:addedToWishlist'));
      }
    } catch (e) {
      const err = await e;
      message.error(err.message || t('common:errCommon'));
    }
  };

  const moreCommentHandler = () => {
    setCommentPage(commentPage + 1);
    handleLoadMoreComments({
      limit: itemPerPage,
      offset: (commentPage + 1) * itemPerPage,
      objectId: video._id
    });
  };

  const onUpdateStats = () => {
    setVideoStats(video.stats);
    setIsLiked(video.isLiked);
    setIsFavourited(video.isFavourited);
    setIsWishlist(video.isWishlist);
    getCommentsHandler({
      objectId: video._id,
      limit: itemPerPage,
      offset: 0
    });
    getRelatedHandler({
      performerId: video.performerId,
      excludedId: video._id,
      status: 'active',
      limit: 24
    });
  };

  const deleteCommentHandler = (item) => {
    if (!window.confirm(t('common:comfirmDelComment'))) return;
    handleDeleteComment({ objectId: video._id, _id: item._id });
  };

  const handleChangeGateway = (e: RadioChangeEvent) => setGateway(e.target.value);

  const buyVideo = async () => {
    try {
      if (!user?._id) {
        message.error(t('common:checkLoginToPurchaseVideo'));
        Router.push('/auth/login');
        return;
      }

      if (video.isSchedule) {
        message.info(
          t('common:videoPremieresOn', { date: formatDate(video.scheduledAt, 'll') }),
          10
        );
        return;
      }
      const data = { couponCode, videoId: video._id, paymentGateway: gateway };
      setSubmitting(true);
      if (gateway === 'wallet') {
        await paymentService.purchaseVideoWallet(data);
        message.success(t('common:purchasedVideoSuccess'));
        Router.reload();
      } else {
        const resp = await (await paymentService.purchaseVideo(data)).data;
        if (resp) {
          message.info(
            t('common:paymentRedirecting'),
            30
          );
          if (['ccbill', 'verotel'].includes(gateway)) { window.location.href = resp.paymentUrl; }
        }
      }
    } catch (e) {
      const err = await e;
      message.error(err?.message || t('common:errCommon'));
    } finally {
      setSubmitting(false);
    }
  };

  const subscribe = async (paymentGateway = 'ccbill', type = 'monthly') => {
    if (!user?._id) {
      message.error(
        t('common:errCheckLoginSubModel')
      );
      Router.push('/auth/login');
      return;
    }
    try {
      setSubmitting(true);
      const resp = await (
        await paymentService.subscribe({
          type,
          performerId: video.performer._id,
          paymentGateway
        })
      ).data;
      message.info(
        t('common:paymentRedirecting'),
        30
      );
      if (['ccbill', 'verotel'].includes(paymentGateway)) { window.location.href = resp.paymentUrl; }
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'error occured, please try again later');
      setSubmitting(false);
    }
  };

  const applyCoupon = async () => {
    try {
      if (!user?._id) {
        message.error(t('common:errRequireLogin'));
        return;
      }
      if (isApplyCoupon) {
        setCoupon(null);
        setApplyCoupon(false);
        setCouponCode('');
        return;
      }
      setRequesting(true);
      const resp = await paymentService.applyCoupon(couponCode);
      setApplyCoupon(true);
      setCoupon(resp.data);
      setRequesting(false);
      message.success(
        `${t('common:successApplyCoupon')} $${(
          video.price
          - resp.data.value * video.price
        ).toFixed(2)}!`
      );
    } catch (err) {
      const e = await err;
      message.error(e?.message || t('common:errCommon'));
      setRequesting(false);
    }
  };

  const increaseView = async () => {
    await videoService.increaseView(video._id);
    setVideoStats({
      ...videoStats, views: videoStats.views + 1
    });
  };

  useEffect(() => {
    onUpdateStats();
  }, []);

  // TODO - check use memo here
  // componentDidUpdate(prevProps) {
  //   const { video } = this.props;
  //   if (prevProps.video._id !== video._id) {
  //     this.onUpdateStats();
  //   }
  // }

  const { requesting: commenting } = comment;
  const fetchingComment = commentMapping.hasOwnProperty(video?._id)
    ? commentMapping[video?._id].requesting
    : false;
  const comments = commentMapping.hasOwnProperty(video?._id)
    ? commentMapping[video?._id].items
    : [];
  const totalComments = commentMapping.hasOwnProperty(video?._id)
    ? commentMapping[video?._id].total
    : video?.stats.comments;
  const thumbUrl = video?.thumbnail?.url
    || (video?.video?.thumbnails && video?.video?.thumbnails[0])
    || (video?.teaser?.thumbnails && video?.teaser?.thumbnails[0])
    || '/no-image.jpg';
  const videoJsOptions = {
    key: video?.fileId,
    controls: true,
    playsinline: true,
    poster: thumbUrl,
    sources: [
      {
        src: video?.video?.url || '',
        type: 'video/mp4'
      }
    ]
  };

  const teaserOptions = {
    key: video?.teaserId,
    autoplay: true,
    controls: true,
    playsinline: true,
    loop: true,
    sources: [
      {
        src: video?.teaser?.url || '',
        type: 'video/mp4'
      }
    ]
  };

  return (
    <Layout>
      <SeoMetaHead item={video} imageUrl={thumbUrl} />
      <div className="main-container">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title={video?.title}
        />
        <div className={style['vid-duration']}>
          <a>
            <EyeOutlined />
            &nbsp;
            {shortenLargeNumber(videoStats?.views || 0)}
            &nbsp;&nbsp;
            <HourglassOutlined />
            &nbsp;
            {videoDuration(
              video?.video?.duration || video?.teaser?.duration || 0
            )}
          </a>
          <a>
            <CalendarOutlined />
            &nbsp;
            {formatDate(video?.updatedAt, 'll')}
          </a>
        </div>
        <div className={style['vid-player']}>
          {((!video?.isSaleVideo
            && video?.isSubscribed
            && !video?.isSchedule)
            || (video?.isSaleVideo
              && video?.isBought
              && !video?.isSchedule)) && (
              <div className="main-player">
                <div className="vid-group custom">
                  {video?.processing ? (
                    <div className="vid-processing">
                      <Spin />
                      <p>{t('common:videoFileIsProcessing')}</p>
                    </div>
                  ) : (
                    <VideoPlayer
                      {...videoJsOptions}
                      onPlay={increaseView}
                    />
                  )}
                </div>
              </div>
          )}
          {((video?.isSaleVideo && !video?.isBought)
            || (!video?.isSaleVideo && !video?.isSubscribed)
            || video?.isSchedule) && (
              <div className="main-player">
                <div
                  className={
                    video?.isSchedule ? 'vid-group custom' : 'vid-group'
                  }
                >
                  <div className="left-group">
                    {video?.teaser && video?.teaserProcessing && (
                      <div className="vid-processing">
                        <Spin />
                        <p>{t('common:teaserFileIsProcessing')}</p>
                      </div>
                    )}
                    {video?.teaser && !video?.teaserProcessing && (
                      <VideoPlayer {...teaserOptions} />
                    )}
                    {!video?.teaser && (
                      <div
                        className="video-thumbs"
                        style={{ backgroundImage: `url(${thumbUrl})` }}
                      />
                    )}
                    {!video?.isSaleVideo
                      && !video?.isSubscribed
                      && !video.isSchedule && (
                        <div className="vid-exl-group">
                          <h4>
                            {!user._id
                              ? t('common:signUpHeretoAccessFullVideo')
                              : t('common:subscribeAndGetBenefitsToAccessFullVideo')}
                          </h4>
                          <h3>
                            {t('common:checkSubscriptionPlansHere')}
                            {' '}
                            <ArrowRightOutlined />
                          </h3>
                        </div>
                    )}
                    {video?.isSaleVideo
                      && !video?.isBought
                      && !video?.isSchedule && (
                        <div className="vid-exl-group">
                          <h4>
                            {!user._id
                              ? t('common:signUptoAccessFullVideo')
                              : t('common:unlockToViewFullContent')}
                          </h4>
                          <h3>
                            {t('common:payToUnlock', {
                              price: coupon
                                ? (video.price - video.price * coupon.value).toFixed(2)
                                : (video?.price || 0).toFixed(2)
                            })}
                            <ArrowRightOutlined />
                          </h3>
                        </div>
                    )}
                    {video.isSchedule && (
                      <div className="vid-exl-group">
                        <h4>
                          {t('common:videoPremieresOnDate', {
                            date: formatDate(video?.scheduledAt, 'll')
                          })}
                        </h4>
                        <h3
                          aria-hidden
                          onClick={() => onReaction('watch_later')}
                        >
                          {t('common:addToYourWishlistSoNotMiss')}
                        </h3>
                      </div>
                    )}
                  </div>
                  {!video?.isSaleVideo
                    && !video?.isSubscribed
                    && !video?.isSchedule && (
                      <div className="right-group">
                        <h3 className="title">{t('common:subscribeToView')}</h3>
                        <SubscriptionPerformerBlock
                          performer={video?.performer}
                          onSelect={subscribe}
                          settings={settings}
                          disabled={
                            user?.isPerformer
                            || (!settings.ccbillEnabled
                              && !settings.verotelEnabled)
                          }
                        />
                      </div>
                  )}
                  {video?.isSaleVideo
                    && !video?.isBought
                    && !video?.isSchedule && (
                      <div className="right-group">
                        <h3 className="title">{t('common:unlockToView')}</h3>
                        <div className="member-plans">
                          <h4>{t('common:paymentGateway')}</h4>
                          <Radio.Group
                            onChange={handleChangeGateway}
                            value={gateway}
                          >
                            {settings?.ccbillEnabled && (
                              <Radio value="ccbill">
                                <img
                                  src="/ccbill-ico.png"
                                  height="25px"
                                  alt="ccbill"
                                />
                              </Radio>
                            )}
                            {settings?.verotelEnabled && (
                              <Radio value="verotel">
                                <img
                                  src="/verotel-ico.png"
                                  height="25px"
                                  alt="verotel"
                                />
                              </Radio>
                            )}
                          </Radio.Group>
                          <Divider />
                          <h4>{t('common:wallet')}</h4>
                          <Radio.Group
                            onChange={handleChangeGateway}
                            value={gateway}
                          >
                            <Radio value="wallet" className="radio-wallet">
                              <div className="radio-wallet__wrapper">
                                <img
                                  src="/loading-wallet-icon.png"
                                  height="25px"
                                  alt="wallet"
                                />
                                <p className="text">
                                  {t('common:wallet')}
                                  {' '}
                                  (
                                  {user.balance.toFixed(2)}
                                  )
                                </p>
                              </div>
                            </Radio>
                          </Radio.Group>
                          {!settings?.ccbillEnabled
                            && !settings?.verotelEnabled && (
                              <p>
                                {t('common:noPaymentGateway')}
                              </p>
                          )}
                          <Input.Group
                            style={{ margin: '5px 0', display: 'flex' }}
                          >
                            <Input
                              onChange={(e) => setCouponCode(e.target.value)}
                              placeholder={t('common:enterCouponCodeHere')}
                              disabled={isApplyCoupon}
                              value={couponCode}
                            />
                            <Button
                              style={{ marginLeft: 2, borderRadius: 3 }}
                              disabled={!couponCode || submitting || !user._id}
                              className={
                                isApplyCoupon || couponCode
                                  ? 'success'
                                  : 'default'
                              }
                              onClick={applyCoupon}
                            >
                              <strong>
                                {!isApplyCoupon
                                  ? t('common:applyCoupon')
                                  : t('common:removeCoupon')}
                              </strong>
                            </Button>
                          </Input.Group>
                          <div className="checkout-price">
                            {t('common:total')}
                            :
                            {' '}
                            <span className={isApplyCoupon ? 'discount-p' : ''}>
                              $
                              {(video.price).toFixed(2)}
                            </span>
                            {' '}
                            {coupon && (
                              <span>
                                $
                                {(
                                  video.price
                                  - coupon.value * video.price
                                ).toFixed(2)}
                              </span>
                            )}
                          </div>
                          <Button
                            className="primary"
                            onClick={buyVideo}
                            disabled={
                              submitting
                              || requesting
                              || (!settings?.ccbillEnabled
                                && !settings?.verotelEnabled)
                            }
                            loading={submitting}
                          >
                            <strong>{t('common:checkout')}</strong>
                          </Button>
                        </div>
                      </div>
                  )}
                </div>
              </div>
          )}
        </div>
      </div>
      <div className="middle-split">
        <div className="main-container">
          <div className="middle-actions">
            <Link
              href={{
                pathname: '/model/[username]',
                query: {
                  username:
                    video?.performer?.username || video?.performer?._id
                }
              }}
              as={`/model/${video?.performer?.username || video?.performer?._id
              }`}
            >
              <a>
                <div className="o-w-ner">
                  <Avatar
                    alt="performer avatar"
                    src={video?.performer?.avatar || '/user.png'}
                  />
                  <span className="owner-name">
                    <span>
                      {video?.performer?.name || 'N/A'}
                      {' '}
                      {video?.performer?.verifiedAccount && <TickIcon />}
                    </span>
                    <span style={{ fontSize: '10px' }}>
                      @
                      {video?.performer?.username || 'n/a'}
                    </span>
                  </span>
                </div>
              </a>
            </Link>
            <div className="act-btns">
              <Tooltip title={isLiked ? 'Unlike' : 'Like'}>
                <Button
                  disabled={!user?._id || user?.isPerformer}
                  className={isLiked ? 'react-btn active' : 'react-btn'}
                  onClick={() => onReaction('like')}
                >
                  {shortenLargeNumber(videoStats?.likes || 0)}
                  {' '}
                  <LikeOutlined />
                </Button>
              </Tooltip>
              <Tooltip
                title={
                  isFavourited ? t('common:removeFromFavorites') : t('common:addToFavorites')
                }
              >
                <Button
                  disabled={!user?._id || user?.isPerformer}
                  className={isFavourited ? 'react-btn active' : 'react-btn'}
                  onClick={() => onReaction('favourite')}
                >
                  {shortenLargeNumber(videoStats?.favourites || 0)}
                  {' '}
                  <HeartOutlined />
                </Button>
              </Tooltip>
              <Tooltip
                title={
                  isWishlist ? t('common:removeFormWishList') : t('common:addToWishlist')
                }
              >
                <Button
                  disabled={!user?._id || user?.isPerformer}
                  className={isWishlist ? 'react-btn active' : 'react-btn'}
                  onClick={() => onReaction('watch_later')}
                >
                  {shortenLargeNumber(videoStats?.wishlists || 0)}
                  {' '}
                  <ClockCircleOutlined />
                </Button>
              </Tooltip>
              <Button
                disabled={
                  !user?._id || !video?.isSubscribed || user?.isPerformer
                }
                className={openReportModal ? 'react-btn active' : 'react-btn'}
                onClick={() => setOpenReportModal(true)}
              >
                <FlagOutlined />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="middle-info">
        <div className="main-container">
          {video?.tags.length > 0 && (
            <div className="vid-tags">
              {t('common:tags')}
              :
              {' '}
              {video?.tags.map((tag) => (
                <a
                  aria-hidden
                  key={tag}
                  onClick={() => Router.push({ pathname: '/search', query: { q: tag } })}
                >
                  <Tag>
                    #
                    {tag}
                  </Tag>
                </a>
              ))}
            </div>
          )}
          <Tabs activeKey={activeTab} onChange={onChangeTab}>
            <TabPane tab="Description" key="description">
              <p>{video?.description || t('common:noDescription')}</p>
            </TabPane>
            <TabPane
              tab={(
                <span>
                  Performers (
                  {video?.participants?.length || 0}
                  )
                </span>
              )}
              key="participants"
            >
              {video?.participants && video?.participants.length > 0 ? (
                video?.participants.map((per: IPerformer) => (
                  <Link
                    key={per._id}
                    href={{
                      pathname: '/model/[username]',
                      query: { username: per?.username || per?._id }
                    }}
                    as={`/model/${per?.username || per?._id}`}
                  >
                    <a>
                      <div key={per._id} className={style['participant-card']}>
                        <img
                          alt="per_atv"
                          src={per?.avatar || '/no-avatar.png'}
                        />
                        <div className={style['participant-info']}>
                          <h4>
                            {per?.name || 'N/A'}
                            {' '}
                            {per?.verifiedAccount && <TickIcon />}
                          </h4>
                          <h5>
                            @
                            {per?.username || 'n/a'}
                          </h5>
                          <Tooltip title={per?.bio}>
                            <div className="p-bio">{per.bio || t('common:noBio')}</div>
                          </Tooltip>
                        </div>
                      </div>
                    </a>
                  </Link>
                ))
              ) : (
                <p>{t('common:noProfileWasFound')}</p>
              )}
            </TabPane>
            <TabPane
              tab={(
                <span>
                  {t('common:comments')}
                  {' '}
                  (
                  {totalComments}
                  )
                </span>
              )}
              key="comment"
            >
              <CommentForm
                creator={user}
                onSubmit={handleCreateComment}
                objectId={video?._id}
                objectType="video"
                requesting={commenting}
              />
              <ListComments
                key={`list_comments_${video?._id}_${comments.length}`}
                requesting={fetchingComment}
                comments={comments}
                onDelete={deleteCommentHandler}
                user={user}
                canReply
              />
              {comments.length < totalComments && (
                <p className="text-center">
                  <a aria-hidden onClick={moreCommentHandler}>
                    {t('common:moreComment')}
                  </a>
                </p>
              )}
            </TabPane>
          </Tabs>
        </div>
      </div>
      <div className="main-container">
        <div className="related-items">
          <h4 className="ttl-1">{t('common:youLike')}</h4>
          {relatedVideos.requesting && (
            <div className="text-center">
              <Spin />
            </div>
          )}
          {relatedVideos.items.length > 0 && !relatedVideos.requesting && (
            <RelatedListVideo videos={relatedVideos.items} />
          )}
          {!relatedVideos.items.length && !relatedVideos.requesting && (
            <p>{t('common:noVideo')}</p>
          )}
        </div>
      </div>
      <Modal
        key="report_post"
        className="subscription-modal"
        title={`Report video ${video?.title}`}
        visible={openReportModal}
        confirmLoading={submitting}
        footer={null}
        destroyOnClose
        onCancel={() => setOpenReportModal(false)}
      >
        <ReportForm
          submiting={submitting}
          onFinish={handleReport}
        />
      </Modal>
    </Layout>
  );
}

VideoViewPage.getInitialProps = async (ctx) => {
  try {
    const { query } = ctx;
    const { token = '' } = nextCookie(ctx);
    const video = await (
      await videoService.findOne(query.id, {
        Authorization: token
      })
    ).data;

    return {
      video
    };
  } catch (e) {
    return redirect404(ctx);
  }
};

VideoViewPage.authenticate = true;
VideoViewPage.noredirect = true;

const mapStates = (state: any) => {
  const { commentMapping, comment } = state.comment;
  return {
    user: { ...state.user.current },
    settings: { ...state.settings },
    relatedVideos: { ...state.video.relatedVideos },
    commentMapping,
    comment
  };
};

const mapDispatch = {
  getRelatedHandler: getRelated,
  getCommentsHandler: getComments,
  handleLoadMoreComments: moreComment,
  handleCreateComment: createComment,
  handleDeleteComment: deleteComment
};
export default connect(mapStates, mapDispatch)(VideoViewPage);

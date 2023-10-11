/* eslint-disable react/jsx-indent */
/* eslint-disable no-prototype-builtins */
import {
  CaretDownOutlined,
  CommentOutlined,
  DollarOutlined,
  EyeOutlined,
  FileImageOutlined,
  HeartOutlined,
  LockOutlined,
  MoreOutlined,
  PushpinFilled,
  UnlockOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import { CommentForm, ListComments } from '@components/comment';
import { ConfirmSubscriptionPerformerForm } from '@components/performer';
import { TipPerformerForm } from '@components/performer/tip-form';
// import { Twitter, Facebook } from 'react-social-sharing';
import { VideoPlayer } from '@components/video/video-player';
import { formatDateFromnow, videoDuration } from '@lib/index';
import {
  createComment,
  deleteComment,
  getComments,
  moreComment
} from '@redux/comment/actions';
import { updateBalance } from '@redux/user/actions';
import {
  feedService, paymentService, paymentWalletService, reactionService
} from '@services/index';
import {
  Button,
  Collapse,
  Divider,
  Dropdown,
  Menu,
  message,
  Modal
} from 'antd';
import moment from 'moment';
import Link from 'next/link';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { Component } from 'react';
import ReactMomentCountDown from 'react-moment-countdown';
import { connect } from 'react-redux';

import { IFeed, ISettings, IUser } from '../../interfaces';
import FeedSlider from './feed-slider';
import style from './index.module.less';
import { PurchaseFeedForm } from './purchase-feed-form';

interface IProps {
  feed: IFeed;
  // eslint-disable-next-line react/require-default-props
  onDelete?: Function;
  user: IUser;
  getComments: Function;
  moreComment: Function;
  createComment: Function;
  deleteComment: Function;
  updateBalance: Function;
  commentMapping: any;
  comment: any;
  settings: ISettings;
  i18n: any;
}

function thoudsandToK(value: number) {
  if (value < 1000) return value;
  return `${(value / 1000).toFixed(1)}K`;
}

class FeedCard extends Component<IProps> {
  subscriptionType = 'monthly';

  state = {
    isOpenComment: false,
    isLiked: false,
    // isBookMarked: false,
    totalLike: 0,
    totalTips: 0,
    totalComment: 0,
    isFirstLoadComment: true,
    itemPerPage: 10,
    commentPage: 0,
    isHovered: false,
    openTipModal: false,
    openPurchaseModal: false,
    openTeaser: false,
    submiting: false,
    polls: [],
    requesting: false,
    // shareUrl: '',
    openSubscriptionModal: false,
    showPinned: false
  };

  componentDidMount() {
    const { feed } = this.props;
    if (feed) {
      this.setState({
        isLiked: feed.isLiked,
        // isBookMarked: feed.isBookMarked,
        totalLike: feed.totalLike,
        totalTips: feed.totalTips,
        totalComment: feed.totalComment,
        showPinned: feed.isPinned && (Router.pathname === '/model/[username]' || Router.pathname === '/model/my-feed'),
        polls: feed.polls ? feed.polls : []
        // shareUrl: `${window.location.origin}/post/${feed._id}`
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { feed, commentMapping, comment } = this.props;
    const { totalComment } = this.state;
    if (
      (!prevProps.comment.data
        && comment.data
        && comment.data.objectId === feed._id)
      || (prevProps.commentMapping[feed._id]
        && totalComment !== commentMapping[feed._id].total)
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ totalComment: commentMapping[feed._id].total });
    }
  }

  // async handleBookmark() {
  //   const { feed, user } = this.props;
  //   if (!user || !user._id) {
  //     message.error('Please to login or register');
  //     return;
  //   }
  //   const { isBookMarked, requesting } = this.state;
  //   if (requesting || !user._id || user.isPerformer) return;
  //   try {
  //     await this.setState({ requesting: true });
  //     if (!isBookMarked) {
  //       await reactionService.create({
  //         objectId: feed._id,
  //         action: 'bookmark',
  //         objectType: 'feed'
  //       });
  //       this.setState({ isBookMarked: true });
  //     } else {
  //       await reactionService.delete({
  //         objectId: feed._id,
  //         action: 'bookmark',
  //         objectType: 'feed'
  //       });
  //       this.setState({ isBookMarked: false });
  //     }
  //   } catch (e) {
  //     const error = await e;
  //     message.error(error.message || 'Error occured, please try again later');
  //   } finally {
  //     await this.setState({ requesting: false });
  //   }
  // }

  async handleLike() {
    const { t } = this.props.i18n;
    const { feed, user } = this.props;
    const { isLiked, totalLike, requesting } = this.state;
    if (!user._id) {
      message.error(t('common:pleaseLoginToLikeOrCommentOrTip'));
      return;
    }
    if (requesting) return;
    try {
      await this.setState({ requesting: true });
      if (!isLiked) {
        await reactionService.create({
          objectId: feed._id,
          action: 'like',
          objectType: 'feed'
        });
        this.setState({ isLiked: true, totalLike: totalLike + 1 });
      } else {
        await reactionService.delete({
          objectId: feed._id,
          action: 'like',
          objectType: 'feed'
        });
        this.setState({ isLiked: false, totalLike: totalLike - 1 });
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || t('common:errCommon'));
    } finally {
      await this.setState({ requesting: false });
    }
  }

  async onOpenComment() {
    const { feed, getComments: handleGetComment } = this.props;
    const {
      isOpenComment, isFirstLoadComment, itemPerPage, commentPage
    } = this.state;
    this.setState({ isOpenComment: !isOpenComment });
    if (isFirstLoadComment) {
      await this.setState({ isFirstLoadComment: false });
      handleGetComment({
        objectId: feed._id,
        objectType: 'feed',
        limit: itemPerPage,
        offset: commentPage
      });
    }
  }

  pinToProfile = async (feedId: string) => {
    const { t } = this.props.i18n;
    try {
      await feedService.pinToProfile(feedId);
      message.success(t('common:pinnedSuccess'));
      window.location.reload();
    } catch (error) {
      message.error(t('common:errCommon'));
    }
  };

  unPinToProfile = async (feedId: string) => {
    const { t } = this.props.i18n;
    try {
      await feedService.unPinToProfile(feedId);
      message.success(t('common:unPinnedSuccess'));
      window.location.reload();
    } catch (error) {
      message.error(t('common:errCommon'));
    }
  };

  copyLink(feedId: string) {
    const { t } = this.props.i18n;
    const str = `${window.location.origin}/post/${feedId}`;
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    message.success(t('common:copied'));
  }

  async moreComment() {
    const { feed, moreComment: handleLoadMore } = this.props;
    const { commentPage, itemPerPage } = this.state;
    await this.setState({
      commentPage: commentPage + 1
    });
    handleLoadMore({
      limit: itemPerPage,
      offset: (commentPage + 1) * itemPerPage,
      objectId: feed._id
    });
  }

  async deleteComment(item) {
    const { t } = this.props.i18n;
    const { deleteComment: handleDelete } = this.props;
    if (!window.confirm(t('common:confirmRemoveComment'))) return;
    handleDelete(item);
  }

  async subscribe() {
    const { t } = this.props.i18n;
    const { feed } = this.props;
    try {
      await this.setState({ submiting: true });
      const resp = await (
        await paymentService.subscribe({
          type: this.subscriptionType,
          performerId: feed.performer._id
        })
      ).data;
      window.location.href = resp?.paymentUrl;
    } catch (e) {
      const err = await e;
      message.error(err.message || t('common:errCommon'));
    } finally {
      this.setState({ submiting: false });
    }
  }

  async sendTip(amount: number) {
    const { t } = this.props.i18n;
    const { feed, updateBalance: handleUpdateBalance, user } = this.props;
    const { totalTips } = this.state;
    if (!user._id) {
      message.error(t('common:pleaseLoginToLikeOrCommentOrTip'));
      return;
    }
    try {
      await this.setState({ submiting: true });
      const resp = await (
        await paymentWalletService.tipFeed({
          performerId: feed?.performer?._id,
          feedId: feed._id,
          amount
        })
      ).data;
      if (resp.success) {
        message.info(t('common:thankYouForTheTip'));
        handleUpdateBalance(-1 * amount);
      }
      this.setState({ totalTips: totalTips + amount });
    } catch (e) {
      const err = await e;
      message.error(err.message || t('common:errCommon'));
    } finally {
      this.setState({ submiting: false });
    }
  }

  async votePoll(poll: any) {
    const { t } = this.props.i18n;
    const { feed } = this.props;
    const { polls } = this.state;
    const isExpired = new Date(feed.pollExpiredAt) < new Date();
    if (isExpired) {
      return message.error(t('common:pollHasAlreadyExpiredToVote'));
    }
    if (!window.confirm(t('common:voteIT'))) return false;
    try {
      await this.setState({ requesting: true });
      await feedService.votePoll(poll._id);
      const index = polls.findIndex((p) => p._id === poll._id);
      await this.setState((prevState: any) => {
        const newItems = [...prevState.polls];
        newItems[index].totalVote += 1;
        return { polls: newItems };
      });
    } catch (e) {
      const error = await e;
      message.error(
        error.message || t('common:somethingWentWrong')
      );
    } finally {
      await this.setState({ requesting: false });
    }
    return undefined;
  }

  render() {
    const { t } = this.props.i18n;
    const {
      feed,
      user,
      commentMapping,
      comment,
      onDelete: handleDelete,
      createComment: handleCreateComment,
      settings
    } = this.props;
    const { performer } = feed;
    const { requesting: commenting } = comment;
    const fetchingComment = commentMapping.hasOwnProperty(feed._id)
      ? commentMapping[feed._id].requesting
      : false;
    const comments = commentMapping.hasOwnProperty(feed._id)
      ? commentMapping[feed._id].items
      : [];
    const totalComments = commentMapping.hasOwnProperty(feed._id)
      ? commentMapping[feed._id].total
      : 0;
    const {
      isOpenComment,
      isLiked,
      totalComment,
      totalLike,
      totalTips,
      isHovered,
      openTipModal,
      openPurchaseModal,
      submiting,
      polls,
      // isBookMarked,
      // shareUrl,
      openTeaser,
      openSubscriptionModal,
      showPinned
    } = this.state;
    const images = feed.files && feed.files.filter((f) => f.type === 'feed-photo');
    const videos = feed.files && feed.files.filter((f) => f.type === 'feed-video');
    let totalVote = 0;
    polls
      && polls.forEach((poll) => {
        totalVote += poll.totalVote;
      });
    const menu = (
      <Menu key={`menu_${feed._id}`}>
        {!Router.pathname.includes('/post/') && (
          <Menu.Item key={`post_detail_${feed._id}`}>
            <Link
              href={{
                pathname: '/post/[id]',
                query: { id: feed._id }
              }}
              as={`/post/${feed._id}`}
            >
              <a>{t('common:postDetails')}</a>
            </Link>
          </Menu.Item>
        )}
        <Menu.Item
          key={`copy_link_${feed._id}`}
          onClick={this.copyLink.bind(this, feed._id)}
        >
          <a>{t('common:copyLink')}</a>
        </Menu.Item>
        {user._id === feed.fromSourceId && !feed.isPinned && (
          <Menu.Item
            key={`pin_profile_${feed._id}`}
            onClick={this.pinToProfile.bind(this, feed._id)}
          >
            <a>
              {t('common:pinToProfilePage')}
            </a>
          </Menu.Item>
        )}
        {user._id === feed.fromSourceId && feed.isPinned && (
          <Menu.Item
            key={`un_pin_profile_${feed._id}`}
            onClick={this.unPinToProfile.bind(this, feed._id)}
          >
            <a>
              {t('common:unpinned')}
            </a>
          </Menu.Item>
        )}
        {user._id === feed.fromSourceId && (
          <Menu.Item key={`edit_feed_${feed._id}`}>
            <Link
              href={{
                pathname: '/model/my-feed/edit',
                query: { id: feed._id }
              }}
            >
              <a>{t('common:editFeed')}</a>
            </Link>
          </Menu.Item>
        )}
        {user._id === feed.fromSourceId && (
          <Divider style={{ margin: '10px 0' }} />
        )}
        {user._id === feed.fromSourceId && (
          <Menu.Item key={`delete_post_${feed._id}`}>
            <a aria-hidden onClick={handleDelete.bind(this, feed)}>
              {t('common:delFeed')}
            </a>
          </Menu.Item>
        )}
      </Menu>
    );
    const dropdown = (
      <Dropdown overlay={menu}>
        <a
          aria-hidden
          className="ant-dropdown-link"
          onClick={(e) => e.preventDefault()}
        >
          <MoreOutlined />
        </a>
      </Dropdown>
    );
    return (
      <div className={style['feed-card']}>
        <div className="feed-top">
          <Link
            href={{
              pathname: '/model/[username]',
              query: { username: performer?.username }
            }}
            as={`model/${performer?.username}`}
          >
            <div className="feed-top-left">
              <img
                alt="per_atv"
                src={performer?.avatar || '/no-avatar.png'}
                width="50px"
              />
              <div className="feed-name">
                <h4>
                  {performer?.name || 'N/A'}
                  {/* {' '}
                  {performer?.verifiedAccount && <CheckCircleOutlined className="theme-color" />} */}
                </h4>
                <h5>
                  @
                  {performer?.username || 'N/A'}
                </h5>
              </div>
              {performer?.isOnline ? (
                <span className="online-status" />
              ) : (
                <span className="online-status off" />
              )}
            </div>
          </Link>
          <div className="feed-top-right">
            {showPinned && <PushpinFilled />}
            <span className="feed-time">
              {formatDateFromnow(feed.updatedAt)}
            </span>
            {dropdown}
          </div>
        </div>
        <div className="feed-container">
          {((!feed.isSale && feed.isSubscribed)
            || (feed.isSale && feed.isBought)) && (
              <div className="feed-content">
                <FeedSlider feed={feed} />
              </div>
            )}
          {((feed.type !== 'text' && !feed.isSale && !feed.isSubscribed)
            || (feed.isSale && !feed.isBought)) && (
              <div
                className="lock-content"
                style={
                  feed.thumbnailUrl ? {
                    backgroundImage: `url(${feed.thumbnailUrl})`
                  } : {
                    backgroundImage: `url(${feed.files[0].preview || '/leaf.jpg'})`
                  }
                }
              >
                <div
                  className="text-center"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => this.setState({ isHovered: true })}
                  onMouseLeave={() => this.setState({ isHovered: false })}
                >
                  {!isHovered ? <LockOutlined /> : <UnlockOutlined />}
                  {!feed.isSale && !feed.isSubscribed && performer && (
                    <p
                      aria-hidden
                      onClick={() => this.setState({ openSubscriptionModal: true })}
                    >
                      {t('common:subToSeeFeed')}
                    </p>
                  )}
                  {feed.isSale && !feed.isBought && performer && (
                    <p
                      aria-hidden
                      onClick={() => this.setState({ openPurchaseModal: true })}
                    >
                      {t('common:unlockfeed', { price: feed.price || 0 })}
                    </p>
                  )}
                  {feed.teaser && (
                    <div className="text-center">
                      <Button
                        type="primary"
                        onClick={() => this.setState({ openTeaser: true })}
                      >
                        <EyeOutlined />
                        {t('common:viewTeaserVideo')}
                      </Button>
                    </div>
                  )}
                </div>
                {feed.files && feed.files.length > 0 && (
                  <div className="count-media">
                    <span className="count-media-item">
                      {images.length > 0 && (
                        <span>
                          {images.length > 1 && images.length}
                          {' '}
                          <FileImageOutlined />
                          {' '}
                        </span>
                      )}
                      {videos.length > 0 && images.length > 0 && '|'}
                      {videos.length > 0 && (
                        <span>
                          {videos.length > 1 && videos.length}
                          {' '}
                          <VideoCameraOutlined />
                          {' '}
                          {videos.length === 1
                            && videoDuration(videos[0].duration)}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          <div className="feed-text">
            <Collapse
              bordered={false}
              // eslint-disable-next-line react/no-unstable-nested-components
              expandIcon={({ isActive }) => (<CaretDownOutlined rotate={isActive ? 180 : 0} />)}
              className="site-collapse-custom-collapse"
              expandIconPosition="right"
            >

              <Collapse.Panel
                header={feed.text}
                key="1"
                className="site-collapse-custom-panel"
              >
                {feed.text}

              </Collapse.Panel>
            </Collapse>
          </div>
          {polls
            && polls.length > 0
            && polls.map((poll) => (
              <div
                aria-hidden
                className={style['feed-poll']}
                key={poll._id}
                onClick={this.votePoll.bind(this, poll)}
              >
                <span>{poll.description}</span>
                {' '}
                <span>{poll.totalVote}</span>
              </div>
            ))}
          {polls && polls.length > 0 && (
            <div className={style['total-vote']}>
              <span>
                {t('common:totalVote', { totalVote })}
              </span>
              {feed.pollExpiredAt
                && moment(feed.pollExpiredAt).isAfter(moment()) ? (
                <span>
                  {`${moment(feed.pollExpiredAt).diff(
                    moment(),
                    'days'
                  )} day(s) `}
                  <ReactMomentCountDown toDate={moment(feed.pollExpiredAt)} />
                </span>
              ) : (
                <span>{t('common:expired')}</span>
              )}
            </div>
          )}
        </div>
        <div className="feed-bottom">
          <div className="feed-actions">
            <div className="action-item">
              <Button
                aria-hidden
                className={isLiked ? 'actionIco liked' : 'actionIco'}
                onClick={this.handleLike.bind(this)}
              >
                <HeartOutlined />
                {' '}
                {totalLike > 0 ? thoudsandToK(totalLike) : '0'}
              </Button>
              <Button
                aria-hidden
                className={isOpenComment ? 'actionIco active' : 'actionIco'}
                onClick={this.onOpenComment.bind(this)}
              >
                <CommentOutlined />
                {' '}
                {totalComment > 0 && thoudsandToK(totalComment)}
              </Button>
              {performer && (
                <Button
                  aria-hidden
                  className={style.actionIco}
                  style={!user || user?._id === performer?._id ? { cursor: 'unset' } : {}}
                  onClick={() => user?._id !== performer?._id && this.setState({ openTipModal: true })}
                >
                  <DollarOutlined />
                  {' '}
                  {totalTips > 0 ? thoudsandToK(totalTips) : '0'}
                </Button>
              )}
            </div>
            {/* <div className="action-item">
              <Twitter link={shareUrl} />
              <Facebook link={shareUrl} />
              {user._id && !user.isPerformer && (
              <span aria-hidden className={isBookMarked ? 'actionIco active' : 'actionIco'} onClick={this.handleBookmark.bind(this)}>
                <Tooltip title={!isBookMarked ? 'Add to Bookmarks' : 'Remove from Bookmarks'}><BookOutlined /></Tooltip>
              </span>
              )}
            </div> */}
          </div>
          {isOpenComment && (
            <div className="feed-comment">
              <CommentForm
                creator={user}
                onSubmit={handleCreateComment.bind(this)}
                objectId={feed._id}
                objectType="feed"
                requesting={commenting}
              />
              <ListComments
                key={`list_comments_${feed._id}_${comments.length}`}
                requesting={fetchingComment}
                comments={comments}
                onDelete={this.deleteComment.bind(this)}
                user={user}
                canReply
              />
              {comments.length < totalComments && (
                <p className="text-center">
                  <a aria-hidden onClick={this.moreComment.bind(this)}>
                    {t('common:moreComment')}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
        <Modal
          key="tip_performer"
          className={style['tip-performer-modal']}
          title={null}
          width={350}
          visible={openTipModal}
          onOk={() => this.setState({ openTipModal: false })}
          footer={null}
          onCancel={() => this.setState({ openTipModal: false })}
        >
          <TipPerformerForm
            performer={performer}
            submiting={submiting}
            onFinish={this.sendTip.bind(this)}
          />
        </Modal>
        <Modal
          key="purchase_feed"
          className="subscription-modal"
          title={null}
          visible={openPurchaseModal}
          confirmLoading={submiting}
          footer={null}
          destroyOnClose
          onCancel={() => this.setState({ openPurchaseModal: false })}
        >
          <PurchaseFeedForm feed={feed} />
        </Modal>
        <Modal
          key="subscribe_performer"
          className="subscription-modal"
          width={350}
          title={null}
          visible={openSubscriptionModal}
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
        <Modal
          key="teaser_video"
          title="Teaser video"
          visible={openTeaser}
          footer={null}
          onCancel={() => this.setState({ openTeaser: false })}
          width={990}
        >
          <VideoPlayer
            key={feed?.teaser?._id}
            id={feed?.teaser?._id}
            pauseHiddenVideo
            {...{
              autoplay: false,
              controls: true,
              playsinline: true,
              sources: [
                {
                  src: feed?.teaser?.url,
                  type: 'video/mp4'
                }
              ]
            }}
          />
        </Modal>
      </div>
    );
  }
}

const mapStates = (state: any) => {
  const { commentMapping, comment } = state.comment;
  return {
    user: state.user.current,
    settings: state.settings,
    commentMapping,
    comment
  };
};

const mapDispatch = {
  getComments,
  moreComment,
  createComment,
  deleteComment,
  updateBalance
};
export default connect(mapStates, mapDispatch)(withTranslation(FeedCard));

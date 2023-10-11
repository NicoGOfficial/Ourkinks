import SeoMetaHead from '@components/common/seo-meta-head';
import ChatBox from '@components/stream-chat/chat-box';
import Tipping from '@components/streaming/tipping';
import { getResponseError } from '@lib/utils';
import {
  getStreamConversationSuccess,
  loadStreamMessages,
  resetAllStreamMessage,
  resetStreamMessage
} from '@redux/stream-chat/actions';
import {
  Avatar,
  Button, Col, message, Row
} from 'antd';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import getT from 'next-translate/getT';
import withTranslation from 'next-translate/withTranslation';
import React, { ContextType, PureComponent } from 'react';
import { connect } from 'react-redux';
import LiveSubscriber from 'src/components/streaming/subscriber';
import {
  HLS,
  IPerformer,
  IUser,
  PUBLIC_CHAT,
  StreamSettings,
  WEBRTC
} from 'src/interfaces';
import { messageService, performerService, streamService } from 'src/services';
import { IResponse } from 'src/services/api-request';
import { Event, SocketContext } from 'src/socket';
import { ISocketContext } from 'src/socket/SocketContext';

// eslint-disable-next-line no-shadow
enum STREAM_EVENT {
  JOIN_BROADCASTER = 'join-broadcaster',
  MODEL_LEFT = 'model-left',
  ROOM_INFORMATIOM_CHANGED = 'public-room-changed'
}

const DEFAULT_OFFLINE_IMAGE_URL = '/ct-bg.jpg';
const DEFAULT_PRIVATE_IMAGE_URL = '/ct-bg.jpg';
const DEFAULT_IMAGE_URL = '/ct-bg.jpg';

type IProps = {
  resetStreamMessage: Function;
  getStreamConversationSuccess: Function;
  loadStreamMessages: Function;
  activeConversation: any;
  performer: IPerformer;
  success: boolean;
  searching: boolean;
  settings: StreamSettings;
  i18n: any;
}

interface IStates {
  total: number;
  members: IUser[];
}

class LivePage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  // eslint-disable-next-line react/static-property-placement
  context!: ContextType<typeof SocketContext>;

  private subscrbierRef: any;

  private subscriberRef2: any;

  private interval: NodeJS.Timeout;

  public static async getInitialProps(ctx) {
    try {
      const { query } = ctx;
      let performer;
      if (typeof window !== 'undefined' && query.performer) {
        performer = JSON.parse(query.performer);
      } else {
        const { token } = nextCookie(ctx);
        const headers = { Authorization: token };
        const resp: IResponse<IPerformer> = await performerService.findOne(
          query.username,
          headers
        );
        performer = resp.data;
      }
      if (!performer.isSubscribed) {
        const { NEXT_LOCALE = 'en' } = nextCookie(ctx);
        const t = await getT(NEXT_LOCALE, 'common');
        // dont allow user to view live stream, redirect with message
        const redirectTo = `/model/${performer.username || performer._id}?msg=${encodeURI(t('errStreamRequireSubscribe', { username: performer.username }))}`;
        if (typeof window !== 'undefined') {
          return Router.push(redirectTo);
        }

        ctx.res.writeHead && ctx.res.writeHead(302, { Location: redirectTo });
        ctx.res.end && ctx.res.end();
      }

      return {
        performer
      };
    } catch (e) {
      // const err = await Promise.resolve(e);
      if (typeof window !== 'undefined') {
        return Router.push('/');
      }

      ctx.res.writeHead && ctx.res.writeHead(302, { Location: '/' });
      ctx.res.end && ctx.res.end();
      return {};
    }
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      total: 0,
      members: []
    };
  }

  componentDidMount() {
    this.subscrbierRef = React.createRef();
    const { performer } = this.props;
    if (!performer) {
      Router.push('/');
    }

    Router.events.on('routeChangeStart', this.onbeforeunload);
    window.addEventListener('beforeunload', this.onbeforeunload);

    this.interval = setInterval(this.updatePerformerInfo, 60 * 1000);
    this.initProfilePage();
  }

  componentWillUnmount() {
    this.interval && clearInterval(this.interval);
    window.removeEventListener('beforeunload', this.onbeforeunload);
    Router.events.off('routeChangeStart', this.onbeforeunload);
  }

  onChange({ total, members, conversationId }) {
    const { activeConversation } = this.props;
    if (
      activeConversation?.data?._id
      && activeConversation.data._id === conversationId
    ) {
      this.setState({ total, members });
    }
  }

  onbeforeunload = () => {
    this.leavePublicRoom();
  };

  updatePerformerInfo = async () => {
    try {
      const { performer } = this.props;
      if (!performer) {
        return;
      }

      const {
        performer: { username, streamingStatus: oldStreamingStatus }
      } = this.props;
      const resp = await performerService.findOne(username);
      const { streamingStatus } = resp.data;
      this.poster(streamingStatus);
      if (
        oldStreamingStatus !== streamingStatus
        && streamingStatus === PUBLIC_CHAT
      ) {
        /**
         * Update stream status, broadcast
         */
      }
    } catch (e) {
      const error = await Promise.resolve(e);
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  setStreamRef = (dataFunc) => {
    this.subscriberRef2 = dataFunc;
  };

  modelLeftHandler({ performerId }) {
    const { performer } = this.props;
    if (performerId !== performer._id) {
      return;
    }

    if (this.subscrbierRef.current?.stop) this.subscrbierRef.current.stop();
    else this.subscriberRef2.stop();

    const { t } = this.props.i18n;
    message.info(t('common:modelLeftRoom'));
  }

  initProfilePage() {
    // const {
    //   performer: { streamingStatus }
    // } = this.props;
    // setTimeout(() => {
    //   if (this.subscrbierRef.current?.resetPlaybackVideo) {
    //     this.subscrbierRef.current.resetPlaybackVideo(
    //       this.poster(streamingStatus)
    //     );
    //   } else if (this.subscriberRef2.resetPlaybackVideo) {
    //     this.subscriberRef2.resetPlaybackVideo(
    //       this.poster(streamingStatus)
    //     );
    //   }
    // }, 1000);
    this.joinPeformerPublicRoom();
  }

  poster(status: string) {
    let poster = '';
    switch (status) {
      case 'private':
        poster = DEFAULT_PRIVATE_IMAGE_URL;
        break;
      case 'offline':
        poster = DEFAULT_OFFLINE_IMAGE_URL;
        break;
      case 'public':
        poster = DEFAULT_IMAGE_URL;
        break;
      case 'group':
        poster = DEFAULT_IMAGE_URL;
        break;
      default:
        poster = DEFAULT_OFFLINE_IMAGE_URL;
        break;
    }
    if (this.subscrbierRef.current?.poster) this.subscrbierRef.current.poster(poster);
    else if (this.subscriberRef2.poster) this.subscriberRef2.poster(poster);

    return poster;
  }

  async joinPeformerPublicRoom() {
    const {
      performer,
      loadStreamMessages: dispatchLoadStreamMessages,
      getStreamConversationSuccess: dispatchGetStreamConversationSuccess,
      i18n
    } = this.props;
    const { getSocket } = this.context as ISocketContext;
    const socket = getSocket();
    if (performer) {
      try {
        const resp = await messageService.findPublicConversationPerformer(
          performer._id
        );
        const conversation = resp.data;
        if (conversation && conversation._id) {
          dispatchGetStreamConversationSuccess({ data: conversation });
          dispatchLoadStreamMessages({
            conversationId: conversation._id,
            limit: 25,
            offset: 0,
            type: conversation.type
          });
          socket?.emit('public-stream/join', {
            conversationId: conversation._id
          });
        } else {
          const { t } = i18n;
          throw new Error(t('common:errNoAvailableBroadcast'));
        }
      } catch (e) {
        const error = await Promise.resolve(e);
        message.error(getResponseError(error));
      }
    }
  }

  async subscribe({ performerId }) {
    try {
      const {
        settings: { optionForBroadcast }
      } = this.props;
      const resp = await streamService.joinPublicChat(performerId);
      const { sessionId } = resp.data;
      if (optionForBroadcast === HLS) {
        if (this.subscrbierRef.current?.playHLS) this.subscrbierRef.current?.playHLS(sessionId);
        else if (this.subscriberRef2.playHLS) this.subscriberRef2.playHLS(sessionId);
      }

      if (optionForBroadcast === WEBRTC) {
        if (this.subscrbierRef.current?.play) this.subscrbierRef.current.play(sessionId);
        else if (this.subscriberRef2.play) this.subscriberRef2.play(sessionId);
      }
    } catch (err) {
      const error = await Promise.resolve(err);
      message.error(getResponseError(error));
    }
  }

  leavePublicRoom() {
    const { getSocket } = this.context as ISocketContext;
    const socket = getSocket();
    const {
      activeConversation,
      resetStreamMessage: dispatchResetStreamMessage
    } = this.props;
    dispatchResetStreamMessage();
    if (socket && activeConversation?.data?._id) {
      socket.emit('public-stream/leave', {
        conversationId: activeConversation?.data?._id
      });
    }
  }

  render() {
    const { t } = this.props.i18n;
    const {
      performer, activeConversation, settings
    } = this.props;
    const { members, total } = this.state;
    return (
      <>
        <SeoMetaHead item={performer} />

        <Event
          event={STREAM_EVENT.JOIN_BROADCASTER}
          handler={this.subscribe.bind(this)}
        />
        <Event
          event={STREAM_EVENT.MODEL_LEFT}
          handler={this.modelLeftHandler.bind(this)}
        />
        <Event
          event={STREAM_EVENT.ROOM_INFORMATIOM_CHANGED}
          handler={this.onChange.bind(this)}
        />

        <div className="main-container">
          <div className="page-heading">
            <Avatar src={performer?.avatar || 'no-avatar.png'} />
            {' '}
            <span style={{ textTransform: 'capitalize' }}>{performer?.username}</span>
          </div>
          <Row className="streaming-container">
            <Col md={14} xs={24}>
              <LiveSubscriber
                ref={this.subscrbierRef}
                configs={{
                  isPlayMode: true
                }}
                setStreamRef={this.setStreamRef}
              />
              <Row>
                <Col xs={24} sm={12}>
                  <Tipping
                    performerId={performer._id}
                    conversationId={activeConversation?.data?._id}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Button
                    block
                    type="primary"
                    className="primary"
                    onClick={() => Router.push(
                      {
                        pathname: `/stream/${settings.optionForPrivate === 'webrtc'
                          ? 'webrtc/'
                          : ''
                        }privatechat/[username]`,
                        query: { performer: JSON.stringify(performer) }
                      },
                      `/stream/${settings.optionForPrivate === 'webrtc'
                        ? 'webrtc/'
                        : ''
                      }privatechat/${performer.username}`
                    )}
                  >
                    {t('common:privateCall')}
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col md={10} xs={24}>
              <ChatBox
                {...this.props}
                members={members}
                totalParticipant={total}
              />
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

LivePage.contextType = SocketContext;

const mapStateToProps = (state) => ({
  ...state.streaming,
  ...state.performer.performerDetails,
  activeConversation: state.streamMessage.activeConversation
});
const mapDispatch = {
  loadStreamMessages,
  getStreamConversationSuccess,
  resetStreamMessage,
  resetAllStreamMessage
};
export default connect(mapStateToProps, mapDispatch)(
  withTranslation(LivePage)
);

import ChatBox from '@components/stream-chat/chat-box';
import PrivateChatContainer from '@components/streaming/private-streaming-container';
import { getResponseError } from '@lib/utils';
import {
  getStreamConversationSuccess,
  resetStreamMessage
} from '@redux/stream-chat/actions';
import { updateBalance } from '@redux/user/actions';
import {
  Col, List,
  message, Row
} from 'antd';
import dynamic from 'next/dynamic';
import Header from 'next/head';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import withTranslation from 'next-translate/withTranslation';
import React, {
  ContextType,
  PureComponent
} from 'react';
import { connect } from 'react-redux';
import { IPerformer, IUser } from 'src/interfaces';
import { paymentWalletService, performerService, streamService } from 'src/services';
import { Event, SocketContext } from 'src/socket';
import { ISocketContext } from 'src/socket/SocketContext';

const CallTime = dynamic(() => import('@components/streaming/call-time'), {
  ssr: false
});

// eslint-disable-next-line no-shadow
enum EVENT {
  JOINED_THE_ROOM = 'JOINED_THE_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  LEAVE_ROOM = 'LEAVE_ROOM',
  STREAM_INFORMATION_CHANGED = 'private-stream/streamInformationChanged',
  MODEL_JOIN_ROOM = 'MODEL_JOIN_ROOM',
  SEND_PAID_TOKEN = 'SEND_PAID_TOKEN'
}

function ListItem({ description, title }: any) {
  return (
    <List.Item>
      <Row style={{ width: '100%' }}>
        <Col className="light-text" sm={{ span: 6 }} xs={{ span: 12 }}>
          {title}
        </Col>
        <Col style={{ fontWeight: 'bold' }} sm={{ span: 18 }} xs={{ span: 12 }}>
          {description}
        </Col>
      </Row>
    </List.Item>
  );
}

type IProps = {
  username: string;
  performer: IPerformer;
  user: IUser;
  getStreamConversationSuccess: Function;
  activeConversation: any;
  resetStreamMessage: Function;
  updateBalance: Function;
  i18n: any;
}

interface IStates {
  roomJoined: boolean;
  total: number;
  members: IUser[];
  paidToken: number;
  started: boolean;
}

class UserPrivateChat extends PureComponent<IProps, IStates> {
  static authenticate = true;

  // eslint-disable-next-line react/static-property-placement
  context!: ContextType<typeof SocketContext>;

  private streamRef: any;

  private streamRef2: any;

  private interval: NodeJS.Timeout;

  static async getInitialProps(ctx) {
    try {
      const { query } = ctx;
      if (typeof window !== 'undefined' && query.performer) {
        return {
          performer: JSON.parse(query.performer)
        };
      }

      const { token } = nextCookie(ctx);
      const headers = { Authorization: token };
      const resp = await performerService.findOne(query.username, headers);
      const performer: IPerformer = resp.data;
      if (!performer.isSubscribed) {
        throw new Error();
      }
      return {
        performer
      };
    } catch (e) {
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
      roomJoined: false,
      total: 0,
      paidToken: 0,
      members: [],
      started: false
    };
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.onbeforeunload);
    Router.events.on('routeChangeStart', this.onbeforeunload);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onbeforeunload);
    Router.events.off('routeChangeStart', this.onbeforeunload);
  }

  handler({ total, members, conversationId }) {
    const { activeConversation } = this.props;
    if (activeConversation?.data?._id && activeConversation.data._id === conversationId) {
      this.setState({ total, members });
    }
  }

  handleCharge = (conversationId) => {
    this.sendPrivateChat(conversationId);
  };

  async handleModelJoinRoom({ conversationId }) {
    message.success('Model joined the room!');
    const {
      activeConversation
    } = this.props;
    if (activeConversation?.data?._id && activeConversation.data._id === conversationId) {
      if (this.interval) clearInterval(this.interval);
      // start stream
      this.handleCharge(conversationId);
      // const socket = this.context;
      this.interval = setInterval(this.handleCharge, 60 * 1000, conversationId);
      this.setState({ started: true });
    }
  }

  onbeforeunload = () => {
    this.leaveSession();
  };

  setStreamRef = (dataFunc) => {
    this.streamRef2 = dataFunc;
  };

  async sendPrivateChat(conversationId: string) {
    const { t } = this.props.i18n;
    try {
      const { performer, updateBalance: dispatchUpdateBalance } = this.props;
      const { paidToken } = this.state;
      await paymentWalletService.sendPrivateChat(conversationId);
      const newState = { paidToken: paidToken + performer.privateChatPrice };
      this.setState(newState);
      dispatchUpdateBalance((performer.privateChatPrice * (-1)));
    } catch (err) {
      message.error(t('common:errOutOfWallet'));
      this.stopBroadcast();
      clearInterval(this.interval);
      setTimeout(() => {
        window.location.href = '/wallet-package';
      }, 1000);
    }
  }

  stopBroadcast() {
    if (this.streamRef?.stop) this.streamRef.stop();
    else this.streamRef2.stop();

    setTimeout(() => {
      window.location.href = '/';
    }, 10 * 1000);
  }

  roomJoinedHandler({ total, members, conversationId }) {
    const { activeConversation } = this.props;
    if (activeConversation?.data?._id && conversationId === activeConversation.data._id) {
      this.setState({
        total,
        members,
        roomJoined: true
      });
    }
  }

  async sendRequest() {
    const { t } = this.props.i18n;
    const {
      performer,
      getStreamConversationSuccess: dispatchGetStreamConversationSuccess
    } = this.props;
    try {
      const resp = await streamService.requestPrivateChat(performer._id);
      const { sessionId, conversation } = resp.data;
      const { getSocket } = this.context as ISocketContext;
      const socket = getSocket();
      message.success(t('common:privateRequestSent'));
      if (this.streamRef?.start) this.streamRef.start(sessionId, conversation._id);
      else this.streamRef2.start(sessionId, conversation._id);
      socket.emit(EVENT.JOIN_ROOM, {
        conversationId: conversation._id
      });
      dispatchGetStreamConversationSuccess({
        data: conversation
      });
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    }
  }

  leaveSession() {
    const {
      activeConversation,
      resetStreamMessage: dispatchResetStreamMessage
    } = this.props;
    dispatchResetStreamMessage();
    const { getSocket } = this.context as ISocketContext;
    const socket = getSocket();
    if (socket && activeConversation && activeConversation.data) {
      socket.emit(EVENT.LEAVE_ROOM, {
        conversationId: activeConversation.data._id
      });
    }

    if (this.interval) {
      clearInterval(this.interval);
    }

    this.setState({
      roomJoined: false,
      paidToken: 0,
      total: 0,
      members: [],
      started: false
    });
  }

  render() {
    const { t } = this.props.i18n;
    const { performer } = this.props;
    const {
      total, members, roomJoined, started, paidToken
    } = this.state;

    const dataSource = [
      {
        title: t('common:callTime'),
        description: <CallTime start={started} />
      },
      {
        title: t('common:labelStatus'),
        description: roomJoined ? t('common:live') : ''
      },
      {
        title: t('common:paid'),
        description: `${paidToken} ${t('common:wallets')}`
      },
      {
        title: 'Amount per minute',
        description: `${performer.privateChatPrice} ${t('common:wallets')}` || 'N/A'
      }
    ];

    return (
      <>
        <Header>
          <title>{t('common:privateChat')}</title>
        </Header>
        <Event
          event={EVENT.STREAM_INFORMATION_CHANGED}
          handler={this.handler.bind(this)}
        />
        <Event
          event={EVENT.JOINED_THE_ROOM}
          handler={this.roomJoinedHandler.bind(this)}
        />
        <Event
          event={EVENT.MODEL_JOIN_ROOM}
          handler={this.handleModelJoinRoom.bind(this)}
        />
        <div className="container">
          <Row gutter={{ sm: 10, xs: 0 }}>
            <Col md={12} xs={24}>
              <PrivateChatContainer
                // eslint-disable-next-line no-return-assign
                ref={(ref) => (this.streamRef = ref)}
                configs={{
                  localVideoId: 'private-publisher'
                }}
                onClick={this.sendRequest.bind(this)}
                setStreamRef={this.setStreamRef}
              />
              <List
                dataSource={dataSource}
                renderItem={(item) => (
                  <ListItem
                    description={item.description}
                    title={item.title}
                  />
                )}
              />
            </Col>
            <Col xs={24} md={12}>
              <ChatBox
                {...this.props}
                totalParticipant={total}
                members={members}
              />
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

UserPrivateChat.contextType = SocketContext;

const mapStateToProps = (state) => ({
  user: state.user.current,
  activeConversation: state.streamMessage.activeConversation
});
const mapDispatchs = {
  getStreamConversationSuccess,
  resetStreamMessage,
  updateBalance
};
export default connect(
  mapStateToProps,
  mapDispatchs
)(withTranslation(UserPrivateChat));

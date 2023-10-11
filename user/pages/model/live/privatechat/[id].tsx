import PageTitle from '@components/common/page-title';
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
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { ContextType, PureComponent } from 'react';
import { connect } from 'react-redux';
import { RECEIVED_PAID_TOKEN_EVENT } from 'src/constants';
import { IUser } from 'src/interfaces';
import { accessPrivateRequest } from 'src/redux/streaming/actions';
import { streamService } from 'src/services';
import { Event, SocketContext } from 'src/socket';
import { ISocketContext } from 'src/socket/SocketContext';

const CallTime = dynamic(() => import('@components/streaming/call-time'), {
  ssr: false
});

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

// eslint-disable-next-line no-shadow
enum STREAM_EVENT {
  JOINED_THE_ROOM = 'JOINED_THE_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  LEAVE_ROOM = 'LEAVE_ROOM',
  STREAM_INFORMATION_CHANGED = 'private-stream/streamInformationChanged'
}

type IProps = {
  query: any;
  getStreamConversationSuccess: Function;
  activeConversation: any;
  resetStreamMessage: Function;
  accessPrivateRequest: Function;
  updateBalance: Function;
  i18n: any;
}

interface IStates {
  roomJoined: boolean;
  total: number;
  members: IUser[];
  started: boolean;
  receivedToken: number;
}

class ModelPrivateChat extends PureComponent<IProps, IStates> {
  static authenticate = true;

  static onlyPerformer = true;

  // eslint-disable-next-line react/static-property-placement
  context!: ContextType<typeof SocketContext>;

  private interval: NodeJS.Timeout;

  private streamRef: any;

  private streamRef2: any;

  static async getInitialProps(ctx) {
    return {
      query: ctx.query
    };
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      roomJoined: false,
      started: false,
      receivedToken: 0,
      total: 0,
      members: []
    };
  }

  componentDidMount() {
    const { query, accessPrivateRequest: access } = this.props;
    window.addEventListener('beforeunload', this.onbeforeunload);
    Router.events.on('routeChangeStart', this.onbeforeunload);
    access(query.id);
  }

  componentDidUpdate(prevProps: IProps) {
    const { query, accessPrivateRequest: access } = this.props;
    if (prevProps.query.id !== query.id) {
      access(query.id);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onbeforeunload);
    Router.events.off('routeChangeStart', this.onbeforeunload);
  }

  handler({ total, members }) {
    this.setState({ total, members });
  }

  handleReceivedPaidToken({ token, conversationId }) {
    const { activeConversation, updateBalance: dispatchUpdateBalance } = this.props;
    const { receivedToken } = this.state;
    if (
      activeConversation?.data?._id
      && conversationId === activeConversation.data._id
    ) {
      this.setState({ receivedToken: receivedToken + token });
      dispatchUpdateBalance(token);
    }
  }

  onbeforeunload = () => {
    this.leaveSession();
  };

  setStreamRef = (dataFunc) => {
    this.streamRef2 = dataFunc;
  };

  roomJoinedHandler({ total, members, conversationId }) {
    const { activeConversation } = this.props;
    if (
      activeConversation?.data?._id
      && conversationId === activeConversation.data._id
    ) {
      this.setState({
        total,
        members,
        roomJoined: true,
        started: true
      });
    }
  }

  async acceptRequest() {
    const {
      query,
      getStreamConversationSuccess: dispatchGetStreamConversationSuccess
    } = this.props;
    if (!query.id) return;

    try {
      const resp = await streamService.acceptPrivateChat(query.id);
      if (resp && resp.data) {
        const { getSocket } = this.context as ISocketContext;
        const socket = getSocket();
        const { sessionId, conversation } = resp.data;
        socket?.emit(STREAM_EVENT.JOIN_ROOM, {
          conversationId: conversation._id
        });
        if (this.streamRef?.start) {
          this.streamRef.start(sessionId, conversation._id);
        } else {
          this.streamRef2.start(sessionId, conversation._id);
        }
        dispatchGetStreamConversationSuccess({
          data: conversation
        });
      }
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
    const { getSocket } = this.context as ISocketContext;
    const socket = getSocket();
    if (socket && activeConversation?.data?._id) {
      socket.emit(STREAM_EVENT.LEAVE_ROOM, {
        conversationId: activeConversation.data._id
      });
      dispatchResetStreamMessage();
    }

    this.interval && clearInterval(this.interval);
    this.setState({
      roomJoined: false,
      started: false,
      receivedToken: 0,
      total: 0,
      members: []
    });
  }

  render() {
    const {
      total, members, receivedToken, started, roomJoined
    } = this.state;
    const { t } = this.props.i18n;
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
        title: t('common:receivedWallets'),
        description: t('common:receivedWalletsDesc', { num: receivedToken })
      }
    ];

    return (
      <>
        <PageTitle title={t('common:privateChat')} />

        <Event
          event={STREAM_EVENT.STREAM_INFORMATION_CHANGED}
          handler={this.handler.bind(this)}
        />
        <Event
          event={STREAM_EVENT.JOINED_THE_ROOM}
          handler={this.roomJoinedHandler.bind(this)}
          handleRouterChange
        />
        <Event
          event={RECEIVED_PAID_TOKEN_EVENT}
          handler={this.handleReceivedPaidToken.bind(this)}
        />

        <div className="container">
          <Row gutter={{ sm: 10, xs: 0 }}>
            <Col md={12} xs={24}>
              <PrivateChatContainer
                // eslint-disable-next-line no-return-assign
                ref={(ref) => (this.streamRef = ref)}
                sessionId=""
                configs={{
                  localVideoId: 'private-publisher'
                }}
                onClick={this.acceptRequest.bind(this)}
                setStreamRef={this.setStreamRef}
              />
              <List
                dataSource={dataSource}
                renderItem={(item) => (
                  <ListItem description={item.description} title={item.title} />
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

ModelPrivateChat.contextType = SocketContext;

const mapStateToProps = (state) => ({
  activeConversation: state.streamMessage.activeConversation
});

const mapDispatchs = {
  accessPrivateRequest,
  getStreamConversationSuccess,
  resetStreamMessage,
  updateBalance
};

export default connect(mapStateToProps, mapDispatchs)(
  withTranslation(ModelPrivateChat)
);

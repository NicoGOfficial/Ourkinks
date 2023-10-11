import { ArrowLeftOutlined } from '@ant-design/icons';
import { SubscriptionPerformerBlock } from '@components/performer';
import {
  IConversation, ISettings,
  IUser
} from '@interfaces/index';
import { deactiveConversation, loadMessages, loadMoreMessages } from '@redux/message/actions';
import {
  Avatar, Button,
  message as toasty,
  Spin
} from 'antd';
import moment from 'moment';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { createRef, PureComponent } from 'react';
import { connect } from 'react-redux';
import { TickIcon } from 'src/icons';
import { paymentService, paymentWalletService } from 'src/services';

import Compose from './Compose';
import Message from './Message';
import style from './MessageList.module.less';

type IProps = {
  sendMessage: any;
  deactiveConversation: Function;
  loadMoreMessages: Function;
  message: any;
  conversation: IConversation;
  currentUser: IUser;
  settings: ISettings;
  i18n: any;
  loadMessages: Function;
}

class MessageList extends PureComponent<IProps> {
  messagesRef: any;

  state = {
    offset: 0,
    submiting: false
  };

  async componentDidMount() {
    if (!this.messagesRef) this.messagesRef = createRef();
  }

  async componentDidUpdate(prevProps) {
    const { conversation, message, sendMessage } = this.props;
    if (prevProps.conversation && prevProps.conversation._id !== conversation._id) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ offset: 0 });
    }
    if ((prevProps.message.total === 0 && message.total !== 0) || (prevProps.message.total === message.total)) {
      if (prevProps.sendMessage?.data?._id !== sendMessage?.data?._id) {
        this.scrollToBottom(true);
        return;
      }
      this.scrollToBottom(false);
    }
  }

  handleSubscribe = async (paymentGateway = 'ccbill', type = 'monthly') => {
    const { t } = this.props.i18n;
    const { conversation } = this.props;
    try {
      await this.setState({ submiting: true });
      const resp = await (
        await paymentService.subscribe({ type, performerId: conversation?.recipientInfo?._id, paymentGateway })
      ).data;
      toasty.info(t('common:paymentRedirecting'), 30);
      if (['ccbill', 'verotel'].includes(paymentGateway)) window.location.href = resp.paymentUrl;
    } catch (e) {
      const err = await e;
      toasty.error(err?.message || t('common:errCommon'));
      this.setState({ submiting: false });
    }
  };

  async handleScroll(conversation, event) {
    const { message, loadMoreMessages: handleLoadMore } = this.props;
    const { offset } = this.state;
    const { fetching, items, total } = message;
    const canloadmore = total > items.length;
    const ele = event.target;
    if (!canloadmore) return;
    if (ele.scrollTop === 0 && conversation._id && !fetching && canloadmore) {
      this.setState(
        { offset: offset + 1 },
        () => {
          const { offset: newOffset } = this.state;
          handleLoadMore({ conversationId: conversation._id, limit: 25, offset: newOffset * 25 });
        }
      );
    }
  }

  async handleBuyMessage(data) {
    const { t } = this.props.i18n;
    const { loadMessages: handleLoadMessage } = this.props;
    if (data.isbought) {
      toasty.error(t('common:youBoughtThisMessage'));
      return;
    }

    if (!window.confirm(t('common:areYouSureBuyThisMessageWithPriceTokens', { price: data.price }))) return;

    try {
      const resp = await paymentWalletService.userBuysMessagesById(data._id);
      if (resp.data) {
        toasty.success(t('common:youBoughtPrivateMessContentWithPriceToken', { price: data.price }));
        const { offset: newOffset } = this.state;
        handleLoadMessage({ conversationId: data.conversationId, limit: 25, offset: newOffset * 25 });
      }
    } catch (e) {
      const err = await e;
      toasty.error(err?.message || t('common:errCommon'));
    }
  }

  renderMessages = () => {
    const { message, currentUser, conversation } = this.props;
    const recipientInfo = conversation && conversation.recipientInfo;
    const messages = message.items;
    let i = 0;
    const messageCount = messages.length;
    const tempMessages = [];
    while (i < messageCount) {
      const previous = messages[i - 1];
      const current = messages[i];
      const next = messages[i + 1];
      const isMine = current.senderId === currentUser._id;
      const currentMoment = moment(current.createdAt);
      let prevBySameAuthor = false;
      let nextBySameAuthor = false;
      let startsSequence = true;
      let endsSequence = true;
      let showTimestamp = true;

      if (previous) {
        const previousMoment = moment(previous.createdAt);
        const previousDuration = moment.duration(
          currentMoment.diff(previousMoment)
        );
        prevBySameAuthor = previous.senderId === current.senderId;

        if (prevBySameAuthor && previousDuration.as('hours') < 1) {
          startsSequence = false;
        }

        if (previousDuration.as('hours') < 1) {
          showTimestamp = false;
        }
      }

      if (next) {
        const nextMoment = moment(next.createdAt);
        const nextDuration = moment.duration(nextMoment.diff(currentMoment));
        nextBySameAuthor = next.senderId === current.senderId;

        if (nextBySameAuthor && nextDuration.as('hours') < 1) {
          endsSequence = false;
        }
      }
      if (current._id) {
        tempMessages.push(
          <Message
            key={i}
            isMine={isMine}
            startsSequence={startsSequence}
            endsSequence={endsSequence}
            showTimestamp={showTimestamp}
            data={current}
            recipient={recipientInfo}
            currentUser={currentUser}
            handleBuyMessage={(data) => this.handleBuyMessage(data)}
          />
        );
      }
      // Proceed to the next message.
      i += 1;
    }
    return tempMessages;
  };

  scrollToBottom(toBot = true) {
    const { message: { fetching } } = this.props;
    const { offset } = this.state;
    if (!fetching && this.messagesRef && this.messagesRef.current) {
      const ele = this.messagesRef.current;
      window.setTimeout(() => {
        ele.scrollTop = toBot ? ele.scrollHeight : (ele.scrollHeight / (offset + 1) - 150);
      }, 300);
    }
  }

  render() {
    const { t } = this.props.i18n;
    const {
      conversation,
      message,
      settings,
      deactiveConversation: handleDeactiveConversation
    } = this.props;

    const { submiting } = this.state;
    const { fetching } = message;
    return (
      <div className={style['message-list']} ref={this.messagesRef} onScroll={this.handleScroll.bind(this, conversation)}>
        {conversation && conversation._id
          ? (
            <div className={style['message-list-container']}>
              <div className={style['mess-recipient']}>
                <span
                  className="profile"
                  aria-hidden
                  onClick={() => conversation?.recipientInfo?.isPerformer
                    && Router.push({
                      pathname: '/model/[username]',
                      query: { username: conversation?.recipientInfo?.username || conversation?.recipientInfo?._id }
                    }, `/model/${conversation?.recipientInfo?.username || conversation?.recipientInfo?._id}`)}
                >
                  <Avatar alt="avatar" src={conversation?.recipientInfo?.avatar || '/no-avatar.png'} />
                  {' '}
                  {conversation?.recipientInfo?.name || conversation?.recipientInfo?.username || 'N/A'}
                  {' '}
                  {conversation?.recipientInfo?.verifiedAccount && <TickIcon />}
                </span>
                <Button onClick={() => handleDeactiveConversation()} className="close-btn">
                  <ArrowLeftOutlined />
                  {' '}
                </Button>
              </div>
              {fetching && <div className="text-center"><Spin /></div>}
              {conversation?.isSubscribed && this.renderMessages()}
              {!conversation?.isSubscribed && (
                <SubscriptionPerformerBlock settings={settings} onSelect={this.handleSubscribe} disabled={submiting || (!settings?.ccbillEnabled && !settings?.verotelEnabled)} performer={conversation?.recipientInfo} />
              )}
              {conversation.isBlocked && <div className={style['sub-text']}>{t('common:modelBlocked')}</div>}
            </div>
          )
          : <div className={style['sub-text']}>{t('common:errSubModelSendMsg')}</div>}
        <Compose disabled={!conversation?._id || !conversation?.isSubscribed || conversation?.isBlocked} conversation={conversation} />
      </div>
    );
  }
}

const mapStates = (state: any) => {
  const { conversationMap, sendMessage } = state.message;
  const { activeConversation } = state.conversation;
  const messages = conversationMap[activeConversation._id]
    ? conversationMap[activeConversation._id].items || []
    : [];
  const totalMessages = conversationMap[activeConversation._id]
    ? conversationMap[activeConversation._id].total || 0
    : 0;
  const fetching = conversationMap[activeConversation._id]
    ? conversationMap[activeConversation._id].fetching || false : false;
  return {
    sendMessage,
    message: {
      items: messages,
      total: totalMessages,
      fetching
    },
    conversation: activeConversation,
    currentUser: state.user.current,
    settings: state.settings
  };
};

const mapDispatch = { loadMoreMessages, deactiveConversation, loadMessages };
export default connect(mapStates, mapDispatch)(withTranslation(MessageList));

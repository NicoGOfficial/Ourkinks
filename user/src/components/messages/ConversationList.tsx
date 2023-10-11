import {
  getConversationDetail, getConversations, receiveMessageSuccess, resetConversationState,
  searchConversations, setActiveConversation
} from '@redux/message/actions';
import { Spin } from 'antd';
import { debounce } from 'lodash';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { MessageIcon } from 'src/icons';
import { IUser } from 'src/interfaces';
import { Event } from 'src/socket';

import style from './ConversationList.module.less';
import ConversationListItem from './ConversationListItem';
import ConversationSearch from './ConversationSearch';

type IProps = {
  resetConversationState: Function;
  searchConversations: Function;
  getConversations: Function;
  setActiveConversation: Function;
  getConversationDetail: Function;
  receiveMessageSuccess: Function;
  conversation: {
    list: {
      requesting: boolean;
      error: any;
      data: any[];
      total: number;
      success: boolean;
    };
    mapping: Record<string, any>;
    activeConversation: Record<string, any>;
  };
  toSource: string;
  toId: string;
  user: IUser;
  i18n: any;
}
class ConversationList extends PureComponent<IProps> {
  state = {
    conversationPage: 0,
    keyword: ''
  };

  async componentDidMount() {
    const {
      getConversations: getConversationsHandler,
      setActiveConversation: setActiveConversationHandler,
      toSource,
      toId,
      user
    } = this.props;
    const { conversationPage, keyword } = this.state;
    getConversationsHandler({
      limit: 25, offset: conversationPage * 25, type: 'private', keyword
    });
    if (toSource && toId) {
      setTimeout(() => {
        setActiveConversationHandler({
          source: toSource,
          sourceId: toId,
          recipientId: user._id
        });
      }, 1000);
    }
  }

  componentWillUnmount() {
    const { resetConversationState: resetStateHandler } = this.props;
    resetStateHandler();
  }

  onMessage = (message: { conversationId: string | number; }) => {
    if (!message) {
      return;
    }
    const {
      conversation,
      getConversationDetail: getConversationDetailHandler,
      receiveMessageSuccess: receiveMessageSuccessHandler
    } = this.props;
    const { mapping } = conversation;
    if (!mapping[message.conversationId]) {
      getConversationDetailHandler({
        id: message.conversationId
      });
    }
    receiveMessageSuccessHandler(message);
  };

  onSearchConversation = debounce(async (e) => {
    const { value } = e.target;
    const { searchConversations: getConversationsHandler } = this.props;
    await this.setState({ keyword: value, conversationPage: 0 });
    if (value) {
      return getConversationsHandler({
        keyword: value, limit: 25, offset: 0, type: 'private'
      });
    }
    return getConversationsHandler({
      limit: 25, offset: 0, type: 'private', keyword: value
    });
  }, 500);

  handleScroll = async (event: { target: any; }) => {
    const { conversation, getConversations: getConversationsHandler } = this.props;
    const { requesting, data, total } = conversation.list;
    const { conversationPage, keyword } = this.state;
    const canloadmore = total > data.length;
    const ele = event.target;
    if (!canloadmore) return;
    if (ele.scrollHeight - ele.scrollTop === ele.clientHeight && !requesting && canloadmore) {
      this.setState({ conversationPage: conversationPage + 1 }, () => {
        const { conversationPage: newPage } = this.state;
        getConversationsHandler({
          keyword, limit: 25, offset: newPage * 25, type: 'private'
        });
      });
    }
  };

  setActive = (conversationId: any) => {
    const {
      setActiveConversation: setActiveConversationHandler,
      user
    } = this.props;
    setActiveConversationHandler({ conversationId, recipientId: user._id });
  };

  render() {
    const { t } = this.props.i18n;
    const { conversation } = this.props;
    const { data: conversations, requesting } = conversation.list;
    const { mapping, activeConversation = {} } = conversation;
    return (
      <div className={style['conversation-list']} onScroll={this.handleScroll.bind(this)}>
        <Event event="message_created" handler={this.onMessage} />
        <h3 className="user-bl" aria-hidden onClick={() => Router.back()}>
          <MessageIcon />
          {' '}
          {t('common:conversations')}
        </h3>
        <ConversationSearch
          onSearch={(e) => {
            e.persist();
            this.onSearchConversation(e);
          }}
        />
        <div className={style['c-list-item']}>
          {conversations.length > 0
            && conversations.map((conversationId) => (
              <ConversationListItem
                key={conversationId}
                data={mapping[conversationId]}
                setActive={this.setActive}
                selected={activeConversation._id === conversationId}
              />
            ))}
          {requesting && (
            <div className="text-center">
              <Spin />
            </div>
          )}
          {!requesting && !conversations.length && (
            <p className="alert-text">{t('common:noConversations')}</p>
          )}
        </div>
      </div>
    );
  }
}

const mapStates = (state: any) => ({
  conversation: { ...state.conversation },
  message: { ...state.message },
  user: { ...state.user.current }
});

const mapDispatch = {
  resetConversationState,
  searchConversations,
  getConversations,
  setActiveConversation,
  getConversationDetail,
  receiveMessageSuccess
};
export default connect(mapStates, mapDispatch)(withTranslation(ConversationList));

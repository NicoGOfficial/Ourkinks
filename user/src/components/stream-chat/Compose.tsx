import {
  SendOutlined,
  SmileOutlined
} from '@ant-design/icons';
import { sendStreamMessage } from '@redux/stream-chat/actions';
import { Input, message } from 'antd';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import style from './Compose.module.less';
import Emotions from './emotions';

type IProps = {
  loggedIn: boolean;
  sendStreamMessage: Function;
  sendMessageStatus: any;
  conversation: any;
}

class Compose extends PureComponent<IProps> {
  uploadRef: any;

  _input: any;

  constructor(props) {
    super(props);
    this.uploadRef = React.createRef();
  }

  state = { text: '' };

  componentDidMount() {
    if (!this.uploadRef) this.uploadRef = React.createRef();
    if (!this._input) this._input = React.createRef();
  }

  componentDidUpdate(previousProps: IProps) {
    const { sendMessageStatus } = this.props;
    if (sendMessageStatus.success && previousProps.sendMessageStatus.success !== sendMessageStatus.success) {
      this.updateMessage('');
      this._input && this._input.focus();
    }
  }

  onKeyDown = (evt) => {
    if (evt.keyCode === 13) {
      this.send();
    }
  };

  onChange = (evt) => {
    this.setState({ text: evt.target.value });
  };

  onEmojiClick = (emojiObject) => {
    const { text } = this.state;
    this.updateMessage(text + emojiObject.emoji);
  };

  updateMessage(text: string) {
    this.setState({ text });
  }

  send() {
    const { loggedIn, sendStreamMessage: _sendStreamMessage, conversation } = this.props;
    const { text } = this.state;
    if (!loggedIn) {
      message.error('Please login');
      return;
    }
    if (!text) {
      return;
    }

    _sendStreamMessage({
      conversationId: conversation._id,
      data: {
        text
      },
      type: conversation.type
    });
  }

  render() {
    const { loggedIn } = this.props;
    const { text } = this.state;
    const { sendMessageStatus: status } = this.props;
    if (!this.uploadRef) this.uploadRef = React.createRef();
    if (!this._input) this._input = React.createRef();
    return (
      <div className={style.compose}>
        <Input
          value={text}
          className={style['compose-input']}
          placeholder="Enter message here."
          onKeyDown={this.onKeyDown}
          onChange={this.onChange}
          disabled={!loggedIn || status.sending}
          autoFocus
          // eslint-disable-next-line no-return-assign
          ref={(ref) => (this._input = ref)}
        />
        <div className={style['grp-icons']}>
          <div className={style['grp-emotions']}>
            <SmileOutlined className={style['send-emotion-btn']} />
            <Emotions onEmojiClick={this.onEmojiClick.bind(this)} />
          </div>
          <SendOutlined onClick={this.send.bind(this)} className={style['grp-send-btn']} />
        </div>
      </div>
    );
  }
}

const mapStates = (state: any) => ({
  user: state.user.current,
  performer: state.performer.current,
  sendMessageStatus: state.streamMessage.sendMessage,
  loggedIn: state.auth.loggedIn
});

const mapDispatch = { sendStreamMessage };
export default connect(mapStates, mapDispatch)(Compose);

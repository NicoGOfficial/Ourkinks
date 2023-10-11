import { SendOutlined, SmileOutlined } from '@ant-design/icons';
import { ImageMessageUpload } from '@components/messages/uploadPhoto';
import { sendMessage, sentFileSuccess } from '@redux/message/actions';
import { authService, messageService } from '@services/index';
import {
  Input, InputNumber, Popover, Tooltip
} from 'antd';
import { createRef, PureComponent } from 'react';
import { connect } from 'react-redux';

import style from './Compose.module.less';
import { Emotions } from './emotions';

type IProps = {
  sendMessage: Function;
  sentFileSuccess: Function;
  sendMessageStatus: any;
  conversation: any;
  currentUser: any;
  disabled?: boolean;
}

class Compose extends PureComponent<IProps> {
  _input: any;

  state = {
    text: '',
    price: 0
  };

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = { disabled: false };

  componentDidMount() {
    if (!this._input) this._input = createRef();
  }

  componentDidUpdate(previousProps) {
    const { sendMessageStatus } = this.props;
    if (previousProps.sendMessageStatus.success !== sendMessageStatus.success) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ text: '' });
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

  onEmojiClick = (emoji) => {
    const { disabled } = this.props;
    if (disabled) return;
    const { text } = this.state;
    this.setState({ text: `${`${text} ${emoji}`} ` });
  };

  onPhotoUploaded = (data: any) => {
    if (!data || !data.response) {
      return;
    }
    const { sentFileSuccess: handleSentFile } = this.props;
    const imageUrl = (data.response.data && data.response.data.imageUrl) || data.base64;
    handleSentFile({ ...data.response.data, ...{ imageUrl } });
  };

  send() {
    const { price, text } = this.state;
    const { conversation, sendMessage: handleSend } = this.props;
    if (!text) return;
    handleSend({
      conversationId: conversation._id,
      data: {
        price,
        text
      }
    });
  }

  render() {
    const { text, price } = this.state;
    const {
      sendMessageStatus: status, conversation, currentUser, disabled
    } = this.props;
    const uploadHeaders = {
      authorization: authService.getToken()
    };

    if (!this._input) this._input = createRef();
    return (
      <div className={style.compose}>
        {currentUser.isPerformer && (
          <Tooltip title="Price per message">
            <InputNumber
              prefix="$"
              className={style['inp-price']}
              onChange={(val) => this.setState({ price: val })}
              disabled={disabled || status.sending || !conversation._id}
              placeholder="0"
              min={0}
              controls={false}
            />
          </Tooltip>
        )}
        <Input
          value={text}
          className={style['compose-input']}
          allowClear
          placeholder="Write your message..."
          onKeyDown={this.onKeyDown}
          onChange={this.onChange}
          disabled={disabled || status.sending || !conversation._id}
          ref={(c) => { this._input = c; }}
        />
        <div className={style['grp-icons']}>
          <Popover content={<Emotions onEmojiClick={this.onEmojiClick.bind(this)} />} trigger="click">
            <div className="grp-emotions">
              <SmileOutlined />
            </div>
          </Popover>
        </div>
        <div className={style['grp-icons']}>
          <div className={style['grp-file-icon']}>
            <ImageMessageUpload
              disabled={disabled}
              headers={uploadHeaders}
              uploadUrl={messageService.getMessageUploadUrl()}
              onUploaded={this.onPhotoUploaded}
              options={{ fieldName: 'message-photo' }}
              messageData={{
                text: 'sent a photo',
                conversationId: conversation && conversation._id,
                recipientId: conversation && conversation.recipientInfo && conversation.recipientInfo._id,
                recipientType: currentUser && currentUser.isPerformer ? 'user' : 'performer',
                price
              }}
            />
          </div>
        </div>
        <div className="grp-icons" style={{ paddingRight: 0 }}>
          <div aria-hidden className={style['grp-send']} onClick={this.send.bind(this)}>
            <SendOutlined />
          </div>
        </div>
      </div>
    );
  }
}

const mapStates = (state: any) => ({
  sendMessageStatus: state.message.sendMessage,
  currentUser: state.user.current
});

const mapDispatch = { sendMessage, sentFileSuccess };
export default connect(mapStates, mapDispatch)(Compose);

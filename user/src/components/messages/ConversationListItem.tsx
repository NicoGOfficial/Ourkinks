import { Badge } from 'antd';
import { useState } from 'react';
import { TickIcon } from 'src/icons';
import { Event } from 'src/socket';

import style from './ConversationListItem.module.less';

type IProps = {
  data: any;
  setActive: Function;
  selected: boolean;
}

export default function ConversationListItem(props: IProps) {
  const { data, setActive, selected } = props;
  const {
    recipientInfo, lastMessage, _id, totalNotSeenMessages = 0
  } = data;
  const className = selected
    ? `${style['conversation-list-item']} ${style.active}`
    : `${style['conversation-list-item']}`;

  const [online, setOnline] = useState(recipientInfo?.isOnline || false);

  const handleOnlineOffline = (resp) => {
    if (resp.id !== recipientInfo?._id) return;
    setOnline(resp.online);
  };

  return (
    <div
      aria-hidden
      className={className}
      onClick={() => setActive(_id)}
    >
      <Event event="online" handler={handleOnlineOffline} />
      <div className={style['conversation-left-corner']}>
        <img className={style['conversation-photo']} src={recipientInfo?.avatar || '/no-avatar.png'} alt="conversation" />
        <span className={online ? 'online' : ''}>
          <span className="active" />
        </span>
      </div>
      <div className="conversation-info">
        <h1 className={style['conversation-title']}>
          {recipientInfo?.name || recipientInfo?.username || 'N/A'}
          {' '}
          {recipientInfo?.verifiedAccount && <TickIcon />}
        </h1>
        <p className="conversation-snippet">{lastMessage}</p>
      </div>
      <Badge
        className="notification-badge"
        count={totalNotSeenMessages}
        overflowCount={9}
      />
    </div>
  );
}

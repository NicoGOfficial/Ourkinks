import * as React from 'react';
import { IUser } from 'src/interfaces';

import style from './streaming-chat-view.module.less';

interface Props<T> {
  members: T[];
}

function StreamingChatUsers({
  members
}: Props<IUser>) {
  return (
    <div className={style['conversation-users']}>
      <div className="users">
        {members.length > 0
          && members.map((member) => (
            <div className="user" key={member._id}>
              <span className="username">{member.name}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default StreamingChatUsers;

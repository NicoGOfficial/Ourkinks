import { LikeOutlined, UserAddOutlined } from '@ant-design/icons';
import { getDiffDate, shortenLargeNumber } from '@lib/index';
import { Tooltip } from 'antd';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { TickIcon } from 'src/icons';
import { IPerformer } from 'src/interfaces';
import { SocketContext } from 'src/socket';

import style from './performer-card.module.less';

type IProps = {
  performer: IPerformer;
  linkToLiveStream?: boolean;
}

export function PerformerCard({
  performer,
  linkToLiveStream = false
}: IProps) {
  const { getSocket, socketStatus, connected } = useContext(SocketContext);
  const [online, setOnline] = useState(performer.isOnline);

  const handleOnlineOffline = (data) => {
    if (data.id !== performer._id) return;
    setOnline(data.online);
  };

  const handleSocket = () => {
    const socket = getSocket();
    socket?.on('online', handleOnlineOffline);
  };

  const handleOffSocket = () => {
    const socket = getSocket();
    socket?.off('online', handleOnlineOffline);
  };

  useEffect(() => {
    if (!connected()) return handleOffSocket();
    handleSocket();
    return handleOffSocket;
  }, [socketStatus]);

  const href = linkToLiveStream ? {
    pathname: '/stream/[username]',
    query: { username: performer?.username || performer?._id }
  } : {
    pathname: '/model/[username]',
    query: { username: performer?.username || performer?._id }
  };
  const as = linkToLiveStream ? `/stream/${performer?.username || performer?._id}` : `/model/${performer?.username || performer?._id}`;

  return (
    <Link
      href={href}
      as={as}
    >
      <a>
        <div className={style['model-card']} style={{ backgroundImage: `url(${performer?.avatar || '/no-avatar.png'})` }}>
          {performer.streamingStatus === 'public' && (<img src="/public-streaming.png" alt="" height={30} width={30} />)}
          {performer.streamingStatus === 'private' && (<img src="/private-streaming.png" alt="" height={30} width={30} />)}
          {performer.streamingStatus !== 'private' && performer.streamingStatus !== 'public' && online === 1 && (<span className="online-status active" />)}
          {performer.streamingStatus === 'offline' && online === 0 && (<span className="online-status" />)}
          <div className="card-stat">
            <span>
              {shortenLargeNumber(performer?.stats.subscribers || 0)}
              {' '}
              <UserAddOutlined />
                &nbsp;&nbsp;
              {shortenLargeNumber(performer?.stats.likes || 0)}
              {' '}
              <LikeOutlined />
            </span>
            {performer?.dateOfBirth && (
            <span>
              {getDiffDate(performer?.dateOfBirth)}
              +
            </span>
            )}
          </div>
          <Tooltip title={performer?.name || performer?.username}>
            <div className="model-name">
              {performer?.name || performer?.username || 'N/A'}
              {' '}
              {performer?.verifiedAccount && <TickIcon />}
            </div>
          </Tooltip>
        </div>
      </a>
    </Link>
  );
}

export default PerformerCard;

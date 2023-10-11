import {
  CommentOutlined,
  EyeFilled, HourglassFilled, LikeFilled, PlayCircleOutlined
} from '@ant-design/icons';
import Price from '@components/price';
import { videoDuration } from '@lib/index';
import { shortenLargeNumber } from '@lib/number';
import { message, Tooltip } from 'antd';
import Router from 'next/router';
import { connect } from 'react-redux';
import { IUser, IVideo } from 'src/interfaces';

import style from './video-card.module.less';

type IProps = {
  video: IVideo;
  user: IUser;
  showPrice?: boolean;
}

function VideoCard({
  video,
  user,
  showPrice = true
}: IProps) {
  const { thumbnail, video: file, teaser } = video;
  const url = (thumbnail?.thumbnails && thumbnail?.thumbnails[0]) || thumbnail?.url || (teaser?.thumbnails && teaser?.thumbnails[0]) || (file?.thumbnails && file?.thumbnails[0]) || '/placeholder-image.jpg';
  return (
    <div
      aria-hidden
      onClick={() => {
        if (!user?._id) {
          message.error('Please login or register to check out videos!');
          Router.push('/auth/login');
          return;
        }
        if (user?.isPerformer && user?._id !== video?.performerId) return;
        Router.push({ pathname: '/video', query: { id: video?.slug || video?._id } }, `/video/${video?.slug || video?._id}`);
      }}
      className={style['vid-card']}
      style={{ backgroundImage: `url(${url})`, cursor: (!user?._id || (user?.isPerformer && video?.performer?._id !== user?._id)) ? 'not-allowed' : 'pointer' }}
    >
      <div className="vid-price">
        {showPrice && video?.isSaleVideo && video?.price > 0 && (
          <span className="label-price">
            <Price amount={video.price} />
          </span>
        )}
        {video?.isSchedule && (
          <span className="label-price custom">
            Upcoming
          </span>
        )}
      </div>
      <span className="play-ico"><PlayCircleOutlined /></span>
      <div className="vid-stats">
        <div className="like">
          <span>
            <EyeFilled />
            {' '}
            {shortenLargeNumber(video?.stats?.views || 0)}
          </span>
          <span>
            <LikeFilled />
            {' '}
            {shortenLargeNumber(video?.stats?.likes || 0)}
          </span>
          <span>
            <CommentOutlined />
            {' '}
            {shortenLargeNumber(video?.stats?.comments || 0)}
          </span>
        </div>
        <div className="duration">
          <HourglassFilled />
          {' '}
          {videoDuration(video?.video?.duration || 0)}
        </div>
      </div>
      <Tooltip title={video?.title}>
        <div className="vid-info">
          {video?.title}
        </div>
      </Tooltip>
    </div>
  );
}

const mapProps = (state) => ({
  user: state.user.current
});

export default connect(mapProps)(VideoCard);

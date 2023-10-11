import {
  CameraOutlined, CommentOutlined,
  EyeOutlined, LikeOutlined, PictureOutlined
} from '@ant-design/icons';
import Price from '@components/price';
import { shortenLargeNumber } from '@lib/number';
import { message, Tooltip } from 'antd';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { connect } from 'react-redux';
import { IGallery, IUser } from 'src/interfaces';

import style from './gallery-card.module.less';

interface GalleryCardIProps {
  gallery: IGallery;
  user: IUser;
}

function GalleryCard({ gallery, user }: GalleryCardIProps) {
  const { t } = useTranslation();

  const thumbUrl = gallery?.coverPhoto?.thumbnails[0] || gallery?.coverPhoto?.url || '/placeholder-image.jpg';
  return (
    <div
      aria-hidden
      onClick={() => {
        if (!user?._id) {
          message.error(t('common:galleryLoginRequire'));
          Router.push('/auth/login');
          return;
        }
        if (user?.isPerformer && gallery?.performerId !== user?._id) return;
        if (user && !gallery?.isSubscribed) {
          message.error(t('common:gallerySubscribeRequire', { username: gallery?.performer?.name || gallery?.performer?.username || 'the model' }));
          return;
        }
        window.scrollTo(0, 0);
        Router.push({ pathname: '/gallery/[id]', query: { id: gallery?.slug || gallery?._id } }, `/gallery/${gallery?.slug || gallery?._id}`);
      }}
      className={style['photo-card']}
      style={{
        backgroundImage: `url(${thumbUrl})`,
        cursor: (!user?._id || (user?.isPerformer && gallery?.performerId !== user?._id) || !gallery?.isSubscribed) ? 'not-allowed' : 'pointer'
      }}
    >
      {gallery?.isSale && gallery?.price > 0 && (
        <span className="photo-price">
          <div className="label-price">
            <Price amount={gallery.price} />
          </div>
        </span>
      )}
      <span className="play-ico"><CameraOutlined /></span>
      <div className="photo-stats">
        <div className="like">
          <span>
            <EyeOutlined />
            {' '}
            {shortenLargeNumber(gallery?.stats?.views || 0)}
          </span>
          <span>
            <LikeOutlined />
            {' '}
            {shortenLargeNumber(gallery?.stats?.likes || 0)}
          </span>
          <span>
            <CommentOutlined />
            {' '}
            {shortenLargeNumber(gallery?.stats?.comments || 0)}
          </span>
        </div>
        <div className="duration">
          <PictureOutlined />
          {' '}
          {gallery?.numOfItems || 0}
        </div>
      </div>
      <Tooltip title={gallery?.name}>
        <div className="photo-info">
          {gallery?.name}
        </div>
      </Tooltip>
    </div>
  );
}

const mapProps = (state) => ({
  user: state.user.current
});

export default connect(mapProps)(GalleryCard);

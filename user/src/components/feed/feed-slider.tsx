import { VideoPlayer } from '@components/video/video-player';
import { IFeed } from '@interfaces/feed';
import {
  Carousel, Image,
  Spin
} from 'antd';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';

import style from './index.module.less';

interface IProps {
  feed: IFeed;
  i18n: any;
}

class FeedSlider extends PureComponent<IProps> {
  state = {
    openPreviewImage: false,
    previewIndex: 0
  };

  render() {
    const { t } = this.props.i18n;
    const { feed } = this.props;
    const { openPreviewImage, previewIndex } = this.state;
    const images = feed.files && feed.files.filter((f) => f.type === 'feed-photo');
    const videos = feed.files && feed.files.filter((f) => f.type === 'feed-video');
    let processing = false;
    videos && videos.forEach((f) => {
      if (f.status !== 'finished') {
        processing = true;
      }
    });

    return (
      <div className={style['feed-slider']}>
        {!processing && feed.files && feed.files.length && (
          <>
            {images && images.length > 0 && (
              <Carousel swipeToSlide arrows dots={false} effect="fade">
                {images.map((img, index) => (
                  <Image
                    key={img._id}
                    src={img.url}
                    preview={{ visible: false }}
                    fallback="/no-image.jpg"
                    width="100%"
                    alt="img"
                    onClick={() => this.setState({ openPreviewImage: true, previewIndex: index })}
                  />
                ))}
              </Carousel>
            )}
            <div style={{ display: 'none' }}>
              <Image.PreviewGroup preview={{ current: previewIndex, visible: openPreviewImage, onVisibleChange: (vis) => this.setState({ openPreviewImage: vis }) }}>
                {images.map((img) => (
                  <Image
                    key={img._id}
                    src={img.url}
                    preview={{ visible: false }}
                    fallback="/no-image.jpg"
                    width="100%"
                    alt="img"
                  />
                ))}
              </Image.PreviewGroup>
            </div>
            {videos && videos.length > 0 && videos.map((vid) => (
              <VideoPlayer
                key={vid._id}
                id={vid._id}
                {...{
                  autoplay: false,
                  controls: true,
                  playsinline: true,
                  sources: [
                    {
                      src: vid.url,
                      type: 'video/mp4'
                    }
                  ]
                }}
              />
            ))}
          </>
        )}
        {processing && (
          <div
            className="proccessing"
            style={{ backgroundImage: `url(${feed.files[0].preview || '/leaf.jpg'})` }}
          >
            <Spin />
            <p>{t('common:yourMediaIsCurrentlyProccessing')}</p>
          </div>
        )}
      </div>
    );
  }
}

export default withTranslation(FeedSlider);

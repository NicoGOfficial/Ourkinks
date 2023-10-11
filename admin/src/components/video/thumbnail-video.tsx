import { IVideo } from 'src/interfaces';

type IProps = {
  video?: IVideo;
  style?: Record<string, string>;
}

export function ThumbnailVideo({ video = {} as IVideo, style = undefined }: IProps) {
  const { thumbnail, video: media } = video;
  const url = (media?.thumbnails && media?.thumbnails[0]) || (thumbnail?.thumbnails && thumbnail?.thumbnails[0]) || '/video.png';
  return <img alt="" src={url} style={style || { width: 50 }} />;
}

export default ThumbnailVideo;

import { IBannerUpdate } from 'src/interfaces';

type IProps = {
  banner?: IBannerUpdate;
  style?: Record<string, string>;
}

export function ThumbnailBanner({ banner = {} as IBannerUpdate, style = undefined }: IProps) {
  const { photo } = banner;
  const urlThumb = photo ? photo.url : '/camera.png';
  return <img src={urlThumb} style={style || { width: 100 }} alt="thumb" />;
}

export default ThumbnailBanner;

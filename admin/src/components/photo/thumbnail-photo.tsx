import { Image } from 'antd';
import { IPhotoUpdate } from 'src/interfaces';

type IProps = {
  photo?: IPhotoUpdate;
  style?: Record<string, string>;
}

export function ThumbnailPhoto({ style = undefined, photo = undefined }: IProps) {
  const { photo: item } = photo;
  const urlThumb = (item?.thumbnails && item?.thumbnails[0]) || '/placeholder-img.jpg';
  return <Image preview={false} src={urlThumb} style={style || { width: 50 }} />;
}

export default ThumbnailPhoto;

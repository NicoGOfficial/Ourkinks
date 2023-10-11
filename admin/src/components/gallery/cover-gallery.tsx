import { Image } from 'antd';
import { IGallery } from 'src/interfaces';

type IProps = {
  gallery?: IGallery;
  style?: Record<string, string>;
}

export function CoverGallery({ gallery = {} as IGallery, style = undefined }: IProps) {
  const { coverPhoto } = gallery;
  const url = (coverPhoto?.thumbnails && coverPhoto.thumbnails[0]) || '/gallery.png';
  return <Image preview={false} placeholder src={url} style={style || { width: 50 }} />;
}

export default CoverGallery;

import { IProduct } from 'src/interfaces';

type IProps = {
  product?: IProduct;
  style?: Record<string, string>;
}

export function ImageProduct({ product = {} as IProduct, style = undefined }: IProps) {
  const { images } = product;
  const url = (images[0]?.thumbnails && images[0]?.thumbnails[0]) || images[0]?.url || '/product.png';
  return <img src={url} style={style || { width: 50 }} alt="url" />;
}
export default ImageProduct;

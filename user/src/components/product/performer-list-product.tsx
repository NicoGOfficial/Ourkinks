import { Col, Row } from 'antd';

import { IProduct } from '../../interfaces/product';
import ProductCard from './product-card';

type IProps = {
  products: IProduct[];
}

export function PerformerListProduct({
  products
}: IProps) {
  return (
    <Row>
      {products.map((product: IProduct) => (
        <Col xs={12} sm={12} md={6} lg={6} key={product._id}>
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  );
}

export default PerformerListProduct;

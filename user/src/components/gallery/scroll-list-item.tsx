import { IGallery } from '@interfaces/gallery';
import { Col, Row, Spin } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import InfiniteScroll from 'react-infinite-scroll-component';

import GalleryCard from './gallery-card';

type IProps = {
  items: IGallery[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
}

export function ScrollListGallery({
  items = [], loadMore, canLoadmore = false, loading = false
}: IProps) {
  const { t } = useTranslation();
  return (
    <InfiniteScroll
      dataLength={items.length}
      hasMore={canLoadmore}
      loader={null}
      next={loadMore}
      endMessage={null}
      scrollThreshold={0.9}
    >
      <Row>
        {items.length > 0
          && items.map((gallery: IGallery) => (
            <Col
              xs={12}
              sm={12}
              md={8}
              lg={6}
              xl={6}
              key={gallery._id}
            >
              <GalleryCard gallery={gallery} />
            </Col>
          ))}
      </Row>
      {!loading && !items.length && <div className="text-center">{t('common:noGallery')}</div>}
      {loading && <div className="text-center"><Spin /></div>}
    </InfiniteScroll>
  );
}

export default ScrollListGallery;

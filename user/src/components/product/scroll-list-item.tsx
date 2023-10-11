import { Spin } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import InfiniteScroll from 'react-infinite-scroll-component';

import { IProduct } from '../../interfaces';
import { PerformerListProduct } from './performer-list-product';

type IProps = {
  items: IProduct[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
}

export function ScrollListProduct({
  items = [],
  loadMore,
  canLoadmore = false,
  loading = false
}: IProps) {
  const { t } = useTranslation();
  return (
    <InfiniteScroll
      dataLength={items.length}
      hasMore={canLoadmore}
      loader={null}
      next={loadMore}
      endMessage={(
        <p style={{ textAlign: 'center' }}>
          {/* <b>Yay! No more video.</b> */}
        </p>
      )}
      scrollThreshold={0.9}
    >
      <PerformerListProduct products={items} />
      {!loading && !items.length && <div className="text-center">{t('common:noItem')}</div>}
      {loading && <div className="text-center"><Spin /></div>}
    </InfiniteScroll>
  );
}

export default ScrollListProduct;
